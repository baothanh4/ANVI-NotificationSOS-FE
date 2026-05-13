import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { AlertTriangle, MapPin, X, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const SosListener = () => {
  const { user } = useAuth();
  const [incomingSos, setIncomingSos] = useState(null);
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const stompClientRef = useRef(null);

  useEffect(() => {
    const socket = new SockJS('/ws-sos');
    const stompClient = Stomp.over(socket);
    stompClientRef.current = stompClient;
    stompClient.debug = () => {}; // Disable debug logs

    const onMessageReceived = (message) => {
      try {
        const data = JSON.parse(message.body);
        if (data.type === 'SOS_ALERT') {
          setIncomingSos(data);
          if (audioRef.current) {
            audioRef.current.play().catch(e => console.log("Audio play blocked", e));
          }
        } else if (data.type === 'SOS_SAFE') {
            // If the victim is marked safe, clear the alert if it matches
            setIncomingSos(prev => (prev && prev.publicToken === data.publicToken) ? null : prev);
        }
      } catch (e) {
        console.error("Parse SOS message error", e);
      }
    };

    stompClient.connect({}, 
      () => {
        console.log("WebSocket Connected successfully");
        
        // 1. Subscribe to Global Broadcast (Admins/Dashboards)
        stompClient.subscribe('/topic/sos-alerts', onMessageReceived);

        // 2. Subscribe to Personalized Alerts (Social Connections / Nearby Volunteers)
        if (user && user.phone) {
          // Spring Stomp /user/ prefix automatically maps to the authenticated session
          // We subscribe to the relative queue path
          stompClient.subscribe('/user/queue/sos-alerts', onMessageReceived);
          stompClient.subscribe('/user/queue/nearby-sos', onMessageReceived);
        }
      },
      (error) => {
        console.log("WebSocket Connection Error: ", error);
      }
    );

    return () => {
      if (stompClientRef.current && stompClientRef.current.connected) {
        stompClientRef.current.disconnect();
      }
    };
  }, [user]);

  if (!incomingSos) return (
    <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3" preload="auto" />
  );

  return (
    <div style={overlayStyle}>
      <div className="sos-alert-modal" style={modalStyle}>
        <div style={headerStyle}>
          <div style={pulseIconStyle}>
            <AlertTriangle size={32} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#FF3B30' }}>CẢNH BÁO KHẨN CẤP</h2>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#666', marginTop: '2px' }}>TÍN HIỆU SOS THỜI GIAN THỰC</div>
          </div>
          <button onClick={() => setIncomingSos(null)} style={closeBtnStyle}><X size={20} /></button>
        </div>
        
        <div style={bodyStyle}>
          <div style={victimInfoStyle}>
            <div style={{ background: '#F2F2F7', padding: '12px', borderRadius: '12px', marginBottom: '16px', display: 'inline-block' }}>
               <Bell size={24} color="#007AFF" />
            </div>
            <p style={{ color: '#8E8E93', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.05em' }}>CÓ NGƯỜI CẦN TRỢ GIÚP:</p>
            <h1 style={{ color: '#1C1C1E', margin: 0, fontSize: '1.8rem', fontWeight: 950, letterSpacing: '-0.02em' }}>{incomingSos.victimName}</h1>
          </div>

          <div style={locationBoxStyle}>
            <div style={{ fontWeight: 800, color: '#007AFF', marginBottom: '8px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} /> VỊ TRÍ PHÁT TÍN HIỆU:
            </div>
            <div style={{ color: '#1C1C1E', fontSize: '1rem', fontWeight: 700, lineHeight: 1.5 }}>
              {incomingSos.locationText || 'Đang xác định địa chỉ chính xác...'}
            </div>
          </div>

          <div style={actionBoxStyle}>
            <button 
              onClick={() => {
                const token = incomingSos.publicToken;
                setIncomingSos(null);
                navigate(`/sos-alert/${token}`);
              }}
              style={btnOpenStyle}
            >
              PHẢN HỒI NGAY LẬP TỨC
            </button>
            
            <button 
              onClick={() => setIncomingSos(null)}
              style={btnIgnoreStyle}
            >
              Bỏ qua thông báo này
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalShow {
          from { transform: translateY(20px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes pulseRed {
          0% { box-shadow: 0 0 0 0 rgba(255, 59, 48, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(255, 59, 48, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 59, 48, 0); }
        }
        .sos-alert-modal { animation: modalShow 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

const overlayStyle = {
  position: 'fixed', inset: 0, zIndex: 10000,
  background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
};

const modalStyle = {
  width: '100%', maxWidth: '400px',
  background: '#FFFFFF', borderRadius: '32px',
  boxShadow: '0 30px 60px rgba(0,0,0,0.15)',
  overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)'
};

const headerStyle = {
  padding: '24px 24px 20px', display: 'flex', alignItems: 'center', gap: '16px',
  borderBottom: '1px solid #F2F2F7'
};

const pulseIconStyle = {
  width: '56px', height: '56px', background: '#FF3B30', borderRadius: '18px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  animation: 'pulseRed 2s infinite'
};

const closeBtnStyle = {
  background: '#F2F2F7', border: 'none', width: '36px', height: '36px',
  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', color: '#8E8E93'
};

const bodyStyle = { padding: '32px', textAlign: 'center' };

const victimInfoStyle = { marginBottom: '28px' };

const locationBoxStyle = {
  background: '#F8F8F8', padding: '20px', borderRadius: '24px',
  textAlign: 'left', marginBottom: '32px'
};

const actionBoxStyle = { display: 'flex', flexDirection: 'column', gap: '12px' };

const btnOpenStyle = {
  background: '#FF3B30', color: 'white', border: 'none',
  padding: '18px', fontWeight: 800, cursor: 'pointer',
  fontSize: '1rem', borderRadius: '16px', transition: 'all 0.2s',
  boxShadow: '0 8px 20px rgba(255,59,48,0.3)'
};

const btnIgnoreStyle = {
  background: 'transparent', color: '#8E8E93', border: 'none',
  padding: '10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600
};
