import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { 
  Users, BookOpen, Shield, Plus, Check, X, AlertCircle, 
  Search, Mail, Phone, UserPlus, Filter, Trash2
} from 'lucide-react';

export const AdminPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('blog');
  const [blogPosts, setBlogPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New user form state
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ fullName: '', phone: '', email: '', password: '', role: 'DOCTOR' });
  const [submittingUser, setSubmittingUser] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'blog') {
        const data = await axiosClient.get('/blog');
        setBlogPosts(data);
      } else if (activeTab === 'users') {
        const data = await axiosClient.get('/users/admin/all');
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleApproveBlog = async (id) => {
    try {
      await axiosClient.patch(`/blog/${id}/approve`);
      fetchData();
    } catch (err) {
      alert('Duyệt bài thất bại');
    }
  };

  const handleDeleteBlog = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) return;
    try {
      await axiosClient.delete(`/blog/${id}`);
      fetchData();
    } catch (err) {
      alert('Xóa bài thất bại');
    }
  };

  const handleCreateInternalUser = async (e) => {
    e.preventDefault();
    setSubmittingUser(true);
    try {
      await axiosClient.post('/users/admin/create-internal', newUser);
      setShowUserModal(false);
      setNewUser({ fullName: '', phone: '', email: '', password: '', role: 'DOCTOR' });
      fetchData();
      alert('Đã tạo tài khoản nội bộ thành công!');
    } catch (err) {
      alert(err.response?.data?.message || 'Tạo tài khoản thất bại');
    } finally {
      setSubmittingUser(false);
    }
  };

  return (
    <div className="admin-page" style={{padding: '30px 0'}}>
      <div className="admin-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px'}}>
        <div>
          <h1 style={{fontSize: '2.5rem', fontWeight: 900}}>ADMIN <span style={{color: 'var(--accent-blue)'}}>CENTER</span></h1>
          <p style={{color: 'var(--text-secondary)'}}>Quản lý nội dung và tài khoản hệ thống ANVI-SOS</p>
        </div>
        <div className="admin-tabs" style={{display: 'flex', gap: '10px', background: '#F2F2F7', padding: '6px', borderRadius: '16px'}}>
          <button 
            onClick={() => setActiveTab('blog')}
            style={{
              padding: '10px 24px', borderRadius: '12px', border: 'none', 
              background: activeTab === 'blog' ? 'white' : 'transparent',
              fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: activeTab === 'blog' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <BookOpen size={18} /> BLOGS
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            style={{
              padding: '10px 24px', borderRadius: '12px', border: 'none', 
              background: activeTab === 'users' ? 'white' : 'transparent',
              fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: activeTab === 'users' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <Users size={18} /> USERS
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{textAlign: 'center', padding: '100px'}}>Đang tải dữ liệu hệ thống...</div>
      ) : (
        <div className="admin-content">
          {activeTab === 'blog' ? (
            <div className="blog-management">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
                <h3 style={{fontWeight: 800}}>DANH SÁCH BÀI VIẾT</h3>
                <div style={{display: 'flex', gap: '12px'}}>
                  <div style={{position: 'relative'}}>
                    <Search size={18} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)'}} />
                    <input type="text" placeholder="Tìm kiếm bài viết..." style={{padding: '10px 12px 10px 40px', borderRadius: '12px', border: '1px solid #E5E5E5', background: 'white'}} />
                  </div>
                </div>
              </div>

              <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                {blogPosts.map(post => (
                  <div 
                    key={post.id} 
                    className="admin-list-item" 
                    onClick={() => navigate(`/blog/${post.id}`)}
                    style={{
                      display: 'flex', alignItems: 'center', background: 'white', padding: '20px', 
                      borderRadius: '20px', border: '1px solid #E5E5E5', gap: '20px', cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{width: '100px', height: '60px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0}}>
                      <img src={post.thumbnailUrl || 'https://via.placeholder.com/100x60'} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    </div>
                    <div style={{flex: 1}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px'}}>
                        <span style={{fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-red)', background: '#FFF1F0', padding: '2px 8px', borderRadius: '6px'}}>{post.category.toUpperCase()}</span>
                        {post.status === 'PENDING' && <span style={{fontSize: '0.7rem', fontWeight: 800, color: '#856404', background: '#FFF3CD', padding: '2px 8px', borderRadius: '6px'}}>WAITING</span>}
                      </div>
                      <h4 style={{margin: 0, fontSize: '1.1rem', fontWeight: 800}}>{post.title}</h4>
                      <p style={{margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Bởi: {post.author?.fullName} • {new Date(post.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <div style={{display: 'flex', gap: '10px'}} onClick={e => e.stopPropagation()}>
                      {post.status === 'PENDING' && (
                        <button onClick={() => handleApproveBlog(post.id)} className="btn btn-primary" style={{padding: '8px 20px', fontSize: '0.75rem', borderRadius: '10px'}}>DUYỆT BÀI</button>
                      )}
                      <button 
                        onClick={() => handleDeleteBlog(post.id)}
                        className="btn btn-outline" 
                        style={{padding: '8px', borderRadius: '10px', border: '1px solid #E5E5E5', color: '#FF3B30'}}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="user-management">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
                <h3 style={{fontWeight: 800}}>DANH SÁCH TÀI KHOẢN</h3>
                <button 
                  onClick={() => setShowUserModal(true)}
                  className="btn btn-primary" 
                  style={{borderRadius: '12px', padding: '10px 20px', fontSize: '0.875rem'}}
                >
                  <UserPlus size={18} /> THÊM NỘI BỘ
                </button>
              </div>

              <div style={{background: 'white', borderRadius: '24px', border: '1px solid #E5E5E5', overflow: 'hidden'}}>
                <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
                  <thead>
                    <tr style={{background: '#F9FAFB', borderBottom: '1px solid #E5E5E5'}}>
                      <th style={{padding: '20px', fontSize: '0.75rem', fontWeight: 800, color: '#6B7280'}}>HỌ VÀ TÊN</th>
                      <th style={{padding: '20px', fontSize: '0.75rem', fontWeight: 800, color: '#6B7280'}}>LIÊN HỆ</th>
                      <th style={{padding: '20px', fontSize: '0.75rem', fontWeight: 800, color: '#6B7280'}}>VAI TRÒ</th>
                      <th style={{padding: '20px', fontSize: '0.75rem', fontWeight: 800, color: '#6B7280'}}>THAO TÁC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} style={{borderBottom: '1px solid #F3F4F6'}}>
                        <td style={{padding: '20px'}}>
                          <div style={{fontWeight: 700}}>{u.fullName}</div>
                          <div style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>UID: #{u.id}</div>
                        </td>
                        <td style={{padding: '20px'}}>
                          <div style={{fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px'}}><Phone size={14} /> {u.phone}</div>
                          <div style={{fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px'}}><Mail size={14} /> {u.email || 'N/A'}</div>
                        </td>
                        <td style={{padding: '20px'}}>
                          <span style={{
                            padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800,
                            background: u.role === 'ADMIN' ? '#E0F2FE' : (u.role === 'DOCTOR' ? '#F0FDF4' : '#F3F4F6'),
                            color: u.role === 'ADMIN' ? '#0369A1' : (u.role === 'DOCTOR' ? '#166534' : '#4B5563')
                          }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{padding: '20px'}}>
                          <button style={{background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer'}}><Filter size={18} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* User Creation Modal */}
      {showUserModal && (
        <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'}}>
          <div className="modal-content" style={{background: '#1a1a1a', width: '100%', maxWidth: '500px', borderRadius: '32px', padding: '40px', position: 'relative'}}>
            <button onClick={() => setShowUserModal(false)} style={{position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer'}}><X size={24} /></button>
            <h2 style={{marginBottom: '8px', fontWeight: 900, color: 'white'}}>TẠO TÀI KHOẢN NỘI BỘ</h2>
            <p style={{color: 'var(--text-secondary)', marginBottom: '30px'}}>Thêm Admin, Bác sĩ hoặc Điều phối viên vào hệ thống.</p>
            
            <form onSubmit={handleCreateInternalUser} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
              <div className="form-group">
                <label style={{display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.875rem'}}>HỌ VÀ TÊN</label>
                <input required type="text" value={newUser.fullName} onChange={e => setNewUser({...newUser, fullName: e.target.value})} style={{width: '100%', padding: '16px', background: '#262626', border: '1px solid #404040', borderRadius: '16px', color: 'white'}} />
              </div>
              <div className="form-group">
                <label style={{display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.875rem'}}>SỐ ĐIỆN THOẠI</label>
                <input required type="tel" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} style={{width: '100%', padding: '16px', background: '#262626', border: '1px solid #404040', borderRadius: '16px', color: 'white'}} />
              </div>
              <div className="form-group">
                <label style={{display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.875rem'}}>VAI TRÒ</label>
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} style={{width: '100%', padding: '16px', background: '#262626', border: '1px solid #404040', borderRadius: '16px', color: 'white'}}>
                  <option value="ADMIN">ADMIN (Quản trị viên)</option>
                  <option value="DOCTOR">DOCTOR (Bác sĩ)</option>
                  <option value="FAMILY_MEMBER">STAFF (Nhân viên)</option>
                </select>
              </div>
              <div className="form-group">
                <label style={{display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.875rem'}}>MẬT KHẨU TẠM THỜI</label>
                <input required type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} style={{width: '100%', padding: '16px', background: '#262626', border: '1px solid #404040', borderRadius: '16px', color: 'white'}} />
              </div>
              <button type="submit" disabled={submittingUser} className="btn btn-primary" style={{width: '100%', padding: '18px', borderRadius: '16px', fontWeight: 800, marginTop: '10px'}}>
                {submittingUser ? 'ĐANG TẠO...' : 'TẠO TÀI KHOẢN NGAY'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
