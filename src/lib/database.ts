import "server-only";

import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

export const participantColumns = [
  "prefix",
  "gender",
  "nationality",
  "birthdate",
  "age",
  "distance",
  "race_distance",
  "disease",
  "injury_historys",
  "residence",
  "club",
] as const;

export type ParticipantRecord = {
  prefix: string;
  gender: string;
  nationality: string;
  birthdate: string;
  age: number;
  distance: string;
  race_distance: string;
  disease: string;
  injury_historys: string;
  residence: string;
  club: string;
};

export type UploadLogEntry = {
  id: number;
  filename: string;
  rowCount: number;
  uploadedAt: string;
};

const dataDirectory = path.join(process.cwd(), "data");
const databasePath = path.join(dataDirectory, "poster.sqlite");
const targetBaseSeeds = [
  ["เมืองพิษณุโลก", 1200],
  ["นครไทย", 500],
  ["ชาติตระการ", 400],
  ["บางระกำ", 500],
  ["บางกระทุ่ม", 500],
  ["พรหมพิราม", 500],
  ["วัดโบสถ์", 400],
  ["วังทอง", 500],
  ["เนินมะปราง", 400],
] as const;

export function openDatabase() {
  mkdirSync(dataDirectory, { recursive: true });

  const database = new DatabaseSync(databasePath);
  database.exec("PRAGMA journal_mode = WAL");
  database.exec("PRAGMA busy_timeout = 5000");
  database.exec(`
    CREATE TABLE IF NOT EXISTS participants (
      id INTEGER PRIMARY KEY,
      prefix TEXT NOT NULL,
      gender TEXT NOT NULL,
      nationality TEXT NOT NULL,
      birthdate TEXT NOT NULL,
      age INTEGER NOT NULL,
      distance TEXT NOT NULL,
      race_distance TEXT NOT NULL,
      disease TEXT NOT NULL,
      injury_historys TEXT NOT NULL,
      residence TEXT NOT NULL,
      club TEXT NOT NULL
    ) STRICT;

    CREATE INDEX IF NOT EXISTS idx_participants_residence
      ON participants (residence);
    CREATE INDEX IF NOT EXISTS idx_participants_distance_age
      ON participants (distance, age);

    CREATE TABLE IF NOT EXISTS target_base (
      amp TEXT PRIMARY KEY,
      target INTEGER NOT NULL CHECK (target >= 0)
    ) STRICT;

    CREATE TABLE IF NOT EXISTS import_metadata (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      filename TEXT NOT NULL,
      row_count INTEGER NOT NULL,
      imported_at TEXT NOT NULL
    ) STRICT;

    CREATE TABLE IF NOT EXISTS upload_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      row_count INTEGER NOT NULL CHECK (row_count >= 0),
      uploaded_at TEXT NOT NULL
    ) STRICT;

    CREATE INDEX IF NOT EXISTS idx_upload_log_uploaded_at
      ON upload_log (uploaded_at DESC);

    CREATE TABLE IF NOT EXISTS visitor_log (
      visitor_id TEXT PRIMARY KEY,
      first_seen_at TEXT NOT NULL
    ) STRICT;

    CREATE INDEX IF NOT EXISTS idx_visitor_log_first_seen_at
      ON visitor_log (first_seen_at DESC);

    INSERT INTO upload_log (filename, row_count, uploaded_at)
    SELECT filename, row_count, imported_at
    FROM import_metadata
    WHERE NOT EXISTS (SELECT 1 FROM upload_log);
  `);

  const insertTarget = database.prepare(
    "INSERT OR IGNORE INTO target_base (amp, target) VALUES (?, ?)",
  );
  for (const [amp, target] of targetBaseSeeds) {
    insertTarget.run(amp, target);
  }
  database.prepare("DELETE FROM target_base WHERE amp = ?").run("ส่วนราชการ");

  return database;
}

export function replaceParticipants(
  records: ParticipantRecord[],
  filename: string,
) {
  const database = openDatabase();
  const importedAt = new Date().toISOString();

  try {
    const insert = database.prepare(`
      INSERT INTO participants (
        prefix, gender, nationality, birthdate, age, distance,
        race_distance, disease, injury_historys, residence, club
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const updateMetadata = database.prepare(`
      INSERT INTO import_metadata (id, filename, row_count, imported_at)
      VALUES (1, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        filename = excluded.filename,
        row_count = excluded.row_count,
        imported_at = excluded.imported_at
    `);
    const insertUploadLog = database.prepare(`
      INSERT INTO upload_log (filename, row_count, uploaded_at)
      VALUES (?, ?, ?)
    `);

    database.exec("BEGIN IMMEDIATE");

    try {
      database.exec("DELETE FROM participants");

      for (const record of records) {
        insert.run(
          record.prefix,
          record.gender,
          record.nationality,
          record.birthdate,
          record.age,
          record.distance,
          record.race_distance,
          record.disease,
          record.injury_historys,
          record.residence,
          record.club,
        );
      }

      updateMetadata.run(filename, records.length, importedAt);
      insertUploadLog.run(filename, records.length, importedAt);
      database.exec("COMMIT");
    } catch (error) {
      database.exec("ROLLBACK");
      throw error;
    }
  } finally {
    database.close();
  }

  return { rowCount: records.length, importedAt };
}

export function getImportStatus() {
  const database = openDatabase();

  try {
    return database
      .prepare(
        "SELECT filename, row_count AS rowCount, imported_at AS importedAt FROM import_metadata WHERE id = 1",
      )
      .get() as
      | { filename: string; rowCount: number; importedAt: string }
      | undefined;
  } finally {
    database.close();
  }
}

export function getUploadHistory() {
  const database = openDatabase();

  try {
    return database
      .prepare(`
        SELECT
          id,
          filename,
          row_count AS rowCount,
          uploaded_at AS uploadedAt
        FROM upload_log
        ORDER BY uploaded_at DESC, id DESC
      `)
      .all() as unknown as UploadLogEntry[];
  } finally {
    database.close();
  }
}

export function registerVisitor(visitorId: string) {
  const database = openDatabase();

  try {
    database
      .prepare(
        "INSERT OR IGNORE INTO visitor_log (visitor_id, first_seen_at) VALUES (?, ?)",
      )
      .run(visitorId, new Date().toISOString());
    const result = database
      .prepare("SELECT COUNT(*) AS count FROM visitor_log")
      .get() as { count: number };

    return Number(result.count);
  } finally {
    database.close();
  }
}
