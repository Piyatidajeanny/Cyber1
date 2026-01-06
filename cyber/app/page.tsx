"use client";

import { useState } from "react";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function start() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/session/start", { method: "POST", credentials: "include" });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || "START_FAILED");
      window.location.href = "/files";
    } catch (e: any) {
      setMsg(e?.message ?? "เริ่มเกมไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="hero">
      <h1>คดีสุรนารีเงา</h1>

      <div className="stamp" style={{ margin: "10px 0 14px" }}>
        <span className="stampDot" />
        CASE STATUS: ACTIVE
      </div>

      <p>
        มีพัสดุหนึ่งชิ้นที่ “ถูกบันทึกว่าจัดส่งสำเร็จ” ทั้งที่ไม่มีผู้ส่งและไม่มีผู้รับ
        คุณจะเชื่อระบบ…หรือเชื่อหลักฐาน?
      </p>

      <div className="row">
        <button className="btn btnPrimary" onClick={start} disabled={loading}>
          {loading ? "กำลังเริ่มคดี..." : "เริ่มสืบสวน"}
        </button>
        <a className="btn" href="/files">ไปหน้าแฟ้มคดี</a>
      </div>

      {msg ? (
        <div style={{ marginTop: 14 }} className="hint">
          <strong>แจ้งเตือน</strong>
          {msg}
        </div>
      ) : null}

      <div style={{ marginTop: 18 }} className="hint">
        <strong>หมายเหตุจากผู้บังคับบัญชา</strong>
        “อย่าเชื่อข้อความบนหน้าจอมากกว่าข้อมูลใน Network.”
      </div>
    </main>
  );
}
