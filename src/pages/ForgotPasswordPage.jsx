import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
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
    if (code.length !== 6) { setError('Nhập đủ 6 số OTP.'); return; }
    if (newPassword.length < 6) { setError('Mật khẩu mới phải có ít nhất 6 ký tự.'); return; }
    if (newPassword !== confirmPassword) { setError('Mật khẩu xác nhận không khớp.'); return; }
    setLoading(true);
    setError('');
    try {
      await axiosClient.post('/auth/reset-password', { email, otp: code, newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP không hợp lệ hoặc đã hết hạn.');
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex justify-center items-center" style={{ minHeight: '80vh' }}>
        <div className="glass-card text-center" style={{ maxWidth: '440px', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <CheckCircle2 size={64} color="#10b981" />
          </div>
          <h2 style={{ color: '#10b981', marginBottom: '12px' }}>Đặt lại thành công!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Mật khẩu đã được cập nhật. Đang chuyển đến đăng nhập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center" style={{ minHeight: '80vh', padding: '20px' }}>
      <div className="glass-card" style={{ maxWidth: '440px', width: '100%' }}>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', alignItems: 'center' }}>
          {[1, 2].map(s => (
            <React.Fragment key={s}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700,
                background: step >= s ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                color: step >= s ? 'white' : 'var(--text-secondary)',
              }}>{s}</div>
              {s < 2 && <div style={{ flex: 1, height: 2, background: step > s ? '#3b82f6' : 'rgba(255,255,255,0.1)', borderRadius: 2 }} />}
            </React.Fragment>
          ))}
        </div>

        {step === 1 ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(59,130,246,0.1)', border: '2px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Mail size={28} color="#3b82f6" />
              </div>
              <h2 style={{ fontSize: '1.4rem' }}>Quên mật khẩu?</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '8px' }}>
                Nhập email của bạn để nhận mã OTP đặt lại mật khẩu.
              </p>
            </div>
            <form onSubmit={handleSendOtp}>
              <div className="input-group">
                <label>Địa chỉ Email</label>
                <input
                  type="email" className="input-control"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="example@gmail.com"
                  required
                />
              </div>
              {error && <div style={errorBoxStyle}>{error}</div>}
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px', padding: '14px' }} disabled={loading}>
                {loading ? 'Đang gửi...' : <><Mail size={16} /> Gửi mã OTP</>}
              </button>
            </form>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(59,130,246,0.1)', border: '2px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <KeyRound size={28} color="#3b82f6" />
              </div>
              <h2 style={{ fontSize: '1.4rem' }}>Đặt lại mật khẩu</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px' }}>
                Mã OTP đã gửi đến <strong style={{ color: '#3b82f6' }}>{email}</strong>
              </p>
            </div>
            <form onSubmit={handleResetPassword}>
              {/* OTP row */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={el => inputRefs.current[i] = el}
                    type="text" inputMode="numeric" maxLength={6}
                    value={d}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    onFocus={e => e.target.select()}
                    style={{
                      width: '48px', height: '60px', textAlign: 'center',
                      fontSize: '1.5rem', fontWeight: 700, borderRadius: '10px',
                      border: `2px solid ${d ? '#3b82f6' : 'rgba(255,255,255,0.1)'}`,
                      background: d ? 'rgba(59,130,246,0.15)' : 'rgba(15,23,42,0.5)',
                      color: 'var(--text-primary)', outline: 'none',
                      fontFamily: "'Courier New', monospace",
                      boxShadow: d ? '0 0 10px rgba(59,130,246,0.25)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  />
                ))}
              </div>

              {/* Resend */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <button type="button" onClick={handleResend} disabled={!canResend}
                  style={{ background: 'none', border: 'none', cursor: canResend ? 'pointer' : 'default', color: canResend ? '#3b82f6' : 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
                  {canResend ? '↩ Gửi lại OTP' : `Gửi lại sau ${resendTimer}s`}
                </button>
              </div>

              {/* New Password */}
              <div className="input-group">
                <label>Mật khẩu mới</label>
                <input type="password" className="input-control"
                  value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự" required />
              </div>
              <div className="input-group">
                <label>Xác nhận mật khẩu</label>
                <input type="password" className="input-control"
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới" required />
              </div>

              {error && <div style={errorBoxStyle}>{error}</div>}
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: '4px' }} disabled={loading}>
                {loading ? 'Đang xử lý...' : <><KeyRound size={16} /> Đặt lại mật khẩu</>}
              </button>
            </form>
          </>
        )}

        <button onClick={() => step === 2 ? setStep(1) : navigate('/login')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem', marginTop: '20px', padding: 0 }}>
          <ArrowLeft size={16} /> {step === 2 ? 'Đổi email' : 'Quay lại đăng nhập'}
        </button>
      </div>
    </div>
  );
};

const errorBoxStyle = {
  background: 'rgba(239,68,68,0.15)',
  border: '1px solid rgba(239,68,68,0.3)',
  borderRadius: '10px',
  padding: '12px 16px',
  color: '#fca5a5',
  fontSize: '0.875rem',
  marginBottom: '16px',
};
