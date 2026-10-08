"""Export STLs + preview renders for the crutch bottle holder.

Mirrors crutch_bottle_holder.scad using manifold3d so the parts can be
built without OpenSCAD installed:  pip install manifold3d trimesh matplotlib
"""
import math
import sys
from pathlib import Path

import numpy as np
import trimesh
from manifold3d import Manifold

OUT = Path(__file__).parent

# ---- parameters (keep in sync with the .scad) ----
tube_d, tube_clear = 22.2, 0.4
bottle_d, bottle_clear = 75, 2
cup_h, cup_wall, cup_floor = 100, 2.5, 3
drain_d, slot_w, slot_depth = 15, 22, 55
cord_hole_d, cord_hole_z = 4, 12
clamp_wall, split_gap, ear_t = 4, 1.5, 8
bolt_d, bolt_inset = 4.4, 12
nut_af, nut_h, nut_x, bolt_hole_end = 7.4, 3.6, 6, 14
FN = 96

bore_r = (tube_d + tube_clear) / 2
collar_r = bore_r + clamp_wall
cup_ri = (bottle_d + bottle_clear) / 2
cup_ro = cup_ri + cup_wall
cup_x = bore_r + clamp_wall + cup_ri
bolt_y = bore_r + 2 + bolt_d / 2 + 0.2
ear_w = bolt_y + 5
g = split_gap / 2
bolt_zs = [bolt_inset, cup_h - bolt_inset]


def cyl(r, h, fn=FN, center=False):
    return Manifold.cylinder(h, r, r, fn, center)


def cube(x, y, z):
    return Manifold.cube([x, y, z])


def bore():
    return cyl(bore_r, cup_h + 2).translate([0, 0, -1])


def bolt_holes(x0, x1):
    hs = [cyl(bolt_d / 2, x1 - x0, 32).rotate([0, 90, 0]).translate([x0, sy * bolt_y, z])
          for sy in (-1, 1) for z in bolt_zs]
    return sum(hs[1:], hs[0])


def nut_slots():
    out = []
    for sy in (-1, 1):
        for z in bolt_zs:
            hexes = [cyl(nut_af / math.cos(math.radians(30)) / 2, nut_h, 6)
                     .rotate([0, 0, 30]).rotate([0, 90, 0]).translate([nut_x, y, z])
                     for y in (sy * bolt_y, sy * (ear_w + 1))]
            out.append(Manifold.batch_hull(hexes))
    return sum(out[1:], out[0])


def holder():
    body = cyl(cup_ro, cup_h).translate([cup_x, 0, 0])
    rear = (cyl(collar_r, cup_h) + cube(cup_x, 2 * ear_w, cup_h).translate([0, -ear_w, 0])) ^ \
        cube(cup_x + 1, 2 * ear_w + 2, cup_h + 2).translate([g, -ear_w - 1, -1])
    body = body + rear
    cuts = [
        cyl(cup_ri, cup_h).translate([cup_x, 0, cup_floor]),
        cyl(drain_d / 2, cup_floor + 2).translate([cup_x, 0, -1]),
        cyl(cord_hole_d / 2, 2 * cup_ro + 2, 32, True).rotate([90, 0, 0])
        .translate([cup_x, 0, cup_h - cord_hole_z]),
        bore(), bolt_holes(g - 1, bolt_hole_end), nut_slots(),
    ]
    if slot_w > 0:
        cuts.append(cube(cup_wall + 2, slot_w, slot_depth + 1)
                    .translate([cup_x + cup_ri - 1, -slot_w / 2, cup_h - slot_depth]))
    for c in cuts:
        body = body - c
    return body


def clamp_cap():
    body = (cyl(collar_r, cup_h) + cube(ear_t, 2 * ear_w, cup_h).translate([-(g + ear_t), -ear_w, 0])) ^ \
        cube(collar_r + 1 - g, 2 * ear_w + 2, cup_h + 2).translate([-collar_r - 1, -ear_w - 1, -1])
    return body - bore() - bolt_holes(-(g + ear_t) - 1, 0)


def to_trimesh(m):
    mesh = m.to_mesh()
    return trimesh.Trimesh(np.asarray(mesh.vert_properties)[:, :3], np.asarray(mesh.tri_verts))


def render(meshes, path, views):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from mpl_toolkits.mplot3d.art3d import Poly3DCollection

    fig = plt.figure(figsize=(6 * len(views), 6), dpi=110)
    light = np.array([0.4, -0.5, 0.75]); light /= np.linalg.norm(light)
    for i, (elev, azim, title) in enumerate(views):
        ax = fig.add_subplot(1, len(views), i + 1, projection="3d")
        for mesh, rgb in meshes:
            shade = 0.35 + 0.65 * np.clip(mesh.face_normals @ light, 0, 1)
            cols = np.clip(np.outer(shade, rgb), 0, 1)
            ax.add_collection3d(Poly3DCollection(mesh.triangles, facecolors=cols, linewidths=0))
        allv = np.vstack([m.vertices for m, _ in meshes])
        c, s = allv.mean(0), (allv.max(0) - allv.min(0)).max() * 0.38
        ax.set_xlim(c[0] - s, c[0] + s); ax.set_ylim(c[1] - s, c[1] + s); ax.set_zlim(c[2] - s, c[2] + s)
        ax.set_box_aspect([1, 1, 1]); ax.view_init(elev, azim); ax.set_axis_off(); ax.set_title(title)
    fig.subplots_adjust(0, 0, 1, 0.94, 0, 0); fig.savefig(path); plt.close(fig)


def main():
    h, cap = holder(), clamp_cap()
    assert h.status().name == "NoError" and cap.status().name == "NoError"
    assert (h ^ cap).is_empty(), "parts overlap"
    tube = Manifold.cylinder(150, tube_d / 2, tube_d / 2, 64).translate([0, 0, -25])
    assert (h ^ tube).is_empty() and (cap ^ tube).is_empty(), "tube collides"

    hm, cm = to_trimesh(h), to_trimesh(cap)
    # cap print orientation: split face down
    cap_print = cap.translate([g, 0, 0]).rotate([0, 90, 0])
    hm.export(OUT / "holder.stl")
    to_trimesh(cap_print).export(OUT / "clamp_cap.stl")
    for name, m in (("holder", hm), ("clamp_cap", cm)):
        print(f"{name}: watertight={m.is_watertight} volume={m.volume / 1000:.1f} cm^3 "
              f"bbox={np.round(m.extents, 1)} mm")

    if "--no-render" not in sys.argv:
        tm = to_trimesh(tube)
        render([(hm, (0.30, 0.55, 0.85)), (cm, (0.95, 0.60, 0.20)), (tm, (0.6, 0.6, 0.6))],
               OUT / "preview.png",
               [(20, -140, "Assembled on crutch"), (25, 35, "Rear / clamp side"), (90, -90, "Top view")])


if __name__ == "__main__":
    main()
