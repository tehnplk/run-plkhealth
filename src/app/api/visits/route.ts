import { randomUUID } from "node:crypto";
import { registerVisitor } from "@/lib/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const visitorCookie = "run_visitor_id";
const oneYearInSeconds = 60 * 60 * 24 * 365;

function readCookie(request: Request, name: string) {
  const cookie = request.headers.get("cookie") ?? "";
  const entry = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  return entry?.slice(name.length + 1);
}

export function GET(request: Request) {
  const existingVisitorId = readCookie(request, visitorCookie);
  const visitorId = existingVisitorId || randomUUID();
  const count = registerVisitor(visitorId);
  const response = Response.json(
    { count },
    { headers: { "Cache-Control": "no-store" } },
  );

  if (!existingVisitorId) {
    const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
    response.headers.append(
      "Set-Cookie",
      `${visitorCookie}=${visitorId}; Path=/; Max-Age=${oneYearInSeconds}; HttpOnly; SameSite=Lax${secure}`,
    );
  }

  return response;
}
