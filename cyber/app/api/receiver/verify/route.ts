import { cookies } from "next/headers";

const COOKIE_NAME = "sut_case";

type Progress = { A: boolean; B: boolean; C: boolean };
type SubProgress = { B1: boolean; B2: boolean };

// รหัสผ่านสุดท้ายที่ถูกต้อง: ajparinlovem4nch3st3runit3d
// ajparinlove (จากด่าน A) + m4nch3st3r (ด่าน B1) + unit3d (ด่าน B2)
function isValidPassword(inputRaw: unknown): boolean {
  if (typeof inputRaw !== "string") return false;
  const clean = inputRaw.trim().toLowerCase();
  return clean === "ajparinlovem4nch3st3runit3d";
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

  // ✅ ต้องผ่านด่าน A ก่อน
  const progress = (session.progress ?? { A: false, B: false, C: false }) as Progress;
  if (!progress.A) {
    return Response.json(
      {
        ok: false,
        message: "⚠️ ยังปลดล็อกไม่ได้: ต้องผ่านด่าน A ก่อน",
        hint: "ไปที่แฟ้ม A เพื่อหาหลักฐานก่อน",
      },
      { status: 403 }
    );
  }

  // ✅ ต้องผ่านด่านย่อย B1 และ B2 ก่อน
  const subProgress = (session.subProgress ?? { B1: false, B2: false }) as SubProgress;
  if (!subProgress.B1 || !subProgress.B2) {
    const missing = [];
    if (!subProgress.B1) missing.push("B1 (เมืองแห่งปีศาจแดง)");
    if (!subProgress.B2) missing.push("B2 (คำที่ทำให้เป็นหนึ่ง)");
    
    return Response.json({
      ok: false,
      message: "⚠️ ยังไม่ครบ! ต้องหาชิ้นส่วนให้ครบก่อน",
      missingParts: missing,
      hint: "ไปที่ /api/receiver/b1 และ /api/receiver/b2 เพื่อหาชิ้นส่วน",
      currentProgress: {
        B1: subProgress.B1 ? "✅ ผ่านแล้ว" : "❌ ยังไม่ผ่าน",
        B2: subProgress.B2 ? "✅ ผ่านแล้ว" : "❌ ยังไม่ผ่าน",
      }
    }, { status: 403 });
  }

  // ดึง input จาก body
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const { input } = body;

  if (!input) {
    return Response.json({
      ok: false,
      message: "กรุณาใส่รหัสผ่านสุดท้าย",
      hint: {
        instruction: "รวมชิ้นส่วนทั้งหมดที่ได้มา:",
        parts: [
          `ด่าน A: "ajparinlove" (ความรักของอาจารย์ปริญญ์)`,
          `ด่าน B1: "${session.b1Answer || 'man'}" → เติมคำ → manchester → m4nch3st3r`,
          `ด่าน B2: "${session.b2Answer || 'u'}" → เติมคำ → united → unit3d`,
        ],
        format: "รวมกัน: ajparinlove + m4nch3st3r + unit3d"
      }
    });
  }

  // ตรวจสอบรหัสผ่าน
  if (!isValidPassword(input)) {
    session.authAttempts = (session.authAttempts || 0) + 1;
    cookieStore.set(COOKIE_NAME, JSON.stringify(session), {
      httpOnly: true,
      sameSite: false,
      path: "/",
      secure: false,
    });

    return Response.json({
      ok: false,
      message: `❌ รหัสผ่านไม่ถูกต้อง`,
      hint: `เติมคำ: man→manchester, u→united แล้วแปลง leet: A→4, E→3 (ครั้งที่ ${session.authAttempts})`,
      yourInput: input,
    });
  }

  // ✅ ผ่าน!
  session.progress = (session.progress ?? { A: false, B: false, C: false }) as Progress;
  session.unlockedEvidence = Array.isArray(session.unlockedEvidence) ? session.unlockedEvidence : [];

  session.progress.B = true;
  if (!session.unlockedEvidence.includes("B_FLAG")) session.unlockedEvidence.push("B_FLAG");

  cookieStore.set(COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    sameSite: false,
    path: "/",
    secure: false,
  });

  return Response.json({
    ok: true,
    unlocked: ["B_FLAG"],
    message: "🎉 ยินดีด้วย! คุณไขรหัสผ่านได้สำเร็จ!",
    explanation: {
      password: "ajparinlovem4nch3st3runit3d",
      meaning: "AJ Parin loves Manchester United",
      breakdown: [
        "ajparinlove = อาจารย์ปริญญ์รัก",
        "m4nch3st3r = Manchester (แบบ leet speak: A→4, E→3)",
        "unit3d = United (แบบ leet speak: E→3)",
      ]
    },
    flag: "FLAG{SUT_AUTHENTICATION_MASTERED}",
    nextStep: "ไปต่อที่ด่าน C เพื่อหาหลักฐานชิ้นสุดท้าย!",
  });
}

// GET สำหรับดูสถานะและคำใบ้
export async function GET() {
  const cookieStore = await cookies();
  const v = cookieStore.get(COOKIE_NAME)?.value;

  if (!v) {
    return Response.json({
      ok: false,
      message: "ยังไม่มี session กรุณาเริ่มเกมก่อน",
    });
  }

  let session: any;
  try {
    session = JSON.parse(v);
  } catch {
    return Response.json({ ok: false, error: "BAD_SESSION" });
  }

  const subProgress = session.subProgress ?? { B1: false, B2: false };

  return Response.json({
    caseId: "B",
    title: "🔐 ด่าน B: รหัสผ่านลับ",
    description: "รวมชิ้นส่วนจากด่านย่อยเพื่อสร้างรหัสผ่าน",
    progress: {
      B1: subProgress.B1 ? "✅ ผ่านแล้ว" : "❌ ยังไม่ผ่าน",
      B2: subProgress.B2 ? "✅ ผ่านแล้ว" : "❌ ยังไม่ผ่าน",
    },
    collectedParts: {
      fromA: "ajparinlove",
      fromB1: subProgress.B1 ? (session.b1Answer || "man") : "???",
      fromB2: subProgress.B2 ? (session.b2Answer || "u") : "???",
    },
    subStages: [
      { id: "B1", endpoint: "/api/receiver/b1", title: "เมืองแห่งปีศาจแดง" },
      { id: "B2", endpoint: "/api/receiver/b2", title: "คำที่ทำให้เป็นหนึ่ง" },
    ],
    hint: subProgress.B1 && subProgress.B2 
      ? "🎉 ได้ชิ้นส่วนครบแล้ว! POST /api/receiver/verify พร้อม input รหัสผ่านที่รวมกัน"
      : "ไปหาชิ้นส่วนจากด่านย่อยให้ครบก่อน",
  });
}
