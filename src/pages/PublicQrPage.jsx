import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { AlertTriangle, PhoneCall, Heart, ShieldAlert, User, Share2, Globe, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

export const PublicQrPage = () => {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  
  // SOS State
  const [sosLoading, setSosLoading] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [sosPayloadTemp, setSosPayloadTemp] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const resolveRes = await axiosClient.get(`/qr/resolve/${shortCode}`);
        if (!resolveRes.active) {
          setError('Mã QR này hiện đang bị vô hiệu hóa.');
          return;
        }
        
        const userId = resolveRes.userId;
        const [healthRes, contactsRes, socialRes, userRes] = await Promise.all([
          axiosClient.get(`/health/users/${userId}`),
          axiosClient.get(`/contacts/users/${userId}`),
          axiosClient.get(`/social/my?userId=${userId}`),
          axiosClient.get(`/users/public-info/${userId}`) // I'll need to create this endpoint or use a similar one
        ]);
        
        setData({ 
          userId, 
          cardId: resolveRes.cardId, 
          health: healthRes, 
          contacts: contactsRes 
        });
        setSocialLinks(socialRes.filter(l => l.visible));
        setUserProfile(userRes);
      } catch (err) {
        setError('Không thể tải thông tin y tế khẩn cấp.');
      }
    };
    fetchInfo();
  }, [shortCode]);

  const triggerSosApi = async (payload) => {
    try {
      if (!payload.userId || !payload.cardId) {
        console.error("Missing userId or cardId in payload:", payload);
      }
      await axiosClient.post('/sos/trigger', payload);
      setSosSent(true);
      setShowManualInput(false);
    } catch (err) {
      alert('Không thể gửi cảnh báo SOS: ' + err.message);
    } finally {
      setSosLoading(false);
    }
  };

  const handleSosClick = async () => {
    if (!data) return;
    setSosLoading(true);
    
    let payload = {
      userId: data.userId,
      cardId: data.cardId,
      gpsLat: null,
      gpsLng: null,
      locationText: null,
      ipLocation: null,
      manualAddress: null
    };

    // Layer 1: Browser Geolocation (GPS chinh xac cao)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          payload.gpsLat = position.coords.latitude;
          payload.gpsLng = position.coords.longitude;
          if (position.coords.accuracy) {
            payload.locationText = `Do chinh xac GPS: ~${Math.round(position.coords.accuracy)}m`;
          }
          triggerSosApi(payload);
        },
        async (err) => {
          console.warn("Geolocation failed, falling back to Layer 2", err);
          await handleIpFallback(payload);
        },
        {
          enableHighAccuracy: true, // Bat GPS chinh xac cao (khong dung WiFi/cell)
          timeout: 15000,           // Cho toi 15s de GPS lock
          maximumAge: 0,            // Khong dung cache, lay vi tri moi nhat
        }
      );
    } else {
      await handleIpFallback(payload);
    }
  };

  const handleIpFallback = async (payload) => {
    // Layer 2: IP Geolocation
    try {
      const ipRes = await fetch('https://ipapi.co/json/');
      const ipData = await ipRes.json();
      if (ipData && ipData.city) {
        payload.ipLocation = `${ipData.city}, ${ipData.region}, ${ipData.country_name}`;
        triggerSosApi(payload);
        return;
      }
    } catch (e) {
      console.error('IP fallback failed', e);
    }
    
    // Layer 3: Manual Address
    setSosPayloadTemp(payload);
    setSosLoading(false);
    setShowManualInput(true);
  };

  const submitManualAddress = () => {
    if (!manualAddress.trim()) {
      alert('Vui lòng nhập địa chỉ hiện tại!');
      return;
    }
    setSosLoading(true);
    const finalPayload = { ...sosPayloadTemp, manualAddress };
    triggerSosApi(finalPayload);
  };

  if (error) {
    return (
      <div className="container" style={{paddingTop: '60px', textAlign: 'center'}}>
        <AlertTriangle size={48} color="#ef4444" style={{margin: '0 auto'}} />
        <h2 className="mt-4">{error}</h2>
      </div>
    );
  }

  if (!data) return <div className="text-center mt-8">Đang tải hồ sơ khẩn cấp...</div>;

  return (
    <div className="container" style={{maxWidth: '600px', paddingTop: '40px', paddingBottom: '40px'}}>
      
      {/* SOS TRIGGER SECTION */}
      <div className="text-center mb-8" style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <ShieldAlert size={48} color="#ef4444" style={{margin: '0 auto', marginBottom: '16px'}} />
        <h2 style={{color: '#ef4444', marginBottom: '8px', fontSize: '1.5rem'}}>EMERGENCY / KHẨN CẤP</h2>
        <p style={{marginBottom: '20px', color: 'var(--text-secondary)'}}>
          Nhấn nút bên dưới để gửi cảnh báo SOS kèm vị trí đến người thân của nạn nhân.
        </p>
        
        {sosSent ? (
          <div style={{color: '#10b981', fontWeight: 'bold', fontSize: '1.2rem', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px'}}>
            ✓ Đã gửi tín hiệu SOS thành công!
          </div>
        ) : showManualInput ? (
          <div style={{textAlign: 'left', background: 'var(--glass-bg)', padding: '16px', borderRadius: '8px'}}>
            <p style={{color: '#ef4444', fontWeight: 'bold', marginBottom: '12px'}}>
              Không thể tự động lấy vị trí. Hãy nhập địa chỉ hiện tại để thông báo!
            </p>
            <input 
              type="text" 
              className="form-input w-full" 
              style={{padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)'}}
              placeholder="Nhập địa chỉ, tên đường, khu vực..." 
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
            />
            <button 
              className="btn btn-primary w-full mt-4" 
              style={{background: '#ef4444', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer'}}
              onClick={submitManualAddress}
              disabled={sosLoading}
            >
              {sosLoading ? 'Đang gửi...' : 'Gửi Vị Trí Hiện Tại'}
            </button>
          </div>
        ) : (
          <button 
            className="sos-btn" 
            style={{
              background: '#ef4444', 
              color: 'white', 
              border: 'none', 
              padding: '16px 40px', 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              borderRadius: '50px', 
              cursor: sosLoading ? 'not-allowed' : 'pointer',
              opacity: sosLoading ? 0.7 : 1,
              boxShadow: '0 4px 14px 0 rgba(239, 68, 68, 0.39)',
              transition: 'transform 0.2s',
              width: '100%'
            }}
            onClick={handleSosClick}
            disabled={sosLoading}
          >
            {sosLoading ? 'Đang xử lý...' : 'SOS GỌI NGƯỜI THÂN'}
          </button>
        )}
      </div>

      <div className="text-center mb-8">
        <h1 style={{fontSize: '2rem', fontWeight: 'bold'}}>{userProfile?.fullName || 'THÔNG TIN CỨU HỘ'}</h1>
        {userProfile?.dateOfBirth && (
          <p style={{fontSize: '1.1rem', color: 'var(--text-secondary)'}}>
            Ngày sinh: {new Date(userProfile.dateOfBirth).toLocaleDateString('vi-VN')}
          </p>
        )}
        <p style={{color: 'var(--text-secondary)', marginTop: '8px'}}>Vui lòng cung cấp thông tin này cho nhân viên y tế.</p>
      </div>

      {socialLinks.length > 0 && (
        <div className="glass-card mb-4" style={{borderTop: '4px solid #10b981', background: 'var(--glass-bg)', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
          <h3 className="flex items-center gap-4 mb-4" style={{fontSize: '1.25rem', fontWeight: 'bold'}}><Share2 color="#10b981" /> Mạng xã hội</h3>
          <div className="flex flex-wrap gap-4">
            {socialLinks.map(link => (
              <a key={link.id} href={link.url} target="_blank" rel="noreferrer" style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '20px', textDecoration: 'none', color: 'var(--text-primary)', fontWeight: '600'}}>
                {link.platform === 'facebook' && <Facebook size={18} />}
                {link.platform === 'instagram' && <Instagram size={18} />}
                {link.platform === 'linkedin' && <Linkedin size={18} />}
                {link.platform === 'twitter' && <Twitter size={18} />}
                {link.platform === 'other' && <Globe size={18} />}
                {link.platform.toUpperCase()}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="glass-card mb-4" style={{borderTop: '4px solid #ef4444', background: 'var(--glass-bg)', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
        <h3 className="flex items-center gap-4 mb-4" style={{fontSize: '1.25rem', fontWeight: 'bold'}}><Heart color="#ef4444" /> Chi tiết sức khoẻ</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={{color: 'var(--text-secondary)', fontSize: '0.875rem'}}>Nhóm máu</label>
            <div style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#ef4444'}}>{data.health.bloodType || 'Không rõ'}</div>
          </div>
          <div>
            <label style={{color: 'var(--text-secondary)', fontSize: '0.875rem'}}>Năm sinh</label>
            <div style={{fontSize: '1.25rem', fontWeight: 'bold'}}>{data.health.birthYear || 'N/A'}</div>
          </div>
        </div>
        <div className="mt-4">
          <label style={{color: 'var(--text-secondary)', fontSize: '0.875rem'}}>Dị ứng</label>
          <div style={{fontWeight: '500'}}>{data.health.allergies || 'Không ghi nhận'}</div>
        </div>
        <div className="mt-4">
          <label style={{color: 'var(--text-secondary)', fontSize: '0.875rem'}}>Bệnh nền</label>
          <div style={{fontWeight: '500'}}>{data.health.conditions || 'Không ghi nhận'}</div>
        </div>
        {data.health.emergencyNote && (
          <div className="mt-4" style={{padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px'}}>
            <label style={{color: '#ef4444', fontWeight: '600'}}>Lưu ý quan trọng</label>
            <p style={{color: 'var(--text-primary)', marginTop: '4px'}}>{data.health.emergencyNote}</p>
          </div>
        )}
      </div>

      <div className="glass-card" style={{borderTop: '4px solid #3b82f6', background: 'var(--glass-bg)', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
        <h3 className="flex items-center gap-4 mb-4" style={{fontSize: '1.25rem', fontWeight: 'bold'}}><PhoneCall color="#3b82f6" /> Danh bạ khẩn cấp</h3>
        {data.contacts.map((contact, index) => (
          <div key={contact.id} className="flex justify-between items-center" style={{padding: '12px 0', borderBottom: index !== data.contacts.length - 1 ? '1px solid var(--glass-border)' : 'none'}}>
            <div>
              <div style={{fontWeight: '600', fontSize: '1.1rem'}}>{contact.name}</div>
              <div style={{fontSize: '0.875rem', color: 'var(--text-secondary)'}}>Ưu tiên: {contact.priority}</div>
            </div>
            <a href={`tel:${contact.phone}`} className="btn btn-primary" style={{padding: '8px 24px', borderRadius: '20px', background: '#3b82f6', color: 'white', textDecoration: 'none', fontWeight: 'bold'}}>
              Gọi ngay
            </a>
          </div>
        ))}
        {data.contacts.length === 0 && <p style={{color: 'var(--text-secondary)'}}>Không có danh bạ khẩn cấp được thiết lập.</p>}
      </div>

      <div className="mt-8 text-center">
        <button 
          className="btn"
          style={{background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}
          onClick={() => navigate(`/request-access/${data.userId}`)}
        >
          Dành cho Bác sĩ: Yêu cầu xem hồ sơ chi tiết
        </button>
      </div>
    </div>
  );
};
