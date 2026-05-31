import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { RoleRoute } from './components/RoleRoute'
import { AuthPage } from './features/auth/AuthPage'
import { LinksPage } from './features/links/LinksPage'
import { CreatePage } from './features/links/CreatePage'
import { DetailPage } from './features/links/DetailPage'
import { UnlockPage } from './features/links/UnlockPage'
import { LinkUnavailablePage } from './features/links/LinkUnavailablePage'
import { WorkspacesPage } from './features/workspaces/WorkspacesPage'
import { WorkspacePage } from './features/workspaces/WorkspacePage'
import { CoursesPage } from './features/courses/CoursesPage'
import { CoursePage } from './features/courses/CoursePage'
import { LessonPage } from './features/courses/LessonPage'
import { MyCoursesPage } from './features/courses/MyCoursesPage'
import { InstructorCoursesPage } from './features/courses/InstructorCoursesPage'
import { CourseEditorPage } from './features/courses/CourseEditorPage'
import { MyCertificatesPage } from './features/courses/MyCertificatesPage'
import { CertificateVerifyPage } from './features/courses/CertificateVerifyPage'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/login', element: <AuthPage /> },

      // Публичный каталог курсов и верификация сертификата
      { path: '/courses', element: <CoursesPage /> },
      { path: '/courses/:id', element: <CoursePage /> },
      { path: '/verify/:certificateId', element: <CertificateVerifyPage /> },

      // Публичные страницы коротких ссылок
      { path: '/unlock/:code', element: <UnlockPage /> },
      { path: '/l/unavailable', element: <LinkUnavailablePage /> },

      // Требуют авторизации
      {
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <Navigate to="/courses" replace /> },
          { path: '/my-courses', element: <MyCoursesPage /> },
          { path: '/certificates', element: <MyCertificatesPage /> },
          { path: '/courses/:courseId/lessons/:lessonId', element: <LessonPage /> },
          { path: '/links', element: <LinksPage /> },
          { path: '/links/:id', element: <DetailPage /> },
          { path: '/create', element: <CreatePage /> },
          { path: '/workspaces', element: <WorkspacesPage /> },
          { path: '/workspaces/:id', element: <WorkspacePage /> },
        ],
      },

      // Только для преподавателей и админов
      {
        element: <RoleRoute roles={['instructor', 'admin']} />,
        children: [
          { path: '/teach', element: <InstructorCoursesPage /> },
          { path: '/teach/:id', element: <CourseEditorPage /> },
        ],
      },
    ],
  },
])
