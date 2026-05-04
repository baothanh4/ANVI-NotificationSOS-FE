import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Trash2, UploadCloud } from 'lucide-react';

export const MedicalDocumentsManager = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const fetchDocuments = async () => {
    if (!user || !user.id) return;
    try {
      const res = await axiosClient.get(`/documents/users/${user.id}`);
      setDocuments(res || []);
    } catch (e) {
      console.error(e);
      setError('Lỗi khi tải danh sách tài liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!user || !user.id) {
      alert("Không tìm thấy thông tin người dùng.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setError('');

    try {
      await axiosClient.post(`/documents/users/${user.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      await fetchDocuments();
      e.target.value = null; // reset input
    } catch (err) {
      setError('Lỗi khi tải lên: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá tài liệu này?')) return;
    try {
      await axiosClient.delete(`/documents/${id}`);
      await fetchDocuments();
    } catch (err) {
      alert('Lỗi khi xoá: ' + err.message);
    }
  };

  if (loading) return <div>Đang tải tài liệu...</div>;

  return (
    <div>
      <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px'}}>Quản lý Tài liệu y tế</h2>
      <p style={{color: 'var(--text-secondary)', marginBottom: '24px'}}>
        Tải lên đơn thuốc, kết quả xét nghiệm, X-quang... để bác sĩ có thể xem khi cấp cứu.
      </p>

      {error && <div style={{color: '#ef4444', marginBottom: '16px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px'}}>{error}</div>}

      <div style={{marginBottom: '24px'}}>
        <label className="btn" style={{background: '#3b82f6', color: 'white', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', transition: 'all 0.2s'}} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
          <UploadCloud size={20} />
          {uploading ? 'Đang tải lên...' : 'Tải tài liệu lên (PDF, JPG, PNG)'}
          <input 
            type="file" 
            accept=".pdf,image/png,image/jpeg" 
            style={{display: 'none'}} 
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
        {documents.length === 0 ? (
          <p style={{color: 'var(--text-secondary)', textAlign: 'center', padding: '24px', border: '1px dashed var(--glass-border)', borderRadius: '8px'}}>Chưa có tài liệu nào.</p>
        ) : (
          documents.map(doc => (
            <div key={doc.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--glass-border)'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                <FileText size={24} color="#3b82f6" />
                <div>
                  <div style={{fontWeight: 'bold', color: 'var(--text-primary)'}}>{doc.fileName}</div>
                  <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>
                    {new Date(doc.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>
              <div style={{display: 'flex', gap: '12px'}}>
                <a 
                  href={`http://localhost:8081/api/documents/download/${doc.fileUrl.split('/').pop()}`}
                  target="_blank" 
                  rel="noreferrer"
                  style={{color: '#3b82f6', textDecoration: 'none', padding: '8px 16px', border: '1px solid #3b82f6', borderRadius: '8px', fontWeight: 'bold'}}
                >
                  Tải về
                </a>
                <button 
                  onClick={() => handleDelete(doc.id)}
                  style={{background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center'}}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
