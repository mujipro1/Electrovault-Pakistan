import React, { useState, useEffect } from "react";
import { useMediaQuery } from 'react-responsive';
import { useNavigate, useLocation } from "react-router-dom";
import logo from '../../Images/logo2.png';

const AdminNavbar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const isMobile = useMediaQuery({ maxWidth: 768 });
    const isDesktop = useMediaQuery({ minWidth: 767 });

    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const logout = () => {
        localStorage.removeItem("adminToken");
        navigate("/");
    };

    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    return (
        <nav className="">
            <div className={`nav-row pt-2 atTop`}>

                {isDesktop &&
                    <div className="d-flex justify-content-between">
                        <div>
                            <img src={logo} className="pt-1 nav-logo" onClick={() => { navigate('/') }} alt="Logo" />
                        </div>
                        <div>
                            <ul className="nav-list">
                                <li className="nav-item" onClick={() => { navigate('/') }}>Home</li>
                                <li className="nav-item" onClick={() => { navigate('/admin') }}>Admin Dashboard</li>
                                <li className="nav-item" onClick={() => { navigate('/admin/shops') }}>Shops</li>
                                <li className="nav-item" onClick={() => { navigate('/admin/sellers') }}>Sellers</li>
                                <li className="nav-item" onClick={() => { navigate('/admin/comissions') }}>Commissions</li>
                                <li className="nav-item" onClick={() => { navigate('/admin/invoices') }}>Invoices</li>
                            </ul>
                        </div>
                        <div>
                            <div className="nav-list">
                                <div className="nav-item" onClick={() => { setShowLogoutModal(true) }}>Logout</div>
                            </div>
                        </div>
                    </div>
                }

                {isMobile && (
                    <div className="d-flex nav-h-mobile justify-content-between align-items-center">
                        <div>
                            <img src={logo} className="nav-logo" onClick={() => { navigate('/') }} alt="Logo" />
                        </div>
                        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
                            <div className={`line ${menuOpen ? "baropen" : ""} white`}></div>
                            <div className={`line ${menuOpen ? "baropen" : ""} white`}></div>
                            <div className={`line ${menuOpen ? "baropen" : ""} white`}></div>
                        </div>
                        <div className={`mobile-nav ${menuOpen ? "open" : ""}`}>
                            <ul>
                            <li className="nav-item" onClick={() => { navigate('/') }}>Home</li>
                                <li className="nav-item" onClick={() => { navigate('/admin') }}>Admin Dashboard</li>
                                <li className="nav-item" onClick={() => { navigate('/admin/shops') }}>Shops</li>
                                <li className="nav-item" onClick={() => { navigate('/admin/sellers') }}>Sellers</li>
                                <li className="nav-item" onClick={() => { navigate('/admin/comissions') }}>Commissions</li>
                                <li className="nav-item" onClick={() => { navigate('/admin/invoices') }}>Invoices</li>
                                <li className="nav-item" onClick={() => { setShowLogoutModal(true) }}>Logout</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            {/* Logout Modal */}
            {showLogoutModal && (
                <div className="modal-overlay text-of-app">
                    <div className="modal-content">
                        <h4 className="text-of-app">Are you sure you want to logout?</h4>
                        <div className="modal-buttons">
                            <button className="btn text-of-app btn-confirm" onClick={logout}>Yes</button>
                            <button className="btn text-of-app btn-cancel" onClick={() => setShowLogoutModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default AdminNavbar;
