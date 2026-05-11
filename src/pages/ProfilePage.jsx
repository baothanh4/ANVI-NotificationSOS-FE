import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HealthRecordForm } from '../components/HealthRecordForm';
import { EmergencyContactsManager } from '../components/EmergencyContactsManager';
import { AuditLogViewer } from '../components/AuditLogViewer';
import { MedicalDocumentsManager } from '../components/MedicalDocumentsManager';
import { LockscreenGenerator } from '../components/LockscreenGenerator';
import { SocialLinksManager } from '../components/SocialLinksManager';
import { NfcLinkManager } from '../components/NfcLinkManager';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, Shield, PhoneCall, Heart, FileText, Smartphone, 
  LogOut, Share2, Mail, Lock, CheckCircle, Edit3, X, Save,
  ShieldCheck, ArrowRight
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [pwdData, setPwdData] = useState({ current: '', new: '', confirm: '' });

  const savedTab = localStorage.getItem('profile_active_tab');
  const [activeTab, setActiveTab] = useState(savedTab || 'account');
  const [activeSubTab, setActiveSubTab] = useState('lockscreen');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('profile_active_tab', tab);
  };

  const startEditing = () => {
    setEditData({
      fullName: user.fullName || '',
      phone: user.phone || '',
      email: user.email || '',
      bio: user.bio || '',
      dateOfBirth: user.dateOfBirth || ''
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(editData);
      setIsEditing(false);
    } catch (e) {
      alert('Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <div className="medical-container" style={{padding: '100px 0', textAlign: 'center'}}>Vui lòng đăng nhập.</div>;

  return (
    <div className="profile-page-medical" style={{animation: 'fadeIn 0.8s ease-out', paddingBottom: '100px'}}>
      {/* Header Section */}
      <div style={{background: 'var(--primary-blue)', color: 'white', padding: '60px 0', marginBottom: '40px'}}>
        <div className="medical-container">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div>
              <h1 style={{fontSize: '2.5rem', fontWeight: 950, color: 'white', letterSpacing: '-0.04em', marginBottom: '10px'}}>HỒ SƠ CÁ NHÂN</h1>
              <p style={{fontSize: '1.1rem', opacity: 0.9}}>Quản lý thông tin bảo mật và thiết lập cứu hộ của bạn.</p>
            </div>
            <div style={{display: 'flex', gap: '15px'}}>
              <div style={{background: 'rgba(255,255,255,0.2)', padding: '15px 25px', borderRadius: '15px', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', gap: '12px'}}>
                <div style={{width: '50px', height: '50px', background: 'white', color: 'var(--primary-blue)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900}}>
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div style={{fontSize: '0.75rem', fontWeight: 800, opacity: 0.8, textTransform: 'uppercase'}}>Xin chào,</div>
                  <div style={{fontSize: '1.1rem', fontWeight: 800}}>{user.fullName}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="medical-container" style={{display: 'grid', gridTemplateColumns: '320px 1fr', gap: '50px'}}>
        {/* Navigation Sidebar */}
        <aside style={{position: 'sticky', top: '120px', height: 'fit-content'}}>
          <div style={{background: 'white', borderRadius: '28px', padding: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #F0F0F0'}}>
            <div style={{padding: '10px 20px 20px', borderBottom: '1px solid #F5F5F5', marginBottom: '15px'}}>
               <h4 style={{margin: 0, fontSize: '0.8rem', color: '#999', letterSpacing: '1px', fontWeight: 900}}>CÀI ĐẶT HỒ SƠ</h4>
            </div>
            {[
              { id: 'account', label: 'TÀI KHOẢN', icon: <User size={20} /> },
              { id: 'health', label: 'HỒ SƠ Y TẾ', icon: <Heart size={20} /> },
              { id: 'contacts', label: 'MẠNG LƯỚI CỨU HỘ', icon: <PhoneCall size={20} /> },
              { id: 'documents', label: 'TÀI LIỆU Y TẾ', icon: <FileText size={20} /> },
              { id: 'qr', label: 'QR CODE / NFC', icon: <Smartphone size={20} /> },
              { id: 'audit', label: 'NHẬT KÝ BẢO MẬT', icon: <Shield size={20} /> },
              { id: 'social', label: 'MẠNG XÃ HỘI', icon: <Share2 size={20} /> }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  padding: '18px 25px',
                  border: 'none',
                  background: activeTab === tab.id ? '#F0F7FF' : 'transparent',
                  color: activeTab === tab.id ? 'var(--primary-blue)' : '#555',
                  borderRadius: '16px',
                  fontWeight: 850,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  marginBottom: '8px',
                  textAlign: 'left',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                className="profile-nav-btn"
              >
                {activeTab === tab.id && (
                  <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: '5px', background: 'var(--primary-blue)'}}></div>
                )}
                <span style={{opacity: activeTab === tab.id ? 1 : 0.7}}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
            <div style={{marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #F5F5F5'}}>
               <button onClick={() => { logout(); navigate('/'); }} style={{
                 width: '100%', display: 'flex', alignItems: 'center', gap: '15px', padding: '18px 25px', border: 'none', background: 'transparent', 
                 color: '#FF3B30', fontWeight: 850, fontSize: '0.85rem', cursor: 'pointer', borderRadius: '16px', transition: 'all 0.2s'
               }} className="logout-btn">
                 <LogOut size={20} /> ĐĂNG XUẤT
               </button>
            </div>
          </div>

          <div style={{marginTop: '30px', padding: '25px', background: '#F0FFF4', borderRadius: '24px', border: '1px solid #34C759'}}>
             <div style={{display: 'flex', alignItems: 'center', gap: '10px', color: '#166534', fontWeight: 800, marginBottom: '10px'}}>
                <ShieldCheck size={20} /> TÀI KHOẢN ĐÃ XÁC MINH
             </div>
             <p style={{fontSize: '0.8rem', color: '#166534', opacity: 0.8, lineHeight: 1.5}}>Hồ sơ của bạn đã được mã hóa và bảo vệ theo tiêu chuẩn y tế quốc tế.</p>
          </div>
        </aside>

        {/* Main Content Card */}
        <main style={{background: 'white', borderRadius: '32px', padding: '40px', boxShadow: 'var(--shadow-sm)', border: '1px solid #EEE'}}>
          {activeTab === 'account' && (
            <div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid #F5F5F5', paddingBottom: '20px'}}>
                <h3 style={{fontSize: '1.5rem', fontWeight: 900}}>THÔNG TIN TÀI KHOẢN</h3>
                {!isEditing ? (
                  <button onClick={startEditing} className="btn-medical" style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px'}}>
                    <Edit3 size={18} /> CHỈNH SỬA
                  </button>
                ) : (
                  <div style={{display: 'flex', gap: '10px'}}>
                    <button onClick={() => setIsEditing(false)} style={{background: '#F5F5F5', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer'}}>HỦY</button>
                    <button onClick={handleSave} disabled={saving} className="btn-medical" style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px'}}>
                      <Save size={18} /> {saving ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI'}
                    </button>
                  </div>
                )}
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px'}}>
                <div className="medical-field">
                  <label>HỌ VÀ TÊN</label>
                  <input 
                    readOnly={!isEditing} 
                    value={isEditing ? editData.fullName : user.fullName} 
                    onChange={(e) => setEditData({...editData, fullName: e.target.value})}
                  />
                </div>
                <div className="medical-field">
                  <label>SỐ ĐIỆN THOẠI</label>
                  <input 
                    readOnly={!isEditing} 
                    value={isEditing ? editData.phone : user.phone} 
                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                  />
                </div>
                <div className="medical-field">
                  <label>EMAIL</label>
                  <input 
                    readOnly={!isEditing} 
                    value={isEditing ? editData.email : user.email} 
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                  />
                </div>
                <div className="medical-field">
                  <label>NGÀY SINH</label>
                  <input 
                    type={isEditing ? "date" : "text"}
                    readOnly={!isEditing} 
                    value={isEditing ? editData.dateOfBirth : (user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN') : '')} 
                    onChange={(e) => setEditData({...editData, dateOfBirth: e.target.value})}
                  />
                </div>
                <div className="medical-field" style={{gridColumn: 'span 2'}}>
                  <label>GIỚI THIỆU BẢN THÂN</label>
                  <textarea 
                    readOnly={!isEditing} 
                    value={isEditing ? editData.bio : user.bio} 
                    onChange={(e) => setEditData({...editData, bio: e.target.value})}
                    rows={3}
                  />
                </div>
              </div>

              <div style={{marginTop: '50px', paddingTop: '40px', borderTop: '1px solid #F5F5F5'}}>
                <h4 style={{fontSize: '1rem', fontWeight: 900, marginBottom: '20px'}}>QUẢN LÝ BẢO MẬT</h4>
                <button onClick={() => setShowPasswordChange(true)} style={{background: 'white', border: '2px dashed #DDD', width: '100%', padding: '20px', borderRadius: '16px', color: '#999', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
                  <Lock size={18} /> THAY ĐỔI MẬT KHẨU TRUY CẬP
                </button>
              </div>
            </div>
          )}

          {activeTab === 'health' && <HealthRecordForm />}
          {activeTab === 'contacts' && <EmergencyContactsManager />}
          {activeTab === 'audit' && <AuditLogViewer />}
          {activeTab === 'documents' && <MedicalDocumentsManager />}
          {activeTab === 'qr' && (
            <div className="qr-nfc-tabs">
              <div style={{display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '2px solid #F5F5F5'}}>
                <button onClick={() => setActiveSubTab('lockscreen')} style={{background: 'none', border: 'none', padding: '15px', fontWeight: 800, color: activeSubTab === 'lockscreen' ? 'var(--primary-blue)' : '#999', borderBottom: activeSubTab === 'lockscreen' ? '4px solid var(--primary-blue)' : 'none', cursor: 'pointer'}}>LOCKSCREEN QR</button>
                <button onClick={() => setActiveSubTab('nfc')} style={{background: 'none', border: 'none', padding: '15px', fontWeight: 800, color: activeSubTab === 'nfc' ? 'var(--primary-blue)' : '#999', borderBottom: activeSubTab === 'nfc' ? '4px solid var(--primary-blue)' : 'none', cursor: 'pointer'}}>NFC PROFILE</button>
              </div>
              {activeSubTab === 'lockscreen' ? <LockscreenGenerator /> : <NfcLinkManager />}
            </div>
          )}
          {activeTab === 'social' && <SocialLinksManager />}
        </main>
      </div>

      <style>{`
        .medical-field { display: flex; flex-direction: column; gap: 10px; }
        .medical-field label { font-size: 0.75rem; font-weight: 900; color: #999; letter-spacing: 1px; }
        .medical-field input, .medical-field textarea { padding: 15px; border-radius: 12px; border: 1px solid #EEE; background: #F9F9F9; font-weight: 700; color: #333; outline: none; transition: border-color 0.2s; }
        .medical-field input:focus, .medical-field textarea:focus { border-color: var(--primary-blue); background: white; }
        .medical-field input[readOnly], .medical-field textarea[readOnly] { background: #F9F9F9; border-color: transparent; }
      `}</style>
    </div>
  );
};
