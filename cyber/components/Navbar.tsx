"use client";

import { useState } from "react";

export default function Navbar() {
  const [busy, setBusy] = useState(false);

  async function reset() {
    try {
      setBusy(true);
      await fetch("/api/session/reset", { method: "POST" });
      window.location.href = "/";
    } finally {
      setBusy(false);
    }
  }

  return (
    <header className="header">
      <div className="brand">
        <div className="brandMark" />
        <div className="brandTitle">
          <strong>คดีสุรนารีเงา</strong>
          <span>SUT Shadow Files • Detective CTF</span>
        </div>
      </div>

      <nav className="nav">
        <a href="/">หน้าแรก</a>
        <a href="/files">แฟ้มคดี</a>
        <a href="/board">กระดานสืบสวน</a>
        <a href="/ending">ตอนจบ</a>

        {/* ปุ่มรีเซ็ต - ใช้สไตล์เดียวกับ nav */}
        <button
          onClick={reset}
          disabled={busy}
          style={{
            padding: "10px 12px",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 999,
            background: "rgba(255,255,255,0.04)",
            color: "rgba(255,255,255,0.92)",
            cursor: busy ? "not-allowed" : "pointer",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
          }}
        >
          {busy ? "กำลังล้าง..." : "เริ่มใหม่"}
        </button>
      </nav>
    </header>
  );
}
