import "../css/TAC.css";
import { useNavigate } from "react-router-dom";

const AboutUs = () => {
    const navigate = useNavigate();
    return (
        <>
            <div className="py-5 TAC">
                <div className="d-flex justify-content-center">
                    <h2 className="text-of-app">About Us</h2>
                </div>

                <div className="text-of-app d-flex justify-content-center flex-column align-items-center mt-4">
                    <div className="col-md-8  text-of-app text-center">

                        <h5 style={{ fontWeight: "400" }}>Welcome to ElectroVault, your one-stop destination for premium electronic products. Our platform is designed to connect buyers with trusted sellers, ensuring a seamless and reliable shopping experience for all your electronic needs.</h5>

                        <h2 className=" mt-5 pt-3 text-of-app">Our Mission</h2>
                        <h5 style={{ fontWeight: "400" }}>Our goal is to revolutionize the e-commerce industry for electronics by offering a specialized platform that caters exclusively to tech enthusiasts, businesses, and manufacturers. We strive to make high-quality electronic products more accessible to everyone.</h5>
                    </div>

                    <div className="col-md-8">



                        <hr className="text-of-app mt-5" style={{ width: "100%" }} />

                        <h2 className=" mt-5 pt-3 text-of-app">Who are we?</h2>
                        <div>At ElectroVault, we are passionate about technology and innovation. Our mission is to create a dedicated marketplace where buyers can find a vast selection of electronic products, from small components to high-end gadgets, all in one place.</div>

                        <h2 className=" mt-5 pt-3 text-of-app">What we offer?</h2>

                        <br /><div><li>Market for Wide Range of Electronics </li></div><div className="mx-4"> From integrated circuits to 3D printers, we provide a platform for extensive collection of electronics tailored to professionals, hobbyists, and businesses.</div>
                        <br /><div><li>Trusted Sellers</li></div><div className="mx-4"> Every seller on our platform is vetted to ensure quality and authenticity.</div>
                        <br /><div><li>Secure Transactions</li></div><div className="mx-4"> We prioritize safe and transparent transactions to give you peace of mind while shopping.</div>
                        <br /><div><li>Efficient Delivery</li></div><div className="mx-4"> Our sellers are committed to providing timely and reliable shipping.</div>

                        <h2 className=" mt-5 pt-3 text-of-app">Why choose us?</h2>

                        <br /><div><li>Electronics-Only Marketplace </li></div><div className="mx-4"> Unlike generic platforms, we focus exclusively on electronics, making it easier for you to find exactly what you need.</div>
                        <br /><div><li>Competetive Pricing</li></div><div className="mx-4"> Get the best deals directly from trusted sellers across the country.</div>
                        <br /><div><li>Customer-Centric Approach</li></div><div className="mx-4"> Our support team is always ready to assist you with any queries or concerns.</div>
                        <br />

                        <div className="my-5">Join us today and be part of a growing community that shares your passion for electronics. Whether you're a buyer looking for quality products or a seller seeking the right audience, ElectroVault is the perfect platform for you.</div>

                        For any questions or concerns, please contact us at <strong>electrovault.pk@gmail.com</strong>
                        <br /><br />

                        Thank you for using ElectroVault!
                    </div>
                </div>
            </div>
        </>
    )
};

export default AboutUs;