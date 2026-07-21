import "server-only";

import { openDatabase } from "@/lib/database";
import {
  districtReferences,
  posterReferenceTotals,
  type ActivityStat,
  type PosterData,
} from "@/data/poster-data";

type DistrictCount = { residence: string; registered: number };
type ActivityCount = {
  label: string;
  children: number;
  adults: number;
  total: number;
};

function percent(registered: number, target: number) {
  return target === 0 ? null : (registered / target) * 100;
}

export async function loadPosterData(): Promise<PosterData> {
  const database = openDatabase();

  try {
    const districtRows = database
      .prepare(
        "SELECT residence, COUNT(*) AS registered FROM participants GROUP BY residence",
      )
      .all() as DistrictCount[];
    const activityRows = database
      .prepare(`
        SELECT
          TRIM(distance) AS label,
          SUM(CASE WHEN age BETWEEN 7 AND 18 THEN 1 ELSE 0 END) AS children,
          SUM(CASE WHEN age BETWEEN 7 AND 18 THEN 0 ELSE 1 END) AS adults,
          COUNT(*) AS total
        FROM participants
        WHERE TRIM(distance) <> ''
        GROUP BY TRIM(distance)
        ORDER BY
          CASE
            WHEN TRIM(distance) LIKE 'เดิน%' THEN 1
            WHEN TRIM(distance) LIKE 'วิ่ง%' THEN 2
            WHEN TRIM(distance) LIKE 'ปั่น%' THEN 3
            ELSE 4
          END,
          TRIM(distance) COLLATE NOCASE ASC
      `)
      .all() as ActivityCount[];
    const totalRow = database
      .prepare("SELECT COUNT(*) AS total FROM participants")
      .get() as { total: number };
    const metadata = database
      .prepare("SELECT imported_at AS importedAt FROM import_metadata WHERE id = 1")
      .get() as { importedAt: string } | undefined;

    const districtCounts = new Map(
      districtRows.map((row) => [row.residence, Number(row.registered)]),
    );
    const registeredTotal = Number(totalRow.total);
    const knownDistrictTotal = districtReferences.reduce(
      (sum, district) => sum + (districtCounts.get(district.label) ?? 0),
      0,
    );

    const districts = districtReferences.map((district) => {
      const registered = districtCounts.get(district.label) ?? 0;

      return {
        ...district,
        registered,
        percent: percent(registered, district.target),
      };
    });

    const activities: ActivityStat[] = activityRows.map((row) => ({
      label: row.label,
      children: Number(row.children),
      adults: Number(row.adults),
      total: Number(row.total),
    }));
    const activitySummary = activities.reduce<ActivityStat>(
      (summary, activity) => ({
        ...summary,
        children: (summary.children ?? 0) + (activity.children ?? 0),
        adults: summary.adults + activity.adults,
        total: summary.total + activity.total,
      }),
      { label: "รวม", children: 0, adults: 0, total: 0 },
    );

    return {
      updatedAt: metadata?.importedAt ?? "",
      completionPercent:
        (registeredTotal / posterReferenceTotals.target) * 100,
      districts,
      otherProvince: {
        label: "สมัครมาจากจว.อื่น",
        population: null,
        target: 0,
        registered: Math.max(0, registeredTotal - knownDistrictTotal),
        percent: null,
      },
      summary: {
        label: "รวม",
        population: posterReferenceTotals.population,
        target: posterReferenceTotals.target,
        registered: registeredTotal,
        percent: percent(registeredTotal, posterReferenceTotals.target),
      },
      activities,
      activitySummary,
    };
  } finally {
    database.close();
  }
}
