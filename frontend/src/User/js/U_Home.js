import { useState, useEffect } from "react";
import ScrollingWords from "../../Global/js/ScrollingWords";
import ProductContainerList from "./ProductContainerList";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { Buffer } from 'buffer'; // Import Buffer
import {jwtDecode} from "jwt-decode";
import '../css/U_Home.css';

const U_Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const ratingThreshold = 4.5; // Threshold for featured products
    const navigate = useNavigate();
    const [ads , setAds] = useState([]);

    const fetchCategories = () => {
        axios.get("/api/categories")
            .then(response => setCategoryData(response.data))
            .catch(error => console.error("Error fetching categories:", error));
    };

    const fetchAds = () => {
        axios.get("/api/ads/getAllAds")
            .then(response => {
                const adsData = response.data;
                setAds(adsData);
            })
            .catch(error => console.error("Error fetching ads:", error));
    };


    const fetchProducts = () => {
        axios.get("/api/products")
            .then(response => {
                const products = response.data;
                setFeaturedProducts(products.filter(product => product.rating >= ratingThreshold).slice(0, 10)); // Top 10 products with rating >= threshold
               
            })
            .catch(error => console.error("Error fetching products:", error));
    };

    const fetchRecommendedProducts = async (userId) => {
        await axios.get(`/api/products/recommended-products/${userId}`)
            .then(response => setRecommendedProducts(response.data.recommended))
            .then(() => setRecommendedProducts(prev => prev.slice(0, 10)))
            .catch(error => console.error("Error fetching recommended products:", error));
    };


    const handleLoginInputChange = (e) => {
        const { name, value } = e.target;
        setLoginData({ ...loginData, [name]: value });
    };

    const handleLogin = () => {
        axios.post("/api/auth/login", loginData)
            .then(response => {
                if (response.status === 200) {
                    const user = response.data.user;
                    const token = response.data.token;

                    if (user.role === 'admin') {
                        localStorage.setItem("adminToken", token);
                        navigate("/admin"); 
                    } else if (user.role === 'seller') {
                        localStorage.setItem("sellerToken", token);
                        navigate("/seller"); 
                    } else {
                        localStorage.setItem("userToken", token);
                        localStorage.setItem("userId", user.id); // Save user ID
                        navigate("/"); 
                        window.location.reload(); // Reload to reflect the logged-in state
                    }

                    setShowModal(false);
                    setIsLoggedIn(true); // Trigger re-render with logged in state
                    console.log("Login successful:", response.data);
                } else {
                    console.error("Login failed:", response.data);
                }
            })
            .catch(error => {
                console.error("Error during login:", error);
            });
    };
    

    const checkIfLoggedIn = () => {
        const token = localStorage.getItem("userToken");
        const userId = localStorage.getItem("userId");

        if (token) {
            try {
                // Verify token is valid
                const decodedToken = jwtDecode(token);
                const isTokenValid = decodedToken.exp * 1000 > Date.now();

                if (isTokenValid && userId) {
                    setIsLoggedIn(true);
                } else {
                    // Token expired or invalid
                    localStorage.removeItem("userToken");
                    localStorage.removeItem("userId");
                    setIsLoggedIn(false);
                }
            } catch (error) {
                console.error("Token validation error:", error);
                localStorage.removeItem("userToken");
                localStorage.removeItem("userId");
                setIsLoggedIn(false);
            }
        } else {
            setIsLoggedIn(false);
        }

        // Fetch other data regardless of login status
        fetchCategories();
        fetchProducts();

        // Show login modal for non-logged in users
        if (!token) {
            const timer = setTimeout(() => {
                setShowModal(true);
            }, 5000);
            return () => clearTimeout(timer);
        }
    };
    

    useEffect(() => {
        checkIfLoggedIn();
    }, []);

    useEffect(() => {
        // Fetch recommended products whenever isLoggedIn changes to true
        if (isLoggedIn) {
            const userId = localStorage.getItem("userToken") ? jwtDecode(localStorage.getItem("userToken")).id : null;
            if (userId) {
                fetchRecommendedProducts(userId);
            }
        }
    }, [isLoggedIn]);

    useEffect(() => {
        fetchAds();
    }
    , []);

    const decodeImage = (buffer) => {
        const base64String = Buffer.from(buffer).toString('base64');
        return `data:image/jpeg;base64,${base64String}`;
    }


    return (
        <>  
            <div className="user-home">
                <div className="row m-0 p-0">
                    <div className="col-lg-9 p-0 m-0">
                        <div className="user-home-img-container">
                            {
                                ads.length > 0 && ads[0].image && ads[0].image.data ? (
                                    <img src={decodeImage(ads[0].image.data)} className="user-home-img"></img>
                                ) : (
                                    <h5 className="text-center py-5 text-dark">Loading...</h5>
                                )
                            }
                        </div>
                    </div>

                    {/* show the second ad only on desktop */}
                    <div className="col-lg-3 m-0 p-0 d-none d-lg-block">
                        <div className="user-ad-img-container">
                            {
                                ads.length > 1 && ads[1].image && ads[1].image.data ? (
                                    <img src={decodeImage(ads[1].image.data)} className="user-home-img"></img>
                                ) : (
                                    <h5 className="text-center py-5 text-dark">Loading...</h5>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 className="text-of-app">Login for a Better Personalized Experience</h3>
                        <p className="text-secondary">Sign in to get recommendations tailored just for you.</p>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            className="form-control my-2"
                            value={loginData.email}
                            onChange={handleLoginInputChange}
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            className="form-control my-2"
                            value={loginData.password}
                            onChange={handleLoginInputChange}
                        />
                        <button className="btn btn-success my-1" onClick={handleLogin}>Login</button>
                        <button className="btn btn-secondary my-1" onClick={() => setShowModal(false)}>Close</button>
                    </div>
                </div>
            )}

            <div className="">
                <ProductContainerList
                    title={"Featured Products"}
                    description={"Top-rated products loved by customers worldwide."}
                    navigateTo={'featured-products'}
                    data={featuredProducts}
                />
                <ScrollingWords />

                {isLoggedIn && (
                    <ProductContainerList
                        title={"Recommended For You"}
                        description={"Handpicked just for you based on your interests."}
                        navigateTo={'recommended-for-you'}
                        data={recommendedProducts}
                        isDifferentBg={1}
                    />
                )}


                {
                    ads.length > 2 && ads[2].image && ads[2].image.data ? (
                        <div className="ad-container-home2">
                            <img src={decodeImage(ads[2].image.data)} 
                            style={{
                                width: "100%",
                                height: "100%",
                            }}
                            ></img>
                        </div>
                    ) : (
                        <h5 className="text-center py-5 text-dark">Loading...</h5>
                    )
                }

                <ProductContainerList
                    title={"Explore Our Categories"}
                    description={"Browse through our product categories to find what you need."}
                    navigateTo={'categories'}
                    data={categoryData.slice(0, 5)}
                    isCategoryList={1}
                />
            </div>
        </>
    );
};

export default U_Home;