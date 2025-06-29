// client/src/pages/MessagesPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatInterface from '../components/ChatInterface';
import { UserContext } from '../context/UserProvider';

function MessagesPage() {
  const { userId } = useParams();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/messages');
        if (!response.ok) throw new Error('Failed to load conversations');
        const data = await response.json();
        setConversations(data);
      } catch (err) {
        console.error("Error fetching conversations:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const filteredConversations = conversations.filter(conv =>
    conv.partner_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConversationSelect = (partnerId) => {
    navigate(`/messages/${partnerId}`);
  };

  if (!user) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Please log in to view your messages</p>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      height: 'calc(100vh - 100px)',
      backgroundColor: '#f9f9f9'
    }}>
      {/* Conversations sidebar */}
      <div style={{ 
        width: '320px', 
        borderRight: '1px solid #e0e0e0', 
        padding: '16px',
        backgroundColor: 'white',
        overflowY: 'auto'
      }}>
        <h2 style={{ 
          marginBottom: '16px', 
          paddingBottom: '8px',
          borderBottom: '1px solid #eee'
        }}>
          Conversations
        </h2>

        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>Loading conversations...</p>
          </div>
        ) : error ? (
          <div style={{ color: 'red', padding: '10px' }}>
            {error}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>No conversations found</p>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {filteredConversations.map(conv => (
              <li 
                key={conv.partner_id} 
                style={{ 
                  padding: '12px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  backgroundColor: userId === conv.partner_id.toString() ? '#e3f2fd' : 'transparent',
                  transition: 'background-color 0.2s',
                  ':hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
                onClick={() => handleConversationSelect(conv.partner_id)}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <strong style={{ fontSize: '1.1em' }}>{conv.partner_name}</strong>
                  {!conv.read && (
                    <span style={{
                      display: 'inline-block',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: '#2196f3'
                    }}></span>
                  )}
                </div>
                <p style={{ 
                  margin: '4px 0', 
                  fontSize: '0.9em',
                  color: '#666',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {conv.last_message}
                </p>
                <small style={{ 
                  color: '#999',
                  fontSize: '0.8em'
                }}>
                  {new Date(conv.timestamp).toLocaleString()}
                </small>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Chat area */}
      <div style={{ 
        flex: 1, 
        padding: '16px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {userId ? (
          <ChatInterface partnerId={parseInt(userId)} />
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            textAlign: 'center',
            color: '#666'
          }}>
            <h3>No conversation selected</h3>
            <p>Select a conversation from the list or start a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MessagesPage;