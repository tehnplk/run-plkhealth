import "server-only";

import { Readable } from "node:stream";
import { Workbook, type Row } from "exceljs";
import {
  participantColumns,
  type ParticipantRecord,
} from "@/lib/database";

export class WorkbookValidationError extends Error {}

function text(row: Row, column: number) {
  return row.getCell(column).text.trim();
}

export async function parseParticipantWorkbook(arrayBuffer: ArrayBuffer) {
  const workbook = new Workbook();

  try {
    await workbook.xlsx.read(Readable.from(Buffer.from(arrayBuffer)), {
      ignoreNodes: ["dataValidations", "conditionalFormatting", "hyperlinks"],
    });
  } catch {
    throw new WorkbookValidationError("The selected file is not a valid XLSX workbook.");
  }

  const worksheet = workbook.worksheets[0];

  if (!worksheet) {
    throw new WorkbookValidationError("The workbook does not contain a worksheet.");
  }

  const actualHeaders = Array.from(
    { length: worksheet.getRow(1).cellCount },
    (_, index) => text(worksheet.getRow(1), index + 1).toLowerCase(),
  );

  if (
    actualHeaders.length !== participantColumns.length ||
    participantColumns.some((header, index) => actualHeaders[index] !== header)
  ) {
    throw new WorkbookValidationError(
      `Invalid columns. Expected: ${participantColumns.join(", ")}`,
    );
  }

  const records: ParticipantRecord[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const values = participantColumns.map((_, index) => text(row, index + 1));
    if (values.every((value) => value === "")) return;

    const age = Number(values[4]);
    if (!Number.isInteger(age) || age < 0 || age > 130) {
      throw new WorkbookValidationError(`Row ${rowNumber} has an invalid age.`);
    }

    if (!values[5]) {
      throw new WorkbookValidationError(`Row ${rowNumber} has no distance.`);
    }

    if (!values[9]) {
      throw new WorkbookValidationError(`Row ${rowNumber} has no residence.`);
    }

    records.push({
      prefix: values[0],
      gender: values[1],
      nationality: values[2],
      birthdate: values[3],
      age,
      distance: values[5],
      race_distance: values[6],
      disease: values[7],
      injury_historys: values[8],
      residence: values[9],
      club: values[10],
    });
  });

  if (records.length === 0) {
    throw new WorkbookValidationError("The workbook contains no participant rows.");
  }

  return records;
}
