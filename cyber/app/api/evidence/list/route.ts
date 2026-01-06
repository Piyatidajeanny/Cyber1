import { cookies } from "next/headers";

const COOKIE_NAME = "sut_case";

type Evidence = { id: string; title: string; content: string };

const EVIDENCE_DB: Record<string, Evidence> = {
  A_FLAG: {
    id: "A_FLAG",
    title: "หลักฐาน A: ลายเซ็นเงา",
    content: "FLAG{YEARS_ARE_RELATIVE}",
  },
  B_FLAG: {
    id: "B_FLAG",
    title: "หลักฐาน B: ผู้รับที่ไม่เคยมีอยู่",
    content: "FLAG{LOCATION_IS_NOT_IDENTITY}",
  },
  C_FLAG: {
    id: "C_FLAG",
    title: "หลักฐาน C: แฟ้มภายใน",
    content: "FLAG{STRUCTURE_IS_NOT_AUTHORIZATION}",
  },
};

export async function GET() {
  const cookieStore = await cookies();
  const v = cookieStore.get(COOKIE_NAME)?.value;

  if (!v) {
    return Response.json({ ok: false, error: "NO_SESSION" }, { status: 401 });
  }

  let session: any;
  try {
    session = JSON.parse(v);
  } catch {
    return Response.json({ ok: false, error: "BAD_SESSION" }, { status: 400 });
  }

  const unlocked: string[] = Array.isArray(session.unlockedEvidence)
    ? session.unlockedEvidence
    : [];

  const items = unlocked
    .map((id) => EVIDENCE_DB[id])
    .filter((x): x is Evidence => Boolean(x));

  return Response.json({ ok: true, items, unlocked });
}
