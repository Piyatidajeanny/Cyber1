"use client";

import React, { useEffect, useReducer, useState } from "react";
import {
  RBAC_USERS,
  ROLES,
  EXPECTED_RBAC,
  SOD_RULES,
  MLS_EVENTS,
  ABAC_SCENARIOS,
  ABACScenario,
  MLSEvent,
} from "./data";
import Navbar from "../../components/Navbar";

// Simple styling uses Tailwind classes; if Tailwind not set up, classes will be ignored but layout still usable.

// Timer reducer
function timerReducer(state: any, action: any) {
  switch (action.type) {
    case "start":
      return { ...state, running: true, startAt: Date.now(), elapsed: 0 };
    case "tick":
      return { ...state, elapsed: action.payload };
    case "stop":
      return { ...state, running: false };
    default:
      return state;
  }
}

export default function AdminProtocol() {
  // phase: 1=RBAC,2=MLS,3=ABAC
  const [phase, setPhase] = useState<number>(1);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [hintCooldown, setHintCooldown] = useState<number>(0);

  // RBAC assignments
  const [assignments, setAssignments] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    RBAC_USERS.forEach((u) => (init[u.id] = ""));
    return init;
  });

  // MLS decisions
  const [mlsDecisions, setMlsDecisions] = useState<Record<string, boolean | null>>(() => {
    const init: Record<string, boolean | null> = {};
    MLS_EVENTS.forEach((e: MLSEvent) => (init[e.id] = null));
    return init;
  });

  // ABAC policy: represented as array of clauses {attr, op, value}. Simple AND chain; support NOT wrapper.
  const [policyClauses, setPolicyClauses] = useState<Array<any>>([]);

  // Timer
  const [timer, dispatchTimer] = useReducer(timerReducer, { running: false, startAt: 0, elapsed: 0 });

  useEffect(() => {
    let t: any;
    if (timer.running) {
      t = setInterval(() => {
        dispatchTimer({ type: "tick", payload: Math.floor((Date.now() - timer.startAt) / 1000) });
      }, 1000);
    }
    return () => clearInterval(t);
  }, [timer.running, timer.startAt]);

  useEffect(() => {
    if (hintCooldown > 0) {
      const id = setInterval(() => setHintCooldown((s) => Math.max(0, s - 1)), 1000);
      return () => clearInterval(id);
    }
  }, [hintCooldown]);

  function startGame() {
    setPhase(1);
    setScore(0);
    setMistakes(0);
    dispatchTimer({ type: "start" });
  }

  /* ---------------- RBAC Validation ---------------- */
  function submitRBAC() {
    // check each assignment against EXPECTED_RBAC
    let localMist = 0;
    for (const u of RBAC_USERS) {
      const assigned = assignments[u.id];
      const expected = EXPECTED_RBAC[u.id];
      if (assigned !== expected) localMist++;
      // check separation of duties (single role per user in this simple game)
      for (const [a, b] of SOD_RULES) {
        if (assigned === a && assigned === b) localMist++;
      }
    }
    if (localMist === 0) {
      setScore((s) => s + 100);
      setPhase(2);
    } else {
      setMistakes((m) => m + localMist);
    }
  }

  /* ---------------- MLS (Bell-LaPadula) ---------------- */
  function levelRank(l: string) {
    const ranks: Record<string, number> = { "Unclassified": 0, "Confidential": 1, Secret: 2, "Top Secret": 3 };
    return ranks[l] ?? 0;
  }

  function correctForEvent(e: MLSEvent) {
    // read allowed if subject.level >= object.level
    // write allowed if subject.level <= object.level (no write down prevents subject writing to lower)
    const s = levelRank(e.subjectLevel);
    const o = levelRank(e.objectLevel);
    if (e.action === "read") return s >= o;
    return s <= o;
  }

  function submitMLS() {
    let localMist = 0;
    for (const e of MLS_EVENTS) {
      const decision = mlsDecisions[e.id];
      const correct = correctForEvent(e);
      if ((decision ?? false) !== correct) localMist++;
    }
    if (localMist === 0) {
      setScore((s) => s + 150);
      setPhase(3);
    } else {
      setMistakes((m) => m + localMist);
    }
  }

  /* ---------------- ABAC Policy Evaluation ---------------- */
  // Policy clause example: { attr: 'role', op: '==', value: 'Manager', not: false }
  function evalClause(clause: any, scenario: ABACScenario) {
    const v = (scenario as any)[clause.attr];
    switch (clause.op) {
      case "==":
        return v == clause.value;
      case "in":
        return String(clause.value).includes(String(v));
      case "time_between": {
        const [from, to] = clause.value.split("-");
        const hhmm = scenario.time;
        return hhmm >= from && hhmm <= to;
      }
      default:
        return false;
    }
  }

  function evaluatePolicyForScenario(policy: any[], scenario: ABACScenario) {
    // combine with AND across clauses, respecting NOT flag
    for (const c of policy) {
      const res = evalClause(c, scenario);
      const final = c.not ? !res : res;
      if (!final) return false;
    }
    return true;
  }

  function testPolicy() {
    // run through scenarios and check if policy matches expected shouldAllow: detect false positives or false negatives
    let localMist = 0;
    for (const s of ABAC_SCENARIOS) {
      const verdict = evaluatePolicyForScenario(policyClauses, s);
      if (verdict !== s.shouldAllow) localMist++;
    }
    if (localMist === 0) {
      setScore((sc) => sc + 200);
    } else {
      setMistakes((m) => m + localMist);
    }
    return localMist;
  }

  /* ---------------- Hint system ---------------- */
  function giveHint() {
    if (hintCooldown > 0) return null;
    setHintCooldown(180); // 3 minutes
    if (phase === 1) return "เบาะแส: ดูตำแหน่งงานในคำร้องเรียน เช่น HR -> HR Manager";
    if (phase === 2) return "เบาะแส: ตาม Bell-LaPadula: No Read Up, No Write Down";
    return "เบาะแส: สำหรับ ABAC ลองใช้ role+เวลา+device เงื่อนไข";
  }

  /* ---------------- UI ---------------- */
  return (
    <div>
      
      <div className="container">
        <div className="hero">
          <h1>Admin Protocol — Authorization Training</h1>
          <p>สามด่านเรียนรู้ RBAC, MLS (Bell–LaPadula) และ ABAC — ใช้เวลาประมาณ 30–40 นาที</p>
        </div>

        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <span className="stamp">Phase {phase} / 3</span>
          </div>
          <div className="row">
            <div className="mono">Score: {score}</div>
            <div className="mono">Mistakes: {mistakes}</div>
            {!timer.running && <button className="btn btnPrimary" onClick={startGame}>Start Game</button>}
          </div>
        </div>

        {/* Phase panels */}
        {phase === 1 && (
          <section className="card">
            <h2>Phase 1 — RBAC (One Hard Assignment)</h2>
            <p className="text-sm">โจทย์เดียว: ให้แจกบทบาทให้กับพนักงานทุกคนภายใต้เงื่อนไขข้อจำกัด (Separation of Duties, จำนวนผู้ถือบทบาท, ข้อห้ามบางบทบาท) — ต้องถูกทั้งหมดเพียงครั้งเดียว</p>

            <div className="grid2" style={{ marginTop: 18 }}>
              <div>
                {RBAC_USERS.map((u) => (
                  <div key={u.id} style={{ padding: 12, borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 700 }}>{u.name} ({u.job})</div>
                    <div style={{ color: 'var(--muted)', fontSize: 13 }}>{u.complaint}</div>
                    <select className="input" value={assignments[u.id]} onChange={(e) => setAssignments((s) => ({ ...s, [u.id]: e.target.value }))}>
                      <option value="">-- เลือกบทบาท --</option>
                      {ROLES.map((r) => (
                        <option key={r.id} value={r.id}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div>
                <h3>Constraints</h3>
                <ul style={{ color: 'var(--muted)', fontSize: 13 }}>
                  <li>- ห้ามให้ Developer คนใดมีบทบาท 'admin' หรือ 'ops'</li>
                  <li>- Separation of Duties: หนึ่งคนห้ามเป็น Developer และ Admin พร้อมกัน</li>
                  <li>- ต้องมี <strong>exact</strong> role counts ตามเงื่อนไขที่ซ่อนอยู่ (จะตรวจสอบเมื่อส่ง)</li>
                </ul>
                <div style={{ marginTop: 12 }}>
                  <button className="btn" onClick={submitRBAC}>ส่งคำตอบ (ส่งเพียงครั้งเดียว)</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {phase === 2 && (
          <section className="card">
            <h2>Phase 2 — MLS (Single Complex Audit)</h2>
            <p className="text-sm">โจทย์เดียว: ตรวจสอบเหตุการณ์การทำงานชุดเดียวที่ประกอบด้วยหลาย action และตัดสินใจว่า 'ชุดเหตุการณ์' นั้นควรอนุญาตหรือปฏิเสธตาม Bell–LaPadula (No Read Up / No Write Down)</p>

            <div style={{ marginTop: 16 }}>
              <div style={{ padding: 12, borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700 }}>Audit Summary</div>
                <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 8 }}>
                  รายการเหตุการณ์ (ลำดับ):
                  <ol>
                    {MLS_EVENTS.slice(0, 6).map((e) => (
                      <li key={e.id} style={{ marginTop: 6 }}>{e.subject} ({e.subjectLevel}) → {e.action} → {e.object} ({e.objectLevel})</li>
                    ))}
                  </ol>
                </div>
                <div style={{ marginTop: 12 }}>
                  <div className="text-sm" style={{ marginBottom: 8 }}>สรุป: ให้ตัดสินใจว่าชุดเหตุการณ์นี้โดยรวมควรถูก 'Allow' หรือ 'Deny' (พิจารณาทั้ง read/write ตามระดับความลับ)</div>
                  <div className="row">
                    <button className="btn" onClick={() => { setMlsDecisions((s) => ({ ...s, audit: true })); }}>Allow</button>
                    <button className="btn" onClick={() => { setMlsDecisions((s) => ({ ...s, audit: false })); }}>Deny</button>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <button className="btn" onClick={() => {
                // Evaluate: the audit is allowed only if every sub-event is allowed by Bell-LaPadula
                const allAllowed = MLS_EVENTS.slice(0, 6).every((e) => correctForEvent(e));
                const userChoice = mlsDecisions['audit'] ?? false;
                if (userChoice === allAllowed) {
                  setScore((s) => s + 150);
                  setPhase(3);
                } else {
                  setMistakes((m) => m + 1);
                }
              }}>Submit Phase 2</button>
            </div>
          </section>
        )}

        {phase === 3 && (
          <section className="card">
            <h2>Phase 3 — ABAC (Zero Trust Gate)</h2>
            <p className="text-sm">สร้าง policy เงื่อนไข (AND chain) แล้วทดสอบกับ scenarios</p>

            <div style={{ marginTop: 12 }}>
              <div className="row" style={{ gap: 8 }}>
                <select id="attr" className="input" style={{ maxWidth: 140 }}>
                  <option value="role">role</option>
                  <option value="time">time</option>
                  <option value="ip">ip</option>
                  <option value="device">device</option>
                </select>
                <select id="op" className="input" style={{ maxWidth: 160 }}>
                  <option value="==">==</option>
                  <option value="in">contains</option>
                  <option value="time_between">time_between</option>
                </select>
                <input id="val" className="input" placeholder="value (HH:MM-HH:MM)" />
                <button className="btn" onClick={() => {
                  const attr = (document.getElementById("attr") as HTMLSelectElement).value;
                  const op = (document.getElementById("op") as HTMLSelectElement).value;
                  const val = (document.getElementById("val") as HTMLInputElement).value;
                  setPolicyClauses((p) => [...p, { attr, op, value: val }]);
                }}>Add Clause</button>
              </div>

              <div style={{ marginTop: 12 }}>
                <div>Current Policy (AND):</div>
                <ul style={{ color: 'var(--muted)', fontSize: 13 }}>
                  {policyClauses.map((c, i) => (<li key={i}>{`${c.attr} ${c.op} ${c.value}`}</li>))}
                </ul>
              </div>

              <div style={{ marginTop: 12 }}>
                <button className="btn" onClick={() => {
                  const mistakes = testPolicy();
                  if (mistakes === 0) {
                    setPhase(4); // finished
                    setScore((s) => s + 300);
                    dispatchTimer({ type: "stop" });
                  }
                }}>Test Policy</button>
              </div>

              <div style={{ marginTop: 12 }}>
                <div>Scenarios:</div>
                <pre style={{ background: 'var(--panel)', padding: 12, borderRadius: 12 }}>{JSON.stringify(ABAC_SCENARIOS, null, 2)}</pre>
              </div>
            </div>
          </section>
        )}

        {phase === 4 && (
          <section className="card" style={{ marginTop: 12 }}>
            <h2>Results</h2>
            <p className="text-sm">เสร็จสิ้น — คะแนนรวม: {score} เวลาที่ใช้: {timer.elapsed}s</p>
          </section>
        )}

        <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button className="btn" onClick={() => alert(giveHint())} disabled={hintCooldown > 0}>{hintCooldown > 0 ? `Hint cooldown ${hintCooldown}s` : "Get Hint"}</button>
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>Hints slow down gameplay (3 min cooldown)</div>
        </div>
      </div>
    </div>
  );

}
