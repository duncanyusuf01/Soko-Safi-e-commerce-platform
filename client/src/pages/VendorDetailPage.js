// client/src/pages/VendorDetailPage.js

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ChatInterface from '../components/ChatInterface';
import { UserContext } from '../context/UserProvider';

function VendorDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const [vendor, setVendor] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showChat, setShowChat] = useState(false);
    const [activeTab, setActiveTab] = useState('products');

    useEffect(() => {
        const fetchVendorData = async () => {
            try {
                // Fetch vendor info
                const vendorResponse = await fetch(`/vendors/${id}`);
                if (!vendorResponse.ok) {
                    navigate('/');
                    return;
                }
                const vendorData = await vendorResponse.json();
                setVendor(vendorData);

                // Fetch vendor's products
                const productsResponse = await fetch('/products');
                if (productsResponse.ok) {
                    const allProducts = await productsResponse.json();
                    const vendorProducts = allProducts.filter(p => p.vendor.id === parseInt(id));
                    setProducts(vendorProducts);
                }
            } catch (error) {
                console.error("Error fetching vendor data:", error);
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchVendorData();
    }, [id, navigate]);

    const handleContactVendor = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setShowChat(true);
        setActiveTab('chat');
    };

    if (loading) return <p>Loading vendor...</p>;
    if (!vendor) return <p>Vendor not found</p>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <div style={{ 
                display: 'flex', 
                gap: '40px', 
                marginBottom: '40px',
                flexDirection: 'column'
            }}>
                {/* Vendor Header Section */}
                <div style={{
                    display: 'flex',
                    gap: '30px',
                    alignItems: 'flex-start'
                }}>
                    <div style={{
                        width: '150px',
                        height: '150px',
                        borderRadius: '50%',
                        backgroundColor: '#f0f0f0',
                        overflow: 'hidden',
                        flexShrink: 0
                    }}>
                        {vendor.image_url && (
                            <img 
                                src={vendor.image_url} 
                                alt={vendor.username} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        )}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                        <h1 style={{ marginBottom: '10px' }}>{vendor.username}</h1>
                        <p style={{ color: '#666', marginBottom: '15px' }}>{vendor.bio || 'No description provided'}</p>
                        
                        <div style={{ 
                            display: 'flex', 
                            gap: '20px',
                            marginBottom: '20px'
                        }}>
                            <div>
                                <strong>Location:</strong> {vendor.address || 'Not specified'}
                            </div>
                            <div>
                                <strong>Rating:</strong> {vendor.rating ? `${vendor.rating}/5` : 'Not rated'}
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button 
                                onClick={handleContactVendor}
                                style={{ 
                                    padding: '10px 20px', 
                                    backgroundColor: '#007bff', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Contact Vendor
                            </button>
                            
                            {vendor.social_links && (
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    {vendor.social_links.facebook && (
                                        <a href={vendor.social_links.facebook} target="_blank" rel="noopener noreferrer">
                                            <img src="/facebook-icon.png" alt="Facebook" style={{ width: '24px' }} />
                                        </a>
                                    )}
                                    {vendor.social_links.instagram && (
                                        <a href={vendor.social_links.instagram} target="_blank" rel="noopener noreferrer">
                                            <img src="/instagram-icon.png" alt="Instagram" style={{ width: '24px' }} />
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Simple Location Display */}
                {vendor.address && (
                    <div style={{ 
                        padding: '15px', 
                        backgroundColor: '#f5f5f5', 
                        borderRadius: '8px',
                        margin: '20px 0'
                    }}>
                        <h3 style={{ marginBottom: '10px' }}>Business Location</h3>
                        <p>{vendor.address}</p>
                        {vendor.latitude && vendor.longitude && (
                            <p style={{ color: '#666', marginTop: '5px' }}>
                                Coordinates: {vendor.latitude.toFixed(4)}, {vendor.longitude.toFixed(4)}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Tab Navigation */}
            <div style={{ 
                display: 'flex', 
                borderBottom: '1px solid #ddd',
                marginBottom: '20px'
            }}>
                <button
                    style={{
                        padding: '10px 20px',
                        backgroundColor: activeTab === 'products' ? '#f0f0f0' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'products' ? 'bold' : 'normal'
                    }}
                    onClick={() => setActiveTab('products')}
                >
                    Products ({products.length})
                </button>
                <button
                    style={{
                        padding: '10px 20px',
                        backgroundColor: activeTab === 'about' ? '#f0f0f0' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'about' ? 'bold' : 'normal'
                    }}
                    onClick={() => setActiveTab('about')}
                >
                    About
                </button>
                {user && (
                    <button
                        style={{
                            padding: '10px 20px',
                            backgroundColor: activeTab === 'chat' ? '#f0f0f0' : 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: activeTab === 'chat' ? 'bold' : 'normal'
                        }}
                        onClick={() => {
                            if (!user) {
                                navigate('/login');
                                return;
                            }
                            setActiveTab('chat');
                            setShowChat(true);
                        }}
                    >
                        Chat
                    </button>
                )}
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'products' && (
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                        gap: '20px',
                        marginTop: '20px'
                    }}>
                        {products.length > 0 ? (
                            products.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))
                        ) : (
                            <p>This vendor has no products listed yet.</p>
                        )}
                    </div>
                )}

                {activeTab === 'about' && (
                    <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                        <h3>About {vendor.username}</h3>
                        <p>{vendor.bio || 'No additional information available.'}</p>
                        
                        <div style={{ marginTop: '20px' }}>
                            <h4>Business Information</h4>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                <li><strong>Location:</strong> {vendor.address || 'Not specified'}</li>
                                <li><strong>Operating Hours:</strong> {vendor.operating_hours || 'Not specified'}</li>
                                <li><strong>Established:</strong> {vendor.established_year || 'Not specified'}</li>
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 'chat' && user && (
                    <div style={{ 
                        border: '1px solid #ddd', 
                        borderRadius: '8px', 
                        padding: '20px',
                        backgroundColor: '#fff'
                    }}>
                        <ChatInterface partnerId={vendor.id} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default VendorDetailPage;