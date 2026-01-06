import { cookies } from "next/headers";

const COOKIE_NAME = "sut_case";
type Progress = { A: boolean; B: boolean; C: boolean };

export async function POST() {
  const sid = crypto.randomUUID();

  const initial = {
    sid,
    progress: { A: false, B: false, C: false } as Progress,
    unlockedEvidence: [] as string[],
    createdAt: new Date().toISOString(),
  };

  const cookieStore = await cookies(); // ✅ ต้อง await
  cookieStore.set(COOKIE_NAME, JSON.stringify(initial), {
    httpOnly: true,
    sameSite: false,
    path: "/",
    secure: false,
  });

  return Response.json({ ok: true, ...initial });
}
