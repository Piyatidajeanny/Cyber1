"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  Calculator,
  Flag,
  CheckCircle2,
  ArrowLeft,
  Projector,
  Lock,
  Key,
  ShieldCheck,
  Network,
  RefreshCw,
  Zap,
  Search,
  ArrowRight,
  Shield,
} from "lucide-react";

type Stage = 1 | 2 | 3 | 4;

function letterValueAZ(ch: string) {
  const c = ch.toUpperCase();
  const code = c.charCodeAt(0);
  if (code < 65 || code > 90) return 0;
  return code - 64; // A=1..Z=26
}

function checksumWord(word: string) {
  return word.split("").reduce((sum, ch) => sum + letterValueAZ(ch), 0);
}

// Hash แบบ mod 10 (collision)
function hashMod10(word: string) {
  return checksumWord(word) % 10;
}

// Caesar shift เดินหน้า (A-Z)
function caesarShiftForward(text: string, shift: number) {
  const s = ((shift % 26) + 26) % 26;
  return text
    .toUpperCase()
    .replace(/[A-Z]/g, (ch) => {
      const x = ch.charCodeAt(0) - 65;
      return String.fromCharCode(65 + ((x + s) % 26));
    });
}

function HintBox({ hints }: { hints: Array<{ title: string; text: string }> }) {
  const [level, setLevel] = useState(0);

  return (
    <div className="hint" style={{ marginTop: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: level > 0 ? 10 : 0,
        }}
      >
        <strong style={{ color: "#b45309" }}>💡 ระบบคำใบ้</strong>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setLevel((v) => Math.min(v + 1, hints.length))}
            className="btn"
            style={{ padding: "4px 12px", fontSize: 13, height: 32 }}
          >
            เปิดคำใบ้ ({level}/{hints.length})
          </button>
          {level > 0 && (
            <button
              onClick={() => setLevel(0)}
              className="btn"
              style={{ padding: "4px 12px", fontSize: 13, height: 32 }}
            >
              ปิด
            </button>
          )}
        </div>
      </div>

      {level === 0 ? (
        <div style={{ opacity: 0.6, fontSize: 14 }}>
          ติดตรงไหน? เปิดดูคำใบ้ได้เลย
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {hints.slice(0, level).map((h, idx) => (
            <div
              key={idx}
              style={{
                padding: "12px",
                background: "rgba(255,255,255,0.6)",
                borderRadius: 12,
              }}
            >
              <strong
                style={{
                  fontSize: 13,
                  display: "block",
                  marginBottom: 2,
                  color: "var(--accent)",
                }}
              >
                {h.title}
              </strong>
              <span style={{ fontSize: 14, opacity: 0.9 }}>{h.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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

export default function Page() {
  const [stage, setStage] = useState<Stage>(1);

  // collected pieces
  const [piece1, setPiece1] = useState<string | null>(null); // AN
  const [piece2, setPiece2] = useState<string | null>(null); // AI
  const [piece3, setPiece3] = useState<string | null>(null); // PJR

  const pieces = useMemo(
    () => [piece1, piece2, piece3].filter(Boolean) as string[],
    [piece1, piece2, piece3]
  );

  const progress = useMemo(() => {
    const done = (piece1 ? 1 : 0) + (piece2 ? 1 : 0) + (piece3 ? 1 : 0);
    return Math.round((done / 3) * 100);
  }, [piece1, piece2, piece3]);

  function resetAll() {
    if (!confirm("ต้องการเริ่มใหม่ทั้งหมดหรือไม่?")) return;
    setStage(1);
    setPiece1(null);
    setPiece2(null);
    setPiece3(null);

    setS1Input("");
    setS1Msg(null);

    setS2Picks([]);
    setS2Msg(null);
    setS2Attempts(0);
    setS2SetIdx(0);

    // Stage 3 Reset
    setS3Input("");
    setS3Msg(null);

    setFinalInput("");
    setFinalMsg(null);
  }

  // ===== State definitions =====
  const [s1Input, setS1Input] = useState("");
  const [s1Msg, setS1Msg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  // ===== Stage 2 = salted hash collision + anti bruteforce =====
  const [s2Picks, setS2Picks] = useState<string[]>([]);
  const [s2Msg, setS2Msg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );
  const [s2Attempts, setS2Attempts] = useState(0);
  const [s2SetIdx, setS2SetIdx] = useState(0);

  // ===== Stage 3: The Blackboard Enigma =====
  const [s3Input, setS3Input] = useState("");
  const [s3Msg, setS3Msg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  function submitS3() {
    const ans = s3Input.trim().toUpperCase();
    if (ans !== "PJR") {
      return setS3Msg({ type: "err", text: "คำตอบไม่ถูกต้อง! ลองตรวจสอบตัวแปรและการคำนวณอีกครั้ง" });
    }
    setPiece3("PJR");
    setS3Msg({ type: "ok", text: "ถูกต้อง! (Key Found: PJR)" });
    setTimeout(() => setStage(4), 2000);
  }

  const [finalInput, setFinalInput] = useState("");
  const [finalMsg, setFinalMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  const canGoFinal = piece1 && piece2 && piece3;

  // ===== Config =====
  const stage1Cipher = "ER";
  const stage1Expected = "AN";

  // Stage 2 Configuration
  const wordSets = [
    ["DATA", "HASH", "ROOM", "CODE", "SIGN", "LAB"], // DATA(6), HASH(6)
    ["KEY", "LOCK", "USER", "PASS", "WIFI", "BYTE"], // KEY(1), LOCK(1)
    ["PERL", "CSS", "NODE", "JAVA", "RUBY", "HTML"], // PERL(1), CSS(1)
    ["RISK", "TIME", "GIFT", "HERO", "PLAN", "ZONE"], // RISK(7), TIME(7)
  ];
  const stage2Mod = 10;

  function togglePick2(word: string) {
    setS2Msg(null);
    setS2Picks((prev) => {
      if (prev.includes(word)) return prev.filter((x) => x !== word);
      if (prev.length >= 2) return [prev[1], word];
      return [...prev, word];
    });
  }

  // ===== Submits =====
  function submitStage1() {
    const answer = s1Input.trim().toUpperCase();
    if (!answer) return setS1Msg({ type: "err", text: "กรุณากรอกคำตอบ" });
    if (answer !== stage1Expected)
      return setS1Msg({ type: "err", text: "ยังไม่ถูก ลองดูใหม่" });

    setPiece1("AN");
    setS1Msg({ type: "ok", text: "ถูกต้อง! ได้รับชิ้นส่วน: AN" });
    setTimeout(() => setStage(2), 800);
  }

  function submitStage2() {
    if (s2Picks.length !== 2) {
      return setS2Msg({ type: "err", text: "ต้องเลือกให้ครบ 2 คำ เพื่อทำ Collision" });
    }
    const [w1, w2] = s2Picks;
    if (w1 === w2) {
      return setS2Msg({ type: "err", text: "ต้องเป็น 2 คำที่ต่างกัน" });
    }

    const salt = checksumWord(piece1 || "");
    const h1 = (hashMod10(w1) + salt) % 10;
    const h2 = (hashMod10(w2) + salt) % 10;

    if (h1 !== h2) {
      const nextAttempts = s2Attempts + 1;
      setS2Attempts(nextAttempts);

      if (nextAttempts >= 3) {
        let nextSet = Math.floor(Math.random() * wordSets.length);
        if (nextSet === s2SetIdx) nextSet = (nextSet + 1) % wordSets.length;

        setS2SetIdx(nextSet);
        setS2Attempts(0);
        setS2Picks([]);
        return setS2Msg({
          type: "err",
          text: "⚠️ ผิดเกิน 3 ครั้ง! ระบบรีเซ็ตชุดคำศัพท์ใหม่ (Anti-Bruteforce Active)",
        });
      }

      return setS2Msg({
        type: "err",
        text: `ยังไม่ชนกัน (ครั้งที่ ${nextAttempts}/3): ลองคำนวณใหม่ (อย่าลืมรวม Salt)`,
      });
    }

    setPiece2("AI");
    setS2Msg({ type: "ok", text: `Collision สำเร็จ! ได้รับชิ้นส่วน: AI` });
    setTimeout(() => setStage(3), 900);
  }

  async function submitFinal() {
    // รองรับคำตอบภาษาไทย + เว้นวรรค
    const ans = finalInput.trim().replace(/\s+/g, " ").normalize("NFC");

    try {
      const res = await fetch("/api/evidence/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: "A", input: ans }),
      });
      const j = await res.json();
      if (j.ok) setFinalMsg({ type: "ok", text: j.message || "ไขคดีสำเร็จ!" });
      else setFinalMsg({ type: "err", text: j.message || "คำตอบยังไม่ถูกต้อง" });
    } catch (e) {
      setFinalMsg({ type: "err", text: "เกิดข้อผิดพลาดในการเชื่อมต่อ" });
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

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", paddingBottom: 60 }}>
      {/* Top Header / Nav */}
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

        <div style={{ display: "flex", gap: 6 }}>
          {([1, 2, 3, 4] as Stage[]).map((s) => (
            <div
              key={s}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: stage === s ? "var(--accent)" : "var(--border)",
              }}
            />
          ))}
        </div>

        {progress > 0 && (
          <button onClick={resetAll} className="btn" style={{ fontSize: 12, height: 32 }}>
            เริ่มใหม่
          </button>
        )}
      </div>

      <div className="hero" style={{ marginBottom: 30, padding: 30 }}>
        <h1>Case A: ลายเซ็นเงา</h1>
        <p style={{ margin: "10px 0 20px" }}>ตามหาชิ้นส่วนรหัสลับ 3 ชิ้น จากปริศนาในห้องเรียน</p>

        {/* Status Bar inside Hero */}
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
          <StatusPill label="ชิ้นที่ 1" val={piece1} />
          <StatusPill label="ชิ้นที่ 2" val={piece2} />
          <StatusPill label="ชิ้นที่ 3" val={piece3} />
        </div>
      </div>

      {/* Main Single Column Stage */}
      <div>
        {stage === 1 && (
          <Card
            title="ด่าน 1: ห้องเรียนที่หายไป? (The Missing Seat)"
            subtitle="ภารกิจ: ค้นหาหมายเลขโต๊ะที่หายไปเพื่อถอดรหัส"
            icon={<Projector />}
          >
            <div className="fade-in">
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 20,
                justifyContent: 'center',
                alignItems: 'center', // Center vertically
                marginBottom: 24
              }}>
                {/* Screen 1: The Cipher */}
                <div style={{
                  width: 240,
                  height: 240,
                  background: '#1e293b',
                  padding: 20,
                  borderRadius: 16, // Match right side
                  border: '4px solid #475569',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <div style={{
                    color: '#ef4444',
                    fontSize: 64, // Bigger font
                    fontWeight: 900,
                    letterSpacing: 4,
                    fontFamily: 'monospace',
                    textShadow: '0 0 15px rgba(239,68,68,0.6)'
                  }}>
                    {stage1Cipher}
                  </div>
                  <div style={{
                    marginTop: 20,
                    color: '#94a3b8',
                    fontSize: 12,
                    borderTop: '1px solid #334155',
                    paddingTop: 10,
                    width: '100%',
                    fontStyle: 'italic'
                  }}>
                    &quot;จงเดินถอยหลัง... สู่ความสำเร็จ&quot;
                  </div>
                </div>

                {/* Screen 2: The Grid */}
                <div style={{
                  width: 240,
                  height: 240,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gridTemplateRows: 'repeat(4, 1fr)', // Ensure square rows
                  gap: 8,
                  padding: 12,
                  background: '#334155',
                  borderRadius: 16,
                  boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)'
                }}>
                  {[
                    11, 2, 15, 8,
                    1, 13, 6, 9,
                    14, null, 16, 5,
                    12, 3, 10, 7
                  ].map((num, i) => (
                    <div key={i} style={{
                      width: '100%',
                      height: '100%',
                      background: num === null ? 'rgba(255,255,255,0.05)' : '#475569',
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: num === null ? 'transparent' : '#f8fafc',
                      fontWeight: 'bold',
                      fontSize: 18,
                      border: num === null ? '2px dashed #64748b' : 'none',
                      boxShadow: num !== null ? '0 3px 0 #1e293b' : 'none',
                    }}>
                      {num}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ maxWidth: 300, margin: '0 auto' }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#475569' }}>รหัสที่ถอดได้ (Decrypted):</label>
                <input
                  style={inputCss}
                  placeholder="คำตอบ..."
                  value={s1Input}
                  onChange={e => setS1Input(e.target.value)}
                />
                <button onClick={submitStage1} className="btn btnPrimary" style={{ width: '100%', marginTop: 16 }}>
                  ปลดล็อคประตูด่านถัดไป
                </button>
              </div>

              {s1Msg && <AlertMsg type={s1Msg.type} text={s1Msg.text} />}
            </div>
          </Card>
        )}

        {/* ===================== STAGE 2: SALTED HASH (BLUE PROTOCOL) ===================== */}
        {
          stage === 2 && (
            <Card
              title="ด่าน 2: กำจัดข้อมูลแฝด (Doppelgänger Purge)"
              subtitle="ภารกิจ: ระบบตรวจพบข้อมูลปลอมที่มี 'ลายเซ็น' (Signature) ซ้ำกับตัวจริง จงค้นหาและกำจัดมัน!"
              icon={<Network />}
            >
              <div className="fade-in">
                {/* Header: Blockchain Status */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 24,
                  color: 'white',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}>
                  <div style={{ marginRight: 20, padding: 12, background: 'rgba(56, 189, 248, 0.1)', borderRadius: '50%' }}>
                    <Lock size={32} color="#38bdf8" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8', marginBottom: 4 }}>
                      A=1, B=2, …, Z=26 
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ color: '#38bdf8' }}>{piece1 || "NULL"}</span>
                      <span style={{ fontSize: 14, fontWeight: 'normal', background: '#334155', padding: '2px 8px', borderRadius: 4 }}>
                        Salted: {checksumWord(piece1 || "")}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Protocol Hint</div>
                    <div style={{ fontFamily: 'monospace', color: '#e2e8f0', fontSize: 13, fontStyle: 'italic' }}>
                      "รวมพลังกับเกลือ...<br />เหลือเพียงเศษเสี้ยวแห่งสิบ"
                    </div>
                  </div>
                </div>

                {/* Main Interaction Area */}
                <div style={{ background: "#f0f9ff", borderRadius: 20, padding: 24, border: "1px solid #bae6fd" }}>
                  <h4 style={{ marginBottom: 16, color: '#0369a1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>ระบุคู่ข้อมูลที่มีค่า Signature ตรงกัน (Collision):</span>
                    <span style={{ fontSize: 12, fontWeight: 'normal', color: '#0ea5e9' }}>
                      Scan Attempts: {s2Attempts}/3
                    </span>
                  </h4>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                    {wordSets[s2SetIdx].map((w) => {
                      const active = s2Picks.includes(w);
                      const currentSalt = checksumWord(piece1 || "");
                      const hashVal = (checksumWord(w) + currentSalt) % stage2Mod;

                      return (
                        <button
                          key={w}
                          onClick={() => togglePick2(w)}
                          className="btn"
                          style={{
                            height: 100,
                            flexDirection: "column",
                            justifyContent: "center",
                            border: active ? "2px solid #38bdf8" : "2px solid white",
                            background: active ? "#e0f2fe" : "white",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                            borderRadius: 12,
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.2s ease',
                            color: '#0369a1'
                          }}
                        >


                          <span style={{ fontSize: 20, fontWeight: 800 }}>{w}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: 24, display: "flex", flexDirection: 'column', gap: 16, alignItems: "center" }}>

                    {/* Selected Summary */}
                    <div style={{
                      display: 'flex',
                      gap: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'white',
                      padding: '10px 24px',
                      borderRadius: 50,
                      border: '1px solid #bae6fd',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                      {s2Picks.length === 0 && <span style={{ color: '#94a3b8' }}>เลือกคู่ข้อมูลที่น่าสงสัย...</span>}
                      {s2Picks.map((p, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {i > 0 && <span style={{ color: '#cbd5e1' }}>+</span>}
                          <span style={{ fontWeight: 'bold', color: '#0ea5e9' }}>{p}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="row" style={{ justifyContent: "center", gap: 16, width: '100%' }}>
                      <button onClick={() => setStage(1)} className="btn" style={{ color: '#64748b' }}>
                        <ArrowLeft size={16} style={{ marginRight: 4 }} /> ย้อนกลับ
                      </button>
                      <button
                        onClick={submitStage2}
                        className="btn"
                        style={{
                          background: s2Picks.length === 2 ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' : '#cbd5e1',
                          color: 'white',
                          padding: '12px 32px',
                          borderRadius: 12,
                          fontWeight: 'bold',
                          boxShadow: s2Picks.length === 2 ? '0 10px 15px -3px rgba(14, 165, 233, 0.4)' : 'none',
                          cursor: s2Picks.length === 2 ? 'pointer' : 'not-allowed',
                          border: 'none',
                          flex: 1,
                          maxWidth: 200
                        }}
                      >
                        ยืนยันการกำจัดคู่แฝด
                      </button>
                    </div>
                  </div>

                  {s2Msg && <AlertMsg type={s2Msg.type} text={s2Msg.text} />}
                </div>
              </div>
            </Card>
          )
        }

        {/* ===================== STAGE 3: THE LOGIC GATE (PREMIUM DESIGN) ===================== */}
        {stage === 3 && (
          <Card
            title="ด่าน 3: การบ้านวิชาลับ (The Blackboard Enigma)"
            subtitle="ภารกิจ: แก้โจทย์ลับเพื่อค้นหารหัสผ่านของหัวหน้าห้อง"
            icon={<Zap />}
          >
            <div style={{
              background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)", // Subtle gradient bg
              padding: "40px",
              borderRadius: "24px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 20px 40px -10px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)",
              position: "relative",
              overflow: "hidden"
            }}>

              {/* Abstract decorative background */}
              <div style={{
                position: 'absolute',
                top: -50, right: -50,
                width: 200, height: 200,
                background: 'linear-gradient(to bottom left, #bfdbfe 0%, transparent 60%)',
                borderRadius: '50%',
                opacity: 0.4,
                zIndex: 0,
                filter: 'blur(40px)'
              }} />
              <div style={{
                position: 'absolute',
                bottom: -50, left: -50,
                width: 250, height: 250,
                background: 'linear-gradient(to top right, #e9d5ff 0%, transparent 60%)',
                borderRadius: '50%',
                opacity: 0.4,
                zIndex: 0,
                filter: 'blur(40px)'
              }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <h2 style={{
                  textAlign: "center",
                  marginBottom: "36px",
                  color: "#1e293b",
                  fontSize: "26px",
                  fontWeight: 800,
                  letterSpacing: -0.5,
                  background: "linear-gradient(to right, #1e293b, #475569)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  display: 'inline-block',
                  width: '100%'
                }}>
                  "Who is the Secret Class Monitor?"
                </h2>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 32
                }}>
                  {/* Variables Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: 16,
                    width: '100%',
                    maxWidth: 700
                  }}>
                    {[
                      { label: "Variable A", val: "8", color: "#3b82f6", bg: "#eff6ff" },
                      { label: "Variable b", val: "15", color: "#8b5cf6", bg: "#f5f3ff" },
                      { label: "Modulo p", val: "23", color: "#10b981", bg: "#ecfdf5" },
                      { label: "Target Cipher", val: "\"RLT\"", color: "#f43f5e", bg: "#fff1f2" }
                    ].map((item, idx) => (
                      <div key={idx} className="variable-card" style={{
                        background: "rgba(255,255,255,0.8)",
                        backdropFilter: "blur(8px)",
                        padding: "24px 16px",
                        borderRadius: 20,
                        textAlign: 'center',
                        border: '1px solid #f1f5f9',
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02), 0 10px 15px -3px rgba(0,0,0,0.02)",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        overflow: 'hidden',
                        position: 'relative'
                      }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = "translateY(-4px)";
                          e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0,0,0,0.08), 0 10px 10px -5px rgba(0,0,0,0.04)";
                          e.currentTarget.style.borderColor = item.color;
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0,0,0,0.02)";
                          e.currentTarget.style.borderColor = "#f1f5f9";
                        }}
                      >
                        <div style={{
                          width: 40, height: 4, background: item.color, margin: '0 auto 16px', borderRadius: 2
                        }} />
                        <div style={{ color: "#64748b", fontSize: 13, marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</div>
                        <div style={{ color: "#0f172a", fontSize: 24, fontWeight: 800 }}>{item.val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Input Area */}
                  <div style={{
                    marginTop: 10,
                    width: '100%',
                    maxWidth: 420,
                    textAlign: 'center',
                    background: "rgba(255,255,255,0.5)",
                    padding: 30,
                    borderRadius: 30,
                  }}>
                    <label style={{
                      color: "#475569",
                      fontSize: 14,
                      fontWeight: 700,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      marginBottom: 16,
                      display: 'block'
                    }}>
                      ENTER SOLUTION
                    </label>

                    <div style={{ position: 'relative', marginBottom: 20 }}>
                      <input
                        value={s3Input}
                        onChange={e => setS3Input(e.target.value)}
                        placeholder="ANSWER"
                        style={{
                          width: "100%",
                          background: "#fff",
                          border: "2px solid #e2e8f0",
                          borderRadius: 16,
                          padding: "18px",
                          fontSize: 22,
                          textAlign: "center",
                          color: "#1e293b",
                          fontWeight: 700,
                          outline: "none",
                          transition: "all 0.2s",
                          letterSpacing: 3,
                          textTransform: 'uppercase'
                        }}
                        onFocus={e => {
                          e.target.style.borderColor = "#6366f1";
                          e.target.style.boxShadow = "0 0 0 4px rgba(99, 102, 241, 0.1)";
                        }}
                        onBlur={e => {
                          e.target.style.borderColor = "#e2e8f0";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </div>

                    <button
                      onClick={submitS3}
                      className="btn"
                      style={{
                        width: '100%',
                        background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
                        color: "#fff",
                        border: "none",
                        padding: "16px",
                        fontSize: 16,
                        borderRadius: 16,
                        cursor: "pointer",
                        fontWeight: 700,
                        boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.5)",
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <span>SUBMIT ANSWER</span> <ArrowRight size={18} />
                    </button>
                  </div>
                </div>

                {s3Msg && (
                  <div className="fade-in" style={{
                    marginTop: 32,
                    padding: "16px 24px",
                    background: s3Msg.type === 'err' ? '#fef2f2' : '#f0fdf4',
                    border: s3Msg.type === 'err' ? '1px solid #fecaca' : '1px solid #bbf7d0',
                    borderRadius: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
                  }}>
                    {s3Msg.type === 'err' ? <Shield size={20} color="#ef4444" /> : <ShieldCheck size={20} color="#16a34a" />}
                    <span style={{
                      color: s3Msg.type === 'err' ? '#ef4444' : '#16a34a',
                      fontWeight: 700,
                      fontSize: 15
                    }}>
                      {s3Msg.text}
                    </span>
                  </div>
                )}

                <div style={{ marginTop: 40 }}>
                  <HintBox
                    hints={[
                      { title: "การย้อนเวลา (Time Reversal)", text: "รหัสลับ 'RLT' ถูกบิดเบือนไปข้างหน้า... หากต้องการความจริง จงเดินถอยหลังกลับไปตามจำนวนกุญแจที่ไขได้" }
                    ]}
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {stage === 4 && (
          <Card
            title="Final: รหัสลับสุดท้าย"
            subtitle="รวมชิ้นส่วนทั้งหมดเข้าด้วยกัน ตอบเป็นภาษาไทย"
            icon={<Flag />}
          >
            <div
              style={{
                display: "flex",
                gap: 16,
                flexWrap: "wrap",
                marginBottom: 40,
                justifyContent: "center",
              }}
            >
              {[piece1, piece2, piece3].map((p, i) => (
                <div
                  key={i}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 20,
                    background: p ? "#dcfce7" : "#f1f5f9",
                    color: p ? "#166534" : "#cbd5e1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 24,
                    border: p ? "3px solid #bbf7d0" : "3px dashed #e2e8f0",
                  }}
                >
                  {p || "?"}
                </div>
              ))}
            </div>

            {!canGoFinal ? (
              <div style={{ textAlign: "center", padding: 40, opacity: 0.6 }}>
                <p>ชิ้นส่วนยังไม่ครบ กลับไปหาให้ครบก่อน</p>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20 }}>
                  <button onClick={() => setStage(1)} className="btn">
                    กลับไปด่าน 1
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ maxWidth: 400, margin: "0 auto" }}>
                <input
                  value={finalInput}
                  onChange={(e) => setFinalInput(e.target.value)}
                  placeholder="คำตอบสุดท้าย"
                  style={{
                    ...inputCss,
                    textAlign: "center",
                  }}
                />
                <div style={{ marginTop: 20 }}>
                  <button
                    onClick={submitFinal}
                    className="btn"
                    style={{
                      width: "100%",
                      padding: 14,
                      fontSize: 18,
                      background: 'var(--accent)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 12
                    }}
                  >
                    ส่งคำตอบสุดท้าย
                  </button>
                </div>
                {finalMsg && (
                  <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                    <AlertMsg type={finalMsg.type} text={finalMsg.text} />
                    {finalMsg.type === "ok" && (
                      <a
                        href="/files/b"
                        className="btn"
                        style={{
                          background: "#10b981",
                          color: "white",
                          padding: "14px",
                          borderRadius: 12,
                          textAlign: "center",
                          fontWeight: "bold",
                          textDecoration: "none",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: 8,
                          boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.2)",
                        }}
                      >
                        ไปต่อที่ Case B <ArrowRight size={20} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
        )}
      </div>
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

function AlertMsg({ type, text }: { type: string; text: string }) {
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