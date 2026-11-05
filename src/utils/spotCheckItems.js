// Safety Ramp / SRL-Harness checklist items (shared by Weekly + Quarterly pages)
export const SAFETY_RAMP_ITEMS = [
  "Railing & its grip",
  "Wooden plank & its rubber grip",
  "Wheels",
];

export const SRL_ITEMS = ["Machine Jerk", "Harness", "Rope / Wire", "Hook / Buckle"];

export const defaultRows = (names) =>
  names.map((name) => ({ name, isCustom: false, status: "", remarks: "" }));

// Purane records (jin me `name` save nahi tha) ke labels, taake wo sahi dikhein
export const LEGACY_LABELS = {
  weekly: {
    safetyRamp: [
      "Is rubber surface of safety ramp and handrail rubber grip properly glued. Also grip not hanging with handrail?",
      "Side stability holder and intact with ramp also check all the welded joint found no crack or damage",
      "All the nut bolt are properly tight and fitted. Iron strip beneath the safety ramp and handrail is properly fitted and welded with frame",
      "Closely inspected the wooden plank from beneath and found no major crack also rubber surface cleaned with brush & water",
      "Air pressure is good enough for easy movement. Also Tires, wheel axel and ball bearing are in working condition",
    ],
    srlHarness: [
      "Lifeline lock up when received sharp jerks, also harness in good shape & has no damage in harness webbing & belts as well pulled stitches and broken fiber.",
      "Is the snap hook operating freely, correctly, not bent, no crack, no damage sign. Buckles have no distortion, crack or break.",
      "Inspect the iron cable installed between pillars for cuts, corrosion, damage. Inspect device cable/rope for cuts, nicks, broken wires.",
    ],
  },
  quarterly: {
    safetyRamp: [
      "All the nut bolt are properly tight and fitted. Iron strip beneath the safety ramp and handrail is properly fitted and welded with frame",
      "Closely inspected the wooden plank from beneath and found no major crack also rubber surface cleaned with brush & water",
      "Air pressure is good enough for easy movement. Also Tires, wheel axel and ball bearing are in working condition",
    ],
    srlHarness: [
      "Lifeline lock up when received sharp jerks, also harness in good shape & has no damage in harness webbing & belts as well pulled stitches and broken fiber.",
      "Is the snap hook operating freely, correctly, not bent, no crack, no damage sign. Buckles have no distortion, crack or break.",
      "Inspect the iron cable installed between pillars for cuts, corrosion, damage. Inspect device cable/rope for cuts, nicks, broken wires.",
      "All bolts of iron frame/anchorage with pillar/roof properly fixed. Welded joints have no cracks.",
      "Plumb used to bind iron cable with U-turn buckle not loose, no damage, no cracks on SRL unit.",
    ],
  },
};

// Saved rows ko label ke sath normalize karta hai (edit form / views dono me use hota hai)
export const withLabels = (rows, kind, section) =>
  (rows || []).map((r, i) => ({
    ...r,
    name: r?.name || LEGACY_LABELS[kind][section][i] || `Item ${i + 1}`,
  }));
