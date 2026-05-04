import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Heart, Activity, FileText, AlertTriangle } from 'lucide-react';

export const PrivateHealthRecordPage = () => {
  const { grantToken } = useParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPrivateRecord = async () => {
      try {
        // Assume backend requires Authorization header with the grant token
        const res = await axiosClient.get('/health/private', {
          headers: {
            'Authorization': `Bearer ${grantToken}`
          }
        });
        setRecord(res);
      } catch (err) {
        setError('Phiên làm việc đã hết hạn hoặc token không hợp lệ.');
      } finally {
        setLoading(false);
      }
    };
    fetchPrivateRecord();
  }, [grantToken]);

  if (loading) return <div className="text-center mt-8">Đang tải hồ sơ bệnh án chi tiết...</div>;

  if (error) {
    return (
      <div className="container text-center" style={{paddingTop: '60px'}}>
        <AlertTriangle size={48} color="#ef4444" style={{margin: '0 auto', marginBottom: '16px'}} />
        <h2 style={{color: '#ef4444'}}>{error}</h2>
      </div>
    );
  }

  // Mock data fallback if API is not fully implemented yet
  const displayData = record || {
    bloodType: 'O+',
    birthYear: 1990,
    allergies: 'Kháng sinh Penicillin',
    conditions: 'Hen suyễn mãn tính, Cao huyết áp',
    emergencyNote: 'Bệnh nhân có tiền sử sốc phản vệ với hải sản. Vui lòng kiểm tra kỹ thuốc tiêm.',
    medications: 'Salbutamol dạng hít, Amlodipine 5mg',
    surgicalHistory: 'Mổ ruột thừa (2015)',
    recentTests: [
      { id: 1, name: 'Kết quả máu tổng quát (12/2024)', type: 'PDF' },
      { id: 2, name: 'X-Quang lồng ngực (10/2024)', type: 'Image' }
    ]
  };

  return (
    <div className="container" style={{maxWidth: '800px', paddingTop: '40px', paddingBottom: '60px'}}>
      <div className="text-center mb-8">
        <h1 style={{fontSize: '2rem', fontWeight: 'bold', color: '#10b981'}}>HỒ SƠ BỆNH ÁN CHI TIẾT</h1>
        <p style={{color: 'var(--text-secondary)'}}>
          Dành riêng cho nhân viên y tế (Phiên làm việc 24H)
        </p>
      </div>

      <div className="glass-card mb-6" style={{background: 'var(--glass-bg)', padding: '24px', borderRadius: '16px', borderTop: '4px solid #ef4444', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'}}>
        <h3 className="flex items-center gap-4 mb-4" style={{fontSize: '1.25rem', fontWeight: 'bold'}}><Heart color="#ef4444" /> Thông tin cơ bản & Lưu ý</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label style={{color: 'var(--text-secondary)', fontSize: '0.875rem'}}>Nhóm máu</label>
            <div style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#ef4444'}}>{displayData.bloodType}</div>
          </div>
          <div>
            <label style={{color: 'var(--text-secondary)', fontSize: '0.875rem'}}>Năm sinh</label>
            <div style={{fontSize: '1.25rem', fontWeight: 'bold'}}>{displayData.birthYear}</div>
          </div>
        </div>
        
        {displayData.emergencyNote && (
          <div style={{padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', borderLeft: '4px solid #ef4444', marginBottom: '16px'}}>
            <strong style={{color: '#ef4444'}}>LƯU Ý CẤP CỨU:</strong>
            <p style={{color: 'var(--text-primary)', marginTop: '4px', lineHeight: '1.5'}}>{displayData.emergencyNote}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={{color: 'var(--text-secondary)', fontSize: '0.875rem'}}>Dị ứng</label>
            <div style={{fontWeight: '500', color: '#ef4444'}}>{displayData.allergies}</div>
          </div>
          <div>
            <label style={{color: 'var(--text-secondary)', fontSize: '0.875rem'}}>Bệnh nền</label>
            <div style={{fontWeight: '500'}}>{displayData.conditions}</div>
          </div>
        </div>
      </div>

      <div className="glass-card mb-6" style={{background: 'var(--glass-bg)', padding: '24px', borderRadius: '16px', borderTop: '4px solid #f59e0b', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'}}>
        <h3 className="flex items-center gap-4 mb-4" style={{fontSize: '1.25rem', fontWeight: 'bold'}}><Activity color="#f59e0b" /> Lịch sử y khoa</h3>
        <div className="mb-4">
          <label style={{color: 'var(--text-secondary)', fontSize: '0.875rem'}}>Thuốc đang sử dụng</label>
          <div style={{fontWeight: '500', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--glass-border)'}}>{displayData.medications || 'Không ghi nhận'}</div>
        </div>
        <div>
          <label style={{color: 'var(--text-secondary)', fontSize: '0.875rem'}}>Lịch sử phẫu thuật</label>
          <div style={{fontWeight: '500', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--glass-border)'}}>{displayData.surgicalHistory || 'Không ghi nhận'}</div>
        </div>
      </div>

      <div className="glass-card" style={{background: 'var(--glass-bg)', padding: '24px', borderRadius: '16px', borderTop: '4px solid #3b82f6', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'}}>
        <h3 className="flex items-center gap-4 mb-4" style={{fontSize: '1.25rem', fontWeight: 'bold'}}><FileText color="#3b82f6" /> Tài liệu đính kèm</h3>
        {displayData.recentTests && displayData.recentTests.length > 0 ? (
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            {displayData.recentTests.map((doc) => (
              <div key={doc.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--glass-border)'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                  <FileText size={20} color="#3b82f6" />
                  <span style={{fontWeight: '500'}}>{doc.name}</span>
                </div>
                <button style={{background: 'transparent', color: '#3b82f6', border: '1px solid #3b82f6', padding: '6px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold'}}>Xem</button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{color: 'var(--text-secondary)'}}>Không có tài liệu nào được tải lên.</p>
        )}
      </div>

    </div>
  );
};
