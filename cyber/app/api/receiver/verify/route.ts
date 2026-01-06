import { cookies } from "next/headers";

const COOKIE_NAME = "sut_case";
const DEV_MODE = process.env.DEV_MODE === "true";

type Progress = { A: boolean; B: boolean; C: boolean };

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const v = cookieStore.get(COOKIE_NAME)?.value;
  if (!v) return Response.json({ ok: false, error: "NO_SESSION" }, { status: 401 });

  let session: any;
  try {
    session = JSON.parse(v);
  } catch {
    return Response.json({ ok: false, error: "BAD_SESSION" }, { status: 400 });
  }

  // ✅ เงื่อนไขผ่านจริง
  const campus = req.headers.get("x-campus");

  // DEV_MODE=true ให้ผ่านได้แม้ไม่มี header (เพื่อเดโม่เร็ว)
  if (!DEV_MODE && campus !== "SUT") {
    return Response.json(
      {
        ok: false,
        message: "ไม่ผ่าน: ระบบไม่ได้เชื่อคำพูดของคุณ",
        hint: "ลอง craft request ให้มี header ที่ระบบต้องการ",
      },
      { status: 403 }
    );
  }

  session.progress = (session.progress ?? { A: false, B: false, C: false }) as Progress;
  session.unlockedEvidence = Array.isArray(session.unlockedEvidence) ? session.unlockedEvidence : [];

  session.progress.B = true;
  if (!session.unlockedEvidence.includes("B_FLAG")) session.unlockedEvidence.push("B_FLAG");

  cookieStore.set(COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return Response.json({
    ok: true,
    unlocked: ["B_FLAG"],
    message: DEV_MODE
      ? "ผ่านแล้ว (DEV_MODE): ข้ามเงื่อนไข header เพื่อเดโม่"
      : "คุณผ่านการยืนยันตัวตน…ด้วยการไม่เชื่อ UI",
    flag: "FLAG{LOCATION_IS_NOT_IDENTITY}",
  });
}
