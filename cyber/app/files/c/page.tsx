"use client";

import React, { useState, useEffect } from "react";
import { Lock, ArrowRight, LogOut, User, Save, ShieldCheck, Eye, EyeOff, AlertTriangle, X, HelpCircle, Search } from "lucide-react";

// --- 1. CONFIGURATION & LOGIC ---
type Role = "STUDENT" | "TEACHER" | "ADMIN"; 
type Permission = "VIEW_GRADES" | "EDIT_GRADES";


const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  STUDENT: ["VIEW_GRADES"],
  TEACHER: ["VIEW_GRADES", "EDIT_GRADES"],
  ADMIN: ["VIEW_GRADES", "EDIT_GRADES"]
};

const USERS = [
  { username: "student", pass: "ajparinlovem4nch3st3runit3d", role: "STUDENT" as Role, name: "กรอบกู้ เเทนเพื่อน" },
];

const ADMIN_SECRET_CODE = "ADMINJAAA"; 

const INITIAL_GRADES = [
  { id: "B6514822", name: "นางสาวกนกพร จำปาหอม", grade: "F" },
  { id: "B6600907", name: "นางสาววรัทยา ปัตตะเน", grade: "F" },
  { id: "B6603892", name: "นายศุภณัฐ สิงหา", grade: "F" },
  { id: "B6603908", name: "นายชทัตพล เสริมศรี", grade: "F" },
  { id: "B6603946", name: "นายสุรเกียรติ สิงขรอาสน์", grade: "F" },
  { id: "B6631659", name: "นายวงศกร ยอดกลาง", grade: "F" },
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

const GRADE_OPTIONS = ["A", "B+", "B", "C+", "C", "D+", "D", "F"];

// --- Helper Functions for Unicode Base64 (แก้ปัญหาภาษาไทย) ---
const toBase64 = (str: string) => {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        (match, p1) => String.fromCharCode(parseInt(p1, 16)))
    );
};

const fromBase64 = (str: string) => {
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
};

