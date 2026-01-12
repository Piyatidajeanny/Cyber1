import { cookies } from "next/headers";

const COOKIE_NAME = "sut_case";

type AuthMethod = "ACM" | "PERMISSION" | "RBAC" | "RULE" | "MLS" | "ABAC";
const AUTH_METHODS: AuthMethod[] = ["ACM", "PERMISSION", "RBAC", "RULE", "MLS", "ABAC"];

const AUTH_CHALLENGES: Record<AuthMethod, { hint: string; example: string; description: string }> = {
  ACM: {
    hint: "Access Control Matrix — ส่งรูปแบบ user:resource:permission เช่น alice:archive:read",
    example: "alice:archive:read",
    description: "Access Control Matrix (ACM)",
  },
  PERMISSION: {
    hint: "Permission model — ส่งสิทธิ์หรือ token ที่บ่งชี้อนุญาต เช่น PERMIT_ARCHIVE",
    example: "PERMIT_ARCHIVE",
    description: "Permission-based Authorization",
  },
  RBAC: {
    hint: "Role-based — ระบุบทบาทที่มีสิทธิ์ เช่น archivist หรือ admin",
    example: "archivist",
    description: "Role-Based Access Control (RBAC)",
  },
  RULE: {
    hint: "Rule-based — คำตอบต้องสอดคล้องกับกฎ เช่น คำสั่งพิเศษ UNLOCK_C",
    example: "UNLOCK_C",
    description: "Rule-based Authorization",
  },
  MLS: {
    hint: "Multilevel Security — ระบุระดับความลับ เช่น CONFIDENTIAL, SECRET, TOPSECRET",
    example: "SECRET",
    description: "Multilevel Security (MLS)",
  },
  ABAC: {
    hint: "Attribute-based — ส่ง JSON ของ attribute เช่น {\"dept\":\"internal\",\"role\":\"archivist\"}",
    example: '{"dept":"internal","role":"archivist"}',
    description: "Attribute-Based Access Control (ABAC)",
  },
};

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

  // ถ้ามีการระบุ method ผ่าน body ให้ใช้ method นั้น (เพื่อให้ UI ทดลองได้)
  let desired: string | undefined = undefined;
  try {
    const body = await req.json();
    desired = typeof body?.method === "string" ? body.method.toUpperCase() : undefined;
  } catch {
    desired = undefined;
  }

  let selectedMethod: AuthMethod;
  if (desired && AUTH_METHODS.includes(desired as AuthMethod)) {
    selectedMethod = desired as AuthMethod;
  } else {
    // สุ่ม Auth Method ใหม่ทุกครั้งที่เรียก
    selectedMethod = AUTH_METHODS[Math.floor(Math.random() * AUTH_METHODS.length)];
  }

  session.authMethod = selectedMethod;
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
