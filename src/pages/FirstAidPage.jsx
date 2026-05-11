import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, Activity, Flame, Droplets, Bone, AlertCircle, 
  ChevronRight, ArrowLeft 
} from 'lucide-react';

export const FirstAidPage = () => {
  const navigate = useNavigate();

  const firstAidCategories = [
    {
      title: 'HỒI SỨC TIM PHỔI (CPR)',
      icon: <Heart size={32} />,
      path: '/first-aid/cpr'
    },
    {
      title: 'SƠ CỨU HÓC DỊ VẬT',
      icon: <Activity size={32} />,
      path: '/first-aid/choking'
    },
    {
      title: 'SƠ CỨU VẾT BỎNG',
      icon: <Flame size={32} />,
      path: '/first-aid/burns'
    },
    {
      title: 'CẦM MÁU VẾT THƯƠNG',
      icon: <Droplets size={32} />,
      path: '/first-aid/bleeding'
    },
    {
      title: 'CHẤN THƯƠNG XƯƠNG KHỚP',
      icon: <Bone size={32} />,
      path: '/first-aid/fractures'
    },
    {
      title: 'XỬ LÝ SAY NẮNG & ĐỘT QUỴ',
      icon: <AlertCircle size={32} />,
      path: '/first-aid/heatstroke'
    }
  ];

  return (
    <div className="first-aid-page" style={{animation: 'fadeIn 0.8s ease-out', paddingBottom: '100px', background: '#F8F9FA', minHeight: '100vh'}}>
      {/* Page Header Banner */}
      <div style={{background: 'var(--primary-blue)', color: 'white', padding: '60px 0', marginBottom: '40px'}}>
        <div className="medical-container">
          <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px'}}>
            <button onClick={() => navigate(-1)} style={{background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '10px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
              <ArrowLeft size={20} />
            </button>
            <span style={{fontSize: '0.9rem', fontWeight: 700, opacity: 0.8}}>QUAY LẠI</span>
          </div>
          <h1 style={{fontSize: '2.5rem', fontWeight: 950, color: 'white', letterSpacing: '-0.04em'}}>CẨM NANG SƠ CẤP CỨU</h1>
          <p style={{fontSize: '1.1rem', opacity: 0.9, maxWidth: '700px'}}>Hướng dẫn chi tiết các bước xử lý khẩn cấp chuẩn y khoa để bảo vệ tính mạng trong những giây phút vàng.</p>
        </div>
      </div>

      <div className="medical-container">
        {/* Decorative Section Header */}
        <div style={{textAlign: 'center', marginBottom: '50px'}}>
           <h2 style={{fontSize: '2rem', fontWeight: 950, color: 'var(--primary-blue)', textTransform: 'uppercase', marginBottom: '15px'}}>CHUYÊN MỤC SƠ CỨU</h2>
           <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px'}}>
             <div style={{height: '1px', width: '80px', background: '#CCC'}}></div>
             <div style={{color: 'var(--primary-blue)', transform: 'rotate(45deg)'}}>
                <div style={{width: '10px', height: '10px', border: '2px solid currentColor'}}></div>
             </div>
             <div style={{height: '1px', width: '80px', background: '#CCC'}}></div>
           </div>
        </div>

        {/* Card List Area */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '30px', marginTop: '20px'}}>
          {firstAidCategories.map((category, index) => (
            <div 
              key={index} 
              className="first-aid-horizontal-card"
              onClick={() => navigate(category.path)}
            >
              <div className="card-icon-box">
                {category.icon}
              </div>
              <div className="card-content-box">
                <h3>{category.title}</h3>
                <div className="card-action">
                  <span>Xem thêm</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .first-aid-horizontal-card {
          background: white;
          border-radius: 16px;
          display: flex;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid transparent;
        }
        
        .first-aid-horizontal-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,85,179,0.1);
          border-color: #D0E1F9;
        }

        .card-icon-box {
          width: 120px;
          height: 120px;
          background: linear-gradient(135deg, #3498db, #2980b9);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s;
        }

        .first-aid-horizontal-card:hover .card-icon-box {
          background: linear-gradient(135deg, #2980b9, #1c5980);
        }

        .card-content-box {
          padding: 0 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex-grow: 1;
        }

        .card-content-box h3 {
          margin: 0 0 10px 0;
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--primary-blue);
          letter-spacing: -0.02em;
        }

        .card-action {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #666;
          font-size: 0.9rem;
          font-weight: 700;
          opacity: 0.7;
          transition: all 0.3s;
        }

        .first-aid-horizontal-card:hover .card-action {
          color: var(--primary-blue);
          opacity: 1;
          transform: translateX(5px);
        }

        @media (max-width: 600px) {
          .card-icon-box { width: 80px; height: 80px; }
          .card-icon-box svg { width: 24px; height: 24px; }
          .card-content-box { padding: 0 20px; }
          .card-content-box h3 { font-size: 1rem; }
        }
      `}</style>
    </div>
  );
};
