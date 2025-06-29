import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserProvider';
import { FaShoppingCart, FaStore, FaMapMarkerAlt, FaComments, FaUser } from 'react-icons/fa';

function NavBar() {
    const { user, logout } = useContext(UserContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm sticky-top px-4">
            <NavLink className="navbar-brand d-flex align-items-center gap-2" to="/">
                <FaStore /> Soko Safi
            </NavLink>

            <div className="collapse navbar-collapse justify-content-end">
                <ul className="navbar-nav align-items-center gap-3">
                    <li className="nav-item">
                        <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active fw-bold' : ''}`} to="/nearby">
                            <FaMapMarkerAlt className="me-1" /> Nearby Vendors
                        </NavLink>
                    </li>

                    {user ? (
                        <>
                            {user.role === 'customer' && (
                                <li className="nav-item">
                                    <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active fw-bold' : ''}`} to="/cart">
                                        <FaShoppingCart className="me-1" /> Cart
                                    </NavLink>
                                </li>
                            )}

                            <li className="nav-item">
                                <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active fw-bold' : ''}`} to="/messages">
                                    <FaComments className="me-1" /> Messages
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active fw-bold' : ''}`} to="/profile">
                                    <FaUser className="me-1" /> Profile
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <button onClick={handleLogout} className="btn btn-danger btn-sm ms-2">
                                    Logout
                                </button>
                            </li>
                        </>
                    ) : (
                        <li className="nav-item">
                            <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active fw-bold' : ''}`} to="/login">
                                Login / Sign Up
                            </NavLink>
                        </li>
                    )}
                </ul>
            </div>
        </nav>
    );
}

export default NavBar;
