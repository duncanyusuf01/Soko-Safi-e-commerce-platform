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
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [vendorSearch, setVendorSearch] = useState('');
  const [selectedPartner, setSelectedPartner] = useState(null);

  // Fetch conversations and set selected partner
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/messages');
        if (!response.ok) throw new Error('Failed to load conversations');
        const data = await response.json();
        setConversations(data);
        
        // Set the selected partner if userId exists in URL
        if (userId) {
          const partner = data.find(conv => conv.partner_id.toString() === userId) || 
                         { partner_id: parseInt(userId), partner_name: 'New Chat' };
          setSelectedPartner(partner);
        }
      } catch (err) {
        console.error("Error fetching conversations:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [userId]); // Added userId as dependency

  // Fetch vendors for new chat
  const fetchVendors = async () => {
    try {
      const response = await fetch('/vendors');
      if (!response.ok) throw new Error('Failed to load vendors');
      const data = await response.json();
      setVendors(data);
    } catch (err) {
      console.error("Error fetching vendors:", err);
      setError(err.message);
    }
  };

  const startNewChat = (vendorId, vendorName) => {
    navigate(`/messages/${vendorId}`);
    setSelectedPartner({
      partner_id: vendorId,
      partner_name: vendorName
    });
    setShowNewChatModal(false);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.partner_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVendors = vendors.filter(vendor =>
    vendor.username.toLowerCase().includes(vendorSearch.toLowerCase()) &&
    !conversations.some(conv => conv.partner_id === vendor.id)
  );

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 100px)', backgroundColor: '#f9f9f9' }}>
      {/* Conversations sidebar */}
      <div style={{ width: '320px', borderRight: '1px solid #e0e0e0', padding: '16px', backgroundColor: 'white', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2>Conversations</h2>
          <button
            onClick={() => {
              setShowNewChatModal(true);
              fetchVendors();
            }}
            style={{
              padding: '6px 12px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            New Chat
          </button>
        </div>

        <input
          type="text"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            marginBottom: '16px'
          }}
        />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>Loading conversations...</p>
          </div>
        ) : error ? (
          <div style={{ color: 'red', padding: '10px' }}>
            {error}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
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
                  backgroundColor: selectedPartner?.partner_id === conv.partner_id ? '#e3f2fd' : 'transparent',
                  transition: 'background-color 0.2s',
                  ':hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
                onClick={() => {
                  navigate(`/messages/${conv.partner_id}`);
                  setSelectedPartner(conv);
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                <small style={{ color: '#999', fontSize: '0.8em' }}>
                  {new Date(conv.timestamp).toLocaleString()}
                </small>
              </li>
            ))}
          </ul>
        )}

        {/* New Chat Modal */}
        {showNewChatModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              width: '400px',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3>Start New Chat</h3>
                <button 
                  onClick={() => setShowNewChatModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: '1.5em', cursor: 'pointer' }}
                >
                  &times;
                </button>
              </div>
              
              <input
                type="text"
                placeholder="Search vendors..."
                value={vendorSearch}
                onChange={(e) => setVendorSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  marginBottom: '16px'
                }}
              />
              
              {vendors.length === 0 ? (
                <p>Loading vendors...</p>
              ) : filteredVendors.length === 0 ? (
                <p>No vendors found</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {filteredVendors.map(vendor => (
                    <li 
                      key={vendor.id}
                      style={{
                        padding: '12px',
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer',
                        ':hover': {
                          backgroundColor: '#f5f5f5'
                        }
                      }}
                      onClick={() => startNewChat(vendor.id, vendor.username)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: '#e0e0e0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '12px'
                        }}>
                          {vendor.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>{vendor.username}</strong>
                          <p style={{ margin: 0, color: '#666' }}>{vendor.email}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Chat area */}
      <div style={{ 
        flex: 1, 
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white'
      }}>
        {selectedPartner ? (
          <ChatInterface partnerId={selectedPartner.partner_id} partnerName={selectedPartner.partner_name} />
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