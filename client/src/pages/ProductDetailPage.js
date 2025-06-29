// client/src/pages/ProductDetailPage.js

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserProvider';

function ProductDetailPage() {
    const { id } = useParams();
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`/products/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setProduct(data);
                } else {
                    navigate('/');
                }
            } catch (error) {
                console.error("Error fetching product:", error);
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id, navigate]);

    const addToCart = () => {
        const cartItem = {
            product_id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity
        };

        const existingCart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItemIndex = existingCart.findIndex(item => item.product_id === product.id);

        if (existingItemIndex >= 0) {
            existingCart[existingItemIndex].quantity += quantity;
        } else {
            existingCart.push(cartItem);
        }

        localStorage.setItem('cart', JSON.stringify(existingCart));
        alert('Added to cart!');
    };

    if (loading) return <p>Loading product...</p>;
    if (!product) return <p>Product not found</p>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <div style={{ display: 'flex', gap: '40px' }}>
                <div style={{ flex: 1 }}>
                    <img 
                        src={product.image_url} 
                        alt={product.name} 
                        style={{ width: '100%', borderRadius: '8px' }} 
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <h1>{product.name}</h1>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '20px 0' }}>
                        ${product.price.toFixed(2)}
                    </p>
                    <p style={{ margin: '20px 0' }}>{product.description}</p>
                    
                    <div style={{ margin: '20px 0' }}>
                        <p>Sold by: <a href={`/vendors/${product.vendor.id}`}>{product.vendor.username}</a></p>
                    </div>

                    {user?.role === 'customer' && (
                        <div style={{ marginTop: '40px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                <label htmlFor="quantity">Quantity:</label>
                                <input 
                                    type="number" 
                                    id="quantity" 
                                    min="1" 
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
                                    style={{ width: '60px', padding: '5px' }}
                                />
                            </div>
                            <button 
                                onClick={addToCart}
                                style={{ 
                                    padding: '10px 20px', 
                                    backgroundColor: '#007bff', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Add to Cart
                            </button>
                        </div>
                    )}

                    {user?.id === product.vendor.id && (
                        <div style={{ marginTop: '20px' }}>
                            <button 
                                onClick={() => navigate(`/products/${product.id}/edit`)}
                                style={{ 
                                    padding: '10px 20px', 
                                    backgroundColor: '#28a745', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    marginRight: '10px'
                                }}
                            >
                                Edit Product
                            </button>
                            <button 
                                onClick={() => {/* Add delete functionality */}}
                                style={{ 
                                    padding: '10px 20px', 
                                    backgroundColor: '#dc3545', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Delete Product
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProductDetailPage;