"use client";

import { useState } from "react";

export default function Navbar() {
  const [busy, setBusy] = useState(false);

  async function reset() {
    if (!confirm("ต้องการรีเซ็ตข้อมูลการสืบสวนทั้งหมดหรือไม่?")) return;
    try {
      setBusy(true);
      // ✅ เพิ่มบรรทัดนี้เพื่อล้าง Local Storage
      localStorage.clear();
      await fetch("/api/session/reset", { method: "POST" });
      window.location.href = "/";
    } finally {
      setBusy(false);
    }
  }

  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 48, height: 48,
          background: "linear-gradient(135deg, var(--accent), #a855f7)",
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: 24,
          boxShadow: "0 4px 10px rgba(99, 102, 241, 0.3)"
        }}>
          🔍
        </div>
        <div>
          <strong style={{ fontSize: 20, color: "#1e293b", display: 'block', lineHeight: 1.1 }}>Cyber Case</strong>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>SUT Detective CTF</span>
        </div>
      </div>

      <nav style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <a href="/" className="btn" style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}>Home</a>
        <a href="/files" className="btn" style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}>Files</a>
        <button
          className="btn"
          onClick={reset}
          disabled={busy}
          style={{
            borderColor: "#fed7aa",
            background: "#fff7ed",
            color: "#c2410c",
            minWidth: 100
          }}
        >
          {busy ? "..." : "Reset"}
        </button>
      </nav>
    </header>
  );
}
