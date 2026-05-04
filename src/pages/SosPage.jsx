import React, { useState, useEffect, useRef, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../contexts/AuthContext';
import {
  MapPin, Navigation, AlertTriangle, CheckCircle2,
  RefreshCw, Phone, Mail, Clock, Zap
} from 'lucide-react';

// ─── Leaflet map (OpenStreetMap, không cần API key) ─────────────────────────
// Tải lazy qua CDN để tránh bundle size
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

// ─── Khoảng cách 2 tọa độ (meters) ─────────────────────────────────────────
const distanceM = (a, b) => {
  if (!a || !b) return 0;
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

export const SosPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentTime, setSentTime] = useState(null);
  const [publicToken, setPublicToken] = useState(null);
  const locationPushRef = useRef(null);

  // GPS
  const [location, setLocation] = useState(null); // {lat, lng, accuracy}
  const [locationHistory, setLocationHistory] = useState([]);
  const [gpsStatus, setGpsStatus] = useState('idle'); // idle | acquiring | found | error
  const [gpsError, setGpsError] = useState('');
  const watchIdRef = useRef(null);

  // Map
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const pathRef = useRef(null);
  const [leafletReady, setLeafletReady] = useState(false);

  // SOS stats
  const [elapsed, setElapsed] = useState(0);

  // Tải Leaflet
  useEffect(() => {
    loadLeaflet().then(() => setLeafletReady(true));
  }, []);

  // Khởi tạo map sau khi Leaflet sẵn sàng
  useEffect(() => {
    if (!leafletReady || !mapRef.current || mapInstanceRef.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, {
      center: [10.7769, 106.7009], // TP.HCM mặc định
      zoom: 15,
      zoomControl: true,
    });
    
    // Theme bản đồ - Light Theme cho Transit Map
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      maxZoom: 19,
    }).addTo(map);
    
    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leafletReady]);

  // Bắt đầu theo dõi GPS
  const startGps = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      setGpsError('Trình duyệt không hỗ trợ GPS');
      return;
    }
    setGpsStatus('acquiring');
    setGpsError('');

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        const point = { lat, lng, accuracy };
        setLocation(point);
        setLocationHistory(prev => {
          // Giới hạn 100 điểm
          const updated = [...prev, point].slice(-100);
          return updated;
        });
        setGpsStatus('found');

        const L = window.L;
        const map = mapInstanceRef.current;
        if (!L || !map) return;

        const latlng = [lat, lng];

        // Marker nạn nhân
        if (!markerRef.current) {
          const icon = L.divIcon({
            html: `<div style="
              width:32px;height:32px;border-radius:50%;
              background:#E02020;
              border:3px solid white;
              box-shadow:0 4px 12px rgba(0,0,0,0.2);
              display:flex;align-items:center;justify-content:center;
              font-size:14px;
            ">📍</div>`,
            className: '',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });
          markerRef.current = L.marker(latlng, { icon }).addTo(map);
          markerRef.current.bindPopup(`
            <div style="font-family:sans-serif;font-size:13px;line-height:1.6">
              <b>🆘 Vị trí nạn nhân</b><br/>
              Lat: ${lat.toFixed(6)}<br/>
              Lng: ${lng.toFixed(6)}<br/>
              Độ chính xác: ~${Math.round(accuracy)}m
            </div>
          `);
        } else {
          markerRef.current.setLatLng(latlng);
          markerRef.current
            .getPopup()
            ?.setContent(`
              <div style="font-family:sans-serif;font-size:13px;line-height:1.6">
                <b>🆘 Vị trí nạn nhân</b><br/>
                Lat: ${lat.toFixed(6)}<br/>
                Lng: ${lng.toFixed(6)}<br/>
                Độ chính xác: ~${Math.round(accuracy)}m
              </div>
            `);
        }

        // Vòng tròn độ chính xác
        if (circleRef.current) circleRef.current.remove();
        circleRef.current = L.circle(latlng, {
          radius: accuracy,
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.08,
          weight: 1,
        }).addTo(map);

        // Vẽ đường đi
        setLocationHistory(prev => {
          if (prev.length > 1) {
            if (pathRef.current) pathRef.current.remove();
            pathRef.current = L.polyline(
              prev.map(p => [p.lat, p.lng]),
              { color: '#ef4444', weight: 3, opacity: 0.7, dashArray: '6 4' }
            ).addTo(map);
          }
          return prev;
        });

        map.setView(latlng, map.getZoom() < 15 ? 16 : map.getZoom());
      },
      (err) => {
        setGpsStatus('error');
        setGpsError(
          err.code === 1
            ? 'Bạn đã từ chối quyền truy cập GPS. Hãy cho phép trong cài đặt trình duyệt.'
            : err.code === 2
            ? 'Không xác định được vị trí. Hãy đảm bảo GPS đang bật.'
            : 'Hết thời gian chờ GPS.'
        );
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    startGps();
    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [startGps]);

  // Đếm thời gian sau khi gửi SOS
  useEffect(() => {
    if (!sent || !sentTime) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - sentTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, [sent, sentTime]);

  const formatElapsed = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}p ${sec}s` : `${sec}s`;
  };

  // ─── Cập nhật vị trí lên server sau khi SOS được gửi ───────────────────
  const startLocationPushing = useCallback((token) => {
    if (locationPushRef.current) clearInterval(locationPushRef.current);
    locationPushRef.current = setInterval(async () => {
      if (!location) return;
      try {
        await axiosClient.patch(`/sos/public/${token}/location`, {
          lat: location.lat,
          lng: location.lng,
          locationText: `Độ chính xác: ~${Math.round(location.accuracy)}m`,
        });
      } catch {}
    }, 5000);
  }, [location]);

  // Khi location thay đổi và đã có token → push ngay
  useEffect(() => {
    if (publicToken && location) {
      axiosClient.patch(`/sos/public/${publicToken}/location`, {
        lat: location.lat,
        lng: location.lng,
        locationText: `Độ chính xác: ~${Math.round(location.accuracy)}m`,
      }).catch(() => {});
    }
  }, [location, publicToken]);

  // Cleanup khi unmount
  useEffect(() => {
    return () => { if (locationPushRef.current) clearInterval(locationPushRef.current); };
  }, []);

  // ─── Gửi SOS ─────────────────────────────────────────────────────────────
  const triggerSos = async () => {
    if (!user?.id) { alert('Vui lòng đăng nhập lại.'); return; }
    setLoading(true);

    const payload = {
      userId: parseInt(user.id),
      gpsLat: location?.lat ?? null,
      gpsLng: location?.lng ?? null,
      locationText: location
        ? `Độ chính xác GPS: ~${Math.round(location.accuracy)}m`
        : null,
      ipLocation: null,
    };

    try {
      const res = await axiosClient.post('/sos/trigger', payload);
      const token = res?.publicToken;
      setSent(true);
      setSentTime(Date.now());
      if (token) {
        setPublicToken(token);
        startLocationPushing(token);
      }
    } catch (err) {
      alert('Không thể gửi SOS: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const googleMapsUrl = location
    ? `https://www.google.com/maps?q=${location.lat},${location.lng}`
    : null;

  const googleDirectionsUrl = location
    ? `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}&travelmode=driving`
    : null;

  const totalDistance = locationHistory.length > 1
    ? locationHistory.reduce((acc, p, i) => i === 0 ? 0 : acc + distanceM(locationHistory[i - 1], p), 0)
    : 0;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>

      {/* ─── Title ─────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: 'var(--text-primary)', fontSize: '2.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', letterSpacing: '-0.03em' }}>
          <AlertTriangle size={36} color="var(--accent-red)" /> SOS SYSTEM
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontWeight: 500 }}>
          Trạm điều hành cứu hộ khẩn cấp — Nhấn nút để yêu cầu hỗ trợ ngay lập tức
        </p>
      </div>

      {/* ─── Grid layout: Map + SOS button ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>

        {/* MAP */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Map header */}
          <div style={{ padding: '20px 24px', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid var(--text-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <MapPin size={18} color="var(--accent-red)" />
              <span>LIVE COORDINATES</span>
              {gpsStatus === 'found' && (
                <span style={{ background: '#00843D', color: 'white', fontSize: '0.7rem', padding: '3px 10px', borderRadius: '2px', fontWeight: 800 }}>● ACTIVE</span>
              )}
              {gpsStatus === 'acquiring' && (
                <span style={{ background: '#0064D2', color: 'white', fontSize: '0.7rem', padding: '3px 10px', borderRadius: '2px', fontWeight: 800 }}>⟳ SCANNING...</span>
              )}
            </div>
            {location && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                ACCURACY: ±{Math.round(location.accuracy)}M
              </div>
            )}
          </div>

          {/* Map container */}
          <div ref={mapRef} style={{ height: '380px', width: '100%' }} />

          {/* Coordinates */}
          {location && (
            <div style={{ padding: '16px 24px', background: 'var(--bg-primary)', display: 'flex', gap: '20px', fontSize: '0.8rem', color: 'var(--text-secondary)', flexWrap: 'wrap', fontWeight: 600, borderTop: '1px solid #EEEEEE' }}>
              <span>📍 {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</span>
              <span>📏 {locationHistory.length} DATA POINTS • {totalDistance > 0 ? `${totalDistance.toFixed(0)}M TRACKED` : 'STATIONARY'}</span>
            </div>
          )}

          {/* GPS Error */}
          {gpsStatus === 'error' && (
            <div style={{ padding: '14px 20px', background: 'rgba(239,68,68,0.1)', color: '#fca5a5', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} />
              {gpsError}
              <button onClick={startGps} style={{ marginLeft: 'auto', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: '8px', padding: '4px 12px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <RefreshCw size={12} /> Thử lại
              </button>
            </div>
          )}
        </div>

        {/* ─── RIGHT PANEL ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* SOS Button */}
          <div className="glass-card" style={{ textAlign: 'center', padding: '28px 20px' }}>
            {!sent ? (
              <>
                <div className="sos-btn-wrapper" style={{ margin: '0 auto 20px' }}>
                  <button
                    className="sos-btn"
                    onClick={triggerSos}
                    disabled={loading}
                    style={{ opacity: loading ? 0.8 : 1 }}
                  >
                    {loading ? <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} /> : 'SOS'}
                  </button>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {gpsStatus === 'found'
                    ? '✅ GPS đã sẵn sàng — Nhấn để gửi cảnh báo'
                    : '⏳ Đang lấy vị trí GPS...'}
                </p>
                {gpsStatus !== 'found' && (
                  <p style={{ color: '#f59e0b', fontSize: '0.78rem', marginTop: '6px' }}>
                    Bạn vẫn có thể gửi SOS khi chưa có GPS
                  </p>
                )}
              </>
            ) : (
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <CheckCircle2 size={52} color="#00843D" style={{ margin: '0 auto 16px', display: 'block' }} />
                  <h3 style={{ color: '#00843D', fontSize: '1.25rem', fontWeight: 800 }}>SOS TRANSMITTED</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px', fontWeight: 600 }}>
                  <Clock size={16} />
                  {formatElapsed(elapsed)} ELAPSED
                </div>

                {/* Alert link */}
                {publicToken && (
                  <div style={{ background: '#F8F8F8', border: '2px solid var(--text-primary)', padding: '20px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--accent-red)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
                      🔗 LIVE TRACKING LINK
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        readOnly
                        value={`${window.location.origin}/sos-alert/${publicToken}`}
                        style={{ flex: 1, background: '#FFFFFF', border: '1px solid #DDDDDD', padding: '10px', color: 'var(--accent-blue)', fontSize: '0.75rem', outline: 'none', fontWeight: 600 }}
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/sos-alert/${publicToken}`);
                        }}
                        style={{ background: 'var(--text-primary)', border: 'none', color: 'white', padding: '10px 16px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                      >
                        COPY
                      </button>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '12px', fontWeight: 500, lineHeight: 1.4 }}>
                      Gửi link này cho đội cứu hộ hoặc người thân để họ theo dõi vị trí trực tiếp của bạn.
                    </p>
                  </div>
                )}

                <button
                  onClick={() => { setSent(false); setSentTime(null); setElapsed(0); setPublicToken(null); }}
                  className="btn btn-danger"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                >
                  Gửi lại SOS
                </button>
              </div>
            )}
          </div>

          {/* Quick actions */}
          {location && (
            <div className="glass-card" style={{ padding: '24px' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                🗺️ NAVIGATION
              </p>
              <a
                href={googleDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  background: 'var(--accent-blue)',
                  padding: '16px',
                  color: 'white', textDecoration: 'none', fontSize: '0.85rem',
                  fontWeight: 700, marginBottom: '12px', transition: 'all 0.2s',
                  borderRadius: '4px'
                }}
              >
                <Navigation size={18} />
                GOOGLE MAPS DIRECTIONS
              </a>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  background: 'var(--neutral)', border: '2px solid var(--text-primary)',
                  padding: '16px',
                  color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.85rem',
                  fontWeight: 700, transition: 'all 0.2s',
                  borderRadius: '4px'
                }}
              >
                <MapPin size={18} />
                VIEW ON GOOGLE MAPS
              </a>
            </div>
          )}

          {/* Status info */}
          {sent && (
            <div className="glass-card" style={{ padding: '16px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#6ee7b7', marginBottom: '12px' }}>
                📨 Đã thông báo qua
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <Phone size={14} color="#10b981" /> SMS đến liên hệ khẩn cấp
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <Mail size={14} color="#10b981" /> Email kèm bản đồ đường đi
                </div>
                {location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <MapPin size={14} color="#10b981" /> GPS: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Mobile: responsive stacking ─── */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 700px) {
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
