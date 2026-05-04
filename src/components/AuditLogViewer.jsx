import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

export const AuditLogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axiosClient.get('/audit/my');
        setLogs(res || []);
      } catch (e) {
        console.error("No audit logs found or error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return <div>Đang tải lịch sử...</div>;

  return (
    <div>
      <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px'}}>Lịch sử truy cập (Audit Logs)</h2>
      <p style={{color: 'var(--text-secondary)', marginBottom: '24px'}}>Xem lại lịch sử những người đã quét mã QR của bạn và thời điểm kích hoạt khẩn cấp.</p>
      
      {logs.length === 0 ? (
        <p style={{textAlign: 'center', color: 'var(--text-secondary)', padding: '24px'}}>Chưa có bản ghi nào.</p>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
          {logs.map((log) => (
            <div key={log.id} style={{padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', borderLeft: log.eventType === 'SOS_TRIGGERED' ? '4px solid #ef4444' : '4px solid #3b82f6', borderTop: '1px solid var(--glass-border)', borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                <span style={{fontWeight: 'bold', color: log.eventType === 'SOS_TRIGGERED' ? '#ef4444' : 'var(--text-primary)'}}>
                  {log.eventType === 'SOS_TRIGGERED' ? 'Cảnh báo khẩn cấp (SOS)' : log.eventType === 'QR_SCANNED' ? 'Quét mã QR' : log.eventType}
                </span>
                <span style={{fontSize: '0.875rem', color: 'var(--text-secondary)'}}>
                  {new Date(log.createdAt || log.timestamp).toLocaleString('vi-VN')}
                </span>
              </div>
              <div style={{fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px'}}>
                <div><strong style={{color: 'var(--text-primary)'}}>IP:</strong> {log.ipAddress || 'N/A'}</div>
                <div><strong style={{color: 'var(--text-primary)'}}>Thiết bị:</strong> {log.userAgent || log.deviceFingerprint || 'N/A'}</div>
                {log.locationDetails && <div style={{gridColumn: '1 / -1'}}><strong style={{color: 'var(--text-primary)'}}>Vị trí:</strong> {log.locationDetails}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
