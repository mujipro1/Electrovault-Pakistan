import { useNavigate } from "react-router-dom";
import "../css/AddNewShop.css";

const SubmitNewShopConfirmation = () => {
    const navigate = useNavigate();
    return(
        <>
        <div className="add-new-shop">
            <div className="d-flex justify-content-center align-items-center py-3 flex-column" style={{height:"90vh"}}>
                <h3>Thank You for Trusting Us</h3>
                <div className="col-lg-6">
                <p className="text-center mx-3">We have recieved your request and our teams would be looking into it. You will get a confirmation message as soon as your request is approved. Our request approval time usually takes up to 2 working days or less. Thanks for your patience.</p>
                </div>
                <div className="my-3">
                    <button className="btn btn-success" onClick={() => navigate(`/seller/`)}>Go to Home</button>
                </div>
            </div>
       </div>
        </>
    );
}

export default SubmitNewShopConfirmation;