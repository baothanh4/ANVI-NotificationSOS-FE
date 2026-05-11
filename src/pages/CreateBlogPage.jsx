import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../contexts/AuthContext';
import { 
  ChevronLeft, Image as ImageIcon, FileText, Layout, 
  Send, Eye, Clock, User, CheckCircle2, AlertCircle, X, AlignLeft
} from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export const CreateBlogPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [newPost, setNewPost] = useState({ 
    title: '', 
    content: '', 
    excerpt: '', 
    category: 'Sơ cứu', 
    thumbnailUrl: '' 
  });

  const categories = ['Sơ cứu', 'Phòng ngừa', 'Sức khỏe', 'Tin tức'];

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'blockquote', 'code-block'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'link', 'blockquote', 'code-block',
    'color', 'background'
  ];

  const handleUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      setLoading(true);
      const res = await axiosClient.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setNewPost({ ...newPost, thumbnailUrl: res.fileDownloadUri });
    } catch (err) {
      alert('Tải ảnh thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosClient.post('/blog', newPost);
      alert(user?.role === 'ADMIN' ? 'Bài viết đã được đăng!' : 'Bài viết đã được gửi và đang chờ duyệt.');
      navigate('/blog');
    } catch (err) {
      alert('Đăng bài thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-blog-page" style={{ background: '#F8F9FA', minHeight: '100vh', paddingBottom: '80px' }}>
      <div className="container" style={{ paddingTop: '40px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <Link to="/blog" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', marginBottom: '12px' }}>
              <ChevronLeft size={18} /> QUAY LẠI BLOG
            </Link>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-0.04em', margin: 0 }}>
              VIẾT BÀI <span style={{ color: 'var(--accent-red)' }}>MỚI</span>
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
             <button onClick={() => navigate('/blog')} className="btn btn-outline" style={{ borderRadius: '16px', padding: '14px 28px' }}>HỦY BỎ</button>
             <button onClick={handleSubmit} disabled={loading} className="btn btn-primary" style={{ borderRadius: '16px', padding: '14px 32px', boxShadow: '0 8px 24px rgba(224, 32, 32, 0.3)' }}>
                <Send size={18} style={{ marginRight: '8px' }} /> {loading ? 'ĐANG ĐĂNG...' : 'XUẤT BẢN NGAY'}
             </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px', alignItems: 'start' }}>
          {/* Form Side */}
          <div style={{ background: 'white', padding: '40px', borderRadius: '32px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', border: '1px solid #eee' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Tiêu đề */}
              <div className="form-section">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#1A1A1A', marginBottom: '16px' }}>
                  <FileText size={20} color="var(--accent-blue)" /> TIÊU ĐỀ BÀI VIẾT
                </label>
                <input 
                  required
                  type="text"
                  placeholder="Nhập tiêu đề ấn tượng cho bài viết của bạn..."
                  value={newPost.title}
                  onChange={e => setNewPost({...newPost, title: e.target.value})}
                  style={{ 
                    width: '100%', 
                    padding: '20px', 
                    background: '#F9F9F9', 
                    border: '2px solid #F0F0F0', 
                    borderRadius: '18px', 
                    fontSize: '1.1rem', 
                    fontWeight: 700, 
                    transition: 'all 0.3s',
                    outline: 'none'
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'var(--accent-blue)';
                    e.target.style.background = 'white';
                    e.target.style.boxShadow = '0 0 0 4px rgba(0, 100, 210, 0.05)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = '#F0F0F0';
                    e.target.style.background = '#F9F9F9';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Danh mục & Ảnh */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="form-section">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#1A1A1A', marginBottom: '16px' }}>
                    <Layout size={20} color="var(--accent-blue)" /> DANH MỤC
                  </label>
                  <select 
                    value={newPost.category}
                    onChange={e => setNewPost({...newPost, category: e.target.value})}
                    style={{ width: '100%', padding: '20px', background: '#F9F9F9', border: '2px solid #F0F0F0', borderRadius: '18px', fontSize: '1rem', fontWeight: 600, appearance: 'none', cursor: 'pointer' }}
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="form-section">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#1A1A1A', marginBottom: '16px' }}>
                    <ImageIcon size={20} color="var(--accent-blue)" /> ẢNH BÌA (COVER)
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="file" 
                      id="blog-upload" 
                      style={{ display: 'none' }} 
                      onChange={e => handleUpload(e.target.files[0])}
                    />
                    <button 
                      type="button"
                      onClick={() => document.getElementById('blog-upload').click()}
                      style={{ flex: 1, padding: '18px', background: '#F9F9F9', border: '2px dashed #D0D0D0', borderRadius: '18px', color: '#666', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <ImageIcon size={18} /> TẢI ẢNH LÊN
                    </button>
                  </div>
                </div>
              </div>

              {/* Mô tả ngắn */}
              <div className="form-section">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#1A1A1A', marginBottom: '16px' }}>
                  <CheckCircle2 size={20} color="var(--accent-blue)" /> MÔ TẢ NGẮN
                </label>
                <textarea 
                  required
                  placeholder="Viết một đoạn ngắn tóm tắt nội dung để thu hút người đọc..."
                  value={newPost.excerpt}
                  onChange={e => setNewPost({...newPost, excerpt: e.target.value})}
                  style={{ 
                    width: '100%', 
                    padding: '20px', 
                    background: '#F9F9F9', 
                    border: '2px solid #F0F0F0', 
                    borderRadius: '18px', 
                    fontSize: '1rem', 
                    minHeight: '100px', 
                    resize: 'vertical',
                    transition: 'all 0.3s',
                    outline: 'none',
                    fontWeight: 500,
                    lineHeight: 1.6
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'var(--accent-blue)';
                    e.target.style.background = 'white';
                    e.target.style.boxShadow = '0 0 0 4px rgba(0, 100, 210, 0.05)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = '#F0F0F0';
                    e.target.style.background = '#F9F9F9';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Nội dung chính */}
              <div className="form-section">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#1A1A1A', marginBottom: '16px' }}>
                   <AlignLeft size={20} color="var(--accent-blue)" /> NỘI DUNG CHI TIẾT
                </label>
                <div className="quill-editor-wrapper" style={{ 
                  background: 'white', 
                  border: '2px solid #F0F0F0', 
                  borderRadius: '18px', 
                  overflow: 'hidden',
                  transition: 'all 0.3s'
                }}>
                  <ReactQuill 
                    theme="snow"
                    value={newPost.content}
                    onChange={(content) => setNewPost({...newPost, content})}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Bắt đầu viết nội dung bài viết của bạn tại đây..."
                    style={{ 
                      height: '400px', 
                      display: 'flex', 
                      flexDirection: 'column' 
                    }}
                  />
                </div>
                <p style={{ marginTop: '12px', color: '#888', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} color="#34C759" /> Trình soạn thảo tự động lưu định dạng và mã HTML cho bạn.
                </p>
              </div>
            </form>
          </div>

          {/* Preview Side */}
          <div style={{ position: 'sticky', top: '100px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#1A1A1A', marginBottom: '24px' }}>
              <Eye size={20} color="var(--accent-red)" /> XEM TRƯỚC GIAO DIỆN (LIVE PREVIEW)
            </div>
            
            {/* Blog Card Preview */}
            <div style={{ background: 'white', borderRadius: '28px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.1)', border: '1px solid #eee' }}>
              <div style={{ height: '220px', background: '#f0f0f0', position: 'relative', overflow: 'hidden' }}>
                {newPost.thumbnailUrl ? (
                  <img src={newPost.thumbnailUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                    <ImageIcon size={48} opacity={0.3} />
                  </div>
                )}
                <div style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', color: 'white', padding: '6px 14px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>
                  {newPost.category}
                </div>
              </div>
              <div style={{ padding: '32px' }}>
                <div style={{ display: 'flex', gap: '16px', color: '#999', fontSize: '0.8rem', fontWeight: 600, marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {new Date().toLocaleDateString('vi-VN')}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} /> {user?.fullName || 'Tác giả'}</div>
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '16px', color: '#1A1A1A' }}>{newPost.title || 'Tiêu đề bài viết sẽ hiển thị ở đây'}</h3>
                <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
                  {newPost.excerpt || 'Mô tả ngắn của bài viết sẽ giúp người dùng nhanh chóng hiểu được nội dung bạn muốn chia sẻ.'}
                </p>
                <div style={{ color: 'var(--accent-red)', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ĐỌC BÀI VIẾT <ChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px', background: 'rgba(52, 199, 89, 0.1)', padding: '20px', borderRadius: '20px', border: '1px dashed #34C759', color: '#2D8B41', fontSize: '0.9rem', fontWeight: 600 }}>
               ✨ Đây là giao diện người dùng sẽ nhìn thấy. Hãy đảm bảo ảnh bìa rõ nét và tiêu đề thật hấp dẫn nhé!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
