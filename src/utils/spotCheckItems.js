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

// ---------------- ELCB (paper form: Detail | Month | WHI | Electrician | Remarks) ----------------
export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
export const QUARTERS = ["Q1 (Jan-Mar)", "Q2 (Apr-Jun)", "Q3 (Jul-Sep)", "Q4 (Oct-Dec)"];

// Detail column ki 3 rows: Date / Month / Quarter
export const ELCB_ROWS = [
  { key: "dateRow", label: "Date", type: "date" },
  { key: "monthRow", label: "Month", type: "month" },
  { key: "quarterRow", label: "Quarter", type: "quarter" },
];

const emptyElcbRow = () => ({ value: "", month: "", whi: "", electrician: "", comment: "" });

export const emptyElcb = () => ({
  dateRow: emptyElcbRow(),
  monthRow: emptyElcbRow(),
  quarterRow: emptyElcbRow(),
});

// Saved record -> 3 rows. Purane records (elcb.weekly / elcb.quarterly) ko Date / Quarter row me dikhata hai.
export const normalizeElcb = (elcb, kind) => {
  const base = emptyElcb();
  if (!elcb) return base;
  const hasNew = ELCB_ROWS.some((r) => elcb[r.key]);
  if (hasNew) {
    ELCB_ROWS.forEach((r) => {
      base[r.key] = { ...emptyElcbRow(), ...(elcb[r.key] || {}) };
    });
    return base;
  }
  const legacy = kind === "quarterly" ? elcb.quarterly : elcb.weekly;
  if (legacy) {
    const row = { ...emptyElcbRow(), month: legacy.month || "", whi: legacy.whi || "", electrician: legacy.electrician || "", comment: legacy.comment || "" };
    base[kind === "quarterly" ? "quarterRow" : "dateRow"] = row;
  }
  return base;
};

// Detail cell ka text, e.g. "Date: 05-11-2026"
export const elcbDetailText = (row, value) => {
  if (!value) return `${row.label}:`;
  if (row.type === "date") {
    const [y, m, d] = String(value).split("-");
    return y && m && d ? `${row.label}: ${d}-${m}-${y}` : `${row.label}: ${value}`;
  }
  return `${row.label}: ${value}`;
};

export const elcbIsFilled = (r) => !!(r && (r.value || r.month || r.whi || r.electrician || r.comment));
