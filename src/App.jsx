import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';

// Import các trang cũ
import { Dashboard } from './pages/Dashboard';
import { AuthPage } from './pages/AuthPage';
import { SosPage } from './pages/SosPage';
import { SosAlertPage } from './pages/SosAlertPage';
import { ProfilePage } from './pages/ProfilePage';
import { PublicQrPage } from './pages/PublicQrPage';
import { PublicProfilePage } from './pages/PublicProfilePage';
import { BlogPage } from './pages/BlogPage';
import { CreateBlogPage } from './pages/CreateBlogPage';
import { BlogPostDetailPage } from './pages/BlogPostDetailPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { AccessRequestPage } from './pages/AccessRequestPage';
import { ApprovalPage } from './pages/ApprovalPage';
import { PrivateHealthRecordPage } from './pages/PrivateHealthRecordPage';
import { AdminPage } from './pages/AdminPage';
import { AboutPage } from './pages/AboutPage';
import { FirstAidPage } from './pages/FirstAidPage';
import { FirstAidDetailPage } from './pages/FirstAidDetailPage';

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
          <Route path="/public-info/:shortCode" element={<PublicQrPage />} />
          <Route path="/p/:shortCode" element={<PublicProfilePage />} />
          <Route path="/sos-alert" element={<SosAlertPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/access-request/:id" element={<AccessRequestPage />} />
          <Route path="/approve/:id" element={<ApprovalPage />} />
          {/* Routes with Layout */}
          <Route element={<Layout />}>
            <Route path="/about" element={<AboutPage />} />
            <Route path="/first-aid" element={<FirstAidPage />} />
            <Route path="/first-aid/:id" element={<FirstAidDetailPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/create" element={<CreateBlogPage />} />
            <Route path="/blog/:id" element={<BlogPostDetailPage />} />
            
            <Route path="/admin" element={
              <PrivateRoute>
                <AdminPage />
              </PrivateRoute>
            } />
            
            <Route path="/" element={<Dashboard />} />
            
            {/* Private Routes */}
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
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
