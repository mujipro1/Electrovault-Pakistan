import React, { useEffect, useState } from 'react';
import '../css/AddNewProduct.css';
import '../css/AddNewShop.css';
import { HomeIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const AddNewProduct = () => {
    const navigate = useNavigate();

    const shopId = useParams().id;
    const [categories, setCategories] = useState([]);

    const [specifications, setSpecifications] = useState([{ key: '', value: '' }]);
    const [productData, setProductData] = useState({
        name: "",
        category: "",
        price: "",
        stock: "",
        description: "",
        images: []
    });

    const fetchCategories = async () => {
        try {
            const response = await axios.get("/api/categories");
            if (response.status === 200) {
                return response.data;
            } else {
                console.error("Error fetching categories:", response.statusText);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const categoriesData = await fetchCategories();
            if (categoriesData) {
                setCategories(categoriesData);
            }
        };
        fetchData();
    }, []);

    const handleAddSpecification = () => {
        setSpecifications([...specifications, { key: '', value: '' }]);
    };

    const handleSpecificationChange = (index, field, value) => {
        const updatedSpecifications = [...specifications];
        updatedSpecifications[index][field] = value;
        setSpecifications(updatedSpecifications);
    };

    const handleRemoveSpecification = (index) => {
        const updatedSpecifications = specifications.filter((_, i) => i !== index);
        setSpecifications(updatedSpecifications);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProductData({ ...productData, [name]: value });
    };

    const handleFileChange = (e, index) => {
        const file = e.target.files[0];
        if (file && !['image/png', 'image/jpg', 'image/jpeg'].includes(file.type)) {
            alert("Only PNG, JPG, or JPEG files are allowed.");
            return;
        }
        const files = [...productData.images];
        files[index] = file;
        setProductData({ ...productData, images: files });
    };

    const handleAddProduct = async () => {
        // Frontend validation
        if (!productData.name.trim() || !productData.category || !productData.price || !productData.stock || !productData.description.trim()) {
            alert("Please fill in all required fields.");
            return;
        }

        if (specifications.some(spec => !spec.key.trim() || !spec.value.trim())) {
            alert("Please fill in all specification fields.");
            return;
        }

        if (productData.images.length === 0 || productData.images.some(image => !image)) {
            alert("Please upload all required images.");
            return;
        }

        const formData = new FormData();
        formData.append("name", productData.name.trim());
        formData.append("category", productData.category.trim());
        formData.append("price", productData.price);
        formData.append("stock", productData.stock);
        formData.append("description", productData.description.trim());
        formData.append("shopId", shopId);

        specifications.forEach((spec, index) => {
            formData.append(`specifications[${index}][key]`, spec.key);
            formData.append(`specifications[${index}][value]`, spec.value);
        });

        // Append all files under the same field name
        productData.images.forEach((image) => {
            if (image) {
                formData.append("images", image);
            }
        });

        try {
            const response = await axios.post("/api/products/addNew", formData);
            if (response.status === 200 || response.status === 201) {
                navigate(`/seller/shop/${shopId}`);
            } else {
                console.error("Error adding product:", response.statusText);
            }
        } catch (error) {
            console.error("Error adding product:", error);
        }
    };

    return (
        <div className="add-new-product">
            <p className='back-btn'>
                <HomeIcon className="cursor-pointer"
                    onClick={() => navigate(`/seller/`)}
                    style={{ width: "18px", transform: "translateY(-1px)" }} />
                &nbsp; /&nbsp;
                <span onClick={() => navigate(`/seller/shop/1`)} className="cursor-pointer">Shop</span>
                &nbsp;/&nbsp; New Product
            </p>

            <div className="d-flex justify-content-center align-items-center py-3 flex-column">
                <h3>Adding New Product?</h3>
                <p className="mx-3 sec-text">Let's get started by adding your product details</p>
            </div>

            <div className="row my-3">
                <div className="col-lg-6 p-3">
                    <div className="new-shop-container p-3 px-4">
                        <h5 className="mt-2 mb-4">Product Details</h5>

                        <label className="form-label mx-2 sec-text">Name</label>
                        <input type="text" name="name" className="form-control mb-3"
                            placeholder="Enter Product Name"
                            value={productData.name} onChange={handleInputChange} />

                        <label className="form-label mx-2 sec-text">Category</label>
                        <select name="category" className="form-select mb-3"
                            value={productData.category} onChange={handleInputChange}>
                            <option value="" disabled>Select Category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.title}
                                </option>
                            ))} 
                        </select>

                        <label className="form-label mx-2 sec-text">Price (PKR)</label>
                        <input name="price" className="form-control mb-3" type="number"
                            placeholder="Enter Price"
                            value={productData.price} onChange={handleInputChange} />

                        <label className="form-label mx-2 sec-text">Stock</label>
                        <input name="stock" className="form-control mb-3" type="number"
                            placeholder="Enter Stock"
                            value={productData.stock} onChange={handleInputChange} />

                        <label className="form-label mx-2 sec-text">Image 1</label>
                        <input type="file" className="form-control mb-3" onChange={(e) => handleFileChange(e, 0)} />

                        <label className="form-label mx-2 sec-text">Image 2</label>
                        <input type="file" className="form-control mb-3" onChange={(e) => handleFileChange(e, 1)} />

                        <label className="form-label mx-2 sec-text">Image 3</label>
                        <input type="file" className="form-control mb-3" onChange={(e) => handleFileChange(e, 2)} />

                        <label className="form-label mx-2 sec-text">Image 4</label>
                        <input type="file" className="form-control mb-3" onChange={(e) => handleFileChange(e, 3)} />

                        <label className="form-label mx-2 sec-text">Image 5</label>
                        <input type="file" className="form-control mb-3" onChange={(e) => handleFileChange(e, 4)} />
                    </div>
                </div>

                <div className="col-lg-6 p-3">
                    <div className="new-shop-container p-3 px-4">
                        <h5 className="mt-2 mb-4">Product Description</h5>

                        <label className="form-label mx-2 sec-text">Description</label>
                        <textarea name="description" className="form-control"
                            placeholder="Write a detailed description of your product"
                            rows="6" value={productData.description} onChange={handleInputChange}></textarea>

                        <h5 className="mt-5 mb-3">Product Specifications</h5>
                        <div className="d-flex my-3 justify-content-center">
                            <button className="btn btn-success" id="spec-button" onClick={handleAddSpecification}>
                                Add Specification
                            </button>
                        </div>

                        {specifications.length === 0 && (
                            <div className="text-center my-4 sec-text">No specifications added</div>
                        )}

                        {specifications.map((spec, index) => (
                            <div key={index}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <input
                                        type="text"
                                        className="form-control mx-3"
                                        placeholder="Key"
                                        value={spec.key}
                                        onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                                    />
                                    <button
                                        className="btn btn-danger mx-0 my-2"
                                        onClick={() => handleRemoveSpecification(index)}
                                    >
                                        Remove
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    className="form-control mx-3 mb-4"
                                    placeholder="Value"
                                    value={spec.value}
                                    onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                                />
                            </div>
                        ))}

                        <div className="d-flex mt-4 justify-content-center">
                            <button className="btn btn-success" onClick={handleAddProduct}>Add Product</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddNewProduct;
