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

  // ✅ แก้ TS ให้ชัวร์
  const st = (done: boolean): "DONE" | "OPEN" => (done ? "DONE" : "OPEN");

  return (
    <main>
      <div className="hero" style={{ padding: 18, marginBottom: 14 }}>
        <h1 style={{ fontSize: 22, marginBottom: 6 }}>แฟ้มคดี</h1>
        <p style={{ margin: 0 }}>
          {progress ? "สถานะถูกบันทึกในระบบแล้ว" : "กำลังโหลดสถานะ..."}
        </p>
      </div>

      <div className="grid grid3">
        <CaseCard
          title="แฟ้ม A: ลายเซ็นเงา"
          subtitle="หลักฐานถูก ‘จัดรูปแบบ’ ผิด ทำให้ตรวจสอบไม่ผ่าน…หรือคุณกำลังใช้ปีผิดปฏิทิน?"
          href="/files/a"
          status={progress ? st(progress.A) : "OPEN"}
          tag="Evidence / Signature"
        />
        <CaseCard
          title="แฟ้ม B: ผู้รับที่ไม่เคยมีอยู่"
          subtitle="ระบบยืนยันตัวตนจากสิ่งที่ ‘ไม่น่าถูกใช้’ เป็นตัวตน คุณต้องหาว่ามันเชื่ออะไรอยู่"
          href={progress?.A ? "/files/b" : "#"}
          status={progress ? (progress.A ? st(progress.B) : "LOCKED") : "OPEN"}
          tag="Identity / Behavior"
        />
        <CaseCard
          title="แฟ้ม C: แฟ้มภายใน"
          subtitle="บางสิ่งถูกล็อกไว้ด้วย “โครงสร้างองค์กร” แต่โครงสร้างนั้นอาจเป็นเพียงคำกล่าวอ้าง"
          href={progress?.B ? "/files/c" : "#"}
          status={progress ? (progress.B ? st(progress.C) : "LOCKED") : "OPEN"}
          tag="Access / Policy"
        />
      </div>
    </main>
  );
}
