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
    <main>
      <div className="hero" style={{ padding: "80px 20px" }}>
        <div className="stamp" style={{ marginBottom: 24, background: "#e0e7ff", color: "#4338ca" }}>
          <span className="stampDot" style={{ background: "#4338ca" }} />
          CASE FILE: SUT-CYBER-2026
        </div>

        <h1 style={{ fontSize: "clamp(32px, 5vw, 64px)", marginBottom: 24, lineHeight: 1.1 }}>
          ปริศนาคดี<span style={{ color: "var(--accent)" }}>สุรนารีเงา</span>
        </h1>

        <p style={{ fontSize: 20, maxWidth: 680, marginInline: 'auto', color: "#475569" }}>
          มีพัสดุหนึ่งชิ้นที่ <b>“ถูกบันทึกว่าจัดส่งสำเร็จ”</b> ทั้งที่ไม่มีผู้ส่งและไม่มีผู้รับ<br />
          คุณได้รับมอบหมายให้ตรวจสอบความผิดปกติในระบบนี้
        </p>

        <div className="row" style={{ justifyContent: 'center', marginTop: 40, gap: 20 }}>
          <button className="btn btnPrimary" onClick={start} disabled={loading} style={{ padding: "16px 36px", fontSize: 18, borderRadius: 99 }}>
            {loading ? "Initializing..." : "🚀 เริ่มสืบสวนคดี"}
          </button>
          <a className="btn" href="/files" style={{ padding: "16px 36px", fontSize: 18, borderRadius: 99 }}>
            📂 เปิดแฟ้มข้อมูล
          </a>
        </div>

        {msg && (
          <div className="hint" style={{ marginTop: 30, maxWidth: 600, marginInline: 'auto' }}>
            <strong>System Error</strong>
            {msg}
          </div>
        )}
      </div>

      <div className="container" style={{ padding: "0 0 60px" }}>
        <div className="grid grid3">
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
            <h3>1. หาหลักฐาน</h3>
            <p>สำรวจข้อมูลที่กระจัดกระจายอยู่ในห้องเรียนและระบบ</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🔐</div>
            <h3>2. ถอดรหัส</h3>
            <p>ใช้ Logic, Checksum และ Basic Authen เพื่อปลดล็อก</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
            <h3>3. ยืนยันผล</h3>
            <p>นำหลักฐานทั้งหมดมายืนยันความถูกต้องของคดี</p>
          </div>
        </div>
      </div>
    </main>
  );
}
