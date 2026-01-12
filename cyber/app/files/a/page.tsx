"use client";

import React, { useMemo, useState } from "react";
import {
  Projector,
  Calculator,
  KeyRound,
  Flag,
  CheckCircle2,
  ArrowLeft,
  FileText,
} from "lucide-react";

type Stage = 1 | 2 | 3 | 4;


function letterValueAZ(ch: string) {
  const c = ch.toUpperCase();
  const code = c.charCodeAt(0);
  if (code < 65 || code > 90) return 0;
  return code - 64; // A=1..Z=26
}

function checksumWord(word: string) {
  return word
    .split("")
    .reduce((sum, ch) => sum + letterValueAZ(ch), 0);
}

// ===== NEW: Hash แบบ mod 10 (collision) =====
function hashMod10(word: string) {
  return checksumWord(word) % 10;
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

    setS3SecretInput("");
    setS3Unlocked(false);
    setS3Initials("");
    setS3Msg(null);

    setFinalInput("");
    setFinalMsg(null);
  }

  // ===== State definitions =====
  const [s1Input, setS1Input] = useState("");
  const [s1Msg, setS1Msg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  // ===== NEW: Stage 2 = เลือก 2 คำให้ hash ชนกัน =====
  const [s2Picks, setS2Picks] = useState<string[]>([]);
  const [s2Msg, setS2Msg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );
  const [s2Attempts, setS2Attempts] = useState(0);
  const [s2SetIdx, setS2SetIdx] = useState(0);

  // ===== NEW: Stage 3 = Digital Handshake =====
  const [s3SecretInput, setS3SecretInput] = useState("");
  const [s3Unlocked, setS3Unlocked] = useState(false);
  const [s3Initials, setS3Initials] = useState("");
  const [s3Msg, setS3Msg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  const [finalInput, setFinalInput] = useState("");
  const [finalMsg, setFinalMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  const canGoFinal = piece1 && piece2 && piece3;

  // ===== Config =====
  const stage1Cipher = "ER";
  const stage1Credits = 4;
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
      if (prev.length >= 2) {
        return [prev[1], word];
      }
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

  // ===== NEW: Stage 2 submit = collision with Anti-Bruteforce =====
  function submitStage2() {
    if (s2Picks.length !== 2) {
      return setS2Msg({ type: "err", text: "ต้องเลือกให้ครบ 2 คำ เพื่อทำ Collision" });
    }
    const [w1, w2] = s2Picks;
    if (w1 === w2) {
      return setS2Msg({ type: "err", text: "ต้องเป็น 2 คำที่ต่างกัน" });
    }

    const h1 = hashMod10(w1);
    const h2 = hashMod10(w2);

    if (h1 !== h2) {
      const nextAttempts = s2Attempts + 1;
      setS2Attempts(nextAttempts);

      if (nextAttempts >= 3) {
        // Change set to prevent bruteforce
        let nextSet = Math.floor(Math.random() * wordSets.length);
        if (nextSet === s2SetIdx) nextSet = (nextSet + 1) % wordSets.length;

        setS2SetIdx(nextSet);
        setS2Attempts(0);
        setS2Picks([]);
        return setS2Msg({
          type: "err",
          text: "⚠️ ผิดเกิน 3 ครั้ง! ระบบรีเซ็ตชุดคำศัพท์ใหม่ (Anti-Bruteforce Active)"
        });
      }

      return setS2Msg({
        type: "err",
        text: `ยังไม่ชนกัน (ครั้งที่ ${nextAttempts}/3): ลองคำนวณใหม่`,
      });
    }

    setPiece2("AI");
    setS2Msg({
      type: "ok",
      text: `Collision สำเร็จ! ได้รับชิ้นส่วน: AI`,
    });
    setTimeout(() => setStage(3), 900);
  }

  function submitStage3() {
    if (!s3Unlocked) {
      return setS3Msg({ type: "err", text: "กรุณา Verify Key Exchange ให้ผ่านก่อน" });
    }

    const ans = s3Initials.trim().toUpperCase().replace(/\s+/g, "");
    if (ans !== "PJR") {
      return setS3Msg({
        type: "err",
        text: `รหัสไม่ถูกต้อง ไม่ใช่ "${ans}" ลองตรวจสอบไฟล์ที่มี Signature ตรงกับ Hash+Secret ดูใหม่`,
      });
    }

    setPiece3("PJR");
    setS3Msg({ type: "ok", text: "ถูกต้อง! ได้รับชิ้นส่วน: PJR" });
    setTimeout(() => setStage(4), 900);
  }

  async function submitFinal() {
    const ans = finalInput.trim().toUpperCase().replace(/\s+/g, "");
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
        <p style={{ margin: "10px 0 20px" }}>
          ตามหาชิ้นส่วนรหัสลับ 3 ชิ้น จากปริศนาในห้องเรียน
        </p>

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
            title="ด่าน 1: โปรเจกเตอร์ปริศนา"
            subtitle="อาจารย์ทิ้งข้อความไว้บนสไลด์..."
            icon={<Projector />}
          >
            <div className="row" style={{ marginBottom: 20 }}>
              <span className="stamp">หน่วยกิต: {stage1Credits}</span>
              <span className="stamp">สไลด์: {stage1Cipher}</span>
            </div>

            <div
              style={{
                background: "var(--accentLight)",
                padding: 30,
                borderRadius: 20,
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              <p style={{ margin: "0 0 20px", fontSize: 18, color: "var(--accentHover)" }}>
                ถ้าเกรดเฟ้อ ให้ลดระดับลงตามจำนวน <b>หน่วยกิต</b>
                <br />
                <br />
                <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: 2 }}>
                  {stage1Cipher}
                </span>
              </p>

              <div style={{ display: "flex", gap: 10, maxWidth: 400, margin: "0 auto" }}>
                <input
                  value={s1Input}
                  onChange={(e) => setS1Input(e.target.value)}
                  placeholder="คำตอบ"
                  style={{ ...inputCss, textAlign: "center" }}
                  maxLength={4}
                />
              </div>

              <div style={{ marginTop: 16 }}>
                <button
                  onClick={submitStage1}
                  className="btn btnPrimary"
                  style={{ width: "100%", maxWidth: 200 }}
                >
                  ตรวจคำตอบ
                </button>
              </div>

              {s1Msg && <AlertMsg type={s1Msg.type} text={s1Msg.text} />}
            </div>
          </Card>
        )}

        {/* ===================== NEW STAGE 2 ===================== */}
        {stage === 2 && (
          <Card
            title="ด่าน 2: Hash Collision เช็คชื่อ"
            subtitle="เลือกคำที่ทำให้ค่า Hash ชนกัน (Collision) เพื่อปลดล็อก"
            icon={<Calculator />}
          >
            <div className="row" style={{ marginBottom: 14 }}>
              <span className="stamp">
                กติกา: H(word) = (ผลรวม A=1..Z=26) mod {stage2Mod}
              </span>
            </div>

            <div style={{ background: "white", borderRadius: 16, padding: 16, border: "2px solid var(--border)" }}>
              <div style={{ fontSize: 14, opacity: 0.85, marginBottom: 10 }}>

              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 12,
                }}
              >
                {wordSets[s2SetIdx].map((w) => {
                  const active = s2Picks.includes(w);
                  return (
                    <button
                      key={w}
                      onClick={() => togglePick2(w)}
                      className="btn"
                      style={{
                        height: 110,
                        flexDirection: "column",
                        justifyContent: "center",
                        borderColor: active ? "var(--accent)" : "var(--border)",
                        background: active ? "var(--accentLight)" : "white",
                        boxShadow: active ? "var(--shadowHover)" : "none",
                        transform: active ? "scale(1.03)" : "scale(1)",
                      }}
                    >
                      <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: 1 }}>{w}</span>
                    </button>
                  );
                })}
              </div>

              <div style={{ marginTop: 14, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <span className="badge">
                  เลือกแล้ว: {s2Picks.length ? s2Picks.join(" + ") : "ยังไม่เลือก"}
                </span>
              </div>

              <div className="row" style={{ justifyContent: "center", gap: 20, marginTop: 16 }}>
                <button onClick={() => setStage(1)} className="btn">
                  ย้อนกลับ
                </button>
                <button onClick={submitStage2} className="btn btnPrimary" style={{ minWidth: 200 }}>
                  ยืนยัน Collision
                </button>
              </div>

              {s2Msg && <AlertMsg type={s2Msg.type} text={s2Msg.text} />}

            </div>
          </Card>
        )}

        {/* ===================== NEW STAGE 3 ===================== */}
        {stage === 3 && (
          <Card
            title="ด่าน 3: The Silent Handshake"
            subtitle="จูนคลื่นความถี่ลับและกู้คืนไฟล์จากสัญญาณที่ถูกเข้ารหัส"
            icon={<KeyRound />}
          >
            {/* Story / Intro */}
            <div style={{ marginBottom: 24, fontSize: 15, lineHeight: 1.6, color: "var(--text)" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "#f1f5f9", padding: 16, borderRadius: 12, borderLeft: "4px solid var(--accent)" }}>
                <div style={{ background: "var(--accent)", color: "white", padding: 6, borderRadius: "50%" }}>
                  <Projector size={18} />
                </div>
                <div>
                  <strong>สถานการณ์:</strong> เราดักจับสัญญาณการสื่อสารระบุตัวตน (Handshake) ระหว่างเซิร์ฟเวอร์ได้
                  แต่ข้อมูลถูกซ่อนอยู่ในคลื่นความถี่เฉพาะ คุณต้องปรับจูน <strong>Signal Tuner</strong> ให้ตรงกับค่า
                  <strong>Shared Secret</strong> เพื่อเริ่มกระบวนการถอดรหัสไฟล์ (Decryption)
                </div>
              </div>
            </div>

            {/* Part 1: Signal Tuner (Diffie-Hellman) */}
            <div style={{ marginBottom: 30, padding: 24, background: "#1e293b", borderRadius: 16, color: "white", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <span className="badge" style={{ background: "#334155", color: "#94a3b8", border: "1px solid #475569" }}>
                  STEP 1: SIGNAL SYNCHRONIZATION
                </span>
                <div style={{ fontSize: 12, fontFamily: "var(--mono)", color: "#64748b" }}>
                  PARAM: A=8, B=4, P=17
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "center" }}>
                <div>
                  <label style={{ display: "block", marginBottom: 12, fontSize: 14, color: "#cbd5e1" }}>
                    จูนคลื่นความถี่ (Frequency Tuning)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={s3SecretInput}
                    onChange={(e) => {
                      setS3SecretInput(e.target.value);
                      // Auto-unlock if correct
                      if (e.target.value === "16") {
                        setS3Unlocked(true);
                        setS3Msg(null);
                      } else {
                        setS3Unlocked(false);
                      }
                    }}
                    style={{ width: "100%", accentColor: s3Unlocked ? "#22c55e" : "#3b82f6", height: 6, cursor: "pointer" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: "#64748b", fontFamily: "var(--mono)" }}>
                    <span>0 Hz</span>
                    <span>10 Hz</span>
                    <span>20 Hz</span>
                  </div>
                </div>

                <div style={{
                  width: 80, height: 80,
                  borderRadius: "50%",
                  background: s3Unlocked ? "radial-gradient(circle, #22c55e 10%, #14532d 100%)" : "#0f172a",
                  border: `3px solid ${s3Unlocked ? "#4ade80" : "#334155"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  boxShadow: s3Unlocked ? "0 0 20px #22c55e" : "none",
                  transition: "all 0.3s ease"
                }}>
                  <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "var(--mono)", color: s3Unlocked ? "white" : "#64748b" }}>
                    {s3SecretInput || "0"}
                  </div>
                  <div style={{ fontSize: 9, color: s3Unlocked ? "#dcfce7" : "#475569" }}>
                    {s3Unlocked ? "LOCKED" : "NO SIG"}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(0,0,0,0.3)", borderRadius: 8, fontSize: 13, borderLeft: "3px solid #3b82f6" }}>
                <span style={{ color: "#60a5fa" }}>💡 Hint:</span> ค่าความถี่ที่ถูกต้องคำนวณจากสูตร <code>(8^4) mod 17</code> ลองปรับจูนจนสัญญาณเปลี่ยนเป็นสีเขียว
              </div>
            </div>

            {/* Part 2: File Decryption Table */}
            <div style={{
              opacity: s3Unlocked ? 1 : 0.6,
              pointerEvents: s3Unlocked ? "auto" : "none",
              transition: "opacity 0.5s ease"
            }}>
              <div style={{ marginBottom: 16 }}>
                <span className="badge" style={{ background: "#dcfce7", color: "#166534", marginBottom: 8 }}>
                  STEP 2: VERIFY INTEGRITY
                </span>
                <p style={{ margin: "4px 0 0", fontSize: 14 }}>
                  ระบบกำลังถอดรหัส... ไฟล์ที่สมบูรณ์จะต้องมีค่า <code>Signature == (Hash + 16) % 10</code>
                </p>
                <p style={{ fontSize: 13, opacity: 0.7 }}>คลิกที่ไฟล์เพื่อตรวจสอบสถานะ (Verify)</p>
              </div>

              <div style={{ display: "grid", gap: 10, marginBottom: 24 }}>
                {[
                  { id: "f1", name: "Project_Spec", hash: 41, sig: 7, valid: true },
                  { id: "f2", name: "Admin_Key", hash: 55, sig: 5, valid: false }, // 55+16=71%10=1 != 5
                  { id: "f3", name: "System_Log", hash: 20, sig: 9, valid: false }, // 20+16=36%10=6 != 9
                  { id: "f4", name: "Java_Lib", hash: 12, sig: 8, valid: true },
                  { id: "f5", name: "Report_Final", hash: 36, sig: 2, valid: true },
                ].map((f) => {
                  /* We use local state trick simply by checking if s3Initials includes a char or some UI toggle?
                     Ideally we should have a 'verified list', but to keep it simple with existing state,
                     we will just make them clickable visual elements. 
                     Let's use a simple <details> or just toggle class.
                     Actually, let's just show the data clearly so user can pick.
                  */
                  return (
                    <div
                      key={f.id}
                      className="card-file-row"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 16px",
                        background: "white",
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                        cursor: "pointer"
                      }}
                      onClick={(e) => {
                        // Just a visual feedback on click
                        const el = e.currentTarget;
                        el.style.borderColor = f.valid ? "#22c55e" : "#ef4444";
                        el.style.background = f.valid ? "#f0fdf4" : "#fef2f2";
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 36, height: 36,
                          background: "#f1f5f9", borderRadius: 8,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#64748b"
                        }}>
                          <FileText size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 15 }}>{f.name}</div>
                          <div style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--muted)" }}>
                            Hash: {f.hash} | Sig: {f.sig}
                          </div>
                        </div>
                      </div>

                      <div className="status-indicator">
                        <span style={{ fontSize: 12, color: "var(--muted)" }}>คลิกเพื่อเช็ค</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{
                background: "#f8fafc",
                padding: 20,
                borderRadius: 16,
                border: "1px dashed var(--border)",
                textAlign: "center"
              }}>
                <label style={{ display: "block", marginBottom: 12, fontSize: 15, fontWeight: 600, color: "var(--text)" }}>
                  นำอักษรตัวแรกของไฟล์ที่ "ถูกต้อง" มาเรียงกัน
                </label>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", maxWidth: 300, margin: "0 auto" }}>
                  <input
                    value={s3Initials}
                    onChange={(e) => setS3Initials(e.target.value)}
                    placeholder="รหัส 3 ตัวอักษร"
                    style={{ ...inputCss, textAlign: "center", letterSpacing: 2, textTransform: "uppercase" }}
                    maxLength={3}
                  />
                  <button onClick={submitStage3} className="btn btnPrimary" style={{ padding: "0 24px" }}>
                    ยืนยัน
                  </button>
                </div>
              </div>
            </div>

            {s3Msg && <AlertMsg type={s3Msg.type} text={s3Msg.text} />}
          </Card>
        )}

        {stage === 4 && (
          <Card title="Final: รหัสลับสุดท้าย" subtitle="รวมชิ้นส่วนทั้งหมดเข้าด้วยกัน ตอบเป็นภาษาไทย" icon={<Flag />}>
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
                    fontSize: 28,
                    letterSpacing: 6,
                    padding: 24,
                  }}
                />
                <div className="row" style={{ marginTop: 24, justifyContent: "center" }}>
                  <button
                    onClick={submitFinal}
                    className="btn btnPrimary"
                    style={{ width: "100%", fontSize: 20, padding: 16 }}
                  >
                    ยืนยันความถูกต้อง
                  </button>
                </div>
              </div>
            )}

            {finalMsg && <AlertMsg type={finalMsg.type} text={finalMsg.text} />}
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
