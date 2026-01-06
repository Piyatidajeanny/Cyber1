import { cookies } from "next/headers";

const COOKIE_NAME = "sut_case";

// กติกาด่าน A (ตั้งใจให้ “เดายาก” นิดนึง แต่ยังเป็นมิตร)
// คำตอบที่ถูก = "1990-SUT"  (ค.ศ. + คำย่อมหาลัย)
function isValidEvidence(inputRaw: unknown): boolean {
  if (typeof inputRaw !== "string") return false;
  const input = inputRaw.trim();
  return input === "1990-SUT";
}

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

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const { caseId, input } = body ?? {};
  if (caseId !== "A") {
    return Response.json({ ok: false, error: "INVALID_CASE" }, { status: 400 });
  }

  // ไม่ผ่าน: ส่ง hint แบบปั่น ๆ
  if (!isValidEvidence(input)) {
    return Response.json({
      ok: false,
      caseId: "A",
      message: "คุณกำลังเชื่อปฏิทินผิดเล่ม (ลองคิดเรื่อง พ.ศ./ค.ศ.)",
      hint: "คำตอบมักชอบอยู่ในรูปแบบ YEAR-TAG",
    });
  }

  // ผ่าน: อัปเดต progress + evidence
  session.progress = session.progress ?? { A: false, B: false, C: false };
  session.unlockedEvidence = Array.isArray(session.unlockedEvidence) ? session.unlockedEvidence : [];

  session.progress.A = true;
  if (!session.unlockedEvidence.includes("A_FLAG")) session.unlockedEvidence.push("A_FLAG");

  cookieStore.set(COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    sameSite: false,
    path: "/",
    secure: false,
  });

  return Response.json({
    ok: true,
    caseId: "A",
    unlocked: ["A_FLAG"],
    message: "ลายเซ็นถูกต้อง…คุณเริ่มมองเห็น ‘ช่องโหว่ของความเชื่อ’ แล้ว",
    flag: "FLAG{YEARS_ARE_RELATIVE}",
  });
}
