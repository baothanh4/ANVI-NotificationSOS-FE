import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

export const ApprovalPage = () => {
  const { grantId } = useParams();
  const [grant, setGrant] = useState(null);
  const [status, setStatus] = useState('LOADING'); // LOADING, IDLE, APPROVED, DENIED
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGrant = async () => {
      try {
        const res = await axiosClient.get(`/access-grants/${grantId}`);
        setGrant(res);
        if (res.status === 'APPROVED') setStatus('APPROVED');
        else if (res.status === 'DENIED') setStatus('DENIED');
        else setStatus('IDLE');
      } catch (err) {
        setError('Không tìm thấy yêu cầu hoặc yêu cầu đã hết hạn.');
        setStatus('ERROR');
      }
    };
    fetchGrant();
  }, [grantId]);

  const handleApprove = async () => {
    try {
      await axiosClient.post(`/access-grants/${grantId}/approve`);
      setStatus('APPROVED');
    } catch (err) {
      setError('Lỗi khi phê duyệt: ' + err.message);
    }
  };

  const handleDeny = async () => {
    try {
      await axiosClient.post(`/access-grants/${grantId}/deny`);
      setStatus('DENIED');
    } catch (err) {
      setError('Lỗi khi từ chối: ' + err.message);
    }
  };

  if (status === 'LOADING') return <div className="text-center mt-8">Đang tải thông tin yêu cầu...</div>;
  
  if (status === 'ERROR') {
    return (
      <div className="container text-center" style={{paddingTop: '60px'}}>
        <ShieldAlert size={48} color="#ef4444" style={{margin: '0 auto', marginBottom: '16px'}} />
        <h2 style={{color: '#ef4444'}}>{error}</h2>
      </div>
    );
  }

  return (
    <div className="container" style={{maxWidth: '500px', paddingTop: '60px'}}>
      <div className="glass-card" style={{padding: '32px', textAlign: 'center', background: 'var(--glass-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'}}>
        
        {status === 'IDLE' && (
          <>
            <ShieldAlert size={48} color="#f59e0b" style={{margin: '0 auto', marginBottom: '16px'}} />
            <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px'}}>Yêu Cầu Truy Cập Hồ Sơ Y Tế</h2>
            
            <div style={{background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', textAlign: 'left', marginBottom: '24px', border: '1px solid var(--glass-border)'}}>
              <p style={{marginBottom: '12px'}}><strong style={{color: 'var(--text-primary)'}}>Bác sĩ:</strong> {grant.doctorName}</p>
              <p><strong style={{color: 'var(--text-primary)'}}>Bệnh viện:</strong> {grant.hospitalName || 'Không có thông tin'}</p>
            </div>
            
            <p style={{color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6'}}>
              Bác sĩ này đang yêu cầu xem toàn bộ hồ sơ bệnh án, lịch sử phẫu thuật và kết quả xét nghiệm của nạn nhân để phục vụ công tác cấp cứu. Bạn có đồng ý cấp quyền không? (Quyền có hiệu lực trong 24 giờ)
            </p>

            <div style={{display: 'flex', gap: '16px', justifyContent: 'center'}}>
              <button 
                onClick={handleDeny}
                style={{flex: 1, padding: '12px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'}}
                onMouseOver={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }} 
                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ef4444'; }}
              >
                TỪ CHỐI
              </button>
              <button 
                onClick={handleApprove}
                style={{flex: 1, padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'}}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                CHO PHÉP (24H)
              </button>
            </div>
          </>
        )}

        {status === 'APPROVED' && (
          <>
            <CheckCircle size={64} color="#10b981" style={{margin: '0 auto', marginBottom: '16px'}} />
            <h2 style={{color: '#10b981', marginBottom: '16px'}}>Đã Phê Duyệt</h2>
            <p style={{color: 'var(--text-secondary)', lineHeight: '1.6'}}>Bác sĩ hiện đã có thể truy cập hồ sơ bệnh án. Quyền truy cập sẽ tự động thu hồi sau 24 giờ.</p>
          </>
        )}

        {status === 'DENIED' && (
          <>
            <XCircle size={64} color="#ef4444" style={{margin: '0 auto', marginBottom: '16px'}} />
            <h2 style={{color: '#ef4444', marginBottom: '16px'}}>Đã Từ Chối</h2>
            <p style={{color: 'var(--text-secondary)', lineHeight: '1.6'}}>Yêu cầu truy cập hồ sơ bệnh án đã bị hủy bỏ. Bác sĩ sẽ không thể xem thông tin chi tiết.</p>
          </>
        )}

      </div>
    </div>
  );
};
