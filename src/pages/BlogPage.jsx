import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { BookOpen, Clock, ChevronRight, Search, Tag, Plus, Check, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const BlogPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const categories = ['All', 'Sơ cứu', 'Phòng ngừa', 'Sức khỏe', 'Tin tức'];

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await axiosClient.get('/blog');
      setPosts(data);
    } catch (err) {
      console.error('Failed to fetch blog posts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

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
            onClick={() => navigate('/blog/create')}
            className="btn btn-primary" 
            style={{marginTop: '20px', padding: '12px 24px', borderRadius: '30px'}}
          >
            <Plus size={18} /> VIẾT BÀI MỚI
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="categories-bar" style={{display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', paddingBottom: '20px', marginBottom: '40px'}}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: '14px 32px',
              borderRadius: '40px',
              border: 'none',
              background: filter === cat ? 'var(--accent-red)' : 'var(--glass-bg)',
              color: filter === cat ? 'white' : 'var(--text-primary)',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: filter === cat ? '0 8px 24px rgba(224, 32, 32, 0.4)' : '0 4px 16px rgba(0,0,0,0.08)'
            }}
            onMouseOver={e => {
              if (filter !== cat) e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{textAlign: 'center', padding: '50px'}}>Đang tải bài viết...</div>
      ) : (
        <div className="blog-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px'}}>
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
              <div className="card-image" style={{height: '240px', position: 'relative', overflow: 'hidden'}}>
                <img src={post.thumbnailUrl} alt={post.title} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(10px)',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'white'
                }}>
                  {post.category}
                </div>
              </div>
              <div className="card-content" style={{padding: '28px', flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '14px'}}>
                  <Clock size={16} /> {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                </div>
                <h3 style={{fontSize: '1.4rem', fontWeight: 850, marginBottom: '14px', lineHeight: 1.3, letterSpacing: '-0.01em'}}>{post.title}</h3>
                <p style={{fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px', flexGrow: 1}}>
                  {post.excerpt}
                </p>
                <div style={{display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-red)', fontWeight: 800, fontSize: '0.9rem'}}>
                  XEM CHI TIẾT <ChevronRight size={18} />
                </div>
              </div>
            </Link>
          ))}
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
