"use client";

import { useState } from "react";

export default function FileCPage() {
  const [msg, setMsg] = useState<string | null>(null);
  const [flag, setFlag] = useState<string | null>(null);

  async function openArchive() {
    setMsg(null);
    setFlag(null);

    // ✅ ตั้งใจ "ไม่ส่ง header" เพื่อให้เป็นด่านจริง
    const res = await fetch("/api/internal/archive", { method: "GET" });
    const j = await res.json();

    if (j.ok) {
      setMsg(j.message);
      setFlag(j.flag);
    } else {
      setMsg((j.message || j.error) + (j.hint ? ` — ${j.hint}` : ""));
    }
  }

  return (
    <main>
      <div className="hero" style={{ padding: 18, marginBottom: 14 }}>
        <h1 style={{ fontSize: 22, marginBottom: 6 }}>แฟ้ม C: แฟ้มภายใน</h1>
        <p style={{ margin: 0 }}>
          สิทธิ์ไม่ใช่ตัวตน และโครงสร้างไม่ใช่การอนุญาต
        </p>
      </div>

      <div className="card">
        <div className="hint">
          <strong>บันทึกเวรยาม</strong>
          “อย่ามองหา admin…มองหาว่าระบบ ‘เชื่อ policy อะไร’”
        </div>

        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn btnPrimary" onClick={openArchive}>เปิดแฟ้มภายใน (ด่านจริง)</button>
          <a className="btn" href="/files">กลับหน้าแฟ้ม</a>
        </div>

        {msg ? (
          <div style={{ marginTop: 14 }} className="hint">
            <strong>ผลลัพธ์</strong>
            {msg}
            {flag ? (
              <div className="flagRed" style={{ marginTop: 10 }}>
                {"FLAG{STRUCTURE_IS_NOT_AUTHORIZATION}"}
              </div>
            ) : null}
          </div>
        ) : null}

        <div style={{ marginTop: 12, color: "rgba(255,255,255,0.68)", lineHeight: 1.6 }}>
          <div><strong>วิธีผ่าน (ใบ้แบบโคนัน):</strong></div>
          <div>1) เปิด DevTools → Network</div>
          <div>2) กดปุ่มแล้วดู Response Headers</div>
          <div>3) craft request ไปที่ <span className="mono">/api/internal/archive</span> พร้อม header ที่ระบบต้องการ</div>
          <div style={{ marginTop: 8 }} className="mono">
            ตัวอย่าง curl: <br />
            {"curl http://localhost:3000/api/internal/archive -H \"X-Institute: INTERNAL-ARCHIVE\""}
          </div>
        </div>
      </div>
    </main>
  );
}
