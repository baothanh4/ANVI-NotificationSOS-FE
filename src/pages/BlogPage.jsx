import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { BookOpen, Clock, ChevronRight, Search, Tag, Plus, Check, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const BlogPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [showEditor, setShowEditor] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', excerpt: '', category: 'Sơ cứu', thumbnailUrl: '' });
  const [submitting, setSubmitting] = useState(false);

  const categories = ['All', 'Sơ cứu', 'Phòng ngừa', 'Sức khỏe', 'Tin tức'];

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await axiosClient.get('/blog');
      setPosts(data);
    } catch (err) {
      console.error('Failed to fetch blog posts', err);
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axiosClient.post('/blog', newPost);
      setShowEditor(false);
      setNewPost({ title: '', content: '', excerpt: '', category: 'Sơ cứu', thumbnailUrl: '' });
      fetchPosts();
      alert(user?.role === 'ADMIN' ? 'Bài viết đã được đăng!' : 'Bài viết đã được gửi và đang chờ duyệt.');
    } catch (err) {
      alert('Đăng bài thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (postId) => {
    try {
      await axiosClient.patch(`/blog/${postId}/approve`);
      fetchPosts();
    } catch (err) {
      alert('Duyệt bài thất bại.');
    }
  };

  const filteredPosts = filter === 'All' ? posts : posts.filter(p => p.category === filter);

  return (
    <div className="blog-page" style={{paddingBottom: '60px'}}>
      <div className="blog-header" style={{textAlign: 'center', marginBottom: '40px', marginTop: '20px'}}>
        <h1 style={{fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.02em'}}>ANVI <span style={{color: 'var(--accent-red)'}}>BLOG</span></h1>
        <p style={{color: 'var(--text-secondary)', maxWidth: '600px', margin: '10px auto'}}>Chia sẻ kiến thức, kỹ năng sơ cứu và phòng ngừa rủi ro để bảo vệ bản thân và cộng đồng.</p>
        
        {user && (
          <button 
            onClick={() => setShowEditor(true)}
            className="btn btn-primary" 
            style={{marginTop: '20px', padding: '12px 24px', borderRadius: '30px'}}
          >
            <Plus size={18} /> VIẾT BÀI MỚI
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="categories-bar" style={{display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '20px', marginBottom: '30px'}}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: '10px 24px',
              borderRadius: '30px',
              border: 'none',
              background: filter === cat ? 'var(--accent-red)' : 'var(--glass-bg)',
              color: filter === cat ? 'white' : 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{textAlign: 'center', padding: '50px'}}>Đang tải bài viết...</div>
      ) : (
        <div className="blog-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '30px'}}>
          {filteredPosts.map(post => (
            <Link to={`/blog/${post.id}`} key={post.id} className="blog-card" style={{
              textDecoration: 'none',
              color: 'inherit',
              background: 'var(--glass-bg)',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              border: '1px solid var(--glass-border)',
              transition: 'transform 0.3s ease',
              display: 'flex',
              flexDirection: 'column'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-10px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div className="card-image" style={{height: '200px', position: 'relative', overflow: 'hidden'}}>
                <img src={post.thumbnailUrl} alt={post.title} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(10px)',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'white'
                }}>
                  {post.category}
                </div>
              </div>
              <div className="card-content" style={{padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '12px'}}>
                  <Clock size={14} /> {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                </div>
                <h3 style={{fontSize: '1.25rem', fontWeight: 800, marginBottom: '12px', lineHeight: 1.4}}>{post.title}</h3>
                <p style={{fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px', flexGrow: 1}}>
                  {post.excerpt}
                </p>
                <div style={{display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-red)', fontWeight: 800, fontSize: '0.875rem'}}>
                  XEM CHI TIẾT <ChevronRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {showEditor && (
        <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'}}>
          <div className="modal-content" style={{background: '#1a1a1a', width: '100%', maxWidth: '800px', borderRadius: '32px', padding: '40px', position: 'relative', maxHeight: '90vh', overflowY: 'auto'}}>
            <button onClick={() => setShowEditor(false)} style={{position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer'}}><X size={24} /></button>
            <h2 style={{marginBottom: '24px', fontWeight: 900}}>VIẾT BÀI CHIA SẺ MỚI</h2>
            
            <form onSubmit={handleCreatePost} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
              <div className="form-group">
                <label style={{display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.875rem'}}>TIÊU ĐỀ BÀI VIẾT</label>
                <input 
                  required
                  type="text" 
                  value={newPost.title} 
                  onChange={e => setNewPost({...newPost, title: e.target.value})}
                  style={{width: '100%', padding: '16px', background: '#262626', border: '1px solid #404040', borderRadius: '16px', color: 'white'}}
                  placeholder="Nhập tiêu đề thu hút..."
                />
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                <div className="form-group">
                  <label style={{display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.875rem'}}>DANH MỤC</label>
                  <select 
                    value={newPost.category} 
                    onChange={e => setNewPost({...newPost, category: e.target.value})}
                    style={{width: '100%', padding: '16px', background: '#262626', border: '1px solid #404040', borderRadius: '16px', color: 'white'}}
                  >
                    {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label style={{display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.875rem'}}>URL ẢNH BÌA</label>
                  <input 
                    type="text" 
                    value={newPost.thumbnailUrl} 
                    onChange={e => setNewPost({...newPost, thumbnailUrl: e.target.value})}
                    style={{width: '100%', padding: '16px', background: '#262626', border: '1px solid #404040', borderRadius: '16px', color: 'white'}}
                    placeholder="https://example.com/image.jpg"
                  />
                  {newPost.thumbnailUrl && (
                    <div style={{marginTop: '12px', borderRadius: '12px', overflow: 'hidden', height: '120px', border: '1px solid #404040'}}>
                      <img src={newPost.thumbnailUrl} alt="Preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label style={{display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.875rem'}}>MÔ TẢ NGẮN (EXCERPT)</label>
                <textarea 
                  required
                  value={newPost.excerpt} 
                  onChange={e => setNewPost({...newPost, excerpt: e.target.value})}
                  style={{width: '100%', padding: '16px', background: '#262626', border: '1px solid #404040', borderRadius: '16px', color: 'white', minHeight: '80px'}}
                  placeholder="Tóm tắt nội dung bài viết..."
                />
              </div>

              <div className="form-group">
                <label style={{display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.875rem'}}>NỘI DUNG CHI TIẾT (HTML)</label>
                <textarea 
                  required
                  value={newPost.content} 
                  onChange={e => setNewPost({...newPost, content: e.target.value})}
                  style={{width: '100%', padding: '16px', background: '#262626', border: '1px solid #404040', borderRadius: '16px', color: 'white', minHeight: '200px', fontFamily: 'monospace'}}
                  placeholder="Sử dụng thẻ <p>, <h3>, <ul> để định dạng..."
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="btn btn-primary" 
                style={{width: '100%', padding: '18px', borderRadius: '16px', fontWeight: 800, marginTop: '10px'}}
              >
                {submitting ? 'ĐANG XỬ LÝ...' : (user?.role === 'ADMIN' ? 'ĐĂNG BÀI NGAY' : 'GỬI BÀI CHỜ DUYỆT')}
              </button>
            </form>
          </div>
        </div>
      )}

      {filteredPosts.length === 0 && !loading && (
        <div style={{textAlign: 'center', padding: '100px 20px', background: 'var(--glass-bg)', borderRadius: '24px', marginTop: '40px'}}>
          <BookOpen size={48} color="var(--text-secondary)" style={{marginBottom: '16px'}} />
          <h3>Chưa có bài viết nào</h3>
          <p style={{color: 'var(--text-secondary)'}}>Vui lòng quay lại sau để cập nhật những kiến thức mới nhất.</p>
        </div>
      )}
    </div>
  );
};
