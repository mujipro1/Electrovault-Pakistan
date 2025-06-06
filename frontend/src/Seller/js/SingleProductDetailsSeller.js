import { useEffect, useState } from 'react';
import { FaStar, FaUser } from "react-icons/fa";
import { PiMinus, PiPlus } from "react-icons/pi";
import { IoCall, IoMail } from "react-icons/io5";
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { HomeIcon } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

const SingleProductDetailsSeller = () => {
    const productId = useParams().id;
    const [product, setProduct] = useState({});
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [reviewRating, setReviewRating] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editedProduct, setEditedProduct] = useState({
        title: '',
        description: '',
        price: 0,
        product_specifications: [],
        hiddenBySeller: false
    });
    const [imageUpdates, setImageUpdates] = useState({}); // Track which images to update
    const [imageFiles, setImageFiles] = useState({}); // Store new image files
    const [newImageFiles, setNewImageFiles] = useState([]); // Store completely new image files
    const navigate = useNavigate();
    const MAX_IMAGES = 5;

    const fetchProductDetails = async () => {
        try {
            const response = await axios.get(`/api/products/getProductById/${productId}`);
            if (response.status === 200) {
                setProduct(response.data);
                // Initialize image updates state
                const initialImageUpdates = {};
                if (Array.isArray(response.data.product_images)) {
                    response.data.product_images.forEach((_, index) => {
                        initialImageUpdates[index] = false;
                    });
                }
                setImageUpdates(initialImageUpdates);
                setNewImageFiles([]);
            } else {
                console.error('Error fetching product:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        }
    };

    useEffect(() => {
        fetchProductDetails();
    }, []);

    useEffect(() => {
        if (product) {
            // Remove duplicate specs and ensure valid entries
            const specs = Array.isArray(product.product_specifications) 
                ? [...new Set(product.product_specifications)]
                    .filter(spec => spec && (spec.title || spec.value))
                    .map(spec => ({
                        title: spec.title || '',
                        value: spec.value || ''
                    }))
                : [];

            setEditedProduct({
                title: product.title || '',
                description: product.description || '',
                price: product.price || 0,
                product_specifications: specs,
                hiddenBySeller: product.hiddenBySeller || false
            });
        }
    }, [product]);

    const handleImageChange = (index, file) => {
        setImageUpdates(prev => ({ ...prev, [index]: true }));
        setImageFiles(prev => ({ ...prev, [index]: file }));
    };

    const handleImageUpload = (event, index) => {
        const file = event.target.files[0];
        if (file) {
            handleImageChange(index, file);
        }
    };

    const handleNewImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            if ((product.product_images?.length || 0) + newImageFiles.length < MAX_IMAGES) {
                setNewImageFiles(prev => [...prev, file]);
            } else {
                alert(`Maximum ${MAX_IMAGES} images allowed.`);
            }
        }
    };

    const removeNewImage = (index) => {
        setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    const getCurrentImageCount = () => {
        return (product.product_images?.length || 0) + newImageFiles.length;
    };

    const handleSpecificationChange = (index, field, value) => {
        const specs = [...(editedProduct.product_specifications || [])];
        if (!specs[index]) {
            specs[index] = { title: '', value: '' };
        }
        specs[index][field] = value;
        
        setEditedProduct({ 
            ...editedProduct, 
            product_specifications: specs 
        });
    };

    const addSpecification = () => {
        setEditedProduct({
            ...editedProduct,
            product_specifications: [
                ...(editedProduct.product_specifications || []),
                { title: '', value: '' }
            ]
        });
    };

    const deleteSpecification = (index) => {
        const currentSpecs = editedProduct.product_specifications || [];
        const updatedSpecs = currentSpecs.filter((_, i) => i !== index);
        setEditedProduct({ ...editedProduct, product_specifications: updatedSpecs });
    };

    const handleSave = async () => {
        const formData = new FormData();
        formData.append('title', editedProduct.title);
        formData.append('description', editedProduct.description);
        formData.append('price', editedProduct.price);
        formData.append('specifications', JSON.stringify(editedProduct.product_specifications));
        formData.append('hiddenBySeller', editedProduct.hiddenBySeller);
        
        // Add image updates to formData
        Object.keys(imageUpdates).forEach(index => {
            if (imageUpdates[index] && imageFiles[index]) {
                formData.append(`images[${index}]`, imageFiles[index]);
            }
        });

        // Add new images to formData
        newImageFiles.forEach((file, index) => {
            formData.append(`new_images[${index}]`, file);
        });

        try {
            await axios.post(`/api/seller/editProduct/${productId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setIsEditing(false);
            setImageUpdates({});
            setImageFiles({});
            setNewImageFiles([]);
            fetchProductDetails(); // Refresh product data
        } catch (error) {
            console.error('Error updating product:', error);
        }
    };

    // Placeholder image for display when no images are available
    const renderPlaceholderOrImage = () => {
        if (isEditing && (!Array.isArray(product.product_images) || product.product_images.length === 0) && newImageFiles.length > 0) {
            // Show the first new image when editing and there are new images
            return (
                <img
                    src={URL.createObjectURL(newImageFiles[currentImageIndex < newImageFiles.length ? currentImageIndex : 0])}
                    alt="New Product"
                    className="img-fluid"
                />
            );
        } else if (Array.isArray(product.product_images) && product.product_images.length > 0 && product.product_images[currentImageIndex] && product.product_images[currentImageIndex].url) {
            // Show existing product image
            return (
                <img
                    src={
                        imageUpdates[currentImageIndex] && imageFiles[currentImageIndex] 
                            ? URL.createObjectURL(imageFiles[currentImageIndex])
                            : `data:image/jpeg;base64,${product.product_images[currentImageIndex].url.replace(/^base64:type\d+:/, '')}`
                    }
                    alt="Product"
                    className="img-fluid"
                />
            );
        } else {
            // Placeholder when no images
            return (
                <img
                    src="https://via.placeholder.com/500"
                    alt="Placeholder"
                    className="img-fluid"
                />
            );
        }
    };

    return (
        <div className="single-product pt-5">
            <p className='back-btn text-of-app px-3'>
                <HomeIcon className="cursor-pointer"
                    onClick={() => navigate(`/seller`)}
                    style={{ width: "18px", color: "var(--text-of-app)", transform: "translateY(-1px)" }} />&nbsp; /&nbsp;&nbsp;
                    <span className="cursor-pointer"
                    onClick={() => navigate(`/seller/shop/${product.shop_id}`)}
                    style={{ width: "18px", color: "var(--text-of-app)", transform: "translateY(-1px)" }} >Shop</span>
                &nbsp; /&nbsp;&nbsp;Product
            </p>

            <div className="d-flex justify-content-center">
                <div className="col-lg-10">
                    <div className="row mx-0 my-4">
                        <div className="col-lg-6">
                            <div className="sp-img-cont br-lg text-center position-relative">
                                {renderPlaceholderOrImage()}
                                
                                {/* Image Dots for navigation */}
                                {(Array.isArray(product.product_images) && product.product_images.length > 0) || newImageFiles.length > 0 ? (
                                    <div className="d-flex justify-content-center mt-3">
                                        {Array.isArray(product.product_images) && product.product_images.map((_, index) => (
                                            <div
                                                key={`existing-${index}`}
                                                onClick={() => setCurrentImageIndex(index)}
                                                className={`mx-1 rounded-circle`}
                                                style={{
                                                    width: '10px',
                                                    height: '10px',
                                                    cursor: 'pointer',
                                                    backgroundColor:
                                                        index === currentImageIndex ? '#007bff' : '#ccc',
                                                }}
                                            ></div>
                                        ))}
                                        {isEditing && newImageFiles.map((_, index) => {
                                            const dotIndex = (product.product_images?.length || 0) + index;
                                            return (
                                                <div
                                                    key={`new-${index}`}
                                                    onClick={() => setCurrentImageIndex(dotIndex)}
                                                    className={`mx-1 rounded-circle`}
                                                    style={{
                                                        width: '10px',
                                                        height: '10px',
                                                        cursor: 'pointer',
                                                        backgroundColor:
                                                            dotIndex === currentImageIndex ? '#007bff' : '#ccc',
                                                    }}
                                                ></div>
                                            );
                                        })}
                                    </div>
                                ) : null}
                            </div>

                            {/* Thumbnail row with edit options */}
                            {isEditing && (
                                <div className="d-flex mt-3 justify-content-center flex-wrap">
                                    {Array.isArray(product.product_images) && product.product_images.map((image, index) => (
                                        <div key={`thumbnail-${index}`} className="position-relative mx-2 mb-3">
                                            <div
                                                className={`product-thumbnail ${currentImageIndex === index ? 'active' : ''}`}
                                                onClick={() => setCurrentImageIndex(index)}
                                            >
                                                <img
                                                    src={
                                                        imageUpdates[index] && imageFiles[index]
                                                            ? URL.createObjectURL(imageFiles[index])
                                                            : `data:image/jpeg;base64,${image.url.replace(/^base64:type\d+:/, '')}`
                                                    }
                                                    alt={`Thumbnail ${index + 1}`}
                                                    className="img-fluid"
                                                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                                />
                                            </div>
                                            <div className="mt-2 text-center">
                                                <input
                                                    type="file"
                                                    id={`image-upload-${index}`}
                                                    accept="image/jpeg, image/png, image/jpg"
                                                    onChange={(e) => handleImageUpload(e, index)}
                                                    style={{ display: 'none' }}
                                                />
                                                <label
                                                    htmlFor={`image-upload-${index}`}
                                                    className="btn btn-sm btn-outline-primary"
                                                >
                                                    Replace
                                                </label>
                                                {imageUpdates[index] && (
                                                    <button
                                                        className="btn btn-sm btn-outline-danger ms-1"
                                                        onClick={() => {
                                                            setImageUpdates(prev => ({ ...prev, [index]: false }));
                                                            setImageFiles(prev => {
                                                                const newFiles = { ...prev };
                                                                delete newFiles[index];
                                                                return newFiles;
                                                            });
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Display new images being added */}
                                    {newImageFiles.map((file, index) => {
                                        const thumbnailIndex = (product.product_images?.length || 0) + index;
                                        return (
                                            <div key={`new-thumbnail-${index}`} className="position-relative mx-2 mb-3">
                                                <div
                                                    className={`product-thumbnail ${currentImageIndex === thumbnailIndex ? 'active' : ''}`}
                                                    onClick={() => setCurrentImageIndex(thumbnailIndex)}
                                                >
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt={`New Image ${index + 1}`}
                                                        className="img-fluid"
                                                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                                    />
                                                </div>
                                                <div className="mt-2 text-center">
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => removeNewImage(index)}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Add new image button */}
                                    {getCurrentImageCount() < MAX_IMAGES && (
                                        <div className="position-relative mx-2 mb-3">
                                            <div 
                                                className="product-thumbnail d-flex justify-content-center align-items-center"
                                                style={{ 
                                                    width: '80px', 
                                                    height: '80px', 
                                                    border: '2px dashed #ccc',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <input
                                                    type="file"
                                                    id="add-new-image"
                                                    accept="image/jpeg, image/png, image/jpg"
                                                    onChange={handleNewImageUpload}
                                                    style={{ display: 'none' }}
                                                />
                                                <label
                                                    htmlFor="add-new-image"
                                                    className="d-flex justify-content-center align-items-center"
                                                    style={{ 
                                                        width: '100%', 
                                                        height: '100%',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <PiPlus size={24} />
                                                </label>
                                            </div>
                                            <div className="mt-2 text-center">
                                                <label
                                                    htmlFor="add-new-image"
                                                    className="btn btn-sm btn-outline-success"
                                                >
                                                    Add Image
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Regular thumbnail row when not editing */}
                            {!isEditing && Array.isArray(product.product_images) && product.product_images.length > 0 && (
                                <div className="d-flex mt-3 justify-content-center flex-wrap">
                                    {product.product_images.map((image, index) => (
                                        <div
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`product-thumbnail mx-2 ${index === currentImageIndex ? 'active' : ''}`}
                                        >
                                            <img
                                                src={`data:image/jpeg;base64,${image.url.replace(/^base64:type\d+:/, '')}`}
                                                alt={`Thumbnail ${index + 1}`}
                                                className="img-fluid"
                                                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {/* Message when no images (only in editing mode) */}
                            {isEditing && (!Array.isArray(product.product_images) || product.product_images.length === 0) && newImageFiles.length === 0 && (
                                <div className="text-center mt-3">
                                    <p>No images available. Add up to {MAX_IMAGES} images.</p>
                                    <input
                                        type="file"
                                        id="add-first-image"
                                        accept="image/jpeg, image/png, image/jpg"
                                        onChange={handleNewImageUpload}
                                        style={{ display: 'none' }}
                                    />
                                    <label
                                        htmlFor="add-first-image"
                                        className="btn btn-primary"
                                    >
                                        Upload First Image
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className="col-lg-5 offset-lg-1">
                            <div className="d-flex justify-content-between align-items-center">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editedProduct.title}
                                        onChange={(e) => setEditedProduct({...editedProduct, title: e.target.value})}
                                    />
                                ) : (
                                    <h1 className='my-4'>{product.title}</h1>
                                )}
                                <div>
                                    {isEditing ? (
                                        <div className="d-flex align-items-center">
                                            <button 
                                                className={`btn mx-2 ${editedProduct.hiddenBySeller ? 'btn-info' : 'btn-warning'}`}
                                                onClick={() => setEditedProduct({
                                                    ...editedProduct, 
                                                    hiddenBySeller: !editedProduct.hiddenBySeller
                                                })}
                                            >
                                                {editedProduct.hiddenBySeller ? 'Unhide' : 'Hide'}
                                            </button>
                                            <button 
                                                className="btn btn-success"
                                                onClick={handleSave}
                                            >
                                                Save
                                            </button>
                                            <button 
                                                className="btn btn-secondary ms-2"
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setImageUpdates({});
                                                    setImageFiles({});
                                                    setNewImageFiles([]);
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            {product.hiddenBySeller == 1 && (
                                                <span className="badge bg-warning mx-2">Hidden</span>
                                            )}
                                            {product.hiddenBySeller == 0 && (
                                                <span className="badge bg-success mx-2">Visible</span>
                                            )}
                                            <button 
                                                className="btn btn-primary mx-2"
                                                onClick={() => setIsEditing(true)}
                                            >
                                                Edit
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {isEditing ? (
                                <input
                                    type="number"
                                    className="form-control mt-3"
                                    value={editedProduct.price}
                                    onChange={(e) => setEditedProduct({...editedProduct, price: e.target.value})}
                                />
                            ) : (
                                <h3>Pkr {product.price}</h3>
                            )}

                            <div className="d-flex align-items-center mt-3">
                                <div className="me-2">Rating: {product.rating ? Number(product.rating).toFixed(1) : "0.0"}</div>
                                <div className="d-flex">
                                    {[...Array(5)].map((_, index) => (
                                        <FaStar
                                            key={index}
                                            className={
                                                index < Math.round(product.rating || 0)
                                                    ? "text-warning"
                                                    : "text-secondary"
                                            }
                                        />
                                    ))}
                                </div>
                            </div>

                            <hr className="my-5" />
                            <h4>Description</h4>
                            {isEditing ? (
                                <textarea
                                    className="form-control"
                                    value={editedProduct.description}
                                    onChange={(e) => setEditedProduct({...editedProduct, description: e.target.value})}
                                    rows="4"
                                />
                            ) : (
                                <p>{product.description}</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-5 mx-0 my-4 row">
                        <div className="col-lg-12">
                            <h4 className="mb-4">Specifications</h4>
                            {isEditing ? (
                                <>
                                    {editedProduct.product_specifications?.map((spec, index) => (
                                        <div key={index} className="d-flex my-2 align-items-center">
                                            <input
                                                type="text"
                                                className="form-control mx-2"
                                                value={spec.title || ''}
                                                onChange={(e) => handleSpecificationChange(index, 'title', e.target.value)}
                                                placeholder="Title"
                                            />
                                            <input
                                                type="text"
                                                className="form-control mx-2"
                                                value={spec.value || ''}
                                                onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                                                placeholder="Value"
                                            />
                                            <button 
                                                className="btn btn-danger"
                                                onClick={() => deleteSpecification(index)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    ))}
                                    <button className="btn btn-secondary mt-2" onClick={addSpecification}>
                                        Add Specification
                                    </button>
                                </>
                            ) : (
                                <>
                                {Array.isArray(product.product_specifications) &&
                                product.product_specifications.filter(Boolean).length > 0 ? (
                                    product.product_specifications
                                        .filter(Boolean)
                                        .map((spec, index) => (
                                            <div key={index} className="d-flex my-1 justify-content-center">
                                                <div className="spec-title">{spec.title}</div>
                                                <div className="spec-item">{spec.value}</div>
                                            </div>
                                        ))
                                ) : (
                                    <p className="text-muted">No specifications available</p>
                                )}
                                </>
                            )}
                        </div>

                        {Array.isArray(product.product_reviews) &&
                                product.product_reviews.filter((review) => review && review.user).length > 0 && (
                                    <>
                                        <h4 className="my-4 pt-4">Reviews</h4>
                                        {product.product_reviews
                                            .filter((review) => review && review.user)
                                            .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date, newest first
                                            .slice(0, 6)
                                            .map((review) => (
                                                <div className="col-lg-6 my-2" key={review.id}>
                                                    <div className="review-container-sp">
                                                        <div className="d-flex justify-content-start align-items-center">
                                                            <div className="pfp-seller">
                                                                <FaUser className="user-icon-seller" />
                                                            </div>
                                                            <div className="mx-3 fw-bold">{review.user.name}</div>
                                                        </div>
                                                            <div className="review-text my-4">{review.description}</div>
                                                        <div className="d-flex my-2 justify-content-start">
                                                            {[...Array(5)].map((_, index) => (
                                                                <FaStar
                                                                    key={index}
                                                                    className={
                                                                        index < Math.round(review.rating)
                                                                            ? "text-warning"
                                                                            : "text-secondary"
                                                                    }
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </>
                                )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SingleProductDetailsSeller;