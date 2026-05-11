import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { BookOpen, Clock, ChevronRight, Search, Plus, ArrowRight, Tag } from 'lucide-react';
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

  const filteredPosts = filter === 'All' ? posts : posts.filter(p => p.category === filter);

  return (
    <div className="blog-page-medical" style={{animation: 'fadeIn 0.8s ease-out', paddingBottom: '100px'}}>
      {/* Header Section */}
      <div style={{background: 'var(--primary-blue)', color: 'white', padding: '100px 0', marginBottom: '60px'}}>
        <div className="medical-container">
          <div style={{maxWidth: '800px'}}>
            <h1 style={{fontSize: '3.5rem', fontWeight: 950, color: 'white', letterSpacing: '-0.04em', marginBottom: '20px'}}>KIẾN THỨC CỨU HỘ & Y HỌC</h1>
            <p style={{fontSize: '1.2rem', opacity: 0.9, lineHeight: 1.6}}>Cổng thông tin chuyên sâu về kỹ năng sơ cấp cứu, phòng ngừa rủi ro và các cập nhật mới nhất từ đội ngũ chuyên gia ANVI-SOS.</p>
            
            {user && (
              <button onClick={() => navigate('/blog/create')} className="btn-medical" style={{background: 'white', color: 'var(--primary-blue)', marginTop: '30px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                <Plus size={20} /> VIẾT BÀI MỚI
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="medical-container">
        {/* Categories Bar */}
        <div style={{display: 'flex', gap: '12px', marginBottom: '50px', overflowX: 'auto', paddingBottom: '10px'}}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                padding: '12px 30px',
                borderRadius: '50px',
                border: filter === cat ? 'none' : '1px solid #DDD',
                background: filter === cat ? 'var(--primary-blue)' : 'white',
                color: filter === cat ? 'white' : '#666',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{textAlign: 'center', padding: '100px', fontSize: '1.2rem', color: '#999'}}>Đang tải bài viết y học...</div>
        ) : (
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px'}}>
            {filteredPosts.map(post => (
              <Link to={`/blog/${post.id}`} key={post.id} style={{textDecoration: 'none', color: 'inherit'}}>
                <div className="medical-post-card">
                  <div className="post-thumb">
                    <img src={post.thumbnailUrl || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=400'} alt={post.title} />
                    <div className="post-category-tag">{post.category || 'Y HỌC'}</div>
                  </div>
                  <div className="post-body">
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#999', fontSize: '0.8rem', marginBottom: '15px', fontWeight: 600}}>
                      <Clock size={14} /> {new Date(post.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                    </div>
                    <h3>{post.title}</h3>
                    <p>{post.excerpt}</p>
                    <div className="post-footer">
                      XEM CHI TIẾT <ArrowRight size={18} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {filteredPosts.length === 0 && !loading && (
          <div style={{textAlign: 'center', padding: '100px 20px', background: 'white', borderRadius: '32px', border: '1px dashed #DDD'}}>
            <BookOpen size={48} color="#CCC" style={{marginBottom: '20px'}} />
            <h3 style={{fontSize: '1.5rem', color: '#333'}}>Chưa có bài viết trong mục này</h3>
            <p style={{color: '#999'}}>Vui lòng chọn danh mục khác hoặc quay lại sau.</p>
          </div>
        )}
      </div>

      <style>{`
        .medical-post-card {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          transition: all 0.3s;
          height: 100%;
          display: flex;
          flex-direction: column;
          border: 1px solid transparent;
        }
        .medical-post-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          border-color: #EEE;
        }
        .post-thumb { height: 240px; position: relative; overflow: hidden; }
        .post-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
        .medical-post-card:hover .post-thumb img { transform: scale(1.1); }
        .post-category-tag {
          position: absolute;
          top: 20px;
          right: 20px;
          background: white;
          color: var(--primary-blue);
          padding: 6px 16px;
          border-radius: 10px;
          font-weight: 800;
          font-size: 0.7rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          text-transform: uppercase;
        }
        .post-body { padding: 30px; flex: 1; display: flex; flex-direction: column; }
        .post-body h3 { font-size: 1.4rem; margin: 0 0 15px 0; line-height: 1.3; color: #1A1A1A; }
        .post-body p { color: #666; font-size: 0.95rem; line-height: 1.6; margin-bottom: 25px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .post-footer { margin-top: auto; display: flex; align-items: center; justify-content: space-between; color: var(--primary-blue); font-weight: 800; font-size: 0.9rem; padding-top: 20px; border-top: 1px solid #F5F5F5; }
      `}</style>
    </div>
  );
};
