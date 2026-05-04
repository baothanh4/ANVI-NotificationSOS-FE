import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MailCheck, RefreshCw, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
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

  // Đếm ngược thời gian gửi lại OTP
  useEffect(() => {
    if (resendTimer <= 0) {
      setCanResend(true);
      return;
    }
    const t = setTimeout(() => setResendTimer(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  // Focus ô đầu tiên khi load
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    // Chỉ nhận số
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];

    if (value.length > 1) {
      // Paste nhiều số: phân phối từng ô
      const digits = value.split('').slice(0, 6 - index);
      digits.forEach((d, i) => {
        if (index + i < 6) newOtp[index + i] = d;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Tự động focus ô tiếp theo
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Vui lòng nhập đủ 6 chữ số.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axiosClient.post('/auth/verify-email', { email, otp: code });
      setSuccess(true);
      // Tự chuyển sang login sau 2.5s
      setTimeout(() => navigate('/login', { state: { verifiedEmail: email } }), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
      // Reset OTP khi sai
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

  // Auto-submit khi đủ 6 số
  useEffect(() => {
    if (otp.every(d => d !== '') && !success) {
      handleSubmit();
    }
  }, [otp]);

  if (success) {
    return (
      <div className="flex justify-center items-center" style={{ minHeight: '80vh' }}>
        <div className="glass-card text-center" style={{ maxWidth: '440px', width: '100%' }}>
          <div style={styles.successIcon}>
            <CheckCircle2 size={64} color="#10b981" />
          </div>
          <h2 style={{ color: '#10b981', marginBottom: '12px' }}>Xác thực thành công!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Email của bạn đã được xác thực.
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Đang chuyển đến trang đăng nhập...
          </p>
          <div style={styles.loader}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center" style={{ minHeight: '80vh', padding: '20px' }}>
      <div className="glass-card" style={{ maxWidth: '460px', width: '100%' }}>

        {/* Header */}
        <div className="text-center" style={{ marginBottom: '32px' }}>
          <div style={styles.iconWrapper}>
            <ShieldCheck size={36} color="#3b82f6" />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Xác thực Email</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Mã OTP 6 số đã được gửi đến
          </p>
          <p style={{ color: '#3b82f6', fontWeight: 600, wordBreak: 'break-all' }}>
            {email || 'email của bạn'}
          </p>
        </div>

        {/* OTP Inputs */}
        <form onSubmit={handleSubmit}>
          <div style={styles.otpRow}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => inputRefs.current[i] = el}
                id={`otp-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                onFocus={e => e.target.select()}
                style={{
                  ...styles.otpInput,
                  borderColor: digit ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                  background: digit
                    ? 'rgba(59,130,246,0.15)'
                    : 'rgba(15,23,42,0.5)',
                  color: digit ? '#f8fafc' : 'var(--text-secondary)',
                  boxShadow: digit ? '0 0 12px rgba(59,130,246,0.3)' : 'none',
                }}
                autoComplete="off"
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={styles.errorBox}>
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || otp.some(d => d === '')}
            style={{ width: '100%', marginTop: '8px', padding: '14px', fontSize: '1rem' }}
          >
            {loading ? (
              <span style={styles.spinWrapper}>
                <span style={styles.spin}></span> Đang xác thực...
              </span>
            ) : (
              <><MailCheck size={18} /> Xác nhận OTP</>
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={styles.divider}></div>

        {/* Resend */}
        <div className="text-center">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '10px' }}>
            Không nhận được mã?
          </p>
          <button
            onClick={handleResend}
            disabled={!canResend || resendLoading}
            style={{
              background: 'none',
              border: 'none',
              cursor: canResend ? 'pointer' : 'default',
              color: canResend ? '#3b82f6' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'color 0.2s',
            }}
          >
            <RefreshCw size={14} />
            {resendLoading
              ? 'Đang gửi...'
              : canResend
                ? 'Gửi lại OTP'
                : `Gửi lại sau ${resendTimer}s`}
          </button>
        </div>

        {/* Back */}
        <button
          onClick={() => navigate('/login')}
          style={styles.backBtn}
        >
          <ArrowLeft size={16} /> Quay lại đăng nhập
        </button>
      </div>
    </div>
  );
};

const styles = {
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    background: 'rgba(59,130,246,0.1)',
    border: '2px solid rgba(59,130,246,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  otpRow: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  otpInput: {
    width: '52px',
    height: '64px',
    textAlign: 'center',
    fontSize: '1.6rem',
    fontWeight: 700,
    borderRadius: '12px',
    border: '2px solid',
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: "'Courier New', monospace",
  },
  errorBox: {
    background: 'rgba(239,68,68,0.15)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#fca5a5',
    fontSize: '0.875rem',
    marginBottom: '16px',
  },
  divider: {
    height: '1px',
    background: 'rgba(255,255,255,0.08)',
    margin: '24px 0',
  },
  successIcon: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  loader: {
    width: '32px',
    height: '4px',
    background: 'rgba(16,185,129,0.3)',
    borderRadius: '4px',
    margin: '20px auto 0',
    overflow: 'hidden',
    position: 'relative',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '0.85rem',
    marginTop: '20px',
    padding: '0',
    transition: 'color 0.2s',
  },
  spinWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  spin: {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};
