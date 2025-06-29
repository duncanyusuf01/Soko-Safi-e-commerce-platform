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

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/messages');
        if (!response.ok) throw new Error('Failed to load conversations');
        const data = await response.json();
        setConversations(data);
        if (userId) {
          const partner = data.find(conv => conv.partner_id.toString() === userId) ||
            { partner_id: parseInt(userId), partner_name: 'New Chat' };
          setSelectedPartner(partner);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [userId]);

  const fetchVendors = async () => {
    try {
      const response = await fetch('/vendors');
      if (!response.ok) throw new Error('Failed to load vendors');
      const data = await response.json();
      setVendors(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const startNewChat = (vendorId, vendorName) => {
    navigate(`/messages/${vendorId}`);
    setSelectedPartner({ partner_id: vendorId, partner_name: vendorName });
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
    <div className="d-flex" style={{ height: 'calc(100vh - 100px)' }}>
      {/* Sidebar */}
      <div className="border-end bg-white p-3 overflow-auto" style={{ width: '320px' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="m-0">Conversations</h5>
          <button className="btn btn-sm btn-primary" onClick={() => {
            setShowNewChatModal(true);
            fetchVendors();
          }}>
            New Chat
          </button>
        </div>

        <input
          type="text"
          className="form-control mb-3"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {loading ? (
          <div className="text-center text-muted">Loading...</div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center text-muted">No conversations</div>
        ) : (
          <ul className="list-group">
            {filteredConversations.map(conv => (
              <li
                key={conv.partner_id}
                className={`list-group-item list-group-item-action ${selectedPartner?.partner_id === conv.partner_id ? 'active' : ''}`}
                onClick={() => {
                  navigate(`/messages/${conv.partner_id}`);
                  setSelectedPartner(conv);
                }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <strong>{conv.partner_name}</strong>
                  {!conv.read && <span className="badge bg-primary rounded-circle" style={{ width: '10px', height: '10px' }}></span>}
                </div>
                <small className="text-muted d-block text-truncate">{conv.last_message}</small>
                <small className="text-muted">{new Date(conv.timestamp).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-grow-1 p-3 bg-white d-flex flex-column">
        {selectedPartner ? (
          <ChatInterface partnerId={selectedPartner.partner_id} partnerName={selectedPartner.partner_name} />
        ) : (
          <div className="d-flex flex-column justify-content-center align-items-center h-100 text-muted text-center">
            <h4>No conversation selected</h4>
            <p>Select a conversation from the list or start a new one</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showNewChatModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Start New Chat</h5>
                <button type="button" className="btn-close" onClick={() => setShowNewChatModal(false)}></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Search vendors..."
                  value={vendorSearch}
                  onChange={(e) => setVendorSearch(e.target.value)}
                />

                {vendors.length === 0 ? (
                  <div>Loading vendors...</div>
                ) : filteredVendors.length === 0 ? (
                  <div>No vendors found</div>
                ) : (
                  <ul className="list-group">
                    {filteredVendors.map(vendor => (
                      <li
                        key={vendor.id}
                        className="list-group-item list-group-item-action"
                        onClick={() => startNewChat(vendor.id, vendor.username)}
                      >
                        <div className="d-flex align-items-center">
                          <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                            {vendor.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong>{vendor.username}</strong>
                            <div className="text-muted">{vendor.email}</div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessagesPage;
