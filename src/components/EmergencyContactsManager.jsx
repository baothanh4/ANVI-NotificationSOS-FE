import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../contexts/AuthContext';
import { 
  UserPlus, Search, Check, X, Clock, ShieldCheck, 
  User, UserMinus, Phone, AlertCircle, Info
} from 'lucide-react';

export const EmergencyContactsManager = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState([]);
  
  // Search state
  const [searchPhone, setSearchPhone] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);

  // Edit relationship state
  const [editingId, setEditingId] = useState(null);
  const [editRelation, setEditRelation] = useState('');

  useEffect(() => {
    fetchConnections();
  }, [user]);

  const fetchConnections = async () => {
    if (!user || !user.id) return;
    try {
      const res = await axiosClient.get(`/connections/my?userId=${user.id}`);
      setConnections(res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchPhone) return;
    setSearching(true);
    setSearchResult(null);
    try {
      const res = await axiosClient.get(`/connections/search?phone=${searchPhone}`);
      if (res) {
        setSearchResult(res);
      } else {
        setSearchResult('NOT_FOUND');
      }
    } catch (e) {
      setSearchResult('NOT_FOUND');
    } finally {
      setSearching(false);
    }
  };

  const sendRequest = async (targetUser) => {
    try {
      await axiosClient.post(`/connections/request?requesterId=${user.id}&targetId=${targetUser.id}`);
      setSearchResult(null);
      setSearchPhone('');
      fetchConnections();
      alert(`Đã gửi yêu cầu kết nối cứu hộ tới ${targetUser.fullName}`);
    } catch (e) {
      alert("Lỗi khi gửi yêu cầu.");
    }
  };

  const handleConnectionAction = async (id, action) => {
    try {
      if (action === 'ACCEPT') {
        await axiosClient.patch(`/connections/${id}/status?status=ACCEPTED`);
      } else if (action === 'REJECT') {
        await axiosClient.patch(`/connections/${id}/status?status=REJECTED`);
      } else if (action === 'REMOVE') {
        // Here we could have a delete endpoint, but for now we'll just mock or use REJECTED
        await axiosClient.patch(`/connections/${id}/status?status=REJECTED`);
      }
      fetchConnections();
    } catch (e) {
      console.error(e);
    }
  };

  const startEditRelationship = (conn) => {
    setEditingId(conn.id);
    setEditRelation(conn.relationship || '');
  };

  const saveRelationship = async (id) => {
    try {
      await axiosClient.patch(`/connections/${id}/relationship`, { relationship: editRelation });
      setEditingId(null);
      fetchConnections();
    } catch (e) {
      alert("Lỗi khi cập nhật mối quan hệ.");
    }
  };

  if (loading) return <div style={{textAlign: 'center', padding: '40px'}}><div className="loader"></div> Đang tải mạng lưới cứu hộ...</div>;

  return (
    <div className="contacts-manager">
      {/* Rescue Connections Section */}
      <section>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px'}}>
          <ShieldCheck size={28} color="var(--accent-blue)" />
          <h2 style={{fontSize: '1.8rem', fontWeight: 950, letterSpacing: '-0.02em', margin: 0}}>MẠNG LƯỚI CỨU HỘ (SOS NETWORK)</h2>
        </div>

        <div style={{background: '#F0F7FF', padding: '20px 24px', borderRadius: '16px', borderLeft: '5px solid var(--accent-blue)', marginBottom: '40px'}}>
          <p style={{margin: 0, color: '#0055B3', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px'}}>
            <Info size={20} /> Thay vì nhập thủ công, hãy kết nối với người thân có tài khoản ANVI-SOS để họ nhận được cảnh báo vị trí chính xác nhất khi bạn cần giúp đỡ.
          </p>
        </div>

        {/* Search Bar */}
        <div style={{background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #EEE', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', marginBottom: '40px'}}>
          <h3 style={{fontWeight: 900, marginBottom: '20px', fontSize: '1.1rem', color: '#1A1A1A'}}>TÌM KIẾM NGƯỜI DÙNG BẰNG SỐ ĐIỆN THOẠI</h3>
          <div style={{display: 'flex', gap: '12px'}}>
            <div style={{flex: 1, position: 'relative'}}>
              <Search size={22} style={{position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#8E8E93'}} />
              <input 
                type="text" 
                placeholder="Nhập số điện thoại người thân (VD: 098...)" 
                value={searchPhone}
                onChange={e => setSearchPhone(e.target.value)}
                style={{width: '100%', padding: '18px 18px 18px 52px', borderRadius: '16px', border: '2px solid #F2F2F7', background: '#F8F9FA', fontWeight: 700, fontSize: '1rem', transition: 'all 0.2s'}}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button onClick={handleSearch} disabled={searching} style={{background: '#1A1A1A', color: 'white', padding: '0 36px', borderRadius: '16px', border: 'none', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s'}}>
              {searching ? 'ĐANG TÌM...' : 'TÌM KIẾM'}
            </button>
          </div>

          {/* Search Results */}
          {searchResult && (
            <div style={{marginTop: '24px', padding: '24px', background: '#F8F9FA', borderRadius: '20px', border: '1px solid #EEE', animation: 'fadeIn 0.3s ease'}}>
              {searchResult === 'NOT_FOUND' ? (
                <div style={{textAlign: 'center', color: '#8E8E93', padding: '10px'}}>
                  <AlertCircle size={32} style={{marginBottom: '12px', opacity: 0.5}} /><br/>
                  <span style={{fontWeight: 700}}>Không tìm thấy người dùng này trên hệ thống.</span>
                </div>
              ) : (
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                    <div style={{width: '60px', height: '60px', background: 'var(--accent-blue)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '1.5rem'}}>
                      {searchResult.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{fontWeight: 900, fontSize: '1.2rem', color: '#1A1A1A'}}>{searchResult.fullName}</div>
                      <div style={{fontSize: '0.95rem', color: '#666', fontWeight: 600}}>{searchResult.phone}</div>
                    </div>
                  </div>
                  <button onClick={() => sendRequest(searchResult)} style={{background: 'var(--accent-blue)', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '14px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 8px 15px rgba(0,122,255,0.2)'}}>
                    <UserPlus size={20} /> KẾT NỐI NGAY
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pending Requests */}
        {connections.some(c => c.status.startsWith('PENDING')) && (
          <div style={{marginBottom: '48px'}}>
            <h3 style={{fontWeight: 900, marginBottom: '24px', fontSize: '1.1rem', color: '#1A1A1A', display: 'flex', alignItems: 'center', gap: '10px'}}>
              <Clock size={20} color="#FF9500" /> YÊU CẦU ĐANG CHỜ PHẢN HỒI
            </h3>
            <div style={{display: 'grid', gap: '16px'}}>
              {connections.filter(c => c.status.startsWith('PENDING')).map(conn => (
                <div key={conn.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', background: 'white', borderRadius: '20px', border: '1px solid #EEE', boxShadow: '0 4px 15px rgba(0,0,0,0.03)'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                    <div style={{width: '48px', height: '48px', background: '#F2F2F7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8E8E93', fontWeight: 900}}>
                      {conn.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{fontWeight: 900, fontSize: '1rem'}}>{conn.fullName}</div>
                      <div style={{fontSize: '0.85rem', color: conn.status === 'PENDING_IN' ? '#FF9500' : '#8E8E93', fontWeight: 800, marginTop: '2px'}}>
                        {conn.status === 'PENDING_IN' ? 'Muốn kết nối cứu hộ với bạn' : 'Bạn đã gửi lời mời kết nối'}
                      </div>
                    </div>
                  </div>
                  <div style={{display: 'flex', gap: '12px'}}>
                    {conn.status === 'PENDING_IN' ? (
                      <>
                        <button onClick={() => handleConnectionAction(conn.id, 'ACCEPT')} style={{background: '#34C759', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'}}><Check size={18} /> ĐỒNG Ý</button>
                        <button onClick={() => handleConnectionAction(conn.id, 'REJECT')} style={{background: '#F2F2F7', color: '#FF3B30', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer'}}><X size={18} /></button>
                      </>
                    ) : (
                      <button onClick={() => handleConnectionAction(conn.id, 'REMOVE')} style={{background: '#F2F2F7', color: '#8E8E93', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer'}}>HỦY LỜI MỜI</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Connections */}
        <div>
          <h3 style={{fontWeight: 900, marginBottom: '24px', fontSize: '1.1rem', color: '#1A1A1A', display: 'flex', alignItems: 'center', gap: '10px'}}>
            <User size={20} color="var(--accent-blue)" /> DANH SÁCH CỨU HỘ ĐÃ KẾT NỐI ({connections.filter(c => c.status === 'CONNECTED').length})
          </h3>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
            {connections.filter(c => c.status === 'CONNECTED').map(conn => (
              <div key={conn.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', padding: '28px', background: 'white', borderRadius: '24px', border: '1px solid #EEE', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                  <div style={{width: '56px', height: '56px', background: 'rgba(52, 199, 89, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34C759', fontWeight: 900, fontSize: '1.4rem'}}>
                    {conn.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{fontWeight: 950, color: '#1A1A1A', fontSize: '1.15rem'}}>{conn.fullName}</div>
                    <div style={{fontSize: '0.9rem', color: '#8E8E93', fontWeight: 600, marginTop: '2px'}}>{conn.phone}</div>
                    
                    {/* Relationship Display/Edit */}
                    <div style={{marginTop: '12px'}}>
                      {editingId === conn.id ? (
                        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                          <input 
                            value={editRelation} 
                            onChange={e => setEditRelation(e.target.value)}
                            placeholder="Mẹ, Anh, Bạn..."
                            style={{padding: '6px 12px', borderRadius: '8px', border: '2px solid var(--accent-blue)', fontSize: '0.85rem', fontWeight: 700, width: '120px'}}
                            autoFocus
                          />
                          <button onClick={() => saveRelationship(conn.id)} style={{background: 'var(--accent-blue)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 800, fontSize: '0.8rem'}}>LƯU</button>
                        </div>
                      ) : (
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                          <span style={{fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-blue)', background: '#F0F7FF', padding: '4px 10px', borderRadius: '6px'}}>
                            {conn.relationship || 'CHƯA ĐẶT QUAN HỆ'}
                          </span>
                          <button onClick={() => startEditRelationship(conn)} style={{background: 'none', border: 'none', color: '#AEAEB2', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'underline'}}>SỬA</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={() => handleConnectionAction(conn.id, 'REMOVE')} style={{background: '#FFF1F0', border: 'none', color: '#FF3B30', padding: '10px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s'}}>
                  <UserMinus size={20} />
                </button>
              </div>
            ))}
            {connections.filter(c => c.status === 'CONNECTED').length === 0 && (
              <div style={{gridColumn: 'span 2', textAlign: 'center', padding: '64px 32px', background: 'white', borderRadius: '28px', border: '2px dashed #DDD'}}>
                <div style={{width: '80px', height: '80px', background: '#F8F9FA', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCenter: 'center', margin: '0 auto 24px', color: '#DDD'}}>
                  <UserPlus size={40} />
                </div>
                <h4 style={{margin: '0 0 8px', color: '#1A1A1A', fontWeight: 900}}>Chưa có kết nối cứu hộ nào</h4>
                <p style={{color: '#8E8E93', fontWeight: 600, fontSize: '0.95rem', maxWidth: '350px', margin: '0 auto'}}>Hãy tìm kiếm người thân bằng số điện thoại để bắt đầu xây dựng mạng lưới an toàn của bạn.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <style>{`
        .loader { width: 24px; height: 24px; border: 4px solid #F3F3F3; border-top: 4px solid var(--accent-blue); border-radius: 50%; animation: spin 1s linear infinite; display: inline-block; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        input:focus { border-color: var(--accent-blue) !important; outline: none; background: white !important; }
        .contacts-manager { animation: fadeIn 0.5s ease; }
      `}</style>
    </div>
  );
};

