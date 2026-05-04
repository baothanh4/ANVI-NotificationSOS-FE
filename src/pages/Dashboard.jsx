import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Heart, 
  PhoneCall, 
  AlertTriangle, 
  ArrowRight,
  Activity,
  Smartphone
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return <div className="container mt-8 text-center">Vui lòng đăng nhập.</div>;

  return (
    <div className="container" style={{paddingTop: '40px', paddingBottom: '60px'}}>
      <div className="mb-12">
        <h1 style={{fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)'}}>
          WELCOME BACK, {(user.fullName || 'User').toUpperCase()}
        </h1>
        <p style={{color: 'var(--text-secondary)', fontWeight: 500, fontSize: '1rem', marginTop: '8px'}}>Hệ thống cứu hộ ANVI đang hoạt động bảo vệ bạn.</p>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px'}}>
        
        {/* Quick SOS Card */}
        <div className="glass-card" style={{background: 'var(--accent-red)', border: 'none', color: 'white'}}>
           <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px'}}>
              <AlertTriangle size={48} />
              <div style={{textAlign: 'right'}}>
                <div style={{fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8}}>Emergency</div>
                <div style={{fontSize: '1.5rem', fontWeight: 800}}>SOS SYSTEM</div>
              </div>
           </div>
           <p style={{fontSize: '1.1rem', fontWeight: 600, marginBottom: '32px', lineHeight: 1.4}}>
              Trong trường hợp khẩn cấp, nhấn nút bên dưới để gửi cảnh báo ngay lập tức.
           </p>
           <Link to="/sos" className="btn" style={{background: 'white', color: 'var(--accent-red)', width: '100%', padding: '20px', borderRadius: '4px', fontSize: '1rem', fontWeight: 800}}>
              TRUY CẬP TRẠM SOS
           </Link>
        </div>

        {/* Profile Summary Card */}
        <div className="glass-card">
           <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px'}}>
              <h2 style={{fontSize: '1.5rem', fontWeight: 800}}>HỒ SƠ CỦA BẠN</h2>
              <Link to="/profile" style={{color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px'}}>
                 CHI TIẾT <ArrowRight size={16} />
              </Link>
           </div>
           
           <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--bg-primary)', borderLeft: '4px solid var(--accent-blue)'}}>
                 <Heart size={20} color="var(--accent-blue)" />
                 <div>
                    <div style={{fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)'}}>BLOOD TYPE</div>
                    <div style={{fontWeight: 700}}>A+ (Positive)</div>
                 </div>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--bg-primary)', borderLeft: '4px solid var(--accent-blue)'}}>
                 <PhoneCall size={20} color="var(--accent-blue)" />
                 <div>
                    <div style={{fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)'}}>EMERGENCY CONTACTS</div>
                    <div style={{fontWeight: 700}}>03 Liên hệ đã thiết lập</div>
                 </div>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--bg-primary)', borderLeft: '4px solid var(--accent-blue)'}}>
                 <Shield size={20} color="var(--accent-blue)" />
                 <div>
                    <div style={{fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)'}}>SECURITY STATUS</div>
                    <div style={{fontWeight: 700}}>Hoạt động bình thường</div>
                 </div>
              </div>
           </div>
        </div>

        {/* Secondary Grid */}
        <div style={{gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px'}}>
           <div className="glass-card" style={{padding: '24px', textAlign: 'center'}}>
              <Activity size={32} color="var(--accent-blue)" style={{marginBottom: '16px'}} />
              <h4 style={{fontSize: '0.8rem', fontWeight: 800, marginBottom: '8px'}}>HỒ SƠ Y TẾ</h4>
              <Link to="/profile" onClick={() => localStorage.setItem('profile_active_tab', 'health')} style={{fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)', textDecoration: 'none'}}>QUẢN LÝ</Link>
           </div>
           <div className="glass-card" style={{padding: '24px', textAlign: 'center'}}>
              <Smartphone size={32} color="var(--accent-blue)" style={{marginBottom: '16px'}} />
              <h4 style={{fontSize: '0.8rem', fontWeight: 800, marginBottom: '8px'}}>QR CODE</h4>
              <Link to="/profile" onClick={() => localStorage.setItem('profile_active_tab', 'qr')} style={{fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)', textDecoration: 'none'}}>TẠO MỚI</Link>
           </div>
           <div className="glass-card" style={{padding: '24px', textAlign: 'center'}}>
              <Shield size={32} color="var(--accent-blue)" style={{marginBottom: '16px'}} />
              <h4 style={{fontSize: '0.8rem', fontWeight: 800, marginBottom: '8px'}}>NHẬT KÝ</h4>
              <Link to="/profile" onClick={() => localStorage.setItem('profile_active_tab', 'audit')} style={{fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)', textDecoration: 'none'}}>KIỂM TRA</Link>
           </div>
        </div>

      </div>
    </div>
  );
};
