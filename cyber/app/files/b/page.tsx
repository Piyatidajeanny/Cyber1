"use client";

import { useState, useEffect } from "react";
import {
  Lock,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Trophy,
  Puzzle,
  Key,
} from "lucide-react";

type SubStage = "B1" | "B2" | "FINAL";

export default function FileBPage() {
  const [currentStage, setCurrentStage] = useState<SubStage>("B1");
  const [b1Answer, setB1Answer] = useState("");
  const [b2Answer, setB2Answer] = useState("");
  const [finalAnswer, setFinalAnswer] = useState("");
  
  const [b1Passed, setB1Passed] = useState(false);
  const [b2Passed, setB2Passed] = useState(false);
  const [finalPassed, setFinalPassed] = useState(false);
  
  const [msg, setMsg] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [flag, setFlag] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [hintLevel, setHintLevel] = useState(0);
  
  // B2 Interactive Grid State (5x5 grid)
  const [gridSelected, setGridSelected] = useState<boolean[]>(Array(25).fill(false));
  
  // U shape pattern: cells that form a U on 5x5 grid (0-indexed, top-left is 0)
  // Row 0: [0,4], Row 1: [5,9], Row 2: [10,14], Row 3: [15,19], Row 4: [20,21,22,23,24]
  // U shape: left column (0,5,10,15,20), bottom row (21,22,23), right column (4,9,14,19,24)
  const uPattern = [0, 5, 10, 15, 20, 21, 22, 23, 24, 19, 14, 9, 4];
  
  function checkUPattern(): boolean {
    // Check if selected cells match U pattern exactly
    const selectedIndices = gridSelected.map((v, i) => v ? i : -1).filter(i => i !== -1);
    if (selectedIndices.length !== uPattern.length) return false;
    return uPattern.every(i => gridSelected[i]) && selectedIndices.every(i => uPattern.includes(i));
  }
  
  function toggleCell(index: number) {
    const newGrid = [...gridSelected];
    newGrid[index] = !newGrid[index];
    setGridSelected(newGrid);
  }
  
  function clearGrid() {
    setGridSelected(Array(25).fill(false));
  }

  // ตรวจสอบสถานะจาก session เมื่อโหลดหน้า
  useEffect(() => {
    fetch("/api/receiver/verify", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.progress) {
          setB1Passed(data.progress.B1 === "✅ ผ่านแล้ว");
          setB2Passed(data.progress.B2 === "✅ ผ่านแล้ว");
        }
      })
      .catch(() => {});
  }, []);

  async function submitB1() {
    if (!b1Answer.trim()) return;
    setLoading(true);
    setMsg(null);
    
    try {
      const res = await fetch("/api/receiver/b1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ input: b1Answer }),
      });
      const j = await res.json();
      
      if (j.ok) {
        setB1Passed(true);
        setMsg(j.message);
        setIsError(false);
        setHintLevel(0);
      } else {
        setMsg(j.message || "ยังไม่ถูกต้อง");
        setIsError(true);
      }
    } finally {
      setLoading(false);
    }
  }

  async function submitB2() {
    if (!b2Answer.trim()) return;
    setLoading(true);
    setMsg(null);
    
    try {
      const res = await fetch("/api/receiver/b2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ input: b2Answer }),
      });
      const j = await res.json();
      
      if (j.ok) {
        setB2Passed(true);
        setMsg(j.message);
        setIsError(false);
        setHintLevel(0);
      } else {
        setMsg(j.message || "ยังไม่ถูกต้อง");
        setIsError(true);
      }
    } finally {
      setLoading(false);
    }
  }

  async function submitFinal() {
    if (!finalAnswer.trim() || !b1Passed || !b2Passed) return;
    setLoading(true);
    setMsg(null);
    
    try {
      const res = await fetch("/api/receiver/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ answer: finalAnswer }),
      });
      const j = await res.json();
      
      if (j.ok) {
        setFinalPassed(true);
        setMsg(j.message);
        setIsError(false);
        if (j.flag) setFlag(j.flag);
      } else {
        setMsg(j.message || "รหัสผ่านไม่ถูกต้อง");
        setIsError(true);
      }
    } finally {
      setLoading(false);
    }
  }

  // ===== HINTS =====
  const b1Hints = [
    { title: "คำใบ้ 1", text: "T9 Keypad คือปุ่มโทรศัพท์รุ่นเก่า แต่ละปุ่มมีหลายตัวอักษร" },
    { title: "คำใบ้ 2", text: "ใช้ตัวแรกของแต่ละปุ่ม: 6=M, 2=A, 6=N" },
    { title: "เฉลย", text: "626 → MAN" },
  ];
  
  const b2Hints = [
    { title: "คำใบ้ 1", text: "ตัวอักษรที่แทน 'คุณ' ในภาษาอังกฤษคือ 'You'" },
    { title: "คำใบ้ 2", text: "ลองวาดรูปตัวอักษร U บน grid (ซ้าย-ล่าง-ขวา)" },
    { title: "เฉลย", text: "คำตอบคือ U (ออกเสียงว่า 'ยู' เหมือน 'you')" },
  ];

  const finalHints = [
    { title: "คำใบ้ 1", text: "รวมชิ้นส่วนทั้งหมดที่ได้: ajparinlove + ??? + ???" },
    { title: "คำใบ้ 2", text: "แปลงเป็น leet speak: A→4, E→3 เช่น manchester → m4nch3st3r" },
    { title: "คำใบ้ 3", text: "man + chester = manchester, u + nited = united" },
    { title: "เฉลย", text: "ajparinlovem4nch3st3runit3d" },
  ];

  function renderHintBox(hints: Array<{ title: string; text: string }>) {
    return (
      <div style={{ marginTop: 24, padding: 16, background: "#fef3c7", borderRadius: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: hintLevel > 0 ? 12 : 0 }}>
          <span style={{ color: "#b45309", fontWeight: 600 }}>
            <Lightbulb size={16} style={{ display: "inline", marginRight: 6 }} />
            ระบบคำใบ้
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setHintLevel(v => Math.min(v + 1, hints.length))}
              className="btn"
              style={{ padding: "4px 12px", fontSize: 13 }}
            >
              เปิดคำใบ้ ({hintLevel}/{hints.length})
            </button>
            {hintLevel > 0 && (
              <button onClick={() => setHintLevel(0)} className="btn" style={{ padding: "4px 12px", fontSize: 13 }}>
                ปิด
              </button>
            )}
          </div>
        </div>
        {hintLevel > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {hints.slice(0, hintLevel).map((h, i) => (
              <div key={i} style={{ padding: 12, background: "rgba(255,255,255,0.8)", borderRadius: 8 }}>
                <strong style={{ color: "#b45309" }}>{h.title}:</strong> {h.text}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ===== MAIN RENDER =====
  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <a href="/files" className="btn" style={{ padding: "8px 16px", background: "transparent", border: "none" }}>
          <ArrowLeft size={20} /> ย้อนกลับ
        </a>
      </div>

      {/* Header */}
      <div className="hero" style={{ marginBottom: 30 }}>
        <h1>Case B: Entity Authentication</h1>
        <p style={{ margin: 0, color: "var(--muted)" }}>ผ่านการยืนยันตัวตนด้วย PIN และ Location เพื่อสร้าง Master Password</p>
      </div>

      {/* Progress Bar */}
      <div style={{ maxWidth: 800, margin: "0 auto 30px" }}>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }}>
          <button
            onClick={() => { setCurrentStage("B1"); setMsg(null); setHintLevel(0); }}
            className="btn"
            style={{
              padding: "12px 24px",
              background: currentStage === "B1" ? "var(--accent)" : b1Passed ? "#10b981" : "white",
              color: currentStage === "B1" || b1Passed ? "white" : "var(--text)",
              border: "none",
            }}
          >
            {b1Passed ? <CheckCircle2 size={16} /> : <Lock size={16} />}
            B1
          </button>
          <button
            onClick={() => { setCurrentStage("B2"); setMsg(null); setHintLevel(0); }}
            className="btn"
            style={{
              padding: "12px 24px",
              background: currentStage === "B2" ? "var(--accent)" : b2Passed ? "#10b981" : "white",
              color: currentStage === "B2" || b2Passed ? "white" : "var(--text)",
              border: "none",
            }}
          >
            {b2Passed ? <CheckCircle2 size={16} /> : <Lock size={16} />}
            B2
          </button>
          <button
            onClick={() => { setCurrentStage("FINAL"); setMsg(null); setHintLevel(0); }}
            className="btn"
            style={{
              padding: "12px 24px",
              background: currentStage === "FINAL" ? "var(--accent)" : finalPassed ? "#f59e0b" : "white",
              color: currentStage === "FINAL" || finalPassed ? "white" : "var(--text)",
              border: "none",
            }}
          >
            {finalPassed ? <Trophy size={16} /> : <Key size={16} />}
            Final
          </button>
        </div>
      </div>

      {/* Current Stage Content */}
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        
        {/* ===== STAGE B1 ===== */}
        {currentStage === "B1" && (
          <div className="card" style={{ padding: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <Puzzle size={32} style={{ color: b1Passed ? "#10b981" : "var(--accent)" }} />
              <h2 style={{ margin: 0 }}>ด่าน B1: PIN Authentication</h2>
              {b1Passed && <CheckCircle2 size={24} style={{ color: "#10b981" }} />}
            </div>

            {b1Passed ? (
              <div style={{ textAlign: "center", padding: 40 }}>
                <CheckCircle2 size={80} style={{ color: "#10b981", marginBottom: 20 }} />
                <h3 style={{ color: "#10b981" }}>ถอดรหัสสำเร็จ!</h3>
                <p style={{ fontSize: 24, fontFamily: "var(--mono)" }}>
                  ชิ้นส่วน: <strong>&quot;man&quot;</strong>
                </p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
                  <a href="/files" className="btn" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    📂 ไปยังแฟ้มคดี B
                  </a>
                  <button onClick={() => { setCurrentStage("B2"); setMsg(null); setHintLevel(0); }} className="btn btnPrimary">
                    ไป Location-based <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ background: "#f8fafc", padding: 24, borderRadius: 12, marginBottom: 24 }}>
                  <h3 style={{ marginTop: 0, color: "var(--accent)" }}>🔢 PIN ที่ถูกเข้ารหัส</h3>
                  
                  <div style={{ 
                    background: "#1e293b", 
                    padding: 24, 
                    borderRadius: 12, 
                    marginBottom: 16,
                    fontFamily: "var(--mono)",
                    color: "#22c55e"
                  }}>
                    <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>&gt; Encrypted PIN detected:</p>
                    <p style={{ 
                      margin: "12px 0 0 0", 
                      fontSize: 56, 
                      textAlign: "center",
                      letterSpacing: 20,
                      fontWeight: "bold"
                    }}>
                      6 2 6
                    </p>
                  </div>
                  
                  <div style={{ 
                    background: "#fef3c7", 
                    padding: 16, 
                    borderRadius: 8,
                    border: "1px solid #f59e0b",
                    marginBottom: 16
                  }}>
                    <p style={{ margin: 0, fontSize: 14, color: "#92400e", fontWeight: "bold" }}>
                      📱 T9 Keypad (โทรศัพท์รุ่นเก่า)
                    </p>
                  </div>
                  
                  {/* T9 Keypad Visual */}
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(3, 1fr)", 
                    gap: 8, 
                    maxWidth: 280, 
                    margin: "0 auto",
                    background: "#e2e8f0",
                    padding: 12,
                    borderRadius: 12
                  }}>
                    {[
                      { num: "1", letters: "" },
                      { num: "2", letters: "ABC" },
                      { num: "3", letters: "DEF" },
                      { num: "4", letters: "GHI" },
                      { num: "5", letters: "JKL" },
                      { num: "6", letters: "MNO" },
                      { num: "7", letters: "PQRS" },
                      { num: "8", letters: "TUV" },
                      { num: "9", letters: "WXYZ" },
                    ].map((key, i) => (
                      <div key={i} style={{ 
                        background: key.num === "6" || key.num === "2" ? "#fef3c7" : "white", 
                        padding: "10px 8px", 
                        borderRadius: 8, 
                        textAlign: "center",
                        border: key.num === "6" || key.num === "2" ? "2px solid #f59e0b" : "1px solid #cbd5e1"
                      }}>
                        <div style={{ fontSize: 20, fontWeight: "bold" }}>{key.num}</div>
                        <div style={{ fontSize: 10, color: "#64748b" }}>{key.letters}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ 
                    background: "#dbeafe", 
                    padding: 12, 
                    borderRadius: 8, 
                    textAlign: "center",
                    marginTop: 16
                  }}>
                    <p style={{ margin: 0, fontSize: 14, color: "#1e40af" }}>
                      🔤 แต่ละเลขแทนตัวอักษรตัวแรกของปุ่มนั้น
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <input
                    value={b1Answer}
                    onChange={(e) => setB1Answer(e.target.value)}
                    placeholder="กรอกคำตอบ..."
                    style={{
                      flex: 1,
                      padding: "16px 20px",
                      fontSize: 20,
                      borderRadius: 12,
                      border: "2px solid var(--border)",
                      fontFamily: "var(--mono)",
                    }}
                    onKeyDown={(e) => e.key === "Enter" && submitB1()}
                  />
                  <button onClick={submitB1} className="btn btnPrimary" disabled={loading} style={{ padding: "16px 32px" }}>
                    {loading ? "..." : "ตรวจสอบ"}
                  </button>
                </div>

                {renderHintBox(b1Hints)}
              </>
            )}

            {msg && (
              <div style={{
                marginTop: 20,
                padding: 16,
                background: isError ? "#fee2e2" : "#dcfce7",
                color: isError ? "#991b1b" : "#166534",
                borderRadius: 12,
                whiteSpace: "pre-line"
              }}>
                {msg}
              </div>
            )}
          </div>
        )}

        {/* ===== STAGE B2 ===== */}
        {currentStage === "B2" && (
          <div className="card" style={{ padding: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <Puzzle size={32} style={{ color: b2Passed ? "#10b981" : "var(--accent)" }} />
              <h2 style={{ margin: 0 }}>ด่าน B2: Location-based Auth</h2>
              {b2Passed && <CheckCircle2 size={24} style={{ color: "#10b981" }} />}
            </div>

            {b2Passed ? (
              <div style={{ textAlign: "center", padding: 40 }}>
                <CheckCircle2 size={80} style={{ color: "#10b981", marginBottom: 20 }} />
                <h3 style={{ color: "#10b981" }}>ยืนยันตำแหน่งสำเร็จ!</h3>
                <p style={{ fontSize: 24, fontFamily: "var(--mono)" }}>
                  ชิ้นส่วน: <strong>&quot;u&quot;</strong>
                </p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
                  <a href="/files" className="btn" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    📂 ไปยังแฟ้มคดี B
                  </a>
                  <button onClick={() => { setCurrentStage("FINAL"); setMsg(null); setHintLevel(0); }} className="btn btnPrimary">
                    ไปสร้าง Master Password <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ background: "#f8fafc", padding: 24, borderRadius: 12, marginBottom: 24 }}>
                  <h3 style={{ marginTop: 0, color: "var(--accent)" }}>📍 Location Verification Required</h3>
                  
                  <div style={{ 
                    background: "#1e293b", 
                    padding: 20, 
                    borderRadius: 12, 
                    marginBottom: 16,
                    fontFamily: "var(--mono)",
                    color: "#22c55e"
                  }}>
                    <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>&gt; Security System Message:</p>
                    <p style={{ margin: "12px 0 0 0", fontSize: 14 }}>
                      "ระบบตรวจพบการเข้าถึงจากตำแหน่งที่ไม่รู้จัก<br/>
                      กรุณาวาดรูปแบบยืนยันตัวตนบน Security Grid<br/>
                      <span style={{ color: "#fbbf24" }}>Hint: รูปแบบที่ถูกต้องคือตัวอักษรที่แทน &apos;คุณ&apos; ในภาษาอังกฤษ</span>"
                    </p>
                  </div>
                  
                  {/* Interactive 5x5 Grid */}
                  <div style={{ textAlign: "center", marginBottom: 16 }}>
                    <p style={{ fontSize: 14, color: "#64748b", marginBottom: 12 }}>
                      🖱️ คลิกเพื่อเลือก/ยกเลิกช่อง แล้ววาดรูปตัวอักษรที่ถูกต้อง
                    </p>
                    <div style={{ 
                      display: "grid", 
                      gridTemplateColumns: "repeat(5, 1fr)", 
                      gap: 4, 
                      maxWidth: 250, 
                      margin: "0 auto",
                      background: "#e2e8f0",
                      padding: 8,
                      borderRadius: 12
                    }}>
                      {Array(25).fill(0).map((_, i) => (
                        <button 
                          key={i} 
                          onClick={() => toggleCell(i)}
                          style={{ 
                            width: 44, 
                            height: 44,
                            background: gridSelected[i] ? "#3b82f6" : "white", 
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: "bold",
                            color: gridSelected[i] ? "white" : "#cbd5e1",
                            border: gridSelected[i] ? "2px solid #1d4ed8" : "1px solid #cbd5e1",
                            cursor: "pointer",
                            transition: "all 0.15s ease"
                          }}
                        >
                          {gridSelected[i] ? "●" : ""}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={clearGrid} 
                      className="btn" 
                      style={{ marginTop: 12, padding: "8px 16px", fontSize: 13 }}
                    >
                      🗑️ ล้างทั้งหมด
                    </button>
                  </div>
                  
                  <div style={{ 
                    background: "#dbeafe", 
                    padding: 12, 
                    borderRadius: 8, 
                    textAlign: "center",
                    marginTop: 16,
                    border: "1px solid #93c5fd"
                  }}>
                    <p style={{ margin: 0, fontSize: 14, color: "#1e40af" }}>
                      � วาดรูปตัวอักษรที่แทนคำว่า &apos;คุณ&apos; แล้วกรอกคำตอบ
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, flexDirection: "column", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 12, width: "100%" }}>
                    <input
                      value={b2Answer}
                      onChange={(e) => setB2Answer(e.target.value)}
                      placeholder="กรอกตัวอักษรที่คุณวาด..."
                      style={{
                        flex: 1,
                        padding: "16px 20px",
                        fontSize: 20,
                        borderRadius: 12,
                        border: "2px solid var(--border)",
                        fontFamily: "var(--mono)",
                        textTransform: "uppercase"
                      }}
                      onKeyDown={(e) => e.key === "Enter" && submitB2()}
                    />
                    <button onClick={submitB2} className="btn btnPrimary" disabled={loading} style={{ padding: "16px 32px" }}>
                      {loading ? "..." : "ตรวจสอบ"}
                    </button>
                  </div>
                  
                  {checkUPattern() && (
                    <div style={{ 
                      padding: "12px 20px", 
                      background: "#dcfce7", 
                      borderRadius: 8, 
                      color: "#166534",
                      fontSize: 14,
                      display: "flex",
                      alignItems: "center",
                      gap: 8
                    }}>
                      <CheckCircle2 size={18} />
                      รูปแบบถูกต้องแล้ว! กรอกคำตอบได้เลย
                    </div>
                  )}
                </div>

                {renderHintBox(b2Hints)}
              </>
            )}

            {msg && (
              <div style={{
                marginTop: 20,
                padding: 16,
                background: isError ? "#fee2e2" : "#dcfce7",
                color: isError ? "#991b1b" : "#166534",
                borderRadius: 12,
                whiteSpace: "pre-line"
              }}>
                {msg}
              </div>
            )}
          </div>
        )}

        {/* ===== FINAL STAGE ===== */}
        {currentStage === "FINAL" && (
          <div className="card" style={{ padding: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <Key size={32} style={{ color: finalPassed ? "#10b981" : "var(--accent)" }} />
              <h2 style={{ margin: 0 }}>ด่านสุดท้าย: รหัสผ่านลับ</h2>
              {finalPassed && <Trophy size={24} style={{ color: "#f59e0b" }} />}
            </div>

            {finalPassed ? (
              <div style={{ textAlign: "center", padding: 40 }}>
                <Trophy size={100} style={{ color: "#f59e0b", marginBottom: 20 }} />
                <h3 style={{ color: "#10b981", fontSize: 28 }}>🎉 ปลดล็อกโน๊ตบุ๊คสำเร็จ!</h3>
                <div style={{
                  marginTop: 20,
                  padding: 24,
                  background: "#fef3c7",
                  borderRadius: 16,
                  border: "3px dashed #f59e0b"
                }}>
                  <p style={{ fontSize: 18, marginBottom: 12 }}>รหัสผ่านที่ถูกต้อง:</p>
                  <code style={{ fontSize: 24, fontFamily: "var(--mono)", color: "#b45309" }}>
                    ajparinlovem4nch3st3runit3d
                  </code>
                  <p style={{ marginTop: 16, fontSize: 14, color: "var(--muted)" }}>
                    = AJ Parin loves Manchester United ⚽
                  </p>
                  <p style={{ marginTop: 12, fontSize: 13, color: "#64748b" }}>
                    ตอนนี้คุณสามารถเข้าถึงโน๊ตบุ๊คของอาจารย์ได้แล้ว!
                  </p>
                </div>
                {flag && (
                  <div style={{
                    marginTop: 24,
                    padding: 20,
                    background: "#dcfce7",
                    borderRadius: 12,
                    fontFamily: "var(--mono)",
                    fontSize: 20
                  }}>
                    🚩 {flag}
                  </div>
                )}
                <a href="/files/c" className="btn btnPrimary" style={{ marginTop: 30, display: "inline-flex", alignItems: "center", gap: 8 }}>
                  ไปด่าน C <ArrowRight size={16} />
                </a>
              </div>
            ) : (
              <>
                {/* Story Box */}
                <div style={{ 
                  background: "linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)", 
                  padding: 24, 
                  borderRadius: 16, 
                  marginBottom: 24,
                  color: "#1e3a5f",
                  position: "relative",
                  overflow: "hidden",
                  border: "2px solid #93c5fd"
                }}>
                  <div style={{ position: "absolute", top: 10, right: 10, fontSize: 40, opacity: 0.15 }}>✈️🏴󠁧󠁢󠁥󠁮󠁧󠁿⚽</div>
                  <h3 style={{ marginTop: 0, color: "#1d4ed8", display: "flex", alignItems: "center", gap: 8 }}>
                    📖 เบาะแสสำคัญ
                  </h3>
                  <p style={{ 
                    margin: 0, 
                    fontSize: 16, 
                    lineHeight: 1.8,
                    fontStyle: "italic"
                  }}>
                    &quot;ในวันหยุดก่อนส่งเกรด อาจารย์กำลังจะไปเที่ยวที่เกาะ <strong style={{ color: "#1d4ed8" }}>England</strong> เพื่อพักผ่อน 
                    และไปเชียร์ทีมที่อาจารย์ <strong style={{ color: "#dc2626" }}>รักกกกกกก</strong> มากที่สุด!&quot;
                  </p>
                  <div style={{ 
                    marginTop: 16, 
                    padding: 12, 
                    background: "rgba(29, 78, 216, 0.1)", 
                    borderRadius: 8,
                    fontSize: 14,
                    border: "1px dashed #3b82f6"
                  }}>
                    🎯 <strong>ภารกิจ:</strong> จงหารหัสเพื่อปลดล็อกโน๊ตบุ๊คของอาจารย์ เพื่อจะเข้าไปแก้เกรด!
                  </div>
                </div>

                <div style={{ background: "#f8fafc", padding: 24, borderRadius: 12, marginBottom: 24 }}>
                  <h3 style={{ marginTop: 0, color: "var(--accent)" }}>🔐 รวมชิ้นส่วนเพื่อสร้างรหัสผ่าน</h3>
                  
                  <div style={{ display: "grid", gap: 12, marginBottom: 20 }}>
                    <div style={{ padding: 16, background: "#e0f2fe", borderRadius: 8, display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontWeight: "bold", color: "#0369a1" }}>จากด่าน A:</span>
                      <code style={{ fontSize: 18 }}>ajparin</code>
                    </div>
                    <div style={{ padding: 16, background: b1Passed ? "#dcfce7" : "#f1f5f9", borderRadius: 8, display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontWeight: "bold", color: b1Passed ? "#166534" : "#64748b" }}>จากด่าน B1:</span>
                      <code style={{ fontSize: 18 }}>{b1Passed ? "man" : "???"}</code>
                      {b1Passed && <CheckCircle2 size={18} style={{ color: "#10b981" }} />}
                    </div>
                    <div style={{ padding: 16, background: b2Passed ? "#dcfce7" : "#f1f5f9", borderRadius: 8, display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontWeight: "bold", color: b2Passed ? "#166534" : "#64748b" }}>จากด่าน B2:</span>
                      <code style={{ fontSize: 18 }}>{b2Passed ? "u" : "???"}</code>
                      {b2Passed && <CheckCircle2 size={18} style={{ color: "#10b981" }} />}
                    </div>
                  </div>

                  <div style={{ padding: 16, background: "#fef3c7", borderRadius: 8 }}>
                    <p style={{ margin: 0, color: "#b45309" }}>
                      <strong>� จากที่ไปแอบดูตอนอาจารย์ใส่รหัสผ่านโน๊ตบุ๊ค ได้วิธีการใส่คร่าวๆ มาว่า:</strong><br/>
                      1. ไม่มีการเว้นวรรค<br/>
                      2. รหัสผ่านด้านหลังมีการกดตัวเลขนิดหน่อย
                    </p>
                  </div>
                </div>

                {(!b1Passed || !b2Passed) && (
                  <div style={{ padding: 16, background: "#fee2e2", borderRadius: 8, marginBottom: 20, textAlign: "center" }}>
                    <XCircle size={20} style={{ display: "inline", marginRight: 8, color: "#dc2626" }} />
                    <span style={{ color: "#991b1b" }}>ต้องผ่านด่าน B1 และ B2 ก่อน!</span>
                  </div>
                )}

                <div style={{ display: "flex", gap: 12 }}>
                  <input
                    value={finalAnswer}
                    onChange={(e) => setFinalAnswer(e.target.value)}
                    placeholder="กรอกรหัสผ่านสุดท้าย..."
                    disabled={!b1Passed || !b2Passed}
                    style={{
                      flex: 1,
                      padding: "16px 20px",
                      fontSize: 20,
                      borderRadius: 12,
                      border: "2px solid var(--border)",
                      fontFamily: "var(--mono)",
                      opacity: (!b1Passed || !b2Passed) ? 0.5 : 1,
                    }}
                    onKeyDown={(e) => e.key === "Enter" && submitFinal()}
                  />
                  <button 
                    onClick={submitFinal} 
                    className="btn btnPrimary" 
                    disabled={loading || !b1Passed || !b2Passed} 
                    style={{ padding: "16px 32px" }}
                  >
                    {loading ? "..." : "ปลดล็อก"}
                  </button>
                </div>

                {renderHintBox(finalHints)}
              </>
            )}

            {msg && !finalPassed && (
              <div style={{
                marginTop: 20,
                padding: 16,
                background: isError ? "#fee2e2" : "#dcfce7",
                color: isError ? "#991b1b" : "#166534",
                borderRadius: 12,
                whiteSpace: "pre-line"
              }}>
                {msg}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
