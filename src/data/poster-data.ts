export type DistrictStat = {
  label: string;
  population: number | null;
  target: number;
  registered: number;
  percent: number | null;
};

export type ActivityStat = {
  label: string;
  children: number | null;
  adults: number;
  total: number;
};

export type PosterData = {
  updatedAt: string;
  completionPercent: number;
  districts: DistrictStat[];
  otherProvince: DistrictStat;
  summary: DistrictStat;
  activities: ActivityStat[];
  activitySummary: ActivityStat;
};

export const districtReferences = [
  { label: "เมืองพิษณุโลก", population: 280955, target: 2710 },
  { label: "นครไทย", population: 82193, target: 318 },
  { label: "ชาติตระการ", population: 41451, target: 330 },
  { label: "บางระกำ", population: 91936, target: 442 },
  { label: "บางกระทุ่ม", population: 48630, target: 379 },
  { label: "พรหมพิราม", population: 83866, target: 473 },
  { label: "วัดโบสถ์", population: 39914, target: 322 },
  { label: "วังทอง", population: 117686, target: 599 },
  { label: "เนินมะปราง", population: 56522, target: 294 },
] as const;

export const activityReferences = [
  { label: "เดิน 5 กม.", distancePrefix: "เดิน" },
  { label: "วิ่ง 5 กม.", distancePrefix: "วิ่ง" },
  { label: "ปั่น 17 กม.", distancePrefix: "ปั่น" },
] as const;

// These totals are part of the approved poster artwork and are not columns in
// raw_data.xlsx. Registered and activity figures are derived from the workbook.
export const posterReferenceTotals = {
  population: 843153,
  target: 5869,
} as const;
