export default function EndingPage() {
  return (
    <main className="hero">
      <h1>คดีปิดแล้ว</h1>
      <p>
        คุณปิดแฟ้มทั้งสามได้สำเร็จ—สิ่งที่น่ากลัวไม่ใช่แฮกเกอร์…แต่คือ “ความเชื่อผิด ๆ”
        ที่ระบบสร้างขึ้นให้คนทำตามโดยไม่ตั้งคำถาม
      </p>

      <div className="row">
        <a className="btn btnPrimary" href="/ending/secret">ไปตอนจบลับ</a>
        <a className="btn" href="/board">ดูหลักฐานทั้งหมด</a>
      </div>

      <div style={{ marginTop: 18 }} className="hint">
        <strong>บทสรุป</strong>
        “Cryptography ป้องกันการปลอมแปลง, Authentication ยืนยันตัวตน, Authorization จำกัดสิทธิ์—แต่ถ้าคนเชื่อผิด ระบบก็แพ้ตั้งแต่ยังไม่เริ่ม”
      </div>
    </main>
  );
}
