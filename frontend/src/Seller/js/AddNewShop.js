import { HomeIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "../css/AddNewShop.css";

const AddNewShop = () => {
    const navigate = useNavigate();
    const [shopDetails, setShopDetails] = useState({
        name: "",
        address: "",
        city: "",
        postalCode: "",
        description: ""
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShopDetails({ ...shopDetails, [name]: value });
    };

    const addShop = async () => {
        try {

            // fetch seller details from local storage
            const token = localStorage.getItem("sellerToken");
            const decodedToken = jwtDecode(token);

            const sellerId = decodedToken.id;

            const response = await axios.post("/api/shop/addNew", 
                { ...shopDetails, sellerId }
            );
            if (response.status === 200) {
                navigate(`/seller/request/complete`);
            } else {
                console.error("Error adding shop:", response.statusText);
            }
        } catch (error) {
            console.error("Error adding shop:", error);
        }
    };

    return(
        <>
        <div className="add-new-shop">
            <p className='back-btn'><HomeIcon className="cursor-pointer" onClick={() => navigate(`/seller/`)} style={{width: "18px", transform: "translateY(-1px)"}}/> &nbsp;/&nbsp; New Shop</p>
            <div className="d-flex justify-content-center align-items-center py-3 flex-column">
                <h3>Adding New Business?</h3>
                <p className="mx-3 sec-text">Let's get started by adding your business or shop details</p>
            </div>

            <div className="row my-3">
                <div className="col-lg-6 p-3">
                    <div className="new-shop-container p-3 px-4">
                        <h5 className="mt-2  mb-4">Shop Details</h5>
                        
                        <label style={{transform:"translateY(7px)"}} className="form-label mx-2 sec-text">Name</label>
                        <input type="text" name="name" className="form-control mb-3" placeholder="Enter Shop Name" value={shopDetails.name} onChange={handleInputChange} />
                    
                        <label style={{transform:"translateY(7px)"}} className="form-label mx-2 sec-text">Address</label>
                        <input type="text" name="address" className="form-control mb-3" placeholder="Enter Shop's Physical Address" value={shopDetails.address} onChange={handleInputChange} />
                    
                        <label style={{transform:"translateY(7px)"}} className="form-label mx-2 sec-text">City</label>
                        <input type="text" name="city" className="form-control mb-3" placeholder="e.g. Islamabad" value={shopDetails.city} onChange={handleInputChange} />
                    
                        <label style={{transform:"translateY(7px)"}} className="form-label mx-2 sec-text">Postal Code</label>
                        <input type="text" name="postalCode" className="form-control mb-3" placeholder="e.g. 45550" value={shopDetails.postalCode} onChange={handleInputChange} />
                    
                        <label style={{transform:"translateY(7px)"}} className="form-label mx-2 sec-text">Description</label>
                        <textarea name="description" className="form-control mb-3" 
                        placeholder="Write a detailed description of your shop that would be reviewed by the admin before publishing"
                        rows="6" value={shopDetails.description} onChange={handleInputChange}></textarea>

                        <div className="d-flex justify-content-center">
                            <button className="btn btn-success" onClick={addShop}>Add Shop</button>
                        </div>
                    
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}

export default AddNewShop;