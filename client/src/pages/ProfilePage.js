// client/src/pages/ProfilePage.js
import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/UserProvider';
import { useFormik } from 'formik';
import * as Yup from 'yup';

function ProfilePage() {
    const { user, loading } = useContext(UserContext);
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    
    useEffect(() => {
        if (user) {
            if (user.role === 'customer') {
                fetch('/orders').then(r => r.json()).then(setOrders);
            }
            if (user.role === 'vendor') {
                setProducts(user.products || []);
            }
        }
    }, [user]);

    // Formik for new product
    const formik = useFormik({
        initialValues: { name: '', description: '', price: '', image_url: '' },
        validationSchema: Yup.object({
            name: Yup.string().required('Required'),
            price: Yup.number().positive('Must be positive').required('Required'), // Data type validation
            image_url: Yup.string().url('Must be a valid URL').required('Required'),
        }),
        onSubmit: async (values, { resetForm }) => {
            const response = await fetch('/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });
            if (response.ok) {
                const newProduct = await response.json();
                setProducts([...products, newProduct]);
                resetForm();
            } else {
                alert('Failed to create product');
            }
        },
    });

    if (loading) return <p>Loading profile...</p>;
    if (!user) return <p>Please log in to view your profile.</p>;

    return (
        <div>
            <h1>Welcome, {user.username}!</h1>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>

            {user.role === 'vendor' && (
                <div>
                    <h2>Your Products</h2>
                    <ul>
                        {products.map(p => <li key={p.id}>{p.name} - ${p.price}</li>)}
                    </ul>
                    <h3>Add a New Product</h3>
                    <form onSubmit={formik.handleSubmit}>
                        <input type="text" placeholder="Product Name" {...formik.getFieldProps('name')} />
                        {formik.touched.name && formik.errors.name && <div>{formik.errors.name}</div>}
                        <input type="text" placeholder="Description" {...formik.getFieldProps('description')} />
                        <input type="number" placeholder="Price" {...formik.getFieldProps('price')} />
                         {formik.touched.price && formik.errors.price && <div>{formik.errors.price}</div>}
                        <input type="text" placeholder="Image URL" {...formik.getFieldProps('image_url')} />
                         {formik.touched.image_url && formik.errors.image_url && <div>{formik.errors.image_url}</div>}
                        <button type="submit">Add Product</button>
                    </form>
                </div>
            )}

            {user.role === 'customer' && (
                <div>
                    <h2>Your Orders</h2>
                    {orders.length > 0 ? (
                        <ul>
                            {orders.map(order => (
                                <li key={order.id}>
                                    Order #{order.id} - {new Date(order.order_date).toLocaleDateString()} - Status: {order.status}
                                </li>
                            ))}
                        </ul>
                    ) : <p>You have no orders.</p>}
                </div>
            )}
        </div>
    );
}

export default ProfilePage;