import { useState, useEffect } from "react";
import { PiMinus, PiPlus } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/Cart.css";

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        const fetchCartDetails = async () => {
            const localCart = JSON.parse(localStorage.getItem("cartItems")) || [];
            const updatedCart = [];
    
            for (const item of localCart) {
                try {
                    const response = await axios.get(`/api/products/getProductById/${item.productId}`);
                    const product = response.data;
    
                    // Fetch sellerId using shop_id
                    const sellerResponse = await axios.get(`/api/seller/getSellerFromShopId/${product.shop_id}`);
                    const sellerId = sellerResponse.data?.seller?.id || null;
    
                    updatedCart.push({
                        ...item,
                        title: product.title || "Untitled Product",
                        description: product.description || "No description available",
                        // Correctly handle base64 encoded images
                        image: product.product_images[0]?.url
                            ? `data:image/png;base64,${product.product_images[0].url.split(':')[2]}` // Fix base64 string
                            : "Product Image", // Fallback image URL
                        price: parseFloat(item.price).toFixed(2),
                        sellerId,
                    });
                } catch (error) {
                    console.error("Failed to fetch product or seller details", error);
                }
            }
    
            setCartItems(updatedCart);
            calculateCartDetails(updatedCart);
        };
    
        fetchCartDetails();
    }, []);
    
    const calculateCartDetails = (items) => {
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = items.reduce((sum, item) => sum + item.quantity * parseFloat(item.price), 0);
        setTotalItems(totalItems);
        setTotalAmount(totalAmount.toFixed(2));
    };

    const updateLocalStorage = (items) => {
        const storageItems = items.map(({ productId, quantity, price, shopId, sellerId }) => ({
            productId,
            quantity,
            price,
            shopId,
            sellerId, // Ensure sellerId is saved in localStorage
        }));
        localStorage.setItem("cartItems", JSON.stringify(storageItems));
    };

    const handlePlus = (index) => {
        const updatedCart = [...cartItems];
        updatedCart[index].quantity += 1;
        setCartItems(updatedCart);
        updateLocalStorage(updatedCart);
        calculateCartDetails(updatedCart);
    };

    const handleMinus = (index) => {
        const updatedCart = [...cartItems];
        if (updatedCart[index].quantity > 1) {
            updatedCart[index].quantity -= 1;
            setCartItems(updatedCart);
            updateLocalStorage(updatedCart);
            calculateCartDetails(updatedCart);
        }
    };

    const handleRemoveFromCart = (index) => {
        const updatedCart = cartItems.filter((_, i) => i !== index);
        setCartItems(updatedCart);
        updateLocalStorage(updatedCart);
        calculateCartDetails(updatedCart);
    };

    return (
        <div className="cart p-4">
            <h3 className="text-of-app">Cart</h3>
            <p className="text-center text-secondary">View the details of items you added to your cart here.</p>
            <div className="col-lg-10 cart-col-width my-4">
                <div className="row">
                    <div className="col-lg-8 my-2">
                        <div className="cart-items-container br-lg">
                            <div className="cart-header pt-3">
                                <h6 className="cart-item-picture">Icon</h6>
                                <h6 className="cart-item-details">Details</h6>
                                <h6 className="cart-item-quantity">Quantity</h6>
                            </div>

                            <div className="px-3">
                                {cartItems.length > 0 ? (
                                    cartItems.map((item, index) => (
                                        <div key={index} className="cart-item-single pb-2 pt-3 row">
                                            <div className="col-md-3 br-sm cart-is-image d-flex justify-content-center align-items-center">
                                                <img src={item.image} alt="Product" />
                                            </div>
                                            <div className="col-md-6">
                                                <h3
                                                    className="mt-2 cursor-pointer"
                                                    onClick={() => navigate(`/product/${item.productId}`)}
                                                >
                                                    {item.title}
                                                </h3>
                                                <h5 className="text-success">Pkr {parseFloat(item.price).toFixed(2)} / item</h5>
                                                <div className="text-secondary mb-2">{item.description}</div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="d-flex justify-content-end h-100 align-items-center flex-column">
                                                    <div className="mb-2 d-flex align-items-center justify-content-center">
                                                        <PiMinus onClick={() => handleMinus(index)} className='cursor-pointer plus-icon text-of-app mx-2' />
                                                        <input className="form-control" value={item.quantity} type="number" readOnly />
                                                        <PiPlus onClick={() => handlePlus(index)} className='cursor-pointer text-of-app plus-icon mx-2' />
                                                    </div>
                                                    <div className="mb-3 btn btn-secondary" onClick={() => handleRemoveFromCart(index)}>Remove from Cart</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4">Your cart is empty.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4 my-2">
                        <div className="cart-price-container p-3 br-lg">
                            <h4 className="text-center my-3">Details</h4>
                            <div className="my-3">
                                <div className="d-flex px-3 justify-content-between">
                                    <h6>Total Items</h6>
                                    <div>{totalItems}</div>
                                </div>
                                <div className="d-flex px-3 justify-content-between">
                                    <h6>Total Amount</h6>
                                    <div>Pkr {totalAmount}</div>
                                </div>
                                <div className="d-flex px-3 justify-content-between">
                                    <h6>Discount Applied</h6>
                                    <div>0%</div>
                                </div>
                                <hr className="my-3" />
                                <div className="d-flex px-3 justify-content-between">
                                    <h6>Final Amount</h6>
                                    <h5>Pkr {totalAmount}</h5>
                                </div>
                                <div className="mt-4">
                                    <button onClick={() => navigate('/checkout')} className="btn btn-success w-100">Checkout</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
