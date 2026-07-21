import "server-only";

import { openDatabase } from "@/lib/database";

export type AgeGroupRow = {
  label: string;
  cycling: number;
  running: number;
  walking: number;
  total: number;
};

type QueryRow = {
  ageGroup: string;
  cycling: number;
  running: number;
  walking: number;
  total: number;
};

const ageGroupOrder = ["<18", "19-29", "30-39", "40-49", "50-59", "60+"];

export function loadAgeGroupData(): AgeGroupRow[] {
  const database = openDatabase();

  try {
    const result = database
      .prepare(`
        SELECT
          CASE
            WHEN age <= 18 THEN '<18'
            WHEN age BETWEEN 19 AND 29 THEN '19-29'
            WHEN age BETWEEN 30 AND 39 THEN '30-39'
            WHEN age BETWEEN 40 AND 49 THEN '40-49'
            WHEN age BETWEEN 50 AND 59 THEN '50-59'
            ELSE '60+'
          END AS ageGroup,
          SUM(CASE WHEN distance LIKE 'ปั่น%' THEN 1 ELSE 0 END) AS cycling,
          SUM(CASE WHEN distance LIKE 'วิ่ง%' THEN 1 ELSE 0 END) AS running,
          SUM(CASE WHEN distance LIKE 'เดิน%' THEN 1 ELSE 0 END) AS walking,
          COUNT(*) AS total
        FROM participants
        GROUP BY ageGroup
      `)
      .all() as QueryRow[];
    const byGroup = new Map(result.map((row) => [row.ageGroup, row]));

    return ageGroupOrder.map((label) => {
      const row = byGroup.get(label);

      return {
        label,
        cycling: Number(row?.cycling ?? 0),
        running: Number(row?.running ?? 0),
        walking: Number(row?.walking ?? 0),
        total: Number(row?.total ?? 0),
      };
    });
  } finally {
    database.close();
  }
}
