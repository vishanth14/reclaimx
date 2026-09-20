export interface User {
  id: string
  name: string
  email: string
  role: "student" | "staff" | "security"
  studentId?: string
  department?: string
  phone?: string
}

export const MOCK_USERS: User[] = [
  {
    id: "user-vishanth",
    name: "Vishanth K",
    email: "vishanth@campus.edu",
    role: "student",
    studentId: "ST-892402",
    department: "Cognitive & Computing Systems",
    phone: "+1 (555) 019-2834",
  },
  {
    id: "user-finder-01",
    name: "Alex Chen",
    email: "a.chen@campus.edu",
    role: "student",
    studentId: "ST-774109",
    department: "Electrical Engineering",
  },
  {
    id: "user-finder-02",
    name: "Marcus Davis",
    email: "m.davis@campus.edu",
    role: "staff",
    department: "Library Services",
  },
]

export function getCurrentUser(): User {
  // In development, returns the active user (replaceable by AWS Cognito session)
  return MOCK_USERS[0]
}
