import React, { useState } from 'react';
import { useNavigate, Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  UserPlus, LogIn, CheckCircle2, ShieldAlert, Phone, Lock, 
  User, Mail, Calendar, Droplet, ShieldCheck, ArrowRight,
  Shield, CheckCircle
} from 'lucide-react';
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
      if (!value) currentError = 'Vui lòng nhập họ tên';
      else if (!nameRegex.test(value)) currentError = 'Họ tên không hợp lệ';
    }
    if (name === 'email') {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!value) currentError = 'Vui lòng nhập email';
      else if (!emailRegex.test(value)) currentError = 'Email không hợp lệ';
    }
    if (name === 'phone') {
      const phoneRegex = /^(03|05|07|08|09)[0-9]{8}$/;
      if (!value) currentError = 'Vui lòng nhập số điện thoại';
      else if (!phoneRegex.test(value)) currentError = 'SĐT không hợp lệ';
    }

    setValidationErrors(prev => {
      const newErrs = { ...prev };
      if (currentError) newErrs[name] = currentError;
      else delete newErrs[name];
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

  return (
    <div className="auth-page-medical" style={{minHeight: '100vh', display: 'flex', background: '#F0F2F5', animation: 'fadeIn 0.5s ease-out'}}>
      {/* Left Panel: Branding & Mission */}
      <div className="auth-side-panel" style={{
        flex: '1.2',
        background: `linear-gradient(rgba(0, 85, 179, 0.85), rgba(0, 45, 94, 0.95)), url('https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=2000')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px',
        color: 'white'
      }}>
        <div style={{maxWidth: '500px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px'}}>
            <div style={{width: '60px', height: '60px', background: 'white', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <ShieldCheck color="var(--primary-blue)" size={40} />
            </div>
            <div>
              <h1 style={{fontSize: '2.5rem', color: 'white', margin: 0, fontWeight: 950}}>ANVI-SOS</h1>
              <span style={{fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.8}}>Hospital Standard Safety</span>
            </div>
          </div>
          
          <h2 style={{fontSize: '3rem', fontWeight: 900, lineHeight: 1.2, marginBottom: '30px', color: 'white'}}>
            VÌ SỨC KHỎE VÀ <br/><span style={{color: '#5AC8FA'}}>AN TÂM</span> CỦA BẠN
          </h2>
          
          <p style={{fontSize: '1.1rem', opacity: 0.9, lineHeight: 1.6, marginBottom: '50px'}}>
            Gia nhập cộng đồng ANVI-SOS để được bảo vệ bởi mạng lưới cứu hộ chuyên nghiệp và quản lý hồ sơ y tế thông minh theo tiêu chuẩn quốc tế.
          </p>

          <div style={{display: 'grid', gap: '20px'}}>
            {[
              { text: 'Hồ sơ y tế được mã hóa bảo mật', icon: <Shield size={20} /> },
              { text: 'Kết nối cứu hộ 115 nhanh nhất', icon: <CheckCircle size={20} /> },
              { text: 'Mã QR sinh tồn trên màn hình khóa', icon: <CheckCircle size={20} /> }
            ].map((item, i) => (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: '15px', fontSize: '0.95rem', fontWeight: 600}}>
                <div style={{color: '#5AC8FA'}}>{item.icon}</div>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel: Auth Form */}
      <div className="auth-form-panel" style={{
        flex: '1',
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px'
      }}>
        <div style={{width: '100%', maxWidth: isLogin ? '400px' : '500px'}}>
          <div style={{marginBottom: '40px'}}>
            <h3 style={{fontSize: '2rem', fontWeight: 900, color: '#1A1A1A', marginBottom: '10px'}}>
              {isLogin ? 'Đăng nhập thành viên' : 'Đăng ký tài khoản'}
            </h3>
            <p style={{color: '#666', fontWeight: 500}}>
              {isLogin ? 'Chào mừng bạn quay trở lại với hệ thống.' : 'Hãy điền các thông tin dưới đây để bắt đầu.'}
            </p>
          </div>

          {justVerified && (
            <div style={{background: '#F0FDF4', color: '#166534', padding: '15px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #BBF7D0', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px'}}>
              <CheckCircle2 size={18} /> Email đã xác thực thành công!
            </div>
          )}

          {error && (
            <div style={{background: '#FFF1F0', color: '#D32F2F', padding: '15px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #FECACA', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px'}}>
              <ShieldAlert size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{display: 'grid', gap: '20px'}}>
            {!isLogin && (
              <>
                <div className="medical-input-group">
                  <label>HỌ VÀ TÊN</label>
                  <div className="input-with-icon">
                    <User size={18} className="input-icon" />
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={formData.fullName}
                      onChange={(e) => { setFormData({...formData, fullName: e.target.value}); validateField('fullName', e.target.value); }}
                      required
                    />
                  </div>
                  {validationErrors.fullName && <span className="error-msg">{validationErrors.fullName}</span>}
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '15px'}}>
                  <div className="medical-input-group">
                    <label>EMAIL</label>
                    <div className="input-with-icon">
                      <Mail size={18} className="input-icon" />
                      <input
                        type="email"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={(e) => { setFormData({...formData, email: e.target.value}); validateField('email', e.target.value); }}
                        required
                      />
                    </div>
                  </div>
                  <div className="medical-input-group">
                    <label>NĂM SINH</label>
                    <div className="input-with-icon">
                      <Calendar size={18} className="input-icon" />
                      <input
                        type="number"
                        placeholder="1995"
                        value={formData.birthYear}
                        onChange={(e) => setFormData({...formData, birthYear: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '15px'}}>
                  <div className="medical-input-group">
                    <label>SỐ ĐIỆN THOẠI</label>
                    <div className="input-with-icon">
                      <Phone size={18} className="input-icon" />
                      <input
                        type="text"
                        placeholder="0912345678"
                        value={formData.phone}
                        onChange={(e) => { setFormData({...formData, phone: e.target.value}); validateField('phone', e.target.value); }}
                        required
                      />
                    </div>
                  </div>
                  <div className="medical-input-group">
                    <label>NHÓM MÁU</label>
                    <div className="input-with-icon">
                      <Droplet size={18} className="input-icon" />
                      <select 
                        value={formData.bloodType}
                        onChange={(e) => setFormData({...formData, bloodType: e.target.value})}
                        required
                      >
                        <option value="">Chọn</option>
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Chưa rõ'].map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="medical-input-group">
              <label>{isLogin ? 'SỐ ĐIỆN THOẠI' : 'MẬT KHẨU'}</label>
              <div className="input-with-icon">
                {isLogin ? <Phone size={18} className="input-icon" /> : <Lock size={18} className="input-icon" />}
                <input
                  type={isLogin ? "text" : "password"}
                  placeholder={isLogin ? "0912xxx..." : "••••••••"}
                  value={isLogin ? formData.phone : formData.password}
                  onChange={(e) => setFormData({ ...formData, [isLogin ? 'phone' : 'password']: e.target.value })}
                  required
                />
              </div>
            </div>

            {isLogin && (
              <div className="medical-input-group">
                <label>MẬT KHẨU</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
                <div style={{textAlign: 'right', marginTop: '8px'}}>
                   <Link to="/forgot-password" style={{fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-blue)', textDecoration: 'none'}}>Quên mật khẩu?</Link>
                </div>
              </div>
            )}

            <button type="submit" className="btn-medical-auth" style={{width: '100%', padding: '18px', marginTop: '10px'}}>
              {isLogin ? 'ĐĂNG NHẬP NGAY' : 'ĐĂNG KÝ THÀNH VIÊN'} <ArrowRight size={18} />
            </button>
          </form>

          <div style={{textAlign: 'center', marginTop: '40px', color: '#666', fontWeight: 600}}>
            {isLogin ? 'Bạn chưa có tài khoản? ' : 'Bạn đã có tài khoản? '}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              style={{background: 'none', border: 'none', color: 'var(--primary-blue)', fontWeight: 800, cursor: 'pointer', padding: 0}}
            >
              {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .medical-input-group { display: flex; flex-direction: column; gap: 8px; }
        .medical-input-group label { font-size: 0.7rem; font-weight: 900; color: #999; letter-spacing: 0.5px; }
        .input-with-icon { position: relative; }
        .input-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #BBB; transition: color 0.2s; }
        .medical-input-group input, .medical-input-group select {
          width: 100%; padding: 14px 15px 14px 45px; border-radius: 12px; border: 1px solid #EEE;
          background: #F9F9F9; font-weight: 700; color: #333; outline: none; transition: all 0.2s;
        }
        .medical-input-group input:focus, .medical-input-group select:focus {
          border-color: var(--primary-blue); background: white; box-shadow: 0 0 0 4px rgba(0,85,179,0.05);
        }
        .medical-input-group input:focus + .input-icon { color: var(--primary-blue); }
        .error-msg { font-size: 0.7rem; color: #D32F2F; font-weight: 800; }
        
        .btn-medical-auth {
          background: var(--primary-blue); color: white; border: none; border-radius: 12px;
          font-weight: 850; font-size: 1rem; cursor: pointer; transition: all 0.3s;
          display: flex; alignItems: center; justify-content: center; gap: 10px;
          box-shadow: 0 10px 20px rgba(0,85,179,0.2);
        }
        .btn-medical-auth:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(0,85,179,0.3); }

        @media (max-width: 1024px) {
          .auth-side-panel { display: none; }
          .auth-form-panel { flex: 1; padding: 40px 20px; }
        }
      `}</style>
    </div>
  );
};
