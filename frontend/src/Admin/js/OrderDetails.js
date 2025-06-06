import { HomeIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const OrderDetails = () => {
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState({});
    const [orders, setOrders] = useState([]);
    const { id: orderId } = useParams(); // Destructure for clarity

    const [screenshotUrl, setScreenshotUrl] = useState(null);

    useEffect(() => {
        if (orders.length > 0 && orders[0].payment_screenshot?.data) {
            const byteArray = new Uint8Array(orders[0].payment_screenshot.data);
            const blob = new Blob([byteArray], { type: "image/jpeg" });
            const imageUrl = URL.createObjectURL(blob);
            setScreenshotUrl(imageUrl);

            // Clean up the object URL when component unmounts or orders change
            return () => URL.revokeObjectURL(imageUrl);
        }
    }, [orders]);

    const fetchOrderData = async () => {
        try {
            const response = await axios.get(`/api/admin/orderByGuid/${orderId}`);
            if (response.status === 200 && Array.isArray(response.data)) {
                const ordersData = response.data;
                if (ordersData.length > 0) {
                    const { name, email, phone_number, address, city } = ordersData[0];
                    setUserDetails({ name, email, phone: phone_number, address, city });
                }
                const ordersWithProductDetails = await Promise.all(
                    ordersData.map(async (order) => {
                        const itemsWithDetails = await Promise.all(
                            order.items.map(async (item) => {
                                try {
                                    const productResponse = await axios.get(`/api/products/getProductById/${item.product_id}`);
                                    return {
                                        ...item,
                                        product: productResponse.status === 200 ? productResponse.data : {},
                                    };
                                } catch (error) {
                                    console.error(`Error fetching product ${item.product_id}:`, error);
                                    return { ...item, product: {} }; // Fallback to empty product
                                }
                            })
                        );
                        return { ...order, items: itemsWithDetails };
                    })
                );
                setOrders(ordersWithProductDetails);
                console.log("Orders with product details:", ordersWithProductDetails);
            } else {
                console.error("Invalid response data:", response.data);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    useEffect(() => {
        if (orderId) fetchOrderData();
    }, [orderId]);

    return (
        <>
            <div className="order-details-page p-3">
                <p className='text-of-app back-btn'>
                    <HomeIcon
                        className="cursor-pointer"
                        onClick={() => navigate(`/admin/`)}
                        style={{ width: "18px", transform: "translateY(-1px)" }}
                    />
                    &nbsp;/&nbsp;
                    <span className='cursor-pointer' onClick={() => navigate(`/admin/orders`)}>
                        Orders
                    </span>
                    &nbsp;/&nbsp;Order Details
                </p>

                <div className="order-info-container br-lg p-3 px-4">
                    <div className="d-flex justify-content-center">
                        <h4 className='my-5'>Order Details</h4>
                    </div>
                    <h4 className="text-center mb-4">
                        {orders.length > 0 && orders[0]?.confirmedByAdmin !== undefined ? (
                            orders[0].confirmedByAdmin === 1 ? (
                                <span className="text-success">Order Approved</span>
                            ) : (
                                <span className="text-danger">Pending Admin Approval</span>
                            )
                        ) : (
                            <span className="text-muted">Order status unavailable</span>
                        )}
                    </h4>
                    {/* User Details */}
                    <div className="row p-3 my-5">
                    
                        <h5 className="mb-4">User Details</h5>
                        <SmallContainer _key="Name" _val={userDetails.name || "N/A"} />
                        <SmallContainer _key="Email" _val={userDetails.email || "N/A"} />
                        <SmallContainer _key="Phone" _val={userDetails.phone || "N/A"} />
                        <SmallContainer _key="City" _val={userDetails.city || "N/A"} />
                        <SmallContainer _key="Address" _val={userDetails.address || "N/A"} box={10} />

                        <h5 className="mt-5 my-4">Payment Proof</h5>
                        <div className="col-md-4 offset-md-1">
                            {screenshotUrl ? (
                                <img
                                    src={screenshotUrl}
                                    alt="Payment Proof"
                                    className="img-fluid rounded"
                                    style={{ maxWidth: "100%", height: "auto" }}
                                />
                            ) : (
                                <p className="text-muted">No payment proof available</p>
                            )}
                        </div>

                    </div>
                    <hr className="my-4"></hr>
                    {/* Orders */}
                    {orders.map((order, index) => {
                        const adminCommission = order.items.reduce((sum, item) => sum + (item.product?.price * item.quantity * (item.product?.commission / 100)), 0);
                        const sellerProfit = order.amount - adminCommission;

                        return (
                            <div key={index} className="row p-3 my-5">
                                <h5 className="mb-4">Order #{order.id}</h5>
                                <SmallContainer _key="Order ID" _val={order.id || "N/A"} />
                                <SmallContainer _key="Order Date" _val={
                                    order.order_date
                                        ? new Date(order.order_date).toLocaleDateString("en-PK", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })
                                        : "N/A"
                                } />
                                <SmallContainer _key="Order Status" _val={
                                    order.status === 0 ? "Pending" : "Completed"
                                } />
                                <SmallContainer _key="Order Amount" _val={`Pkr ${order.amount || 0}`} />
                                <SmallContainer _key="Admin Commission" _val={`Pkr ${adminCommission.toFixed(2)}`} />
                                <SmallContainer _key="Seller Profit" _val={`Pkr ${sellerProfit.toFixed(2)}`} />
                                <div className="col-md-10 offset-md-1 mt-5">
                                    <h4>Items</h4>
                                    <div className="table-responsive">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th scope="col">#</th>
                                                    <th scope="col">Item Name</th>
                                                    <th scope="col">Description</th>
                                                    <th scope="col">Unit Price</th>
                                                    <th scope="col">Quantity</th>
                                                    <th scope="col">Commission (%)</th>
                                                    <th scope="col">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {order.items.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <th scope="row">{idx + 1}</th>
                                                        <td>{item.product?.title || "N/A"}</td>
                                                        <td>{item.product?.description || "N/A"}</td>
                                                        <td>{item.product?.price || 0}</td>
                                                        <td>{item.quantity || 0}</td>
                                                        <td>{item.product?.commission || 0}</td>
                                                        <td>{(item.product?.price * item.quantity).toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div className="d-flex justify-content-center mt-4">
                        {orders.length > 0 && orders[0]?.confirmedByAdmin !== undefined && (
                            <button
                                className={`btn ${orders[0].confirmedByAdmin === 1 ? "btn-danger" : "btn-success"}`}
                                onClick={async () => {
                                    try {
                                        const response = await axios.post(`/api/admin/approveOrder`, { guid: orders[0].guid });
                                        if (response.status === 200) {
                                            alert(`Order ${orders[0].confirmedByAdmin === 1 ? "disapproved" : "approved"} successfully!`);
                                            // Toggle the confirmedByAdmin field locally
                                            setOrders((prevOrders) =>
                                                prevOrders.map((order) =>
                                                    order.id === orders[0].id
                                                        ? { ...order, confirmedByAdmin: orders[0].confirmedByAdmin === 1 ? 0 : 1 }
                                                        : order
                                                )
                                            );
                                        } else {
                                            alert(`Failed to ${orders[0].confirmedByAdmin === 1 ? "disapprove" : "approve"} the order.`);
                                        }
                                    } catch (error) {
                                        console.error(`Error ${orders[0].confirmedByAdmin === 1 ? "disapproving" : "approving"} order:`, error);
                                        alert(`An error occurred while ${orders[0].confirmedByAdmin === 1 ? "disapproving" : "approving"} the order.`);
                                    }
                                }}
                            >
                                {orders[0].confirmedByAdmin === 1 ? "Disapprove as Admin" : "Approve as Admin"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

const SmallContainer = ({ _key, _val, box = 3 }) => {
    return (
        <div className={`col-md-${box} offset-md-1`}>
            <div style={{ color: "#889" }}>{_key}</div>
            <h4 className='pb-2 mb-4'>{_val}</h4>
        </div>
    );
};

export default OrderDetails;