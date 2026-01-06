import { cookies } from "next/headers";

const COOKIE_NAME = "sut_case";

export async function GET() {
  const cookieStore = await cookies(); // ✅ ต้อง await
  const v = cookieStore.get(COOKIE_NAME)?.value;

  if (!v) {
    return Response.json({ ok: false, error: "NO_SESSION" }, { status: 401 });
  }

  try {
    const data = JSON.parse(v);
    return Response.json({ ok: true, ...data });
  } catch {
    return Response.json({ ok: false, error: "BAD_SESSION" }, { status: 400 });
  }
}
