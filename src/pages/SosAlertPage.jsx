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
  const [map, setMap] = useState(null);
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
    if (!leafletReady || loading || !mapRef.current || map) return;
    const L = window.L;
    
    // Khởi tạo bản đồ
    const mapInstance = L.map(mapRef.current, {
      center: [10.7769, 106.7009],
      zoom: 15,
      zoomControl: false,
    });
    
    // Theme bản đồ - Sử dụng Light Theme phù hợp với Transit Map
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

  // Cập nhật Markers
  useEffect(() => {
    const L = window.L;
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
      if (map) map.invalidateSize();
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
  }, [data, myLocation, map]);

  if (loading) return <div style={pageStyle}><div className="loading-screen">SYSTEM INITIALIZING...</div></div>;
  if (error || !data) return <div style={pageStyle}><div className="error-screen">LINK EXPIRED OR INVALID</div></div>;

  return (
    <div style={pageStyle}>
      {/* Transit-style Header */}
      <div className="transit-header">
        <div className="header-brand">
          <ShieldAlert size={24} color="#0064D2" />
          <span className="brand-text">ANVI SOS EMERGENCY SYSTEM</span>
        </div>
        <div className="header-status">
          LIVE TRACKING ACTIVATED: {data.victimName.toUpperCase()}
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
              <label className="metadata-label">VICTIM IDENTITY</label>
              <h2>{data.victimName}</h2>
              <div className="phone-badge"><Phone size={14} /> {data.victimPhone}</div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-box alert">
              <label>STATUS</label>
              <div className="value">EMERGENCY</div>
            </div>
            <div className="stat-box distance">
              <label>DISTANCE</label>
              <div className="value">
                {distance ? (distance > 1000 ? `${(distance/1000).toFixed(1)} km` : `${Math.round(distance)} m`) : "Calculating..."}
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3 className="section-title"><Heart size={14} /> MEDICAL RECORDS</h3>
            <div className="medical-list">
              <div className="med-item">
                <div className="med-label">Blood Type</div>
                <div className="med-value">{data.bloodType || 'N/A'}</div>
              </div>
              <div className="med-item">
                <div className="med-label">Allergies</div>
                <div className="med-value">{data.allergies || 'None'}</div>
              </div>
              <div className="med-item">
                <div className="med-label">Conditions</div>
                <div className="med-value">{data.conditions || 'None'}</div>
              </div>
            </div>
          </div>

          <div className="actions">
            <a href={data.googleMapsDirectionsUrl} className="btn-nav">
              <Navigation size={20} /> GET DIRECTIONS
            </a>
            <a href={`tel:${data.victimPhone}`} className="btn-call">
              <Phone size={18} /> EMERGENCY CALL
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
            </div>

            {/* BẢNG ĐỊA CHỈ NẠN NHÂN */}
            {data.locationText && (
              <div className="location-box">
                <div className="loc-label">IDENTIFIED LOCATION:</div>
                <div className="loc-value">{data.locationText}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700;800&display=swap');
 
        :root {
          --primary: #121212;
          --secondary: #666666;
          --tertiary: #0064D2;
          --neutral: #F8F8F8;
          --surface: #FFFFFF;
          --on-primary: #FFFFFF;
          --alert-red: #E02020;
        }

        body { margin: 0; background: var(--neutral); color: var(--primary); font-family: 'Work Sans', sans-serif; }

        .loading-screen {
          height: 100vh; display: flex; align-items: center; justify-content: center;
          color: var(--tertiary); font-weight: 700; letter-spacing: 1px;
        }

        .transit-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 20px 40px; background: var(--surface);
          border-bottom: 2px solid var(--primary);
        }

        .header-brand { display: flex; align-items: center; gap: 12px; }
        .brand-text { font-weight: 800; letter-spacing: -0.02em; font-size: 1.1rem; color: var(--primary); }
        .header-status { font-weight: 600; color: var(--secondary); font-size: 0.85rem; }

        .main-layout {
          display: grid; grid-template-columns: 420px 1fr; height: calc(100vh - 74px);
          padding: 0; gap: 0;
        }

        .side-panel {
          background: var(--surface); border-right: 1px solid #DDDDDD;
          padding: 40px; display: flex; flex-direction: column; gap: 40px;
          overflow-y: auto;
        }

        .victim-profile { display: flex; flex-direction: column; gap: 20px; }
        .avatar-frame {
          width: 120px; height: 120px; background: var(--neutral); border-radius: 4px; overflow: hidden;
          border: 1px solid #EEEEEE;
        }
        .avatar-frame img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-placeholder { 
          width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
          font-size: 2.5rem; color: var(--secondary); background: #EEEEEE; font-weight: 700;
        }

        .metadata-label { font-size: 0.72rem; font-weight: 800; color: var(--tertiary); letter-spacing: 0.1em; }
        .profile-details h2 { margin: 8px 0 4px; font-size: 2.25rem; font-weight: 800; color: var(--primary); letter-spacing: -0.03em; }
        .phone-badge { color: var(--secondary); font-weight: 500; display: flex; align-items: center; gap: 8px; }

        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: #DDDDDD; border: 1px solid #DDDDDD; }
        .stat-box { padding: 20px; background: var(--surface); }
        .stat-box label { font-size: 0.72rem; font-weight: 800; color: var(--secondary); letter-spacing: 0.05em; display: block; margin-bottom: 8px; }
        .stat-box .value { font-size: 1.5rem; font-weight: 700; color: var(--primary); }
        .stat-box.alert .value { color: var(--alert-red); }

        .section-title { font-size: 1rem; font-weight: 800; color: var(--primary); margin-bottom: 24px; border-bottom: 2px solid var(--primary); padding-bottom: 8px; }
        .medical-list { display: flex; flex-direction: column; gap: 20px; }
        .med-item { display: flex; flex-direction: column; gap: 4px; }
        .med-label { font-size: 0.72rem; font-weight: 800; color: var(--secondary); text-transform: uppercase; }
        .med-value { font-size: 1.1rem; font-weight: 600; color: var(--primary); }

        .actions { margin-top: auto; display: flex; flex-direction: column; gap: 12px; }
        .btn-nav {
          background: var(--tertiary); color: white; text-decoration: none;
          padding: 20px; text-align: center; font-weight: 700;
          border-radius: 4px; transition: 0.2s;
        }
        .btn-nav:hover { filter: brightness(1.1); transform: translateY(-2px); }
        .btn-call {
          background: var(--neutral); color: var(--primary); text-decoration: none;
          padding: 16px; text-align: center; border: 1px solid #DDDDDD;
          font-weight: 700; border-radius: 4px;
        }

        .map-panel { position: relative; height: 100%; }
        .map-frame { height: 100%; position: relative; }
        .leaflet-container { height: 100% !important; width: 100% !important; background: #F0F0F0; }

        .map-overlay-top {
          position: absolute; top: 32px; left: 32px; z-index: 1000;
          background: var(--primary); padding: 16px 24px; color: white;
          font-family: 'monospace'; font-size: 0.75rem; border-radius: 2px;
        }

        .location-box {
          position: absolute; bottom: 40px; left: 40px; right: 40px; z-index: 1000;
          background: var(--surface); border: 2px solid var(--primary);
          padding: 24px 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .loc-label { font-size: 0.72rem; color: var(--tertiary); font-weight: 800; letter-spacing: 0.1em; margin-bottom: 8px; }
        .loc-value { color: var(--primary); font-size: 1.25rem; font-weight: 700; line-height: 1.3; }

        /* Marker Styles - Transit Inspired */
        .victim-marker, .rescuer-marker { position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; }
        
        .pulse-red { position: absolute; inset: 0; border-radius: 50%; background: rgba(224,32,32,0.2); animation: pulse-r 2s infinite; }
        .inner-red { 
          width: 32px; height: 32px; border-radius: 50%; background: #E02020;
          border: 3px solid white; color: white; font-weight: 800; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2); position: relative; z-index: 2; font-size: 0.9rem;
        }

        .pulse-cyan { position: absolute; inset: 0; border-radius: 50%; background: rgba(0,100,210,0.2); animation: pulse-c 2s infinite; }
        .inner-cyan { 
          width: 24px; height: 24px; border-radius: 50%; background: var(--tertiary);
          border: 3px solid white; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2); position: relative; z-index: 2;
        }

        @keyframes pulse-r { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } }
        @keyframes pulse-c { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } }

        @media (max-width: 900px) {
          .main-layout { grid-template-columns: 1fr; }
          .side-panel { height: auto; padding: 24px; }
          .transit-header { padding: 15px 20px; flex-direction: column; align-items: flex-start; gap: 8px; }
        }
      `}</style>
    </div>
  );
};

const pageStyle = {
  minHeight: '100vh',
  background: '#F8F8F8',
  overflowX: 'hidden'
};
