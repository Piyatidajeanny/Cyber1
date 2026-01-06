import { cookies } from "next/headers";

const COOKIE_NAME = "sut_case";

export async function POST() {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return Response.json({ ok: true });
}
