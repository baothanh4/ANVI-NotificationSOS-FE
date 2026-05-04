import React, { useState } from 'react';
import { Download, Image as ImageIcon } from 'lucide-react';

export const LockscreenGenerator = () => {
  const [shortCode, setShortCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!shortCode.trim()) return;

    setLoading(true);
    // The backend endpoint is: http://localhost:8081/api/qr/{shortCode}/lockscreen
    // Add timestamp to bypass browser cache if user generates multiple times
    const url = `http://localhost:8081/api/qr/${shortCode.trim()}/lockscreen?t=${Date.now()}`;
    setImageUrl(url);
    setLoading(false);
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      // Fetch the image as a blob to force download instead of opening in new tab
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `ANVI_Lockscreen_${shortCode}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error("Lỗi khi tải ảnh:", e);
      // Fallback
      window.open(imageUrl, '_blank');
    }
  };

  return (
    <div>
      <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px'}}>Thẻ & QR Code (Màn hình khóa)</h2>
      <p style={{color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6'}}>
        Nhập mã thẻ ANVI (ShortCode) của bạn để tạo ảnh nền khóa điện thoại. Hình nền này chứa mã QR tích hợp với cảnh báo y tế nổi bật, giúp người đi đường dễ dàng quét và liên hệ người thân khi bạn gặp sự cố.
      </p>

      <form onSubmit={handleGenerate} style={{display: 'flex', gap: '12px', marginBottom: '32px'}}>
        <input 
          type="text" 
          placeholder="Nhập mã thẻ (VD: demo123)" 
          value={shortCode}
          onChange={(e) => setShortCode(e.target.value)}
          required
          style={{flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)'}}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{background: '#3b82f6', color: 'white', padding: '0 24px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'}}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <ImageIcon size={20} /> Tạo Ảnh
        </button>
      </form>

      {imageUrl && (
        <div style={{textAlign: 'center', background: 'var(--bg-secondary)', padding: '32px', borderRadius: '16px', border: '1px solid var(--glass-border)'}}>
          <h3 style={{fontWeight: 'bold', marginBottom: '24px', color: '#10b981', fontSize: '1.25rem'}}>Tạo ảnh thành công!</h3>
          
          <div style={{maxWidth: '300px', margin: '0 auto', border: '8px solid #334155', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', marginBottom: '32px', aspectRatio: '9/16'}}>
            <img 
              src={imageUrl} 
              alt="Lockscreen Preview" 
              style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} 
            />
          </div>

          <button 
            onClick={handleDownload}
            style={{background: '#10b981', color: 'white', padding: '14px 32px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', transition: 'all 0.2s', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'}}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <Download size={20} /> Tải Xuống Ảnh
          </button>
        </div>
      )}
    </div>
  );
};
