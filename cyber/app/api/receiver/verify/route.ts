import { cookies } from "next/headers";

const COOKIE_NAME = "sut_case";
const DEV_MODE = process.env.DEV_MODE === "true";

type Progress = { A: boolean; B: boolean; C: boolean };
type AuthMethod = "ACM" | "PERMISSION" | "RBAC" | "RULE" | "MLS" | "ABAC";

// คำตอบที่ถูกต้องสำหรับแต่ละวิธี (พิจารณาเป็น puzzle แบบง่ายเพื่อการเรียนรู้)
function checkAnswer(method: AuthMethod, input: string): boolean {
  const v = (input || "").trim();
  switch (method) {
    case "ACM": {
      // คาดรูปแบบ user:resource:permission
      return v.toLowerCase() === "alice:archive:read";
    }
    case "PERMISSION": {
      // คาด token/permission string
      return v.toUpperCase() === "PERMIT_ARCHIVE" || v.toUpperCase() === "INTERNAL_ARCHIVE";
    }
    case "RBAC": {
      // ต้องระบุบทบาทที่ถูกต้อง
      return ["archivist", "admin", "staff"].includes(v.toLowerCase());
    }
    case "RULE": {
      // กรณีพิเศษตามกฎ
      return v === "UNLOCK_C" || v === "OPEN_C" || v === "ปลดล็อก_C";
    }
    case "MLS": {
      // ระดับความลับ
      return ["CONFIDENTIAL", "SECRET", "TOPSECRET"].includes(v.toUpperCase());
    }
    case "ABAC": {
      // คาดเป็น JSON ของ attribute
      try {
        const data = JSON.parse(v);
        return (
          String(data.dept || "").toLowerCase() === "internal" &&
          String(data.role || "").toLowerCase() === "archivist"
        );
      } catch {
        return false;
      }
    }
    default:
      return false;
  }
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

  // ✅ ต้องผ่านด่าน A ก่อน
  const progress = (session.progress ?? { A: false, B: false, C: false }) as Progress;
  if (!DEV_MODE && !progress.A) {
    return Response.json(
      {
        ok: false,
        message: "ยังปลดล็อกไม่ได้: ต้องผ่านด่าน A ก่อน",
        hint: "ลองไปแฟ้ม A ก่อนที่จะมาที่นี่",
      },
      { status: 403 }
    );
  }

  // ดึง input จาก body
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const { input } = body;
  const method = session.authMethod as AuthMethod;

  if (!method) {
    return Response.json({ ok: false, error: "NO_AUTH_METHOD", message: "กด 'ฉันคือผู้รับ' ก่อนเพื่อรับโจทย์" });
  }

  // ตรวจสอบคำตอบ
  if (!checkAnswer(method, input || "")) {
    session.authAttempts = (session.authAttempts || 0) + 1;
    cookieStore.set(COOKIE_NAME, JSON.stringify(session), {
      httpOnly: true,
      sameSite: false,
      path: "/",
      secure: false,
    });

    return Response.json({
      ok: false,
      message: `ไม่ผ่าน: คำตอบไม่ถูกต้องสำหรับ ${method}`,
      hint: `ลองใช้รูปแบบคำตอบตามคำใบ้ (ความพยายามครั้งที่ ${session.authAttempts})`,
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
    message: `✅ ผ่าน ${method} Authentication แล้ว! คุณเข้าใจวิธีการยืนยันตัวตนแบบนี้`,
    flag: "FLAG{SUT_AUTHORIZATION_MASTERED}",
    method,
  });
}
