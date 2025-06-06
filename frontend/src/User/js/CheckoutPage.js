import React, { useState, useEffect } from "react";
import "../css/CheckoutPage.css";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import paymentImg from '../../Images/payment.jpeg';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    phone: "",
    paymentScreenshot: null,
  });

  useEffect(() => {
    const storedCartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    setCartItems(storedCartItems);

    const calculatedTotal = storedCartItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
    setTotalAmount(calculatedTotal);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, paymentScreenshot: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.paymentScreenshot) {
      alert("Please upload a payment screenshot.");
      return;
    }

    const orderData = new FormData();
    orderData.append("fullName", formData.fullName);
    orderData.append("email", formData.email);
    orderData.append("address", formData.address);
    orderData.append("city", formData.city);
    orderData.append("phone", formData.phone)
    orderData.append("totalAmount", totalAmount);
    orderData.append("paymentScreenshot", formData.paymentScreenshot);
    orderData.append("cartItems", JSON.stringify(cartItems));

    try {
      const response = await axios.post("/api/order/newOrder", orderData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200 || response.status === 201) {
        alert("Order placed successfully!");
        localStorage.removeItem("cartItems");
        navigate("/");
      } else {
        alert("Failed to place the order. Please try again.");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("An error occurred while placing the order.");
    }
  };

  return (
    <div className="stripe-page">
      <div className="payment-form">
        <div className="row h-21row m-0 p-0">
          <div className="col-md-5 p-0 overflow-hidden h-21">
            <div className="payment-img-cont">
              <img src={paymentImg} className="payment-img" alt="Payment" />
              <div className="price">Pkr {totalAmount.toFixed(2)}</div>
              <div className="back-price cursor-pointer"
                onClick={() => { navigate('/cart') }}
              > <IoIosArrowBack className="mb-1 " /> Back to Cart</div>
            </div>
          </div>
          <div className="col-md-7 set-height-sp">
            <div className="p-4 py-4">
              <h4>Fill in your credit card details</h4>
              <form className="mt-4" onSubmit={handleSubmit}>
                <div className="input-field">
                  <label className="w-25 pt-2">Full Name</label>
                  <input
                    className="w-75 form-control"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="input-field">
                  <label className="w-25 pt-2">Email</label>
                  <input
                    className="w-75 form-control"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="input-field">
                  <label className="w-25 pt-2">Phone</label>
                  <input
                  className="w-75 form-control"
                  type="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  />
                </div>
                <div className="input-field">
                  <label className="w-25 pt-2">Address</label>
                  <input
                    className="w-75 form-control"
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="input-field">
                  <label className="w-25 pt-2">City</label>
                  <input
                    className="w-75 form-control"
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="border-top py-1 mt-3">
                  <label className="w-25 pt-2 pb-1 text-secondary">Payment Details</label>
                </div>

                <div className="w-100 d-flex justify-content-start">
                  <div className="d-flex w-50 justify-content-start align-items-center">
                    <div className='w-25 '><strong>Bank: </strong></div>
                    <div className='w-50 mx-3'>Easypaisa</div>
                  </div>
                  <div className="d-flex w-50 justify-content-start align-items-center">
                    <div className='w-25 '><strong>Title: </strong></div>
                    <div className='w-50 mx-3'>Project</div>
                  </div>
                </div>

                <div className="d-flex custom-acc-width justify-content-start align-items-center">
                  <div className='w-25 '><strong>Account :</strong></div>
                  <div className='w-50 mx-3'>021239113123</div>
                </div>

                <hr className="my-3" />
                <div className="mt-2 d-flex align-items-center justify-content-center">
                  <div className="mb-1 w-50 text-secondary">Payment Screenshot </div>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleFileChange}
                    required
                  />
                </div>

                <button className="btn btn-success w-100 mt-3" type="submit">Submit</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;