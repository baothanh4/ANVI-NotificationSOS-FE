import React from 'react';
import { 
  History, Eye, Target, Award, Users, ChevronRight, 
  ShieldCheck, Zap, Heart, Globe 
} from 'lucide-react';

export const AboutPage = () => {
  const [activeSection, setActiveSection] = React.useState('history');
  
  const sections = [
    { id: 'history', label: 'Lịch sử hình thành', icon: <History size={20} /> },
    { id: 'overview', label: 'Tổng quan', icon: <Globe size={20} /> },
    { id: 'vision', label: 'Tầm nhìn', icon: <Eye size={20} /> },
    { id: 'mission', label: 'Sứ mệnh', icon: <Target size={20} /> },
    { id: 'core-values', label: 'Giá trị cốt lõi', icon: <Award size={20} /> },
    { id: 'leadership', label: 'Ban lãnh đạo', icon: <Users size={20} /> }
  ];

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <div className="about-page-medical" style={{animation: 'fadeIn 0.8s ease-out', paddingBottom: '100px'}}>
      {/* Banner */}
      <div style={{background: 'var(--primary-blue)', color: 'white', padding: '80px 0', marginBottom: '60px'}}>
        <div className="medical-container">
          <h1 style={{fontSize: '3rem', fontWeight: 950, color: 'white', letterSpacing: '-0.04em'}}>GIỚI THIỆU VỀ ANVI-SOS</h1>
          <div style={{display: 'flex', gap: '10px', alignItems: 'center', marginTop: '15px', fontSize: '0.9rem', opacity: 0.8}}>
            <span>Trang chủ</span> <ChevronRight size={14} /> <span style={{fontWeight: 700}}>Giới thiệu</span>
          </div>
        </div>
      </div>

      <div className="medical-container" style={{display: 'grid', gridTemplateColumns: '320px 1fr', gap: '60px'}}>
        {/* Sidebar Navigation */}
        <aside style={{position: 'sticky', top: '120px', height: 'fit-content'}}>
          <div style={{background: 'white', padding: '15px', borderRadius: '28px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #F0F0F0'}}>
            <div style={{padding: '10px 20px 20px', borderBottom: '1px solid #F5F5F5', marginBottom: '15px'}}>
               <h4 style={{margin: 0, fontSize: '0.8rem', color: '#999', letterSpacing: '1px', fontWeight: 900}}>DANH MỤC</h4>
            </div>
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  padding: '18px 25px',
                  border: 'none',
                  background: activeSection === section.id ? '#F0F7FF' : 'transparent',
                  color: activeSection === section.id ? 'var(--primary-blue)' : '#555',
                  borderRadius: '16px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  textAlign: 'left',
                  marginBottom: '8px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                className="about-nav-btn"
              >
                {activeSection === section.id && (
                  <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: '5px', background: 'var(--primary-blue)'}}></div>
                )}
                <span style={{opacity: activeSection === section.id ? 1 : 0.7}}>{section.icon}</span>
                {section.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <main style={{lineHeight: 1.8, color: '#444'}}>
          {/* 1. Lịch sử hình thành */}
          <section id="history" style={{marginBottom: '80px'}}>
            <div className="section-title" style={{textAlign: 'left', marginBottom: '30px'}}>
              <h2 style={{fontSize: '2rem'}}>Lịch sử hình thành</h2>
              <div className="divider" style={{margin: '0'}}></div>
            </div>
            <p>
              <strong>ANVI-SOS</strong> được thành lập vào năm 2021 trong bối cảnh nhu cầu về an toàn cá nhân và hỗ trợ khẩn cấp tăng cao. Ban đầu, dự án bắt nguồn từ một ý tưởng số hóa hồ sơ y tế cơ bản để hỗ trợ nhân viên cứu hộ khi tiếp cận bệnh nhân không tỉnh táo.
            </p>
            <p>
              Đến năm 2023, chúng tôi chính thức ra mắt phiên bản 2.0 với tính năng <strong>SOS Network</strong>, cho phép người dùng kết nối trực tiếp với mạng lưới người thân và các tình nguyện viên cứu hộ chuyên nghiệp. Sự ra đời của ANVI-SOS đã đánh dấu một bước ngoặt trong việc ứng dụng công nghệ số vào lĩnh vực an sinh xã hội tại Việt Nam.
            </p>
            <p>
              Năm 2026, ANVI-SOS vinh dự được bình chọn là "Nền tảng Cứu hộ Cộng đồng Xuất sắc nhất", bảo vệ cho hơn 1 triệu người dùng trên khắp cả nước.
            </p>
          </section>

          {/* 2. Tổng quan */}
          <section id="overview" style={{marginBottom: '80px'}}>
            <div className="section-title" style={{textAlign: 'left', marginBottom: '30px'}}>
              <h2 style={{fontSize: '2rem'}}>Tổng quan</h2>
              <div className="divider" style={{margin: '0'}}></div>
            </div>
            <p>
              ANVI-SOS là hệ thống mạng lưới cứu hộ thông minh hàng đầu, trực thuộc hệ sinh thái an toàn ANVI Group. Chúng tôi cung cấp giải pháp bảo vệ toàn diện thông qua sự kết hợp giữa thiết bị đeo (NFC), ứng dụng di động và cộng đồng cứu hộ thực địa.
            </p>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px'}}>
              <div style={{background: '#F0F7FF', padding: '30px', borderRadius: '24px', borderLeft: '5px solid var(--primary-blue)'}}>
                <h4 style={{fontSize: '1.1rem', marginBottom: '10px', color: 'var(--primary-blue)'}}>Nền tảng Công nghệ</h4>
                <p style={{fontSize: '0.9rem', margin: 0}}>Ứng dụng công nghệ GPS chính xác, WebSocket thời gian thực và mã hóa hồ sơ y tế đầu cuối.</p>
              </div>
              <div style={{background: '#F0F7FF', padding: '30px', borderRadius: '24px', borderLeft: '5px solid var(--primary-blue)'}}>
                <h4 style={{fontSize: '1.1rem', marginBottom: '10px', color: 'var(--primary-blue)'}}>Đội ngũ Chuyên gia</h4>
                <p style={{fontSize: '0.9rem', margin: 0}}>Hợp tác với hơn 500 bác sĩ và chuyên gia sơ cứu có chứng chỉ quốc tế.</p>
              </div>
            </div>
          </section>

          {/* 3. Tầm nhìn */}
          <section id="vision" style={{marginBottom: '80px'}}>
            <div className="section-title" style={{textAlign: 'left', marginBottom: '30px'}}>
              <h2 style={{fontSize: '2rem'}}>Tầm nhìn</h2>
              <div className="divider" style={{margin: '0'}}></div>
            </div>
            <p style={{fontSize: '1.1rem', fontStyle: 'italic', color: '#1A1A1A'}}>
              "Trở thành 'tấm khiên số' không thể thiếu của mọi gia đình Việt Nam và là mạng lưới cứu hộ xã hội hóa hàng đầu tại Đông Nam Á vào năm 2030."
            </p>
          </section>

          {/* 4. Sứ mệnh */}
          <section id="mission" style={{marginBottom: '80px'}}>
            <div className="section-title" style={{textAlign: 'left', marginBottom: '30px'}}>
              <h2 style={{fontSize: '2rem'}}>Sứ mệnh</h2>
              <div className="divider" style={{margin: '0'}}></div>
            </div>
            <p>
              Sứ mệnh của chúng tôi là tận dụng sức mạnh của công nghệ và tinh thần cộng đồng để đảm bảo <strong>"Không một ai bị bỏ lại phía sau trong giây phút sinh tử"</strong>. ANVI-SOS cam kết cung cấp các công cụ ứng cứu nhanh nhất, chính xác nhất và miễn phí cho cộng đồng.
            </p>
          </section>

          {/* 5. Giá trị cốt lõi */}
          <section id="core-values" style={{marginBottom: '80px'}}>
            <div className="section-title" style={{textAlign: 'left', marginBottom: '30px'}}>
              <h2 style={{fontSize: '2rem'}}>Giá trị cốt lõi</h2>
              <div className="divider" style={{margin: '0'}}></div>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px'}}>
              {[
                { title: 'TIN CẬY', desc: 'Thông tin y tế chính xác, bảo mật tuyệt đối.', icon: <ShieldCheck /> },
                { title: 'TỐC ĐỘ', desc: 'Phản ứng trong tích tắc, tiết kiệm từng giây vàng.', icon: <Zap /> },
                { title: 'CỘNG ĐỒNG', desc: 'Sức mạnh kết nối là yếu tố sống còn.', icon: <Heart /> }
              ].map((val, i) => (
                <div key={i} style={{textAlign: 'center', padding: '30px', background: 'white', borderRadius: '24px', border: '1px solid #EEE'}}>
                  <div style={{color: 'var(--primary-blue)', marginBottom: '15px', display: 'flex', justifyContent: 'center'}}>{val.icon}</div>
                  <h4 style={{fontSize: '1rem', fontWeight: 900, marginBottom: '10px'}}>{val.title}</h4>
                  <p style={{fontSize: '0.85rem', color: '#666', margin: 0}}>{val.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 6. Ban lãnh đạo */}
          <section id="leadership" style={{marginBottom: '80px'}}>
            <div className="section-title" style={{textAlign: 'left', marginBottom: '30px'}}>
              <h2 style={{fontSize: '2rem'}}>Ban lãnh đạo</h2>
              <div className="divider" style={{margin: '0'}}></div>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '30px'}}>
              {[
                { name: 'TS. Nguyễn An Bình', role: 'Giám đốc Điều hành (CEO)', spec: 'Thạc sĩ Khoa học Máy tính - Đại học Stanford' },
                { name: 'Bác sĩ CKII. Trần Việt Anh', role: 'Giám đốc Y tế (CMO)', spec: '20 năm kinh nghiệm Hồi sức cấp cứu' }
              ].map((leader, i) => (
                <div key={i} style={{display: 'flex', gap: '20px', alignItems: 'center', background: '#F9F9F9', padding: '25px', borderRadius: '24px'}}>
                  <div style={{width: '80px', height: '80px', background: 'var(--primary-blue)', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900}}>
                    {leader.name.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{fontSize: '1.1rem', margin: '0 0 5px 0'}}>{leader.name}</h4>
                    <div style={{fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-blue)'}}>{leader.role}</div>
                    <div style={{fontSize: '0.8rem', color: '#888', marginTop: '5px'}}>{leader.spec}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      <style>{`
        .about-nav-btn:hover {
          background: var(--secondary-blue) !important;
          color: var(--primary-blue) !important;
          transform: translateX(10px);
        }
        .about-page-medical p {
          margin-bottom: 20px;
          text-align: justify;
        }
      `}</style>
    </div>
  );
};
