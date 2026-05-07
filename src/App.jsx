import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Import các trang cũ
import { Dashboard } from './pages/Dashboard';
import { AuthPage } from './pages/AuthPage';
import { SosPage } from './pages/SosPage';
import { SosAlertPage } from './pages/SosAlertPage';
import { ProfilePage } from './pages/ProfilePage';
import { PublicQrPage } from './pages/PublicQrPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { AccessRequestPage } from './pages/AccessRequestPage';
import { ApprovalPage } from './pages/ApprovalPage';
import { PrivateHealthRecordPage } from './pages/PrivateHealthRecordPage';

// Component bảo vệ Route
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/auth" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/sos-alert/:token" element={<SosAlertPage />} />
          <Route path="/public-qr/:shortCode" element={<PublicQrPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/access-request/:id" element={<AccessRequestPage />} />
          <Route path="/approve/:id" element={<ApprovalPage />} />

          {/* Private Routes */}
          <Route path="/" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/sos" element={
            <PrivateRoute>
              <SosPage />
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          } />
          <Route path="/health-record/:id" element={
            <PrivateRoute>
              <PrivateHealthRecordPage />
            </PrivateRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
