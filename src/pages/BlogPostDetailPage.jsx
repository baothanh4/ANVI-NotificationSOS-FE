import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { ChevronLeft, Clock, User, Share2, Tag, BookOpen, Shield, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const BlogPostDetailPage = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const data = await axiosClient.get(`/blog/${id}`);
      setPost(data);
    } catch (err) {
      console.error('Failed to fetch blog post', err);
      // Fallback logic...
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const handleApprove = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn duyệt bài viết này?')) return;
    setApproving(true);
    try {
      await axiosClient.patch(`/blog/${id}/approve`);
      alert('Đã duyệt bài viết thành công!');
      fetchPost(); // Refresh post status
    } catch (err) {
      alert('Duyệt bài thất bại.');
    } finally {
      setApproving(false);
    }
  };

  if (loading) return <div style={{textAlign: 'center', padding: '100px'}}>Đang tải nội dung...</div>;
  if (!post) return <div style={{textAlign: 'center', padding: '100px'}}>Không tìm thấy bài viết.</div>;

  return (
    <div className="blog-post-detail" style={{maxWidth: '800px', margin: '0 auto', paddingBottom: '60px'}}>
      <div style={{display: 'flex', gap: '20px', marginBottom: '24px'}}>
        <button 
          onClick={() => navigate('/blog')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', 
            color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 700, padding: '0'
          }}
        >
          <ChevronLeft size={20} /> QUAY LẠI BLOG
        </button>
        
        {user?.role === 'ADMIN' && (
          <button 
            onClick={() => navigate('/admin')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', 
              color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: 700, padding: '0'
            }}
          >
            <Shield size={20} /> QUAY LẠI QUẢN TRỊ
          </button>
        )}
      </div>

      <div className="post-header" style={{marginBottom: '32px'}}>
        <div style={{
          display: 'inline-block',
          background: 'var(--accent-red)',
          color: 'white',
          padding: '4px 16px',
          borderRadius: '12px',
          fontSize: '0.875rem',
          fontWeight: 800,
          marginBottom: '16px'
        }}>
          {post.category}
        </div>
        
        <div style={{display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '20px'}}>
          <h1 style={{fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.2, margin: 0}}>{post.title}</h1>
          {user?.role === 'ADMIN' && post.status === 'PENDING' && (
            <button 
              onClick={handleApprove}
              disabled={approving}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--success)', 
                color: 'white', border: 'none', borderRadius: '12px', padding: '8px 16px',
                cursor: 'pointer', fontWeight: 800, fontSize: '0.8rem',
                boxShadow: '0 4px 12px rgba(52, 199, 89, 0.3)',
                height: 'fit-content'
              }}
            >
              <Check size={16} /> {approving ? 'ĐANG DUYỆT...' : 'DUYỆT BÀI'}
            </button>
          )}
        </div>
        
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '24px', color: 'var(--text-secondary)', fontSize: '0.9rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '24px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <User size={18} /> {post.authorName || 'Ban biên tập ANVI'}
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <Clock size={18} /> {new Date(post.createdAt).toLocaleDateString('vi-VN')}
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto'}}>
            <Share2 size={18} style={{cursor: 'pointer'}} /> CHIA SẺ
          </div>
        </div>
      </div>

      <div className="post-thumbnail" style={{
        width: '100%', 
        borderRadius: '32px', 
        overflow: 'hidden', 
        marginBottom: '40px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        <img 
          src={post.thumbnailUrl} 
          alt={post.title} 
          style={{
            width: '100%', 
            height: 'auto', 
            display: 'block',
            imageRendering: '-webkit-optimize-contrast',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden'
          }} 
        />
      </div>

      <div className="post-content" style={{
        fontSize: '1.125rem', 
        lineHeight: 1.8, 
        color: 'var(--text-primary)',
      }}
      dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <div className="post-footer" style={{marginTop: '60px', padding: '32px', background: 'var(--glass-bg)', borderRadius: '24px', border: '1px solid var(--glass-border)'}}>
        <h3 style={{marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px'}}>
          <BookOpen color="var(--accent-red)" /> Bạn thấy thông tin này hữu ích?
        </h3>
        <p style={{color: 'var(--text-secondary)', marginBottom: '24px'}}>Hãy chia sẻ kiến thức này cho người thân và bạn bè để cùng nhau xây dựng một cộng đồng an toàn hơn.</p>
        <div style={{display: 'flex', gap: '12px'}}>
          <button className="btn btn-primary" style={{padding: '12px 24px'}}>CHIA SẺ NGAY</button>
          <Link to="/blog" className="btn btn-outline" style={{padding: '12px 24px'}}>ĐỌC THÊM BÀI KHÁC</Link>
        </div>
      </div>
    </div>
  );
};
