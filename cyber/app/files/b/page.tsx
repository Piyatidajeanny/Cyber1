"use client";
import React, { useState } from "react";
import {
  ShieldCheck,
  KeyRound,
  Smartphone,
  Fingerprint,
  MapPin,
  ScanFace,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  Flag,
} from "lucide-react";

type Stage = "default" | "hintGame" | "challenge";

function Card({
  title,
  subtitle,
  children,
  icon,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="card" style={{ marginBottom: 30 }}>
      <div
        className="cardTop"
        style={{
          alignItems: "center",
          borderBottom: "1px solid var(--border)",
          paddingBottom: 16,
          marginBottom: 20,
        }}
      >
        <div>
          <h3
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 24,
            }}
          >
            <span style={{ color: "var(--accent)" }}>{icon}</span>
            {title}
          </h3>
          {subtitle && <p style={{ fontSize: 16, marginTop: 4 }}>{subtitle}</p>}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function AlertMsg({ type, text }: { type: "ok" | "err"; text: string }) {
  const isOk = type === "ok";
  return (
    <div
      style={{
        marginTop: 20,
        padding: "16px 20px",
        borderRadius: 16,
        background: isOk ? "#dcfce7" : "#fee2e2",
        border: `1px solid ${isOk ? "#86efac" : "#fca5a5"}`,
        color: isOk ? "#166534" : "#991b1b",
        fontSize: 16,
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        gap: 12,
        justifyContent: "center",
      }}
    >
      {isOk ? <CheckCircle2 size={24} /> : <Flag size={24} />}
      {text}
    </div>
  );
}

function StatusPill({ label, val }: { label: string; val: string | null }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 12px",
        borderRadius: 99,
        background: val ? "#dcfce7" : "#f1f5f9",
        fontSize: 13,
      }}
    >
      <span style={{ color: "var(--muted)" }}>{label}:</span>
      {val ? <strong style={{ color: "#166534" }}>{val}</strong> : <span style={{ color: "#cbd5e1" }}>ล็อค</span>}
      
    </div>
  );
}

