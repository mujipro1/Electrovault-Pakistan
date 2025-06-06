import '../css/OrderDetailsPage.css';
import { HomeIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const OrderDetailsPage = () => {
    const navigate = useNavigate();

    const [order, setOrder] = useState({});
    const [orderItems, setOrderItems] = useState([]);
    const orderId = useParams().id;


    const fetchOrderData = async () => {
        try {
            const response = await axios.get(`/api/order/${orderId}`);
            if (response.status === 200) {
                setOrder(response.data.order);
                setOrderItems(response.data.items);
            }
        } catch (error) {
            console.error("Error fetching shops:", error);
        }
    };
    useEffect(() => {
        fetchOrderData();
    }, []);

    const markDispatched = async () => {
        try {
            const response = await axios.get(`/api/order/markDispatched/${orderId}`);
            console.log(response);
            if (response.status === 200) {
                // update states
                fetchOrderData();
            }
        } catch (error) {
            console.error("Error marking order as dispatched:", error);
        }
    }


    return (
        <>
            <div className="order-details-page p-3">
                <p className='text-of-app back-btn'><HomeIcon className="cursor-pointer" onClick={() => navigate(`/seller/`)} style={{ width: "18px", transform: "translateY(-1px)" }} /> &nbsp;/&nbsp; <span className='cursor-pointer' onClick={() => { navigate(`/seller/shop/1`) }}>Orders</span>&nbsp;/&nbsp;Order Details</p>
                <div className="order-info-container br-lg p-3 px-4">
                    <div className="d-flex justify-content-center">
                        <h4 className='my-5'>Order Details</h4>
                    </div>
                    <div className="row p-3 my-5">
                        <SmallContainer _key="Order ID" _val={order.id} />
                        <SmallContainer _key="Order Date" _val=
                            {new Date(order.order_date).toLocaleDateString("en-PK", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                            })}
                        />
                        <SmallContainer _key="Order Status" _val=
                            {
                                order.status === 0 ? "Pending" : "Completed"
                            }
                        />
                        <SmallContainer _key="Order By" _val={order.name} />
                        <SmallContainer _key="Contact Email" _val={order.email} />
                        <SmallContainer _key="Contact Number" _val={order.phone_number} />
                        <SmallContainer _key="Order City" _val={order.city} />
                        <SmallContainer _key="Order Amount" _val={order.amount} />
                        <SmallContainer
                            _key="Comission Deducted"
                            _val={
                                orderItems.reduce((total, item) => total + (item.price * item.quantity * (item.commission / 100)), 0).toFixed(2)
                            }
                        />
                        <SmallContainer
                            _key="Seller Profits"
                            _val={
                                orderItems.reduce((total, item) => total + (item.price * item.quantity * (1 - item.commission / 100)), 0).toFixed(2)
                            }
                        />


                        <SmallContainer _key="Order Items" _val={orderItems.length} />

                        <SmallContainer _key="Address" _val={order.address} box={10} />

                        <hr className="my-4"></hr>

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
                                            <th scope="col">Commission Rate (%)</th>
                                            <th scope="col">Total</th>
                                            <th scope="col">Admin Commission</th>
                                            <th scope="col">Seller Keeps</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orderItems.map((item, index) => {
                                            const total = item.price * item.quantity;
                                            const adminCommission = total * (item.commission / 100);
                                            const sellerKeeps = total - adminCommission;

                                            return (
                                                <tr key={index}>
                                                    <th scope="row">{index + 1}</th>
                                                    <td>{item.title}</td>
                                                    <td>{item.description}</td>
                                                    <td>{item.price}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>{item.commission || 0}</td>
                                                    <td>{total.toFixed(2)}</td>
                                                    <td>{adminCommission.toFixed(2)}</td>
                                                    <td>{sellerKeeps.toFixed(2)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan="6" className="text-end fw-bold">Grand Total</td>
                                            <td className="fw-bold">
                                                {orderItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
                                            </td>
                                            <td className="fw-bold">
                                                {orderItems.reduce((total, item) => total + (item.price * item.quantity * (item.commission / 100)), 0).toFixed(2)}
                                            </td>
                                            <td className="fw-bold">
                                                {orderItems.reduce((total, item) => total + (item.price * item.quantity * (1 - item.commission / 100)), 0).toFixed(2)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {
                            order.status == 0 && (

                                <div className="d-flex justify-content-center">
                                    <button className="btn btn-success mt-5"
                                        onClick={markDispatched}>
                                        Mark as Dispatched
                                    </button>
                                </div>
                            )
                        }
                        {
                            order.status == 1 && (
                                <div className="d-flex justify-content-center">
                                    <h4 className="text-success mt-5" disabled>
                                        Order has been Dispatched
                                    </h4>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        </>
    )
}

const SmallContainer = ({ _key, _val, box = 3 }) => {

    return (
        <>
            <div className={`col-md-${box} offset-md-1`}>
                <div style={{ color: "#889" }}>{_key}</div>
                <h4 className='pb-2 mb-4'>{_val}</h4>
            </div>
        </>
    )
}

export default OrderDetailsPage;