import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { UserContext } from '../context/UserProvider';

function AuthForm({ isLogin }) {
    const { login } = useContext(UserContext);
    const navigate = useNavigate();

    const validationSchema = Yup.object({
        username: Yup.string().required('Required'),
        password: Yup.string().min(6, 'Must be at least 6 characters').required('Required'),
        ...(!isLogin && {
            email: Yup.string().email('Invalid email format').required('Required'),
            role: Yup.string().oneOf(['customer', 'vendor']).required('Required'),
        }),
    });

    const formik = useFormik({
        initialValues: {
            username: '',
            password: '',
            email: '',
            role: 'customer'
        },
        validationSchema,
        onSubmit: async (values, { setErrors }) => {
            const endpoint = isLogin ? '/login' : '/signup';
            try {
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}${endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values),
                });
                if (response.ok) {
                    const userData = await response.json();
                    login(userData);
                    navigate('/profile');
                } else {
                    const errorData = await response.json();
                    setErrors({ api: errorData.error || 'An error occurred.' });
                }
            } catch (error) {
                setErrors({ api: 'Network error. Please try again.' });
            }
        },
    });

    return (
        <form onSubmit={formik.handleSubmit}>
            <div className="mb-3">
                <label htmlFor="username" className="form-label">Username</label>
                <input
                    id="username"
                    type="text"
                    className={`form-control ${formik.touched.username && formik.errors.username ? 'is-invalid' : ''}`}
                    {...formik.getFieldProps('username')}
                />
                {formik.touched.username && formik.errors.username && (
                    <div className="invalid-feedback">{formik.errors.username}</div>
                )}
            </div>

            {!isLogin && (
                <>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            id="email"
                            type="email"
                            className={`form-control ${formik.touched.email && formik.errors.email ? 'is-invalid' : ''}`}
                            {...formik.getFieldProps('email')}
                        />
                        {formik.touched.email && formik.errors.email && (
                            <div className="invalid-feedback">{formik.errors.email}</div>
                        )}
                    </div>

                    <div className="mb-3">
                        <label htmlFor="role" className="form-label">I am a:</label>
                        <select
                            id="role"
                            className={`form-select ${formik.touched.role && formik.errors.role ? 'is-invalid' : ''}`}
                            {...formik.getFieldProps('role')}
                        >
                            <option value="customer">Customer</option>
                            <option value="vendor">Vendor</option>
                        </select>
                        {formik.touched.role && formik.errors.role && (
                            <div className="invalid-feedback">{formik.errors.role}</div>
                        )}
                    </div>
                </>
            )}

            <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                    id="password"
                    type="password"
                    className={`form-control ${formik.touched.password && formik.errors.password ? 'is-invalid' : ''}`}
                    {...formik.getFieldProps('password')}
                />
                {formik.touched.password && formik.errors.password && (
                    <div className="invalid-feedback">{formik.errors.password}</div>
                )}
            </div>

            {formik.errors.api && (
                <div className="alert alert-danger">{formik.errors.api}</div>
            )}

            <div className="d-grid">
                <button type="submit" className="btn btn-primary">
                    {isLogin ? 'Login' : 'Sign Up'}
                </button>
            </div>
        </form>
    );
}

export default AuthForm;
