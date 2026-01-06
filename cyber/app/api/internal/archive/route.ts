import { cookies } from "next/headers";

const COOKIE_NAME = "sut_case";
const DEV_MODE = process.env.DEV_MODE === "true";

type Progress = { A: boolean; B: boolean; C: boolean };

export async function GET(req: Request) {
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
  const institute = req.headers.get("x-institute");

  if (!DEV_MODE && institute !== "INTERNAL-ARCHIVE") {
    const res = Response.json(
      {
        ok: false,
        error: "FORBIDDEN",
        message: "คุณไม่อยู่ในสังกัดที่อนุมัติ",
        hint: "ลองดูว่า policy เชื่อข้อมูลจากไหน (Network)",
      },
      { status: 403 }
    );
    res.headers.set("X-Policy-Hint", "ลองใส่ header: X-Institute");
    res.headers.set("X-Policy-Need", "X-Institute: INTERNAL-ARCHIVE");
    return res;
  }

  session.progress = (session.progress ?? { A: false, B: false, C: false }) as Progress;
  session.unlockedEvidence = Array.isArray(session.unlockedEvidence) ? session.unlockedEvidence : [];

  session.progress.C = true;
  if (!session.unlockedEvidence.includes("C_FLAG")) session.unlockedEvidence.push("C_FLAG");

  cookieStore.set(COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return Response.json({
    ok: true,
    message: DEV_MODE
      ? "ผ่านแล้ว (DEV_MODE): ข้ามเงื่อนไข header เพื่อเดโม่"
      : "ยินดีต้อนรับสู่แฟ้มภายใน…คุณเข้าใจ Authorization แล้ว",
    unlocked: ["C_FLAG"],
    flag: "FLAG{STRUCTURE_IS_NOT_AUTHORIZATION}",
    data: {
      archiveId: "ARCH-09",
      note: "อำนาจไม่ได้มาจากโครงสร้าง แต่มาจากการตรวจสอบ",
    },
  });
}
