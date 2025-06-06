import { FaStar } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { HomeIcon } from "lucide-react";
import { Buffer } from 'buffer';

const ShopDetails = () => {
    const navigate = useNavigate();
    const [shopDetails, setShopDetails] = useState({});
    const [sellerData, setSellerData] = useState('');
    const [loading, setLoading] = useState(true); // Loading state
    const shopId = useParams().id;

    const fetchSellerData = async () => {
        try {
            const response = await axios.get(`/api/seller/complete/${shopDetails.shop.seller_id}`);
            if (response.status === 200) {
                setSellerData(response.data);
            } else {
                console.error('Error fetching sellers:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching sellers:', error);
        }
    };

    const fetchShopData = async () => {
        try {
            const response = await axios.get(`/api/shop/getShop/${shopId}`);
            if (response.status === 200) {
                setShopDetails(response.data);
                console.log("shop data ", response.data);
            } else {
                console.error('Error fetching shops:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching shops:', error);
        } finally {
            setLoading(false); // Stop loading after data is fetched
        }
    };

    useEffect(() => {
        fetchShopData();
    }, []);

    useEffect(() => {
        if (shopDetails.shop) {
            fetchSellerData();
        }
    }, [shopDetails]);

    const approveShopRequest = async () => {
        try {
            const response = await axios.post(`/api/shop/approveShop`, { shopId });
            if (response.status === 200) {
                alert('Shop approved successfully');
                navigate(`/admin/shops`);
            } else {
                console.error('Error approving shop:', response.statusText);
            }
        } catch (error) {
            console.error('Error approving shop:', error);
        }
    };

    const decodeImage = (buffer) => {
        const base64String = Buffer.from(buffer).toString('base64');
        return `data:image/jpeg;base64,${base64String}`;
    }

    if (loading) {
        return <div style={{ height: "90vh" }} className="d-flex justify-content-center align-items-center py-5">Loading...</div>;
    }

    return (
        <>
            <div className="seller-home p-3 px-4">
                <p className='back-btn text-of-app'>
                    <HomeIcon className="cursor-pointer"
                        onClick={() => navigate(`/admin/`)}
                        style={{ width: "18px", color: "var(--text-of-app)", transform: "translateY(-1px)" }} />
                    &nbsp; /&nbsp;
                    <span className="cursor-pointer" onClick={() => navigate(`/admin/sellers`)}>Sellers</span>
                    &nbsp;&nbsp;/&nbsp;
                    <span className="cursor-pointer" onClick={() => navigate(`/admin/sellers/info/${shopDetails.shop?.seller_id}`)}>Info</span>
                    &nbsp; /&nbsp;&nbsp;Shop
                </p>
                <div className="row">
                    <div className="d-flex justify-content-center">
                        <h4 className="my-4">Shop Details</h4>
                    </div>
                    <div className="row p-3 my-3">
                        <SmallContainer _key="Shop ID" _val={shopId} />
                        <SmallContainer _key="Shop Name" _val={shopDetails.shop?.name} />
                        <SmallContainer _key="Shop Address" _val={shopDetails.shop?.address} />
                        <SmallContainer _key="Seller Name" _val={sellerData?.name} />
                        <SmallContainer _key="Seller Email" _val={sellerData?.email} />
                        <SmallContainer box={10} _key="Shop Description" _val={shopDetails.shop?.description} />
                    </div>
                </div>

                {shopDetails.shop?.accepted === 1 ? (
                    <>
                        <div className="white-card my-4 mx-3">
                            <h5>Products</h5>
                            <div className="row">
                                {
                                    shopDetails.products && shopDetails.products.length === 0 && (
                                        <div className="d-flex justify-content-center my-4">
                                            <h4 className="text-secondary">No products listed yet</h4>
                                        </div>
                                    )
                                }
                                {
                                    shopDetails.products && shopDetails.products.map((product, index) => (
                                        <div key={index} className="col-md-3 p-2 px-3">
                                            <div className="product-file cursor-pointer"
                                                onClick={() => { navigate(`/admin/shop/product/${product.id}`) }}
                                            >
                                                <div className="pf-img">
                                                    {product.images &&
                                                        product.images[0] &&
                                                        product.images[0].data ? (
                                                        <img
                                                            src={decodeImage(product.images[0].data)}
                                                            alt={product.title}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover'
                                                            }}
                                                        />
                                                    ) : (
                                                        <img src="https://via.placeholder.com/300" alt="placeholder" />
                                                    )}
                                                </div>
                                                <h4 className="mt-3 text-dark">{product.title}</h4>
                                                <p className="text-secondary">{product.description.length > 30 ? product.description.slice(0, 30) + '...' : product.description}</p>
                                                <hr className="my-2 text-of-app"/>
                                                <div className="d-flex justify-content-between px-2">
                                                    <h5 className="text-dark">Rs. {product.price}</h5>
                                                    <h5 className="text-dark">Stock: {product.stock}</h5>
                                                </div>
                                                <div className="d-flex mb-2 justify-content-end ">
                                                    <div className="text-dark mx-2">{product.rating}</div>
                                                        <div className="d-flex pt-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <FaStar
                                                                    key={i}
                                                                    className={i < product.rating ? "text-warning" : "text-secondary"}
                                                                />
                                                            ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="d-flex justify-content-center my-4">
                        <button
                            className="btn btn-success"
                            onClick={approveShopRequest}>
                            Approve Shop Request
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

const SmallContainer = ({ _key, _val, box = 3 }) => {
    return (
        <>
            <div className={`col-md-${box} offset-md-1`}>
                <div className='sec-text'>{_key}</div>
                <h4 className='pb-2 mb-3'>{_val}</h4>
            </div>
        </>
    )
}

export default ShopDetails;