import "server-only";

import { openDatabase } from "@/lib/database";

export type ClubRow = {
  label: string;
  registered: number;
};

export function loadClubData(): ClubRow[] {
  const database = openDatabase();

  try {
    const rows = database
      .prepare(`
        SELECT
          TRIM(club) AS label,
          COUNT(*) AS registered
        FROM participants
        WHERE TRIM(club) <> ''
        GROUP BY TRIM(club)
        ORDER BY registered DESC, label COLLATE NOCASE ASC
      `)
      .all() as { label: string; registered: number }[];

    return rows.map((row) => ({
      label: row.label,
      registered: Number(row.registered),
    }));
  } finally {
    database.close();
  }
}
