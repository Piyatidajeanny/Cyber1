import { cookies } from "next/headers";

const COOKIE_NAME = "sut_case";
const DEV_MODE = process.env.DEV_MODE === "true";

type Progress = { A: boolean; B: boolean; C: boolean };
type AuthMethod = "PASSWORD" | "PIN" | "OTP" | "BIOMETRIC" | "LOCATION" | "MFA";

// คำตอบที่ถูกต้องสำหรับแต่ละวิธี
function checkAnswer(method: AuthMethod, input: string): boolean {
  const answers: Record<AuthMethod, (inp: string) => boolean> = {
    PASSWORD: (inp) => {
      const clean = inp.trim().toLowerCase();
      return clean === "parinlovemanu" || clean === "ปริญญ์รักแมนยู";
    },
    PIN: (inp) => inp.trim() === "08933", // 8 ตึก, 9 สำนัก, 33=พ.ศ.2533
    OTP: (inp) => {
      // OTP = HHDDMM (ชั่วโมง+วัน+เดือน ปัจจุบัน)
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const validOtp = hh + dd + mm;
      return inp.trim() === validOtp;
    },
    BIOMETRIC: (inp) => inp.trim().toLowerCase() === "ย่าโม" || inp.trim().toLowerCase() === "ท้าวสุรนารี",
    LOCATION: (inp) => {
      const clean = inp.trim();
      return clean === "14.88,102.02" || clean === "14.88,102.01";
    },
    MFA: (inp) => {
      try {
        const data = JSON.parse(inp);
        return (
          data.year === "1990" &&
          (data.buildings === "9" || data.buildings === "09") &&
          data.province?.toLowerCase() === "nakhonratchasima"
        );
      } catch {
        return false;
      }
    },
  };

  return answers[method]?.(input) ?? false;
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
    return Response.json({
      ok: false,
      error: "NO_AUTH_METHOD",
      message: "กด 'ฉันคือผู้รับ' ก่อนเพื่อรับโจทย์",
    });
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
      hint: `ลองตรวจสอบข้อมูลเกี่ยวกับ มทส. อีกครั้ง (ความพยายามครั้งที่ ${session.authAttempts})`,
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
    flag: "FLAG{SUT_AUTHENTICATION_MASTERED}",
    method,
  });
}
