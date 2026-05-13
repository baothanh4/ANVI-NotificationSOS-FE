import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { HeartPulse, LogOut, User, Activity, AlertCircle, BookOpen, Shield, Phone, ShieldCheck, Facebook, Youtube, Instagram, MapPin, Mail } from 'lucide-react';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      {/* Top Bar - Hospital Style */}
      <div className="top-bar">
        <div className="medical-container" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
            <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}><Phone size={14} /> Tổng đài: 1900 066 883</span>
            <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}><AlertCircle size={14} /> Cấp cứu: (028) 3896 6894</span>
          </div>
            {user ? (
              <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <div style={{width: '24px', height: '24px', background: 'white', color: 'var(--primary-blue)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900}}>
                   {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span style={{fontWeight: 700, fontSize: '0.85rem'}}>Chào, {user.fullName}</span>
              </div>
            ) : (
              <Link to="/auth" className="top-bar-login-btn">
                <User size={14} /> <span>Đăng nhập thành viên</span>
              </Link>
            )}
        </div>
      </div>

      <header className="main-header">
        <div className="medical-container" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <Link to="/" style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <div style={{width: '45px', height: '45px', background: 'var(--primary-blue)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <ShieldCheck color="white" size={28} />
            </div>
            <div>
              <h1 style={{fontSize: '1.4rem', margin: 0, color: 'var(--primary-blue)', lineHeight: 1}}>ANVI-SOS</h1>
              <span style={{fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: '#666', letterSpacing: '1px'}}>Mạng lưới cứu hộ chuyên nghiệp</span>
            </div>
          </Link>

          <nav style={{display: 'flex', gap: '30px', alignItems: 'center'}}>
            <Link to="/" className="nav-link-medical">TRANG CHỦ</Link>
            <Link to="/about" className="nav-link-medical">GIỚI THIỆU</Link>
            <Link to="/first-aid" className="nav-link-medical">SƠ CẤP CỨU</Link>
            <Link to="/blog" className="nav-link-medical">TIN TỨC</Link>
            <Link to="/contact" className="nav-link-medical">LIÊN HỆ</Link>
            
            {user ? (
              <div style={{display: 'flex', gap: '10px'}}>
                <button onClick={() => navigate('/profile')} className="btn-medical">CÁ NHÂN</button>
                <button onClick={() => { logout(); navigate('/'); }} style={{background: '#F2F2F7', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer'}} title="Đăng xuất">
                  <LogOut size={20} color="#666" />
                </button>
              </div>
            ) : (
              <button onClick={() => navigate('/sos')} className="btn-emergency">KHẨN CẤP SOS</button>
            )}
          </nav>
        </div>
      </header>

      <style>{`
        .nav-link-medical {
          font-weight: 700;
          font-size: 0.9rem;
          color: #333;
          transition: color 0.2s;
          letter-spacing: 0.02em;
        }
        .nav-link-medical:hover {
          color: var(--primary-blue);
        }
        .top-bar-login-btn {
          background: rgba(255,255,255,0.15);
          color: white;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          transition: all 0.2s;
          border: 1px solid rgba(255,255,255,0.3);
        }
        .top-bar-login-btn:hover {
          background: white;
          color: var(--primary-blue);
          transform: translateY(-1px);
        }
        .logout-btn:hover {
          background: #FFF5F5 !important;
        }
      `}</style>
    </>
  );
};

const Footer = () => (
  <footer style={{background: '#002D5E', color: 'white', padding: '80px 0 40px', marginTop: '100px'}}>
    <div className="medical-container">
      <div style={{display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr', gap: '60px'}}>
        <div>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px'}}>
            <ShieldCheck color="white" size={32} />
            <h3 style={{color: 'white', margin: 0, fontSize: '1.6rem'}}>ANVI-SOS</h3>
          </div>
          <p style={{fontSize: '0.9rem', opacity: 0.7, lineHeight: 1.8}}>
            Hệ thống mạng lưới cứu hộ xã hội hóa, kết nối cộng đồng và chuyên gia y tế để ứng cứu kịp thời trong mọi tình huống khẩn cấp.
          </p>
          <div style={{display: 'flex', gap: '15px', marginTop: '24px'}}>
            <Facebook size={20} />
            <Youtube size={20} />
            <Instagram size={20} />
          </div>
        </div>

        <div>
          <h4 style={{color: 'white', marginBottom: '24px', fontSize: '1.1rem'}}>DỊCH VỤ</h4>
          <ul style={{listStyle: 'none', padding: 0, fontSize: '0.9rem', lineHeight: 2.5, opacity: 0.8}}>
            <li><Link to="/sos">Cấp cứu khẩn cấp</Link></li>
            <li><Link to="/safe-journey">Hành trình an toàn</Link></li>
            <li><Link to="/first-aid">Huấn luyện sơ cứu</Link></li>
            <li><Link to="/checkup">Gói tầm soát sức khỏe</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{color: 'white', marginBottom: '24px', fontSize: '1.1rem'}}>THÔNG TIN</h4>
          <ul style={{listStyle: 'none', padding: 0, fontSize: '0.9rem', lineHeight: 2.5, opacity: 0.8}}>
            <li><Link to="/about">Về chúng tôi</Link></li>
            <li><Link to="/blog">Tin tức y học</Link></li>
            <li><Link to="/contact">Liên hệ công tác</Link></li>
            <li><Link to="/policy">Chính sách bảo mật</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{color: 'white', marginBottom: '24px', fontSize: '1.1rem'}}>LIÊN HỆ</h4>
          <div style={{fontSize: '0.9rem', lineHeight: 1.8, opacity: 0.8}}>
            <p><MapPin size={16} style={{marginRight: '8px'}} /> 64 Lê Văn Chí, Linh Trung, Thủ Đức, TP.HCM</p>
            <p><Phone size={16} style={{marginRight: '8px'}} /> (028) 3896 6894</p>
            <p><Mail size={16} style={{marginRight: '8px'}} /> contact@anvisos.vn</p>
          </div>
          <div style={{marginTop: '24px', borderRadius: '12px', overflow: 'hidden', height: '100px', background: '#004494'}}>
             {/* Mock Map */}
             <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '0.8rem', opacity: 0.5}}>Bản đồ khu vực</div>
          </div>
        </div>
      </div>

      <div style={{borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '60px', paddingTop: '30px', textAlign: 'center', fontSize: '0.8rem', opacity: 0.5}}>
        © 2026 ANVI-SOS. Toàn quyền sở hữu. Thiết kế theo tiêu chuẩn y tế quốc tế.
      </div>
    </div>
  </footer>
);

import { SosListener } from './SosListener';
import { ChatBot } from './ChatBot/ChatBot';

export const Layout = () => {
  return (
    <div className="app-wrapper">
      <SosListener />
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
};

