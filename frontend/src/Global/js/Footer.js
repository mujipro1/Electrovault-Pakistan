import "../css/Footer.css";
import { useNavigate } from "react-router-dom";

const Footer = () => {
    const navigate = useNavigate();
    return (
        <>
            <div className="footer-main py-5">
                <div className="row mx-0 p-4 pt-4">

                    <div className="col-md-5 mt-3 px-4">
                        <div className="d-flex flex-column align-items-center">
                            <p className="p  fw-bold">ElectroVault</p>
                            <div className="">
                                <div className="f-link" onClick={() => {navigate('/about-us')}}>About Us</div>
                                <div className="f-link" onClick={() => {navigate('/featured-products')}}>Featured Products</div>
                                <div className="f-link" onClick={() => {navigate('/categories')}}>Categories</div>
                                <div className="f-link" onClick={() => {navigate('/signup')}}>Sign Up</div>
                                <div className="f-link" onClick={() => {navigate('/signin')}}>Sign In</div>
                            </div>
                        </div>

                    </div>
                    <div className="col-md-7 mt-3 px-4">
                        <p className="p  text-center fw-bold">Reach Out to Us</p>
                        <div className="my-4 text-center">
                            <div className="f-link">electrovault.pk@gmail.com</div>
                            <div className="f-link">+92-332-9324759, +92-325-5611624</div>
                            <p className="p  text-center fw-bold mt-4">Policies</p>
                            <div className="f-link" onClick={() => {navigate('/terms-and-conditions')}}>Terms and Conditions</div>
                            <div className="f-link" onClick={() => {navigate('/privacy-policy')}}>Privacy Policy</div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
};

export default Footer;