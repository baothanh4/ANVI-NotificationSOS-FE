import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../contexts/AuthContext';
import { 
  UserPlus, Search, Check, X, Clock, ShieldCheck, 
  User, UserMinus, Phone, AlertCircle, Info
} from 'lucide-react';

export const EmergencyContactsManager = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newContact, setNewContact] = useState({ name: '', phone: '', priority: 1, relationship: '' });
  
  // Rescue Connections state
  const [searchPhone, setSearchPhone] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [connections, setConnections] = useState([
    { id: 101, fullName: 'Lê Văn Tám', phone: '0988123456', status: 'CONNECTED' },
    { id: 102, fullName: 'Nguyễn Thị Hoa', phone: '0977654321', status: 'PENDING_IN' }
  ]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, [user]);

  const fetchContacts = async () => {
    if (!user || !user.id) return;
    try {
      const res = await axiosClient.get(`/contacts/users/${user.id}`);
      setContacts(res || []);
      setNewContact(prev => ({ ...prev, priority: (res?.length || 0) + 1 }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (contacts.length >= 3) {
      alert("Bạn chỉ có thể thêm tối đa 3 số liên hệ khẩn cấp.");
      return;
    }
    try {
      await axiosClient.post(`/contacts/users/${user.id}`, newContact);
      setNewContact({ name: '', phone: '', priority: contacts.length + 2, relationship: '' });
      fetchContacts();
    } catch (e) {
      alert('Lỗi khi thêm liên hệ: ' + (e.response?.data?.message || e.message));
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/contacts/${id}`);
      fetchContacts();
    } catch (e) {
      alert('Lỗi khi xoá liên hệ: ' + (e.response?.data?.message || e.message));
    }
  };

  // Rescue Connection Logic
  const handleSearch = async () => {
    if (!searchPhone) return;
    setSearching(true);
    // Mocking a search API
    setTimeout(() => {
      if (searchPhone === '0123456789') {
        setSearchResult({ id: 999, fullName: 'Người Lạ Hào Hiệp', phone: '0123456789' });
      } else {
        setSearchResult('NOT_FOUND');
      }
      setSearching(false);
    }, 800);
  };

  const sendRequest = (targetUser) => {
    setConnections([...connections, { ...targetUser, status: 'PENDING_OUT' }]);
    setSearchResult(null);
    setSearchPhone('');
    alert(`Đã gửi yêu cầu kết nối cứu hộ tới ${targetUser.fullName}`);
  };

  const handleConnectionAction = (id, action) => {
    if (action === 'ACCEPT') {
      setConnections(connections.map(c => c.id === id ? { ...c, status: 'CONNECTED' } : c));
    } else if (action === 'REJECT' || action === 'REMOVE') {
      setConnections(connections.filter(c => c.id !== id));
    }
  };

  if (loading) return <div style={{textAlign: 'center', padding: '40px'}}><div className="loader"></div> Đang tải danh bạ...</div>;

  return (
    <div className="contacts-manager">
      {/* Manual Contacts Section */}
      <section style={{marginBottom: '56px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px'}}>
          <Phone size={24} color="var(--accent-blue)" />
          <h2 style={{fontSize: '1.5rem', fontWeight: 950, letterSpacing: '-0.02em', margin: 0}}>DANH BẠ KHẨN CẤP</h2>
        </div>
        
        <div style={{background: '#F0F7FF', padding: '16px 24px', borderRadius: '16px', borderLeft: '4px solid var(--accent-blue)', marginBottom: '24px'}}>
          <p style={{margin: 0, color: '#0055B3', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px'}}>
            <Info size={18} /> Tối đa 3 người. Những người này sẽ nhận được tin nhắn SMS và vị trí của bạn khi bạn nhấn SOS.
          </p>
        </div>

        <div style={{display: 'grid', gap: '16px'}}>
          {contacts.map((contact) => (
            <div key={contact.id} className="contact-item-card" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', background: 'white', borderRadius: '20px', border: '1px solid #EEE', boxShadow: '0 4px 12px rgba(0,0,0,0.03)'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                <div style={{width: '56px', height: '56px', background: '#F2F2F7', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)', fontWeight: 900, fontSize: '1.2rem'}}>
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{fontWeight: 900, fontSize: '1.1rem', color: '#1A1A1A'}}>{contact.name} <span style={{fontSize: '0.8rem', color: '#8E8E93', fontWeight: 600}}>({contact.relationship})</span></div>
                  <div style={{color: '#666', fontWeight: 600, marginTop: '2px'}}>{contact.phone}</div>
                  <div style={{fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-blue)', marginTop: '6px', background: '#F0F7FF', display: 'inline-block', padding: '2px 8px', borderRadius: '4px'}}>ƯU TIÊN {contact.priority}</div>
                </div>
              </div>
              <button onClick={() => handleDelete(contact.id)} style={{background: 'none', border: '1px solid #FF3B30', color: '#FF3B30', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: 800, fontSize: '0.85rem', transition: 'all 0.2s'}}>
                XOÁ
              </button>
            </div>
          ))}

          {contacts.length < 3 && (
            <form onSubmit={handleAdd} style={{marginTop: '12px', padding: '32px', background: 'white', borderRadius: '24px', border: '2px dashed #D1D1D6'}}>
              <h3 style={{fontWeight: 900, marginBottom: '24px', fontSize: '1.1rem', color: '#1A1A1A'}}>THÊM LIÊN HỆ MỚI</h3>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px'}}>
                <div className="input-group-aid">
                  <label style={{display: 'block', fontSize: '0.7rem', fontWeight: 900, color: '#8E8E93', marginBottom: '8px'}}>TÊN NGƯỜI LIÊN HỆ</label>
                  <input required type="text" placeholder="VD: Bố, Mẹ, Anh..." value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} style={{padding: '16px', borderRadius: '12px', border: '2px solid #F2F2F7', background: '#F8F9FA', width: '100%', fontWeight: 700}} />
                </div>
                <div className="input-group-aid">
                  <label style={{display: 'block', fontSize: '0.7rem', fontWeight: 900, color: '#8E8E93', marginBottom: '8px'}}>SỐ ĐIỆN THOẠI</label>
                  <input required type="text" placeholder="Nhập số điện thoại..." value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} style={{padding: '16px', borderRadius: '12px', border: '2px solid #F2F2F7', background: '#F8F9FA', width: '100%', fontWeight: 700}} />
                </div>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px'}}>
                <div className="input-group-aid">
                  <label style={{display: 'block', fontSize: '0.7rem', fontWeight: 900, color: '#8E8E93', marginBottom: '8px'}}>MỐI QUAN HỆ</label>
                  <input type="text" placeholder="Mẹ, Vợ, Bạn thân..." value={newContact.relationship} onChange={e => setNewContact({...newContact, relationship: e.target.value})} style={{padding: '16px', borderRadius: '12px', border: '2px solid #F2F2F7', background: '#F8F9FA', width: '100%', fontWeight: 700}} />
                </div>
                <div className="input-group-aid">
                  <label style={{display: 'block', fontSize: '0.7rem', fontWeight: 900, color: '#8E8E93', marginBottom: '8px'}}>ĐỘ ƯU TIÊN (1-3)</label>
                  <input type="number" value={newContact.priority} onChange={e => setNewContact({...newContact, priority: e.target.value})} style={{padding: '16px', borderRadius: '12px', border: '2px solid #F2F2F7', background: '#F8F9FA', width: '100%', fontWeight: 700}} />
                </div>
              </div>
              <button type="submit" style={{background: 'var(--accent-blue)', color: 'white', padding: '16px', borderRadius: '14px', border: 'none', fontWeight: 900, cursor: 'pointer', width: '100%', boxShadow: '0 8px 20px rgba(0,100,210,0.2)'}}>
                LƯU LIÊN HỆ KHẨN CẤP
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Rescue Connections Section */}
      <section>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px'}}>
          <ShieldCheck size={24} color="var(--success)" />
          <h2 style={{fontSize: '1.5rem', fontWeight: 950, letterSpacing: '-0.02em', margin: 0}}>KẾT NỐI CỨU HỘ (SOS NETWORK)</h2>
        </div>

        <div style={{background: '#F0FFF4', padding: '16px 24px', borderRadius: '16px', borderLeft: '4px solid var(--success)', marginBottom: '32px'}}>
          <p style={{margin: 0, color: '#166534', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px'}}>
            <Info size={18} /> Kết nối với người dùng ANVI-SOS khác. Khi bạn nhấn SOS, họ sẽ nhận được cảnh báo ứng cứu ngay lập tức trên điện thoại.
          </p>
        </div>

        {/* Search Bar */}
        <div style={{background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #EEE', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', marginBottom: '32px'}}>
          <h3 style={{fontWeight: 900, marginBottom: '20px', fontSize: '1rem', color: '#1A1A1A'}}>TÌM KIẾM NGƯỜI DÙNG BẰNG SỐ ĐIỆN THOẠI</h3>
          <div style={{display: 'flex', gap: '12px'}}>
            <div style={{flex: 1, position: 'relative'}}>
              <Search size={20} style={{position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#8E8E93'}} />
              <input 
                type="text" 
                placeholder="Nhập số điện thoại người bạn muốn kết nối..." 
                value={searchPhone}
                onChange={e => setSearchPhone(e.target.value)}
                style={{width: '100%', padding: '16px 16px 16px 48px', borderRadius: '14px', border: '2px solid #F2F2F7', background: '#F8F9FA', fontWeight: 700, fontSize: '1rem'}}
              />
            </div>
            <button onClick={handleSearch} disabled={searching} style={{background: '#1A1A1A', color: 'white', padding: '0 32px', borderRadius: '14px', border: 'none', fontWeight: 800, cursor: 'pointer'}}>
              {searching ? 'ĐANG TÌM...' : 'TÌM KIẾM'}
            </button>
          </div>

          {/* Search Results */}
          {searchResult && (
            <div style={{marginTop: '24px', padding: '20px', background: '#F8F9FA', borderRadius: '16px', border: '1px solid #EEE'}}>
              {searchResult === 'NOT_FOUND' ? (
                <div style={{textAlign: 'center', color: '#8E8E93', fontWeight: 600}}>
                  <AlertCircle size={32} style={{marginBottom: '8px', opacity: 0.5}} /><br/>
                  Không tìm thấy người dùng này trên hệ thống.
                </div>
              ) : (
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                    <div style={{width: '48px', height: '48px', background: 'var(--success)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900}}>
                      {searchResult.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{fontWeight: 800, color: '#1A1A1A'}}>{searchResult.fullName}</div>
                      <div style={{fontSize: '0.85rem', color: '#666'}}>{searchResult.phone}</div>
                    </div>
                  </div>
                  <button onClick={() => sendRequest(searchResult)} className="btn-success" style={{background: 'var(--success)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <UserPlus size={18} /> GỬI YÊU CẦU
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pending Requests */}
        {connections.some(c => c.status.startsWith('PENDING')) && (
          <div style={{marginBottom: '32px'}}>
            <h3 style={{fontWeight: 900, marginBottom: '20px', fontSize: '1rem', color: '#1A1A1A', display: 'flex', alignItems: 'center', gap: '8px'}}>
              <Clock size={18} color="#FF9500" /> YÊU CẦU ĐANG CHỜ PHẢN HỒI
            </h3>
            <div style={{display: 'grid', gap: '12px'}}>
              {connections.filter(c => c.status.startsWith('PENDING')).map(conn => (
                <div key={conn.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'white', borderRadius: '18px', border: '1px solid #EEE'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                    <div style={{width: '40px', height: '40px', background: '#F2F2F7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8E8E93', fontWeight: 800}}>
                      {conn.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{fontWeight: 800, fontSize: '0.95rem'}}>{conn.fullName}</div>
                      <div style={{fontSize: '0.8rem', color: conn.status === 'PENDING_IN' ? '#FF9500' : '#8E8E93', fontWeight: 700}}>
                        {conn.status === 'PENDING_IN' ? 'Đã gửi yêu cầu kết nối cho bạn' : 'Bạn đã gửi yêu cầu kết nối'}
                      </div>
                    </div>
                  </div>
                  <div style={{display: 'flex', gap: '8px'}}>
                    {conn.status === 'PENDING_IN' ? (
                      <>
                        <button onClick={() => handleConnectionAction(conn.id, 'ACCEPT')} style={{background: 'var(--success)', color: 'white', border: 'none', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'}}><Check size={18} /></button>
                        <button onClick={() => handleConnectionAction(conn.id, 'REJECT')} style={{background: '#F2F2F7', color: '#FF3B30', border: 'none', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'}}><X size={18} /></button>
                      </>
                    ) : (
                      <button onClick={() => handleConnectionAction(conn.id, 'REMOVE')} style={{background: '#F2F2F7', color: '#8E8E93', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer'}}>THU HỒI</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Connections */}
        <div>
          <h3 style={{fontWeight: 900, marginBottom: '20px', fontSize: '1rem', color: '#1A1A1A', display: 'flex', alignItems: 'center', gap: '8px'}}>
            <User size={18} color="var(--accent-blue)" /> BẠN BÈ CỨU HỘ ĐÃ KẾT NỐI ({connections.filter(c => c.status === 'CONNECTED').length})
          </h3>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
            {connections.filter(c => c.status === 'CONNECTED').map(conn => (
              <div key={conn.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'white', borderRadius: '20px', border: '1px solid #EEE', boxShadow: '0 4px 15px rgba(0,0,0,0.02)'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                  <div style={{width: '44px', height: '44px', background: 'rgba(52, 199, 89, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)', fontWeight: 900}}>
                    {conn.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{fontWeight: 800, color: '#1A1A1A'}}>{conn.fullName}</div>
                    <div style={{fontSize: '0.8rem', color: '#8E8E93', fontWeight: 600}}>{conn.phone}</div>
                  </div>
                </div>
                <button onClick={() => handleConnectionAction(conn.id, 'REMOVE')} style={{background: 'none', border: 'none', color: '#AEAEB2', cursor: 'pointer', padding: '8px'}}><UserMinus size={18} /></button>
              </div>
            ))}
            {connections.filter(c => c.status === 'CONNECTED').length === 0 && (
              <div style={{gridColumn: 'span 2', textAlign: 'center', padding: '48px', background: 'white', borderRadius: '24px', border: '1px dashed #DDD'}}>
                <UserPlus size={40} style={{color: '#DDD', marginBottom: '16px'}} />
                <p style={{color: '#8E8E93', fontWeight: 600, margin: 0}}>Bạn chưa có kết nối cứu hộ nào.</p>
                <p style={{color: '#AEAEB2', fontSize: '0.85rem', marginTop: '4px'}}>Hãy tìm kiếm người thân bằng số điện thoại để bắt đầu kết nối.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <style>{`
        .loader { width: 18px; height: 18px; border: 3px solid #F3F3F3; border-top: 3px solid var(--accent-blue); border-radius: 50%; animation: spin 1s linear infinite; display: inline-block; margin-right: 8px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        
        .contact-item-card:hover { border-color: var(--accent-blue) !important; transform: translateY(-2px); }
        .input-group-aid input:focus { border-color: var(--accent-blue); outline: none; background: white !important; }
      `}</style>
    </div>
  );
};
