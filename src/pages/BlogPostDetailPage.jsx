import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { ChevronLeft, Clock, User, Share2, Tag, BookOpen, Shield } from 'lucide-react';

export const BlogPostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await axiosClient.get(`/blog/${id}`);
        setPost(data);
      } catch (err) {
        console.error('Failed to fetch blog post', err);
        // Fallback for demo
        setPost({
          id,
          title: id === '1' ? 'Cách xử lý khi gặp người bị ngất xỉu đột ngột' : 'Hướng dẫn chi tiết kỹ năng phòng ngừa',
          content: `
            <p>Ngất xỉu là tình trạng mất ý thức tạm thời, thường do lưu lượng máu đến não bị giảm sút. Đây là một tình huống khẩn cấp thường gặp trong đời sống hàng ngày.</p>
            
            <h3>1. Nhận biết các dấu hiệu báo trước</h3>
            <ul>
              <li>Hoa mắt, chóng mặt, nhìn mờ.</li>
              <li>Vã mồ hôi lạnh, da tái nhợt.</li>
              <li>Buồn nôn hoặc cảm giác nóng bừng đột ngột.</li>
            </ul>

            <h3>2. Cách xử lý ngay lập tức</h3>
            <p>Khi thấy một người có dấu hiệu sắp ngất hoặc đã ngất, hãy thực hiện các bước sau:</p>
            <ol>
              <li><strong>Đặt người bệnh nằm ngửa:</strong> Nếu không có chấn thương, hãy đặt họ nằm trên mặt phẳng cứng và nâng chân cao khoảng 30cm để máu dồn về não.</li>
              <li><strong>Kiểm tra đường thở:</strong> Đảm bảo người bệnh vẫn đang thở bình thường. Nới lỏng quần áo, thắt lưng hoặc cà vạt.</li>
              <li><strong>Kích thích nhẹ:</strong> Có thể gọi to hoặc vỗ nhẹ vào vai. Tránh đổ nước vào mặt hoặc cho ngửi các chất kích thích mạnh.</li>
            </ol>

            <h3>3. Khi nào cần gọi cấp cứu?</h3>
            <p>Hãy gọi ngay 115 hoặc nhấn nút SOS trên ứng dụng ANVI nếu:</p>
            <ul>
              <li>Người bệnh không tỉnh lại sau 1 phút.</li>
              <li>Người bệnh có biểu hiện co giật hoặc khó thở.</li>
              <li>Người bệnh là phụ nữ mang thai hoặc người cao tuổi.</li>
            </ul>
          `,
          category: 'Sơ cứu',
          authorName: 'ANVI Expert',
          thumbnailUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1200',
          createdAt: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

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
        
        {axiosClient.defaults.headers.common['Authorization'] && (
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
        <h1 style={{fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.2, marginBottom: '20px'}}>{post.title}</h1>
        
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
