import { cookies } from "next/headers";

const COOKIE_NAME = "sut_case";

// กติกาด่าน A (Puzzle AJPARIN -> อาจารย์ปริญญ์)
// คำตอบที่ถูก = "อาจารย์ปริญญ์"
function isValidEvidence(inputRaw: unknown): boolean {
  if (typeof inputRaw !== "string") return false;
  // ลบช่องว่างออกให้หมด เผื่อมี space แทรก
  const norm = inputRaw.trim().replace(/\s+/g, "");
  return norm === "อาจารย์ปริญญ์";
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  let v = cookieStore.get(COOKIE_NAME)?.value;
  
  // ถ้าไม่มี session ให้สร้างใหม่อัตโนมัติ
  if (!v) {
    const sid = crypto.randomUUID();
    const initial = {
      sid,
      progress: { A: false, B: false, C: false },
      unlockedEvidence: [] as string[],
      createdAt: new Date().toISOString(),
    };
    cookieStore.set(COOKIE_NAME, JSON.stringify(initial), {
      httpOnly: true,
      sameSite: false,
      path: "/",
      secure: false,
    });
    v = JSON.stringify(initial);
  }

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

  // ไม่ผ่าน: ส่ง hint
  if (!isValidEvidence(input)) {
    return Response.json({
      ok: false,
      caseId: "A",
      message: "คำตอบยังไม่ถูกต้อง... ลองสะกดให้ถูกต้อง",
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
    message: "ถูกต้อง! 'อาจารย์ปริญญ์' คือคำตอบสุดท้าย",
    flag: "FLAG{AJ_PARIN_IS_THE_KEY}",
  });
}
