import "../css/SellerHome.css";
import { useState, useEffect } from "react";
import { PiPlus } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const SellerHome = () => {
    const navigate = useNavigate();
    const [shops, setShops] = useState([]);
    const [hasShops, setHasShops] = useState(false);
    const [balanceInfo, setBalanceInfo] = useState(null);

    const seller = localStorage.getItem("sellerToken");
    const decodedToken = jwtDecode(seller);
    const sellerId = decodedToken.id;
                    
    const fetchBalanceInfo = async () => {
         try {
            const response = await axios.get(`/api/seller/getBalanceBySellerId/${sellerId}`);
            if (response.status === 200) {
                console.log("Balance info:", response.data);
                setBalanceInfo(response.data); 
            }
        }
        catch (error) {
            console.error("Error fetching balance info:", error); 
        } 
    }
    
    useEffect(() => {
        fetchBalanceInfo();
    }, []);
    
    useEffect(() => {
        const fetchShops = async () => {
            try {

                // fetch seller details from local storage
                const token = localStorage.getItem("sellerToken");
                const decodedToken = jwtDecode(token);
                const sellerId = decodedToken.id;

                const response = await axios.get(`/api/seller/getSellerShops/${sellerId}`);
                if (response.status === 200) {
                    setShops(response.data);
                    setHasShops(response.data.length > 0);
                }
            } catch (error) {
                console.error("Error fetching shops:", error);
            }
        };
        fetchShops();
    }, []);

    return (
        <>
            <div className="seller-home p-3">
                <div className="d-flex flex-column align-items-center justify-content-center">
                    <h3>Seller Dashboard</h3>
                    <div className="sec-text">Manage your shops and products here</div>
                    <div className="col-lg-10 custom-width-shopcard m-0 p-0">
                        <div className="d-flex my-3 justify-content-end">
                            <button className="btn btn-success"
                                onClick={() => { navigate(`/seller/shop/new`) }}
                            >New Shop <PiPlus /></button>
                        </div>
                        {!hasShops && (
                            <div className="d-flex justify-content-center align-items-center my-5">
                                <h4 className="text-secondary">You don't have any shops listed yet</h4>
                            </div>
                        )}
                        {hasShops && (
                            <div className="row my-4">
                                {shops.map((shop) => (
                                    <div className="col-lg-4 my-2 m-0" key={shop._id}>
                                        <div className={`cursor-pointer my-1 w-100 br-lg d-flex justify-content-between flex-column ${shop.accepted === 1 ? "shop-card-seller" : "shop-card-seller shop-card-not-accepted"}`}
                                            onClick={() => {
                                                if (shop.accepted === 0) {
                                                    alert("Your shop is not accepted yet. Please wait for admin approval.");
                                                    return;
                                                }
                                                else{
                                                    navigate(`/seller/shop/${shop.id}`) }}
                                                }
                                        >
                                            <div className="circle1-shop-card"></div>
                                            <div className="circle2-shop-card"></div>
                                            <div>
                                                <h3 className="text-white">{shop.name}</h3>
                                                <div>{shop.address}</div>
                                            </div>
                                            {
                                                shop.accepted === 0 && (
                                                    <div className="mt-3 d-flex align-items-end justify-content-end flex-column">
                                                    Pending Approval</div>
                                                )
                                            }
                                            {
                                                shop.accepted === 1 && (
                                                    <div className="mt-3 d-flex align-items-end justify-content-end flex-column">
                                                <div>Total Orders: {shop.orderCount || 0}</div>
                                                <div>Total Products: {shop.productCount || 0}</div>
                                            </div>
                                            )
                                        }
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

{balanceInfo && (
    <>
        <hr className="my-5" />

        <h4 className="text-of-app my-5">Balance Info</h4>

        <div className="d-flex">
            <h6 className="text-of-app w-50">+ Previous Balance</h6>                    
            <h6 className="text-of-app mx-2">{balanceInfo.previousPendingTotal || 0}</h6>
        </div>

        <div className="d-flex">
            <h6 className="text-of-app w-50">
                + Sales for {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}
            </h6>
            <h6 className="text-of-app mx-2">
                {balanceInfo.currentMonthData?.[0]?.total_sales || 0}
            </h6>
        </div>

        <div className="d-flex">
            <h6 className="text-of-app w-50">
                - Commission Deducted
            </h6>
            <h6 className="text-of-app mx-2">
                {balanceInfo.currentMonthData?.[0]?.admin_comission || 0}
            </h6>
        </div>

        <hr className="my-2 w-75" />

        <div className="d-flex">
            <h6 className="text-of-app w-50">Total Balance</h6>
            <h6 className="text-of-app mx-2">
                {
                    ((balanceInfo.currentMonthData?.[0]?.total_sales || 0) +
                    (balanceInfo.previousPendingTotal || 0) -
                    (balanceInfo.currentMonthData?.[0]?.admin_comission || 0))
                }
            </h6>
        </div>
    </>
)}
 
                    </div>
                </div>
            </div>
        </>
    );
};

export default SellerHome;
