import { useEffect, useState } from "react";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import "../css/Comissions.css";
import axios from "axios";
import { HomeIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Comissions = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [bulkCommission, setBulkCommission] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    const fetchProducts = async () => {
        try {
            const response = await axios.get('/api/categories/getProducts');
            if (response.status === 200) {
                setProducts(response.data);
                setFilteredProducts(response.data);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);
        setFilteredProducts(
            products.filter(product =>
                product.title.toLowerCase().includes(value) ||
                product.price.toString().includes(value)
            )
        );
    };

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });

        const sortedProducts = [...filteredProducts].sort((a, b) => {
            if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
            if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
            return 0;
        });
        setFilteredProducts(sortedProducts);
    };

    const handleSelectProduct = (productId) => {
        setSelectedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const handleSelectAll = () => {
        if (selectedProducts.length === filteredProducts.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(filteredProducts.map(product => product.id));
        }
    };

    const handleBulkCommissionChange = (e) => {
        setBulkCommission(e.target.value);
    };

    const applyBulkCommission = () => {
        const updatedProducts = filteredProducts.map(product => {
            if (selectedProducts.includes(product.id)) {
                return { ...product, commission: bulkCommission };
            }
            return product;
        });
        setFilteredProducts(updatedProducts);
    };

    const handleCommissionChange = (productId, value) => {
        const updatedProducts = filteredProducts.map(product => {
            if (product.id === productId) {
                return { ...product, commission: value };
            }
            return product;
        });
        setFilteredProducts(updatedProducts);
    };

    const saveCommissions = async () => {
        try {
            const changedProducts = filteredProducts.filter(product => 
                product.commission !== products.find(p => p.id === product.id)?.commission
            );
            if (changedProducts.length === 0) {
                alert("No changes to save.");
                return;
            }
            await axios.post('/api/admin/commissions', { products: changedProducts });
            alert("Commissions updated successfully!");
        } catch (error) {
            console.error("Error saving commissions:", error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return (
        <>
            <div className="seller-data">
                <p className='back-btn text-of-app'>
                    <HomeIcon
                        className="cursor-pointer"
                        onClick={() => navigate(`/admin/`)}
                        style={{ width: "18px", color: "var(--text-of-app)", transform: "translateY(-1px)" }}
                    />
                    &nbsp; /&nbsp; <span className="cursor-pointer">Commissions</span>
                </p>

                <div className="d-flex justify-content-center">
                    <h4 className="text-of-app">Commissions</h4>
                </div>

                <div className="d-flex row my-3">
                    <div className="col-md-4 my-2 ">

                    <input
                        type="text"
                        className="form-control w-100"
                        placeholder="Search by title or price"
                        value={searchTerm}
                        onChange={handleSearch}
                        />
                    </div>
                    <div className="col-md-4  my-2 offset-md-4">

                    <div className="d-flex">
                        <input
                            type="number"
                            className="form-control me-2"
                            placeholder="Bulk Commission"
                            value={bulkCommission}
                            onChange={handleBulkCommissionChange}
                            />
                        <button className="btn btn-success" onClick={applyBulkCommission}>
                            Apply
                        </button>
                            </div>
                    </div>
                </div>

                <div className="d-flex justify-content-end my-3">
                    <button className="btn btn-success" onClick={saveCommissions}>
                        Save Commissions
                    </button>
                </div>

                <div className="table-responsive">
                    <table className="table comission-table table-striped border" >
                        <thead className="text-of-app" >
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={selectedProducts.length === filteredProducts.length}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th onClick={() => handleSort("title")}>
                                    Title {sortConfig.key === "title" && (sortConfig.direction === "asc" ? <FaChevronUp /> : <FaChevronDown />)}
                                </th>
                                <th onClick={() => handleSort("shopid")}>
                                     {sortConfig.key === "shopid" && (sortConfig.direction === "asc" ? <FaChevronUp /> : <FaChevronDown />)}
                                Shop Id</th>
                                <th onClick={() => handleSort("price")}>
                                    Price {sortConfig.key === "price" && (sortConfig.direction === "asc" ? <FaChevronUp /> : <FaChevronDown />)}
                                </th>
                                <th>Commission (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr key={product.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={selectedProducts.includes(product.id)}
                                            onChange={() => handleSelectProduct(product.id)}
                                        />
                                    </td>
                                    <td>{product.title}</td>
                                    <td>{product.shop_id}</td>
                                    <td>{product.price}</td>
                                    <td>
                                        <input
                                            type="number"
                                            className="form-control"
                                            style={{
                                                color: "black!important",
                                            }}
                                            value={product.commission || ""}
                                            onChange={(e) => handleCommissionChange(product.id, e.target.value)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                
            </div>
        </>
    );
};

export default Comissions;