"use client";

import React, { useState, useEffect } from "react";
import { Lock, Mail, Key, ArrowRight, LogOut, User, Save, ShieldCheck } from "lucide-react";

// --- 1. CONFIGURATION & LOGIC ---
type Role = "STUDENT" | "TEACHER";
type Permission = "VIEW_GRADES" | "EDIT_GRADES";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  STUDENT: ["VIEW_GRADES"],
  TEACHER: ["VIEW_GRADES", "EDIT_GRADES"],
};

const USERS = [
  { username: "Aj.prin", pass: "lovemanchesterunited", role: "TEACHER" as Role, name: "อาจารย์ปริญญ์ (Professor)" },
  { username: "B6631659", pass: "123", role: "STUDENT" as Role, name: "วงศกร ยอดกลาง" },
];

// รายชื่อนักศึกษา 74 คน
const INITIAL_GRADES = [
  { id: "B6514822", name: "นางสาวกนกพร จำปาหอม", grade: "F" },
  { id: "B6600907", name: "นางสาววรัทยา ปัตตะเน", grade: "F" },
  { id: "B6603892", name: "นายศุภณัฐ สิงหา", grade: "F" },
  { id: "B6603908", name: "นายชทัตพล เสริมศรี", grade: "F" },
  { id: "B6603946", name: "นายสุรเกียรติ สิงขรอาสน์", grade: "F" },
  { id: "B6604141", name: "นายธันยกร ศักดิษฐานนท์", grade: "F" },
  { id: "B6606053", name: "นางสาวญาณัจฉรา บุตรดี", grade: "F" },
  { id: "B6606138", name: "นายธนพล สงกล้า", grade: "F" },
  { id: "B6607012", name: "นายธนัช ตั้งมั่น", grade: "F" },
  { id: "B6607845", name: "นายภูผา บุญเทียม", grade: "F" },
  { id: "B6608019", name: "นางสาวเนตรนภัทร ชำนินอก", grade: "F" },
  { id: "B6608064", name: "นายธีรชัย มีดี", grade: "F" },
  { id: "B6608347", name: "นางสาวอรปรียา แตงอ่อน", grade: "F" },
  { id: "B6608798", name: "นายรับเช็ค อึ่งชัยภูมิ", grade: "F" },
  { id: "B6609023", name: "นายณัฐสิทธิ์ มามั่น", grade: "F" },
  { id: "B6609061", name: "นายศิริพงษ์ ผิวคำ", grade: "F" },
  { id: "B6609535", name: "นางสาวมุธิตา สิงห์แก้ว", grade: "F" },
  { id: "B6610258", name: "นายสุรยุทธ หงษาวดี", grade: "F" },
  { id: "B6610920", name: "นายธนธรณ์ เหาะดอน", grade: "F" },
  { id: "B6611460", name: "นายสิษฐ์สโรจ กันทรสุรพล", grade: "F" },
  { id: "B6611743", name: "นายพีรพัฒน์ เพชรล้ำ", grade: "F" },
  { id: "B6611859", name: "นายพิชญุตม์ พิมพ์ภาค", grade: "F" },
  { id: "B6612122", name: "นายธนพล สุดโต", grade: "F" },
  { id: "B6612979", name: "นางสาววราภรณ์ ท้าวพา", grade: "F" },
  { id: "B6614768", name: "นางสาวนภสร วาริชอลังการ", grade: "F" },
  { id: "B6614850", name: "นายเทพประทาน หลิน", grade: "F" },
  { id: "B6615406", name: "นางสาวธมนวรรณ เกริ่นกระโทก", grade: "F" },
  { id: "B6615574", name: "นายธีระพัฒน์ แสวงดี", grade: "F" },
  { id: "B6615994", name: "นายธนภัทร เย็นสวัสดิ์", grade: "F" },
  { id: "B6616052", name: "นายวรวุฒิ ทัศน์ทอง", grade: "F" },
  { id: "B6617165", name: "นายภูผา คำผานุรัตน์", grade: "F" },
  { id: "B6617646", name: "นายภาวิฒ ฉ่ำเสนาะ", grade: "F" },
  { id: "B6618520", name: "นายธนภัทร เงินเส็ง", grade: "F" },
  { id: "B6618599", name: "นายสรายุทธ อินทร์โสภา", grade: "F" },
  { id: "B6618643", name: "นายกิตตินันท์ ปัจจัยโคถา", grade: "F" },
  { id: "B6619404", name: "นายธีรภัทร จันทะสุรีย์", grade: "F" },
  { id: "B6619459", name: "นางสาวสุปรียารัตน์ ตะเกิดมี", grade: "F" },
  { id: "B6619602", name: "นางสาวรุ่งอรุณ ศรีบัว", grade: "F" },
  { id: "B6626259", name: "นายณภัทร ศรีสุจันทร์", grade: "F" },
  { id: "B6627065", name: "นายกิตติศักดิ์ ชิ้นทอง", grade: "F" },
  { id: "B6627416", name: "นายตะวัน นามโสม", grade: "F" },
  { id: "B6627713", name: "นายทองนรินทร์ แย้มศรี", grade: "F" },
  { id: "B6628611", name: "นายอภิชาติ บรรพตะธิ", grade: "F" },
  { id: "B6628857", name: "นายอาระดิน สีสุระ", grade: "F" },
  { id: "B6629045", name: "นายศิริเดช สุภาพ", grade: "F" },
  { id: "B6629069", name: "นางสาวทอแสง ทักษิณ", grade: "F" },
  { id: "B6629298", name: "นางสาวปิยธิดา บัวบาน", grade: "F" },
  { id: "B6629304", name: "นายเจษฎา ชาวยศ", grade: "F" },
  { id: "B6630553", name: "นายชลวิทย์ ทองเหลา", grade: "F" },
  { id: "B6630652", name: "นางสาวนฤมล ดีจะบก", grade: "F" },
  { id: "B6631345", name: "นางสาวชุติกาญจน์ ชมกลาง", grade: "F" },
  { id: "B6631376", name: "นางสาวณิชาภัทร วัชระวงศ์บดี", grade: "F" },
  { id: "B6631505", name: "นางสาวสพัชญ์นนทน์ โคตรเวียง", grade: "F" },
  { id: "B6631659", name: "นายวงศกร ยอดกลาง", grade: "F" },
  { id: "B6639105", name: "นายนพวิศิษฏ์ ผลงาม", grade: "F" },
  { id: "B6639273", name: "นายปุญญพัฒน์ เกษหอม", grade: "F" },
  { id: "B6639631", name: "นายนนทพัทธ์ สาตราคม", grade: "F" },
  { id: "B6639709", name: "นางสาวกชพร อย่างบุญ", grade: "F" },
  { id: "B6639808", name: "นายสิบประวิทย์ พรมษา", grade: "F" },
  { id: "B6639846", name: "นายสายชล คำเพ็ง", grade: "F" },
  { id: "B6639921", name: "นายธนพัทธ์ พูนผล", grade: "F" },
  { id: "B6639983", name: "นายโกวิท ภูอ่าง", grade: "F" },
  { id: "B6639990", name: "นางสาวจันทิมา พลเสน", grade: "F" },
  { id: "B6640583", name: "นายรัฐศาสตร์ ทองเสงี่ยม", grade: "F" },
  { id: "B6640842", name: "นายยุทธนา สาธร", grade: "F" },
  { id: "B6640927", name: "นางสาววริศรา มากมูล", grade: "F" },
  { id: "B6641054", name: "นายณัฐนันท์ จันทร์สุริยา", grade: "F" },
  { id: "B6641085", name: "นางสาวชลธิชา สุขชาลี", grade: "F" },
  { id: "B6641948", name: "นายจิรวัฒน์ ซาด้วง", grade: "F" },
  { id: "B6643508", name: "นางสาวนิรชา มนต์ธนอาสน์", grade: "F" },
  { id: "B6643577", name: "นายพีรพงศ์ ลิมปศรีตระกูล", grade: "F" },
  { id: "B6643706", name: "นายชัยภัทร บุญมาสูงทรง", grade: "F" },
  { id: "B6643997", name: "นางสาวพิชญ์สินี ตีเมืองซ้าย", grade: "F" },
  { id: "B6644468", name: "นางสาวอัฐภิญญา จันทร์หนองหว้า", grade: "F" }
];

