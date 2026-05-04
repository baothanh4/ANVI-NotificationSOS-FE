import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  AlertTriangle, MapPin, Navigation, Phone, Clock,
  Heart, Droplets, Pill, FileWarning, User, CheckCircle2, RefreshCw,
  LocateFixed, ShieldAlert, Crosshair, Zap
} from 'lucide-react';

// Tải Leaflet lazy
const loadLeaflet = () =>
  new Promise((resolve) => {
    if (window.L) return resolve(window.L);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => resolve(window.L);
    document.head.appendChild(script);
  });

const POLL_INTERVAL_MS = 5000;

export const SosAlertPage = () => {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);
  const [leafletReady, setLeafletReady] = useState(false);
  
  // Vị trí của người thân (người đang xem)
  const [myLocation, setMyLocation] = useState(null);
  const [distance, setDistance] = useState(null);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const victimMarkerRef = useRef(null);
  const myMarkerRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    loadLeaflet().then(() => setLeafletReady(true));
  }, []);

  // ─── Lấy dữ liệu nạn nhân ───────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/sos/public/${token}`);
      if (!res.ok) throw new Error('Không tìm thấy SOS alert');
      const json = await res.json();
      setData(json);
      setLastRefresh(new Date());
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fetchData]);

  // ─── Theo dõi vị trí của chính người xem (Người thân) ──────────────────
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setMyLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      (err) => console.error("GPS Error:", err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // ─── Tính khoảng cách ───────────────────────────────────────────────────
  useEffect(() => {
    if (data?.lat && data?.lng && myLocation) {
      const R = 6371e3; // metres
      const φ1 = (data.lat * Math.PI) / 180;
      const φ2 = (myLocation.lat * Math.PI) / 180;
      const Δφ = ((myLocation.lat - data.lat) * Math.PI) / 180;
      const Δλ = ((myLocation.lng - data.lng) * Math.PI) / 180;

      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c;
      setDistance(d);
    }
  }, [data, myLocation]);

  // ─── Render Bản đồ ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!leafletReady || !mapRef.current || mapInstanceRef.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, {
      center: [10.7769, 106.7009],
      zoom: 15,
      zoomControl: false,
    });
    
    // Theme bản đồ
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);
    
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapInstanceRef.current = map;
  }, [leafletReady]);

  // Cập nhật Markers
  useEffect(() => {
    const L = window.L;
    const map = mapInstanceRef.current;
    if (!L || !map || !data?.lat) return;

    const vLatlng = [parseFloat(data.lat), parseFloat(data.lng)];

    // 1. NẠN NHÂN (MÀU ĐỎ)
    const victimHtml = `
      <div class="victim-marker">
        <div class="pulse-red"></div>
        <div class="inner-red">${data.initials || '🆘'}</div>
      </div>
    `;
    const vIcon = L.divIcon({ html: victimHtml, className: '', iconSize: [50, 50], iconAnchor: [25, 25] });

    if (!victimMarkerRef.current) {
      victimMarkerRef.current = L.marker(vLatlng, { icon: vIcon }).addTo(map);
    } else {
      victimMarkerRef.current.setLatLng(vLatlng);
    }

    // Buộc Leaflet tính toán lại kích thước liên tục trong vài giây đầu
    const refreshInterval = setInterval(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 500);
    
    setTimeout(() => clearInterval(refreshInterval), 3000);

    // 2. NGƯỜI THÂN (MÀU XANH)
    if (myLocation) {
      const myLatlng = [myLocation.lat, myLocation.lng];
      const rescuerHtml = `
        <div class="rescuer-marker">
          <div class="pulse-cyan"></div>
          <div class="inner-cyan"><ShieldAlert size={18} color="white"/></div>
        </div>
      `;
      const rIcon = L.divIcon({ html: rescuerHtml, className: '', iconSize: [40, 40], iconAnchor: [20, 20] });

      if (!myMarkerRef.current) {
        myMarkerRef.current = L.marker(myLatlng, { icon: rIcon }).addTo(map);
      } else {
        myMarkerRef.current.setLatLng(myLatlng);
      }

      // Vẽ đường nối giữa 2 người
      if (!lineRef.current) {
        lineRef.current = L.polyline([vLatlng, myLatlng], {
          color: '#22d3ee', weight: 2, dashArray: '5, 10', opacity: 0.6
        }).addTo(map);
      } else {
        lineRef.current.setLatLngs([vLatlng, myLatlng]);
      }
      
      // Auto zoom để thấy cả 2
      const bounds = L.latLngBounds([vLatlng, myLatlng]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      map.setView(vLatlng, 16);
    }
  }, [data, myLocation]);

  if (loading) return <div style={pageStyle}><div className="loading-screen">SYSTEM INITIALIZING...</div></div>;
  if (error || !data) return <div style={pageStyle}><div className="error-screen">LINK EXPIRED OR INVALID</div></div>;

  return (
    <div style={pageStyle}>
      {/* HUD Header */}
      <div className="hud-header">
        <div className="status-label">
          <Zap size={14} className="flicker" /> SYSTEM ACTIVATED
        </div>
        <div className="alert-label">
          DETECTED: {data.victimName.toUpperCase()}
        </div>
      </div>

      <div className="main-layout">
        {/* Left Panel: Victim Info */}
        <div className="side-panel">
          
          <div className="victim-profile">
            <div className="avatar-frame">
              {data.avatarUrl ? (
                <img src={data.avatarUrl} alt="victim" />
              ) : (
                <div className="avatar-placeholder">{data.initials}</div>
              )}
              <div className="corner-tl"></div><div className="corner-tr"></div>
              <div className="corner-bl"></div><div className="corner-br"></div>
            </div>
            
            <div className="profile-details">
              <h2>{data.victimName}</h2>
              <div className="phone-badge"><Phone size={14} /> {data.victimPhone}</div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-box red">
              <label>TÌNH TRẠNG</label>
              <div className="value">KHẨN CẤP</div>
            </div>
            <div className="stat-box cyan">
              <label>KHOẢNG CÁCH</label>
              <div className="value">
                {distance ? (distance > 1000 ? `${(distance/1000).toFixed(1)} km` : `${Math.round(distance)} m`) : "Đang tính..."}
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3 className="section-title"><Heart size={14} /> DỮ LIỆU Y TẾ</h3>
            <div className="medical-list">
              <div className="med-item"><Droplets size={16} /> <span>Nhóm máu: {data.bloodType || 'N/A'}</span></div>
              <div className="med-item"><FileWarning size={16} /> <span>Dị ứng: {data.allergies || 'Không'}</span></div>
              <div className="med-item"><Pill size={16} /> <span>Bệnh nền: {data.conditions || 'Không'}</span></div>
            </div>
          </div>

          <div className="actions">
            <a href={data.googleMapsDirectionsUrl} className="btn-nav">
              <Navigation size={20} /> BẮT ĐẦU DẪN ĐƯỜNG
            </a>
            <a href={`tel:${data.victimPhone}`} className="btn-call">
              <Phone size={18} /> GỌI KHẨN CẤP
            </a>
          </div>
        </div>

        {/* Right Panel: Map */}
        <div className="map-panel">
          <div className="map-frame">
            <div ref={mapRef} className="leaflet-container" />
            <div className="map-overlay-top">
              <div className="coords">
                LAT: {data.lat?.toFixed(6)} | LNG: {data.lng?.toFixed(6)}
              </div>
              <div className="refresh-time">
                LAST SCAN: {lastRefresh?.toLocaleTimeString()}
              </div>
            </div>

            {/* BẢNG ĐỊA CHỈ NẠN NHÂN */}
            {data.locationText && (
              <div className="location-box">
                <div className="loc-label">ĐỊA CHỈ PHÁT HIỆN:</div>
                <div className="loc-value">{data.locationText}</div>
              </div>
            )}
            
            <div className="scan-line"></div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&display=swap');

        :root {
          --alert-red: #ff2e2e;
          --active-cyan: #00f3ff;
          --bg-dark: #05080a;
          --panel-bg: rgba(10, 15, 20, 0.85);
          --border-color: rgba(0, 243, 255, 0.3);
        }

        body { margin: 0; background: var(--bg-dark); }

        .loading-screen {
          height: 100vh; display: flex; align-items: center; justify-content: center;
          font-family: 'Orbitron', sans-serif; color: var(--active-cyan);
          letter-spacing: 4px; font-size: 1.5rem; text-shadow: 0 0 10px var(--active-cyan);
        }

        .hud-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 15px 30px; background: linear-gradient(180deg, rgba(0,243,255,0.1) 0%, transparent 100%);
          border-bottom: 1px solid var(--border-color);
          font-family: 'Orbitron', sans-serif;
        }

        .status-label { color: var(--active-cyan); font-weight: 700; display: flex; align-items: center; gap: 10px; }
        .alert-label { color: var(--alert-red); font-weight: 900; letter-spacing: 2px; }

        .main-layout {
          display: grid; grid-template-columns: 400px 1fr; height: calc(100vh - 60px);
          padding: 20px; gap: 20px; font-family: 'Rajdhani', sans-serif;
        }

        .side-panel {
          background: var(--panel-bg); border: 1px solid var(--border-color);
          border-radius: 4px; padding: 25px; display: flex; flexDirection: column; gap: 20px;
          box-shadow: inset 0 0 20px rgba(0,243,255,0.05);
          position: relative;
        }

        .victim-profile { display: flex; align-items: center; gap: 20px; }
        .avatar-frame {
          width: 100px; height: 100px; background: #111; position: relative;
          padding: 4px; border: 1px solid var(--alert-red);
        }
        .avatar-frame img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-placeholder { 
          width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
          font-size: 2rem; color: var(--alert-red); font-family: 'Orbitron';
        }

        .corner-tl, .corner-tr, .corner-bl, .corner-br {
          position: absolute; width: 10px; height: 10px; border: 2px solid var(--alert-red);
        }
        .corner-tl { top: -2px; left: -2px; border-right: 0; border-bottom: 0; }
        .corner-tr { top: -2px; right: -2px; border-left: 0; border-bottom: 0; }
        .corner-bl { bottom: -2px; left: -2px; border-right: 0; border-top: 0; }
        .corner-br { bottom: -2px; right: -2px; border-left: 0; border-top: 0; }

        .profile-details h2 { margin: 0; font-family: 'Orbitron'; color: white; font-size: 1.4rem; }
        .phone-badge { color: var(--active-cyan); font-weight: 600; margin-top: 5px; }

        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .stat-box { padding: 12px; border-radius: 2px; }
        .stat-box.red { background: rgba(255,46,46,0.1); border: 1px solid rgba(255,46,46,0.3); }
        .stat-box.cyan { background: rgba(0,243,255,0.1); border: 1px solid rgba(0,243,255,0.3); }
        .stat-box label { font-size: 0.7rem; font-weight: 700; color: rgba(255,255,255,0.6); }
        .stat-box .value { font-size: 1.2rem; font-weight: 800; color: white; margin-top: 2px; }
        .stat-box.red .value { color: var(--alert-red); text-shadow: 0 0 8px var(--alert-red); }
        .stat-box.cyan .value { color: var(--active-cyan); text-shadow: 0 0 8px var(--active-cyan); }

        .section-title { font-family: 'Orbitron'; font-size: 0.9rem; color: var(--active-cyan); margin-bottom: 15px; display: flex; align-items: center; gap: 8px; }
        .medical-list { display: flex; flex-direction: column; gap: 12px; }
        .med-item { display: flex; align-items: center; gap: 12px; color: white; font-size: 1.1rem; }
        .med-item svg { color: var(--active-cyan); }

        .actions { margin-top: auto; display: flex; flex-direction: column; gap: 10px; }
        .btn-nav {
          background: var(--alert-red); color: white; text-decoration: none;
          padding: 18px; text-align: center; font-weight: 800; font-family: 'Orbitron';
          letter-spacing: 1px; transition: 0.3s; clip-path: polygon(0 0, 95% 0, 100% 30%, 100% 100%, 5% 100%, 0 70%);
        }
        .btn-nav:hover { transform: scale(1.02); filter: brightness(1.2); }
        .btn-call {
          background: rgba(255,255,255,0.05); color: white; text-decoration: none;
          padding: 15px; text-align: center; border: 1px solid rgba(255,255,255,0.2);
          font-weight: 600; font-family: 'Orbitron'; font-size: 0.8rem;
        }

        .map-panel { position: relative; height: 100%; min-height: 500px; }
        .map-frame { 
          height: 100%; min-height: 500px; border: 1px solid var(--border-color); border-radius: 4px; overflow: hidden; position: relative;
          box-shadow: 0 0 30px rgba(0,243,255,0.1);
        }
        .leaflet-container { height: 100% !important; width: 100% !important; background: #05080a; }

        .map-overlay-top {
          position: absolute; top: 20px; left: 20px; z-index: 1000;
          background: rgba(0,0,0,0.7); padding: 10px 15px; border-left: 3px solid var(--active-cyan);
          font-family: 'monospace'; color: var(--active-cyan); font-size: 0.8rem;
        }

        .location-box {
          position: absolute; bottom: 30px; left: 20px; right: 20px; z-index: 1000;
          background: rgba(10, 15, 20, 0.9); border: 1px solid var(--border-color);
          padding: 15px 20px; box-shadow: 0 0 20px rgba(0,0,0,0.5);
          border-left: 5px solid var(--alert-red);
        }
        .loc-label { font-size: 0.7rem; color: var(--alert-red); font-weight: 800; letter-spacing: 1px; margin-bottom: 5px; }
        .loc-value { color: white; font-size: 1.1rem; font-weight: 600; line-height: 1.4; }

        .scan-line {
          position: absolute; top: 0; left: 0; width: 100%; height: 2px;
          background: rgba(0, 243, 255, 0.5); box-shadow: 0 0 15px var(--active-cyan);
          animation: scan 4s linear infinite; z-index: 1001; pointer-events: none;
        }

        /* Marker Styles */
        .victim-marker, .rescuer-marker { position: relative; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; }
        
        .pulse-red { position: absolute; inset: 0; border-radius: 50%; background: rgba(255,46,46,0.3); animation: pulse-r 2s infinite; }
        .inner-red { 
          width: 34px; height: 34px; border-radius: 50%; background: var(--alert-red);
          border: 2px solid white; color: white; font-weight: 900; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 15px var(--alert-red); position: relative; z-index: 2;
        }

        .pulse-cyan { position: absolute; inset: 0; border-radius: 50%; background: rgba(0,243,255,0.3); animation: pulse-c 2s infinite; }
        .inner-cyan { 
          width: 30px; height: 30px; border-radius: 50%; background: var(--active-cyan);
          border: 2px solid white; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 15px var(--active-cyan); position: relative; z-index: 2;
        }

        @keyframes pulse-r { 0% { transform: scale(0.5); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } }
        @keyframes pulse-c { 0% { transform: scale(0.5); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } }
        @keyframes scan { 0% { top: 0; } 100% { top: 100%; } }
        @keyframes flicker { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
        .flicker { animation: flicker 0.1s infinite; }

        @media (max-width: 900px) {
          .main-layout { grid-template-columns: 1fr; }
          .side-panel { height: auto; }
        }
      `}</style>
    </div>
  );
};

const pageStyle = {
  minHeight: '100vh',
  background: '#05080a',
  overflowX: 'hidden'
};
