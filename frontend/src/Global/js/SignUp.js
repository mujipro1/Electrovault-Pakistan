import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/SignUp.css";

const SignUp = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [isBuyer, setIsBuyer] = useState(1);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        address: "",
        city: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Frontend validation
        if (!validateEmail(formData.email)) {
            alert("Please enter a valid email address.");
            return;
        }

        if (formData.password.length < 6) {
            alert("Password must be at least 6 characters long.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        try {
            const response = await axios.post("/api/auth/addNewUser", {
                ...formData,
                isBuyer,
            });

            if (response.status === 200 || response.status === 201) {
                alert("User registered successfully!");
                navigate("/signin");
            }
        } catch (error) {
            console.error("Error registering user:", error);
            alert("An error occurred while registering. Please try again.");
        }
    };

    return (
        <div className="sign-up-container">
            {page == 0 && (
                <>
                    <div className="d-flex mt-4 justify-content-center flex-column align-items-center py-3">
                        <h3 className="text-of-app">Sign Up With Us</h3>
                        <p className="text-secondary"> Get started with your account</p>
                    </div>
                    <div className="my-5 d-flex justify-content-center align-items-center flex-column">
                        <h3 className="text-of-app">I want to </h3>
                        <div className="d-flex justify-content-center my-4">
                            <div className="signup-card mx-2" onClick={() => { setPage(1); setIsBuyer(1); }}>
                                <h3>Buy Items</h3>
                                <p className="my-2">Become our regular user</p>
                            </div>
                            <div className="signup-card mx-2" onClick={() => { setPage(1); setIsBuyer(0); }}>
                                <h3>Sell Items</h3>
                                <p className="my-2">Sell your items to our users</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
            {page == 1 && (
                <>
                    <div className="my-3 d-flex justify-content-center align-items-center flex-column">
                        <h3 className="text-of-app">Sign Up as a {isBuyer == 1 ? "Buyer" : "Seller"}</h3>
                        <p className="text-secondary">Please fill in the form below</p>
                    </div>
                    <form className="signup-form" onSubmit={handleSubmit}>
                        <div className="row m-0 d-flex justify-content-start align-items-center flex-column">
                            <div className="col-md-5">
                                <div className="d-flex justify-content-center my-3">
                                    <label className="text-secondary w-25">Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        className="form-control w-75"
                                        placeholder="Enter your full name"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="d-flex justify-content-center my-3">
                                    <label className="text-secondary w-25">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control w-75"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="d-flex justify-content-center my-3">
                                    <label className="text-secondary w-25">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        className="form-control w-75"
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="d-flex justify-content-center my-3">
                                    <label className="text-secondary w-25">Confirm Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        className="form-control w-75"
                                        placeholder="Confirm your password"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="d-flex justify-content-center my-3">
                                    <label className="text-secondary w-25">Phone Number</label>
                                    <input
                                        type="text"
                                        name="phoneNumber"
                                        className="form-control w-75"
                                        placeholder="Enter your phone number"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="d-flex justify-content-center my-3">
                                    <label className="text-secondary w-25">Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        className="form-control w-75"
                                        placeholder="Enter your address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="d-flex justify-content-center my-3">
                                    <label className="text-secondary w-25">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        className="form-control w-75"
                                        placeholder="Enter your city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="d-flex justify-content-center my-5">
                                    <button type="submit" className="btn btn-success">Submit</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
};

export default SignUp;
