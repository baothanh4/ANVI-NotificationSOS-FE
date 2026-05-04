import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

export const AccessRequestPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ doctorName: '', hospitalName: '' });
  const [grantId, setGrantId] = useState(null);
  const [status, setStatus] = useState('IDLE'); // IDLE, PENDING, APPROVED, DENIED
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.doctorName) {
      setError('Vui lòng nhập tên bác sĩ');
      return;
    }
    try {
      setError('');
      const res = await axiosClient.post('/access-grants/request', {
        targetUserId: parseInt(userId),
        doctorName: formData.doctorName,
        hospitalName: formData.hospitalName
      });
      setGrantId(res.id);
      setStatus('PENDING');
    } catch (err) {
      setError('Có lỗi xảy ra khi gửi yêu cầu: ' + err.message);
    }
  };

  useEffect(() => {
    if (!grantId) return;

    // Connect to SSE
    const eventSource = new EventSource(`http://localhost:8081/api/access-grants/${grantId}/stream`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.status === 'APPROVED') {
          setStatus('APPROVED');
          eventSource.close();
          // Navigate to private record after 2 seconds
          setTimeout(() => navigate(`/private-record/${data.token}`), 2000);
        } else if (data.status === 'DENIED') {
          setStatus('DENIED');
          eventSource.close();
        }
      } catch (e) {
        console.error("SSE parse error", e);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE Error", err);
    };

    return () => {
      eventSource.close();
    };
  }, [grantId, navigate]);

  if (status === 'PENDING') {
    return (
      <div className="container" style={{paddingTop: '60px', textAlign: 'center'}}>
        <div style={{marginBottom: '24px'}} className="spinner"></div>
        <h2 style={{color: '#3b82f6'}}>Đang chờ người nhà phê duyệt...</h2>
        <p style={{color: 'var(--text-secondary)', marginTop: '16px'}}>
          Vui lòng giữ nguyên màn hình này. Hệ thống sẽ tự động chuyển trang khi người nhà xác nhận cấp quyền truy cập.
        </p>
        <style>{`
          .spinner {
            width: 50px;
            height: 50px;
            border: 5px solid rgba(59, 130, 246, 0.2);
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (status === 'APPROVED') {
    return (
      <div className="container" style={{paddingTop: '60px', textAlign: 'center'}}>
        <div style={{color: '#10b981', fontSize: '48px', marginBottom: '16px'}}>✓</div>
        <h2 style={{color: '#10b981'}}>Đã được phê duyệt!</h2>
        <p>Đang chuyển hướng đến Hồ sơ Y tế chi tiết...</p>
      </div>
    );
  }

  if (status === 'DENIED') {
    return (
      <div className="container" style={{paddingTop: '60px', textAlign: 'center'}}>
        <div style={{color: '#ef4444', fontSize: '48px', marginBottom: '16px'}}>✕</div>
        <h2 style={{color: '#ef4444'}}>Yêu cầu bị từ chối</h2>
        <p style={{color: 'var(--text-secondary)'}}>Người nhà nạn nhân đã từ chối quyền truy cập hồ sơ chi tiết.</p>
        <button className="btn mt-4" style={{padding: '10px 20px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)'}} onClick={() => navigate(-1)}>Quay lại</button>
      </div>
    );
  }

  return (
    <div className="container" style={{maxWidth: '500px', paddingTop: '40px'}}>
      <div className="glass-card" style={{padding: '32px', background: 'var(--glass-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'}}>
        <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px', color: '#3b82f6'}}>Yêu cầu truy cập Hồ sơ Y tế</h2>
        <p style={{color: 'var(--text-secondary)', marginBottom: '24px'}}>
          Bác sĩ vui lòng điền thông tin bên dưới để gửi yêu cầu xem hồ sơ bệnh án chi tiết đến người thân của nạn nhân.
        </p>

        {error && <div style={{color: '#ef4444', marginBottom: '16px', padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px'}}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{marginBottom: '16px'}}>
            <label style={{display: 'block', marginBottom: '8px', color: 'var(--text-secondary)'}}>Tên Bác sĩ / Nhân viên y tế *</label>
            <input 
              type="text" 
              required
              value={formData.doctorName}
              onChange={(e) => setFormData({...formData, doctorName: e.target.value})}
              style={{padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', width: '100%'}}
            />
          </div>
          <div style={{marginBottom: '24px'}}>
            <label style={{display: 'block', marginBottom: '8px', color: 'var(--text-secondary)'}}>Bệnh viện / Đơn vị công tác</label>
            <input 
              type="text" 
              value={formData.hospitalName}
              onChange={(e) => setFormData({...formData, hospitalName: e.target.value})}
              style={{padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', width: '100%'}}
            />
          </div>
          <button type="submit" style={{background: '#3b82f6', color: 'white', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', width: '100%'}}>
            Gửi Yêu Cầu
          </button>
        </form>
      </div>
    </div>
  );
};
