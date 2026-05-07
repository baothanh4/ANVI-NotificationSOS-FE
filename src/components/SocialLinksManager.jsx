import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Facebook, Instagram, Linkedin, Twitter, Globe, 
  Plus, Trash2, Eye, EyeOff, Link as LinkIcon, ExternalLink, Share2, AlertCircle
} from 'lucide-react';

export const SocialLinksManager = () => {
  const { user } = useAuth();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newLink, setNewLink] = useState({ platform: 'facebook', url: '', visible: true });
  const [saving, setSaving] = useState(false);

  const fetchLinks = useCallback(async () => {
    try {
      const res = await fetch(`/api/social/my?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setLinks(data);
      }
    } catch (e) {
      console.error("Error fetching social links:", e);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newLink.url) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/social?userId=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLink)
      });
      if (res.ok) {
        await fetchLinks();
        setNewLink({ platform: 'facebook', url: '', visible: true });
      }
    } catch (e) {
      alert("Lỗi khi thêm liên kết");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await fetch(`/api/social/${id}/toggle`, { method: 'PATCH' });
      if (res.ok) {
        setLinks(links.map(link => 
          link.id === id ? { ...link, visible: !link.visible } : link
        ));
      }
    } catch (e) {
      console.error("Error toggling visibility:", e);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa liên kết này?")) return;
    try {
      const res = await fetch(`/api/social/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLinks(links.filter(l => l.id !== id));
      }
    } catch (e) {
      console.error("Error deleting social link:", e);
    }
  };

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

  return (
    <div className="social-manager-container">
      <div className="section-header">
        <div className="title-group">
          <Share2 className="title-icon" size={28} />
          <div>
            <h3>KẾT NỐI MẠNG XÃ HỘI</h3>
            <p>Liên kết này giúp xác minh danh tính và hỗ trợ liên lạc khẩn cấp.</p>
          </div>
        </div>
      </div>

      <div className="manager-layout">
        {/* Form bên trái */}
        <div className="form-column">
          <div className="glass-card add-card">
            <h4>THÊM LIÊN KẾT MỚI</h4>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label>NỀN TẢNG</label>
                <div className="select-wrapper">
                  <select 
                    value={newLink.platform}
                    onChange={(e) => setNewLink({...newLink, platform: e.target.value})}
                  >
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="twitter">Twitter</option>
                    <option value="other">Trang web khác</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>ĐƯỜNG DẪN (URL)</label>
                <div className="input-with-icon">
                  <LinkIcon size={18} className="field-icon" />
                  <input 
                    placeholder="https://facebook.com/username"
                    value={newLink.url}
                    onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                  />
                </div>
              </div>
              <div className="visibility-info">
                <AlertCircle size={16} />
                <span>Liên kết sẽ được hiển thị khi bạn bật "Công khai".</span>
              </div>
              <button type="submit" className="submit-btn" disabled={saving || !newLink.url}>
                {saving ? 'ĐANG LƯU...' : (
                  <>
                    <Plus size={20} /> XÁC NHẬN THÊM
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Danh sách bên phải */}
        <div className="list-column">
          {loading ? (
            <div className="loading-state">ĐANG TẢI DỮ LIỆU...</div>
          ) : links.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-box"><Share2 size={40} /></div>
              <p>Chưa có liên kết nào. Hãy thêm mạng xã hội để tăng độ tin cậy cho hồ sơ của bạn.</p>
            </div>
          ) : (
            <div className="links-grid">
              {links.map(link => (
                <div key={link.id} className={`link-card ${!link.visible ? 'is-private' : ''}`}>
                  <div className="link-header">
                    <div className="platform-icon" style={{ background: getPlatformColor(link.platform) }}>
                      {getIcon(link.platform)}
                    </div>
                    <div className="platform-info">
                      <span className="platform-name">{link.platform.toUpperCase()}</span>
                      <a href={link.url} target="_blank" rel="noreferrer" className="url-text">
                        {link.url} <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                  
                  <div className="link-actions">
                    <div className="toggle-group" onClick={() => handleToggle(link.id)}>
                      <div className={`custom-toggle ${link.visible ? 'active' : ''}`}>
                        <div className="toggle-thumb"></div>
                      </div>
                      <span className="toggle-label">{link.visible ? 'CÔNG KHAI' : 'RIÊNG TƯ'}</span>
                    </div>
                    <button className="delete-btn" onClick={() => handleDelete(link.id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .social-manager-container { padding: 20px 0; }
        .section-header { margin-bottom: 40px; }
        .title-group { display: flex; gap: 20px; align-items: center; }
        .title-icon { color: var(--accent-blue); padding: 12px; background: #F0F7FF; border-radius: 16px; }
        .title-group h3 { margin: 0; font-size: 1.6rem; font-weight: 900; color: #1A1A1A; letter-spacing: -0.02em; }
        .title-group p { margin: 4px 0 0; color: #666; font-weight: 500; }

        .manager-layout { display: grid; grid-template-columns: 350px 1fr; gap: 40px; }

        /* Form Card */
        .add-card { padding: 32px !important; border: 1px solid #E5E5E5 !important; position: sticky; top: 40px; }
        .add-card h4 { margin: 0 0 24px; font-size: 1rem; font-weight: 900; color: #1A1A1A; }
        
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; font-size: 0.7rem; font-weight: 900; color: #8E8E93; margin-bottom: 8px; letter-spacing: 0.05em; }
        
        .select-wrapper select, .input-with-icon input {
          width: 100%; padding: 14px 16px; border-radius: 12px; border: 2px solid #F2F2F7;
          background: #F8F9FA; font-weight: 700; font-size: 0.95rem; color: #1C1C1E;
          transition: all 0.2s;
        }
        .select-wrapper select:focus, .input-with-icon input:focus { border-color: var(--accent-blue); background: white; outline: none; }
        
        .input-with-icon { position: relative; }
        .field-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #AEAEB2; }
        .input-with-icon input { padding-left: 48px; }

        .visibility-info { display: flex; gap: 8px; color: #FF9500; background: #FFF9F0; padding: 12px; border-radius: 8px; margin-bottom: 24px; font-size: 0.75rem; font-weight: 600; line-height: 1.4; }
        
        .submit-btn { 
          width: 100%; background: var(--accent-blue); color: white; border: none; 
          padding: 18px; border-radius: 14px; font-weight: 900; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: all 0.3s;
        }
        .submit-btn:hover:not(:disabled) { transform: scale(1.02); box-shadow: 0 10px 20px rgba(0, 122, 255, 0.2); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Links List */
        .links-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
        .link-card { 
          background: white; border: 2px solid #F2F2F7; border-radius: 20px; padding: 24px;
          display: flex; justify-content: space-between; align-items: center;
          transition: all 0.3s;
        }
        .link-card:hover { border-color: #E5E5EA; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .link-card.is-private { opacity: 0.7; background: #FAFAFA; }

        .link-header { display: flex; gap: 20px; align-items: center; flex: 1; min-width: 0; }
        .platform-icon { 
          width: 52px; height: 52px; border-radius: 14px; display: flex; 
          align-items: center; justify-content: center; color: white; flex-shrink: 0;
        }
        .platform-info { min-width: 0; }
        .platform-name { display: block; font-size: 0.7rem; font-weight: 900; color: #8E8E93; margin-bottom: 4px; }
        .url-text { 
          display: flex; align-items: center; gap: 6px; font-weight: 700; color: #1C1C1E; 
          text-decoration: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .url-text:hover { color: var(--accent-blue); }

        .link-actions { display: flex; align-items: center; gap: 24px; }
        
        /* Custom Toggle Switch */
        .toggle-group { display: flex; align-items: center; gap: 10px; cursor: pointer; }
        .custom-toggle { 
          width: 48px; height: 26px; background: #E5E5EA; border-radius: 20px; 
          padding: 3px; position: relative; transition: all 0.3s;
        }
        .custom-toggle.active { background: #34C759; }
        .toggle-thumb { 
          width: 20px; height: 20px; background: white; border-radius: 50%; 
          transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          transform: translateX(0); box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .custom-toggle.active .toggle-thumb { transform: translateX(22px); }
        .toggle-label { font-size: 0.75rem; font-weight: 800; color: #1C1C1E; width: 80px; }

        .delete-btn { 
          background: #FFF1F0; color: #FF3B30; border: none; padding: 10px; 
          border-radius: 10px; cursor: pointer; transition: all 0.2s;
        }
        .delete-btn:hover { background: #FF3B30; color: white; transform: rotate(10deg); }

        .loading-state, .empty-state { text-align: center; padding: 60px; color: #8E8E93; font-weight: 600; }
        .empty-icon-box { margin-bottom: 20px; color: #E5E5EA; display: flex; justify-content: center; }
        .empty-state p { max-width: 300px; margin: 0 auto; line-height: 1.5; font-size: 0.9rem; }
      `}</style>
    </div>
  );
};
