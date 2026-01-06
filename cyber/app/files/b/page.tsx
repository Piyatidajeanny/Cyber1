"use client";

import { useState } from "react";

export default function FileBPage() {
  const [msg, setMsg] = useState<string | null>(null);
  const [flag, setFlag] = useState<string | null>(null);

  async function attempt() {
    setMsg(null);
    setFlag(null);
    const res = await fetch("/api/receiver/attempt", { method: "POST" });
    const j = await res.json();
    setMsg(`${j.message} — ${j.hint}`);
  }

  async function verify() {
    setMsg(null);
    setFlag(null);

    // ✅ ตั้งใจ "ไม่ส่ง header" เพื่อให้เป็นด่านจริง
    const res = await fetch("/api/receiver/verify", { method: "POST" });
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
        <h1 style={{ fontSize: 22, marginBottom: 6 }}>แฟ้ม B: ผู้รับที่ไม่เคยมีอยู่</h1>
        <p style={{ margin: 0 }}>
          UI จะหลอกคุณ…แต่ Network จะพูดความจริง
        </p>
      </div>

      <div className="card">
        <div className="hint">
          <strong>คำให้การพยาน</strong>
          “ผู้รับตัวจริงไม่เคยพูดว่า ‘ฉันคือผู้รับ’…เขาแค่ ‘ผ่านเงื่อนไข’ ของระบบ”
        </div>

        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn" onClick={attempt}>ฉันคือผู้รับ</button>
          <button className="btn btnPrimary" onClick={verify}>ยืนยัน (ด่านจริง)</button>
          <a className="btn" href="/files">กลับหน้าแฟ้ม</a>
        </div>

        {msg ? (
          <div style={{ marginTop: 14 }} className="hint">
            <strong>ผลลัพธ์</strong>
            {msg}
            {flag ? <div className="flagRed" style={{ marginTop: 10 }}>{`FLAG{LOCATION_IS_NOT_IDENTITY}`}</div> : null}
          </div>
        ) : null}

        <div style={{ marginTop: 12, color: "rgba(255,255,255,0.68)", lineHeight: 1.6 }}>
          <div><strong>วิธีผ่าน (ไม่เฉลยตรง ๆ):</strong></div>
          <div>1) เปิด DevTools → Network</div>
          <div>2) กด “ฉันคือผู้รับ” แล้วดู Response Headers</div>
          <div>3) craft request ไปที่ <span className="mono">/api/receiver/verify</span> ให้มี header ที่ระบบต้องการ</div>
          <div style={{ marginTop: 8 }} className="mono">
            ตัวอย่าง curl: <br />
            {"curl -X POST http://localhost:3000/api/receiver/verify -H \"X-Campus: SUT\""}
          </div>
        </div>
      </div>
    </main>
  );
}
