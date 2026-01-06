"use client";

import { useEffect, useState } from "react";

type EvidenceItem = { id: string; title: string; content: string };

export default function BoardPage() {
  const [items, setItems] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch("/api/evidence/list", { credentials: "include" });
        const j = await res.json();
        if (!j.ok) throw new Error(j.error || "LOAD_FAILED");
        setItems(j.items || []);
      } catch (e: any) {
        setErr(e?.message ?? "โหลดไม่ได้");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main>
      <div className="hero" style={{ padding: 18, marginBottom: 14 }}>
        <h1 style={{ fontSize: 22, marginBottom: 6 }}>กระดานสืบสวน</h1>
        <p style={{ margin: 0 }}>
          {loading ? "กำลังโหลดหลักฐาน..." : "หลักฐานที่คุณเก็บได้จะปรากฏที่นี่"}
        </p>
      </div>

      {err ? (
        <div className="hint">
          <strong>เกิดข้อผิดพลาด</strong>
          {err}
        </div>
      ) : null}

      <div className="grid grid2">
        {items.map((it) => (
          <div key={it.id} className="card">
            <div className="cardTop">
              <div>
                <h3>{it.title}</h3>
                <div className="badge" style={{ marginTop: 8 }}>
                  {it.id}
                </div>
              </div>
              <span className="badge badgeOk">EVIDENCE</span>
            </div>
            <p className="mono" style={{ marginTop: 10 }}>
              {it.content}
            </p>
          </div>
        ))}

        {!loading && items.length === 0 ? (
          <div className="card">
            <h3>ยังไม่มีหลักฐาน</h3>
            <p>ลองไปเคลียร์แฟ้ม A ก่อน แล้วกลับมาดูใหม่</p>
            <a className="btn btnPrimary" href="/files/a">ไปแฟ้ม A</a>
          </div>
        ) : null}
      </div>
    </main>
  );
}
