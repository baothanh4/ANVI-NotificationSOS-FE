import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { 
  Facebook, Instagram, Linkedin, Twitter, Globe, 
  User, ShieldAlert, ExternalLink, Share2, Info
} from 'lucide-react';

export const PublicProfilePage = () => {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosClient.get(`/social/public/${shortCode}`);
        setData(res);
      } catch (err) {
        setError('Không thể tìm thấy hồ sơ này hoặc đã có lỗi xảy ra.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [shortCode]);

  const getIcon = (platform) => {
    switch (platform) {
      case 'facebook': return <Facebook size={24} />;
      case 'instagram': return <Instagram size={24} />;
      case 'linkedin': return <Linkedin size={24} />;
      case 'twitter': return <Twitter size={24} />;
      default: return <Globe size={24} />;
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'facebook': return '#1877F2';
      case 'instagram': return 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)';
      case 'linkedin': return '#0077b5';
      case 'twitter': return '#1DA1F2';
      default: return 'var(--accent-blue)';
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Đang tải hồ sơ cá nhân...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
        <ShieldAlert size={64} color="#ef4444" />
        <h2>Ối! Lỗi rồi</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>Quay về Trang chủ</button>
      </div>
    );
  }

  return (
    <div className="public-profile-container">
      <div className="profile-card-glow"></div>
      <div className="profile-content">
        {/* Avatar Section */}
        <div className="avatar-section">
          <div className="avatar-ring">
            <div className="avatar-inner">
              {data.fullName ? data.fullName.charAt(0).toUpperCase() : <User size={48} />}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="info-section">
          <h1 className="user-name">{data.fullName}</h1>
          {data.dateOfBirth && (
            <div className="user-dob">
              Ngày sinh: {new Date(data.dateOfBirth).toLocaleDateString('vi-VN')}
            </div>
          )}
          <div className="user-badge">XÁC MINH DANH TÍNH</div>
          
          <div className="bio-box">
            <Info size={16} className="bio-icon" />
            <p className="user-bio">
              {data.bio || 'Xin chào! Tôi đang sử dụng ANVI-SOS để bảo vệ bản thân và kết nối với mọi người.'}
            </p>
          </div>
        </div>

        {/* Social Links */}
        <div className="social-section">
          <h3>KẾT NỐI VỚI TÔI</h3>
          <div className="social-grid">
            {data.socialLinks.map((link) => (
              <a 
                key={link.id} 
                href={link.url} 
                target="_blank" 
                rel="noreferrer" 
                className="social-item"
                style={{ '--hover-color': link.platform === 'instagram' ? '#dc2743' : getPlatformColor(link.platform) }}
              >
                <div className="icon-box" style={{ background: getPlatformColor(link.platform) }}>
                  {getIcon(link.platform)}
                </div>
                <span className="platform-label">{link.platform.toUpperCase()}</span>
                <ExternalLink size={14} className="ext-icon" />
              </a>
            ))}
            {data.socialLinks.length === 0 && (
              <p className="no-links">Người dùng chưa cập nhật liên kết mạng xã hội.</p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="footer-actions">
          <button className="emergency-btn" onClick={() => navigate(`/public-info/${shortCode}`)}>
            <ShieldAlert size={20} /> XEM HỒ SƠ KHẨN CẤP
          </button>
          <div className="branding">
            <Share2 size={14} /> Powered by <strong>ANVI-SOS</strong>
          </div>
        </div>
      </div>

      <style>{`
        .public-profile-container {
          min-height: 100vh;
          background: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
          color: white;
        }

        .profile-card-glow {
          position: absolute;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
          filter: blur(40px);
          top: 20%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1;
        }

        .profile-content {
          width: 100%;
          max-width: 450px;
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 32px;
          padding: 40px;
          position: relative;
          z-index: 2;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          text-align: center;
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        /* Avatar */
        .avatar-section {
          margin-bottom: 24px;
          display: flex;
          justify-content: center;
        }

        .avatar-ring {
          padding: 6px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 50%;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
        }

        .avatar-inner {
          width: 96px;
          height: 96px;
          background: #1e293b;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          font-weight: 900;
          color: white;
          border: 4px solid #1e293b;
        }

        /* Info */
        .user-name {
          font-size: 2rem;
          font-weight: 900;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .user-dob {
          color: #94a3b8;
          font-size: 0.9rem;
          font-weight: 600;
          margin-top: 4px;
        }

        .user-badge {
          display: inline-block;
          margin-top: 8px;
          padding: 4px 12px;
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          font-size: 0.7rem;
          font-weight: 900;
          border-radius: 20px;
          border: 1px solid rgba(16, 185, 129, 0.2);
          letter-spacing: 0.05em;
        }

        .bio-box {
          margin-top: 24px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          position: relative;
        }

        .bio-icon {
          position: absolute;
          top: -10px;
          left: 20px;
          background: #3b82f6;
          padding: 4px;
          border-radius: 6px;
        }

        .user-bio {
          font-size: 0.95rem;
          line-height: 1.6;
          color: #94a3b8;
          margin: 0;
        }

        /* Social */
        .social-section {
          margin-top: 40px;
          text-align: left;
        }

        .social-section h3 {
          font-size: 0.75rem;
          font-weight: 900;
          color: #64748b;
          letter-spacing: 0.1em;
          margin-bottom: 16px;
          padding-left: 8px;
        }

        .social-grid {
          display: grid;
          gap: 12px;
        }

        .social-item {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.05);
          padding: 12px 16px;
          border-radius: 16px;
          text-decoration: none;
          color: white;
          transition: all 0.3s;
          border: 1px solid transparent;
        }

        .social-item:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateX(8px);
          border-color: var(--hover-color);
        }

        .icon-box {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
        }

        .platform-label {
          font-weight: 700;
          font-size: 0.9rem;
          flex: 1;
        }

        .ext-icon {
          color: #64748b;
          opacity: 0.5;
        }

        .no-links {
          text-align: center;
          color: #64748b;
          font-style: italic;
          font-size: 0.9rem;
        }

        /* Footer */
        .footer-actions {
          margin-top: 40px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 24px;
        }

        .emergency-btn {
          width: 100%;
          background: #ef4444;
          color: white;
          border: none;
          padding: 16px;
          border-radius: 16px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 10px 20px rgba(239, 68, 68, 0.2);
        }

        .emergency-btn:hover {
          background: #dc2626;
          transform: scale(1.02);
          box-shadow: 0 15px 30px rgba(239, 68, 68, 0.3);
        }

        .branding {
          margin-top: 20px;
          font-size: 0.75rem;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .branding strong {
          color: #3b82f6;
        }

        /* States */
        .profile-loading, .profile-error {
          min-height: 100vh;
          background: #0f172a;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          padding: 20px;
          text-align: center;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(59, 130, 246, 0.1);
          border-left-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .profile-error h2 { margin: 20px 0 10px; }
        .profile-error p { color: #94a3b8; margin-bottom: 30px; }
        .profile-error button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};
