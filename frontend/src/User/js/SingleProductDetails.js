import '../css/SingleProductDetails.css';
import { useEffect, useState } from 'react';
import { FaStar, FaUser } from "react-icons/fa";
import { PiMinus, PiPlus } from "react-icons/pi";
import { IoCall, IoMail } from "react-icons/io5";
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { HomeIcon } from 'lucide-react';
import ProductContainerList from './ProductContainerList';
import { jwtDecode } from 'jwt-decode';

const ProductDetails = () => {
    const productId = useParams().id;
    const [product, setProduct] = useState({});
    const [seller, setSeller] = useState({});
    const [shop, setShop] = useState({});
    const [productQuantity, setProductQuantity] = useState(1);
    const [isInCart, setIsInCart] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [reviewRating, setReviewRating] = useState(0);
    const navigate = useNavigate();

    const userToken = localStorage.getItem("userToken");
    const userId = userToken ? jwtDecode(userToken).id : null;


    const getRecommendedProducts = async (userId) => {
        try {
            const response = await axios.get(`/api/products/recommended-products/${userId}`);
            setRecommendedProducts(response.data.recommended.slice(0, 10));

        } catch (error) {
            console.error("Error fetching recommended products:", error);
        }
    };

    useEffect(() => {
        if (userId){
            getRecommendedProducts();
        }
    },[]);

    const fetchProductDetails = async () => {
        try {
            const response = await axios.get(`/api/products/getProductById/${productId}`);
            if (response.status === 200) {
                setProduct(response.data);
                if (response.data) {
                    console.log(response.data);
                    fetchSellerData(response.data.shop_id);
                }
            } else {
                console.error('Error fetching product:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        }
    };

    const fetchSellerData = async (shop_id) => {
        try {
            const response = await axios.get(`/api/seller/getSellerFromShopId/${shop_id}`);
            if (response.status === 200) {
                setSeller(response.data.seller);
                setShop(response.data.shop);
            } else {
                console.error('Error fetching seller:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching seller:', error);
        }
    };

    const handlePlus = () => setProductQuantity(prev => prev + 1);
    const handleMinus = () => setProductQuantity(prev => (prev > 1 ? prev - 1 : 1));

    const handleAddToCart = () => {
        const newCartItem = {
            productId: product.id,
            quantity: productQuantity,
            price: product.price,
            shopId: product.shop_id,
            sellerId: seller.id
        };

        const existingCartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
        const updatedCartItems = [...existingCartItems, newCartItem];
        localStorage.setItem("cartItems", JSON.stringify(updatedCartItems));
        alert("Product added to cart successfully!");
        setIsInCart(true);
        window.dispatchEvent(new Event("cartUpdated"));
    };

    const handleRemoveFromCart = () => {
        const existingCartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
        const updatedCartItems = existingCartItems.filter(item => item.productId !== product.id);
        localStorage.setItem("cartItems", JSON.stringify(updatedCartItems));
        alert("Product removed from cart successfully!");
        setIsInCart(false);
        window.dispatchEvent(new Event("cartUpdated"));
    };

    const handleAddReview = async () => {
        if (!reviewText || reviewRating === 0) {
            alert("Please provide a review and rating.");
            return;
        }

        try {
            const response = await axios.post(`/api/products/addReview/${productId}`, {
                review: reviewText,
                userId: userId,
                rating: reviewRating,
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("userToken")}`,
                },
            });

            if (response.status === 200) {
                alert("Review added successfully!");
                setReviewText("");
                setReviewRating(0);
                fetchProductDetails(); // Refresh product details to include the new review
            }
        } catch (error) {
            console.error("Error adding review:", error);
            alert("Failed to add review. Please try again.");
        }
    };

    const isLoggedIn = !!localStorage.getItem("userToken");

    useEffect(() => {
        fetchProductDetails();
    }, []);

    useEffect(() => {
        const existingCartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
        const cartItem = existingCartItems.find(item => item.productId === product.id);

        if (cartItem) {
            setProductQuantity(cartItem.quantity);
            setIsInCart(true);
        } else {
            setIsInCart(false);
        }
    }, [product.id]);

    return (
        <div className="single-product pt-5">
            <p className='back-btn text-of-app px-3'>
                <HomeIcon className="cursor-pointer"
                    onClick={() => navigate(`/`)}
                    style={{ width: "18px", color: "var(--text-of-app)", transform: "translateY(-1px)" }} />
                &nbsp; /&nbsp;&nbsp;Product
            </p>

            <div className="d-flex justify-content-center">
                <div className="col-lg-10">
                    <div className="row mx-0 my-4">
                        <div className="col-lg-6">
                            <div className="sp-img-cont br-lg text-center position-relative">
                                {Array.isArray(product.product_images) &&
                                    product.product_images.length > 0 &&
                                    product.product_images[currentImageIndex] &&
                                    product.product_images[currentImageIndex].url ? (
                                    <>
                                        <img
                                            src={`data:image/jpeg;base64,${product.product_images[currentImageIndex].url.replace(/^base64:type\d+:/, '')}`}
                                            alt="Product"
                                            className="img-fluid"
                                        />
                                        {/* Image Dots */}
                                        <div className="d-flex justify-content-center mt-3">
                                            {product.product_images.map((_, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => setCurrentImageIndex(index)}
                                                    className={`mx-1 rounded-circle`}
                                                    style={{
                                                        width: '10px',
                                                        height: '10px',
                                                        cursor: 'pointer',
                                                        backgroundColor:
                                                            index === currentImageIndex ? '#007bff' : '#ccc',
                                                    }}
                                                ></div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <img
                                        src="https://via.placeholder.com/500"
                                        alt="Placeholder"
                                        className="img-fluid"
                                    />
                                )}
                            </div>

                            {/* Add thumbnail row */}
                            {Array.isArray(product.product_images) && product.product_images.length > 0 && (
                                <div className="d-flex mt-3 justify-content-center flex-wrap">
                                    {product.product_images.map((image, index) => (
                                        <div
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`product-thumbnail mx-2 ${index === currentImageIndex ? 'active' : ''}`}
                                        >
                                            <img
                                                src={`data:image/jpeg;base64,${image.url.replace(/^base64:type\d+:/, '')}`}
                                                alt={`Thumbnail ${index + 1}`}
                                                className="img-fluid"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="col-lg-5 offset-lg-1">
                            <h1 className='my-4'>{product.title}</h1>
                            <div className="d-flex justify-content-between align-items-end">
                                <div className="d-flex justify-content-start align-items-start flex-column">
                                    <h3>Pkr {product.price}</h3>
                                    <div className="d-flex mt-4 justify-content-start align-items-start flex-column">
                                        <div>{product.rating ? product.rating : "0.0"} / 5</div>
                                        <div className="d-flex my-2 justify-content-center">
                                            {[...Array(5)].map((_, index) => (
                                                <FaStar
                                                    key={index}
                                                    className={index < Math.round(product.rating) ? "text-warning" : "text-secondary"}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-start align-items-end flex-column">
                                    <div className="w-50 mb-2 d-flex align-items-center justify-content-center">
                                        <PiMinus onClick={handleMinus} className='cursor-pointer plus-icon mx-2' />
                                        <input className="form-control" value={productQuantity} type="number" readOnly />
                                        <PiPlus onClick={handlePlus} className='cursor-pointer plus-icon mx-2' />
                                    </div>
                                    {isInCart ? (
                                        <div className="btn w-50 btn-danger" onClick={handleRemoveFromCart}>Remove From Cart</div>
                                    ) : (
                                        <div className="btn w-50 btn-success" onClick={handleAddToCart}>Add To Cart</div>
                                    )}
                                </div>
                            </div>

                            <hr className="my-5" />
                            <h4>Description</h4>
                            <p>{product.description}</p>
                        </div>
                    </div>

                    <div className="mt-5 mx-0 my-4 row">
                        <div className="col-lg-12 row">
                            <div className="col-lg-12">
                                {Array.isArray(product.product_specifications) &&
                                    product.product_specifications.filter(Boolean).length > 0 && (
                                        <>
                                            <h4 className="mb-4">Specifications</h4>
                                            {product.product_specifications
                                                .filter(Boolean)
                                                .map((spec, index) => (
                                                    <div key={index} className="d-flex my-1 justify-content-center">
                                                        <div className="spec-title">{spec.title}</div>
                                                        <div className="spec-item">{spec.value}</div>
                                                    </div>
                                                ))}
                                        </>
                                    )}

                            </div>

                            {Array.isArray(product.product_reviews) &&
                                product.product_reviews.filter((review) => review && review.user).length > 0 && (
                                    <>
                                        <h4 className="my-4 pt-4">Reviews</h4>
                                        {product.product_reviews
                                            .filter((review) => review && review.user)
                                            .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date, newest first
                                            .slice(0, 6)
                                            .map((review) => (
                                                <div className="col-lg-6 my-2" key={review.id}>
                                                    <div className="review-container-sp">
                                                        <div className="d-flex justify-content-start align-items-center">
                                                            <div className="pfp-seller">
                                                                <FaUser className="user-icon-seller" />
                                                            </div>
                                                            <div className="mx-3 fw-bold">{review.user.name}</div>
                                                        </div>
                                                        <div className="review-text my-4">{review.description}</div>
                                                        <div className="d-flex my-2 justify-content-start">
                                                            {[...Array(5)].map((_, index) => (
                                                                <FaStar
                                                                    key={index}
                                                                    className={
                                                                        index < Math.round(review.rating)
                                                                            ? "text-warning"
                                                                            : "text-secondary"
                                                                    }
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </>
                                )}

                            {isLoggedIn && (
                                <div className="p-3">
                                    <div className="add-review-section px-4 mt-5">
                                        <h4>Add Your Review</h4>
                                        <textarea
                                            className="form-control my-3"
                                            rows="4"
                                            placeholder="Write your review here..."
                                            value={reviewText}
                                            onChange={(e) => setReviewText(e.target.value)}
                                        ></textarea>
                                        <div className="d-flex justify-content-between">

                                            <div className="d-flex align-items-center">
                                                <span className="me-3">Rating:</span>
                                                {[...Array(5)].map((_, index) => (
                                                    <FaStar
                                                        key={index}
                                                        className={index < reviewRating ? "text-warning cursor-pointer" : "text-secondary cursor-pointer"}
                                                        onClick={() => setReviewRating(index + 1)}
                                                    />
                                                ))}
                                            </div>
                                            <button className="btn btn-success" onClick={handleAddReview}>
                                                Submit Review
                                            </button>
                                        </div>
                                    </div></div>
                            )}

                        </div>

                        <div className="my-4 pt-5">
                            <div className="d-flex justify-content-start align-items-center">
                                <div className="pfp-seller"><FaUser className='user-icon-seller' /></div>
                                <div>
                                    <div className="mx-3 fw-bold">{shop.name}</div>
                                    <div className="mx-3">{seller.name}</div>
                                </div>
                            </div>
                        </div>

                        <div className="my-2">
                            <div>For more details about this product, contact seller here.</div>
                            <div className="d-flex mt-3 justify-content-start align-items-center">
                                <IoCall />
                                <div className='mx-3'>{seller.phone}</div>
                            </div>
                            <div className="d-flex justify-content-start align-items-center">
                                <IoMail />
                                <div className='mx-3'>{seller.email}</div>
                            </div>
                        </div>

                            {isLoggedIn && (
                            <>
                                <div className="mt-5">
                                    <ProductContainerList
                                        title={"Browse More"}
                                        description={"Dive more into our Handpicked Items meeting your needs"}
                                        navigateTo={'recommended-for-you'}
                                        data={recommendedProducts}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ProductDetails;
