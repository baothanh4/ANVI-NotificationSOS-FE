import React, { useState } from 'react';
import { HealthRecordForm } from '../components/HealthRecordForm';
import { EmergencyContactsManager } from '../components/EmergencyContactsManager';
import { AuditLogViewer } from '../components/AuditLogViewer';
import { MedicalDocumentsManager } from '../components/MedicalDocumentsManager';
import { LockscreenGenerator } from '../components/LockscreenGenerator';
import { useAuth } from '../contexts/AuthContext';
import { Heart, PhoneCall, Shield, FileText, Smartphone } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('health');

  if (!user) return <div className="container mt-8 text-center">Vui lòng đăng nhập.</div>;

  return (
    <div className="container" style={{paddingTop: '40px', paddingBottom: '40px'}}>
      <div className="mb-8 text-center">
        <h1 style={{fontSize: '2rem', fontWeight: 'bold'}}>QUẢN LÝ HỒ SƠ ANVI</h1>
        <p style={{color: 'var(--text-secondary)'}}>Thiết lập thông tin cứu hộ khẩn cấp của bạn</p>
      </div>

      <div style={{display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px', flexWrap: 'wrap'}}>
        <button 
          className="btn" 
          style={{background: activeTab === 'health' ? '#ef4444' : 'var(--glass-bg)', color: activeTab === 'health' ? 'white' : 'var(--text-primary)', border: '1px solid var(--glass-border)', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer'}}
          onClick={() => setActiveTab('health')}
        >
          <Heart size={18} style={{display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom'}} />
          Hồ sơ y tế
        </button>
        <button 
          className="btn" 
          style={{background: activeTab === 'contacts' ? '#3b82f6' : 'var(--glass-bg)', color: activeTab === 'contacts' ? 'white' : 'var(--text-primary)', border: '1px solid var(--glass-border)', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer'}}
          onClick={() => setActiveTab('contacts')}
        >
          <PhoneCall size={18} style={{display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom'}} />
          Danh bạ khẩn cấp
        </button>
        <button 
          className="btn" 
          style={{background: activeTab === 'audit' ? '#10b981' : 'var(--glass-bg)', color: activeTab === 'audit' ? 'white' : 'var(--text-primary)', border: '1px solid var(--glass-border)', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer'}}
          onClick={() => setActiveTab('audit')}
        >
          <Shield size={18} style={{display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom'}} />
          Lịch sử truy cập
        </button>
        <button 
          className="btn" 
          style={{background: activeTab === 'documents' ? '#8b5cf6' : 'var(--glass-bg)', color: activeTab === 'documents' ? 'white' : 'var(--text-primary)', border: '1px solid var(--glass-border)', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer'}}
          onClick={() => setActiveTab('documents')}
        >
          <FileText size={18} style={{display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom'}} />
          Tài liệu y tế
        </button>
        <button 
          className="btn" 
          style={{background: activeTab === 'lockscreen' ? '#f59e0b' : 'var(--glass-bg)', color: activeTab === 'lockscreen' ? 'white' : 'var(--text-primary)', border: '1px solid var(--glass-border)', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer'}}
          onClick={() => setActiveTab('lockscreen')}
        >
          <Smartphone size={18} style={{display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom'}} />
          Thẻ & QR Code
        </button>
      </div>

      <div className="glass-card" style={{padding: '32px', background: 'var(--glass-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'}}>
        {activeTab === 'health' && <HealthRecordForm />}
        {activeTab === 'contacts' && <EmergencyContactsManager />}
        {activeTab === 'audit' && <AuditLogViewer />}
        {activeTab === 'documents' && <MedicalDocumentsManager />}
        {activeTab === 'lockscreen' && <LockscreenGenerator />}
      </div>
    </div>
  );
};
