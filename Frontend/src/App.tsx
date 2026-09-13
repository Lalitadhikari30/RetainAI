import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppLayout } from './components/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { EmployeeDetailPage } from './pages/EmployeeDetailPage';
import { CopilotPage } from './pages/CopilotPage';
import { UploadPage } from './pages/UploadPage';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              {/* Unauthenticated Login Screen */}
              <Route path="/login" element={<LoginPage />} />

              {/* Authenticated Application Shell with Fixed 240px Sidebar */}
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/employees/:id" element={<EmployeeDetailPage />} />
                <Route path="/copilot" element={<CopilotPage />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
