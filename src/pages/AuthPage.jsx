import React, { useState } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, LogIn, CheckCircle2, ShieldAlert, Phone, Lock, User, Mail, Calendar, Droplet } from 'lucide-react';
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

  const justVerified = location.state?.verifiedEmail;

  if (user) return <Navigate to="/" />;

  const validateField = async (name, value) => {
    let currentError = null;
    
    if (name === 'fullName') {
      const nameRegex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ\s]+$/;
      if (!value) {
        currentError = 'Vui lòng nhập họ tên';
      } else if (!nameRegex.test(value)) {
        currentError = 'Họ tên không được chứa ký tự đặc biệt';
      }
    }

    if (name === 'email') {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!value) {
        currentError = 'Vui lòng nhập email';
      } else if (!emailRegex.test(value)) {
        currentError = 'Email không hợp lệ (VD: name@example.com)';
      } else {
        setCheckingAvailability(prev => ({ ...prev, email: true }));
        try {
          const res = await axiosClient.get(`/auth/check-availability?email=${value}`);
          if (!res.available) currentError = 'Email này đã được sử dụng';
        } catch (e) {
          console.error(e);
        } finally {
          setCheckingAvailability(prev => ({ ...prev, email: false }));
        }
      }
    }

    if (name === 'phone') {
      const phoneRegex = /^(03|05|07|08|09)[0-9]{8}$/;
      if (!value) {
        currentError = 'Vui lòng nhập số điện thoại';
      } else if (!phoneRegex.test(value)) {
        currentError = 'Số điện thoại không hợp lệ (VN)';
      } else if (!isLogin) {
        setCheckingAvailability(prev => ({ ...prev, phone: true }));
        try {
          const res = await axiosClient.get(`/auth/check-availability?phone=${value}`);
          if (!res.available) currentError = 'SĐT này đã được sử dụng';
        } catch (e) {
          console.error(e);
        } finally {
          setCheckingAvailability(prev => ({ ...prev, phone: false }));
        }
      }
    }

    setValidationErrors(prev => {
      const newErrs = { ...prev };
      if (currentError) {
        newErrs[name] = currentError;
      } else {
        delete newErrs[name];
      }
      return newErrs;
    });
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
        await register(formData);
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

  const inputContainerStyle = {
    position: 'relative',
    marginBottom: '20px'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '8px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px 12px 45px',
    borderRadius: '12px',
    border: '1px solid #E8E8E8',
    background: '#FAFAFA',
    fontSize: '0.95rem',
    fontWeight: 500,
    outline: 'none',
    transition: 'all 0.2s'
  };

  const iconStyle = {
    position: 'absolute',
    left: '16px',
    top: '38px',
    color: '#BBB'
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: isLogin ? '440px' : '600px',
        background: 'white',
        borderRadius: '24px',
        padding: '48px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}>
        
        {/* Logo/Icon Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: isLogin ? '#FF3B30' : '#007AFF',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: 'white',
            boxShadow: `0 8px 16px ${isLogin ? 'rgba(255, 59, 48, 0.2)' : 'rgba(0, 122, 255, 0.2)'}`
          }}>
            {isLogin ? <LogIn size={32} /> : <UserPlus size={32} />}
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1A1A1A', margin: 0 }}>
            {isLogin ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}
          </h1>
          <p style={{ color: '#888', fontWeight: 500, marginTop: '8px' }}>
            {isLogin ? 'Đăng nhập để quản lý hồ sơ sinh tồn của bạn' : 'Tham gia cộng đồng cứu hộ ANVI-SOS ngay hôm nay'}
          </p>
        </div>

        {justVerified && (
          <div style={{
            background: '#F0FDF4',
            border: '1px solid #00C853',
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#00843D',
            fontSize: '0.85rem',
            fontWeight: 600
          }}>
            <CheckCircle2 size={18} /> Email đã xác thực! Bạn có thể đăng nhập.
          </div>
        )}

        {error && (
          <div style={{
            background: '#FFF4F4',
            border: '1px solid #FF3B30',
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '24px',
            color: '#D32F2F',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <ShieldAlert size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div style={inputContainerStyle}>
                <label style={labelStyle}>Họ và tên</label>
                <User size={18} style={iconStyle} />
                <input
                  type="text" style={{...inputStyle, border: validationErrors.fullName ? '1px solid #FF3B30' : '1px solid #E8E8E8'}}
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value });
                    validateField('fullName', e.target.value);
                  }}
                  onBlur={(e) => validateField('fullName', e.target.value)}
                  placeholder="Nguyễn Văn A"
                  required
                />
                {validationErrors.fullName && <div style={{fontSize: '0.7rem', color: '#D32F2F', marginTop: '4px', fontWeight: 600}}>{validationErrors.fullName}</div>}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={inputContainerStyle}>
                  <label style={labelStyle}>Email</label>
                  <Mail size={18} style={iconStyle} />
                  <input
                    type="email" style={{...inputStyle, border: validationErrors.email ? '1px solid #FF3B30' : '1px solid #E8E8E8'}}
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      validateField('email', e.target.value);
                    }}
                    onBlur={(e) => validateField('email', e.target.value)}
                    placeholder="name@example.com"
                    required
                  />
                  {validationErrors.email && <div style={{fontSize: '0.7rem', color: '#D32F2F', marginTop: '4px', fontWeight: 600}}>{validationErrors.email}</div>}
                </div>
                <div style={inputContainerStyle}>
                  <label style={labelStyle}>Năm sinh</label>
                  <Calendar size={18} style={iconStyle} />
                  <input
                    type="number" style={inputStyle}
                    value={formData.birthYear}
                    onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
                    placeholder="1995"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={inputContainerStyle}>
                  <label style={labelStyle}>Số điện thoại</label>
                  <Phone size={18} style={iconStyle} />
                  <input
                    type="text" style={{...inputStyle, border: validationErrors.phone ? '1px solid #FF3B30' : '1px solid #E8E8E8'}}
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      validateField('phone', e.target.value);
                    }}
                    onBlur={(e) => validateField('phone', e.target.value)}
                    placeholder="0912345678"
                    required
                  />
                  {validationErrors.phone && <div style={{fontSize: '0.7rem', color: '#D32F2F', marginTop: '4px', fontWeight: 600}}>{validationErrors.phone}</div>}
                </div>
                <div style={inputContainerStyle}>
                  <label style={labelStyle}>Nhóm máu</label>
                  <Droplet size={18} style={iconStyle} />
                  <select 
                    style={{...inputStyle, appearance: 'none'}}
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

          <div style={inputContainerStyle}>
            <label style={labelStyle}>{isLogin ? 'Số điện thoại' : 'Thiết lập mật khẩu'}</label>
            {isLogin ? <Phone size={18} style={iconStyle} /> : <Lock size={18} style={iconStyle} />}
            <input
              type={isLogin ? "text" : "password"} style={inputStyle}
              value={isLogin ? formData.phone : formData.password}
              onChange={(e) => setFormData({ ...formData, [isLogin ? 'phone' : 'password']: e.target.value })}
              placeholder={isLogin ? "0912345678" : "••••••••"}
              required
            />
          </div>

          {isLogin && (
            <div style={inputContainerStyle}>
              <label style={labelStyle}>Mật khẩu</label>
              <Lock size={18} style={iconStyle} />
              <input
                type="password" style={inputStyle}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>
          )}

          {isLogin && (
            <div style={{ textAlign: 'right', marginBottom: '24px', marginTop: '-12px' }}>
              <button type="button"
                style={{ background: 'none', border: 'none', color: '#007AFF', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                onClick={() => navigate('/forgot-password')}>
                Quên mật khẩu?
              </button>
            </div>
          )}

          <button 
            type="submit" 
            style={{ 
              width: '100%', 
              padding: '16px', 
              background: isLogin ? '#FF3B30' : '#007AFF',
              color: 'white',
              borderRadius: '12px',
              border: 'none',
              fontSize: '1rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: `0 8px 24px ${isLogin ? 'rgba(255, 59, 48, 0.25)' : 'rgba(0, 122, 255, 0.25)'}`,
              transition: 'all 0.3s',
              opacity: Object.keys(validationErrors).length > 0 ? 0.6 : 1
            }}
            disabled={Object.keys(validationErrors).length > 0 || checkingAvailability.email || checkingAvailability.phone}
            className="auth-submit-btn"
          >
            {isLogin ? 'ĐĂNG NHẬP NGAY' : 'HOÀN TẤT ĐĂNG KÝ'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '32px', color: '#666', fontWeight: 500 }}>
          {isLogin ? 'Bạn chưa có tài khoản? ' : 'Bạn đã có tài khoản ANVI-SOS? '}
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: isLogin ? '#FF3B30' : '#007AFF', cursor: 'pointer', fontWeight: 700, marginLeft: '4px' }}
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
          >
            {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .auth-submit-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }
        .auth-submit-btn:active {
          transform: translateY(0);
        }
        input:focus {
          border-color: ${isLogin ? '#FF3B30' : '#007AFF'} !important;
          background: white !important;
          box-shadow: 0 0 0 4px ${isLogin ? 'rgba(255, 59, 48, 0.1)' : 'rgba(0, 122, 255, 0.1)'};
        }
      `}} />
    </div>
  );
};
