import React, { useState } from 'react';
import AuthForm from '../components/AuthForm';

function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="container d-flex align-items-center justify-content-center min-vh-100">
            <div className="card shadow-sm p-4" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 className="text-center mb-4">{isLogin ? 'Login' : 'Sign Up'}</h2>

                <AuthForm isLogin={isLogin} />

                <div className="text-center mt-3">
                    <button
                        className="btn btn-link text-decoration-none"
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? 'Need an account? Sign Up' : 'Have an account? Login'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AuthPage;
