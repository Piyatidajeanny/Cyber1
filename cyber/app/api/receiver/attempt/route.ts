import { cookies } from "next/headers";

const COOKIE_NAME = "sut_case";

export async function POST() {
  const cookieStore = await cookies();
  const v = cookieStore.get(COOKIE_NAME)?.value;
  if (!v) return Response.json({ ok: false, error: "NO_SESSION" }, { status: 401 });

  const res = Response.json({
    ok: false,
    message: "ผู้รับตัวจริงไม่ยืนยันตัวเองด้วยปุ่ม",
    hint: "เปิด DevTools → Network → ดู Response Headers",
    note: "สิ่งที่ระบบเชื่อจริง ๆ ไม่ได้อยู่ใน UI",
  });

  // ใบ้ผ่าน header ให้ผู้เล่นเห็นใน Network
  res.headers.set("X-Case-Hint", "ลองใส่ header ชื่อ: X-Campus");
  res.headers.set("X-Case-Need", "X-Campus: SUT");

  return res;
}
