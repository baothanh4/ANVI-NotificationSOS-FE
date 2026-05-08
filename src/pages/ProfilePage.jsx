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
  LogOut, Share2, Mail, Lock, CheckCircle, Edit3, X, Save
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

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

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
    // Age Validation (16+)
    if (editData.dateOfBirth) {
      const birthDate = new Date(editData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 16) {
        alert("Bạn phải trên 16 tuổi để sử dụng tính năng này.");
        return;
      }
    }

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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwdData.new !== pwdData.confirm) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    alert("Tính năng đổi mật khẩu đang được kết nối với hệ thống...");
    setShowPasswordChange(false);
    setPwdData({ current: '', new: '', confirm: '' });
  };

  if (!user) return <div className="container mt-8 text-center">Vui lòng đăng nhập.</div>;

  return (
    <div className="profile-wrapper">
      <div className="container" style={{paddingTop: '60px', paddingBottom: '80px'}}>
        
        {/* Header Section */}
        <div className="profile-header">
          <h1>PROFILE & SETTINGS</h1>
          <p>Quản lý thông tin bảo mật và thiết lập cứu hộ cá nhân của bạn</p>
        </div>

        {/* Navigation Tabs */}
        <div className="tab-navigation">
          {[
            { id: 'account', label: 'TÀI KHOẢN', icon: <User size={16} /> },
            { id: 'health', label: 'HỒ SƠ Y TẾ', icon: <Heart size={16} /> },
            { id: 'contacts', label: 'LIÊN HỆ', icon: <PhoneCall size={16} /> },
            { id: 'documents', label: 'TÀI LIỆU', icon: <FileText size={16} /> },
            { id: 'qr', label: 'QR CODE', icon: <Smartphone size={16} /> },
            { id: 'audit', label: 'NHẬT KÝ', icon: <Shield size={16} /> },
            { id: 'social', label: 'MẠNG XÃ HỘI', icon: <Share2 size={16} /> }
          ].map(tab => (
            <button 
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Card */}
        <div className="glass-card main-profile-card">
          {activeTab === 'account' && (
            <div className="account-section">
              <div className="account-top-bar">
                <div className="user-intro">
                  <div className="avatar-placeholder">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : <User size={40} />}
                  </div>
                  <div className="intro-text">
                    <span className="welcome-tag">CHÀO MỪNG TRỞ LẠI,</span>
                    <h3>{user.fullName ? user.fullName.toUpperCase() : 'USER'}</h3>
                    <div className="user-id-badge">UID: #{user.id || '---'}</div>
                  </div>
                </div>
                <div className="top-actions">
                  {!isEditing ? (
                    <>
                      <button onClick={startEditing} className="edit-btn"><Edit3 size={18} /> EDIT PROFILE</button>
                      <button onClick={handleLogout} className="logout-btn"><LogOut size={18} /> LOGOUT</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setIsEditing(false)} className="cancel-btn"><X size={18} /> CANCEL</button>
                      <button onClick={handleSave} disabled={saving} className="save-btn">
                        <Save size={18} /> {saving ? 'SAVING...' : 'SAVE CHANGES'}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="profile-details-grid">
                <div className="detail-field">
                  <label><User size={14} /> FULL NAME</label>
                  <input 
                    readOnly={!isEditing} 
                    value={isEditing ? editData.fullName : (user.fullName || '')} 
                    onChange={(e) => setEditData({...editData, fullName: e.target.value})}
                    placeholder="Chưa cập nhật tên"
                  />
                </div>
                <div className="detail-field">
                  <label><User size={14} /> DATE OF BIRTH</label>
                  <input 
                    type={isEditing ? "date" : "text"}
                    readOnly={!isEditing} 
                    value={isEditing ? editData.dateOfBirth : (user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN') : '')} 
                    onChange={(e) => setEditData({...editData, dateOfBirth: e.target.value})}
                    placeholder="DD/MM/YYYY"
                  />
                </div>
                <div className="detail-field">
                  <label><PhoneCall size={14} /> PHONE NUMBER</label>
                  <input 
                    readOnly={!isEditing} 
                    value={isEditing ? editData.phone : (user.phone || '')} 
                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                  />
                </div>
                <div className="detail-field">
                  <label><Mail size={14} /> EMAIL ADDRESS</label>
                  <input 
                    readOnly={!isEditing} 
                    value={isEditing ? editData.email : (user.email || '')} 
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                  />
                </div>
                <div className="detail-field full-width">
                  <label><FileText size={14} /> GIỚI THIỆU BẢN THÂN (BIO)</label>
                  <textarea 
                    readOnly={!isEditing} 
                    value={isEditing ? editData.bio : (user.bio || '')} 
                    onChange={(e) => setEditData({...editData, bio: e.target.value})}
                    placeholder="Viết vài câu giới thiệu về bạn cho hồ sơ NFC..."
                    rows={3}
                  />
                </div>
                <div className="detail-field">
                  <label><CheckCircle size={14} /> ACCOUNT STATUS</label>
                  <div className="status-box-verified">VERIFIED & PROTECTED</div>
                </div>
              </div>

              {/* Password Section */}
              <div className="password-management-area">
                {!showPasswordChange ? (
                  <button className="pw-trigger-btn" onClick={() => setShowPasswordChange(true)}>
                    <Lock size={18} /> THAY ĐỔI MẬT KHẨU TRUY CẬP
                  </button>
                ) : (
                  <form onSubmit={handleChangePassword} className="password-form-box">
                    <h4>CẬP NHẬT MẬT KHẨU MỚI</h4>
                    <div className="pwd-grid">
                      <input type="password" placeholder="Mật khẩu hiện tại" required value={pwdData.current} onChange={e => setPwdData({...pwdData, current: e.target.value})} />
                      <input type="password" placeholder="Mật khẩu mới" required value={pwdData.new} onChange={e => setPwdData({...pwdData, new: e.target.value})} />
                      <input type="password" placeholder="Xác nhận mật khẩu mới" required value={pwdData.confirm} onChange={e => setPwdData({...pwdData, confirm: e.target.value})} />
                    </div>
                    <div className="pwd-actions">
                      <button type="button" onClick={() => setShowPasswordChange(false)} className="cancel-pw">HỦY BỎ</button>
                      <button type="submit" className="confirm-pw">CẬP NHẬT NGAY</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {activeTab === 'health' && <HealthRecordForm />}
          {activeTab === 'contacts' && <EmergencyContactsManager />}
          {activeTab === 'audit' && <AuditLogViewer />}
          {activeTab === 'documents' && <MedicalDocumentsManager />}
          {activeTab === 'qr' && (
            <div className="qr-nfc-tabs">
              <div className="sub-tab-nav">
                <button className={`sub-btn ${activeSubTab === 'lockscreen' ? 'active' : ''}`} onClick={() => setActiveSubTab('lockscreen')}>LOCKSCREEN QR</button>
                <button className={`sub-btn ${activeSubTab === 'nfc' ? 'active' : ''}`} onClick={() => setActiveSubTab('nfc')}>NFC PROFILE</button>
              </div>
              <div className="sub-tab-content">
                {activeSubTab === 'lockscreen' ? <LockscreenGenerator /> : <NfcLinkManager />}
              </div>
            </div>
          )}
          {activeTab === 'social' && <SocialLinksManager />}
        </div>
      </div>

      <style>{`
        .profile-wrapper { min-height: 100vh; background: #F2F2F7; }
        .profile-header { text-align: center; margin-bottom: 48px; }
        .profile-header h1 { font-size: 2.8rem; font-weight: 900; letter-spacing: -0.04em; color: #1C1C1E; margin: 0; }
        .profile-header p { color: #8E8E93; font-weight: 500; font-size: 1.1rem; margin-top: 10px; }

        .tab-navigation { display: flex; justify-content: center; gap: 8px; margin-bottom: 32px; flex-wrap: wrap; }
        .tab-btn { 
          background: white; border: none; padding: 14px 20px; border-radius: 12px;
          font-weight: 800; font-size: 0.75rem; color: #8E8E93; cursor: pointer;
          display: flex; align-items: center; gap: 8px; transition: all 0.2s;
          box-shadow: 0 4px 6px rgba(0,0,0,0.02);
        }
        .tab-btn.active { background: var(--accent-blue); color: white; transform: translateY(-2px); box-shadow: 0 8px 15px rgba(0,122,255,0.2); }
        .tab-btn:hover:not(.active) { background: #E5E5EA; color: #1C1C1E; }

        .main-profile-card { padding: 48px !important; max-width: 1000px; margin: 0 auto; border: none !important; box-shadow: 0 20px 50px rgba(0,0,0,0.08) !important; }
        
        .account-top-bar { display: flex; justify-content: space-between; align-items: center; padding-bottom: 40px; border-bottom: 1px solid #F2F2F7; margin-bottom: 40px; }
        .user-intro { display: flex; align-items: center; gap: 24px; }
        .avatar-placeholder { width: 88px; height: 88px; background: var(--accent-blue); color: white; border-radius: 24px; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 950; }
        .welcome-tag { font-size: 0.7rem; font-weight: 900; color: var(--accent-blue); letter-spacing: 0.1em; }
        .intro-text h3 { margin: 4px 0; font-size: 1.8rem; font-weight: 900; color: #1C1C1E; }
        .user-id-badge { display: inline-block; padding: 4px 12px; background: #F2F2F7; border-radius: 6px; font-weight: 800; font-size: 0.75rem; color: #8E8E93; }

        .top-actions { display: flex; gap: 12px; }
        .edit-btn, .save-btn { background: #1C1C1E; color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 800; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        .logout-btn { background: white; color: #FF3B30; border: 2px solid #FF3B30; padding: 10px 24px; border-radius: 10px; font-weight: 800; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        .cancel-btn { background: #F2F2F7; color: #1C1C1E; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 800; font-size: 0.85rem; cursor: pointer; }

        .profile-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
        .detail-field label { display: flex; align-items: center; gap: 8px; font-size: 0.7rem; font-weight: 900; color: #8E8E93; margin-bottom: 10px; letter-spacing: 0.05em; }
        .detail-field input, .detail-field textarea { width: 100%; padding: 16px; border-radius: 12px; border: 2px solid #F2F2F7; background: #F8F9FA; font-weight: 700; font-size: 1rem; color: #1C1C1E; transition: all 0.2s; }
        .detail-field textarea { resize: none; font-family: inherit; }
        .detail-field input:focus, .detail-field textarea:focus { border-color: var(--accent-blue); background: white; outline: none; }
        .detail-field.full-width { grid-column: span 2; }
        .status-box-verified { padding: 16px; background: #F0FFF4; border: 2px solid #34C759; color: #166534; font-weight: 900; font-size: 0.9rem; border-radius: 12px; text-align: center; }

        .qr-nfc-tabs { width: 100%; }
        .sub-tab-nav { display: flex; gap: 16px; margin-bottom: 32px; border-bottom: 2px solid #F2F2F7; padding-bottom: 12px; }
        .sub-btn { background: none; border: none; font-weight: 900; font-size: 0.8rem; color: #8E8E93; cursor: pointer; padding: 8px 12px; position: relative; }
        .sub-btn.active { color: var(--accent-blue); }
        .sub-btn.active::after { content: ''; position: absolute; bottom: -14px; left: 0; width: 100%; height: 4px; background: var(--accent-blue); border-radius: 2px; }

        .password-management-area { margin-top: 56px; padding-top: 40px; border-top: 1px solid #F2F2F7; }
        .pw-trigger-btn { background: none; border: 2px dashed #E5E5EA; color: #8E8E93; padding: 20px; width: 100%; border-radius: 16px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 12px; transition: all 0.2s; }
        .pw-trigger-btn:hover { border-color: var(--accent-blue); color: var(--accent-blue); background: #F0F7FF; }

        .password-form-box { background: #F8F9FA; padding: 32px; border-radius: 20px; border: 1px solid #E5E5EA; }
        .password-form-box h4 { margin: 0 0 24px; font-size: 1rem; font-weight: 900; }
        .pwd-grid { display: grid; gap: 16px; }
        .pwd-grid input { width: 100%; padding: 14px; border-radius: 10px; border: 1px solid #DDD; font-weight: 600; }
        .pwd-actions { display: flex; gap: 16px; margin-top: 24px; }
        .confirm-pw { flex: 1; background: var(--accent-blue); color: white; border: none; padding: 14px; border-radius: 10px; font-weight: 800; cursor: pointer; }
        .cancel-pw { background: none; border: none; color: #8E8E93; font-weight: 700; cursor: pointer; }
      `}</style>
    </div>
  );
};
