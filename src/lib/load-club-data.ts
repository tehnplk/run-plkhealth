import "server-only";

import { compareActivities } from "@/lib/activity-distance";
import { openDatabase } from "@/lib/database";

export type ClubRow = {
  district: string;
  label: string;
  activityCounts: Record<string, number>;
  registered: number;
};

export type ClubDistrictGroup = {
  district: string;
  rows: ClubRow[];
  activityCounts: Record<string, number>;
  registered: number;
};

export type ClubData = {
  activities: string[];
  groups: ClubDistrictGroup[];
};

type QueryRow = {
  residence: string;
  club: string;
  distance: string;
  registered: number;
};

const districtOrder = [
  "เมืองพิษณุโลก",
  "เนินมะปราง",
  "วังทอง",
  "วัดโบสถ์",
  "ชาติตระการ",
  "พรหมพิราม",
  "บางระกำ",
  "บางกระทุ่ม",
  "นครไทย",
];

export function loadClubData(): ClubData {
  const database = openDatabase();

  try {
    const result = database
      .prepare(`
        WITH normalized_participants AS (
          SELECT
            CASE
              WHEN TRIM(club) IN ('', '-', 'ไม่มี') THEN 'ไม่มีชมรม'
              ELSE TRIM(club)
            END AS club,
            TRIM(residence) AS residence,
            TRIM(distance) AS distance
          FROM participants
        )
        SELECT
          residence,
          club,
          distance,
          COUNT(*) AS registered
        FROM normalized_participants
        WHERE distance <> ''
        GROUP BY residence, club, distance
      `)
      .all() as QueryRow[];
    const activities = [...new Set(result.map((row) => row.distance))].sort(
      compareActivities,
    );
    const countsByDistrict = new Map<string, Map<string, Map<string, number>>>();

    for (const row of result) {
      const clubs = countsByDistrict.get(row.residence) ?? new Map<string, Map<string, number>>();
      const counts = clubs.get(row.club) ?? new Map<string, number>();
      counts.set(row.distance, Number(row.registered));
      clubs.set(row.club, counts);
      countsByDistrict.set(row.residence, clubs);
    }

    const groups = [...countsByDistrict.entries()]
      .map(([district, clubs]) => {
        const rows = [...clubs.entries()]
          .map(([label, counts]) => {
            const activityCounts = Object.fromEntries(
              activities.map((activity) => [activity, counts.get(activity) ?? 0]),
            );

            return {
              district,
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
        const activityCounts = Object.fromEntries(
          activities.map((activity) => [
            activity,
            rows.reduce((sum, row) => sum + (row.activityCounts[activity] ?? 0), 0),
          ]),
        );

        return {
          district,
          rows,
          activityCounts,
          registered: rows.reduce((sum, row) => sum + row.registered, 0),
        };
      })
      .sort(
        (first, second) =>
          (districtOrder.indexOf(first.district) === -1
            ? Number.MAX_SAFE_INTEGER
            : districtOrder.indexOf(first.district)) -
            (districtOrder.indexOf(second.district) === -1
              ? Number.MAX_SAFE_INTEGER
              : districtOrder.indexOf(second.district)) ||
          first.district.localeCompare(second.district, "th-TH"),
      );

    return { activities, groups };
  } finally {
    database.close();
  }
}
