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
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);
    mapInstanceRef.current = map;
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
              background:linear-gradient(135deg,#ef4444,#dc2626);
              border:3px solid white;
              box-shadow:0 0 0 4px rgba(239,68,68,0.3), 0 4px 12px rgba(0,0,0,0.4);
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
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h1 style={{ color: '#ef4444', fontSize: '1.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <Zap size={28} /> Hệ thống SOS Khẩn Cấp
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>
          Nhấn nút SOS để gửi cảnh báo đến tất cả liên hệ khẩn cấp kèm vị trí GPS
        </p>
      </div>

      {/* ─── Grid layout: Map + SOS button ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>

        {/* MAP */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '16px' }}>
          {/* Map header */}
          <div style={{ padding: '14px 20px', background: 'rgba(15,23,42,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.95rem' }}>
              <MapPin size={18} color="#ef4444" />
              <span>Vị trí Live</span>
              {gpsStatus === 'found' && (
                <span style={{ background: '#10b981', color: 'white', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '20px', fontWeight: 700 }}>● LIVE</span>
              )}
              {gpsStatus === 'acquiring' && (
                <span style={{ background: '#f59e0b', color: 'white', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '20px', fontWeight: 700 }}>⟳ XÁC ĐỊNH...</span>
              )}
            </div>
            {location && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                ~{Math.round(location.accuracy)}m chính xác
              </div>
            )}
          </div>

          {/* Map container */}
          <div ref={mapRef} style={{ height: '380px', width: '100%' }} />

          {/* Coordinates */}
          {location && (
            <div style={{ padding: '12px 20px', background: 'rgba(15,23,42,0.6)', display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
              <span>📍 {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</span>
              <span>📏 {locationHistory.length} điểm • {totalDistance > 0 ? `${totalDistance.toFixed(0)}m di chuyển` : 'đứng yên'}</span>
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
                <div style={{ marginBottom: '16px' }}>
                  <CheckCircle2 size={52} color="#10b981" style={{ margin: '0 auto 12px', display: 'block' }} />
                  <h3 style={{ color: '#10b981', fontSize: '1.1rem' }}>✓ SOS đã gửi!</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
                  <Clock size={14} />
                  {formatElapsed(elapsed)} trước
                </div>

                {/* Alert link */}
                {publicToken && (
                  <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '12px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#fca5a5', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                      🔗 Link xem vị trí live
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        readOnly
                        value={`${window.location.origin}/sos-alert/${publicToken}`}
                        style={{ flex: 1, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 10px', color: '#93c5fd', fontSize: '0.75rem', outline: 'none' }}
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/sos-alert/${publicToken}`);
                        }}
                        style={{ background: '#3b82f6', border: 'none', color: 'white', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}
                      >
                        Copy
                      </button>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                      Liên hệ khẩn cấp nhận link này qua SMS/Email để theo dõi vị trí của bạn.
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
            <div className="glass-card" style={{ padding: '16px' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                🗺️ Điều hướng nhanh
              </p>
              <a
                href={googleDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
                  borderRadius: '10px', padding: '12px 14px',
                  color: '#93c5fd', textDecoration: 'none', fontSize: '0.875rem',
                  fontWeight: 600, marginBottom: '8px', transition: 'all 0.2s',
                }}
              >
                <Navigation size={16} />
                Đường đi đến đây (Google Maps)
              </a>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
                  borderRadius: '10px', padding: '12px 14px',
                  color: '#6ee7b7', textDecoration: 'none', fontSize: '0.875rem',
                  fontWeight: 600, transition: 'all 0.2s',
                }}
              >
                <MapPin size={16} />
                Xem vị trí trên Google Maps
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
