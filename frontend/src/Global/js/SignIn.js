import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/SignIn.css";

const SignIn = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const [error, setError] = useState("");

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
    };

    const handleSignIn = async () => {
        try {
            const response = await axios.post("/api/auth/login", credentials);
            if (response.status === 200) {
                // Assuming the response contains a token or user data
                if (response.data.user.role == 'admin') {
                localStorage.setItem("adminToken", response.data.token);
                navigate("/admin"); 
                window.location.reload();
                }
                else if (response.data.user.role == 'seller') {
                    localStorage.setItem("sellerToken", response.data.token);
                    navigate("/seller"); 
                    window.location.reload();
                } else {
                    localStorage.setItem("userToken", response.data.token);
                    navigate("/");
                    window.location.reload();
                }
            } else {
                setError("Invalid email or password.");
            }
        } catch (err) {
            setError("An error occurred during sign-in. Please try again.");
            console.error("Sign-in error:", err);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Enter") {
                handleSignIn();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [credentials]);

    return (
        <div className="sign-in-container">
            <div className="col-md-4 white-bg">

            <h2 className="text-of-app my-3">Sign In</h2>
            {error && <p className="error-text">{error}</p>}
            <div className="form-group">
                <label className="text-secondary">Email</label>
                <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="Enter your email"
                    value={credentials.email}
                    onChange={handleInputChange}
                    />
            </div>
            <div className="form-group">
                <label className="text-secondary">Password</label>
                <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={handleInputChange}
                    />
            </div>
            <button className="btn btn-success w-100 my-3" onClick={handleSignIn}>
                Sign In
            </button>
            </div>
        </div>
    );
};

export default SignIn;
