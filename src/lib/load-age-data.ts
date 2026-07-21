import "server-only";

import { compareActivities } from "@/lib/activity-distance";
import { openDatabase } from "@/lib/database";

export type AgeGroupRow = {
  label: string;
  activityCounts: Record<string, number>;
  total: number;
};

export type AgeGroupData = {
  activities: string[];
  rows: AgeGroupRow[];
};

type QueryRow = {
  ageGroup: string;
  distance: string;
  registered: number;
};

const ageGroupOrder = [
  "ต่ำกว่า 18 ปี",
  "19-29 ปี",
  "30-39 ปี",
  "40-49 ปี",
  "50-59 ปี",
  "60 ปีขึ้นไป",
];
export function loadAgeGroupData(): AgeGroupData {
  const database = openDatabase();

  try {
    const result = database
      .prepare(`
        SELECT
          CASE
            WHEN age <= 18 THEN 'ต่ำกว่า 18 ปี'
            WHEN age BETWEEN 19 AND 29 THEN '19-29 ปี'
            WHEN age BETWEEN 30 AND 39 THEN '30-39 ปี'
            WHEN age BETWEEN 40 AND 49 THEN '40-49 ปี'
            WHEN age BETWEEN 50 AND 59 THEN '50-59 ปี'
            ELSE '60 ปีขึ้นไป'
          END AS ageGroup,
          TRIM(distance) AS distance,
          COUNT(*) AS registered
        FROM participants
        WHERE TRIM(distance) <> ''
        GROUP BY ageGroup, TRIM(distance)
      `)
      .all() as QueryRow[];

    const activities = [...new Set(result.map((row) => row.distance))].sort(
      compareActivities,
    );
    const countsByGroup = new Map<string, Map<string, number>>();

    for (const row of result) {
      const activityCounts = countsByGroup.get(row.ageGroup) ?? new Map<string, number>();
      activityCounts.set(row.distance, Number(row.registered));
      countsByGroup.set(row.ageGroup, activityCounts);
    }

    const rows = ageGroupOrder.map((label) => {
      const counts = countsByGroup.get(label) ?? new Map<string, number>();
      const activityCounts = Object.fromEntries(
        activities.map((activity) => [activity, counts.get(activity) ?? 0]),
      );

      return {
        label,
        activityCounts,
        total: Object.values(activityCounts).reduce((sum, count) => sum + count, 0),
      };
    });

    return { activities, rows };
  } finally {
    database.close();
  }
}
