import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { AlertTriangle, MapPin, X } from 'lucide-react';

export const SosListener = () => {
  const [incomingSos, setIncomingSos] = useState(null);
  const navigate = useNavigate();
  const audioRef = React.useRef(null);

  useEffect(() => {
    const socket = new SockJS('/ws-sos');
    const stompClient = Stomp.over(socket);
    stompClient.debug = () => {}; // Tắt log debug hoàn toàn

    stompClient.connect({}, 
      () => {
        console.log("WebSocket Connected");
        stompClient.subscribe('/topic/sos-alerts', (message) => {
          try {
            const data = JSON.parse(message.body);
            if (data.type === 'SOS_ALERT') {
              setIncomingSos(data);
              if (audioRef.current) {
                audioRef.current.play().catch(() => {});
              }
            }
          } catch (e) {
            console.error("Parse SOS message error", e);
          }
        });
      },
      (error) => {
        console.log("WebSocket Connection Error: ", error);
        // Có thể thử kết nối lại sau 5 giây nếu cần
      }
    );

    return () => {
      if (stompClient.connected) stompClient.disconnect();
    };
  }, []);

  if (!incomingSos) return (
    <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3" preload="auto" />
  );

  return (
    <div style={overlayStyle}>
      <div className="sos-alert-modal" style={modalStyle}>
        <div style={headerStyle}>
          <AlertTriangle size={32} className="flicker" />
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>CẢNH BÁO SOS KHẨN CẤP!</h2>
        </div>
        
        <div style={bodyStyle}>
          <div style={victimInfoStyle}>
            <p style={{ color: '#94a3b8', marginBottom: '4px', fontSize: '0.9rem' }}>PHÁT HIỆN TÍN HIỆU TỪ:</p>
            <h1 style={{ color: 'white', margin: 0, fontSize: '2rem' }}>{incomingSos.victimName}</h1>
          </div>

          <div style={locationBoxStyle}>
            <MapPin size={18} color="#00f3ff" />
            Vị trí đã được xác định. Hãy ứng cứu ngay lập tức!
          </div>

          <div style={actionBoxStyle}>
            <button 
              onClick={() => {
                setIncomingSos(null);
                navigate(`/sos-alert/${incomingSos.publicToken}`);
              }}
              style={btnOpenStyle}
            >
              MỞ BẢN ĐỒ CHIẾN THUẬT
            </button>
            
            <button 
              onClick={() => setIncomingSos(null)}
              style={btnIgnoreStyle}
            >
              Đóng thông báo
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalShow {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .flicker { animation: flicker 0.2s infinite; }
        .sos-alert-modal { animation: modalShow 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
      `}</style>
    </div>
  );
};

const overlayStyle = {
  position: 'fixed', inset: 0, zIndex: 9999,
  background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
  display: 'flex', alignItems: 'center', justifyInContent: 'center', padding: '20px'
};

const modalStyle = {
  width: '100%', maxWidth: '450px',
  background: '#0a0f14', border: '2px solid #ff2e2e',
  boxShadow: '0 0 50px rgba(255,46,46,0.4)', borderRadius: '4px',
  overflow: 'hidden', fontFamily: "'Orbitron', sans-serif"
};

const headerStyle = {
  background: '#ff2e2e', color: 'white', padding: '20px',
  display: 'flex', alignItems: 'center', gap: '15px', fontWeight: 900
};

const bodyStyle = { padding: '30px', textAlign: 'center' };

const victimInfoStyle = { marginBottom: '25px' };

const locationBoxStyle = {
  background: 'rgba(0,243,255,0.1)', border: '1px solid rgba(0,243,255,0.3)',
  padding: '12px', borderRadius: '4px', color: '#00f3ff', fontSize: '0.9rem',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
  marginBottom: '30px'
};

const actionBoxStyle = { display: 'flex', flexDirection: 'column', gap: '12px' };

const btnOpenStyle = {
  background: '#ff2e2e', color: 'white', border: 'none',
  padding: '18px', fontWeight: 800, cursor: 'pointer',
  letterSpacing: '1px', fontSize: '1rem',
  clipPath: 'polygon(0 0, 95% 0, 100% 30%, 100% 100%, 5% 100%, 0 70%)'
};

const btnIgnoreStyle = {
  background: 'transparent', color: '#94a3b8', border: 'none',
  padding: '10px', cursor: 'pointer', fontSize: '0.85rem'
};
