import { useEffect, useState } from "react";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import "../css/SellerData.css";
import axios from "axios";
import { HomeIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SellerData = () => {
    const navigate = useNavigate();
    const [sellers, setSellers] = useState([]);
    const [filteredSellers, setFilteredSellers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    const fetchSellers = async () => {
        try {
            const response = await axios.get('/api/seller/all');
            if (response.status === 200) {
                setSellers(response.data);
                setFilteredSellers(response.data);
                console.log(response.data);
            } else {
                console.error('Error fetching sellers:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching sellers:', error);
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);
        setFilteredSellers(
            sellers.filter(seller =>
                seller.name.toLowerCase().includes(value) ||
                seller.email.toLowerCase().includes(value) ||
                seller.phone.toLowerCase().includes(value)
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
            return sortConfig.direction === "asc" ? <FaChevronUp style={{color:"#555", transform:'scale(0.7)translate(5px,-2px)'}} /> : <FaChevronDown style={{color:"#555", transform:'scale(0.7)translate(5px,-2px)'}}/>;
        }
        return null;
    };

    useEffect(() => {
        fetchSellers();
    }, []);

    return (
        <>
        <div className="seller-data">
        <p className='back-btn text-of-app'><HomeIcon className="cursor-pointer" 
        onClick={() => navigate(`/admin/`)} style={{width: "18px", color:"black", transform: "translateY(-1px)"}}/>
         &nbsp; /&nbsp; <span className="cursor-pointer" >Sellers</span></p>
         
            <div className="d-flex justify-content-center">
                <h4 className="text-of-app">All Sellers</h4>
            </div>
            <div className="d-flex justify-content-start col-md-5 my-3">
                <div className="search-box">
                    <input
                        type="text"
                        className="form-control w-100"
                        placeholder="Search Sellers"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
            </div>

            <div className="table-responsive">
                <table className="table table-striped border">
                    <thead className="table-light">
                        <tr className="cursor-pointer">
                            <th scope="col" width="10%" onClick={() => handleSort("id")}>
                                # {getSortIcon("id")}
                            </th>
                            <th scope="col" width="15%" onClick={() => handleSort("name")}>
                                Name {getSortIcon("name")}
                            </th>
                            <th scope="col" width="15%" onClick={() => handleSort("email")}>
                                Email {getSortIcon("email")}
                            </th>
                            <th scope="col" width="15%" onClick={() => handleSort("phone")}>
                                Contact {getSortIcon("phone")}
                            </th>
                            <th scope="col" width="10%" onClick={() => handleSort("shopCount")}>
                                Shops {getSortIcon("shopCount")}
                            </th>
                            <th scope="col" width="6%">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            Array.isArray(filteredSellers) && filteredSellers.map((seller, index) => (
                                <tr key={seller.id}>
                                    <th scope="row">{index + 1}</th>
                                    <td>{seller.name}</td>
                                    <td>{seller.email}</td>
                                    <td>{seller.phone}</td>
                                    <td>{seller.shopCount}</td>
                                    <td>
                                        <button className="btn btn-success"
                                            onClick={() => navigate(`/admin/sellers/info/${seller.id}`)}
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

export default SellerData;