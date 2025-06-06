import React, { useState, useEffect } from "react";
import { useMediaQuery } from 'react-responsive';
import { useNavigate, useLocation } from "react-router-dom";
import "../css/Navbar.css";
import logo from '../../Images/logo2.png';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const isMobile = useMediaQuery({ maxWidth: 768 });
    const isDesktop = useMediaQuery({ minWidth: 767 });

    const [menuOpen, setMenuOpen] = useState(false);

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
                            {/* <h3 className="nav-logo mt-1">Online Marketplace</h3> */}
                        </div>
                        <div>
                            <ul className="nav-list">
                                <li className="nav-item" onClick={() => { navigate('/') }}>Home</li>
                                <li className="nav-item" onClick={() => { navigate('/about-us') }}>About Us</li>
                                <li className="nav-item" onClick={() => { navigate('/journeyers-anteroom') }}>Link 1</li>
                                <li className="nav-item" onClick={() => { navigate('/consult-oracle') }}>Link 2</li>
                            </ul>
                        </div>
                        <div>
                            <div className="nav-list">
                                <div className="nav-item" onClick={() => { navigate('/signup') }}>SignUp</div>
                                <div className="nav-item" onClick={() => { navigate('/signup') }}>SignIn</div>
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
                                <li className="nav-item" onClick={() => { navigate('/about-us') }}>About Us</li>
                                <li className="nav-item" onClick={() => { navigate('/journeyers-anteroom') }}>Journeyer's Anteroom</li>
                                <li className="nav-item" onClick={() => { navigate('/consult-oracle') }}>Consult Oracle</li>
                                <li className="nav-item" onClick={() => { navigate('/sacred-library') }}>Sacred Library</li>
                                <>
                                    <li className="nav-item" onClick={() => { navigate('/signup') }}>Signup</li>
                                    <li className="nav-item" onClick={() => { navigate('/login') }}>Sign In</li>
                                </> 
                            </ul>
                        </div>
                    </div>
                )}

            </div>
        </nav>
    );
};

export default Navbar;
