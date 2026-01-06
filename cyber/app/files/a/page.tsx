"use client";

import { useState } from "react";

export default function FileAPage() {
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [flag, setFlag] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function verify() {
    setLoading(true);
    setMsg(null);
    setFlag(null);

    try {
      const res = await fetch("/api/evidence/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: "A", input }),
      });
      const j = await res.json();

      if (j.ok) {
        setMsg(j.message || "ผ่านแล้ว");
        setFlag(j.flag || null);
      } else {
        setMsg(j.message || j.error || "ไม่ผ่าน");
      }
    } catch (e: any) {
      setMsg(e?.message ?? "เชื่อมต่อไม่ได้");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <div className="hero" style={{ padding: 18, marginBottom: 14 }}>
        <h1 style={{ fontSize: 22, marginBottom: 6 }}>แฟ้ม A: ลายเซ็นเงา</h1>
        <p style={{ margin: 0 }}>
          หลักฐานชิ้นนี้ตรวจไม่ผ่านเพราะ “รูปแบบปี” ไม่ตรงกับระบบ
        </p>
      </div>

      <div className="card">
        <div className="hint">
          <strong>บันทึกจากคุโรคาวะ ซุรัน</strong>
          “ปีนั้นมี 2 หน้า: พ.ศ. กับ ค.ศ. ถ้าคุณเลือกผิด…คุณจะเห็นความจริงผิด”
        </div>

        <div style={{ marginTop: 14 }}>
          <label style={{ display: "block", marginBottom: 8, color: "rgba(255,255,255,0.75)" }}>
            กรอกหลักฐานลายเซ็น (รูปแบบ: YEAR-TAG)
          </label>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="เช่น 1990-SUT"
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
          <button className="btn btnPrimary" onClick={verify} disabled={loading}>
            {loading ? "กำลังตรวจ..." : "ตรวจหลักฐาน"}
          </button>
          <a className="btn" href="/files">กลับหน้าแฟ้ม</a>
        </div>

        {msg ? (
          <div style={{ marginTop: 14 }} className="hint">
            <strong>ผลการตรวจ</strong>
            {msg}
            {flag ? (
              <div className="mono" style={{ marginTop: 10 }}>
                {flag}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </main>
  );
}
