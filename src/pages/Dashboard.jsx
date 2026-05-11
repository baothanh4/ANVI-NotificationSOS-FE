import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, BookOpen, Activity, Clock, Search, MapPin, 
  Phone, AlertCircle, ShieldCheck, LogOut, Facebook, 
  Youtube, Instagram, Mail, ChevronRight, ArrowRight
} from 'lucide-react';
import axiosClient from '../api/axiosClient';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [publicPosts, setPublicPosts] = useState([]);

  useEffect(() => {
    const fetchPublicPosts = async () => {
      try {
        const data = await axiosClient.get('/blog');
        setPublicPosts(data.slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch public posts', err);
      }
    };
    fetchPublicPosts();
  }, []);

  // --- LANDING PAGE FOR GUESTS / PUBLIC ---
  const renderLanding = () => (
    <div className="landing-page" style={{animation: 'fadeIn 0.8s ease-out'}}>
      {/* Hero Section */}
      <section className="hero-slider" style={{
        height: '600px',
        background: `linear-gradient(rgba(0,45,94,0.7), rgba(0,45,94,0.4)), url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2053')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        color: 'white',
        marginBottom: '60px'
      }}>
        <div className="medical-container">
          <div style={{maxWidth: '700px'}}>
            <div style={{display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.2)', padding: '8px 20px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 800, marginBottom: '30px', backdropFilter: 'blur(10px)'}}>
              <ShieldCheck size={18} /> HỆ THỐNG AN TOÀN SỐ 1 VIỆT NAM
            </div>
            <h2 style={{color: 'white', fontSize: '4rem', lineHeight: 1, fontWeight: 950, marginBottom: '24px', letterSpacing: '-0.03em'}}>
              VÌ SỨC KHỎE <br/> VÀ <span style={{color: '#5AC8FA'}}>AN TÂM</span> CỦA BẠN
            </h2>
            <p style={{fontSize: '1.25rem', opacity: 0.9, marginBottom: '40px', fontWeight: 500, lineHeight: 1.6}}>
              Kết nối cộng đồng cứu hộ, chuyên gia y tế và công nghệ định vị tiên tiến để bảo vệ bạn và người thân trong mọi tình huống khẩn cấp.
            </p>
            <div style={{display: 'flex', gap: '20px'}}>
              <button onClick={() => navigate('/sos')} className="btn-emergency" style={{padding: '20px 45px', fontSize: '1.2rem'}}>KÍCH HOẠT SOS NGAY</button>
              <button onClick={() => navigate('/auth')} className="btn-medical" style={{background: 'white', color: 'var(--primary-blue)', padding: '20px 45px'}}>ĐĂNG KÝ THÀNH VIÊN</button>
            </div>
          </div>
        </div>
      </section>

      <div className="medical-container" style={{display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '50px'}}>
        {/* Main Content Area */}
        <div>
          {/* Quick Services Grid */}
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '80px'}}>
            <div className="service-card-medical" onClick={() => navigate('/first-aid')}>
              <div className="icon-circle"><BookOpen size={32} /></div>
              <h3>Cẩm nang Sơ cứu</h3>
              <p>Hướng dẫn chi tiết cách xử lý các tình huống cấp cứu thường gặp chuẩn y khoa.</p>
              <div className="card-link">Xem chi tiết <ChevronRight size={16} /></div>
            </div>
            <div className="service-card-medical" onClick={() => navigate('/safe-journey')}>
              <div className="icon-circle"><Shield size={32} /></div>
              <h3>Hành trình An toàn</h3>
              <p>Giám sát vị trí thời gian thực và tự động gửi cảnh báo khi hành trình bất thường.</p>
              <div className="card-link">Xem chi tiết <ChevronRight size={16} /></div>
            </div>
            <div className="service-card-medical" onClick={() => navigate('/sos')}>
              <div className="icon-circle" style={{background: '#FFF1F0', color: '#FF3B30'}}><Activity size={32} /></div>
              <h3>Mạng lưới Cứu hộ</h3>
              <p>Hệ thống kết nối tình nguyện viên và chuyên gia cứu hộ xung quanh bạn.</p>
              <div className="card-link">Xem chi tiết <ChevronRight size={16} /></div>
            </div>
          </div>

          {/* Featured News Section */}
          <div className="section-title" style={{textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
            <div>
              <h2 style={{fontSize: '2rem', marginBottom: '10px'}}>TIN TỨC & HOẠT ĐỘNG Y TẾ</h2>
              <div className="divider" style={{margin: '0'}}></div>
            </div>
            <Link to="/blog" style={{color: 'var(--primary-blue)', fontWeight: 800, fontSize: '0.9rem', textDecoration: 'none'}}>XEM TẤT CẢ <ArrowRight size={18} /></Link>
          </div>

          <div style={{display: 'grid', gap: '32px', marginTop: '40px'}}>
            {publicPosts.length > 0 ? publicPosts.map(post => (
              <Link to={`/blog/${post.id}`} key={post.id} style={{textDecoration: 'none', color: 'inherit'}}>
                <div className="news-item-medical">
                  <div className="news-thumb">
                    <img src={post.thumbnailUrl || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=400'} alt="news" />
                  </div>
                  <div className="news-content">
                    <span className="news-tag">{post.category || 'Y HỌC'}</span>
                    <h3>{post.title}</h3>
                    <p>{post.excerpt}</p>
                    <div className="news-footer">
                      <span style={{fontWeight: 700}}>Chi tiết bài viết</span>
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              </Link>
            )) : (
               <div style={{padding: '40px', textAlign: 'center', background: 'white', borderRadius: '24px', color: '#999'}}>Đang tải tin tức mới nhất...</div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <aside>
          {/* Emergency Box */}
          <div style={{background: '#FF3B30', color: 'white', padding: '30px', borderRadius: '24px', marginBottom: '30px', boxShadow: '0 15px 30px rgba(255,59,48,0.2)'}}>
            <h3 style={{color: 'white', fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px'}}><AlertCircle size={24} /> CẤP CỨU</h3>
            <div style={{fontSize: '1.6rem', fontWeight: 900, marginBottom: '5px'}}>(028) 3896 6894</div>
            <div style={{fontSize: '0.9rem', opacity: 0.8, fontWeight: 500}}>Trực cấp cứu 24/24</div>
          </div>

          {/* Hotline Box */}
          <div style={{background: 'var(--primary-blue)', color: 'white', padding: '30px', borderRadius: '24px', marginBottom: '30px'}}>
            <h3 style={{color: 'white', fontSize: '1.1rem', marginBottom: '15px'}}>TỔNG ĐÀI CSKH</h3>
            <div style={{fontSize: '1.8rem', fontWeight: 900, marginBottom: '10px'}}>1900 066 883</div>
            <p style={{fontSize: '0.85rem', opacity: 0.8}}>Giải đáp thắc mắc và hỗ trợ đăng ký dịch vụ.</p>
          </div>

          {/* Working Hours */}
          <div style={{background: 'white', padding: '30px', borderRadius: '24px', border: '1px solid #EEE', marginBottom: '30px'}}>
            <h3 style={{fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px'}}><Clock size={20} color="var(--primary-blue)" /> GIỜ LÀM VIỆC</h3>
            <div style={{fontSize: '0.9rem', marginBottom: '15px', display: 'flex', justifyContent: 'space-between'}}>
              <span style={{fontWeight: 700, color: '#333'}}>Thứ 2 - Thứ 6:</span>
              <span style={{color: '#666'}}>07h - 17h</span>
            </div>
            <div style={{fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between'}}>
              <span style={{fontWeight: 700, color: '#333'}}>Thứ 7 & CN:</span>
              <span style={{color: '#666'}}>08h - 12h</span>
            </div>
            <div style={{marginTop: '25px', padding: '15px', background: '#F0F7FF', borderRadius: '12px', color: 'var(--primary-blue)', fontSize: '0.8rem', fontWeight: 800, textAlign: 'center'}}>
              Hệ thống SOS hoạt động 24/24
            </div>
          </div>

          {/* Quick Buttons */}
          <div style={{display: 'grid', gap: '12px'}}>
            <button className="btn-medical" style={{width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 24px'}}><Search size={20} /> TÌM BÁC SĨ / CỨU HỘ</button>
            <button className="btn-medical" style={{width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 24px', background: 'white', color: 'var(--primary-blue)', border: '2px solid var(--primary-blue)'}}><MapPin size={20} /> ĐIỂM SƠ CỨU GẦN NHẤT</button>
          </div>
        </aside>
      </div>

      {/* Stats Counter Section */}
      <section style={{background: 'white', padding: '100px 0', marginTop: '100px', borderTop: '1px solid #EEE'}}>
        <div className="medical-container">
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px', textAlign: 'center'}}>
            {[
              { label: 'Năm Hình Thành', value: '05+' },
              { label: 'Người Dùng Bảo Vệ', value: '1M+' },
              { label: 'Ca Ứng Cứu Thành Công', value: '25,000+' },
              { label: 'Tình Nguyện Viên', value: '5,000+' }
            ].map((stat, i) => (
              <div key={i}>
                <div style={{fontSize: '3.5rem', fontWeight: 950, color: 'var(--primary-blue)', marginBottom: '8px', letterSpacing: '-0.05em'}}>{stat.value}</div>
                <div style={{fontSize: '1rem', fontWeight: 800, color: '#666', textTransform: 'uppercase', letterSpacing: '1px'}}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .service-card-medical {
          background: white;
          padding: 40px 32px;
          border-radius: 32px;
          border: 1px solid #EEE;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        .service-card-medical:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 60px rgba(0,85,179,0.1);
          border-color: var(--primary-blue);
        }
        .icon-circle {
          width: 72px;
          height: 72px;
          background: var(--secondary-blue);
          color: var(--primary-blue);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 28px;
        }
        .service-card-medical h3 { font-size: 1.3rem; margin-bottom: 15px; color: #002D5E; }
        .service-card-medical p { font-size: 0.95rem; color: #666; line-height: 1.6; margin-bottom: 24px; }
        .card-link { font-size: 0.85rem; font-weight: 800; color: var(--primary-blue); display: flex; align-items: center; gap: 5px; opacity: 0; transform: translateX(-10px); transition: all 0.3s; }
        .service-card-medical:hover .card-link { opacity: 1; transform: translateX(0); }

        .news-item-medical { display: flex; gap: 30px; background: white; padding: 24px; border-radius: 28px; transition: all 0.3s; border: 1px solid transparent; }
        .news-item-medical:hover { border-color: #EEE; box-shadow: var(--shadow-md); transform: scale(1.01); }
        .news-thumb { width: 280px; height: 180px; border-radius: 20px; overflow: hidden; flex-shrink: 0; }
        .news-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .news-content { flex: 1; display: flex; flex-direction: column; }
        .news-tag { font-size: 0.7rem; font-weight: 900; color: var(--primary-blue); background: var(--secondary-blue); padding: 4px 12px; border-radius: 6px; align-self: flex-start; margin-bottom: 12px; }
        .news-content h3 { font-size: 1.4rem; margin: 0 0 12px 0; color: #1A1A1A; line-height: 1.4; }
        .news-content p { font-size: 0.95rem; color: #666; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .news-footer { margin-top: auto; display: flex; align-items: center; justify-content: space-between; padding-top: 20px; color: var(--primary-blue); font-size: 0.9rem; }
      `}</style>
    </div>
  );

  // --- COMMAND CENTER FOR CUSTOMERS ---
  const renderDashboard = () => (
    <div className="customer-dashboard" style={{padding: '40px 0'}}>
      <div className="medical-container">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px'}}>
          <div>
            <h2 style={{fontSize: '2.2rem', fontWeight: 950, letterSpacing: '-0.04em'}}>TRUNG TÂM ĐIỀU KHIỂN</h2>
            <p style={{color: '#666', fontWeight: 600}}>Chào mừng trở lại, {user.fullName}. Hệ thống đang bảo vệ bạn.</p>
          </div>
          <div style={{display: 'flex', gap: '15px'}}>
            <div style={{background: 'white', padding: '12px 24px', borderRadius: '14px', border: '1px solid #EEE', display: 'flex', alignItems: 'center', gap: '10px'}}>
               <div style={{width: '10px', height: '10px', borderRadius: '50%', background: '#34C759', boxShadow: '0 0 10px #34C759'}}></div>
               <span style={{fontSize: '0.85rem', fontWeight: 800, color: '#1A1A1A'}}>SYSTEM ONLINE</span>
            </div>
            <button onClick={() => navigate('/sos')} className="btn-emergency">KÍCH HOẠT SOS</button>
          </div>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px'}}>
          <div className="dashboard-card" style={{background: 'linear-gradient(135deg, #0055B3, #002D5E)', color: 'white', padding: '40px'}}>
            <h3 style={{color: 'white', fontSize: '1.5rem', marginBottom: '20px'}}>TRẠNG THÁI KHẨN CẤP</h3>
            <p style={{opacity: 0.8, marginBottom: '30px'}}>Kích hoạt tín hiệu SOS sẽ ngay lập tức thông báo cho người thân và lực lượng cứu hộ gần nhất kèm vị trí GPS của bạn.</p>
            <button onClick={() => navigate('/sos')} style={{background: 'white', color: '#0055B3', border: 'none', padding: '15px 30px', borderRadius: '12px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px'}}>
              MỞ TRẠM PHÁT TÍN HIỆU <ArrowRight size={20} />
            </button>
          </div>

          <div className="dashboard-card" style={{background: 'white', padding: '30px', border: '1px solid #EEE'}}>
            <h3 style={{fontSize: '1.2rem', marginBottom: '25px'}}>THÔNG TIN SỨC KHỎE</h3>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
              <div className="health-stat">
                <span className="stat-label">NHÓM MÁU</span>
                <span className="stat-value">{user.bloodType || 'N/A'}</span>
              </div>
              <div className="health-stat">
                <span className="stat-label">LIÊN HỆ KHẨN CẤP</span>
                <span className="stat-value">ĐÃ THIẾT LẬP</span>
              </div>
            </div>
            <button onClick={() => navigate('/profile')} style={{marginTop: '25px', width: '100%', background: 'var(--secondary-blue)', color: 'var(--primary-blue)', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer'}}>CHỈNH SỬA HỒ SƠ</button>
          </div>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '30px'}}>
          {[
            { label: 'Sơ cấp cứu', icon: <BookOpen />, path: '/first-aid' },
            { label: 'Hành trình', icon: <Clock />, path: '/safe-journey' },
            { label: 'Mã QR Cứu hộ', icon: <ShieldCheck />, path: '/profile' },
            { label: 'Cộng đồng', icon: <Activity />, path: '/blog' }
          ].map((tool, i) => (
            <div key={i} className="tool-card-medical" onClick={() => navigate(tool.path)}>
              <div className="tool-icon">{tool.icon}</div>
              <span>{tool.label}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .dashboard-card { border-radius: 28px; box-shadow: var(--shadow-sm); }
        .health-stat { background: #F8F9FA; padding: 15px; border-radius: 12px; display: flex; flex-direction: column; }
        .stat-label { font-size: 0.7rem; font-weight: 800; color: #8E8E93; margin-bottom: 5px; }
        .stat-value { font-size: 1.2rem; font-weight: 900; color: var(--primary-blue); }
        .tool-card-medical { background: white; padding: 25px; border-radius: 20px; border: 1px solid #EEE; text-align: center; cursor: pointer; transition: all 0.2s; }
        .tool-card-medical:hover { border-color: var(--primary-blue); transform: translateY(-5px); box-shadow: var(--shadow-md); }
        .tool-icon { color: var(--primary-blue); margin-bottom: 12px; display: flex; justify-content: center; }
        .tool-card-medical span { font-weight: 800; font-size: 0.9rem; color: #333; }
      `}</style>
    </div>
  );

  return user ? renderDashboard() : renderLanding();
};
