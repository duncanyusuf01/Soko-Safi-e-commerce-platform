// client/src/pages/AuthPage.js

import React, { useState } from 'react';
import AuthForm from '../components/AuthForm';

function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div>
            <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
            <AuthForm isLogin={isLogin} />
            <button onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'Need an account? Sign Up' : 'Have an account? Login'}
            </button>
        </div>
    );
}

export default AuthPage;