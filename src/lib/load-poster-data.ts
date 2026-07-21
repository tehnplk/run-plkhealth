import "server-only";

import { openDatabase } from "@/lib/database";
import {
  activityReferences,
  districtReferences,
  posterReferenceTotals,
  type ActivityStat,
  type PosterData,
} from "@/data/poster-data";

type DistrictCount = { residence: string; registered: number };
type ActivityCount = {
  activity: string;
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
          CASE
            WHEN distance LIKE 'เดิน%' THEN 'เดิน'
            WHEN distance LIKE 'วิ่ง%' THEN 'วิ่ง'
            WHEN distance LIKE 'ปั่น%' THEN 'ปั่น'
          END AS activity,
          SUM(CASE WHEN age BETWEEN 7 AND 18 THEN 1 ELSE 0 END) AS children,
          SUM(CASE WHEN age BETWEEN 7 AND 18 THEN 0 ELSE 1 END) AS adults,
          COUNT(*) AS total
        FROM participants
        WHERE distance LIKE 'เดิน%' OR distance LIKE 'วิ่ง%' OR distance LIKE 'ปั่น%'
        GROUP BY activity
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

    const activityCounts = new Map(
      activityRows.map((row) => [row.activity, row]),
    );
    const activities: ActivityStat[] = activityReferences.map((reference) => {
      const counts = activityCounts.get(reference.distancePrefix);

      return {
        label: reference.label,
        children: Number(counts?.children ?? 0),
        adults: Number(counts?.adults ?? 0),
        total: Number(counts?.total ?? 0),
      };
    });
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
