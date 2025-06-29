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

    if (loading) return <div className="text-center my-5">Loading product...</div>;
    if (!product) return <div className="text-center text-danger my-5">Product not found</div>;

    return (
        <div className="container py-5">
            <div className="row g-5">
                {/* Product Image */}
                <div className="col-md-6">
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="img-fluid rounded shadow-sm"
                    />
                </div>

                {/* Product Details */}
                <div className="col-md-6">
                    <h1 className="mb-3">{product.name}</h1>
                    <h4 className="text-primary mb-4">${product.price.toFixed(2)}</h4>
                    <p className="mb-4">{product.description}</p>

                    <p className="mb-4">
                        Sold by:{' '}
                        <a href={`/vendors/${product.vendor.id}`} className="text-decoration-underline">
                            {product.vendor.username}
                        </a>
                    </p>

                    {/* Customer Actions */}
                    {user?.role === 'customer' && (
                        <div className="mb-4">
                            <div className="mb-3 d-flex align-items-center gap-3">
                                <label htmlFor="quantity" className="form-label m-0">
                                    Quantity:
                                </label>
                                <input
                                    type="number"
                                    id="quantity"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
                                    className="form-control"
                                    style={{ width: '80px' }}
                                />
                            </div>
                            <button onClick={addToCart} className="btn btn-primary">
                                Add to Cart
                            </button>
                        </div>
                    )}

                    {/* Vendor Actions */}
                    {user?.id === product.vendor.id && (
                        <div className="mt-4">
                            <button
                                onClick={() => navigate(`/products/${product.id}/edit`)}
                                className="btn btn-success me-2"
                            >
                                Edit Product
                            </button>
                            <button
                                onClick={() => {

                                }}
                                className="btn btn-danger"
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