import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  AlertTriangle, Navigation, Phone, Clock,
  Heart, Droplets, Pill, FileWarning, User, CheckCircle2, RefreshCw,
  LocateFixed, ShieldAlert, Crosshair, Zap, ArrowRight, Map,
  Facebook, Instagram, Linkedin, Twitter, Globe
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
    const scriptRouting = document.createElement('script');
    scriptRouting.src = 'https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.js';
    document.head.appendChild(scriptRouting);
    const linkRouting = document.createElement('link');
    linkRouting.rel = 'stylesheet';
    linkRouting.href = 'https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.css';
    document.head.appendChild(linkRouting);
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
  const [map, setMap] = useState(null);
  const victimMarkerRef = useRef(null);
  const myMarkerRef = useRef(null);
  const routingControlRef = useRef(null);

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
    if (!leafletReady || loading || !mapRef.current || map) return;
    const L = window.L;
    
    const mapInstance = L.map(mapRef.current, {
      center: [10.7769, 106.7009],
      zoom: 15,
      zoomControl: false,
    });
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO'
    }).addTo(mapInstance);
    
    L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);
    
    setMap(mapInstance);
  }, [leafletReady, loading]);

  // Cleanup bản đồ khi unmount
  useEffect(() => {
    return () => {
      if (map) {
        map.remove();
        setMap(null);
      }
    };
  }, [map]);

  // Cập nhật Markers và Routing
  useEffect(() => {
    const L = window.L;
    if (!L || !map || !data?.lat) return;

    const vLatlng = L.latLng(data.lat, data.lng);

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

    // 2. NGƯỜI THÂN (MÀU XANH)
    if (myLocation) {
      const myLatlng = L.latLng(myLocation.lat, myLocation.lng);
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

      // 3. ĐƯỜNG ĐI NGẮN NHẤT (Routing Machine)
      if (L.Routing) {
        if (!routingControlRef.current) {
          routingControlRef.current = L.Routing.control({
            waypoints: [myLatlng, vLatlng],
            routeWhileDragging: false,
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            show: false, // Ẩn bảng hướng dẫn chữ
            createMarker: () => null, // Không tạo marker mặc định của routing
            lineOptions: {
              styles: [{ color: '#007AFF', opacity: 0.8, weight: 6 }]
            }
          }).addTo(map);
        } else {
          routingControlRef.current.setWaypoints([myLatlng, vLatlng]);
        }
      }
    } else {
      map.setView(vLatlng, 16);
    }
  }, [data, myLocation, map]);

  if (loading) return <div style={pageStyle}><div className="loading-screen">HỆ THỐNG ĐANG KHỞI TẠO...</div></div>;
  if (error || !data) return <div style={pageStyle}><div className="error-screen">LIÊN KẾT ĐÃ HẾT HẠN HOẶC KHÔNG HỢP LỆ</div></div>;

  return (
    <div style={pageStyle}>
      {/* Transit-style Header */}
      <div className="transit-header">
        <div className="header-brand">
          <ShieldAlert size={24} color="#FF3B30" />
          <span className="brand-text">ANVI SOS EMERGENCY SYSTEM</span>
        </div>
        <div className="header-status">
          <span className="live-dot"></span> ĐANG THEO DÕI TRỰC TIẾP: {data.victimName.toUpperCase()}
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
            </div>
            
            <div className="profile-details">
              <label className="metadata-label">DANH TÍNH NẠN NHÂN</label>
              <h2>{data.victimName}</h2>
              <div className="phone-badge"><Phone size={14} /> {data.victimPhone}</div>
              
              {/* SOCIAL LINKS */}
              {data.socialLinks && data.socialLinks.length > 0 && (
                <div className="social-badges">
                  {data.socialLinks.map(link => (
                    <a 
                      key={link.id} 
                      href={link.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className={`social-icon ${link.platform}`}
                      title={`Ghé thăm ${link.platform}`}
                    >
                      {link.platform === 'facebook' && <Facebook size={16} />}
                      {link.platform === 'instagram' && <Instagram size={16} />}
                      {link.platform === 'linkedin' && <Linkedin size={16} />}
                      {link.platform === 'twitter' && <Twitter size={16} />}
                      {link.platform !== 'facebook' && link.platform !== 'instagram' && link.platform !== 'linkedin' && link.platform !== 'twitter' && <Globe size={16} />}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-box alert">
              <label>TRẠNG THÁI</label>
              <div className="value">NGUY HIỂM</div>
            </div>
            <div className="stat-box distance">
              <label>KHOẢNG CÁCH</label>
              <div className="value">
                {distance ? (distance > 1000 ? `${(distance/1000).toFixed(1)} km` : `${Math.round(distance)} m`) : "Đang tính..."}
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3 className="section-title"><Heart size={14} /> THÔNG TIN Y TẾ</h3>
            <div className="medical-list">
              <div className="med-item">
                <div className="med-label">Nhóm máu</div>
                <div className="med-value">{data.bloodType || 'Chưa rõ'}</div>
              </div>
              <div className="med-item">
                <div className="med-label">Dị ứng</div>
                <div className="med-value">{data.allergies || 'Không có'}</div>
              </div>
              <div className="med-item">
                <div className="med-label">Bệnh lý</div>
                <div className="med-value">{data.conditions || 'Không có'}</div>
              </div>
            </div>
          </div>

          <div className="actions">
            <a href={data.googleMapsDirectionsUrl} className="btn-nav" target="_blank" rel="noreferrer">
              <Navigation size={20} /> CHỈ ĐƯỜNG (GOOGLE MAPS)
            </a>
            <a href={`tel:${data.victimPhone}`} className="btn-call">
              <Phone size={18} /> GỌI KHẨN CẤP
            </a>
          </div>
        </div>

        {/* Right Panel: Map */}
        <div className="map-panel">
          <div className="map-frame">
            <div ref={mapRef} style={{ height: '100%', width: '100%', background: '#f0f0f0' }} />
            
            <div className="map-overlay-top">
              <div className="coords">
                LAT: {data.lat?.toFixed(6)} | LNG: {data.lng?.toFixed(6)}
              </div>
              <div className="refresh-time">
                <RefreshCw size={12} className="spin" /> CẬP NHẬT: {lastRefresh?.toLocaleTimeString()}
              </div>
            </div>

            {/* BẢNG ĐỊA CHỈ NẠN NHÂN */}
            {data.locationText && (
              <div className="location-box">
                <div className="loc-label">VỊ TRÍ HIỆN TẠI CỦA NẠN NHÂN:</div>
                <div className="loc-value">{data.locationText}</div>
                <div className="routing-tip">
                  <Map size={16} /> Đường kẻ màu xanh hiển thị lộ trình ngắn nhất đến mục tiêu.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
 
        :root {
          --primary: #1A1A1A;
          --secondary: #888888;
          --accent: #007AFF;
          --sos: #FF3B30;
          --surface: #FFFFFF;
          --background: #F2F2F7;
        }

        body { margin: 0; background: var(--background); color: var(--primary); font-family: 'Inter', sans-serif; overflow: hidden; }

        /* Emergency Overlay Styles */
        .emergency-alert-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 9999;
          display: flex; align-items: center; justify-content: center; padding: 20px;
          backdrop-filter: blur(8px);
        }
        .alert-card {
          background: white; width: 100%; maxWidth: 500px; border-radius: 24px; padding: 40px;
          text-align: center; box-shadow: 0 30px 60px rgba(0,0,0,0.5);
          animation: slideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        
        .alert-header h2 { color: var(--sos); font-weight: 900; font-size: 1.8rem; margin: 16px 0; }
        .alert-icon-pulse { color: var(--sos); animation: iconPulse 1s infinite; }
        @keyframes iconPulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
        
        .victim-address-box {
          background: #FFF4F4; border: 1px solid #FFE0E0; padding: 20px; border-radius: 16px;
          display: flex; gap: 12px; align-items: center; text-align: left; margin: 24px 0;
        }
        .victim-address-box span { font-weight: 700; color: var(--sos); font-size: 1.1rem; line-height: 1.4; }
        
        .btn-confirm-alert {
          width: 100%; padding: 20px; background: var(--sos); color: white; border: none;
          border-radius: 16px; font-weight: 800; font-size: 1.1rem; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 12px;
          box-shadow: 0 10px 20px rgba(255, 59, 48, 0.3); transition: all 0.2s;
        }
        .btn-confirm-alert:hover { transform: scale(1.02); filter: brightness(1.1); }

        /* Main UI */
        .transit-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 40px; background: white; border-bottom: 1px solid #E5E5E5;
        }
        .header-brand { display: flex; align-items: center; gap: 12px; }
        .brand-text { font-weight: 900; font-size: 1.1rem; letter-spacing: -0.02em; }
        .header-status { font-weight: 700; color: var(--secondary); font-size: 0.85rem; display: flex; align-items: center; gap: 8px; }
        .live-dot { width: 8px; height: 8px; background: var(--sos); border-radius: 50%; animation: blink 1s infinite; }
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }

        .main-layout { display: grid; grid-template-columns: 400px 1fr; height: calc(100vh - 65px); }
        .side-panel { background: white; padding: 32px; border-right: 1px solid #E5E5E5; display: flex; flex-direction: column; gap: 32px; overflow-y: auto; }
        
        .avatar-frame { width: 100px; height: 100px; border-radius: 20px; overflow: hidden; background: #F2F2F7; }
        .avatar-frame img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 900; color: #CCC; }
        
        .profile-details h2 { font-size: 2rem; font-weight: 900; margin: 8px 0; letter-spacing: -0.03em; }
        .metadata-label { font-size: 0.7rem; font-weight: 800; color: var(--accent); letter-spacing: 0.05em; }
        .phone-badge { font-weight: 600; color: var(--secondary); display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
        
        .social-badges { display: flex; gap: 10px; margin-top: 4px; }
        .social-icon { 
          width: 32px; height: 32px; border-radius: 8px; display: flex; 
          align-items: center; justify-content: center; color: white;
          transition: transform 0.2s; text-decoration: none;
        }
        .social-icon:hover { transform: translateY(-3px); }
        .social-icon.facebook { background: #1877F2; }
        .social-icon.instagram { background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); }
        .social-icon.linkedin { background: #0077b5; }
        .social-icon.twitter { background: #1DA1F2; }
        .social-icon.other { background: #444; }

        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .stat-box { background: #F8F9FA; padding: 20px; border-radius: 16px; border: 1px solid #EEE; }
        .stat-box label { font-size: 0.65rem; font-weight: 800; color: var(--secondary); display: block; margin-bottom: 8px; }
        .stat-box .value { font-size: 1.25rem; font-weight: 800; }
        .stat-box.alert .value { color: var(--sos); }

        .section-title { font-size: 0.9rem; font-weight: 900; border-bottom: 2px solid #EEE; padding-bottom: 12px; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
        .med-item { margin-bottom: 16px; }
        .med-label { font-size: 0.7rem; font-weight: 700; color: var(--secondary); text-transform: uppercase; margin-bottom: 4px; }
        .med-value { font-weight: 700; font-size: 1.05rem; }

        .actions { margin-top: auto; display: flex; flex-direction: column; gap: 12px; }
        .btn-nav { background: var(--accent); color: white; padding: 18px; border-radius: 14px; text-decoration: none; font-weight: 800; text-align: center; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 4px 15px rgba(0,122,255,0.2); }
        .btn-call { background: white; color: var(--primary); padding: 18px; border-radius: 14px; text-decoration: none; font-weight: 800; text-align: center; border: 2px solid #E5E5E5; display: flex; align-items: center; justify-content: center; gap: 10px; }

        .map-panel { position: relative; }
        .map-frame { height: 100%; position: relative; }
        .map-overlay-top { position: absolute; top: 24px; left: 24px; z-index: 1000; background: rgba(0,0,0,0.8); color: white; padding: 12px 20px; border-radius: 12px; font-family: monospace; font-size: 0.75rem; }
        .refresh-time { margin-top: 4px; opacity: 0.7; display: flex; align-items: center; gap: 6px; }
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .location-box { position: absolute; bottom: 32px; left: 32px; right: 32px; z-index: 1000; background: white; padding: 24px 32px; border-radius: 20px; box-shadow: 0 15px 40px rgba(0,0,0,0.15); border: 1px solid #EEE; }
        .loc-label { font-size: 0.75rem; font-weight: 800; color: var(--accent); margin-bottom: 8px; }
        .loc-value { font-size: 1.25rem; font-weight: 800; line-height: 1.4; color: var(--primary); }
        .routing-tip { margin-top: 12px; font-size: 0.85rem; color: var(--secondary); font-weight: 600; display: flex; align-items: center; gap: 8px; }

        /* Marker Styles */
        .victim-marker, .rescuer-marker { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; }
        .pulse-red { position: absolute; width: 60px; height: 60px; background: rgba(255, 59, 48, 0.2); border-radius: 50%; animation: pulse 2s infinite; }
        .inner-red { width: 36px; height: 36px; background: var(--sos); border: 3px solid white; border-radius: 50%; color: white; font-weight: 900; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(0,0,0,0.2); position: relative; z-index: 2; }
        .pulse-cyan { position: absolute; width: 50px; height: 50px; background: rgba(0, 122, 255, 0.2); border-radius: 50%; animation: pulse 2s infinite; }
        .inner-cyan { width: 28px; height: 28px; background: var(--accent); border: 3px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(0,0,0,0.2); position: relative; z-index: 2; }
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2); opacity: 0; } }

        /* Hide leaflet routing machine info box */
        .leaflet-routing-container { display: none !important; }
      `}</style>
    </div>
  );
};

const pageStyle = {
  minHeight: '100vh',
  background: '#F2F2F7',
  overflow: 'hidden'
};
