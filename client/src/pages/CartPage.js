// client/src/pages/CartPage.js

import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../context/UserProvider';
import { useNavigate } from 'react-router-dom';

function CartPage() {
    const { user } = useContext(UserContext);
    const [cart, setCart] = useState([]);
    const navigate = useNavigate();

    // Load cart from localStorage
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
        <div>
            <h1>Your Cart</h1>
            {cart.length === 0 ? (
                <p>Your cart is empty</p>
            ) : (
                <>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {cart.map(item => (
                            <li key={item.product_id} style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                margin: '10px 0',
                                padding: '10px',
                                border: '1px solid #eee'
                            }}>
                                <div>
                                    <h3>{item.name}</h3>
                                    <p>${item.price.toFixed(2)} each</p>
                                </div>
                                <div>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        value={item.quantity}
                                        onChange={(e) => updateQuantity(item.product_id, parseInt(e.target.value))}
                                        style={{ width: '50px', marginRight: '10px' }}
                                    />
                                    <button onClick={() => removeFromCart(item.product_id)}>
                                        Remove
                                    </button>
                                </div>
                                <p>${(item.price * item.quantity).toFixed(2)}</p>
                            </li>
                        ))}
                    </ul>
                    <div style={{ textAlign: 'right', marginTop: '20px' }}>
                        <h3>Total: ${totalPrice.toFixed(2)}</h3>
                        <button onClick={placeOrder} style={{ padding: '10px 20px' }}>
                            Place Order
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default CartPage;