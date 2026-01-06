export default function SecretEndingPage() {
  return (
    <main className="hero">
      <h1>ตอนจบลับ: ผู้ร้ายคือ “เรา”</h1>
      <p>
        ผู้ร้ายไม่ใช่ใครในเรื่อง…แต่คือ “นิสัยเดาแทนการตรวจสอบ”
        คุณชนะเพราะคุณไม่เดา คุณอ่านหลักฐานจริง ๆ
      </p>

      <div className="hint" style={{ marginTop: 18 }}>
        <strong>SECRET FLAG</strong>
        <div className="flagRed" style={{ marginTop: 10 }}>
            {"FLAG{DONT_TRUST_UI_TRUST_NETWORK}"}
        </div>

      </div>

      <div className="row" style={{ marginTop: 12 }}>
        <a className="btn btnPrimary" href="/files">เล่นใหม่</a>
        <a className="btn" href="/">กลับหน้าแรก</a>
      </div>
    </main>
  );
}