export default function WhitePurpleLogin() {
  const [user, setUser] = useState<{ name: string; role: Role } | null>(null);
  const [username, setusername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [grades, setGrades] = useState(INITIAL_GRADES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempGrade, setTempGrade] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  // State สำหรับ Dual Control Modal
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalCode, setApprovalCode] = useState("");
  const [pendingSave, setPendingSave] = useState<{id: string, grade: string} | null>(null);
  const [approvalError, setApprovalError] = useState("");
  const [showHint, setShowHint] = useState(false); 

  // --- 1. Load Data ---
  useEffect(() => {
    const savedGrades = localStorage.getItem("sut_grades");
    if (savedGrades) setGrades(JSON.parse(savedGrades));

    const savedSession = localStorage.getItem("sut_session_token");
    if (savedSession) {
      try {
        const decoded = fromBase64(savedSession);
        const userData = JSON.parse(decoded);
        setUser(userData);
      } catch (e) {
        console.error("Invalid Session Token", e);
        localStorage.removeItem("sut_session_token");
      }
    }
    
    setIsLoaded(true);
  }, []);

  // --- 2. Save Data ---
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("sut_grades", JSON.stringify(grades));
    }
  }, [grades, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      if (user) {
        try {
            const token = toBase64(JSON.stringify(user));
            localStorage.setItem("sut_session_token", token);
        } catch (e) {
            console.error("Error encoding session", e);
        }
      } else {
        localStorage.removeItem("sut_session_token");
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
      setError("Invalid Credentials");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setusername("");
    setPassword("");
  };

  // ฟังก์ชัน Reset ระบบ (Clear LocalStorage)
  const handleSystemReset = () => {
    if (window.confirm("คุณต้องการรีเซ็ตระบบกลับเป็นค่าเริ่มต้นใช่หรือไม่? \n(ข้อมูลที่แก้ไว้จะหายหมด)")) {
      localStorage.removeItem("sut_grades");
      localStorage.removeItem("sut_session_token");
      window.location.reload(); 
    }
  };

  const canEdit = user ? ROLE_PERMISSIONS[user.role]?.includes("EDIT_GRADES") : false;
  
  const startEdit = (id: string, g: string) => { 
    if(canEdit) { setEditingId(id); setTempGrade(g); }
  };
  
  // --- Dual Control Logic ---
  const initiateSave = (id: string) => {
    
      setPendingSave({ id, grade: tempGrade });
      setShowApprovalModal(true);
      setShowHint(false); // Reset Hint ทุกครั้งที่เปิด Modal
      setApprovalCode("");
      setApprovalError("");
    
  };

  const performSave = (id: string, g: string) => {
    setGrades(grades.map(item => item.id === id ? {...item, grade: g} : item));
    setEditingId(null);
    setPendingSave(null);
    setShowApprovalModal(false);
  };

  const handleApprovalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (approvalCode === ADMIN_SECRET_CODE) {
      if (pendingSave) performSave(pendingSave.id, pendingSave.grade);
      
      setShowSuccessModal(true); // สั่งเปิดหน้าต่าง Success
      
    } else {
      setApprovalError("❌ Incorrect ADMIN_SECRET_CODE Code! Access Denied.");
    }
  };

  // --- STYLES ---
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    .wp-container {
      min-height: 100vh;
      background-color: #F3F0FF; 
      background-image: radial-gradient(at 0% 0%, rgba(124, 58, 237, 0.05) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.1) 0px, transparent 50%);
      font-family: 'Inter', sans-serif; color: #1f2937;
      display: flex;
      flex-direction: column;
    }
    
    /* Header Styles (Can be removed if unused, but kept for safety) */
    .wp-header {
      padding: 16px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }
    .wp-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .wp-logo-box {
      width: 40px; height: 40px;
      background: linear-gradient(135deg, #7C3AF2, #6d28d9);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      color: white;
      box-shadow: 0 4px 10px rgba(124, 58, 237, 0.2);
    }
    .wp-brand-text h1 { margin: 0; font-size: 16px; font-weight: 700; color: #111827; }
    .wp-brand-text p { margin: 0; font-size: 12px; color: #6b7280; }
    
    .wp-nav { display: flex; align-items: center; gap: 24px; }
    .wp-nav-link { text-decoration: none; color: #111827; font-weight: 600; font-size: 14px; }
    .wp-btn-reset {
        background: #fff7ed;
        border: 1px solid #fdba74;
        color: #c2410c;
        padding: 8px 20px;
        border-radius: 20px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: 0.2s;
    }
    .wp-btn-reset:hover { background: #ffedd5; }

    .wp-content { width: 100%; max-width: 1000px; margin: 0 auto; padding: 20px; display: flex; flex-direction: column; align-items: center; flex-grow: 1; justify-content: center; }
    
    .wp-card {
      background: white; border-radius: 24px; box-shadow: 0 10px 40px -10px rgba(124, 58, 237, 0.1);
      border: 1px solid rgba(124, 58, 237, 0.05); width: 100%; max-width: 480px; padding: 40px;
      animation: fadeIn 0.5s ease-out; position: relative;
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
    .wp-select { padding: 6px 12px; border-radius: 8px; border: 2px solid #7C3AF2; background: white; color: #7C3AF2; font-weight: 700; cursor: pointer; outline: none; text-align: center; font-size: 14px; }
    
    /* Modal Styles */
    .wp-modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center; z-index: 100; animation: fadeIn 0.2s;
    }
    .wp-modal {
      background: white; width: 100%; max-width: 400px; padding: 30px; border-radius: 20px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.2); text-align: center; position: relative;
    }
    .wp-modal-icon {
      width: 60px; height: 60px; background: #fee2e2; color: #dc2626; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;
    }
    
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `;

  if (!isLoaded) return null;

  return (
    <div className="wp-container">
      <style>{css}</style>
      
      {/* ⚠️ ลบส่วน Header ตรงนี้ออกแล้ว เพื่อไม่ให้ซ้ำกับ Layout ⚠️ */}

      <div className="wp-content">
        {!user ? (
          <div className="wp-card">
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 50, height: 50, background: '#f3f0ff', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AF2' }}>
                <Lock size={24} />
              </div>
            </div>
            <h1 className="wp-title">REG SUT</h1>
            <p className="wp-subtitle">Sign in to access the REG</p>
            <form onSubmit={handleLogin}>
              <div className="wp-input-wrapper">
                <label className="wp-label">Username</label>
                <input className="wp-input" type="text" placeholder="st....." value={username} onChange={(e) => setusername(e.target.value)} />
                
              </div>
              <div className="wp-input-wrapper">
                <div style={{display:'flex', justifyContent:'space-between'}}><label className="wp-label">Password</label></div>
                <div style={{position: 'relative'}}>
                    <input className="wp-input" type={showPassword ? "text" : "password"} placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                    
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9ca3af'}}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
              </div>
              {error && <div style={{ background:'#fef2f2', color:'#dc2626', fontSize:12, padding:10, borderRadius:8, marginBottom:16, textAlign:'center', border:'1px solid #fee2e2' }}>{error}</div>}
              <button type="submit" className="wp-btn-primary">LOGIN <ArrowRight size={16} /></button>
            </form>
            <div style={{marginTop: 15, fontSize: 12, color: '#6b7280'}}>
                        <button type="button" onClick={() => setShowHint(!showHint)} style={{background: 'none', border: 'none', color: '#7C3AF2', cursor: 'pointer', textDecoration: 'underline', display:'flex', alignItems:'center', justifyContent:'center', gap:4, width:'100%'}}>
                           <HelpCircle size={14} /> {showHint ? "ซ่อนความลับ" : "ซ่อนความลับ"}
                        </button>
                        
                        {showHint && (
                            <div style={{marginTop: 8, padding: 10, background: '#f3f4f6', borderRadius: 8, border: '1px dashed #d1d5db', lineHeight: 1.5, fontSize:12}}>
                                💡 usesername คือ<strong>นักเรียน</strong> ภาษาฝรั่ง<br/>
                                💡 password คือ<strong>สิ่งที่ได้จากที่ผ่านมา</strong> 
                                
                            </div>
                        )}
                    </div>
          </div>
        ) : (
          <div className="wp-card wp-dash-card">
            <div className="wp-dash-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#F3F0FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AF2', fontWeight: 'bold' }}>{user.name.charAt(0)}</div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#1f2937' }}>Academic Dashboard</h2>
                  <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>Logged in as: <span style={{color: '#7C3AF2', fontWeight: 600}}>{user.name}</span> <span style={{fontSize:10, background:'#e5e7eb', padding:'2px 6px', borderRadius:4}}>{user.role}</span></p>
                </div>
                
              </div>
             <div style={{ display: 'flex', gap: 8, alignItems: 'center', position: 'relative' }}>
                
                {/* 2. ปุ่ม Hint */}
                <button 
                  onClick={() => setShowHint(!showHint)} 
                  style={{ background: showHint ? '#F3F0FF' : 'white', border: '1px solid #e5e7eb', padding: '8px 12px', borderRadius: 8, fontSize: 12, color: '#7C3AF2', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <HelpCircle size={14} /> {showHint ? "ปิดคำใบ้" : "คำใบ้"}
                </button>

                {/* 3. ปุ่ม Sign Out (อันเดิม) */}
                <button onClick={handleLogout} style={{ background: 'white', border: '1px solid #e5e7eb', padding: '8px 12px', borderRadius: 8, fontSize: 12, color: '#4b5563', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <LogOut size={14} /> Sign Out
                </button>

                {/* 4. กล่องข้อความ Hint (Popup) */}
                {showHint && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '120%', 
                    right: 0, 
                    width: 280, 
                    padding: 16, 
                    background: 'white', 
                    borderRadius: 12, 
                    border: '1px solid #e5e7eb', 
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', 
                    zIndex: 50,
                    fontSize: 12,
                    lineHeight: 1.5,
                    color: '#4b5563',
                    textAlign: 'left'
                  }}>
                      <div style={{marginBottom: 8, fontWeight: 700, color: '#111827', display:'flex', alignItems:'center', gap:6}}>💡 อย่าลืมไปอาคาร<strong>F12</strong></div>
                      ถ้ามีอุปสรรคอย่าลืมบอกลุงconsoleว่า...<br/>
                      <strong>allow pasting</strong> ค่อยๆบอกลุงนะ<br/>
                      เสร็จเเล้วก็ลองไปเเลกของกับลุง<strong>base6...</strong> นะ<br/>
                      
                  </div>
                )}
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
                {grades.slice(0, 20).map((s) => (
                  <tr key={s.id}>
                    <td className="wp-td" style={{ fontFamily: 'monospace', color: '#7C3AF2', fontWeight: 600 }}>{s.id}</td>
                    <td className="wp-td">{s.name}</td>
                    <td className="wp-td" style={{textAlign:'center'}}>
                      {editingId === s.id ? (
                        <select className="wp-select" value={tempGrade} onChange={(e) => setTempGrade(e.target.value)} autoFocus>
                          {GRADE_OPTIONS.map((g) => (<option key={g} value={g}>{g}</option>))}
                        </select>
                      ) : (
                        <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: s.grade === 'A' ? '#ecfdf5' : s.grade === 'F' ? '#fef2f2' : '#f3f4f6', color: s.grade === 'A' ? '#059669' : s.grade === 'F' ? '#dc2626' : '#374151', border: `1px solid ${s.grade === 'A' ? '#d1fae5' : s.grade === 'F' ? '#fee2e2' : '#e5e7eb'}` }}>
                          {s.grade}
                        </span>
                      )}
                    </td>
                    {canEdit && (
                      <td className="wp-td" style={{textAlign:'right'}}>
                        {editingId === s.id ? (
                          <button onClick={() => initiateSave(s.id)} style={{ border:'none', background:'#7C3AF2', color:'white', padding:'6px 12px', borderRadius:6, fontSize:11, fontWeight:600, cursor:'pointer' }}>SAVE</button>
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
        

        {/* Dual Control Modal */}
        {showApprovalModal && (
          <div className="wp-modal-overlay">
            <div className="wp-modal">
                <button onClick={() => setShowApprovalModal(false)} style={{position:'absolute', top:16, right:16, background:'none', border:'none', cursor:'pointer'}}><X size={20} color="#9ca3af" /></button>
                <div className="wp-modal-icon"><AlertTriangle size={32} /></div>
                <h3 style={{fontSize:18, fontWeight:700, color:'#111827', marginBottom:8}}>ต้องได้รับอนุมัติจากผู้ดูเเล</h3>
                <p style={{fontSize:14, color:'#6b7280', marginBottom:24}}>การเปลี่ยนเกรดต้องได้รับอนุญาติจาก Admin น๊าาอ้วงง</p>
                
                <form onSubmit={handleApprovalSubmit}>
                    <input 
                        type="password" 
                        placeholder="Enter ADMIN_SECRET_CODE Code" 
                        className="wp-input" 
                        style={{textAlign:'center', paddingLeft:16, paddingRight:16, letterSpacing:4}}
                        value={approvalCode}
                        onChange={(e) => setApprovalCode(e.target.value)}
                        autoFocus
                    />
                    {approvalError && <div style={{marginTop:12, color:'#dc2626', fontSize:12, fontWeight:600}}>{approvalError}</div>}
                    <button type="submit" className="wp-btn-primary" style={{marginTop:20, background:'#dc2626'}}>ยืนยัน</button>
                    
                    {/* ปุ่ม Hint อยู่ตรงนี้ */}
                    <div style={{marginTop: 15, fontSize: 12, color: '#6b7280'}}>
                        <button type="button" onClick={() => setShowHint(!showHint)} style={{background: 'none', border: 'none', color: '#7C3AF2', cursor: 'pointer', textDecoration: 'underline', display:'flex', alignItems:'center', justifyContent:'center', gap:4, width:'100%'}}>
                           <HelpCircle size={14} /> {showHint ? "ซ่อนความลับ" : "ซ่อนความลับ"}
                        </button>
                        
                        {showHint && (
                            <div style={{marginTop: 8, padding: 10, background: '#f3f4f6', borderRadius: 8, border: '1px dashed #d1d5db', lineHeight: 1.5, fontSize:12}}>
                                💡 <strong>อยากรู้อ๊ะป่าวว</strong> <br/>
                                วันพีชอ่ะมีอยู่จริงน๊าาาาาาาาา<br/>
                                ลองกด <strong>F12</strong> (Developer Tools)<br/>
                                เเล้วก็ลองหาคำว่า <strong>"SECRET_CODE"</strong> บอกเเค่นี้เเหละอิอิ
                            </div>
                        )}
                    </div>

                </form>
            </div>
          </div>
        )}
        {showSuccessModal && (
          <div className="wp-modal-overlay">
            <div className="wp-modal" style={{border: '2px solid #059669'}}>
                <div className="wp-modal-icon" style={{background: '#ecfdf5', color:'#059669'}}>
                    <ShieldCheck size={32} />
                </div>
                <h3 style={{fontSize:20, fontWeight:700, color:'#065f46', marginBottom:8}}>MISSION COMPLETE!</h3>
                <p style={{fontSize:14, color:'#6b7280', marginBottom:24}}>
                    คุณสามารถเจาะระบบ Dual Control ได้สำเร็จ<br/>
                    นี่คือรางวัลสำหรับแฮกเกอร์คนเก่ง
                </p>
                
                <div style={{background:'#f3f4f6', padding:16, borderRadius:8, fontFamily:'monospace', fontWeight:'bold', color:'#7C3AF2', border:'1px dashed #7C3AF2', marginBottom:20}}>
                    FLAG{'{CLIENT_SIDE_SECRETS_EXPOSED}'}
                </div>

                <button onClick={() => setShowSuccessModal(false)} className="wp-btn-primary" style={{background:'#059669'}}>
                    ปิดหน้าต่าง
                </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}