// ตัวเลือกเกรด
const GRADE_OPTIONS = ["A", "B+", "B", "C+", "C", "D+", "D", "F"];

export default function WhitePurpleLogin() {
  const [user, setUser] = useState<{ name: string; role: Role } | null>(null);
  const [username, setusername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [grades, setGrades] = useState(INITIAL_GRADES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempGrade, setTempGrade] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // --- 1. Load Data from LocalStorage (เมื่อเปิดเว็บ) ---
  useEffect(() => {
    // โหลดข้อมูลเกรดที่เคยบันทึกไว้
    const savedGrades = localStorage.getItem("sut_grades");
    if (savedGrades) {
      setGrades(JSON.parse(savedGrades));
    }

    // โหลดสถานะ Login (ถ้าอยากให้ Login ค้างไว้)
    const savedUser = localStorage.getItem("sut_user_session");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    setIsLoaded(true);
  }, []);

  // --- 2. Save Data to LocalStorage (เมื่อข้อมูลเปลี่ยน) ---
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("sut_grades", JSON.stringify(grades));
    }
  }, [grades, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      if (user) {
        localStorage.setItem("sut_user_session", JSON.stringify(user));
      } else {
        localStorage.removeItem("sut_user_session");
      }
    }
  }, [user, isLoaded]);


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = USERS.find((u) => u.username === username && u.pass === password);
    if (found) {
      setUser({ name: found.name, role: found.role });
      setError("");
    } else {
      setError("Invalid Credentials (Try: Aj.prin / lovemanchesterunited)");
    }
  };

  const handleLogout = () => {
    setUser(null);
    // ไม่ต้องลบเกรดตอน Logout (เพื่อให้เกรดที่แก้ไว้ยังอยู่เมื่อ Login ใหม่)
  };

  const canEdit = user ? ROLE_PERMISSIONS[user.role]?.includes("EDIT_GRADES") : false;
  
  const startEdit = (id: string, g: string) => { 
    if(canEdit) { setEditingId(id); setTempGrade(g); }
  };
  
  const saveGrade = (id: string) => { 
     setGrades(grades.map(g => g.id === id ? {...g, grade: tempGrade} : g)); 
     setEditingId(null); 
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    .wp-container {
      min-height: 100vh;
      padding-top: 40px; 
      background-color: #F3F0FF; 
      background-image: 
        radial-gradient(at 0% 0%, rgba(124, 58, 237, 0.05) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.1) 0px, transparent 50%);
      font-family: 'Inter', sans-serif;
      color: #1f2937;
    }
    .wp-content { max-width: 1000px; margin: 0 auto; padding: 20px; display: flex; flex-direction: column; align-items: center; }
    .wp-card {
      background: white; border-radius: 24px; box-shadow: 0 10px 40px -10px rgba(124, 58, 237, 0.1);
      border: 1px solid rgba(124, 58, 237, 0.05); width: 100%; max-width: 480px; padding: 40px;
      animation: fadeIn 0.5s ease-out;
    }
    .wp-title { font-size: 28px; font-weight: 700; color: #111827; margin-bottom: 8px; text-align: center; }
    .wp-subtitle { font-size: 14px; color: #6b7280; text-align: center; margin-bottom: 32px; }
    .wp-label { display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    .wp-input-wrapper { position: relative; margin-bottom: 20px; }
    .wp-input {
      width: 100%; padding: 12px 16px 12px 44px; border-radius: 12px; border: 1px solid #e5e7eb;
      background: #f9fafb; color: #1f2937; font-size: 14px; transition: 0.2s; outline: none;
    }
    .wp-input:focus { background: white; border-color: #7C3AF2; box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1); }
    .wp-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #9ca3af; width: 18px; height: 18px; }
    .wp-input:focus ~ .wp-icon { color: #7C3AF2; }
    .wp-btn-primary {
      width: 100%; padding: 14px; background: linear-gradient(135deg, #7C3AF2, #6d28d9);
      color: white; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer;
      display: flex; justify-content: center; align-items: center; gap: 8px; transition: 0.2s; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
    }
    .wp-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(124, 58, 237, 0.35); }
    .wp-dash-card { max-width: 900px; padding: 0; overflow: hidden; }
    .wp-dash-header { padding: 24px 32px; background: #fafafa; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: center; }
    .wp-table { width: 100%; border-collapse: collapse; }
    .wp-th { text-align: left; padding: 16px 24px; font-size: 12px; text-transform: uppercase; color: #6b7280; font-weight: 600; background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
    .wp-td { padding: 16px 24px; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #374151; }
    
    .wp-select {
       padding: 6px 12px; border-radius: 8px; border: 2px solid #7C3AF2;
       background: white; color: #7C3AF2; font-weight: 700;
       cursor: pointer; outline: none; text-align: center; font-size: 14px;
    }
    .wp-select option { color: #374151; font-weight: normal; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `;

  if (!isLoaded) return null;

  return (
    <div className="wp-container">
      <style>{css}</style>
      <div className="wp-content">
        {!user ? (
          <div className="wp-card">
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 50, height: 50, background: '#f3f0ff', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AF2' }}>
                <Lock size={24} />
              </div>
            </div>
            <h1 className="wp-title">Welcome Back</h1>
            <p className="wp-subtitle">Sign in to access the Academic Record System</p>
            <form onSubmit={handleLogin}>
              <div className="wp-input-wrapper">
                <label className="wp-label">Username</label>
                <input className="wp-input" type="text" placeholder="e.g. Aj.prin" value={username} onChange={(e) => setusername(e.target.value)} />
                <Mail className="wp-icon" />
              </div>
              <div className="wp-input-wrapper">
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <label className="wp-label">Password</label>
                  <a href="#" style={{fontSize:11, color:'#7C3AF2', textDecoration:'none', fontWeight:500}}>Forgot?</a>
                </div>
                <input className="wp-input" type="password" placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                <Key className="wp-icon" />
              </div>
              {error && <div style={{ background:'#fef2f2', color:'#dc2626', fontSize:12, padding:10, borderRadius:8, marginBottom:16, textAlign:'center', border:'1px solid #fee2e2' }}>{error}</div>}
              <button type="submit" className="wp-btn-primary">SECURE LOGIN <ArrowRight size={16} /></button>
            </form>
            <div style={{ marginTop: 24, textAlign: 'center' }}><p style={{ fontSize: 11, color: '#9ca3af', letterSpacing: 1 }}>SYSTEM V4.0 • SECURED BY RBAC</p></div>
          </div>
        ) : (
          <div className="wp-card wp-dash-card">
            <div className="wp-dash-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#F3F0FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AF2', fontWeight: 'bold' }}>{user.name.charAt(0)}</div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#1f2937' }}>Grade รายวิชา ENG23 4041 CYBER SECURITY FUNDAMENTALS</h2>
                  <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>Logged in as: <span style={{color: '#7C3AF2', fontWeight: 600}}>{user.name}</span></p>
                </div>
              </div>
              
              <div style={{display:'flex', gap: 8}}>
                <button onClick={handleLogout} style={{ background: 'white', border: '1px solid #e5e7eb', padding: '8px 12px', borderRadius: 8, fontSize: 12, color: '#4b5563', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
            <div style={{ padding: '16px 32px', background: canEdit ? '#ecfdf5' : '#fefce8', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: 12, alignItems: 'center' }}>
              <ShieldCheck size={20} color={canEdit ? '#059669' : '#d97706'} />
              <div>
                <strong style={{ fontSize: 13, color: canEdit ? '#065f46' : '#92400e', display: 'block' }}>{canEdit ? "ADMINISTRATIVE ACCESS GRANTED" : "READ-ONLY VIEW"}</strong>
                <span style={{ fontSize: 12, color: canEdit ? '#047857' : '#b45309' }}>{canEdit ? "You have permission to edit student grades." : "Editing is disabled for student accounts."}</span>
              </div>
            </div>
            <table className="wp-table">
              <thead>
                <tr>
                  <th className="wp-th">Student ID</th>
                  <th className="wp-th">Name</th>
                  <th className="wp-th" style={{textAlign:'center'}}>Grade</th>
                  {canEdit && <th className="wp-th" style={{textAlign:'right'}}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {grades.map((s) => (
                  <tr key={s.id}>
                    <td className="wp-td" style={{ fontFamily: 'monospace', color: '#7C3AF2', fontWeight: 600 }}>{s.id}</td>
                    <td className="wp-td">{s.name}</td>
                    <td className="wp-td" style={{textAlign:'center'}}>
                      {editingId === s.id ? (
                        <select 
                          className="wp-select"
                          value={tempGrade}
                          onChange={(e) => setTempGrade(e.target.value)}
                          autoFocus
                        >
                          {GRADE_OPTIONS.map((g) => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      ) : (
                        <span style={{ 
                          padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                          background: s.grade === 'A' ? '#ecfdf5' : s.grade === 'F' ? '#fef2f2' : '#f3f4f6',
                          color: s.grade === 'A' ? '#059669' : s.grade === 'F' ? '#dc2626' : '#374151',
                          border: `1px solid ${s.grade === 'A' ? '#d1fae5' : s.grade === 'F' ? '#fee2e2' : '#e5e7eb'}`
                        }}>
                          {s.grade}
                        </span>
                      )}
                    </td>
                    {canEdit && (
                      <td className="wp-td" style={{textAlign:'right'}}>
                        {editingId === s.id ? (
                          <button onClick={() => saveGrade(s.id)} style={{ border:'none', background:'#7C3AF2', color:'white', padding:'6px 12px', borderRadius:6, fontSize:11, fontWeight:600, cursor:'pointer' }}>SAVE</button>
                        ) : (
                          <button onClick={() => startEdit(s.id, s.grade)} style={{ border:'none', background:'transparent', color:'#6b7280', fontSize:12, textDecoration:'underline', cursor:'pointer' }}>Edit</button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}