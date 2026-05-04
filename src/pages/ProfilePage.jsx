import React, { useState } from 'react';
import { HealthRecordForm } from '../components/HealthRecordForm';
import { EmergencyContactsManager } from '../components/EmergencyContactsManager';
import { AuditLogViewer } from '../components/AuditLogViewer';
import { MedicalDocumentsManager } from '../components/MedicalDocumentsManager';
import { LockscreenGenerator } from '../components/LockscreenGenerator';
import { useAuth } from '../contexts/AuthContext';
import { User, Shield, PhoneCall, Heart, FileText, Smartphone } from 'lucide-react';

export const ProfilePage = () => {
  const { user } = useAuth();
  
  // Read initial tab from localStorage or default to 'account'
  const savedTab = localStorage.getItem('profile_active_tab');
  const [activeTab, setActiveTab] = useState(savedTab || 'account');

  // Clear the tab from localStorage after reading so it doesn't persist across fresh visits
  // but keep it for navigation within the session if needed.
  // Actually, let's just update localStorage whenever setActiveTab is called.
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('profile_active_tab', tab);
  };

  if (!user) return <div className="container mt-8 text-center">Vui lòng đăng nhập.</div>;

  return (
    <div className="container" style={{paddingTop: '40px', paddingBottom: '60px'}}>
      <div className="mb-12 text-center">
        <h1 style={{fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)'}}>PROFILE & SETTINGS</h1>
        <p style={{color: 'var(--text-secondary)', fontWeight: 500, fontSize: '1rem', marginTop: '8px'}}>Quản lý thông tin cá nhân và thiết lập cứu hộ của bạn</p>
      </div>

      <div style={{display: 'flex', justifyContent: 'center', gap: '0', marginBottom: '40px', flexWrap: 'wrap', borderBottom: '2px solid var(--text-primary)'}}>
        <button 
          className="btn" 
          style={{background: 'transparent', color: activeTab === 'account' ? 'var(--accent-blue)' : 'var(--text-secondary)', border: 'none', borderBottom: activeTab === 'account' ? '4px solid var(--accent-blue)' : '4px solid transparent', padding: '16px 24px', borderRadius: '0', fontWeight: 800, cursor: 'pointer', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em'}}
          onClick={() => handleTabChange('account')}
        >
          TÀI KHOẢN
        </button>
        <button 
          className="btn" 
          style={{background: 'transparent', color: activeTab === 'health' ? 'var(--accent-blue)' : 'var(--text-secondary)', border: 'none', borderBottom: activeTab === 'health' ? '4px solid var(--accent-blue)' : '4px solid transparent', padding: '16px 24px', borderRadius: '0', fontWeight: 800, cursor: 'pointer', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em'}}
          onClick={() => handleTabChange('health')}
        >
          HỒ SƠ Y TẾ
        </button>
        <button 
          className="btn" 
          style={{background: 'transparent', color: activeTab === 'contacts' ? 'var(--accent-blue)' : 'var(--text-secondary)', border: 'none', borderBottom: activeTab === 'contacts' ? '4px solid var(--accent-blue)' : '4px solid transparent', padding: '16px 24px', borderRadius: '0', fontWeight: 800, cursor: 'pointer', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em'}}
          onClick={() => handleTabChange('contacts')}
        >
          LIÊN HỆ KHẨN CẤP
        </button>
        <button 
          className="btn" 
          style={{background: 'transparent', color: activeTab === 'documents' ? 'var(--accent-blue)' : 'var(--text-secondary)', border: 'none', borderBottom: activeTab === 'documents' ? '4px solid var(--accent-blue)' : '4px solid transparent', padding: '16px 24px', borderRadius: '0', fontWeight: 800, cursor: 'pointer', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em'}}
          onClick={() => handleTabChange('documents')}
        >
          TÀI LIỆU
        </button>
        <button 
          className="btn" 
          style={{background: 'transparent', color: activeTab === 'qr' ? 'var(--accent-blue)' : 'var(--text-secondary)', border: 'none', borderBottom: activeTab === 'qr' ? '4px solid var(--accent-blue)' : '4px solid transparent', padding: '16px 24px', borderRadius: '0', fontWeight: 800, cursor: 'pointer', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em'}}
          onClick={() => handleTabChange('qr')}
        >
          QR CODE
        </button>
        <button 
          className="btn" 
          style={{background: 'transparent', color: activeTab === 'audit' ? 'var(--accent-blue)' : 'var(--text-secondary)', border: 'none', borderBottom: activeTab === 'audit' ? '4px solid var(--accent-blue)' : '4px solid transparent', padding: '16px 24px', borderRadius: '0', fontWeight: 800, cursor: 'pointer', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em'}}
          onClick={() => handleTabChange('audit')}
        >
          LỊCH SỬ TRUY CẬP
        </button>
      </div>

      <div className="glass-card">
        {activeTab === 'account' && (
          <div style={{maxWidth: '600px', margin: '0 auto'}}>
             <div style={{display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid #EEEEEE'}}>
                <div style={{width: '100px', height: '100px', background: 'var(--accent-blue)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'white'}}>
                  <User size={48} style={{margin: '0 auto'}} />
                </div>
                <div>
                  <h3 style={{fontSize: '1.5rem', marginBottom: '4px'}}>{user.fullName || 'Unknown User'}</h3>
                  <p style={{fontWeight: 600, color: 'var(--accent-blue)'}}>USER ID: #{user.id || 'N/A'}</p>
                </div>
             </div>

             <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px'}}>
                <div className="input-group">
                  <label style={{fontWeight: 800, fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em'}}>Full Name</label>
                  <input readOnly value={user.fullName || ''} className="input-control" />
                </div>
                <div className="input-group">
                  <label style={{fontWeight: 800, fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em'}}>Phone Number</label>
                  <input readOnly value={user.phone || ''} className="input-control" />
                </div>
                <div className="input-group">
                  <label style={{fontWeight: 800, fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em'}}>Email Address</label>
                  <input readOnly value={user.email || ''} className="input-control" />
                </div>
                <div className="input-group">
                  <label style={{fontWeight: 800, fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em'}}>Account Status</label>
                  <div style={{padding: '14px 16px', background: '#F0FDF4', border: '2px solid #00843D', color: '#00843D', fontWeight: 800, fontSize: '0.85rem', borderRadius: '4px'}}>VERIFIED</div>
                </div>
             </div>
          </div>
        )}
        {activeTab === 'health' && <HealthRecordForm />}
        {activeTab === 'contacts' && <EmergencyContactsManager />}
        {activeTab === 'audit' && <AuditLogViewer />}
        {activeTab === 'documents' && <MedicalDocumentsManager />}
        {activeTab === 'qr' && <LockscreenGenerator />}
      </div>
    </div>
  );
};
