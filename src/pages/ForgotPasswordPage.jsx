import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Mail, ArrowLeft, CheckCircle2, ShieldAlert, Lock, Check } from 'lucide-react';
import axiosClient from '../api/axiosClient';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=nhập email, 2=nhập OTP + mật khẩu mới
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (step !== 2) return;
    if (resendTimer <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setResendTimer(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer, step]);

  useEffect(() => {
    if (step === 2) setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, [step]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      await axiosClient.post('/auth/forgot-password', { email });
      setStep(2);
      setResendTimer(60);
      setCanResend(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi OTP. Thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    if (value.length > 1) {
      const digits = value.split('').slice(0, 6 - index);
      digits.forEach((d, i) => { if (index + i < 6) newOtp[index + i] = d; });
      setOtp(newOtp);
      inputRefs.current[Math.min(index + digits.length, 5)]?.focus();
      return;
    }
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleResend = async () => {
    if (!canResend) return;
    setError('');
    try {
      await axiosClient.post('/auth/forgot-password', { email });
      setCanResend(false);
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch {}
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { setError('Vui lòng nhập đủ 6 số OTP.'); return; }
    if (newPassword.length < 6) { setError('Mật khẩu mới phải có ít nhất 6 ký tự.'); return; }
    if (newPassword !== confirmPassword) { setError('Mật khẩu xác nhận không khớp.'); return; }
    setLoading(true);
    setError('');
    try {
      await axiosClient.post('/auth/reset-password', { email, otp: code, newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/auth'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP không hợp lệ hoặc đã hết hạn.');
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
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

  const labelStyle = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '8px'
  };

  const iconStyle = {
    position: 'absolute',
    left: '16px',
    top: '38px',
    color: '#BBB'
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F9FA', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '440px', background: 'white', borderRadius: '24px', padding: '48px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}>
          <div style={{ width: '80px', height: '80px', background: '#00C853', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'white', boxShadow: '0 8px 16px rgba(0,200,83,0.2)' }}>
            <Check size={48} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1A1A1A', marginBottom: '12px' }}>Thành công!</h2>
          <p style={{ color: '#666', fontWeight: 500, lineHeight: 1.6 }}>Mật khẩu của bạn đã được cập nhật. Đang quay lại trang đăng nhập...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '480px', background: 'white', borderRadius: '24px', padding: '48px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', position: 'relative' }}>
        
        {/* Step indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
          <div style={{ width: '32px', height: '6px', borderRadius: '100px', background: step >= 1 ? '#007AFF' : '#EEE' }}></div>
          <div style={{ width: '32px', height: '6px', borderRadius: '100px', background: step >= 2 ? '#007AFF' : '#EEE' }}></div>
        </div>

        {error && (
          <div style={{ background: '#FFF4F4', border: '1px solid #FF3B30', padding: '12px 16px', borderRadius: '12px', marginBottom: '24px', color: '#D32F2F', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldAlert size={18} /> {error}
          </div>
        )}

        {step === 1 ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ width: '64px', height: '64px', background: 'rgba(0, 122, 255, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#007AFF' }}>
                <Mail size={32} />
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1A1A1A', margin: 0 }}>Quên mật khẩu?</h1>
              <p style={{ color: '#888', fontWeight: 500, marginTop: '12px', lineHeight: 1.5 }}>Đừng lo lắng! Hãy nhập email của bạn, chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.</p>
            </div>

            <form onSubmit={handleSendOtp}>
              <div style={{ position: 'relative', marginBottom: '32px' }}>
                <label style={labelStyle}>Địa chỉ Email</label>
                <Mail size={18} style={iconStyle} />
                <input
                  type="email" style={inputStyle}
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="name@example.com"
                  required
                />
              </div>

              <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', background: '#007AFF', color: 'white', borderRadius: '12px', border: 'none', fontSize: '1rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 24px rgba(0, 122, 255, 0.25)', transition: 'all 0.3s' }} className="auth-btn">
                {loading ? 'ĐANG GỬI MÃ...' : 'GỬI MÃ XÁC THỰC'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ width: '64px', height: '64px', background: 'rgba(0, 122, 255, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#007AFF' }}>
                <KeyRound size={32} />
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1A1A1A', margin: 0 }}>Xác thực OTP</h1>
              <p style={{ color: '#888', fontWeight: 500, marginTop: '12px' }}>Mã xác thực đã được gửi tới <br/><strong style={{color: '#1A1A1A'}}>{email}</strong></p>
            </div>

            <form onSubmit={handleResetPassword}>
              {/* OTP Input Row */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '32px' }}>
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={el => inputRefs.current[i] = el}
                    type="text" inputMode="numeric" maxLength={1}
                    value={d}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    onFocus={e => e.target.select()}
                    style={{
                      width: '45px', height: '56px', textAlign: 'center', fontSize: '1.5rem', fontWeight: 800,
                      borderRadius: '12px', border: '2px solid #EEE', background: '#FAFAFA', outline: 'none',
                      transition: 'all 0.2s', color: '#007AFF'
                    }}
                    className="otp-input"
                  />
                ))}
              </div>

              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <button type="button" onClick={handleResend} disabled={!canResend} style={{ background: 'none', border: 'none', cursor: canResend ? 'pointer' : 'default', color: canResend ? '#007AFF' : '#BBB', fontSize: '0.85rem', fontWeight: 700 }}>
                  {canResend ? 'Gửi lại mã ngay' : `Gửi lại mã sau ${resendTimer}s`}
                </button>
              </div>

              <div style={{ position: 'relative', marginBottom: '20px' }}>
                <label style={labelStyle}>Mật khẩu mới</label>
                <Lock size={18} style={iconStyle} />
                <input type="password" style={inputStyle} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Tối thiểu 6 ký tự" required />
              </div>

              <div style={{ position: 'relative', marginBottom: '32px' }}>
                <label style={labelStyle}>Xác nhận mật khẩu</label>
                <Lock size={18} style={iconStyle} />
                <input type="password" style={inputStyle} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Nhập lại mật khẩu mới" required />
              </div>

              <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', background: '#007AFF', color: 'white', borderRadius: '12px', border: 'none', fontSize: '1rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 24px rgba(0, 122, 255, 0.25)', transition: 'all 0.3s' }} className="auth-btn">
                {loading ? 'ĐANG XỬ LÝ...' : 'ĐẶT LẠI MẬT KHẨU'}
              </button>
            </form>
          </>
        )}

        <button onClick={() => step === 2 ? setStep(1) : navigate('/auth')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, marginTop: '32px', width: '100%' }}>
          <ArrowLeft size={18} /> {step === 2 ? 'Thay đổi địa chỉ email' : 'Quay lại đăng nhập'}
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .auth-btn:hover { transform: translateY(-2px); filter: brightness(1.1); }
        .auth-btn:active { transform: translateY(0); }
        input:focus { border-color: #007AFF !important; background: white !important; box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1); }
        .otp-input:focus { border-color: #007AFF !important; box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1); }
      `}} />
    </div>
  );
};
