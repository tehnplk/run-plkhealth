import "server-only";

import { compareActivities } from "@/lib/activity-distance";
import { openDatabase } from "@/lib/database";

export type DistrictBreakdownRow = {
  label: string;
  activityCounts: Record<string, number>;
  registered: number;
  target: number;
  percentage: number;
};

export type DistrictBreakdownData = {
  activities: string[];
  rows: DistrictBreakdownRow[];
};

type QueryRow = {
  residence: string;
  distance: string;
  registered: number;
};

type TargetRow = {
  amp: string;
  target: number;
};

const districtOrder = [
  "เมืองพิษณุโลก",
  "นครไทย",
  "ชาติตระการ",
  "บางระกำ",
  "บางกระทุ่ม",
  "พรหมพิราม",
  "วัดโบสถ์",
  "วังทอง",
  "เนินมะปราง",
];

export function loadDistrictData(): DistrictBreakdownData {
  const database = openDatabase();

  try {
    const result = database
      .prepare(`
        SELECT
          TRIM(residence) AS residence,
          TRIM(distance) AS distance,
          COUNT(*) AS registered
        FROM participants
        WHERE TRIM(distance) <> ''
        GROUP BY TRIM(residence), TRIM(distance)
      `)
      .all() as QueryRow[];
    const targetRows = database
      .prepare("SELECT amp, target FROM target_base")
      .all() as TargetRow[];
    const activities = [...new Set(result.map((row) => row.distance))].sort(
      compareActivities,
    );
    const countsByDistrict = new Map<string, Map<string, number>>();
    const targetsByDistrict = new Map(
      targetRows.map((row) => [row.amp, Number(row.target)]),
    );

    for (const row of result) {
      const counts = countsByDistrict.get(row.residence) ?? new Map<string, number>();
      counts.set(row.distance, Number(row.registered));
      countsByDistrict.set(row.residence, counts);
    }

    const rows = districtOrder.map((label) => {
      const counts = countsByDistrict.get(label) ?? new Map<string, number>();
      const activityCounts = Object.fromEntries(
        activities.map((activity) => [activity, counts.get(activity) ?? 0]),
      );
      const registered = Object.values(activityCounts).reduce(
        (sum, count) => sum + count,
        0,
      );
      const target = targetsByDistrict.get(label) ?? 0;

      return {
        label,
        activityCounts,
        registered,
        target,
        percentage: target === 0 ? 0 : (registered / target) * 100,
      };
    });

    return { activities, rows };
  } finally {
    database.close();
  }
}
