import { cookies } from "next/headers";

const COOKIE_NAME = "sut_case";

// ด่าน B2 - Entity Authentication: Location-based
// โจทย์: หารูปแบบจากพิกัดบนแผนที่

/*
  สถานการณ์: พิกัด 3 จุดที่เชื่อมกันเป็นรูปตัวอักษร
  
  พิกัด:
  (1,3) → (1,1) → (3,1) → (3,3)
  
  เมื่อวาดเส้นจะได้รูปตัว U
  คำตอบ: u
*/

function isValidAnswer(inputRaw: unknown): boolean {
  if (typeof inputRaw !== "string") return false;
  const clean = inputRaw.trim().toLowerCase();
  return clean === "u";
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
      caseId: "B2",
      message: "❌ คำตอบไม่ถูกต้อง",
      hint: "ลองวาดเส้นเชื่อมพิกัดตามลำดับดูสิ",
      puzzle: {
        title: "📍 Location-based Authentication"
      }
    });
  }

  // ผ่าน! อัปเดต session
  session.subProgress = session.subProgress ?? { B1: false, B2: false };
  session.subProgress.B2 = true;
  session.b2Answer = "u"; // เก็บคำตอบ

  cookieStore.set(COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    sameSite: false,
    path: "/",
    secure: false,
  });

  // เช็คว่าผ่านทั้ง B1 และ B2 หรือยัง
  const passedBoth = session.subProgress.B1 && session.subProgress.B2;

  if (passedBoth) {
    return Response.json({
      ok: true,
      caseId: "B2",
      message: "✅ ยืนยันตำแหน่งสำเร็จ!",
      decoded: "u",
      allPartsCollected: true,
      hint: "🎉 คุณได้ชิ้นส่วน Password ครบแล้ว!",
      finalHint: {
        instruction: "🔐 สร้าง Master Password จากชิ้นส่วนทั้งหมด:",
        parts: [
          "จากด่าน A: 'ajparinlove' (ชื่อผู้ใช้ + love)",
          "จากด่าน B1: 'man' → เติมคำ → 'manchester' → leet → 'm4nch3st3r'",
          "จากด่าน B2: 'u' → เติมคำ → 'united' → leet → 'unit3d'",
        ],
        format: "รวมกัน: ajparinlove + m4nch3st3r + unit3d"
      }
    });
  }

  return Response.json({
    ok: true,
    caseId: "B2",
    message: "✅ ยืนยันตำแหน่งสำเร็จ!",
    decoded: "u",
    hint: "🔑 บันทึกชิ้นส่วนนี้ไว้ใช้สร้าง Master Password!",
    nextStep: "ยังต้องผ่านด่าน B1 ก่อน!",
  });
}

// GET สำหรับดูโจทย์
export async function GET() {
  return Response.json({
    caseId: "B2",
    title: "� ด่าน B2: Location-based Authentication",
    description: "หารูปแบบจากพิกัดบนแผนที่",
    puzzle: {
      coordinates: ["(1,3)", "(1,1)", "(3,1)", "(3,3)"],
      instruction: "ลากเส้นเชื่อมพิกัดตามลำดับ",
      clues: [
        "📍 เชื่อมจุดตามลำดับ 1→2→3→4",
        "🔤 รูปที่ได้คือตัวอักษรภาษาอังกฤษ",
      ],
      format: "กรอกตัวอักษรที่เห็น"
    }
  });
}
