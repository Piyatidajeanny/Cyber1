"use client";

import { useState } from "react";
import {
  ScanFace,
  MapPin,
  KeyRound,
  Smartphone,
  ShieldCheck,
  Fingerprint,
  RefreshCw,
  ArrowLeft,
  CheckCircle2
} from "lucide-react";

export default function FileBPage() {
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [flag, setFlag] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function getChallenge() {
    setLoading(true);
    setMsg(null);
    setFlag(null);
    setInput("");
    try {
      const res = await fetch("/api/receiver/attempt", { method: "POST", credentials: "include" });
      const j = await res.json();

      if (j.ok) {
        setChallenge(j);
        setMsg(null);
      } else {
        setMsg(j.error || "โหลดโจทย์ไม่สำเร็จ");
      }
    } finally {
      setLoading(false);
    }
  }

  async function verify() {
    if (!input.trim()) return;
    setLoading(true);
    setMsg(null);
    setFlag(null);

    try {
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
        setMsg((j.message || j.error) + (j.hint ? `\n\n💡 คำใบ้: ${j.hint}` : ""));
      }
    } finally {
      setLoading(false);
    }
  }

  function getIcon(method: string) {
    if (!method) return <ShieldCheck size={80} />;
    const m = method.toUpperCase();
    if (m === "PASSWORD" || m === "PIN") return <KeyRound size={80} />;
    if (m === "OTP" || m === "MFA") return <Smartphone size={80} />;
    if (m.includes("BIO")) return <Fingerprint size={80} />;
    if (m.includes("LOCATION")) return <MapPin size={80} />;
    return <ScanFace size={80} />;
  }

  // --- Full Screen Challenge View ---
  if (challenge) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'var(--bg)',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
        fontFamily: 'var(--sans)'
      }}>
        <div style={{
          maxWidth: 900, margin: '0 auto', width: '100%',
          padding: 40,
          display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', alignItems: 'center',
          textAlign: 'center'
        }}>

          <div style={{
            color: flag ? "#10b981" : "var(--accent)",
            marginBottom: 30,
            animation: "pulse 2s infinite"
          }}>
            {flag ? <CheckCircle2 size={120} /> : getIcon(challenge.method)}
          </div>

          <h2 style={{ fontSize: 48, margin: "0 0 16px", fontWeight: 800 }}>
            {flag ? "ยืนยันตัวตนสำเร็จ" : challenge.method}
          </h2>

          <div style={{ fontSize: 24, color: "var(--text)", maxWidth: 700, lineHeight: 1.5, marginBottom: 20 }}>
            {challenge.message}
          </div>

          {!flag && (
            <>
              <div style={{
                background: "white", padding: "20px 30px", borderRadius: 12,
                boxShadow: "var(--shadow)", marginBottom: 20, maxWidth: 700
              }}>
                <div style={{ fontSize: 18, color: "var(--text)", lineHeight: 1.6 }}>{challenge.question}</div>
              </div>
              <div style={{
                background: "#f0f9ff", padding: "10px 20px", borderRadius: 12,
                marginBottom: 40
              }}>
                <span style={{ fontSize: 14, color: "var(--muted)", marginRight: 10 }}>ตัวอย่างรูปแบบ:</span>
                <code style={{ fontSize: 16, fontFamily: 'var(--mono)', color: "var(--accent)" }}>{challenge.example}</code>
              </div>
            </>
          )}

          {!flag && (
            <div style={{ width: '100%', maxWidth: 500 }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="กรอกคำตอบ..."
                autoFocus
                style={{
                  width: '100%', padding: 20, fontSize: 32, textAlign: 'center',
                  borderRadius: 24, border: '3px solid var(--border)', outline: 'none',
                  fontFamily: 'var(--mono)', marginBottom: 20
                }}
                onKeyDown={e => e.key === 'Enter' && verify()}
              />

              <div className="row" style={{ justifyContent: 'center' }}>
                <button
                  onClick={verify}
                  className="btn btnPrimary"
                  disabled={loading}
                  style={{ padding: "16px 48px", fontSize: 22, borderRadius: 99 }}
                >
                  {loading ? "กำลังตรวจสอบ..." : "ยันยันคำตอบ"}
                </button>
              </div>
            </div>
          )}

          {msg && (
            <div style={{
              marginTop: 40, padding: 30, width: '100%', maxWidth: 700,
              background: flag ? "#dcfce7" : "#fee2e2",
              color: flag ? "#166534" : "#991b1b",
              borderRadius: 24, fontSize: 20, lineHeight: 1.6
            }}>
              {msg}
              {flag && (
                <div style={{
                  marginTop: 20, fontSize: 32, fontWeight: 'bold', fontFamily: 'var(--mono)',
                  padding: 20, border: '2px dashed #166534', borderRadius: 16
                }}>
                  {flag}
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: 60, display: 'flex', gap: 20 }}>
            {!flag && (
              <button onClick={getChallenge} className="btn" style={{ color: "var(--muted)" }}>
                <RefreshCw size={20} />
                สุ่มโจทย์ใหม่
              </button>
            )}
            <button onClick={() => setChallenge(null)} className="btn">
              <ArrowLeft size={20} />
              {flag ? "ปิดและกลับ" : "ยกเลิก"}
            </button>
          </div>

        </div>
      </div>
    );
  }

  // --- Default View ---
  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Nav / Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <a href="/files" className="btn" style={{ padding: "8px 16px", background: 'transparent', border: 'none' }}>
          <ArrowLeft size={20} /> ย้อนกลับ
        </a>
      </div>

      <div className="hero" style={{ marginBottom: 30 }}>
        <h1>Case B: ผู้รับที่สาบสูญ</h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 10 }}>
          <ScanFace size={24} style={{ color: 'var(--accent)' }} />
          <p style={{ margin: 0 }}>Authentication Protocol</p>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ marginBottom: 30, color: "var(--accent)", display: 'flex', justifyContent: 'center' }}>
            <ShieldCheck size={80} />
          </div>

          <h2 style={{ fontSize: 32, marginBottom: 10 }}>ต้องมีการยืนยันตัวตน</h2>
          <p style={{ fontSize: 18, marginBottom: 40, color: "var(--muted)" }}>
            ระบบต้องการให้คุณยืนยันว่าเป็นเจ้าหน้าที่ตัวจริง<br />
            โดยจะสุ่มวิธีการตรวจสอบ (PIN, OTP, Bio, Location)
          </p>

          <button
            className="btn btnPrimary"
            onClick={getChallenge}
            style={{ fontSize: 24, padding: "20px 40px", boxShadow: "0 20px 40px -10px var(--accentGlow)" }}
            disabled={loading}
          >
            {loading ? "กำลังเชื่อมต่อ..." : "เริ่มการยืนยันตัวตน"}
          </button>
        </div>

        <div className="grid grid3" style={{ marginTop: 40, opacity: 0.6 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><KeyRound size={32} /></div>
            <div style={{ fontWeight: 600 }}>Knowledge</div>
            <div style={{ fontSize: 13 }}>รหัสผ่าน, PIN</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Smartphone size={32} /></div>
            <div style={{ fontWeight: 600 }}>Possession</div>
            <div style={{ fontSize: 13 }}>OTP, อุปกรณ์พกพา</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Fingerprint size={32} /></div>
            <div style={{ fontWeight: 600 }}>Inherence</div>
            <div style={{ fontSize: 13 }}>ลายนิ้วมือ, ใบหน้า</div>
          </div>
        </div>
      </div>
    </div>
  );
}
