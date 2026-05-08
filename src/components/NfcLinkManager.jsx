import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axiosClient from '../api/axiosClient';
import { Smartphone, Copy, Check, ExternalLink, Info, ShieldCheck } from 'lucide-react';

export const NfcLinkManager = () => {
  const { user } = useAuth();
  const [shortCode, setShortCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShortCode = async () => {
      try {
        // Find the active QR card for the user
        const res = await axiosClient.get('/cards/my');
        if (res && res.length > 0) {
          // Get tokens for the first card
          const tokens = await axiosClient.get(`/cards/${res[0].id}/tokens`);
          if (tokens && tokens.length > 0) {
            setShortCode(tokens[0].shortCode);
          }
        }
      } catch (e) {
        console.error("Error fetching shortCode:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchShortCode();
  }, []);

  const profileUrl = `${window.location.origin}/p/${shortCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="text-center p-8">Đang tải cấu hình NFC...</div>;

  return (
    <div className="nfc-manager">
      <div className="nfc-intro">
        <div className="nfc-icon-wrapper">
          <Smartphone size={40} className="nfc-main-icon" />
          <div className="nfc-waves"></div>
        </div>
        <div className="nfc-text">
          <h3>HỒ SƠ CÁ NHÂN KỸ THUẬT SỐ</h3>
          <p>Sử dụng đường dẫn này để ghi vào thẻ NFC của bạn. Khi ai đó chạm điện thoại vào thẻ, hồ sơ giới thiệu của bạn sẽ hiện ra ngay lập tức.</p>
        </div>
      </div>

      {!shortCode ? (
        <div className="nfc-warning">
          <Info size={20} />
          <p>Bạn chưa có mã QR định danh. Vui lòng tạo thẻ cứu hộ trước để sử dụng tính năng này.</p>
        </div>
      ) : (
        <div className="nfc-content-box">
          <div className="url-display-card">
            <label>ĐƯỜNG DẪN HỒ SƠ NFC</label>
            <div className="url-input-group">
              <input type="text" value={profileUrl} readOnly />
              <button onClick={handleCopy} className={copied ? 'copied' : ''}>
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'ĐÃ CHÉP' : 'SAO CHÉP'}
              </button>
            </div>
          </div>

          <div className="nfc-steps">
            <h4>HƯỚNG DẪN TÍCH HỢP NFC</h4>
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-desc">
                <strong>Chuẩn bị thẻ NFC:</strong> Mua một thẻ hoặc sticker NFC (loại NTAG213/215 phổ biến).
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-desc">
                <strong>Cài đặt ứng dụng:</strong> Tải ứng dụng <strong>NFC Tools</strong> (trên App Store hoặc Play Store).
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-desc">
                <strong>Ghi dữ liệu:</strong> Chọn <i>Write</i> {'>'} <i>Add a record</i> {'>'} <i>URL</i>. Dán đường dẫn đã chép ở trên và chọn <i>Write</i>, sau đó chạm thẻ vào điện thoại.
              </div>
            </div>
          </div>

          <div className="nfc-preview-link">
            <a href={profileUrl} target="_blank" rel="noreferrer">
              XEM TRƯỚC GIAO DIỆN HỒ SƠ <ExternalLink size={14} />
            </a>
          </div>
        </div>
      )}

      <style>{`
        .nfc-manager { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .nfc-intro { display: flex; gap: 24px; align-items: center; margin-bottom: 32px; background: #F8F9FA; padding: 24px; border-radius: 20px; border: 1px solid #F2F2F7; }
        .nfc-icon-wrapper { position: relative; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; background: white; border-radius: 16px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .nfc-main-icon { color: var(--accent-blue); z-index: 2; }
        .nfc-waves { position: absolute; width: 100%; height: 100%; border: 2px solid var(--accent-blue); border-radius: 16px; animation: pulse 2s infinite; opacity: 0; }
        @keyframes pulse { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(1.5); opacity: 0; } }

        .nfc-text h3 { margin: 0; font-size: 1.1rem; font-weight: 900; color: #1C1C1E; }
        .nfc-text p { margin: 4px 0 0; font-size: 0.85rem; color: #8E8E93; line-height: 1.5; }

        .url-display-card { background: white; padding: 24px; border-radius: 20px; border: 2px solid #F2F2F7; margin-bottom: 32px; }
        .url-display-card label { display: block; font-size: 0.7rem; font-weight: 900; color: #8E8E93; margin-bottom: 12px; letter-spacing: 0.05em; }
        .url-input-group { display: flex; gap: 12px; }
        .url-input-group input { flex: 1; padding: 14px; background: #F8F9FA; border: 1px solid #E5E5EA; border-radius: 10px; font-weight: 600; font-size: 0.9rem; color: #1C1C1E; outline: none; }
        .url-input-group button { display: flex; align-items: center; gap: 8px; background: #1C1C1E; color: white; border: none; padding: 0 20px; border-radius: 10px; font-weight: 800; font-size: 0.8rem; cursor: pointer; transition: all 0.2s; }
        .url-input-group button:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .url-input-group button.copied { background: #34C759; }

        .nfc-steps { background: #FDFDFD; padding: 24px; border-radius: 20px; border: 1px dashed #E5E5EA; }
        .nfc-steps h4 { margin: 0 0 20px; font-size: 0.9rem; font-weight: 900; color: #1C1C1E; text-align: center; }
        .step-item { display: flex; gap: 16px; margin-bottom: 16px; }
        .step-number { width: 28px; height: 28px; background: var(--accent-blue); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 0.8rem; flex-shrink: 0; }
        .step-desc { font-size: 0.85rem; color: #48484A; line-height: 1.5; }
        .step-desc strong { color: #1C1C1E; }

        .nfc-preview-link { text-align: center; margin-top: 24px; }
        .nfc-preview-link a { color: var(--accent-blue); text-decoration: none; font-weight: 800; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 6px; }
        .nfc-preview-link a:hover { text-decoration: underline; }

        .nfc-warning { display: flex; gap: 12px; background: #FFF9F0; color: #FF9500; padding: 20px; border-radius: 16px; border: 1px solid #FFEBCD; font-weight: 600; font-size: 0.9rem; }
      `}</style>
    </div>
  );
};
