import "server-only";

import { compareActivities } from "@/lib/activity-distance";
import { openDatabase } from "@/lib/database";

export type ClubRow = {
  label: string;
  activityCounts: Record<string, number>;
  registered: number;
};

export type ClubData = {
  activities: string[];
  rows: ClubRow[];
};

type QueryRow = {
  club: string;
  distance: string;
  registered: number;
};

export function loadClubData(): ClubData {
  const database = openDatabase();

  try {
    const result = database
      .prepare(`
        SELECT
          TRIM(club) AS club,
          TRIM(distance) AS distance,
          COUNT(*) AS registered
        FROM participants
        WHERE TRIM(club) <> '' AND TRIM(distance) <> ''
        GROUP BY TRIM(club), TRIM(distance)
      `)
      .all() as QueryRow[];
    const activities = [...new Set(result.map((row) => row.distance))].sort(
      compareActivities,
    );
    const countsByClub = new Map<string, Map<string, number>>();

    for (const row of result) {
      const counts = countsByClub.get(row.club) ?? new Map<string, number>();
      counts.set(row.distance, Number(row.registered));
      countsByClub.set(row.club, counts);
    }

    const rows = [...countsByClub.entries()]
      .map(([label, counts]) => {
        const activityCounts = Object.fromEntries(
          activities.map((activity) => [activity, counts.get(activity) ?? 0]),
        );

        return {
          label,
          activityCounts,
          registered: Object.values(activityCounts).reduce(
            (sum, count) => sum + count,
            0,
          ),
        };
      })
      .sort(
        (first, second) =>
          second.registered - first.registered ||
          first.label.localeCompare(second.label, "th-TH"),
      );

    return { activities, rows };
  } finally {
    database.close();
  }
}
