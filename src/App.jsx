import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { ProfilePage } from './pages/ProfilePage';
import { SosPage } from './pages/SosPage';
import { PublicQrPage } from './pages/PublicQrPage';
import { AccessRequestPage } from './pages/AccessRequestPage';
import { ApprovalPage } from './pages/ApprovalPage';
import { PrivateHealthRecordPage } from './pages/PrivateHealthRecordPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { SosAlertPage } from './pages/SosAlertPage';
import { SosListener } from './components/SosListener';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SosListener />
        <Routes>
          {/* Public Route for QR scan */}
          <Route path="/qr/:shortCode" element={<PublicQrPage />} />
          
          {/* Phase 3: Access Request & Private Records */}
          <Route path="/request-access/:userId" element={<AccessRequestPage />} />
          <Route path="/grant/approve/:grantId" element={<ApprovalPage />} />
          <Route path="/private-record/:grantToken" element={<PrivateHealthRecordPage />} />

          {/* Email OTP Verification & Forgot Password (public, no layout) */}
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* SOS Alert — Public, no auth, no layout (emergency contacts xem) */}
          <Route path="/sos-alert/:token" element={<SosAlertPage />} />

          
          <Route element={<Layout />}>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><ProfilePage /></ProtectedRoute>
            } />
            <Route path="/sos" element={
              <ProtectedRoute><SosPage /></ProtectedRoute>
            } />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
