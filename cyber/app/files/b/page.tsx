"use client";

import { useState } from "react";

export default function FileBPage() {
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [flag, setFlag] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<any>(null);

  async function getChallenge() {
    setMsg(null);
    setFlag(null);
    const res = await fetch("/api/receiver/attempt", { method: "POST", credentials: "include" });
    const j = await res.json();
    
    if (j.ok) {
      setChallenge(j);
      setMsg(`${j.message}\n\n💡 ${j.hint}\n\n📝 ${j.example}`);
    } else {
      setMsg(j.error || "โหลดโจทย์ไม่สำเร็จ");
    }
  }

  async function verify() {
    setMsg(null);
    setFlag(null);

    const res = await fetch("/api/receiver/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ input }),
    });
    const j = await res.json();

    if (j.ok) {
      setMsg(j.message);
      setFlag(j.flag);
    } else {
      setMsg((j.message || j.error) + (j.hint ? `\n\n${j.hint}` : ""));
    }
  }

  return (
    <main>
      <div className="hero" style={{ padding: 18, marginBottom: 14 }}>
        <h1 style={{ fontSize: 22, marginBottom: 6 }}>แฟ้ม B: ยืนยันตัวตนด้วยข้อมูล มทส.</h1>
        <p style={{ margin: 0 }}>
          ระบบจะสุ่มวิธียืนยันตัวตน → คุณต้องหาข้อมูลเกี่ยวกับ มทส. มาตอบ
        </p>
      </div>

      <div className="card">
        <div className="hint">
          <strong>📚 Entity Authentication Methods</strong>
          <div style={{ marginTop: 8, lineHeight: 1.6 }}>
            Password | PIN | OTP | Biometric | Location-based | Multi-Factor
          </div>
        </div>

        {challenge && (
          <div style={{ marginTop: 14, padding: 14, background: "rgba(255,255,255,0.05)", borderRadius: 12 }}>
            <div style={{ color: "#4ade80", fontWeight: 600 }}>🎯 โจทย์ของคุณ: {challenge.method}</div>
          </div>
        )}

        <div style={{ marginTop: 14 }}>
          <label style={{ display: "block", marginBottom: 8, color: "rgba(255,255,255,0.75)" }}>
            กรอกคำตอบ
          </label>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ตอบตามคำใบ้ที่ได้รับ"
            style={{
              width: "100%",
              padding: "12px 12px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.92)",
              outline: "none",
              fontFamily: "ui-monospace, Menlo, Consolas, monospace",
            }}
          />
        </div>

        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn" onClick={getChallenge}>รับโจทย์ใหม่</button>
          <button className="btn btnPrimary" onClick={verify}>ยืนยันตัวตน</button>
          <a className="btn" href="/files">กลับหน้าแฟ้ม</a>
        </div>

        {msg ? (
          <div style={{ marginTop: 14 }} className="hint">
            <strong>ผลลัพธ์</strong>
            <div style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>{msg}</div>
            {flag ? (
              <div className="flagRed" style={{ marginTop: 10 }}>
                {flag}
              </div>
            ) : null}
          </div>
        ) : null}

        <div style={{ marginTop: 12, color: "rgba(255,255,255,0.68)", lineHeight: 1.6, fontSize: 14 }}>
          <div><strong>💡 เคล็ดลับ:</strong></div>
          <div>• กด "รับโจทย์ใหม่" เพื่อดูวิธียืนยันตัวตนที่สุ่มได้</div>
          <div>• หาข้อมูลเกี่ยวกับ มทส. จากคำใบ้</div>
          <div>• ตอบตามรูปแบบที่กำหนด (ดู example)</div>
        </div>
      </div>
    </main>
  );
}
