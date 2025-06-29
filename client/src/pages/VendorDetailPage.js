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
    const [activeTab, setActiveTab] = useState('products');

    useEffect(() => {
        const fetchVendorData = async () => {
            try {
                const vendorRes = await fetch(`/vendors/${id}`);
                if (!vendorRes.ok) return navigate('/');
                const vendorData = await vendorRes.json();
                setVendor(vendorData);

                const productsRes = await fetch('/products');
                if (productsRes.ok) {
                    const allProducts = await productsRes.json();
                    const vendorProducts = allProducts.filter(p => p.vendor.id === parseInt(id));
                    setProducts(vendorProducts);
                }
            } catch (err) {
                console.error(err);
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchVendorData();
    }, [id, navigate]);

    if (loading) return <div className="text-center mt-5"><div className="spinner-border" /></div>;
    if (!vendor) return <div className="alert alert-danger text-center">Vendor not found</div>;

    return (
        <div className="container py-4">
            {/* Vendor Profile */}
            <div className="row mb-4">
                <div className="col-md-3 text-center">
                    <div className="rounded-circle overflow-hidden border border-2 shadow" style={{ width: 150, height: 150, margin: '0 auto' }}>
                        {vendor.image_url ? (
                            <img src={vendor.image_url} alt={vendor.username} className="img-fluid h-100 w-100 object-fit-cover" />
                        ) : (
                            <div className="bg-light w-100 h-100 d-flex align-items-center justify-content-center text-muted">No Image</div>
                        )}
                    </div>
                </div>
                <div className="col-md-9">
                    <h2>{vendor.username}</h2>
                    <p className="text-muted">{vendor.bio || 'No description provided.'}</p>
                    <div className="row mb-2">
                        <div className="col-sm-6"><strong>Location:</strong> {vendor.address || 'Not specified'}</div>
                        <div className="col-sm-6"><strong>Rating:</strong> {vendor.rating ? `${vendor.rating}/5` : 'Not rated'}</div>
                    </div>
                    <div className="d-flex flex-wrap gap-3 align-items-center">
                        <button className="btn btn-primary" onClick={() => user ? setActiveTab('chat') : navigate('/login')}>
                            Contact Vendor
                        </button>
                        {vendor.social_links && (
                            <div className="d-flex gap-2">
                                {vendor.social_links.facebook && (
                                    <a href={vendor.social_links.facebook} target="_blank" rel="noreferrer">
                                        <img src="/facebook-icon.png" alt="Facebook" width="24" />
                                    </a>
                                )}
                                {vendor.social_links.instagram && (
                                    <a href={vendor.social_links.instagram} target="_blank" rel="noreferrer">
                                        <img src="/instagram-icon.png" alt="Instagram" width="24" />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Location Block */}
            {vendor.address && (
                <div className="bg-light p-3 rounded shadow-sm mb-4">
                    <h5 className="mb-2">Business Location</h5>
                    <p className="mb-1">{vendor.address}</p>
                    {vendor.latitude && vendor.longitude && (
                        <small className="text-muted">
                            Coordinates: {vendor.latitude.toFixed(4)}, {vendor.longitude.toFixed(4)}
                        </small>
                    )}
                </div>
            )}

            {/* Tab Navigation */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        Products ({products.length})
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'about' ? 'active' : ''}`}
                        onClick={() => setActiveTab('about')}
                    >
                        About
                    </button>
                </li>
                {user && (
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'chat' ? 'active' : ''}`}
                            onClick={() => setActiveTab('chat')}
                        >
                            Chat
                        </button>
                    </li>
                )}
            </ul>

            {/* Tab Content */}
            <div>
                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div className="row g-4">
                        {products.length > 0 ? (
                            products.map(product => (
                                <div className="col-md-4" key={product.id}>
                                    <ProductCard product={product} />
                                </div>
                            ))
                        ) : (
                            <p className="text-muted">This vendor has no products listed yet.</p>
                        )}
                    </div>
                )}

                {/* About Tab */}
                {activeTab === 'about' && (
                    <div className="bg-white p-4 rounded border shadow-sm">
                        <h5>About {vendor.username}</h5>
                        <p>{vendor.bio || 'No additional information available.'}</p>
                        <div className="mt-3">
                            <h6>Business Information</h6>
                            <ul className="list-unstyled">
                                <li><strong>Location:</strong> {vendor.address || 'Not specified'}</li>
                                <li><strong>Operating Hours:</strong> {vendor.operating_hours || 'Not specified'}</li>
                                <li><strong>Established:</strong> {vendor.established_year || 'Not specified'}</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Chat Tab */}
                {activeTab === 'chat' && user && (
                    <div className="border rounded p-3 bg-light shadow-sm">
                        <ChatInterface partnerId={vendor.id} partnerName={vendor.username} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default VendorDetailPage;
