import { FaShoppingCart, FaSearch } from "react-icons/fa";
import React, { useState, useEffect, useRef } from "react";
import { useMediaQuery } from 'react-responsive';
import { useNavigate, useLocation } from "react-router-dom";
import logo from '../../Images/logo2.png';
import axios from 'axios';

const UserNavbar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const isMobile = useMediaQuery({ maxWidth: 768 });
    const isDesktop = useMediaQuery({ minWidth: 767 });

    const [menuOpen, setMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSeller, setIsSeller] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchDropdownVisible, setSearchDropdownVisible] = useState(false);

    const searchRef = useRef(null);
    const dropdownRef = useRef(null);

    const logout = () => {
        localStorage.removeItem("userToken");
        setIsLoggedIn(false);
        setShowLogoutModal(false);
        navigate("/");
        window.location.reload();
    };

    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const userToken = localStorage.getItem("userToken");
        setIsLoggedIn(!!userToken);
    }, []);

    useEffect(() => {
        const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
        setCartCount(cartItems.length);
    }, [location.pathname]);

    useEffect(() => {
        const updateCartCount = () => {
            const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
            setCartCount(cartItems.length);
        };

        updateCartCount(); // Initial load

        window.addEventListener("cartUpdated", updateCartCount);
        return () => window.removeEventListener("cartUpdated", updateCartCount);
    }, []);

    useEffect(() => {
        const adminToken = localStorage.getItem("adminToken");
        const sellerToken = localStorage.getItem("sellerToken");
        setIsAdmin(!!adminToken);
        setIsSeller(!!sellerToken);
    }, []);

    useEffect(() => {
        // Fetch product names and categories
        const fetchData = async () => {
            try {
                const productRes = await axios.get('/api/products/fetchProductNames');
                setProducts(productRes.data); 
                
                const categoryRes = await axios.get('/api/categories');
                setCategories(categoryRes.data); // Assume this returns an array of category objects with a `title` and `id`
            } catch (error) {
                console.error("Error fetching product names or categories", error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        // Hide dropdown when clicking outside search input or dropdown
        const handleClickOutside = (event) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setSearchDropdownVisible(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = async () => {
        if (searchQuery.length >= 1) {
            const results = [];

            // Search for products and categories
            const filteredProducts = products.filter(product =>
                product.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
            const filteredCategories = categories.filter(category =>
                category.title.toLowerCase().includes(searchQuery.toLowerCase())
            );

            filteredProducts.forEach(product => {
                results.push({ type: 'Product', title: product.title, id: product.id });
            });
            filteredCategories.forEach(category => {
                results.push({ type: 'Category', title: category.title, id: category.id });
            });

            console.log(results);

            setSearchResults(results);
            setSearchDropdownVisible(results.length > 0);
        } else {
            setSearchResults([]);
            setSearchDropdownVisible(false);
        }
    };

    const handleResultClick = (type, id) => {
        setSearchQuery('');
        setSearchDropdownVisible(false);
        if (type === 'Product') {
            navigate(`/product/${id}`);
        } else if (type === 'Category') {
            navigate(`/category/${id}`);
        }
    };

    return (
        <nav className="">
            <div className={`nav-row pt-2 atTop`}>
                {isDesktop && (
                    <div className="d-flex justify-content-between">
                        <div>
                            <img src={logo} className="pt-1 nav-logo" onClick={() => { navigate('/') }} alt="Logo" />
                        </div>
                        <div>
                            <ul className="nav-list">
                                <li className="nav-item" onClick={() => { navigate('/') }}>Home</li>
                                <li className="nav-item" onClick={() => { navigate('/about-us') }}>About Us</li>
                                <li className="nav-item" onClick={() => { navigate('/categories') }}>Categories</li>
                                <li className="nav-item" onClick={() => { navigate('/featured-products') }}>Featured Products</li>
                                {isAdmin && (
                                    <li className="nav-item" onClick={() => { navigate('/admin') }}>Admin Dashboard</li>
                                )}
                                {isSeller && (
                                    <li className="nav-item" onClick={() => { navigate('/seller') }}>Seller Dashboard</li>
                                )}
                            </ul>
                        </div>
                        <div className="d-flex align-items-start">
                            <div className="nav-item position-relative cursor-pointer" onClick={() => navigate('/cart')}>
                                <FaShoppingCart className="cart-svg" />
                                {cartCount > 0 && (
                                    <span className="cart-count-badge">{cartCount}</span>
                                )}
                            </div>
                            <div className="nav-list">
                                {isLoggedIn ? (
                                    <div className="nav-item" onClick={() => setShowLogoutModal(true)}>Logout</div>
                                ) : (
                                    <>
                                        <div className="nav-item" onClick={() => { navigate('/signup') }}>SignUp</div>
                                        <div className="nav-item" onClick={() => { navigate('/signin') }}>SignIn</div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

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
                                <li className="nav-item" onClick={() => { navigate('/categories') }}>Categories</li>
                                <li className="nav-item" onClick={() => { navigate('/featured-products') }}>Featured Products</li>
                                {isAdmin && (
                                    <li className="nav-item" onClick={() => { navigate('/admin') }}>Admin Dashboard</li>
                                )}
                                {isSeller && (
                                    <li className="nav-item" onClick={() => { navigate('/seller') }}>Seller Dashboard</li>
                                )}
                                <li className="nav-item position-relative cursor-pointer" onClick={() => navigate('/cart')}>
                                    <FaShoppingCart className="cart-svg" />
                                    {cartCount > 0 && (
                                        <span className="cart-count-badge">{cartCount}</span>
                                    )}
                                </li>
                                {isLoggedIn ? (
                                    <li className="nav-item" onClick={() => setShowLogoutModal(true)}>Logout</li>
                                ) : (
                                    <>
                                        <li className="nav-item" onClick={() => { navigate('/signup') }}>Signup</li>
                                        <li className="nav-item" onClick={() => { navigate('/signin') }}>Sign In</li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Search Bar */}
                <div className="search-bar-container" ref={searchRef} style={{ display: "flex", alignItems: "center" }}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            handleSearch();
                        }}
                        onFocus={() => {
                            if (searchResults.length > 0) setSearchDropdownVisible(true);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && searchQuery.trim().length > 0) {
                                navigate(`/search-products/${encodeURIComponent(searchQuery.trim())}`);
                                setSearchDropdownVisible(false);
                                setSearchQuery('');
                            }
                        }}
                        placeholder="Search products or categories..."
                        className="search-input"
                    />
                    <FaSearch
                        className="search-icon"
                        style={{ marginLeft: 8, marginBottom: 20, cursor: "pointer" }}
                        onClick={() => {
                            if (searchQuery.trim().length > 0) {
                                setSearchQuery('');
                                navigate(`/search-products/${encodeURIComponent(searchQuery.trim())}`);
                                setSearchDropdownVisible(false);
                            }
                        }}
                    />
                    {searchQuery.length >= 1 && searchResults.length > 0 && searchDropdownVisible && (
                        <div className="search-dropdown" ref={dropdownRef}>
                            <div className="search-dropdown-inner">
                                {searchResults.map((result, index) => (
                                    <div
                                        key={index}
                                        className="search-result-item"
                                        onClick={() => handleResultClick(result.type, result.id)}
                                    >
                                        {result.title}
                                        <span className="search-tag">{result.type}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {showLogoutModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h4 className="text-of-app">Are you sure you want to logout?</h4>
                            <div className="modal-buttons">
                                <button className="btn text-of-app btn-confirm" onClick={logout}>Yes</button>
                                <button className="btn text-of-app btn-cancel" onClick={() => setShowLogoutModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default UserNavbar;
