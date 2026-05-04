import React, { useState } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, LogIn, CheckCircle2 } from 'lucide-react';
import axiosClient from '../api/axiosClient';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ phone: '', password: '', fullName: '', email: '', bloodType: '', birthYear: '' });
  const [validationErrors, setValidationErrors] = useState({});
  const [checkingAvailability, setCheckingAvailability] = useState({ email: false, phone: false });
  const [error, setError] = useState('');
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Hiển thị toast nếu vừa verify email xong
  const justVerified = location.state?.verifiedEmail;

  if (user) return <Navigate to="/" />;

  const validateField = async (name, value) => {
    let errs = { ...validationErrors };
    
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) {
        delete errs.email;
      } else if (!emailRegex.test(value)) {
        errs.email = 'Email không hợp lệ';
      } else {
        setCheckingAvailability(prev => ({ ...prev, email: true }));
        try {
          const res = await axiosClient.get(`/auth/check-availability?email=${value}`);
          if (!res.available) {
            errs.email = 'Email này đã được sử dụng';
          } else {
            delete errs.email;
          }
        } catch (e) {
          console.error(e);
        } finally {
          setCheckingAvailability(prev => ({ ...prev, email: false }));
        }
      }
    }

    if (name === 'phone') {
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!value) {
        delete errs.phone;
      } else if (!phoneRegex.test(value)) {
        errs.phone = 'SĐT phải từ 10-11 số';
      } else if (!isLogin) {
        setCheckingAvailability(prev => ({ ...prev, phone: true }));
        try {
          const res = await axiosClient.get(`/auth/check-availability?phone=${value}`);
          if (!res.available) {
            errs.phone = 'SĐT này đã được sử dụng';
          } else {
            delete errs.phone;
          }
        } catch (e) {
          console.error(e);
        } finally {
          setCheckingAvailability(prev => ({ ...prev, phone: false }));
        }
      } else {
        delete errs.phone;
      }
    }

    setValidationErrors(errs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(validationErrors).length > 0) return;
    
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
    <div className="flex justify-center items-center" style={{ minHeight: '80vh', padding: '40px 0' }}>
      <div className="glass-card" style={{ maxWidth: isLogin ? '400px' : '550px', width: '100%', transition: 'max-width 0.3s ease' }}>

        {/* Toast: đã verify email thành công */}
        {justVerified && (
          <div style={{
            background: '#F0FDF4',
            border: '2px solid #00843D',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#00843D',
            fontSize: '0.875rem',
            fontWeight: 600
          }}>
            <CheckCircle2 size={18} />
            Email đã xác thực! Vui lòng đăng nhập.
          </div>
        )}

        <h2 className="text-center mb-10" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', fontWeight: 800, fontSize: '1.75rem', letterSpacing: '-0.03em' }}>
          {isLogin ? <><LogIn size={28} /> SIGN IN</> : <><UserPlus size={28} /> REGISTER</>}
        </h2>

        {error && (
          <div style={{ backgroundColor: '#FEF2F2', border: '2px solid var(--accent-red)', padding: '16px', marginBottom: '24px', color: 'var(--accent-red)', fontSize: '0.85rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="input-group">
                <label style={{ fontWeight: 800, fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Họ và tên</label>
                <input
                  type="text" className="input-control"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="input-group">
                  <label style={{ fontWeight: 800, fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Email</label>
                  <input
                    type="email" className={`input-control ${validationErrors.email ? 'border-red' : ''}`}
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (validationErrors.email) validateField('email', e.target.value);
                    }}
                    onBlur={(e) => validateField('email', e.target.value)}
                    placeholder="example@gmail.com"
                    required
                  />
                  {checkingAvailability.email && <div style={{fontSize: '0.7rem', color: 'var(--accent-blue)', marginTop: '4px'}}>Đang kiểm tra...</div>}
                  {validationErrors.email && <div style={{fontSize: '0.7rem', color: 'var(--accent-red)', marginTop: '4px', fontWeight: 600}}>{validationErrors.email}</div>}
                </div>
                <div className="input-group">
                  <label style={{ fontWeight: 800, fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Năm sinh</label>
                  <input
                    type="number" className="input-control"
                    value={formData.birthYear}
                    onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
                    placeholder="VD: 1990"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="input-group">
                  <label style={{ fontWeight: 800, fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Số điện thoại</label>
                  <input
                    type="text" className={`input-control ${validationErrors.phone ? 'border-red' : ''}`}
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (validationErrors.phone) validateField('phone', e.target.value);
                    }}
                    onBlur={(e) => validateField('phone', e.target.value)}
                    placeholder="0912345678"
                    required
                  />
                  {checkingAvailability.phone && <div style={{fontSize: '0.7rem', color: 'var(--accent-blue)', marginTop: '4px'}}>Đang kiểm tra...</div>}
                  {validationErrors.phone && <div style={{fontSize: '0.7rem', color: 'var(--accent-red)', marginTop: '4px', fontWeight: 600}}>{validationErrors.phone}</div>}
                </div>
                <div className="input-group">
                  <label style={{ fontWeight: 800, fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Nhóm máu</label>
                  <select 
                    className="input-control"
                    value={formData.bloodType}
                    onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                    required
                  >
                    <option value="">Chọn nhóm máu</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="Chưa rõ">Chưa rõ</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {isLogin && (
            <div className="input-group">
              <label style={{ fontWeight: 800, fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Số điện thoại</label>
              <input
                type="text" className="input-control"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0912345678"
                required
              />
            </div>
          )}

          <div className="input-group">
            <label style={{ fontWeight: 800, fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Mật khẩu</label>
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

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '16px', opacity: Object.keys(validationErrors).length > 0 ? 0.6 : 1 }}
            disabled={Object.keys(validationErrors).length > 0 || checkingAvailability.email || checkingAvailability.phone}
          >
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
