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
                fetch('/orders').then((r) => r.json()).then(setOrders);
            }
            if (user.role === 'vendor') {
                setProducts(user.products || []);
            }
        }
    }, [user]);

    const formik = useFormik({
        initialValues: {
            name: '',
            description: '',
            price: '',
            image_url: '',
        },
        validationSchema: Yup.object({
            name: Yup.string().required('Required'),
            price: Yup.number().positive('Must be positive').required('Required'),
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

    if (loading) return <div className="text-center my-5"><div className="spinner-border" role="status" /></div>;
    if (!user) return <div className="container mt-5"><div className="alert alert-warning">Please log in to view your profile.</div></div>;

    return (
        <div className="container py-5">
            <div className="mb-4">
                <h1 className="mb-1">Welcome, {user.username}!</h1>
                <p>Email: <strong>{user.email}</strong></p>
                <p>Role: <span className="badge bg-secondary text-capitalize">{user.role}</span></p>
            </div>

            {/* Vendor Section */}
            {user.role === 'vendor' && (
                <div className="mt-5">
                    <h2 className="mb-3">Your Products</h2>

                    {products.length > 0 ? (
                        <ul className="list-group mb-4">
                            {products.map((p) => (
                                <li key={p.id} className="list-group-item d-flex justify-content-between align-items-center">
                                    <span>{p.name}</span>
                                    <span className="badge bg-primary">${p.price}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="alert alert-info">You haven’t added any products yet.</div>
                    )}

                    <h3 className="mb-3">Add New Product</h3>
                    <form onSubmit={formik.handleSubmit} className="row g-3">
                        <div className="col-md-6">
                            <input
                                type="text"
                                className={`form-control ${formik.touched.name && formik.errors.name ? 'is-invalid' : ''}`}
                                placeholder="Product Name"
                                {...formik.getFieldProps('name')}
                            />
                            {formik.touched.name && formik.errors.name && (
                                <div className="invalid-feedback">{formik.errors.name}</div>
                            )}
                        </div>

                        <div className="col-md-6">
                            <input
                                type="number"
                                className={`form-control ${formik.touched.price && formik.errors.price ? 'is-invalid' : ''}`}
                                placeholder="Price"
                                {...formik.getFieldProps('price')}
                            />
                            {formik.touched.price && formik.errors.price && (
                                <div className="invalid-feedback">{formik.errors.price}</div>
                            )}
                        </div>

                        <div className="col-12">
                            <textarea
                                rows="3"
                                className="form-control"
                                placeholder="Description (optional)"
                                {...formik.getFieldProps('description')}
                            />
                        </div>

                        <div className="col-12">
                            <input
                                type="text"
                                className={`form-control ${formik.touched.image_url && formik.errors.image_url ? 'is-invalid' : ''}`}
                                placeholder="Image URL"
                                {...formik.getFieldProps('image_url')}
                            />
                            {formik.touched.image_url && formik.errors.image_url && (
                                <div className="invalid-feedback">{formik.errors.image_url}</div>
                            )}
                        </div>

                        <div className="col-12">
                            <button type="submit" className="btn btn-success">Add Product</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Customer Section */}
            {user.role === 'customer' && (
                <div className="mt-5">
                    <h2 className="mb-3">Your Orders</h2>
                    {orders.length > 0 ? (
                        <ul className="list-group">
                            {orders.map((order) => (
                                <li key={order.id} className="list-group-item">
                                    <strong>Order #{order.id}</strong> – {new Date(order.order_date).toLocaleDateString()}<br />
                                    <span className="text-muted">Status: {order.status}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="alert alert-info">You haven’t placed any orders yet.</div>
                    )}
                </div>
            )}
        </div>
    );
}

export default ProfilePage;
