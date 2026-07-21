import { revalidatePath } from "next/cache";
import { parseParticipantWorkbook, WorkbookValidationError } from "@/lib/import-workbook";
import { replaceParticipants } from "@/lib/database";

export const runtime = "nodejs";

const maxFileSize = 20 * 1024 * 1024;
const uploadAccessCode = "112233";
const xlsxMimeType =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const upload = formData.get("file");
    const accessCode = formData.get("accessCode");

    if (accessCode !== uploadAccessCode) {
      return Response.json({ error: "Invalid upload access code." }, { status: 403 });
    }

    if (!(upload instanceof File)) {
      return Response.json({ error: "Select an XLSX file." }, { status: 400 });
    }

    if (!upload.name.toLowerCase().endsWith(".xlsx")) {
      return Response.json({ error: "Only .xlsx files are accepted." }, { status: 415 });
    }

    if (upload.type && upload.type !== xlsxMimeType && upload.type !== "application/octet-stream") {
      return Response.json({ error: "Only Excel XLSX files are accepted." }, { status: 415 });
    }

    if (upload.size === 0 || upload.size > maxFileSize) {
      return Response.json(
        { error: "The XLSX file must be between 1 byte and 20 MB." },
        { status: 413 },
      );
    }

    const records = await parseParticipantWorkbook(await upload.arrayBuffer());
    const result = replaceParticipants(records, upload.name);

    revalidatePath("/");
    revalidatePath("/upload");

    return Response.json({
      success: true,
      filename: upload.name,
      ...result,
    });
  } catch (error) {
    if (error instanceof WorkbookValidationError) {
      return Response.json({ error: error.message }, { status: 422 });
    }

    console.error("Excel upload failed", error);
    return Response.json(
      { error: "The upload could not be saved. Existing data was not changed." },
      { status: 500 },
    );
  }
}
