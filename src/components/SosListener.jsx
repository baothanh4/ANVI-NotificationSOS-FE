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
            <p style={{ color: '#666666', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>PHÁT HIỆN TÍN HIỆU TỪ:</p>
            <h1 style={{ color: '#121212', margin: 0, fontSize: '2rem', fontWeight: 800 }}>{incomingSos.victimName}</h1>
          </div>

          <div style={locationBoxStyle}>
            <div style={{ fontWeight: 700, color: '#0064D2', marginBottom: '8px', fontSize: '0.72rem' }}>ĐỊA ĐIỂM XÁC ĐỊNH:</div>
            <div style={{ color: '#121212', fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.4 }}>
              {incomingSos.locationText || 'Đang cập nhật địa chỉ...'}
            </div>
          </div>

          <div style={actionBoxStyle}>
            <button 
              onClick={() => {
                setIncomingSos(null);
                navigate(`/sos-alert/${incomingSos.publicToken}`);
              }}
              style={btnOpenStyle}
            >
              XEM CHI TIẾT & HỖ TRỢ
            </button>
            
            <button 
              onClick={() => setIncomingSos(null)}
              style={btnIgnoreStyle}
            >
              Bỏ qua thông báo
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
  background: 'rgba(18,18,18,0.7)', backdropFilter: 'blur(8px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
};

const modalStyle = {
  width: '100%', maxWidth: '420px',
  background: '#FFFFFF', borderTop: '8px solid #0064D2',
  boxShadow: '0 20px 40px rgba(0,0,0,0.2)', borderRadius: '4px',
  overflow: 'hidden', fontFamily: "'Work Sans', sans-serif"
};

const headerStyle = {
  background: '#F8F8F8', color: '#121212', padding: '24px',
  display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid #EEEEEE'
};

const bodyStyle = { padding: '32px', textAlign: 'center' };

const victimInfoStyle = { marginBottom: '32px' };

const locationBoxStyle = {
  background: '#F8F8F8', borderLeft: '4px solid #0064D2',
  padding: '16px', borderRadius: '2px', textAlign: 'left',
  marginBottom: '32px'
};

const actionBoxStyle = { display: 'flex', flexDirection: 'column', gap: '12px' };

const btnOpenStyle = {
  background: '#0064D2', color: 'white', border: 'none',
  padding: '16px', fontWeight: 700, cursor: 'pointer',
  fontSize: '1rem', borderRadius: '4px', transition: '0.2s'
};

const btnIgnoreStyle = {
  background: 'transparent', color: '#666666', border: 'none',
  padding: '10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500
};
