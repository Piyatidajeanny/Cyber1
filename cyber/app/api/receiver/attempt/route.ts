import { cookies } from "next/headers";

/* =========================================================
 * Types & Constants
 * ======================================================= */

const COOKIE_NAME = "sut_case";

type AuthMethod =
  | "PASSWORD"
  // | "PIN"
  // | "OTP"
  // | "BIOMETRIC"
  // | "LOCATION"
  // | "MFA";

const AUTH_METHODS: AuthMethod[] = [
  "PASSWORD",
  // "PIN",
  // "OTP",
  // "BIOMETRIC",
  // "LOCATION",
  // "MFA",
];

/* =========================================================
 * Challenge Definitions
 * ======================================================= */

type Challenge = {
  question: string;
  example: string;
  description: string;
};

const AUTH_CHALLENGES: Record<AuthMethod, Challenge> = {
  PASSWORD: {
    description: "🔑 กุญแจ : PASSWORD-L2",
    example: "",
    question: `
ด่าน : รหัสผ่านในโน้ตบุ๊ก (LEVEL 2)

เรื่องราว: โน้ตบุ๊กถูกตั้งรหัสแบบ Custom Rule อาจารย์ปริญญ์ชอบ "เข้ารหัสคำง่ายให้ดูยาก"

ข้อมูล: สโมสรจาก เมือง Manchester

กติกาการเข้ารหัส:
1) ใช้ชื่อทีมภาษาอังกฤษ
2) ตัวพิมพ์เล็กทั้งหมด
3) แทนตัวอักษร:
   a → 4
   e → 3
   o → 0
4) รูปแบบ:
   parin + love + encoded_team

🎯 ภารกิจ: สร้างรหัสผ่านตามกติกาทั้งหมด

  ผิดเพียงตัวเดียว = ล้มเหลว
`.trim(),
  },

};

/* =========================================================
 * API Handler
 * ======================================================= */

export async function POST() {
  const cookieStore = await cookies();
  const rawSession = cookieStore.get(COOKIE_NAME)?.value;

  if (!rawSession) {
    return Response.json({ ok: false, error: "NO_SESSION" }, { status: 401 });
  }

  let session: any;
  try {
    session = JSON.parse(rawSession);
  } catch {
    return Response.json({ ok: false, error: "BAD_SESSION" }, { status: 400 });
  }

  // 🎲 Random auth method
  const method =
    AUTH_METHODS[Math.floor(Math.random() * AUTH_METHODS.length)];

  session.authMethod = method;
  session.authAttempts = 0;

  cookieStore.set(COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    path: "/",
    sameSite: false,
    secure: false,
  });

  const challenge = AUTH_CHALLENGES[method];

  return Response.json({
    ok: true,
    method,
    message: `🔐 วิธียืนยันตัวตน: ${challenge.description}`,
    question: challenge.question,
    example: challenge.example,
  });
}
