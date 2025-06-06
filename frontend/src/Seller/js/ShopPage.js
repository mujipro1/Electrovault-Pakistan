import { useNavigate, useParams } from "react-router-dom";
import { PiPlus } from "react-icons/pi";
import "../css/ShopPage.css";
import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { HomeIcon } from "lucide-react";
import axios from "axios";


const data = [
];

const ShopPage = () => {
    const [page, setPage] = useState('0');
    const navigate = useNavigate();
    const [shop, setShop] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState(""); // State for search term
    const [loading, setLoading] = useState(true); // Add loading state
    const shopId = useParams().id;

    useEffect(() => {
        const fetchShopData = async () => {
            try {
                const response = await axios.get(`/api/shop/getShop/${shopId}`);
                if (response.status === 200) {
                    console.log("Products", response.data);
                    setShop(response.data.shop);
                    setOrders(response.data.orders);
                    setProducts(response.data.products);
                }
            } catch (error) {
                console.error("Error fetching shops:", error);
            } finally {
                setLoading(false); // Set loading to false after data is fetched
            }
        };
        fetchShopData();
    }, []);

    const filteredProducts = products.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div style={{height: "90vh"}} className="d-flex align-items-center justify-content-center text-center py-5">Loading...</div>; // Show loading text
    }

    return (
        <>
            <div className="shop-page p-4">
                <p className='back-btn'><HomeIcon className="cursor-pointer" onClick={() => navigate(`/seller/`)} style={{ width: "18px", transform: "translateY(-1px)" }} /> &nbsp;/&nbsp; Shop</p>
                <div className="d-flex flex-column align-items-center justify-content-center">
                    <h3>{shop.name}</h3>
                    <div className="sec-text">{shop.address}</div>
                </div>
                <div className="row my-4">
                    <div className="col-md-4">
                        <div className="stat-card-shoppage my-2 br-lg">
                            <div className="circle1-statcard"></div>
                            <div className="circle2-statcard"></div>
                            <div>Total Products</div>
                            <h1 className="text-end stats-number">{products.length}</h1>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="stat-card-shoppage stat-card-n-2 my-2 br-lg">
                            <div className="circle1-statcard"></div>
                            <div className="circle2-statcard"></div>
                            <div>Completed Orders </div>
                            <h1 className="text-end stats-number">
                                {orders.filter(order => order.status === 1).length}
                            </h1>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="stat-card-shoppage my-2 br-lg">
                            <div className="circle1-statcard"></div>
                            <div className="circle2-statcard"></div>
                            <div>Pending Orders</div>
                            <h1 className="text-end stats-number">
                                {orders.filter(order => order.status === 0 && order.confirmedByAdmin == 1).length}
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="option-list-shoppage d-flex justify-content-start">
                    <div onClick={() => { setPage('0') }}
                        className={`${page == '0' ? 'product-olsp' : 'product-olsp product-olsp-depleted'}`}>Products</div>
                    <div onClick={() => { setPage('1') }}
                        className={`${page == '1' ? 'product-olsp' : 'product-olsp product-olsp-depleted'}`}>Orders</div>
                </div>

                {page == '0' && (
                    <div className="product-container-shoppage p-4 br-lg" >
                        <div className="d-flex justify-content-between align-items-center">
                            <h3>Products</h3>
                            <button className="btn btn-success"
                                onClick={() => navigate(`/seller/product/new/${shopId}`)}
                            >New Product <PiPlus /> </button>
                        </div>
                        <div className=" align-items-center d-flex justify-content-center">
                            <div className="search-bar-shop-page col-md-6">
                                <div className="d-flex justify-content-center align-items-center my-3">
                                    <div className="text-of-app">Search </div>
                                    <input
                                        className="mx-2 search-input-dark form-control"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)} // Update search term
                                        placeholder="Search products..."
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="prow-shop-page my-2">
                            {
                                filteredProducts.length === 0 && (
                                    <div className="d-flex justify-content-center my-5">
                                        <h4 className="text-secondary">No products match your search</h4>
                                    </div>
                                )
                            }
                            {filteredProducts.map((item, index) => (
                                <div className="pcard-shop-page my-3" key={index}>
                                    <ProductCard
                                        id={item.id}
                                        title={item.title}
                                        description={item.description}
                                        amount={item.price}
                                        rating={item.rating}
                                        image={item.images && item.images.length > 0 ? item.images[0] : null} // Pass the first image
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {page == '1' && (
                    <div className="product-container-shoppage p-4 br-lg">
                        <h3>Orders</h3>
                        <div className="row my-2">
                            <OrderComponent Allorders={orders} />
                        </div>
                    </div>
                )}

              
            </div>
        </>
    );
};

const OrderComponent = ({ Allorders }) => {
    const navigate = useNavigate();

    // Add a state variable to manage the filter for order status
    const [filterStatus, setFilterStatus] = useState('pending'); // Default to 'pending'

    // Add a safe check to ensure Allorders is an array before accessing length
    if (!Array.isArray(Allorders)) {
        return (
            <div className="text-center text-danger">Error: No orders data available.</div>
        );
    }

    // Filter orders based on the selected status
    const filteredOrders = Allorders.filter(order => {
        if (filterStatus === 'pending') {
            return order.status === 0 && order.confirmedByAdmin == 1; // Assuming 0 is 'pending'
        } else if (filterStatus === 'completed') {
            return order.status === 1 && order.confirmedByAdmin == 1; // Assuming 1 is 'completed'
        }
        else if (filterStatus === 'all') {
            return order.confirmedByAdmin == 1;
        }
        return false; 
    });

    return (
        <>
            <div className="mb-3">
                <div className="col-md-3 my-4">

                {/* Dropdown to select filter status */}
                <select
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    >
                    <option value="pending">Pending Orders</option>
                    <option value="completed">Completed Orders</option>
                    <option value="all">All Orders</option>
                </select>
                </div>
            </div>

            <div className="table-responsive">
                <table className="table table-striped border">
                    <thead className="table-dark">
                        <tr>
                            <th scope="col" width="10%">#</th>
                            <th scope="col" width="15%">Order By</th>
                            <th scope="col" width="15%">Order City</th>
                            <th scope="col" width="15%">Order Date</th>
                            <th scope="col" width="10%">Items</th>
                            <th scope="col" width="10%">Amount</th>
                            <th scope="col" width="15%">Status</th>
                            <th scope="col" width="6%">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length === 0 && (
                            <tr className="table-light">
                                {
                                    filterStatus === 'pending' ? (
                                        <td colSpan="8" className="text-center">No pending orders</td>
                                    ) : filterStatus === 'completed' ? (
                                        <td colSpan="8" className="text-center">No completed orders</td>
                                    ) : (
                                        <td colSpan="8" className="text-center">No orders found</td>
                                    )
                                }
                            </tr>
                        )}
                        {filteredOrders.map((item, index) => (
                            <tr key={index} className="table-light">
                                <td>{index + 1}</td>
                                <td>{item.name}</td>
                                <td>{item.city}</td>
                                <td>
                                    {new Date(item.order_date).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "2-digit",
                                        day: "2-digit",
                                    })}
                                </td>
                                <td>{item.items.length}</td>
                                <td>{item.amount}</td>
                                <td>{item.status === 0 ? 
                                    <span className="badge px-3 py-2 mt-1 bg-warning">Pending</span> :
                                    <span className="badge px-3 mt-1 py-2 bg-success">Completed</span>}</td>
                                
                                <td>
                                    <button className="btn btn-success" onClick={() => navigate(`/seller/order/${item.id}`)}>View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};


export default ShopPage;