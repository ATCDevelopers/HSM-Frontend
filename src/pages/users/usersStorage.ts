export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: "ACTIVE" | "INACTIVE";
  photo?: string;
}

const storageKey = "hms_users";

export function readUsers(): User[] {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeUsers(users: User[]) {
  localStorage.setItem(storageKey, JSON.stringify(users));
}

export function generateUserId(users: User[]) {
  return `U-${String(users.length + 1).padStart(3, "0")}`;
}

export const defaultUsers: User[] = [
  { id: "U-001", firstName: "System", lastName: "Admin", email: "admin@hms.local", role: "SYS_ADMIN", status: "ACTIVE" },
  { id: "U-002", firstName: "Nora", lastName: "Nurse", email: "nora@example.com", role: "NURSE", status: "ACTIVE" },
  { id: "U-003", firstName: "Peter", lastName: "Pharm", email: "pharm@example.com", role: "PHARM", status: "ACTIVE" },
];
