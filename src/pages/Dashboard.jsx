import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, Heart, PhoneCall, AlertTriangle, ArrowRight, Activity,
  Smartphone, Clock, BookOpen, Navigation, X, BellRing, ChevronRight
} from 'lucide-react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sosAlert, setSosAlert] = useState(null);
  const [showFirstAid, setShowFirstAid] = useState(false);
  const [selectedAid, setSelectedAid] = useState(null);

  const firstAidGuides = [
    {
      id: 'cpr',
      title: 'Ép tim ngoài lồng ngực (CPR)',
      icon: <Activity size={24} />,
      steps: [
        'Đặt 2 tay chồng lên nhau ở giữa ngực nạn nhân.',
        'Ấn mạnh và nhanh (100-120 lần/phút).',
        'Ấn sâu ít nhất 5cm và để ngực nảy lên hết.',
        'Tiếp tục cho đến khi có sự giúp đỡ chuyên nghiệp.'
      ]
    },
    {
      id: 'heimlich',
      title: 'Hóc dị vật (Heimlich)',
      icon: <AlertTriangle size={24} />,
      steps: [
        'Đứng sau nạn nhân, ôm quanh eo.',
        'Nắm một tay thành nắm đấm, đặt trên rốn một chút.',
        'Ấn mạnh vào trong và lên trên đột ngột.',
        'Lặp lại cho đến khi dị vật văng ra.'
      ]
    },
    {
      id: 'burns',
      title: 'Xử lý Vết bỏng',
      icon: <Clock size={24} />,
      steps: [
        'Xả nước mát lên vết bỏng ít nhất 10-20 phút.',
        'Không dùng đá lạnh, kem đánh răng hoặc mỡ.',
        'Che nhẹ bằng băng gạc sạch hoặc màng bọc thực phẩm.',
        'Đến cơ sở y tế nếu vết bỏng lớn hoặc phồng rộp.'
      ]
    },
    {
      id: 'bleeding',
      title: 'Cầm máu vết thương',
      icon: <Heart size={24} />,
      steps: [
        'Dùng gạc sạch ấn trực tiếp lên vết thương.',
        'Giữ chặt cho đến khi máu ngừng chảy.',
        'Nâng vùng bị thương cao hơn tim nếu có thể.',
        'Băng bó lại nhưng không quá chặt làm tắc mạch.'
      ]
    }
  ];

  useEffect(() => {
    if (!user) return;
    const socket = new SockJS('http://localhost:8081/ws-sos');
    const stompClient = Stomp.over(socket);
    stompClient.debug = null;
    stompClient.connect({}, () => {
      stompClient.subscribe('/topic/sos-alerts', (message) => {
        const payload = JSON.parse(message.body);
        if (payload.type === 'SOS_ALERT') {
          if (payload.victimName === user.fullName) return;
          setSosAlert(payload);
        } else if (payload.type === 'SOS_SAFE' && sosAlert?.publicToken === payload.publicToken) {
          setSosAlert(null);
        }
      });
    }, (error) => {
      console.error('WebSocket connection error:', error);
    });
    return () => { if (stompClient.connected) stompClient.disconnect(); };
  }, [user, sosAlert]);

  const handleNavigateProfile = (tab) => {
    localStorage.setItem('profile_active_tab', tab);
    navigate('/profile');
  };

  if (!user) return <div className="container mt-8 text-center">Vui lòng đăng nhập.</div>;

  return (
    <div className="dashboard-wrapper">
      <div className={`main-content ${sosAlert || showFirstAid ? 'content-blur' : ''}`}>
        <div className="container" style={{paddingTop: '60px', paddingBottom: '80px'}}>
          
          <div className="welcome-section">
            <h1 className="welcome-text">WELCOME BACK, <span className="highlight">{(user.fullName || 'User').toUpperCase()}</span></h1>
            <p className="sub-text">Hệ thống cứu hộ ANVI đang ở trạng thái sẵn sàng.</p>
          </div>

          <div className="dashboard-grid">
            {/* 1. SOS MAIN CARD */}
            <div className="glass-card sos-card" onClick={() => navigate('/sos')}>
               <div className="card-header">
                  <div className="sos-icon-container"><AlertTriangle size={40} /></div>
                  <div className="header-labels">
                     <span className="label-top">SYSTEM STATUS: ACTIVE</span>
                     <span className="label-main">SOS EMERGENCY</span>
                  </div>
               </div>
               <p className="card-desc">Trong trường hợp khẩn cấp, hãy kích hoạt tín hiệu SOS ngay tại đây để nhận được sự hỗ trợ nhanh nhất.</p>
               <div className="sos-btn">TRUY CẬP TRẠM SOS <ArrowRight size={20} /></div>
            </div>

            {/* 2. PROFILE SUMMARY */}
            <div className="glass-card profile-summary-card">
               <div className="card-header-simple">
                  <h2>HỒ SƠ CỦA BẠN</h2>
                  <Link to="/profile" className="detail-link">CHI TIẾT <ArrowRight size={16} /></Link>
               </div>
               <div className="info-list-horizontal">
                  <div className="info-badge">
                     <Heart size={18} color="var(--accent-red)" />
                     <div><span className="badge-label">BLOOD</span><div className="badge-val">A+</div></div>
                  </div>
                  <div className="info-badge">
                     <PhoneCall size={18} color="var(--accent-blue)" />
                     <div><span className="badge-label">CONTACTS</span><div className="badge-val">03 NGƯỜI</div></div>
                  </div>
                  <div className="info-badge">
                     <Shield size={18} color="#34C759" />
                     <div><span className="badge-label">STATUS</span><div className="badge-val">SECURE</div></div>
                  </div>
               </div>
               <div className="profile-footer-msg">Hệ thống đã mã hóa và bảo mật thông tin y tế của bạn.</div>
            </div>

            {/* 3. MANAGEMENT TOOLS (CLickable Cards) */}
            <div className="management-row">
               <div className="glass-card tool-card" onClick={() => handleNavigateProfile('health')}>
                  <div className="tool-icon-box"><Activity size={28} color="var(--accent-blue)" /></div>
                  <div className="tool-info">
                     <h4>HỒ SƠ Y TẾ</h4>
                     <p>Cập nhật bệnh lý, dị ứng...</p>
                  </div>
                  <ChevronRight size={20} className="tool-arrow" />
               </div>
               <div className="glass-card tool-card" onClick={() => handleNavigateProfile('qr')}>
                  <div className="tool-icon-box"><Smartphone size={28} color="var(--accent-blue)" /></div>
                  <div className="tool-info">
                     <h4>QR CODE</h4>
                     <p>Quản lý mã định danh cứu hộ</p>
                  </div>
                  <ChevronRight size={20} className="tool-arrow" />
               </div>
               <div className="glass-card tool-card" onClick={() => handleNavigateProfile('audit')}>
                  <div className="tool-icon-box"><Shield size={28} color="var(--accent-blue)" /></div>
                  <div className="tool-info">
                     <h4>NHẬT KÝ</h4>
                     <p>Lịch sử hoạt động bảo mật</p>
                  </div>
                  <ChevronRight size={20} className="tool-arrow" />
               </div>
            </div>

            {/* 4. PREMIUM FEATURES */}
            <div className="features-grid">
               <div className="feature-card journey" onClick={() => navigate('/safe-journey')}>
                  <div className="feature-icon"><Clock size={32} /></div>
                  <div className="feature-text">
                     <h3>SAFE JOURNEY</h3>
                     <p>Hành trình an toàn - Tự động bảo vệ</p>
                  </div>
                  <ArrowRight size={20} />
               </div>
               <div className="feature-card aid" onClick={() => setShowFirstAid(true)}>
                  <div className="feature-icon"><BookOpen size={32} /></div>
                  <div className="feature-text">
                     <h3>CẨM NANG SƠ CỨU</h3>
                     <p>Hướng dẫn khẩn cấp chuẩn y tế</p>
                  </div>
                  <ArrowRight size={20} />
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL SYSTEM */}
      {(sosAlert || showFirstAid) && (
        <div className="modal-overlay">
          {sosAlert && (
            <div className="modal-card sos-modal">
              <div className="modal-header-sos">
                <div className="sos-icon-ring"><AlertTriangle size={32} color="white" /></div>
                <div className="modal-title-group">
                  <span className="modal-label"><BellRing size={14} /> CẢNH BÁO KHẨN CẤP REAL-TIME</span>
                  <h3>TÍN HIỆU SOS TỪ: {sosAlert.victimName.toUpperCase()}</h3>
                </div>
                <button className="close-btn" onClick={() => setSosAlert(null)}><X size={20} /></button>
              </div>
              <div className="modal-body">
                <div className="location-badge"><Navigation size={18} /><span>{sosAlert.locationText || "Đang cập nhật vị trí..."}</span></div>
                <p>Người dùng <strong>{sosAlert.victimName}</strong> vừa kích hoạt SOS. Hãy nhấn ứng cứu ngay!</p>
                <button className="action-btn" onClick={() => navigate(`/sos-alert/${sosAlert.publicToken}`)}>ỨNG CỨU NGAY LẬP TỨC <ArrowRight size={20} /></button>
              </div>
            </div>
          )}

          {showFirstAid && (
            <div className="modal-card aid-modal">
              <div className="modal-header-aid">
                <BookOpen size={32} />
                <div className="modal-title-group"><h3>CẨM NANG SƠ CỨU NHANH</h3></div>
                <button className="close-btn" onClick={() => {setShowFirstAid(false); setSelectedAid(null);}}><X size={20} /></button>
              </div>
              <div className="modal-body scrollable">
                {!selectedAid ? (
                  <div className="guide-list">
                    {firstAidGuides.map(guide => (
                      <div key={guide.id} className="guide-item" onClick={() => setSelectedAid(guide)}>
                        <div className="guide-icon-box">{guide.icon}</div>
                        <span className="guide-name">{guide.title}</span>
                        <ChevronRight size={20} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="guide-detail">
                    <button className="back-btn" onClick={() => setSelectedAid(null)}><ArrowRight size={16} style={{transform: 'rotate(180deg)'}} /> Quay lại</button>
                    <h4>{selectedAid.title}</h4>
                    <div className="steps-container">
                      {selectedAid.steps.map((step, idx) => (
                        <div key={idx} className="step-row"><span className="step-num">{idx + 1}</span><p>{step}</p></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        .dashboard-wrapper { min-height: 100vh; background: #F8F9FA; font-family: 'Inter', sans-serif; }
        .main-content { transition: filter 0.3s ease; }
        .content-blur { filter: blur(12px) brightness(0.8); }
        
        .welcome-section { margin-bottom: 48px; }
        .welcome-text { font-size: 2.8rem; font-weight: 900; color: #1A1A1A; margin: 0; letter-spacing: -0.04em; }
        .highlight { color: var(--accent-blue); }
        .sub-text { color: #666; font-weight: 500; font-size: 1.1rem; margin-top: 8px; }

        .dashboard-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; }
        
        /* SOS Card */
        .sos-card { background: linear-gradient(135deg, #FF3B30, #D70015) !important; color: white; border: none !important; padding: 40px !important; cursor: pointer; transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .sos-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(255, 59, 48, 0.3); }
        .sos-icon-container { background: rgba(255,255,255,0.2); padding: 16px; border-radius: 16px; display: inline-block; }
        .card-header { display: flex; align-items: center; gap: 24px; margin-bottom: 24px; }
        .label-top { font-size: 0.75rem; font-weight: 900; opacity: 0.8; letter-spacing: 0.1em; display: block; margin-bottom: 4px; }
        .label-main { font-size: 1.8rem; font-weight: 950; letter-spacing: -0.02em; }
        .card-desc { font-size: 1rem; line-height: 1.6; opacity: 0.9; margin-bottom: 32px; font-weight: 500; }
        .sos-btn { background: white; color: #FF3B30; padding: 18px 32px; border-radius: 12px; font-weight: 900; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; gap: 12px; }

        /* Profile Summary */
        .profile-summary-card { padding: 32px !important; display: flex; flex-direction: column; }
        .info-list-horizontal { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin: 24px 0; }
        .info-badge { background: #F2F2F7; padding: 16px; border-radius: 16px; display: flex; align-items: center; gap: 12px; }
        .badge-label { font-size: 0.65rem; font-weight: 800; color: #8E8E93; display: block; }
        .badge-val { font-size: 1.1rem; font-weight: 900; color: #1C1C1E; }
        .profile-footer-msg { margin-top: auto; font-size: 0.8rem; color: #AEAEB2; font-weight: 500; text-align: center; font-style: italic; }

        /* Management Tools */
        .management-row { grid-column: span 2; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; margin-top: 12px; }
        .tool-card { padding: 20px 24px !important; display: flex; align-items: center; gap: 20px; cursor: pointer; transition: all 0.3s; border: 1px solid #E5E5E5 !important; }
        .tool-card:hover { border-color: var(--accent-blue) !important; background: #F0F7FF !important; transform: translateY(-4px); }
        .tool-icon-box { background: #F0F7FF; width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .tool-info { flex: 1; }
        .tool-info h4 { margin: 0; font-size: 1rem; font-weight: 800; color: #1A1A1A; }
        .tool-info p { margin: 4px 0 0; font-size: 0.8rem; color: #666; font-weight: 500; }
        .tool-arrow { opacity: 0.3; transition: transform 0.3s; }
        .tool-card:hover .tool-arrow { opacity: 1; transform: translateX(4px); color: var(--accent-blue); }

        /* Features */
        .features-grid { grid-column: span 2; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 12px; }
        .feature-card { padding: 32px; border-radius: 24px; color: white; display: flex; align-items: center; gap: 24px; cursor: pointer; transition: all 0.3s; }
        .feature-card.journey { background: linear-gradient(135deg, #FF9500, #FFCC00); }
        .feature-card.aid { background: linear-gradient(135deg, #34C759, #30B74E); }
        .feature-card:hover { transform: scale(1.02); box-shadow: 0 15px 30px rgba(0,0,0,0.1); }
        .feature-icon { background: rgba(255,255,255,0.25); width: 64px; height: 64px; border-radius: 18px; display: flex; align-items: center; justify-content: center; }
        .feature-text { flex: 1; }
        .feature-text h3 { margin: 0; font-size: 1.3rem; font-weight: 900; }
        .feature-text p { margin: 6px 0 0; font-size: 0.9rem; opacity: 0.9; font-weight: 500; }

        /* Modals */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); }
        .modal-card { background: white; width: 100%; max-width: 520px; border-radius: 28px; overflow: hidden; box-shadow: 0 50px 100px rgba(0,0,0,0.4); animation: slideIn 0.4s ease-out; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        
        .modal-header-sos { background: #FF3B30; padding: 32px; color: white; display: flex; gap: 20px; align-items: center; }
        .modal-header-aid { background: #34C759; padding: 32px; color: white; display: flex; gap: 20px; align-items: center; }
        .sos-icon-ring { width: 64px; height: 64px; background: rgba(255,255,255,0.25); border-radius: 50%; display: flex; align-items: center; justify-content: center; animation: pulseRing 1.5s infinite; }
        @keyframes pulseRing { 0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.4); } 70% { box-shadow: 0 0 0 20px rgba(255,255,255,0); } 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); } }

        .modal-body { padding: 32px; }
        .location-badge { background: #FFF1F0; padding: 16px; border-radius: 14px; display: flex; gap: 12px; align-items: center; color: #FF3B30; font-weight: 800; border: 1px solid #FFD8D6; margin-bottom: 24px; }
        .action-btn { width: 100%; background: #FF3B30; color: white; padding: 22px; border: none; border-radius: 14px; font-weight: 900; font-size: 1.1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 12px; transition: all 0.3s; }
        .action-btn:hover { background: #D70015; transform: scale(1.02); }

        .guide-list { display: grid; gap: 14px; }
        .guide-item { display: flex; align-items: center; gap: 16px; padding: 22px; background: #F2F2F7; border-radius: 18px; cursor: pointer; transition: all 0.2s; }
        .guide-item:hover { background: #E5E5EA; transform: scale(1.02); }
        .guide-icon-box { background: white; width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #34C759; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .guide-name { flex: 1; font-weight: 800; font-size: 1.1rem; color: #1C1C1E; }
      `}</style>
    </div>
  );
};
