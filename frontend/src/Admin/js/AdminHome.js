import "../css/AdminHome.css";
import { FaBell } from "react-icons/fa";
import { IoIosSettings } from "react-icons/io";
import { use, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const AdminHome = () => {   
    const navigate = useNavigate();
    const [hasNotif, setHasNotif] = useState(false);
    const [noOfSellers, setNoOfSellers] = useState(0);
    const [noOfShops, setNoOfShops] = useState(0);
    const [noOfOrders, setNoOfOrders] = useState(0);
    const [noOfInvoices, setNoOfInvoices] = useState(0);
    const [most_common_comission, setMostCommonComission] = useState(0);
    const [noOfCategories, setNoOfCategories] = useState(0);
    const [noOfPendingOrders ,setNoOfPendingOrders] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get('/api/admin/stats');
            if (response.status === 200) {
                setNoOfSellers(response.data.seller_count);
                setNoOfShops(response.data.shop_count);
                setNoOfOrders(response.data.order_count);
                setMostCommonComission(response.data.most_common_comission);
                setNoOfInvoices(10);
                setNoOfCategories(response.data.category_count);

            } else {
                console.error('Error fetching stats:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }


    const fetchPendingOrders = async () => {
        try {
            const response = await axios.get('/api/admin/pending-orders');
            if (response.status === 200) {
                if (response.data > 0) {
                    setHasNotif(true);
                    setNoOfPendingOrders(response.data);
                } else {
                    setHasNotif(false);
                }
            } else {
                console.error('Error fetching pending orders:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching pending orders:', error);
        }
    }


    useEffect(() => {
        fetchStats();
        fetchPendingOrders();
    }, []);

    const handleNotificationClick = () => {
        setShowNotifications(!showNotifications);
    };

    return (
        <>
            <div className="admin-home py-3">
                <div className="d-flex justify-content-center">
                    <h4 className="mt-2 text-of-app">Admin Dashboard</h4>
                </div>
                <div className="col-md-10 offset-md-1">
                    <div className="d-flex mb-4 px-3 align-items-center justify-content-end">
                        <div className="position-relative" ref={notificationRef}>
                            {hasNotif === false && (
                                <FaBell 
                                    className="mx-2 cursor-pointer" 
                                    style={{ fill: 'black', height: "25px", width: "25px", transform: 'translateY(2px)'}}
                                    onClick={handleNotificationClick}
                                />
                            )}
                            {hasNotif === true && (
                                <div className="notification" onClick={handleNotificationClick}>
                                    <div className="noti-circle"></div>
                                    <FaBell 
                                        className="mx-2 cursor-pointer" 
                                        style={{ fill: 'black', height: "25px", width: "25px", transform: 'translateY(2px)'}}
                                    />
                                </div>
                            )}
                            
                            {showNotifications && (
                                <div className="notification-box" 
                                    style={{
                                        position: 'absolute',
                                        top: '100%',
                                        right: '0',
                                        width: '300px',
                                        backgroundColor: 'white',
                                        borderRadius: '8px',
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                        padding: '15px',
                                        zIndex: 1000,
                                        marginTop: '10px'
                                    }}>
                                    {noOfPendingOrders > 0 ? (
                                        <div 
                                            className="notification-item cursor-pointer"
                                            onClick={() => navigate('/admin/orders')}
                                            style={{
                                                color: '#333',
                                                padding: '10px',
                                                borderRadius: '4px',
                                                backgroundColor: '#f8f9fa',
                                                transition: '0.3s'
                                            }}
                                        >
                                            You have {noOfPendingOrders} new order{noOfPendingOrders > 1 ? 's' : ''} to approve
                                        </div>
                                    ) : (
                                        <div style={{ color: '#666', padding: '10px' }}>
                                            No new notifications
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="row mx-0 px-2 my-4">
                        <div className="col-md-4">
                            <div className="stat-card-shoppage stat-card-n my-2 br-lg"
                                onClick={() => navigate(`/admin/sellers`)}>
                                <div className="circle1-statcard"></div>
                                <div className="circle2-statcard"></div>
                                <div>Sellers </div>
                                <h1 className="text-end stats-number">{noOfSellers}</h1>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="stat-card-shoppage stat-card-n-2 my-2 br-lg"
                                onClick={() => navigate(`/admin/shops`)}>

                                <div className="circle1-statcard"></div>
                                <div className="circle2-statcard"></div>
                                <div>Shops </div>
                                <h1 className="text-end stats-number">{noOfShops}</h1>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="stat-card-shoppage stat-card-n my-2 br-lg"
                            onClick={() => navigate(`/admin/orders`)}>
                                <div className="circle1-statcard"></div>
                                <div className="circle2-statcard"></div>
                                <div>Orders</div>
                                <h1 className="text-end stats-number">{noOfOrders}</h1>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="stat-card-shoppage stat-card-n-2 my-2 br-lg"
                                onClick={() => navigate(`/admin/invoices`)}>
                                <div className="circle1-statcard"></div>
                                <div className="circle2-statcard"></div>
                                <div>Invoices</div>
                                <h1 className="text-end stats-number">{noOfInvoices}</h1>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="stat-card-shoppage stat-card-n my-2 br-lg"
                                onClick={() => navigate(`/admin/comissions`)}>
                                <div className="circle1-statcard"></div>
                                <div className="circle2-statcard"></div>
                                <div>Comissions</div>
                                <h1 className="text-end stats-number">{most_common_comission}%</h1>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="stat-card-shoppage stat-card-n-2 my-2 br-lg"
                                onClick={() => navigate(`/admin/ads`)}>
                                <div className="circle1-statcard"></div>
                                <div className="circle2-statcard"></div>
                                <div>Advertisements</div>
                                <h1 className="text-end stats-number">4</h1>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="stat-card-shoppage stat-card-n my-2 br-lg"
                                onClick={() => navigate(`/admin/categories`)}>
                                <div className="circle1-statcard"></div>
                                <div className="circle2-statcard"></div>
                                <div>Categories</div>
                                <h1 className="text-end stats-number">{noOfCategories}</h1>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}

export default AdminHome;