export default function FileBPage() {
  const [stage, setStage] = useState<Stage>("default");
  const [hintStep, setHintStep] = useState(0);
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [flag, setFlag] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hintsCompleted, setHintsCompleted] = useState(0);

  const HINTS = [
    { text: "ข้อ 1: ตัวอักษรเริ่มต้นของทีมฟุตบอล", answer: "man" },
    { text: "ข้อ 2: สระในถาษาอังกฤษตัวที่ 5 ซึ่งเป็นตัวสุดท้าย", answer: "u" },
  ];

  function checkHint() {
    const correct = HINTS[hintStep].answer.toLowerCase();
    if (input.trim().toLowerCase() === correct) {
      setMsg({ type: "ok", text: "✅ ถูกต้อง!" });
      setHintStep(hintStep + 1);
      setHintsCompleted(hintStep + 1);
      setInput("");
      if (hintStep + 1 === HINTS.length) {
        setTimeout(() => {
          setStage("challenge");
          getChallenge();
        }, 800);
      }
    } else {
      setMsg({ type: "err", text: "❌ ไม่ถูกต้อง ลองใหม่" });
    }
  }

  async function getChallenge() {
    setLoading(true);
    setMsg(null);
    setFlag(null);
    setInput("");
    try {
      const res = await fetch("/api/receiver/attempt", {
        method: "POST",
        credentials: "include",
      });
      const j = await res.json();
      if (j.ok) {
        setChallenge(j);
        setMsg(null);
      } else {
        setMsg({ type: "err", text: j.error || "โหลดโจทย์ไม่สำเร็จ" });
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
        setMsg({ type: "ok", text: j.message || "ยืนยันสำเร็จ!" });
        setFlag(j.flag);
      } else {
        setMsg({
          type: "err",
          text: (j.message || j.error) + (j.hint ? `\n\n💡 คำใบ้: ${j.hint}` : ""),
        });
      }
    } finally {
      setLoading(false);
    }
  }

  const inputCss: React.CSSProperties = {
    background: "var(--bg)",
    border: "2px solid var(--border)",
    color: "var(--text)",
    padding: "16px",
    borderRadius: 16,
    width: "100%",
    outline: "none",
    fontFamily: "var(--mono)",
    fontSize: "18px",
  };

  // --- Hint Game Stage ---
  if (stage === "hintGame") {
    return (
      <div style={{ maxWidth: 720, margin: "0 auto", paddingBottom: 60 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <a
            href="/files"
            className="btn"
            style={{ padding: "8px 16px", background: "transparent", border: "none" }}
          >
            <ArrowLeft size={20} /> ย้อนกลับ
          </a>
        </div>

        <div className="hero" style={{ marginBottom: 30, padding: 30 }}>
          <h1>คดี B: การยืนยันตัวตน</h1>
          <p style={{ margin: "10px 0 20px" }}>
            เกมหาคำใบ้เพื่อปลดล็อกการยืนยันตัวตน
          </p>
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              background: "white",
              padding: 10,
              borderRadius: 14,
              justifyContent: "center",
            }}
          >
            <StatusPill label="ข้อ 1" val={hintsCompleted >= 1 ? "man" : null} />
            <StatusPill label="ข้อ 2" val={hintsCompleted >= 2 ? "u" : null} />
          </div>
        </div>

        <Card
          title="🎯 เกมหาคำใบ้"
          subtitle={`ตอบคำถาม (${Math.min(hintStep + 1, HINTS.length)}/${HINTS.length})`}
          icon={<Smartphone />}
        >
          <div
            style={{
              background: "var(--accentLight)",
              padding: 30,
              borderRadius: 20,
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            <p
              style={{
                margin: "0 0 24px",
                fontSize: 18,
                color: "var(--text)",
                fontWeight: 600,
              }}
            >
              {hintStep < HINTS.length ? HINTS[hintStep].text : "โหลดคำถามใหม่..."}
            </p>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="กรอกคำตอบ..."
              style={{
                ...inputCss,
                textAlign: "center",
                fontSize: 20,
                marginBottom: 16,
              }}
              onKeyDown={(e) => e.key === "Enter" && checkHint()}
              autoFocus
            />

            <div className="row" style={{ justifyContent: "center", gap: 12 }}>
              <button
                onClick={checkHint}
                className="btn btnPrimary"
                style={{ minWidth: 150, fontSize: 16 }}
              >
                ตรวจสอบ
              </button>
              <button
                onClick={() => {
                  setStage("default");
                  setHintStep(0);
                  setInput("");
                  setMsg(null);
                  setHintsCompleted(0);
                }}
                className="btn"
                style={{ minWidth: 150, fontSize: 16 }}
              >
                ยกเลิก
              </button>
            </div>

            {msg && <AlertMsg type={msg.type} text={msg.text} />}
          </div>

          <div style={{ marginTop: 20, opacity: 0.7, textAlign: "center", fontSize: 14 }}>
            <p>คำใบ้เหล่านี้จะช่วยให้คุณเข้ารหัสรหัสผ่านในด่านการยืนยันตัวตน</p>
          </div>
        </Card>
      </div>
    );
  }

  // --- Challenge Stage ---
  if (stage === "challenge" && challenge) {
    function getIcon(method: string) {
      if (!method) return <ShieldCheck size={80} />;
      const m = method.toUpperCase();
      if (m === "PASSWORD" || m === "PIN") return <KeyRound size={80} />;
      if (m === "OTP" || m === "MFA") return <Smartphone size={80} />;
      if (m.includes("BIO")) return <Fingerprint size={80} />;
      if (m.includes("LOCATION")) return <MapPin size={80} />;
      return <ScanFace size={80} />;
    }

    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          background: "var(--bg)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          fontFamily: "var(--sans)",
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            width: "100%",
            padding: 40,
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              color: flag ? "#10b981" : "var(--accent)",
              marginBottom: 30,
              animation: "pulse 2s infinite",
            }}
          >
            {flag ? <CheckCircle2 size={120} /> : getIcon(challenge.method)}
          </div>

          <h2 style={{ fontSize: 48, margin: "0 0 16px", fontWeight: 800 }}>
            {flag ? "ยืนยันตัวตนสำเร็จ" : challenge.method}
          </h2>

          <div
            style={{
              fontSize: 24,
              color: "var(--text)",
              maxWidth: 700,
              lineHeight: 1.5,
              marginBottom: 20,
            }}
          >
            {challenge.message}
          </div>

          {!flag && (
            <>
              <div
                style={{
                  background: "white",
                  padding: "20px 30px",
                  borderRadius: 12,
                  boxShadow: "var(--shadow)",
                  marginBottom: 20,
                  maxWidth: 700,
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    lineHeight: 1.7,
                    textAlign: "left",
                    whiteSpace: "pre-line",
                  }}
                >
                  {challenge.question.split("\n").map((line: string, i: number) => {
                    const m = line.match(
                      /^(\s*)(ด่าน\s*:|เรื่องราว:|สูตร PIN:|สูตร OTP:|ข้อมูล:|ตัวอย่าง:|📋 สร้าง JSON:|🎯 ภารกิจ:|คำใบ้:)(.*)$/
                    );
                    if (m) {
                      return (
                        <div key={i} style={{ textAlign: "left" }}>
                          <strong>{m[2]}</strong>
                          {m[3]}
                        </div>
                      );
                    }
                    return (
                      <div key={i} style={{ textAlign: "left" }}>
                        {line}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div
                style={{
                  background: "#f0f9ff",
                  padding: "10px 20px",
                  borderRadius: 12,
                  marginBottom: 40,
                }}
              >
                <span style={{ fontSize: 14, color: "var(--muted)", marginRight: 10 }}>
                  ตัวอย่างรูปแบบ:
                </span>
                <code
                  style={{
                    fontSize: 16,
                    fontFamily: "var(--mono)",
                    color: "var(--accent)",
                  }}
                >
                  {challenge.example}
                </code>
              </div>
            </>
          )}

          {!flag && (
            <div style={{ width: "100%", maxWidth: 500 }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="กรอกคำตอบ..."
                autoFocus
                style={{
                  width: "100%",
                  padding: 20,
                  fontSize: 32,
                  textAlign: "center",
                  borderRadius: 24,
                  border: "3px solid var(--border)",
                  outline: "none",
                  fontFamily: "var(--mono)",
                  marginBottom: 20,
                }}
                onKeyDown={(e) => e.key === "Enter" && verify()}
              />

              <div className="row" style={{ justifyContent: "center" }}>
                <button
                  onClick={verify}
                  className="btn btnPrimary"
                  disabled={loading}
                  style={{ padding: "16px 48px", fontSize: 22, borderRadius: 99 }}
                >
                  {loading ? "กำลังตรวจสอบ..." : "ยืนยันคำตอบ"}
                </button>
              </div>
            </div>
          )}

          {msg && msg.text && (
            <div
              style={{
                marginTop: 40,
                padding: 30,
                width: "100%",
                maxWidth: 700,
                background: msg.type === "ok" ? "#dcfce7" : "#fee2e2",
                color: msg.type === "ok" ? "#166534" : "#991b1b",
                borderRadius: 24,
                fontSize: 20,
                lineHeight: 1.6,
              }}
            >
              {msg.text}
              {flag && (
                <div
                  style={{
                    marginTop: 20,
                    fontSize: 32,
                    fontWeight: "bold",
                    fontFamily: "var(--mono)",
                    padding: 20,
                    border: "2px dashed #166534",
                    borderRadius: 16,
                  }}
                >
                  {flag}
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: 60, display: "flex", gap: 20 }}>
            {!flag && (
              <button
                onClick={getChallenge}
                className="btn"
                style={{ color: "var(--muted)" }}
              >
                <RefreshCw size={20} />
                สุ่มโจทย์ใหม่
              </button>
            )}
            <button
              onClick={() => {
                setStage("default");
                setHintStep(0);
                setInput("");
                setMsg(null);
                setFlag(null);
                setChallenge(null);
                setLoading(false);
                setHintsCompleted(0);
              }}
              className="btn"
            >
              <ArrowLeft size={20} />
              {flag ? "ปิดและกลับ" : "ยกเลิก"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Default Stage ---
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", paddingBottom: 60 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <a
          href="/files"
          className="btn"
          style={{ padding: "8px 16px", background: "transparent", border: "none" }}
        >
          <ArrowLeft size={20} /> ย้อนกลับ
        </a>
      </div>

      <div className="hero" style={{ marginBottom: 30, padding: 30 }}>
        <h1>คดี B: การยืนยันตัวตน</h1>
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 10 }}>
          <ShieldCheck size={24} style={{ color: "var(--accent)" }} />
          <p style={{ margin: 0 }}>Authentication Protocol</p>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <Card
          title="ต้องมีการยืนยันตัวตน"
          subtitle="ระบบต้องการให้คุณยืนยันว่าเป็นเจ้าหน้าที่ตัวจริง"
          icon={<ShieldCheck />}
        >
          <div
            style={{
              background: "var(--accentLight)",
              padding: 30,
              borderRadius: 20,
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: 18,
                marginBottom: 30,
                color: "var(--text)",
                lineHeight: 1.6,
              }}
            >
              ตัวเลือกการยืนยันตัวตน:<br />
              <span style={{ opacity: 0.8 }}>PIN, OTP, Biometric, Location, MFA</span>
            </p>

            <button
              className="btn btnPrimary"
              onClick={() => setStage("hintGame")}
              style={{
                fontSize: 24,
                padding: "20px 40px",
                boxShadow: "0 20px 40px -10px var(--accentGlow)",
              }}
            >
              เริ่มเกมหาคำใบ้
            </button>
          </div>

          <div className="grid grid3" style={{ marginTop: 40, opacity: 0.6 }}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <KeyRound size={32} />
              </div>
              <div style={{ fontWeight: 600 }}>Knowledge</div>
              <div style={{ fontSize: 13 }}>รหัสผ่าน, PIN</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <Smartphone size={32} />
              </div>
              <div style={{ fontWeight: 600 }}>Possession</div>
              <div style={{ fontSize: 13 }}>OTP, อุปกรณ์พกพา</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <Fingerprint size={32} />
              </div>
              <div style={{ fontWeight: 600 }}>Inherence</div>
              <div style={{ fontSize: 13 }}>ลายนิ้วมือ, ใบหน้า</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
