import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

import { useAuth } from '../contexts/AuthContext';

export const HealthRecordForm = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    bloodType: '',
    birthYear: '',
    allergies: '',
    conditions: '',
    emergencyNote: ''
  });

  useEffect(() => {
    const fetchHealth = async () => {
      if (!user || !user.id) return;
      try {
        const res = await axiosClient.get(`/health/users/${user.id}`);
        if (res) {
          setFormData({
            bloodType: res.bloodType || '',
            birthYear: res.birthYear || '',
            allergies: res.allergies || '',
            conditions: res.conditions || '',
            emergencyNote: res.emergencyNote || ''
          });
        }
      } catch (e) {
        console.error("No health record found or error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchHealth();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.id) return;
    setSaving(true);
    setMessage('');
    try {
      await axiosClient.put(`/health/users/${user.id}`, formData);
      setMessage('Lưu hồ sơ thành công!');
    } catch (e) {
      setMessage('Lỗi khi lưu hồ sơ: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Đang tải thông tin...</div>;

  return (
    <div>
      <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px'}}>Cập nhật Hồ sơ Y tế</h2>
      {message && <div style={{marginBottom: '16px', padding: '12px', background: message.includes('thành công') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: message.includes('thành công') ? '#10b981' : '#ef4444', borderRadius: '8px'}}>{message}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px'}}>
          <div>
            <label style={{display: 'block', marginBottom: '8px', color: 'var(--text-secondary)'}}>Nhóm máu</label>
            <select name="bloodType" value={formData.bloodType} onChange={handleChange} className="form-input w-full" style={{padding: '10px', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', width: '100%'}}>
              <option value="">Chưa rõ</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
          <div>
            <label style={{display: 'block', marginBottom: '8px', color: 'var(--text-secondary)'}}>Năm sinh</label>
            <input type="number" name="birthYear" value={formData.birthYear} onChange={handleChange} className="form-input w-full" placeholder="Ví dụ: 1990" style={{padding: '10px', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', width: '100%'}} />
          </div>
        </div>
        
        <div style={{marginBottom: '16px'}}>
          <label style={{display: 'block', marginBottom: '8px', color: 'var(--text-secondary)'}}>Dị ứng</label>
          <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} className="form-input w-full" placeholder="Ví dụ: Phấn hoa, hải sản, thuốc Penicillin..." style={{padding: '10px', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', width: '100%'}} />
        </div>

        <div style={{marginBottom: '16px'}}>
          <label style={{display: 'block', marginBottom: '8px', color: 'var(--text-secondary)'}}>Bệnh nền</label>
          <input type="text" name="conditions" value={formData.conditions} onChange={handleChange} className="form-input w-full" placeholder="Ví dụ: Tiểu đường type 2, cao huyết áp..." style={{padding: '10px', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', width: '100%'}} />
        </div>

        <div style={{marginBottom: '24px'}}>
          <label style={{display: 'block', marginBottom: '8px', color: 'var(--text-secondary)'}}>Ghi chú khẩn cấp (quan trọng)</label>
          <textarea name="emergencyNote" value={formData.emergencyNote} onChange={handleChange} className="form-input w-full" rows="3" placeholder="Các lưu ý đặc biệt cho bác sĩ khi cấp cứu..." style={{padding: '10px', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', width: '100%'}}></textarea>
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary" style={{padding: '12px 24px', background: '#ef4444', color: 'white', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer'}}>
          {saving ? 'Đang lưu...' : 'Lưu Hồ Sơ'}
        </button>
      </form>
    </div>
  );
};
