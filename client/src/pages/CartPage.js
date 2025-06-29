import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../context/UserProvider';
import { useNavigate } from 'react-router-dom';

function CartPage() {
    const { user } = useContext(UserContext);
    const [cart, setCart] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    const removeFromCart = (productId) => {
        const updatedCart = cart.filter(item => item.product_id !== productId);
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    const updateQuantity = (productId, newQuantity) => {
        const updatedCart = cart.map(item =>
            item.product_id === productId ? { ...item, quantity: newQuantity } : item
        );
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    const placeOrder = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch('/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart })
            });

            if (response.ok) {
                localStorage.removeItem('cart');
                setCart([]);
                alert('Order placed successfully!');
                navigate('/profile');
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place order. Please try again.');
        }
    };

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div className="container py-5">
            <h1 className="mb-4 text-center">Your Cart</h1>
            {cart.length === 0 ? (
                <div className="alert alert-info text-center">Your cart is empty</div>
            ) : (
                <>
                    <ul className="list-group mb-4">
                        {cart.map(item => (
                            <li
                                key={item.product_id}
                                className="list-group-item d-flex justify-content-between align-items-center flex-wrap"
                            >
                                <div className="flex-grow-1">
                                    <h5>{item.name}</h5>
                                    <p className="mb-1 text-muted">${item.price.toFixed(2)} each</p>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <input
                                        type="number"
                                        min="1"
                                        className="form-control"
                                        style={{ width: '70px' }}
                                        value={item.quantity}
                                        onChange={(e) =>
                                            updateQuantity(item.product_id, parseInt(e.target.value))
                                        }
                                    />
                                    <button
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => removeFromCart(item.product_id)}
                                    >
                                        Remove
                                    </button>
                                </div>
                                <div>
                                    <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="text-end">
                        <h4 className="mb-3">Total: ${totalPrice.toFixed(2)}</h4>
                        <button className="btn btn-success px-4" onClick={placeOrder}>
                            Place Order
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default CartPage;
