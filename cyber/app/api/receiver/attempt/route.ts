import { cookies } from "next/headers";

const COOKIE_NAME = "sut_case";

type AuthMethod = "PASSWORD" | "PIN" | "OTP" | "BIOMETRIC" | "LOCATION" | "MFA";
const AUTH_METHODS: AuthMethod[] = ["PASSWORD", "PIN", "OTP", "BIOMETRIC", "LOCATION", "MFA"];

const AUTH_CHALLENGES = {
  PASSWORD: {
    hint: "รหัสผ่าน = ปีก่อตั้ง มทส. (ค.ศ.) + '@' + ชื่อย่อ มทส. (อังกฤษ 3 ตัว)",
    example: "YYYY@XXX",
    description: "Password-based Authentication",
  },
  PIN: {
    hint: "PIN 6 หลัก = จำนวนตึกเครื่องมือ มทส. (2 หลัก) + จำนวนคณะ (2 หลัก) + ปีก่อตั้ง 2 หลักท้าย พ.ศ.",
    example: "XXYYAA (08=ตึกเครื่องมือ, 14=คณะ, 33=พ.ศ.2533)",
    description: "PIN Authentication",
  },
  OTP: {
    hint: "OTP = เลข 6 หลักจาก timestamp → คำนวณจาก: ชั่วโมงปัจจุบัน + วันที่ + เดือน (HHDDMM)",
    example: "เช่น 15:30 วันที่ 6 มกราคม = 153006 + 01 = 150607",
    description: "One-Time Password",
  },
  BIOMETRIC: {
    hint: "Face Recognition = ส่งชื่อสัญลักษณ์ มทส. (ภาษาอังกฤษ) ที่ปรากฏบนโลโก้",
    example: "ชื่อสัตว์ในตราสัญลักษณ์ มทส.",
    description: "Biometric Authentication (Visual)",
  },
  LOCATION: {
    hint: "พิกัด GPS มทส. รูปแบบ: latitude,longitude (ทศนิยม 2 ตำแหน่ง)",
    example: "14.XX,102.XX",
    description: "Location-based Authentication",
  },
  MFA: {
    hint: "Multi-Factor = ส่ง JSON: {\"year\":\"ปีก่อตั้ง ค.ศ.\", \"buildings\":\"จำนวนตึกเครื่องมือ\", \"province\":\"จังหวัด (อังกฤษ)\"}",
    example: '{"year":"YYYY","buildings":"XX","province":"city"}',
    description: "Multi-Factor Authentication",
  },
};

export async function POST() {
  const cookieStore = await cookies();
  const v = cookieStore.get(COOKIE_NAME)?.value;
  if (!v) return Response.json({ ok: false, error: "NO_SESSION" }, { status: 401 });

  let session: any;
  try {
    session = JSON.parse(v);
  } catch {
    return Response.json({ ok: false, error: "BAD_SESSION" }, { status: 400 });
  }

  // สุ่ม Auth Method ใหม่ทุกครั้งที่เรียก
  const randomMethod = AUTH_METHODS[Math.floor(Math.random() * AUTH_METHODS.length)];
  session.authMethod = randomMethod;
  session.authAttempts = 0;

  cookieStore.set(COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    sameSite: false,
    path: "/",
    secure: false,
  });

  const method = session.authMethod as AuthMethod;
  const challenge = AUTH_CHALLENGES[method];

  return Response.json({
    ok: true,
    method,
    message: `🔐 วิธียืนยันตัวตน: ${challenge.description}`,
    hint: challenge.hint,
    example: challenge.example,
  });
}
