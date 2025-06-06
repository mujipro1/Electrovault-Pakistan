import "../css/TAC.css";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
    const navigate = useNavigate();
    return (
        <>
            <div className="py-5 TAC">
                <div className="d-flex justify-content-center">
                    <h3 className="text-of-app">Privacy Policy</h3>
                </div>

                <div className="d-flex justify-content-center mt-4">
                    <div className="col-md-10 text-of-app">

                        Welcome to ElectroVault! Your privacy is important to us. This Privacy Policy outlines how we collect, use, disclose, and protect your personal information when you use our e-commerce platform. By accessing or using our services, you agree to this Privacy Policy.
                        <br /><br />
                        <hr className="text-of-app" style={{ width: "100%" }} />
                        <h4 className="text-of-app mt-5">Information We Collect</h4>
                        <br/>
                        
                        We collect the following types of information:
                        <br/>
                        <br/><li>Personal Information: Name, email, phone number, shipping and billing addresses, and payment details.</li>
                        <br/><li>Account Information: Username, password, and order history.</li>
                        <br/><li>Transaction Data: Purchase history, payment methods, and transaction records.</li>
                        <br/><li>Cookies and Tracking Technologies: We use cookies to enhance user experience and track website activity.</li>



                        <br /><br /><br />
                        <hr className="text-of-app" style={{ width: "100%" }} />
                        <h4 className="text-of-app mt-5">How We Use Your Information</h4>
                        <br/>
                        We use the collected data for the following purposes:
                        <br/>

                        <br/><li>To provide and manage your account.</li>
                        <br/><li>To process transactions and fulfill orders.</li>
                        <br/><li>To improve our platform’s functionality and user experience.</li>
                        <br/><li>To prevent fraud and enhance security.</li>
                        <br/><li>To send updates, promotional offers, and important notices.</li>
                        <br/><li>To comply with legal obligations.</li>



                        <br /><br /><br />
                        <hr className="text-of-app" style={{ width: "100%" }} />
                        <h4 className="text-of-app mt-5">How We Share Your Information</h4>
                        <br/>

                        We do not sell your personal data. However, we may share information with:
                        <br/>

                        <br/><li>Service Providers: Payment processors, shipping partners, and IT service providers.</li>
                        <br/><li>Legal Authorities: When required by law or to protect our rights.</li>
                        <br/><li>Business Transfers: In case of a merger, acquisition, or sale of assets.</li>



                        <br /><br /><br />
                        <hr className="text-of-app" style={{ width: "100%" }} />
                        <h4 className="text-of-app mt-5">Data Security</h4>
                        <br/>

                        We implement security measures to protect your personal information from unauthorized access, loss, or misuse. However, no system is completely secure, and we cannot guarantee absolute security.

                        <br /><br /><br />
                        <hr className="text-of-app" style={{ width: "100%" }} />
                        <h4 className="text-of-app mt-5">Your Rights and Choices</h4>

                        <br/><li>Access & Correction: You can review and update your personal information in your account settings.</li>
                        <br/><li>Opt-Out: You can opt-out of promotional communications.</li>
                        <br/><li>Account Deletion: You may request account deletion by contacting our support team.</li>



                        <br /><br /><br />
                        <hr className="text-of-app" style={{ width: "100%" }} />
                        <h4 className="text-of-app mt-5">Cookies and Tracking Technologies</h4>
                        <br/>

                        We use cookies to improve user experience, analyze traffic, and personalize content. You can manage cookie preferences through your browser settings.

                        <br /><br /><br />
                        <hr className="text-of-app" style={{ width: "100%" }} />
                        <h4 className="text-of-app mt-5">Third-Party Links</h4>
                        <br/>

                        Our platform may contain links to third-party websites. We are not responsible for their privacy practices, and we encourage you to review their privacy policies.

                        <br /><br /><br />
                        <hr className="text-of-app" style={{ width: "100%" }} />
                        <h4 className="text-of-app mt-5">Children’s Privacy</h4>
                        <br/>

                        Our services are not intended for users under 18. We do not knowingly collect personal data from children.

                        <br /><br /><br />
                        <hr className="text-of-app" style={{ width: "100%" }} />
                        <h4 className="text-of-app mt-5">Changes to This Privacy Policy</h4>
                        <br/>

                        We may update this policy from time to time. We will notify users of significant changes, and continued use of our services constitutes acceptance of the revised policy.

                        <br /><br /><br />

                        For any questions or concerns, please contact us at <strong>electrovault.pk@gmail.com</strong>
                       <br /><br />
                        
                        Thank you for using ElectroVault!

                    </div>
                </div>
            </div>
        </>
    )
};

export default PrivacyPolicy;