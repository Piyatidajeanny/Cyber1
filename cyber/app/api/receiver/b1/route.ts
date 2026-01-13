import { cookies } from "next/headers";

const COOKIE_NAME = "sut_case";

// ด่าน B1 - Entity Authentication: PIN-based (T9 Keypad)
// โจทย์: ถอดรหัส PIN โดยใช้ปุ่มโทรศัพท์รุ่นเก่า (T9)

/*
  สถานการณ์: พบ PIN ที่ซ่อนคำไว้
  PIN: 626
  
  T9 Keypad:
  2=ABC, 3=DEF, 4=GHI, 5=JKL, 6=MNO, 7=PQRS, 8=TUV, 9=WXYZ
  
  ถอดรหัส: 6→M, 2→A, 6→N = MAN
  คำตอบ: man
*/

function isValidAnswer(inputRaw: unknown): boolean {
  if (typeof inputRaw !== "string") return false;
  const clean = inputRaw.trim().toLowerCase();
  return clean === "man";
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
      subProgress: { B1: false, B2: false },
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

  // ต้องผ่านด่าน A ก่อน
  if (!session.progress?.A) {
    return Response.json({
      ok: false,
      message: "⚠️ ต้องผ่านด่าน A ก่อนถึงจะเข้าด่าน B ได้",
      hint: "กลับไปที่แฟ้ม A เพื่อหาหลักฐานก่อน",
    }, { status: 403 });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const { input } = body ?? {};

  if (!isValidAnswer(input)) {
    return Response.json({
      ok: false,
      caseId: "B1",
      message: "❌ ถอดรหัสไม่ถูกต้อง",
      hint: "ลองดูปุ่มโทรศัพท์รุ่นเก่า แต่ละปุ่มมีตัวอักษรอะไรบ้าง?",
      puzzle: {
        title: "🔢 PIN Authentication"
      }
    });
  }

  // ผ่าน! อัปเดต session
  session.subProgress = session.subProgress ?? { B1: false, B2: false };
  session.subProgress.B1 = true;
  session.b1Answer = "man"; // เก็บคำตอบ

  cookieStore.set(COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    sameSite: false,
    path: "/",
    secure: false,
  });

  return Response.json({
    ok: true,
    caseId: "B1",
    message: "✅ ถอดรหัส PIN สำเร็จ!",
    decoded: "man",
    hint: "🔑 บันทึกชิ้นส่วนนี้ไว้ใช้สร้าง Master Password!",
    nextStep: "ไปต่อที่ด่าน B2!",
  });
}

// GET สำหรับดูโจทย์
export async function GET() {
  return Response.json({
    caseId: "B1",
    title: "🔢 ด่าน B1: PIN Authentication",
    description: "ถอดรหัส PIN โดยใช้ T9 Keypad",
    puzzle: {
      pin: "626",
      keypad: "T9 (2=ABC, 3=DEF, 4=GHI, 5=JKL, 6=MNO, 7=PQRS, 8=TUV, 9=WXYZ)",
      clues: [
        "📱 แต่ละตัวเลขแทนตัวอักษรตัวแรกของปุ่มนั้น",
        "🔤 6=M/N/O, 2=A/B/C",
      ],
      format: "กรอกคำที่ถอดรหัสได้"
    }
  });
}
