import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import './AdminMessages.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API_URL}/contact/messages`);
      setMessages(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this message?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      background: '#0a0a0a',
      color: '#E1DCC9',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#B8B1A1'
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_URL}/contact/messages/${id}`);
      setMessages(prev => prev.filter(m => m._id !== id));
      Swal.fire({
        title: 'Deleted!',
        text: 'The message has been deleted.',
        icon: 'success',
        background: '#0a0a0a',
        color: '#E1DCC9',
        confirmButtonColor: '#B8B1A1'
      });
    } catch (err) {
      console.error("Error deleting message:", err);
      alert("Failed to delete message.");
    }
  };

  if (loading) return <div className="admin-messages__loading">Loading messages...</div>;

  return (
    <div className="admin-messages-container">
      <header className="admin-messages__header">
        <h1>Customer Inquiries</h1>
        <p>Manage and respond to customer messages.</p>
      </header>

      <div className="msg-list">
        {messages.length === 0 ? (
          <p className="no-msgs">No inquiries found.</p>
        ) : (
          messages.map(m => (
            <div key={m._id} className="msg-card">
              <div className="msg-card__header">
                <div>
                  <strong>{m.name}</strong>
                  <span className="msg-email" style={{ marginLeft: '15px' }}>{m.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span className="msg-date">{new Date(m.date).toLocaleDateString()}</span>
                  <button className="msg-delete-btn" onClick={() => handleDelete(m._id)} title="Delete Message">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="msg-card__body">
                <p>{m.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminMessages;
