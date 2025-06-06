import { useEffect, useState } from "react";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import axios from "axios";
import { HomeIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ShopList = () => {
    const navigate = useNavigate();
    const [shops, setShops] = useState([]);
    const [filteredSellers, setFilteredSellers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [filterStatus, setFilterStatus] = useState("active"); // New state for filter

    const fetchSellerName = async (shopId) => {
        try {
            const res = await axios.get(`/api/seller/getSellerFromShopId/${shopId}`);
            return res.data?.seller.name || "N/A";
        } catch (error) {
            console.error(`Error fetching seller for shop ${shopId}`, error);
            return "N/A";
        }
    };

    const fetchShops = async () => {
        try {
            const response = await axios.get('/api/shop/all/');
            if (response.status === 200) {
                const shopData = await Promise.all(
                    response.data.map(async (shop) => {
                        const sellerName = await fetchSellerName(shop.id);
                        return { ...shop, sellerName };
                    })
                );
                setShops(shopData);
                setFilteredSellers(shopData);
            } else {
                console.error('Error fetching all shops:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching all shops:', error);
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);
        setFilteredSellers(
            shops.filter(shop =>
                shop.name.toLowerCase().includes(value) ||
                shop.description.toLowerCase().includes(value) ||
                shop.city.toLowerCase().includes(value) ||
                shop.address.toLowerCase().includes(value)
            )
        );
    };

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });

        const sortedSellers = [...filteredSellers].sort((a, b) => {
            if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
            if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
            return 0;
        });
        setFilteredSellers(sortedSellers);
    };

    const getSortIcon = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === "asc"
                ? <FaChevronUp style={{ color: "#555", transform: 'scale(0.7)translate(5px,-2px)' }} />
                : <FaChevronDown style={{ color: "#555", transform: 'scale(0.7)translate(5px,-2px)' }} />;
        }
        return null;
    };

    const handleFilterChange = (status) => {
        setFilterStatus(status);
        if (status === "all") {
            setFilteredSellers(shops);
        } else if (status === "active") {
            setFilteredSellers(shops.filter(shop => shop.accepted === 1));
        } else if (status === "pending") {
            setFilteredSellers(shops.filter(shop => shop.accepted !== 1));
        }
    };

    useEffect(() => {
        fetchShops();
    }, []);

    useEffect(() => {
        handleFilterChange(filterStatus); // Apply filter whenever shops or filterStatus changes
    }, [shops, filterStatus]);

    return (
        <>
            <div className="seller-data">
                <p className='back-btn text-of-app'>
                    <HomeIcon className="cursor-pointer"
                        onClick={() => navigate(`/admin/`)}
                        style={{ width: "18px", color: "var(--text-of-app)", transform: "translateY(-1px)" }} />
                    &nbsp; /&nbsp; <span className="cursor-pointer">Shops</span>
                </p>

                <div className="d-flex justify-content-center">
                    <h4 className="text-of-app">All Shops</h4>
                </div>
                <div className="row d-flex justify-content-between">

                <div className="d-flex justify-content-start col-md-3 my-3">
                    <div className="search-box w-100">
                        <input
                            type="text"
                            className="form-control w-100"
                            placeholder="Search Shops"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                </div>

                <div className="d-flex justify-content-start col-md-3 my-3">
                    <div className="filter-dropdown w-100">
                        <select
                            className="form-select w-100 text-of-app"
                            value={filterStatus}
                            onChange={(e) => handleFilterChange(e.target.value)}
                            >
                            <option value="active">Active Shops</option>
                            <option value="pending">Pending Shops</option>
                            <option value="all">All Shops</option>
                        </select>
                    </div>
                </div>
                </div>

                <div className="table-responsive mt-4">
                    <table className="table table-striped border">
                        <thead className="table-light">
                            <tr className="cursor-pointer">
                                <th scope="col" width="5%" onClick={() => handleSort("id")}>
                                    # {getSortIcon("id")}
                                </th>
                                <th scope="col" width="15%" onClick={() => handleSort("name")}>
                                    Name {getSortIcon("name")}
                                </th>
                                <th scope="col" width="15%" onClick={() => handleSort("sellerName")}>
                                    Seller {getSortIcon("sellerName")}
                                </th>
                                <th scope="col" width="15%" onClick={() => handleSort("email")}>
                                    Description {getSortIcon("email")}
                                </th>
                                <th scope="col" width="10%" onClick={() => handleSort("city")}>
                                    City {getSortIcon("city")}
                                </th>
                                <th scope="col" width="10%" onClick={() => handleSort("phone")}>
                                    Address {getSortIcon("phone")}
                                </th>
                                <th scope="col" width="10%" onClick={() => handleSort("accepted")}>
                                    Accepted {getSortIcon("accepted")}
                                </th>
                                <th scope="col" width="5%">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                Array.isArray(filteredSellers) && filteredSellers.map((shop, index) => (
                                    <tr key={shop.id}>
                                        <th scope="row">{index + 1}</th>
                                        <td>{shop.name}</td>
                                        <td>{shop.sellerName}</td>
                                        <td>{shop.description}</td>
                                        <td>{shop.city}</td>
                                        <td>{shop.address}</td>
                                        <td>{shop.accepted === 1 ? "Yes" : "Pending"}</td>
                                        <td>
                                            <button className="btn btn-success"
                                                onClick={() => navigate(`/admin/shop/info/${shop.id}`)}
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

export default ShopList;
