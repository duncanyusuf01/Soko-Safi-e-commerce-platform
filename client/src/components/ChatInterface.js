// client/src/components/ChatInterface.js
import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserProvider';

function ChatInterface({ partnerId }) {
  const { user } = useContext(UserContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [partner, setPartner] = useState(null);

  useEffect(() => {
    if (partnerId) {
      // Fetch partner info
      fetch(`/vendors/${partnerId}`)
        .then(r => r.json())
        .then(setPartner);
      
      // Fetch messages
      fetch(`/messages/${partnerId}`)
        .then(r => r.json())
        .then(setMessages);
    }
  }, [partnerId]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    fetch('/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: newMessage,
        recipient_id: partnerId
      })
    })
    .then(r => r.json())
    .then(message => {
      setMessages([...messages, message]);
      setNewMessage('');
    });
  };

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px' }}>
      <div style={{ marginBottom: '16px' }}>
        <h3>Chat with {partner?.username}</h3>
      </div>
      
      <div style={{ height: '300px', overflowY: 'auto', marginBottom: '16px', border: '1px solid #eee', padding: '8px' }}>
        {messages.map(msg => (
          <div 
            key={msg.id} 
            style={{ 
              textAlign: msg.sender_id === user.id ? 'right' : 'left',
              margin: '8px 0'
            }}
          >
            <div style={{
              display: 'inline-block',
              padding: '8px 12px',
              borderRadius: '12px',
              backgroundColor: msg.sender_id === user.id ? '#007bff' : '#f1f1f1',
              color: msg.sender_id === user.id ? 'white' : 'black'
            }}>
              {msg.content}
            </div>
            <div style={{ fontSize: '0.8em', color: '#666' }}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ display: 'flex' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          style={{ flex: 1, padding: '8px', marginRight: '8px' }}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage} style={{ padding: '8px 16px' }}>
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatInterface;