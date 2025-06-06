import "../css/SellerDataSingle.css";
import { useNavigate, useParams } from "react-router-dom";
import { HomeIcon } from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";

const SellerDataSingle = () => {
    const navigate = useNavigate();

    const [sellerCompleteData, setSellerCompleteData] = useState([]);
    const SellerId = useParams().id;

    const fetchSellerData = async () => {
        try {
            const response = await axios.get(`/api/seller/complete/${SellerId}`);
            if (response.status === 200) {
                setSellerCompleteData(response.data);
                console.log(response.data);
            } else {
                console.error('Error fetching sellers:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching sellers:', error);
        }
    }
    useEffect(() => {
        fetchSellerData();
    }
        , []);

    return (
        <>
            <div className="seller-data">
                <p className='back-btn text-of-app'><HomeIcon className="cursor-pointer"
                    onClick={() => navigate(`/admin/`)} style={{ width: "18px", color: "var(--text-of-app)", transform: "translateY(-1px)" }} />&nbsp; /&nbsp; <span className="cursor-pointer" onClick={() => navigate(`/admin/sellers`)} >Sellers</span>&nbsp; /&nbsp;&nbsp;Info</p>

                <div className="d-flex justify-content-center">
                    <h4 className="text-of-app">Seller's Details</h4>
                </div>

                <div className="white-card my-4">
                    <div className="row p-3 my-5">
                        <SmallContainer _key="Seller ID" _val={SellerId} />
                        <SmallContainer _key="Seller Name" _val={sellerCompleteData.name} />
                        <SmallContainer _key="Seller Email" _val={sellerCompleteData.email} />
                        <SmallContainer _key="Seller Phone" _val={sellerCompleteData.phone} />
                        <SmallContainer _key="Seller City" _val={sellerCompleteData.city} />
                        <SmallContainer
                            _key="Seller Shops"
                            _val={sellerCompleteData.shopDetails ? Object.keys(sellerCompleteData.shopDetails).length : 0}
                        />
                        <SmallContainer _key="Seller Orders" _val={sellerCompleteData.orderCount} />
                        <SmallContainer _key="Seller Invoices" _val="5" />
                        <SmallContainer _key="Seller Rating" _val="4.5" />
                        <SmallContainer _key="Seller Reviews" _val={sellerCompleteData.reviewCount} />
                        <SmallContainer _key="Seller Joined" _val="12/12/2021" />
                    </div>
                </div>

                <h4 className="mt-5 py-3 pt-4 text-of-app">Shops</h4>

                <div className="row my-2">
                    {
                        sellerCompleteData.shopDetails && sellerCompleteData.shopDetails.map((shop, index) => {
                            return (
                                <div className="col-lg-4 m-0 my-2 py-1">
                                    <div key={index} className={`cursor-pointer w-100  br-lg d-flex justify-content-between flex-column ${shop.accepted == 1 ? "shop-card-seller" : "shop-card-seller shop-card-not-accepted"}`}
                                        onClick={() => { navigate(`/admin/shop/info/${shop.id}`) }}
                                    >
                                        <div className="circle1-shop-card"></div>
                                        <div className="circle2-shop-card"></div>
                                        <div>
                                            <h3>{shop.name}</h3>
                                            <div className=""> {shop.address}</div>
                                        </div>
                                        {shop.accepted == 1 && (

                                                <div className="mt-3 d-flex align-items-end justify-content-end flex-column">
                                                    <div>Total Orders: {shop.totalOrders} </div>
                                                    <div>Total Products: {shop.totalProducts}</div>
                                                </div>
                                            )
                                        }
                                        {
                                            shop.accepted == 0 && (
                                                <div className="mt-3 d-flex align-items-end justify-content-end flex-column">
                                                    <div className="text-of-app">Pending Approval</div>
                                                </div>
                                            )
                                        }
                                    </div>
                                </div>
                            )
                        }
                        )
                    }
                </div>

            </div>

        </>
    )
}


const SmallContainer = ({ _key, _val, box = 3 }) => {
    return (
        <>
            <div className={`col-md-${box} offset-md-1`}>
                <div className='text-of-app'>{_key}</div>
                <h4 className='pb-2 mb-3'>{_val}</h4>
            </div>
        </>
    )
}

export default SellerDataSingle;