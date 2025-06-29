import React, { useState, useEffect } from 'react';

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
        setMessages(Array.isArray(data) ? data : []);
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

  if (loading) return <div className="text-center py-3">Loading messages...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="d-flex flex-column border rounded shadow-sm" style={{ height: '500px' }}>
      <div className="border-bottom px-3 py-2 bg-light">
        <h5 className="mb-0">Chat with {partnerName}</h5>
      </div>

      <div className="flex-grow-1 overflow-auto p-3" style={{ backgroundColor: '#f8f9fa' }}>
        {messages.length === 0 ? (
          <p className="text-muted">No messages yet. Start the conversation!</p>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`mb-3 d-flex ${msg.sender_id === partnerId ? 'justify-content-start' : 'justify-content-end'}`}
            >
              <div>
                <div className={`p-2 rounded ${msg.sender_id === partnerId ? 'bg-secondary text-white' : 'bg-primary text-white'}`}>
                  {msg.content}
                </div>
                <div className="small text-muted text-end mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-top p-3 bg-white">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
          />
          <button className="btn btn-primary" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;
