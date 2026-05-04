import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

import { useAuth } from '../contexts/AuthContext';

export const EmergencyContactsManager = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newContact, setNewContact] = useState({ name: '', phone: '', priority: 1, relationship: '' });

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

  if (loading) return <div>Đang tải danh bạ...</div>;

  return (
    <div>
      <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px'}}>Danh bạ khẩn cấp</h2>
      <p style={{color: 'var(--text-secondary)', marginBottom: '16px'}}>Tối đa 3 người. Khi bạn nhấn SOS, những người này sẽ nhận được tin nhắn và vị trí của bạn.</p>

      {contacts.map((contact) => (
        <div key={contact.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '12px', border: '1px solid var(--glass-border)'}}>
          <div>
            <div style={{fontWeight: 'bold', fontSize: '1.1rem'}}>{contact.name} <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>({contact.relationship})</span></div>
            <div style={{color: 'var(--text-secondary)'}}>{contact.phone}</div>
            <div style={{fontSize: '0.8rem', marginTop: '4px'}}>Ưu tiên: {contact.priority}</div>
          </div>
          <button onClick={() => handleDelete(contact.id)} style={{background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s'}} onMouseOver={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }} onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ef4444'; }}>
            Xoá
          </button>
        </div>
      ))}

      {contacts.length < 3 && (
        <form onSubmit={handleAdd} style={{marginTop: '24px', padding: '16px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)'}}>
          <h3 style={{fontWeight: 'bold', marginBottom: '16px', color: '#3b82f6'}}>Thêm liên hệ mới</h3>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px'}}>
            <input required type="text" placeholder="Tên người liên hệ" value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} style={{padding: '10px', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', width: '100%'}} />
            <input required type="text" placeholder="Số điện thoại" value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} style={{padding: '10px', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', width: '100%'}} />
          </div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px'}}>
            <input type="text" placeholder="Mối quan hệ (VD: Bố, Mẹ, Vợ...)" value={newContact.relationship} onChange={e => setNewContact({...newContact, relationship: e.target.value})} style={{padding: '10px', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', width: '100%'}} />
            <input type="number" placeholder="Độ ưu tiên (1-3)" value={newContact.priority} onChange={e => setNewContact({...newContact, priority: e.target.value})} style={{padding: '10px', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', width: '100%'}} />
          </div>
          <button type="submit" style={{background: '#3b82f6', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', width: '100%'}}>
            Lưu Liên Hệ
          </button>
        </form>
      )}
    </div>
  );
};
