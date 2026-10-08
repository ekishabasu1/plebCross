// Crutch Water Bottle Holder — parametric OpenSCAD model
// ------------------------------------------------------
// Two printed parts bolt around a crutch tube:
//   1. holder    – bottle cup + rear clamp half (with captive-nut slots)
//   2. clamp_cap – front clamp half
// Hardware: 4x M4x20 socket-head bolts + 4x M4 hex nuts.
//
// Coordinate system: crutch tube axis = Z axis, cup centre on +X.
// The two clamp halves split on the YZ plane with a small gap so the
// bolts squeeze the tube when tightened.
//
// Set `part` to "holder", "clamp_cap" or "assembly" and export STL.

/* [Which part] */
part = "assembly"; // [assembly, holder, clamp_cap]

/* [Crutch] */
tube_d        = 22.2;  // crutch tube outer diameter (7/8" is common on forearm crutches)
tube_clear    = 0.4;   // bore = tube_d + tube_clear (wrap a rubber strip if loose)

/* [Bottle] */
bottle_d      = 75;    // bottle outer diameter (most 500–750 ml bottles: 65–80)
bottle_clear  = 2;     // diametral clearance
cup_h         = 100;   // cup height (also the clamp height)
cup_wall      = 2.5;
cup_floor     = 3;
drain_d       = 15;    // drain hole in the floor
slot_w        = 22;    // front viewing / flex slot width (0 = none)
slot_depth    = 55;    // how far the slot runs down from the top
cord_hole_d   = 4;     // holes near the top for an elastic retaining cord
cord_hole_z   = 12;    // distance of cord holes below the rim

/* [Clamp] */
clamp_wall    = 4;     // material around the tube
split_gap     = 1.5;   // gap between the two halves (clamping travel)
ear_t         = 8;     // thickness of the cap ears (along X)
bolt_d        = 4.4;   // M4 clearance
bolt_inset    = 12;    // bolt distance from top / bottom of clamp
nut_af        = 7.4;   // M4 nut across-flats + clearance
nut_h         = 3.6;   // nut slot thickness
nut_x         = 6;     // where the nut slot starts (from split plane)
bolt_hole_end = 14;    // how deep the bolt hole runs into the holder

$fn = 96;

// ---------- derived ----------
bore_r   = (tube_d + tube_clear) / 2;
collar_r = bore_r + clamp_wall;
cup_ri   = (bottle_d + bottle_clear) / 2;
cup_ro   = cup_ri + cup_wall;
cup_x    = bore_r + clamp_wall + cup_ri;     // cup axis offset from tube axis
bolt_y   = bore_r + 2 + bolt_d / 2 + 0.2;     // bolt centre offset (keeps 2 mm wall to bore)
ear_w    = bolt_y + 5;                        // half-width of the clamp ears
g        = split_gap / 2;
bolt_zs  = [bolt_inset, cup_h - bolt_inset];
eps      = 0.01;

module bore() {
    translate([0, 0, -1]) cylinder(r = bore_r, h = cup_h + 2);
}

module bolt_holes(x0, x1) {
    for (sy = [-1, 1], z = bolt_zs)
        translate([x0, sy * bolt_y, z]) rotate([0, 90, 0])
            cylinder(d = bolt_d, h = x1 - x0, $fn = 32);
}

// hex pocket that slides in from the outer ±Y face
module nut_slots() {
    for (sy = [-1, 1], z = bolt_zs)
        hull() for (y = [sy * bolt_y, sy * (ear_w + 1)])
            translate([nut_x, y, z]) rotate([0, 90, 0]) rotate([0, 0, 30])
                cylinder(d = nut_af / cos(30), h = nut_h, $fn = 6);
}

module holder() {
    difference() {
        union() {
            // bottle cup
            translate([cup_x, 0, 0]) cylinder(r = cup_ro, h = cup_h);
            // rear clamp half: half collar + bridge block to the cup
            intersection() {
                union() {
                    cylinder(r = collar_r, h = cup_h);
                    translate([0, -ear_w, 0]) cube([cup_x, 2 * ear_w, cup_h]);
                }
                translate([g, -ear_w - 1, -1]) cube([cup_x + 1, 2 * ear_w + 2, cup_h + 2]);
            }
        }
        // cup interior
        translate([cup_x, 0, cup_floor]) cylinder(r = cup_ri, h = cup_h);
        // drain hole
        translate([cup_x, 0, -1]) cylinder(d = drain_d, h = cup_floor + 2);
        // front viewing / flex slot (faces away from the crutch)
        if (slot_w > 0)
            translate([cup_x + cup_ri - 1, -slot_w / 2, cup_h - slot_depth])
                cube([cup_wall + 2, slot_w, slot_depth + 1]);
        // elastic cord holes (left / right sides of the cup)
        translate([cup_x, 0, cup_h - cord_hole_z]) rotate([90, 0, 0])
            cylinder(d = cord_hole_d, h = 2 * cup_ro + 2, center = true, $fn = 32);
        bore();
        bolt_holes(g - 1, bolt_hole_end);
        nut_slots();
    }
}

module clamp_cap() {
    difference() {
        intersection() {
            union() {
                cylinder(r = collar_r, h = cup_h);
                translate([-(g + ear_t), -ear_w, 0]) cube([ear_t, 2 * ear_w, cup_h]);
            }
            translate([-collar_r - 1, -ear_w - 1, -1]) cube([collar_r + 1 - g, 2 * ear_w + 2, cup_h + 2]);
        }
        bore();
        bolt_holes(-(g + ear_t) - 1, 0);
    }
}

if (part == "holder") {
    holder();
} else if (part == "clamp_cap") {
    // print flat on its split face
    rotate([0, 90, 0]) translate([g, 0, 0]) clamp_cap();
} else {
    holder();
    color("orange") clamp_cap();
    %bore(); // ghost crutch tube
}
