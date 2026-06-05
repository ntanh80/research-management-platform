import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PermissionGuard from './PermissionGuard';
import MainLayout from '@/layouts/MainLayout/MainLayout';
import LoginPage from '@/modules/auth/pages/LoginPage';
import DashboardPage from '@/modules/dashboard/pages/DashboardPage';

// Lazy-loaded pages
import UserListPage from '@/modules/users/pages/UserListPage';
import RoleListPage from '@/modules/roles/pages/RoleListPage';
import DepartmentListPage from '@/modules/departments/pages/DepartmentListPage';
import LecturerListPage from '@/modules/lecturers/pages/LecturerListPage';
import PhDStudentListPage from '@/modules/phd-students/pages/PhDStudentListPage';

function ForbiddenPage() {
  return (
    <div style={{ textAlign: 'center', padding: 100 }}>
      <h1>403 - Không có quyền truy cập</h1>
      <p>Bạn không có quyền truy cập trang này.</p>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: (
              <PermissionGuard permission="dashboard.view">
                <DashboardPage />
              </PermissionGuard>
            ),
          },
          {
            path: 'phd-students',
            element: (
              <PermissionGuard permission="phd_students.view">
                <PhDStudentListPage />
              </PermissionGuard>
            ),
          },
          {
            path: 'lecturers',
            element: (
              <PermissionGuard permission="lecturers.view">
                <LecturerListPage />
              </PermissionGuard>
            ),
          },
          {
            path: 'departments',
            element: (
              <PermissionGuard permission="departments.view">
                <DepartmentListPage />
              </PermissionGuard>
            ),
          },
          {
            path: 'users',
            element: (
              <PermissionGuard permission="users.view">
                <UserListPage />
              </PermissionGuard>
            ),
          },
          {
            path: 'roles',
            element: (
              <PermissionGuard permission="roles.view">
                <RoleListPage />
              </PermissionGuard>
            ),
          },
          {
            path: '403',
            element: <ForbiddenPage />,
          },
        ],
      },
    ],
  },
]);
