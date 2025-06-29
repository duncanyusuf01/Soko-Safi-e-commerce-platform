// client/src/components/AuthForm.js

import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { UserContext } from '../context/UserProvider';

function AuthForm({ isLogin }) {
    const { login } = useContext(UserContext);
    const navigate = useNavigate();

    // Validation Schema using Yup
    const validationSchema = Yup.object({
        username: Yup.string().required('Required'),
        password: Yup.string()
            .min(6, 'Must be at least 6 characters')
            .required('Required'),
        // Conditional validation for sign up
        ...(!isLogin && {
            email: Yup.string().email('Invalid email format').required('Required'), // String format validation
            role: Yup.string().oneOf(['customer', 'vendor']).required('Required')
        })
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
                const response = await fetch(endpoint, {
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
            <div>
                <label htmlFor="username">Username</label>
                <input id="username" type="text" {...formik.getFieldProps('username')} />
                {formik.touched.username && formik.errors.username ? <div>{formik.errors.username}</div> : null}
            </div>
            
            {!isLogin && (
                <>
                    <div>
                        <label htmlFor="email">Email</label>
                        <input id="email" type="email" {...formik.getFieldProps('email')} />
                        {formik.touched.email && formik.errors.email ? <div>{formik.errors.email}</div> : null}
                    </div>
                    <div>
                        <label htmlFor="role">I am a:</label>
                        <select id="role" {...formik.getFieldProps('role')}>
                            <option value="customer">Customer</option>
                            <option value="vendor">Vendor</option>
                        </select>
                        {formik.touched.role && formik.errors.role ? <div>{formik.errors.role}</div> : null}
                    </div>
                </>
            )}

            <div>
                <label htmlFor="password">Password</label>
                <input id="password" type="password" {...formik.getFieldProps('password')} />
                {formik.touched.password && formik.errors.password ? <div>{formik.errors.password}</div> : null}
            </div>

            {formik.errors.api && <div>{formik.errors.api}</div>}

            <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
        </form>
    );
}

export default AuthForm;