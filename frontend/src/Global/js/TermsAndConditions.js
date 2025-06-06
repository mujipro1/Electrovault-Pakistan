import "../css/TAC.css";
import { useNavigate } from "react-router-dom";

const TermsAndConditions = () => {
    const navigate = useNavigate();
    return (
        <>
            <div className="py-5 TAC">
                <div className="d-flex justify-content-center">
                    <h3 className="text-of-app">Terms and Conditions</h3>
                </div>

                <div className="d-flex justify-content-center mt-4">
                    <div className="col-md-10 text-of-app">
                        Welcome to ElectroVault! These Terms and Conditions govern your access to and use of our e-commerce platform, where sellers can list and sell electronic products. By accessing or using our platform, you agree to comply with these terms. If you do not agree, please refrain from using our services.

                        <h4 className="text-of-app mt-5">Definitions</h4>
                        <br /><div style={{ width: "190px" }}><strong >Platform:</strong></div>Refers to ElectroVault, including its website, and related services.
                        <br /><br /><div style={{ width: "190px" }}><strong >User:</strong> </div>Refers to anyone accessing or using the platform, including buyers and sellers.
                        <br /><br /><div style={{ width: "190px" }}><strong >Seller:</strong> </div>Refers to a registered business or individual listing electronic products for sale.
                        <br /><br /><div style={{ width: "190px" }}><strong >Buyer:</strong> </div>Refers to a user purchasing electronic products from the platform.
                        <br /><br /><div style={{ width: "190px" }}><strong >We/Us/Our:</strong></div> Refers to ElectroVault, the operator of the platform.

                        <br /><br /><br /><br />
                        <hr className="text-of-app" style={{ width: "100%" }} />

                        <h4 className="text-of-app mt-5">User Accounts</h4>
                        <br />
                        <li>Users must be at least 18 years old to create an account.</li><br />
                        <li>You are responsible for maintaining the confidentiality of your login credentials.</li><br />
                        <li>We reserve the right to suspend or terminate accounts for violations of these terms.</li><br />

                        <br /><br /><br /><br />
                        <hr className="text-of-app" style={{ width: "100%" }} />

                        <h4 className="text-of-app mt-5">Seller Obligations</h4>

                        <br /><li>Sellers must ensure that listed products comply with all applicable laws and regulations.</li>
                        <br /><li>Product descriptions must be accurate, and pricing should be transparent.</li>
                        <br /><li>Sellers must handle shipping, returns, and refunds as per the platform's policies.</li>
                        <br /><li>Any counterfeit or prohibited items will result in account suspension.</li>

                        <br /><br /><br /><br />
                        <hr className="text-of-app" style={{ width: "100%" }} />

                        <h4 className="text-of-app mt-5">Buyer Obligations</h4>

                        <br /><li>Buyers agree to provide accurate information for orders and payments.</li>
                        <br /><li>Any disputes regarding a product must be reported within 3 days of delivery.</li>
                        <br /><li>Buyers must not engage in fraudulent or abusive behavior on the platform.</li>

                        <br /><br /><br /><br />
                        <hr className="text-of-app" style={{ width: "100%" }} />

                        <h4 className="text-of-app mt-5">Payments and Transactions</h4>
                        <br /><li>Payments are processed through seller account details.</li>
                        <br /><li>The platform may charge commission fees on sales.</li>
                        <br /><li>Refunds and returns are subject to the seller’s policy and applicable consumer protection laws.</li>

                        <br /><br /><br /><br />
                        <hr className="text-of-app" style={{ width: "100%" }} />

                        <h4 className="text-of-app mt-5">Prohibited Activities</h4>
                        <br />Users are prohibited from:
                        <br /><br /><li>Selling illegal, counterfeit, or hazardous items.</li>
                        <br /><li>Engaging in fraudulent transactions.</li>
                        <br /><li>Using bots or automated systems to manipulate listings.</li>
                        <br /><li>Violating intellectual property rights of third parties.</li>

                        <br /><br /><br /><br />
                        <hr className="text-of-app" style={{ width: "100%" }} />

                        <h4 className="text-of-app mt-5">Intellectual Property</h4>
                        <br /><li>The platform and its content (logos, text, images, software) are the intellectual property of Electrovault.</li>
                        <br /><li>Users must not copy, distribute, or use platform content without prior authorization.</li>


                        <br /><br /><br /><br />
                        <hr className="text-of-app" style={{ width: "100%" }} />

                        <h4 className="text-of-app mt-5">Limitation of Liability</h4>
                        <br/><li>We are not liable for any losses, damages, or disputes arising from transactions between users.</li>
                        <br/><li>The platform does not guarantee the quality or authenticity of products listed by sellers.</li>
                        <br/><li>In no event shall our liability exceed the total amount paid by the user in the past six months.</li>

                        <br /><br /><br /><br />
                        <hr className="text-of-app" style={{ width: "100%" }} />

                        <h4 className="text-of-app mt-5">Termination and Suspension</h4>
                        <br/><li>We reserve the right to suspend or terminate any user account for violations of these terms.</li>
                        <br/><li>Users may terminate their accounts at any time by contacting support.</li>


                        <br /><br /><br /><br />
                        <hr className="text-of-app" style={{ width: "100%" }} />

                        <h4 className="text-of-app mt-5">Governing Law and Dispute Resolution</h4>
                        <br/><li>These Terms and Conditions shall be governed by the laws of Pakistan.</li>
                        <br/><li>Any disputes shall be resolved through arbitration or the relevant legal authorities.</li>



                        <br /><br /><br /><br />
                        <hr className="text-of-app" style={{ width: "100%" }} />

                        <h4 className="text-of-app mt-5">Changes to These Terms</h4>
                        <br/><li>We may update these terms from time to time. Users will be notified of significant changes.</li>
                        <br/><li>Continued use of the platform constitutes acceptance of the updated terms.</li>

                        <br /><br /><br /><br />

                        For any questions or concerns, please contact us at <strong>electrovault.pk@gmail.com</strong>
                       <br /><br />
                        
                        Thank you for using ElectroVault!

                    </div>
                </div>
            </div>
        </>
    )
};

export default TermsAndConditions;