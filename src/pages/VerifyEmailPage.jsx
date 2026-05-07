import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MailCheck, RefreshCw, ArrowLeft, CheckCircle2, ShieldCheck, Check } from 'lucide-react';
import axiosClient from '../api/axiosClient';

export const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (resendTimer <= 0) {
      setCanResend(true);
      return;
    }
    const t = setTimeout(() => setResendTimer(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    if (value.length > 1) {
      const digits = value.split('').slice(0, 6 - index);
      digits.forEach((d, i) => { if (index + i < 6) newOtp[index + i] = d; });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { setError('Vui lòng nhập đủ 6 chữ số.'); return; }
    setLoading(true);
    setError('');
    try {
      await axiosClient.post('/auth/verify-email', { email, otp: code });
      setSuccess(true);
      setTimeout(() => navigate('/auth', { state: { verifiedEmail: email } }), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setResendLoading(true);
    setError('');
    try {
      await axiosClient.post('/auth/resend-verification', { email });
      setCanResend(false);
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi lại OTP.');
    } finally {
      setResendLoading(false);
    }
  };

  useEffect(() => {
    if (otp.every(d => d !== '') && !success) handleSubmit();
  }, [otp]);

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F9FA', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '440px', background: 'white', borderRadius: '24px', padding: '48px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}>
          <div style={{ width: '80px', height: '80px', background: '#00C853', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'white', boxShadow: '0 8px 16px rgba(0,200,83,0.2)' }}>
            <Check size={48} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1A1A1A', marginBottom: '12px' }}>Xác thực thành công!</h2>
          <p style={{ color: '#666', fontWeight: 500, lineHeight: 1.6 }}>Email của bạn đã được xác thực thành công. Đang quay lại trang đăng nhập...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '480px', background: 'white', borderRadius: '24px', padding: '48px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '64px', height: '64px', background: 'rgba(0, 122, 255, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#007AFF' }}>
            <ShieldCheck size={32} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1A1A1A', margin: 0 }}>Xác thực Email</h1>
          <p style={{ color: '#888', fontWeight: 500, marginTop: '12px', lineHeight: 1.5 }}>
            Chúng tôi đã gửi mã xác thực gồm 6 chữ số đến địa chỉ email: <br/>
            <strong style={{ color: '#1A1A1A' }}>{email || 'người dùng'}</strong>
          </p>
        </div>

        {error && (
          <div style={{ background: '#FFF4F4', border: '1px solid #FF3B30', padding: '12px 16px', borderRadius: '12px', marginBottom: '24px', color: '#D32F2F', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldCheck size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* OTP Input Row */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '32px' }}>
            {otp.map((d, i) => (
              <input
                key={i}
                ref={el => inputRefs.current[i] = el}
                type="text" inputMode="numeric" maxLength={1}
                value={d}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
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
            <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 500 }}>Không nhận được mã xác thực?</p>
            <button type="button" onClick={handleResend} disabled={!canResend || resendLoading} style={{ background: 'none', border: 'none', cursor: canResend ? 'pointer' : 'default', color: canResend ? '#007AFF' : '#BBB', fontSize: '0.9rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw size={16} className={resendLoading ? 'spin' : ''} />
              {resendLoading ? 'Đang gửi...' : canResend ? 'Gửi lại mã ngay' : `Gửi lại sau ${resendTimer}s`}
            </button>
          </div>

          <button type="submit" disabled={loading || otp.some(d => d === '')} style={{ width: '100%', padding: '16px', background: '#007AFF', color: 'white', borderRadius: '12px', border: 'none', fontSize: '1rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 24px rgba(0, 122, 255, 0.25)', transition: 'all 0.3s' }} className="auth-btn">
            {loading ? 'ĐANG XÁC THỰC...' : 'XÁC NHẬN MÃ OTP'}
          </button>
        </form>

        <button onClick={() => navigate('/auth')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, marginTop: '32px', width: '100%' }}>
          <ArrowLeft size={18} /> Quay lại trang đăng nhập
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .auth-btn:hover { transform: translateY(-2px); filter: brightness(1.1); }
        .auth-btn:active { transform: translateY(0); }
        .otp-input:focus { border-color: #007AFF !important; box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1); background: white !important; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}} />
    </div>
  );
};
