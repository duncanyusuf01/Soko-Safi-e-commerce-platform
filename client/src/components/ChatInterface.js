// client/src/components/ChatInterface.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function ChatInterface({ partnerId, partnerName }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/messages/${partnerId}`);
        if (!response.ok) throw new Error('Failed to load messages');
        const data = await response.json();
        setMessages(Array.isArray(data) ? data : []); // Ensure messages is always an array
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (partnerId) {
      fetchMessages();
    }
  }, [partnerId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      const response = await fetch('/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage,
          recipient_id: partnerId
        })
      });
      
      if (response.ok) {
        const message = await response.json();
        setMessages(prev => [...prev, message]);
        setNewMessage('');
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  if (loading) return <div>Loading messages...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #eee' }}>
        <h3>Chat with {partnerName}</h3>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {messages.length === 0 ? (
          <p>No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} style={{ 
              marginBottom: '12px',
              textAlign: msg.sender_id === partnerId ? 'left' : 'right'
            }}>
              <div style={{
                display: 'inline-block',
                padding: '8px 12px',
                borderRadius: '12px',
                backgroundColor: msg.sender_id === partnerId ? '#f1f1f1' : '#2196F3',
                color: msg.sender_id === partnerId ? '#333' : 'white'
              }}>
                {msg.content}
              </div>
              <div style={{ 
                fontSize: '0.8em', 
                color: '#666',
                textAlign: msg.sender_id === partnerId ? 'left' : 'right'
              }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div style={{ padding: '16px', borderTop: '1px solid #eee' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            style={{ flex: 1, padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <button
            onClick={sendMessage}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;