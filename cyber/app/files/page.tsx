"use client";

import { useEffect, useState } from "react";
import CaseCard from "../../components/CaseCard";

type Progress = { A: boolean; B: boolean; C: boolean };

export default function FilesPage() {
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/session/me", { credentials: "include" });
      const j = await res.json();
      if (j.ok) setProgress(j.progress);
      else setProgress({ A: false, B: false, C: false });
    })();
  }, []);

  const st = (done: boolean): "DONE" | "OPEN" => (done ? "DONE" : "OPEN");

  return (
    <main>
      <div className="hero" style={{ padding: "50px 20px", marginBottom: 40 }}>
        <h1 style={{ marginBottom: 16 }}>แฟ้มคดี (Case Files)</h1>
        <p style={{ fontSize: 18, color: "var(--muted)" }}>
          {progress ? "✅ Connected: เรียกดูข้อมูลคดีทั้งหมดในระบบ" : "⏳ Connecting to database..."}
        </p>
      </div>

      <div className="grid grid3">
        <CaseCard
          title="Case A: ลายเซ็นเงา"
          subtitle="หลักฐานถูก ‘จัดรูปแบบ’ ผิด ทำให้ตรวจสอบไม่ผ่าน…หรือคุณกำลังใช้ปีผิดปฏิทิน?"
          href="/files/a"
          status={progress ? st(progress.A) : "OPEN"}
          tag="Evidence"
        />
        <CaseCard
          title="Case B: ผู้รับที่สาบสูญ"
          subtitle="ระบบยืนยันตัวตนจากสิ่งที่ ‘ไม่น่าถูกใช้’ เป็นตัวตน คุณต้องหาว่ามันเชื่ออะไรอยู่"
          href={progress?.A ? "/files/b" : "#"}
          status={progress ? (progress.A ? st(progress.B) : "LOCKED") : "OPEN"}
          tag="Identity"
        />
        <CaseCard
          title="Case C: แฟ้มภายใน"
          subtitle="บางสิ่งถูกล็อกไว้ด้วย “โครงสร้างองค์กร” แต่มันอาจเป็นเพียงคำกล่าวอ้างของ Header"
          href={progress?.B ? "/files/c" : "#"}
          status={progress ? (progress.B ? st(progress.C) : "LOCKED") : "OPEN"}
          tag="Access Control"
        />
      </div>
    </main>
  );
}
