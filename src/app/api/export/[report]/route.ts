import { Workbook } from "exceljs";
import { loadAgeGroupData } from "@/lib/load-age-data";
import { loadClubData } from "@/lib/load-club-data";
import { loadDistrictData } from "@/lib/load-district-data";

export const runtime = "nodejs";

const xlsxMimeType =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

type Report = "age" | "amp" | "club";

function styleSheet(workbook: Workbook, sheetName: string, headers: string[]) {
  const worksheet = workbook.addWorksheet(sheetName);
  const header = worksheet.addRow(headers);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF244C6F" } };
  header.alignment = { vertical: "middle", horizontal: "center" };
  worksheet.views = [{ state: "frozen", ySplit: 1 }];
  worksheet.columns = headers.map((headerText, index) => ({
    width: index === 0 ? 18 : index === headers.length - 1 ? 20 : 16,
    style: { alignment: { vertical: "middle" } },
  }));
  return worksheet;
}

function addTotalRow(
  worksheet: ReturnType<Workbook["addWorksheet"]>,
  values: Array<string | number>,
) {
  const row = worksheet.addRow(values);
  row.font = { bold: true, color: { argb: "FF20384F" } };
  row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF4F8FB" } };
}

async function exportAge() {
  const { activities, rows } = loadAgeGroupData();
  const workbook = new Workbook();
  const worksheet = styleSheet(workbook, "ข้อมูลตามกลุ่มอายุ", [
    "กลุ่มอายุ",
    ...activities,
    "รวมยอดผู้สมัคร",
  ]);

  for (const row of rows) {
    worksheet.addRow([row.label, ...activities.map((activity) => row.activityCounts[activity] ?? 0), row.total]);
  }

  addTotalRow(worksheet, [
    "รวม",
    ...activities.map((activity) => rows.reduce((sum, row) => sum + (row.activityCounts[activity] ?? 0), 0)),
    rows.reduce((sum, row) => sum + row.total, 0),
  ]);
  return { workbook, filename: "ข้อมูลตามกลุ่มอายุ.xlsx" };
}

async function exportDistrict() {
  const { activities, rows } = loadDistrictData();
  const workbook = new Workbook();
  const worksheet = styleSheet(workbook, "ยอดสมัครรายอำเภอ", [
    "ลำดับ",
    "อำเภอ",
    ...activities,
    "รวมยอดผู้สมัคร",
  ]);

  for (const [index, row] of rows.entries()) {
    worksheet.addRow([index + 1, row.label, ...activities.map((activity) => row.activityCounts[activity] ?? 0), row.registered]);
  }

  addTotalRow(worksheet, [
    "",
    "รวม",
    ...activities.map((activity) => rows.reduce((sum, row) => sum + (row.activityCounts[activity] ?? 0), 0)),
    rows.reduce((sum, row) => sum + row.registered, 0),
  ]);
  return { workbook, filename: "ยอดสมัครรายอำเภอ.xlsx" };
}

async function exportClub() {
  const { activities, groups } = loadClubData();
  const workbook = new Workbook();
  const worksheet = styleSheet(workbook, "ข้อมูลแยกรายชมรม", [
    "ลำดับ",
    "อำเภอ",
    "ชมรม",
    ...activities,
    "รวมยอดผู้สมัคร",
  ]);
  for (const group of groups) {
    for (const [index, row] of group.rows.entries()) {
      worksheet.addRow([index + 1, row.district, row.label, ...activities.map((activity) => row.activityCounts[activity] ?? 0), row.registered]);
    }
    addTotalRow(worksheet, [
      "",
      `${group.district} รวม`,
      "",
      ...activities.map((activity) => group.activityCounts[activity] ?? 0),
      group.registered,
    ]);
    worksheet.addRow([]);
  }

  addTotalRow(worksheet, [
    "",
    "รวม",
    "",
    ...activities.map((activity) => groups.reduce((sum, group) => sum + (group.activityCounts[activity] ?? 0), 0)),
    groups.reduce((sum, group) => sum + group.registered, 0),
  ]);
  return { workbook, filename: "ข้อมูลแยกรายชมรม.xlsx" };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ report: string }> },
) {
  const { report } = await params;
  const exporters: Record<Report, () => Promise<{ workbook: Workbook; filename: string }>> = {
    age: exportAge,
    amp: exportDistrict,
    club: exportClub,
  };
  const exporter = exporters[report as Report];

  if (!exporter) return new Response("Not found", { status: 404 });

  const { workbook, filename } = await exporter();
  const bytes = new Uint8Array(await workbook.xlsx.writeBuffer());

  return new Response(bytes, {
    headers: {
      "Content-Type": xlsxMimeType,
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "no-store",
    },
  });
}
