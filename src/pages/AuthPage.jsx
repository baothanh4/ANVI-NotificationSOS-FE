import React, { useState } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, LogIn, CheckCircle2 } from 'lucide-react';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ phone: '', password: '', fullName: '', email: '' });
  const [error, setError] = useState('');
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Hiển thị toast nếu vừa verify email xong
  const justVerified = location.state?.verifiedEmail;

  if (user) return <Navigate to="/" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(formData.phone, formData.password);
        navigate('/');
      } else {
        const res = await register(formData);
        // Nếu có email → chuyển sang trang OTP
        if (formData.email?.trim()) {
          navigate('/verify-email', { state: { email: formData.email.trim() } });
        } else {
          setIsLogin(true);
          setFormData({ ...formData, password: '' });
          alert('Đăng ký thành công! Vui lòng đăng nhập.');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Xác thực thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <div className="flex justify-center items-center" style={{ minHeight: '60vh' }}>
      <div className="glass-card" style={{ maxWidth: '400px', width: '100%' }}>

        {/* Toast: đã verify email thành công */}
        {justVerified && (
          <div style={{
            background: 'rgba(16,185,129,0.15)',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#6ee7b7',
            fontSize: '0.875rem',
          }}>
            <CheckCircle2 size={16} />
            Email đã xác thực! Vui lòng đăng nhập để tiếp tục.
          </div>
        )}

        <h2 className="text-center mb-8" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          {isLogin ? <><LogIn size={24} /> Đăng nhập</> : <><UserPlus size={24} /> Đăng ký</>}
        </h2>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '8px', marginBottom: '16px', color: '#fca5a5', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="input-group">
                <label>Họ và tên</label>
                <input
                  type="text" className="input-control"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>
              <div className="input-group">
                <label>Email <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>(bắt buộc để nhận OTP)</span></label>
                <input
                  type="email" className="input-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@gmail.com"
                  required
                />
              </div>
            </>
          )}
          <div className="input-group">
            <label>Số điện thoại</label>
            <input
              type="text" className="input-control"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="0912345678"
              required
            />
          </div>
          <div className="input-group">
            <label>Mật khẩu</label>
            <input
              type="password" className="input-control"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              required
            />
          </div>

          {/* Forgot password */}
          {isLogin && (
            <div style={{ textAlign: 'right', marginBottom: '8px', marginTop: '-4px' }}>
              <button type="button"
                style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: '0.8rem' }}
                onClick={() => navigate('/forgot-password')}>
                Quên mật khẩu?
              </button>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
            {isLogin ? 'Đăng nhập' : 'Đăng ký'}
          </button>
        </form>

        <div className="text-center mt-4" style={{ fontSize: '0.875rem' }}>
          {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: '600' }}
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
          >
            {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
          </button>
        </div>
      </div>
    </div>
  );
};
