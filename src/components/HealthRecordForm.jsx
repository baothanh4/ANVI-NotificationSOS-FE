import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../contexts/AuthContext';
import { 
  Activity, ShieldAlert, Heart, MapPin, Scale, Ruler, 
  ClipboardList, Info, Pill, UserCheck, CreditCard 
} from 'lucide-react';

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
    medications: '',
    weight: '',
    height: '',
    address: '',
    emergencyNote: '',
    insuranceId: '',
    pacemaker: false,
    emergencyContact: ''
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
            medications: res.medications || '',
            weight: res.weight || '',
            height: res.height || '',
            address: res.address || '',
            emergencyNote: res.emergencyNote || '',
            insuranceId: res.insuranceId || '',
            pacemaker: res.pacemaker || false,
            emergencyContact: res.emergencyContact || ''
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
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.id) return;
    setSaving(true);
    setMessage('');
    try {
      await axiosClient.put(`/health/users/${user.id}`, formData);
      setMessage('Dữ liệu y tế đã được đồng bộ hóa thành công!');
    } catch (e) {
      setMessage('Lỗi kết nối: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const sectionHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '1px solid #F0F0F0'
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    border: '1px solid #F5F5F5',
    height: '100%'
  };

  const labelStyle = {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '8px',
    display: 'block'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #E8E8E8',
    fontSize: '0.95rem',
    fontWeight: 500,
    outline: 'none',
    transition: 'all 0.2s',
    background: '#FAFAFA'
  };

  if (loading) return (
    <div style={{textAlign: 'center', padding: '60px'}}>
      <div className="medical-loader"></div>
      <p style={{marginTop: '20px', color: '#666', fontWeight: 600}}>Đang truy xuất hồ sơ y tế...</p>
    </div>
  );

  return (
    <div style={{maxWidth: '1000px', margin: '0 auto'}}>
      {/* Top Header */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px'}}>
        <div>
          <h1 style={{fontSize: '1.8rem', fontWeight: 800, color: '#1A1A1A', margin: 0}}>Hồ Sơ Y Tế</h1>
          <p style={{color: '#888', fontWeight: 500}}>Quản lý dữ liệu sinh tồn để ứng cứu kịp thời</p>
        </div>
        <div style={{
          padding: '10px 20px', 
          background: 'rgba(255, 59, 48, 0.1)', 
          color: '#FF3B30', 
          borderRadius: '100px', 
          fontSize: '0.8rem', 
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <ShieldAlert size={16} /> TRẠNG THÁI: SẴN SÀNG CỨU HỘ
        </div>
      </div>

      {message && (
        <div style={{
          marginBottom: '24px', 
          padding: '16px 20px', 
          background: '#00C853', 
          color: 'white', 
          borderRadius: '8px', 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 4px 12px rgba(0,200,83,0.2)'
        }}>
          <Info size={20} /> {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px'}}>
          
          {/* Cột trái: Thông số cơ bản */}
          <div style={{gridColumn: 'span 7'}}>
            <div style={cardStyle}>
              <div style={sectionHeaderStyle}>
                <Heart size={20} color="#FF3B30" fill="#FF3B30" />
                <span style={{fontWeight: 700, color: '#1A1A1A'}}>CHỈ SỐ SINH HỌC & CƠ THỂ</span>
              </div>
              
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px'}}>
                <div>
                  <label style={labelStyle}>Nhóm máu</label>
                  <select name="bloodType" value={formData.bloodType} onChange={handleChange} style={inputStyle}>
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
                  <label style={labelStyle}>Năm sinh</label>
                  <input type="number" name="birthYear" value={formData.birthYear} onChange={handleChange} style={inputStyle} placeholder="1990" />
                </div>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px'}}>
                <div style={{position: 'relative'}}>
                  <label style={labelStyle}>Chiều cao (cm)</label>
                  <input type="number" name="height" value={formData.height} onChange={handleChange} style={inputStyle} placeholder="170" />
                  <Ruler size={16} style={{position: 'absolute', right: '14px', top: '38px', color: '#CCC'}} />
                </div>
                <div style={{position: 'relative'}}>
                  <label style={labelStyle}>Cân nặng (kg)</label>
                  <input type="number" name="weight" value={formData.weight} onChange={handleChange} style={inputStyle} placeholder="65" />
                  <Scale size={16} style={{position: 'absolute', right: '14px', top: '38px', color: '#CCC'}} />
                </div>
              </div>

              <div style={{display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#FFF4F4', borderRadius: '8px', border: '1px solid #FFE0E0'}}>
                 <input type="checkbox" name="pacemaker" checked={formData.pacemaker} onChange={handleChange} style={{width: '20px', height: '20px', cursor: 'pointer'}} id="pacemaker" />
                 <label htmlFor="pacemaker" style={{fontSize: '0.9rem', fontWeight: 600, color: '#D32F2F', cursor: 'pointer'}}>Sử dụng máy trợ tim hoặc thiết bị kim loại cấy ghép</label>
              </div>
            </div>
          </div>

          {/* Cột phải: Thông tin hành chính */}
          <div style={{gridColumn: 'span 5'}}>
            <div style={cardStyle}>
              <div style={sectionHeaderStyle}>
                <CreditCard size={20} color="#007AFF" />
                <span style={{fontWeight: 700, color: '#1A1A1A'}}>THÔNG TIN PHÁP LÝ</span>
              </div>
              
              <div style={{marginBottom: '20px'}}>
                <label style={labelStyle}>Mã số BHYT / Bảo hiểm</label>
                <div style={{position: 'relative'}}>
                  <input type="text" name="insuranceId" value={formData.insuranceId} onChange={handleChange} style={inputStyle} placeholder="GD123456789" />
                  <ShieldAlert size={16} style={{position: 'absolute', right: '14px', top: '14px', color: '#CCC'}} />
                </div>
              </div>

              <div style={{marginBottom: '20px'}}>
                <label style={labelStyle}>Địa chỉ thường trú</label>
                <div style={{position: 'relative'}}>
                  <textarea name="address" value={formData.address} onChange={handleChange} style={{...inputStyle, minHeight: '80px', resize: 'none'}} placeholder="Số nhà, tên đường, khu vực..."></textarea>
                  <MapPin size={16} style={{position: 'absolute', right: '14px', top: '14px', color: '#CCC'}} />
                </div>
              </div>
            </div>
          </div>

          {/* Hàng dưới: Thông tin điều trị */}
          <div style={{gridColumn: 'span 12'}}>
            <div style={cardStyle}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px'}}>
                <div>
                  <div style={sectionHeaderStyle}>
                    <Activity size={20} color="#FF3B30" />
                    <span style={{fontWeight: 700, color: '#1A1A1A'}}>DỊ ỨNG & BỆNH LÝ</span>
                  </div>
                  <div style={{marginBottom: '20px'}}>
                    <label style={labelStyle}>Dị ứng đặc biệt</label>
                    <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} style={inputStyle} placeholder="VD: Kháng sinh, Hải sản, Đậu nành..." />
                  </div>
                  <div>
                    <label style={labelStyle}>Tiền sử bệnh lý</label>
                    <input type="text" name="conditions" value={formData.conditions} onChange={handleChange} style={inputStyle} placeholder="VD: Tiểu đường, Hen suyễn, Tim mạch..." />
                  </div>
                </div>

                <div>
                  <div style={sectionHeaderStyle}>
                    <Pill size={20} color="#007AFF" />
                    <span style={{fontWeight: 700, color: '#1A1A1A'}}>ĐIỀU TRỊ HIỆN TẠI</span>
                  </div>
                  <div style={{marginBottom: '20px'}}>
                    <label style={labelStyle}>Thuốc đang sử dụng</label>
                    <textarea name="medications" value={formData.medications} onChange={handleChange} style={{...inputStyle, minHeight: '110px', resize: 'none'}} placeholder="Liệt kê tên thuốc và liều lượng dùng hằng ngày..."></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hàng cuối: Liên hệ khẩn cấp */}
          <div style={{gridColumn: 'span 12'}}>
             <div style={{...cardStyle, background: '#1A1A1A', color: 'white', border: 'none'}}>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px'}}>
                   <div>
                      <div style={{...sectionHeaderStyle, borderBottom: '1px solid #333'}}>
                        <UserCheck size={20} color="#FF3B30" />
                        <span style={{fontWeight: 700, color: 'white'}}>NGƯỜI GIÁM HỘ / LIÊN HỆ KHẨN CẤP</span>
                      </div>
                      <label style={{...labelStyle, color: '#666'}}>Họ tên & Số điện thoại</label>
                      <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} style={{...inputStyle, background: '#222', border: '1px solid #333', color: 'white'}} placeholder="VD: Nguyễn Văn A (Cha) - 090xxxxxxx" />
                   </div>
                   <div>
                      <div style={{...sectionHeaderStyle, borderBottom: '1px solid #333'}}>
                        <ClipboardList size={20} color="#FF3B30" />
                        <span style={{fontWeight: 700, color: 'white'}}>GHI CHÚ QUAN TRỌNG NHẤT</span>
                      </div>
                      <label style={{...labelStyle, color: '#666'}}>Lời nhắn cho đội cứu hộ</label>
                      <textarea name="emergencyNote" value={formData.emergencyNote} onChange={handleChange} style={{...inputStyle, background: '#222', border: '1px solid #333', color: 'white', minHeight: '60px', resize: 'none'}} placeholder="VD: Tôi bị máu khó đông, hãy ưu tiên cầm máu..."></textarea>
                   </div>
                </div>
             </div>
          </div>

        </div>

        <div style={{marginTop: '40px', textAlign: 'right'}}>
          <button type="submit" disabled={saving} style={{
            padding: '16px 40px', 
            background: '#FF3B30', 
            color: 'white', 
            borderRadius: '12px', 
            border: 'none', 
            fontSize: '1rem', 
            fontWeight: 800, 
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(255, 59, 48, 0.3)',
            transition: 'all 0.3s',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px'
          }} className="save-btn">
            {saving ? 'ĐANG LƯU HỒ SƠ...' : 'XÁC NHẬN LƯU HỒ SƠ'} <ShieldAlert size={20} />
          </button>
        </div>
      </form>

      <style dangerouslySetInnerHTML={{__html: `
        .save-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(255, 59, 48, 0.4);
          background: #E0352B;
        }
        .save-btn:active {
          transform: translateY(0);
        }
        select {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 16px;
        }
      `}} />
    </div>
  );
};

