import { useEffect, useState } from "react";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import "../css/SellerData.css";
import axios from "axios";
import { HomeIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterAdminApproval, setFilterAdminApproval] = useState("all");

    const fetchOrders = async () => {
        try {
            const response = await axios.get('/api/admin/orders/all');
            if (response.status === 200) {
                setOrders(response.data);
                setFilteredOrders(response.data);
                console.log(response.data);
            } else {
                console.error('Error fetching orders:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);
        filterOrders(value, filterStatus, filterAdminApproval);
    };

    const handleFilterChange = (e) => {
        const status = e.target.value;
        setFilterStatus(status);
        filterOrders(searchTerm, status, filterAdminApproval);
    };

    const handleAdminApprovalFilterChange = (e) => {
        const approvalStatus = e.target.value;
        setFilterAdminApproval(approvalStatus);
        filterOrders(searchTerm, filterStatus, approvalStatus);
    };

    const filterOrders = (search, status, adminApproval) => {
        let filtered = orders.filter(order =>
            order.guid.toLowerCase().includes(search)
        );

        if (status === "pending") {
            filtered = filtered.filter(order => order.status === 0);
        } else if (status === "completed") {
            filtered = filtered.filter(order => order.status === 1);
        }

        if (adminApproval === "pending") {
            filtered = filtered.filter(order => order.orders[0].confirmedByAdmin === 0);
        } else if (adminApproval === "approved") {
            filtered = filtered.filter(order => order.orders[0].confirmedByAdmin === 1);
        }

        setFilteredOrders(filtered);
    };

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });

        const sortedOrders = [...filteredOrders].sort((a, b) => {
            if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
            if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
            return 0;
        });
        setFilteredOrders(sortedOrders);
    };

    const getSortIcon = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === "asc" ? <FaChevronUp style={{color:"#555", transform:'scale(0.7)translate(5px,-2px)'}} /> : <FaChevronDown style={{color:"#555", transform:'scale(0.7)translate(5px,-2px)'}}/>;
        }
        return null;
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <>
        <div className="seller-data">
        <p className='back-btn text-of-app'><HomeIcon className="cursor-pointer" 
        onClick={() => navigate(`/admin/`)} style={{width: "18px", color:"black", transform: "translateY(-1px)"}}/>
         &nbsp; /&nbsp; <span className="cursor-pointer" >Orders</span></p>
         
            <div className="d-flex justify-content-center">
                <h4 className="text-of-app">All Orders</h4>
            </div>
            <div className="d-flex justify-content-between my-4 py-3 col-md-12 my-3">
                <div className="search-box col-md-4">
                    <input
                        type="text"
                        className="form-control w-100"
                        placeholder="Search Orders"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
                <div className="filter-box col-md-3">
                    <select
                        className="form-control"
                        value={filterStatus}
                        onChange={handleFilterChange}
                    >
                        <option value="all">All Orders</option>
                        <option value="pending">Pending Orders</option>
                        <option value="completed">Completed Orders</option>
                    </select>
                </div>
                <div className="filter-box col-md-3">
                    <select
                        className="form-control"
                        value={filterAdminApproval}
                        onChange={handleAdminApprovalFilterChange}
                    >
                        <option value="all">All Admin Approvals</option>
                        <option value="pending">Pending Approval</option>
                        <option value="approved">Approved</option>
                    </select>
                </div>
            </div>

            <div className="table-responsive">
                <table className="table table-striped border">
                    <thead className="table-light">
                        <tr className="cursor-pointer">
                            <th scope="col" width="20%" onClick={() => handleSort("guid")}>
                                Order GUID {getSortIcon("guid")}
                            </th>
                            <th scope="col" width="10%" onClick={() => handleSort("orders.length")}>
                                No. of Sellers {getSortIcon("orders.length")}
                            </th>
                            <th scope="col" width="10%" onClick={() => handleSort("totalItems")}>
                                No. of Items {getSortIcon("totalItems")}
                            </th>
                            <th scope="col" width="15%" onClick={() => handleSort("totalAmount")}>
                                Total Amount {getSortIcon("totalAmount")}
                            </th>
                            <th scope="col" width="15%" onClick={() => handleSort("date")}>
                                Date {getSortIcon("date")}
                            </th>
                            <th scope="col" width="10%" onClick={() => handleSort("status")}>
                                Completion Status {getSortIcon("status")}
                            </th>
                            <th scope="col" width="10%" onClick={() => handleSort("adminstatus")}>
                                Admin Approval Status {getSortIcon("adminstatus")}
                            </th>
                            <th scope="col" width="10%">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            Array.isArray(filteredOrders) && filteredOrders.map((order, index) => (
                                <tr key={order.guid}>
                                    <td>{order.guid}</td>
                                    <td>{order.orders.length}</td>
                                    <td>{order.orders.reduce((sum, o) => sum + o.items.length, 0)}</td>
                                    <td>Pkr {order.totalAmount.toFixed(2)}</td>
                                    <td>{new Date(order.orders[0].order_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                    <td style={{
                                        backgroundColor: order.status === 0 ? "orange" : "green",
                                        color: "white"
                                    }}>
                                        {order.status === 0 ? "Pending" : "Completed"}
                                    </td>
                                    <td style={{
                                        backgroundColor: order.orders[0].confirmedByAdmin === 0 ? "orange" : "green",
                                        color: "white"
                                    }}>
                                        {order.orders[0].confirmedByAdmin === 0 ? "Pending" : "Approved"}
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-success"
                                            onClick={() => navigate(`/admin/order/${order.guid}`)}
                                        >
                                            Details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
        </>
    );
};

export default AdminOrders;