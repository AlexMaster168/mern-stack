export type UserRole = 'admin' | 'instructor' | 'student'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

export interface Link {
  _id: string
  from: string
  to: string
  code: string
  clicks: number
  owner: string
  workspace: string | null
  custom: boolean
  expiresAt: string | null
  maxClicks: number | null
  disabled: boolean
  hasPassword: boolean
  createdAt: string
  updatedAt: string
}

// ── Команды (workspaces) ───────────────────────────────────────────────────────
export type WorkspaceRole = 'owner' | 'editor' | 'viewer'

export interface WorkspaceSummary {
  _id: string
  name: string
  role: WorkspaceRole
  memberCount: number
  linkCount: number
  createdAt: string
}

export interface WorkspaceMember {
  userId: string
  email: string
  name: string
  role: WorkspaceRole
}

export interface WorkspaceDetail {
  _id: string
  name: string
  ownerId: string
  myRole: WorkspaceRole
  members: WorkspaceMember[]
}

// ── Аналитика кликов ───────────────────────────────────────────────────────────
export interface CountPoint {
  name: string
  value: number
}

export interface LinkStats {
  total: number
  byDay: CountPoint[]
  byReferer: CountPoint[]
  byDevice: CountPoint[]
  byBrowser: CountPoint[]
}

export interface AuthResponse {
  accessToken: string
  user: User
}

// ── LMS ──────────────────────────────────────────────────────────────────────
export type ChartType = 'bar' | 'line' | 'pie'
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced'

export interface ChartPoint {
  name: string
  value: number
}

export interface ContentBlock {
  type: 'text' | 'image' | 'chart'
  value?: string
  url?: string
  caption?: string
  chartType?: ChartType
  data?: ChartPoint[]
}

export interface CourseAuthor {
  _id: string
  name: string
  email: string
}

export interface Course {
  _id: string
  title: string
  slug: string
  summary: string
  contentBlocks: ContentBlock[]
  coverImage: string
  gallery: string[]
  category: string
  level: CourseLevel
  status: 'draft' | 'published'
  instructor: CourseAuthor | string
  createdAt: string
  updatedAt: string
}

export interface Module {
  _id: string
  course: string
  title: string
  order: number
}

export interface Lesson {
  _id: string
  course: string
  module: string | null
  title: string
  content: ContentBlock[]
  videoUrl: string
  order: number
  duration: number
}

export interface CourseDetail {
  course: Course
  modules: Module[]
  lessons: Lesson[]
}

export interface Enrollment {
  _id: string
  user: string
  course: Course | string
  completedLessons: string[]
  status: 'active' | 'completed'
  createdAt: string
}

export interface Comment {
  _id: string
  user: CourseAuthor | string
  course: string
  text: string
  rating?: number
  createdAt: string
}

// ── Квизы ────────────────────────────────────────────────────────────────────
export interface QuizQuestionPublic {
  text: string
  options: string[]
}

export interface StudentQuiz {
  _id: string
  title: string
  questions: QuizQuestionPublic[]
}

export interface QuizQuestion {
  text: string
  options: string[]
  correctIndex: number
}

export interface OwnerQuiz {
  _id: string
  course: string
  title: string
  questions: QuizQuestion[]
}

export interface QuizAttemptResult {
  _id: string
  score: number
  correctCount: number
  total: number
  passed: boolean
}

// ── Сертификаты ──────────────────────────────────────────────────────────────
export interface Certificate {
  _id: string
  certificateId: string
  course: { _id?: string; title: string; slug?: string } | string
  user?: CourseAuthor | string
  createdAt: string
}
