"use client";

import { useState } from "react";
import { Archive, Lock, Unlock, AlertTriangle, ArrowLeft, Server, CheckCircle2 } from "lucide-react";

export default function FileCPage() {
  const [msg, setMsg] = useState<string | null>(null);
  const [flag, setFlag] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function openArchive() {
    setLoading(true);
    setMsg(null);
    setFlag(null);

    try {
      const res = await fetch("/api/internal/archive", { method: "GET", credentials: "include" });
      const j = await res.json();

      if (j.ok) {
        setMsg(j.message);
        setFlag(j.flag);
      } else {
        const hintHeader = res.headers.get("X-Policy-Hint");
        const hintMsg = hintHeader ? `\n\nคำใบ้จาก Server: ${hintHeader}` : "";
        setMsg((j.message || j.error) + hintMsg);
      }
    } catch (e) {
      setMsg("เกิดข้อผิดพลาดในการเชื่อมต่อ (Network Error)");
    } finally {
      setLoading(false);
    }
  }

  // --- Full Screen Result View ---
  if (msg && !loading) {
    const isSuccess = !!flag;
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'var(--bg)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: 40,
        overflowY: 'auto'
      }}>
        <div style={{
          color: isSuccess ? "#10b981" : "#ef4444",
          marginBottom: 30,
          animation: isSuccess ? "bounce 1s" : "shake 0.5s"
        }}>
          {isSuccess ? <Unlock size={120} /> : <Lock size={120} />}
        </div>

        <h2 style={{ fontSize: 48, fontWeight: 800, marginBottom: 20, color: isSuccess ? "#10b981" : "#ef4444" }}>
          {isSuccess ? "อนุญาตให้เข้าถึง" : "ปฏิเสธการเข้าถึง"}
        </h2>

        <div style={{ fontSize: 24, maxWidth: 800, lineHeight: 1.6, marginBottom: 40 }}>
          {msg}
        </div>

        {flag && (
          <div style={{
            margin: "0 0 40px", padding: 30,
            border: "3px dashed #10b981", borderRadius: 20,
            background: "#dcfce7", color: "#166534",
            fontFamily: "var(--mono)", fontSize: 32, fontWeight: "bold"
          }}>
            {flag}
          </div>
        )}

        <div style={{ display: 'flex', gap: 20 }}>
          <button onClick={() => setMsg(null)} className="btn btnPrimary" style={{ padding: "16px 40px", fontSize: 20 }}>
            {isSuccess ? "ปิดแฟ้มคดี" : "ลองใหม่"}
          </button>
          <a href="/files" className="btn" style={{ padding: "16px 40px", fontSize: 20 }}>
            ออกจากคดี
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Nav / Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <a href="/files" className="btn" style={{ padding: "8px 16px", background: 'transparent', border: 'none' }}>
          <ArrowLeft size={20} /> ย้อนกลับ
        </a>
      </div>

      <div className="hero" style={{ marginBottom: 30 }}>
        <h1>คดี C: คลังข้อมูลภายใน</h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 10 }}>
          <Server size={24} style={{ color: 'var(--accent)' }} />
          <p style={{ margin: 0 }}>Server-Side Authorization</p>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto" }}>

        <div className="card" style={{ padding: 60, textAlign: 'center', marginBottom: 40 }}>
          <h3 style={{ fontSize: 28, marginBottom: 20 }}>จุดเข้าถึงข้อมูลนิรภัย</h3>

          <div style={{
            margin: "40px auto",
            width: 160, height: 160, borderRadius: '50%',
            background: "var(--accentLight)",
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: "var(--accent)"
          }}>
            <Archive size={80} />
          </div>

          <p style={{ fontSize: 18, marginBottom: 40, maxWidth: 400, marginInline: 'auto' }}>
            คลังข้อมูลนี้สงวนสิทธิ์ให้บุคลากรภายในเท่านั้น<br />ระบบจะตรวจสอบสิทธิ์ก่อนอนุญาตให้เข้าถึง
          </p>

          <button
            className="btn btnPrimary"
            onClick={openArchive}
            disabled={loading}
            style={{
              padding: "20px 48px", fontSize: 24, borderRadius: 99,
              boxShadow: "0 20px 40px -10px var(--accentGlow)"
            }}
          >
            {loading ? "กำลังเชื่อมต่อ..." : "ขอยืนยันสิทธิ์เข้าถึง"}
          </button>

          <div style={{ marginTop: 24, fontSize: 14, opacity: 0.6 }}>
            (คลิกเพื่อพยายามเชื่อมต่อ)
          </div>
        </div>

        <div style={{ opacity: 0.8, background: "white", padding: 30, borderRadius: 20, border: "1px dashed var(--border)" }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18 }}>
            <AlertTriangle size={20} className="text-accent" />
            บันทึกการสืบสวน
          </h3>
          <ul style={{ paddingLeft: 20, lineHeight: 1.8, fontSize: 15, marginTop: 14, color: "var(--muted)" }}>
            <li>ระบบตรวจสอบสิทธิ์โดยใช้ <b>HTTP Headers</b></li>
            <li>Header ที่ต้องใช้: <code>X-Institute</code></li>
            <li>ค่าที่ถูกต้อง (Value): <code>INTERNAL-ARCHIVE</code></li>
            <li>ลองใช้เครื่องมือเช่น Burp Suite หรือ "Edit and Resend" เพื่อแก้ไข Request</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
