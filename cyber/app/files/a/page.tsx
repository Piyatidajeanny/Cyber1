"use client";

import React, { useMemo, useState } from "react";
import {
  Star,
  Triangle,
  Coffee,
  Projector,
  Calculator,
  Mail,
  Flag,
  CheckCircle2,
  ArrowLeft,
  FileText,
} from "lucide-react";

type Stage = 1 | 2 | 3 | 4;
type Seal = "STAR" | "TRI" | "CUP";

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

    setS3Seal(null);
    setS3Files([]);
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

  // ===== NEW: Stage 3 = เลือกซอง + เลือกไฟล์ที่ “ผ่านเกณฑ์” =====
  const [s3Seal, setS3Seal] = useState<Seal | null>(null);
  const [s3Files, setS3Files] = useState<string[]>([]);
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
  const stage1Cipher = "CP";
  const stage1Credits = 2;
  const stage1Expected = "AN";

  // Stage 2 Configuration
  const wordSets = [
    ["DATA", "HASH", "ROOM", "CODE", "SIGN", "LAB"], // DATA(6), HASH(6)
    ["KEY", "LOCK", "USER", "PASS", "WIFI", "BYTE"], // KEY(1), LOCK(1)
    ["PERL", "CSS", "NODE", "JAVA", "RUBY", "HTML"], // PERL(1), CSS(1)
    ["RISK", "TIME", "GIFT", "HERO", "PLAN", "ZONE"], // RISK(7), TIME(7)
  ];
  const stage2Mod = 10;

  // Stage 3 Configuration
  const stage3FilesAll = [
    "Project_Proposal.pdf",
    "Java_Lab.docx",
    "Report_Final.pdf",
    "Draft_Project.docx",
    "ReportFinal.pdf",
    "ProjectPhoto.png",
  ];
  const requiredPrefixesInOrder = ["Project", "Java", "Report"] as const;

  // ===== Helpers for stage 3 =====
  function parseFile(file: string) {
    const dotIdx = file.lastIndexOf(".");
    const ext = dotIdx >= 0 ? file.slice(dotIdx + 1).toLowerCase() : "";
    const base = dotIdx >= 0 ? file.slice(0, dotIdx) : file;
    const hasUnderscore = base.includes("_");
    const prefix = hasUnderscore ? base.split("_")[0] : base; // ส่วนหน้าสุด
    return { ext, base, hasUnderscore, prefix };
  }

  function isDocExt(ext: string) {
    return ext === "pdf" || ext === "docx";
  }

  function isValidSubmittedFile(file: string) {
    const { ext, hasUnderscore, prefix } = parseFile(file);
    if (!isDocExt(ext)) return false;
    if (!hasUnderscore) return false;
    if (!requiredPrefixesInOrder.includes(prefix as any)) return false;
    return true;
  }

  function expectedCodeFromSelectedFiles(files: string[]) {
    const pickedPrefixes = files
      .map((f) => parseFile(f).prefix)
      .filter((p) => requiredPrefixesInOrder.includes(p as any));

    const ordered = requiredPrefixesInOrder.filter((p) =>
      pickedPrefixes.includes(p)
    );

    return ordered.map((p) => p[0].toUpperCase()).join(""); // PJR
  }

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

  function toggleS3File(file: string) {
    setS3Msg(null);
    setS3Files((prev) => {
      if (prev.includes(file)) return prev.filter((x) => x !== file);
      if (prev.length >= 3) return prev;
      return [...prev, file];
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

  // ===== NEW: Stage 3 submit = seal + file filtering + ordering + code =====
  function submitStage3() {
    if (s3Seal !== "STAR") {
      return setS3Msg({ type: "err", text: "ซองที่เลือกไม่ใช่ของแท้ (ซีลไม่ตรงลายเซ็นอาจารย์)" });
    }

    if (s3Files.length !== 3) {
      return setS3Msg({ type: "err", text: "ต้องเลือกไฟล์ให้ครบ 3 ไฟล์ (และเลือกได้สูงสุด 3)" });
    }

    // ตรวจว่าไฟล์ทั้ง 3 ผ่านกติกา
    const invalid = s3Files.filter((f) => !isValidSubmittedFile(f));
    if (invalid.length > 0) {
      return setS3Msg({
        type: "err",
        text: `มีไฟล์ไม่ผ่านเกณฑ์: ${invalid.join(", ")} (ต้องเป็น .pdf/.docx + มี "_" + ขึ้นต้น Project/Java/Report)`,
      });
    }

    const expected = expectedCodeFromSelectedFiles(s3Files);
    const ans = s3Initials.trim().toUpperCase().replace(/\s+/g, "");

    if (ans !== expected) {
      return setS3Msg({
        type: "err",
        text: `รหัสไม่ถูกต้อง ลอง “เรียง Project → Java → Report” แล้วเอาอักษรแรกของ prefix (คาดว่า ${expected})`,
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
        <h1>Cyber Security</h1>
        <p style={{ margin: "10px 0 20px" }}>
          ตามหาชิ้นส่วนรหัสลับ 3 ชิ้น จากปริศนาในห้องเรียนเพื่อกู้คืนรหัสของอาจารย์
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
            title="ด่าน 3: ส่งซองงานลับ (2 ชั้น)"
            subtitle="เลือกซองของแท้ + คัดไฟล์ที่ผ่านเกณฑ์ + สร้างรหัสจากลำดับการสอน"
            icon={<Mail />}
          >
            <div className="row" style={{ marginBottom: 14 }}>
              <span className="stamp">ลายเซ็นอาจารย์: ★ (ดาวคะแนน)</span>
              <span className="badge">เลือกซอง → เลือกไฟล์ 3 อัน → สร้างรหัส</span>
            </div>

            {/* เลือกซอง */}
            <div style={{ display: "grid", gap: 12, marginBottom: 18 }}>
              {[
                { id: "STAR" as const, icon: <Star size={28} />, label: "ซองสีแดง (มีซีล)" },
                { id: "TRI" as const, icon: <Triangle size={28} />, label: "ซองสีฟ้า (มีซีล)" },
                { id: "CUP" as const, icon: <Coffee size={28} />, label: "ซองสีน้ำตาล (มีซีล)" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setS3Seal(item.id);
                    setS3Msg(null);
                    setS3Files([]);
                    setS3Initials("");
                  }}
                  className="card"
                  style={{
                    margin: 0,
                    padding: "18px 22px",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    borderColor: s3Seal === item.id ? "var(--accent)" : "transparent",
                    background: s3Seal === item.id ? "var(--accentLight)" : "var(--bg)",
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: 16 }}>{item.label}</span>
                  <span style={{ color: s3Seal === item.id ? "var(--accent)" : "var(--muted)" }}>
                    {item.icon}
                  </span>
                </button>
              ))}
            </div>

            {/* เนื้อหาในซอง (แสดงเฉพาะซอง STAR เพื่อให้รู้สึกว่า “ของแท้”) */}
            {s3Seal === "STAR" ? (
              <div
                style={{
                  padding: 18,
                  background: "#fff",
                  borderRadius: 16,
                  marginBottom: 18,
                  border: "2px solid var(--border)",
                }}
              >
                <div
                  style={{
                    marginBottom: 10,
                    fontSize: 15,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <FileText size={18} /> ไฟล์ในซอง (เลือกให้ได้ 3 ไฟล์ที่ “ผ่านเกณฑ์”)
                </div>

                <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 10, lineHeight: 1.5 }}>
                  เกณฑ์ผ่าน:
                  <ul style={{ margin: "6px 0 0 18px" }}>
                    <li>ต้องเป็นเอกสาร .pdf หรือ .docx</li>
                    <li>ต้องมี "_" คั่นคำ</li>
                    <li>ต้องขึ้นต้นด้วย Project / Java / Report</li>
                  </ul>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: 10,
                    marginTop: 10,
                  }}
                >
                  {stage3FilesAll.map((f) => {
                    const active = s3Files.includes(f);
                    const meta = parseFile(f);
                    const passes = isValidSubmittedFile(f);
                    return (
                      <button
                        key={f}
                        onClick={() => toggleS3File(f)}
                        className="btn"
                        style={{
                          justifyContent: "space-between",
                          alignItems: "center",
                          height: 54,
                          padding: "0 14px",
                          borderColor: active ? "var(--accent)" : "var(--border)",
                          background: active ? "var(--accentLight)" : "white",
                          opacity: !active && s3Files.length >= 3 ? 0.6 : 1,
                          cursor: !active && s3Files.length >= 3 ? "not-allowed" : "pointer",
                        }}
                        disabled={!active && s3Files.length >= 3}
                      >
                        <span style={{ fontFamily: "var(--mono)", fontSize: 14 }}>{f}</span>
                        <span className="badge" style={{ fontSize: 12 }}>
                          {passes ? "ผ่านเงื่อนไข" : "ไม่ผ่าน"} • {meta.ext || "?"} •{" "}
                          {meta.hasUnderscore ? "_" : "no _"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <span className="badge">เลือกแล้ว: {s3Files.length}/3</span>
                  {s3Files.length > 0 && (
                    <span className="badge" style={{ fontFamily: "var(--mono)" }}>
                      {s3Files.join(" | ")}
                    </span>
                  )}
                </div>

                <div style={{ marginTop: 14, fontSize: 14, opacity: 0.9 }}>
                  ขั้นสุดท้าย: เรียงตามลำดับการสอน <b>Project → Java → Report</b> แล้วเอาอักษรแรกของ
                  prefix มาต่อกัน
                </div>
              </div>
            ) : s3Seal ? (
              <div style={{ marginBottom: 18, opacity: 0.75, textAlign: "center" }}>
                ซองนี้ไม่มีข้อมูลพอ… (ซีลไม่ใช่ของแท้)
              </div>
            ) : (
              <div style={{ marginBottom: 18, opacity: 0.65, textAlign: "center" }}>
                เลือกซองก่อนเพื่อดูข้อมูลด้านใน
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={s3Initials}
                onChange={(e) => setS3Initials(e.target.value)}
                placeholder="รหัส (3 ตัวอักษร)"
                style={inputCss}
                maxLength={5}
              />
              <button onClick={submitStage3} className="btn btnPrimary" style={{ padding: "0 32px" }}>
                ส่งงาน
              </button>
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
