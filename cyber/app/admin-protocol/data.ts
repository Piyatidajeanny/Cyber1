export type UserRecord = {
  id: string;
  name: string;
  job: string;
  complaint: string;
};

export const RBAC_USERS: UserRecord[] = [
  { id: "u1", name: "Somchai", job: "HR", complaint: "ฉันเป็น HR แต่ดูเงินเดือนไม่ได้" },
  { id: "u2", name: "Arisa", job: "Developer", complaint: "ฉันเป็น Dev แต่เผลอลบ Database ได้" },
  { id: "u3", name: "Natee", job: "Intern", complaint: "ผมไม่สามารถดูเอกสารทั่วไปได้" },
  { id: "u4", name: "Ploy", job: "Manager", complaint: "ต้องอนุมัติเอกสาร HR แต่ไม่เห็นปุ่มอนุมัติ" },
  { id: "u5", name: "Krit", job: "Security", complaint: "อยากมีสิทธิ์ดู log ทั้งหมด" },
];

export const ROLES = [
  { id: "admin", label: "Admin" },
  { id: "hr_manager", label: "HR Manager" },
  { id: "developer", label: "Developer" },
  { id: "intern", label: "Intern" },
  { id: "security", label: "Security" },
];

// expected correct mapping for validation
export const EXPECTED_RBAC: Record<string, string> = {
  u1: "hr_manager",
  u2: "developer",
  u3: "intern",
  u4: "hr_manager",
  u5: "security",
};

// Separation of duties rules: roleA must not be combined with roleB (for simplicity, single role per user)
export const SOD_RULES: Array<[string, string]> = [["developer", "admin"]];

// MLS events (subject clearance, action, object classification)
export type MLSEvent = {
  id: string;
  subject: string; // name
  subjectLevel: "Top Secret" | "Secret" | "Confidential" | "Unclassified";
  action: "read" | "write";
  object: string;
  objectLevel: "Top Secret" | "Secret" | "Confidential" | "Unclassified";
};

export const MLS_EVENTS: MLSEvent[] = [
  { id: "e1", subject: "General A", subjectLevel: "Secret", action: "write", object: "ReportX", objectLevel: "Confidential" },
  { id: "e2", subject: "Captain B", subjectLevel: "Confidential", action: "read", object: "Orders", objectLevel: "Top Secret" },
  { id: "e3", subject: "Colonel C", subjectLevel: "Top Secret", action: "read", object: "Brief", objectLevel: "Secret" },
  { id: "e4", subject: "Lieutenant D", subjectLevel: "Unclassified", action: "write", object: "Notes", objectLevel: "Unclassified" },
  { id: "e5", subject: "Major E", subjectLevel: "Secret", action: "read", object: "Summary", objectLevel: "Secret" },
  { id: "e6", subject: "Captain F", subjectLevel: "Confidential", action: "write", object: "Logs", objectLevel: "Top Secret" },
  { id: "e7", subject: "General G", subjectLevel: "Top Secret", action: "write", object: "Leaks", objectLevel: "Confidential" },
  { id: "e8", subject: "Sergeant H", subjectLevel: "Confidential", action: "read", object: "Manual", objectLevel: "Confidential" },
  { id: "e9", subject: "Private I", subjectLevel: "Unclassified", action: "read", object: "Instructions", objectLevel: "Confidential" },
  { id: "e10", subject: "Major J", subjectLevel: "Secret", action: "write", object: "Directive", objectLevel: "Top Secret" },
];

// ABAC scenarios (logs) used to test policies. Each scenario has attributes and expected: shouldAllow (boolean) for correct policy verdict.
export type ABACScenario = {
  id: string;
  role: string;
  time: string; // HH:MM
  ip: string;
  device: string;
  dept: string;
  isHacker?: boolean; // ground truth
  shouldAllow: boolean;
};

export const ABAC_SCENARIOS: ABACScenario[] = [
  { id: "s1", role: "Manager", time: "09:15", ip: "10.0.0.12", device: "Desktop", dept: "Finance", isHacker: false, shouldAllow: true },
  { id: "s2", role: "Manager", time: "22:05", ip: "10.0.0.12", device: "Desktop", dept: "Finance", isHacker: false, shouldAllow: false },
  { id: "s3", role: "CEO", time: "23:20", ip: "203.0.113.5", device: "Mobile", dept: "Executive", isHacker: false, shouldAllow: true },
  { id: "s4", role: "Contractor", time: "10:00", ip: "198.51.100.7", device: "Mobile", dept: "Ops", isHacker: true, shouldAllow: false },
  { id: "s5", role: "Manager", time: "11:00", ip: "10.0.0.50", device: "Mobile", dept: "Finance", isHacker: true, shouldAllow: false },
];
