// client/src/components/NavBar.js

import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserProvider';
import { FaShoppingCart, FaStore, FaMapMarkerAlt, FaComments, FaUser } from 'react-icons/fa';

function NavBar() {
    const { user, logout } = useContext(UserContext);
    const navigate = useNavigate();

    const navStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 30px',
        backgroundColor: '#2c3e50',
        color: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
    };

    const logoStyle = {
        fontSize: '24px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    };

    const linkContainerStyle = {
        display: 'flex',
        gap: '20px',
        alignItems: 'center'
    };

    const linkStyle = {
        color: 'white',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        padding: '8px 12px',
        borderRadius: '4px',
        transition: 'all 0.3s ease'
    };

    const activeLinkStyle = {
        backgroundColor: '#3498db',
        fontWeight: 'bold'
    };

    const buttonStyle = {
        ...linkStyle,
        backgroundColor: '#e74c3c',
        border: 'none',
        cursor: 'pointer'
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav style={navStyle}>
            <NavLink to="/" style={logoStyle}>
                <FaStore /> Soko Safi
            </NavLink>

            <div style={linkContainerStyle}>
                <NavLink 
                    to="/nearby" 
                    style={({ isActive }) => isActive ? { ...linkStyle, ...activeLinkStyle } : linkStyle}
                >
                    <FaMapMarkerAlt /> Nearby Vendors
                </NavLink>

                {user ? (
                    <>
                        {user.role === 'customer' && (
                            <NavLink 
                                to="/cart" 
                                style={({ isActive }) => isActive ? { ...linkStyle, ...activeLinkStyle } : linkStyle}
                            >
                                <FaShoppingCart /> Cart
                            </NavLink>
                        )}
                        
                        <NavLink 
                            to="/messages" 
                            style={({ isActive }) => isActive ? { ...linkStyle, ...activeLinkStyle } : linkStyle}
                        >
                            <FaComments /> Messages
                        </NavLink>

                        <NavLink 
                            to="/profile" 
                            style={({ isActive }) => isActive ? { ...linkStyle, ...activeLinkStyle } : linkStyle}
                        >
                            <FaUser /> Profile
                        </NavLink>

                        <button onClick={handleLogout} style={buttonStyle}>
                            Logout
                        </button>
                    </>
                ) : (
                    <NavLink 
                        to="/login" 
                        style={({ isActive }) => isActive ? { ...linkStyle, ...activeLinkStyle } : linkStyle}
                    >
                        Login / Sign Up
                    </NavLink>
                )}
            </div>
        </nav>
    );
}

export default NavBar;