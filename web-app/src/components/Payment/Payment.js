import React, { useState } from "react";
import './payment.css';
import { useNavigate } from "react-router-dom";

const Payment = () => {
  const [email, setEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path); // Navigate to the specified path
    }

  const handleSubmit = (event) => {
    event.preventDefault();

    const requestBody = {
      email,
    };

    fetch("https://swq5cv9rk2.execute-api.us-east-1.amazonaws.com/$default/sendEmail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("API response:", data);
        alert("Email sent successfully via API Gateway!");
        // Redirect somewhere - add CloudFront URL
        window.location.href = ""; // Add your CloudFront URL here
      })
      .catch((err) => {
        console.error("API call failed:", err);
        alert("Error calling API. Check console for details.");
      });
  };

  return (
    <div className="checkout-wrapper">
      <div className="checkout-container">
        <div className="branding">
          <div className="branding-title">Mock Checkout</div>
        </div>

        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="item-row">
            <div className="item-name">Land</div>
            <div className="item-price">€20.00</div>
          </div>
          <div className="total-row">
            <div>Total</div>
            <div>€20.00</div>
          </div>
        </div>

        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="checkoutEmail">Email</label>
            <input
              type="email"
              id="checkoutEmail"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="checkoutCardNumber">Card Number</label>
            <input
              type="text"
              id="checkoutCardNumber"
              placeholder="1234 1234 1234 1234"
              required
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ display: "flex", gap: "1rem" }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="checkoutCardExpiry">Exp. (MM/YY)</label>
              <input
                type="text"
                id="checkoutCardExpiry"
                placeholder="MM/YY"
                required
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="checkoutCardCVC">CVC</label>
              <input
                type="text"
                id="checkoutCardCVC"
                placeholder="123"
                required
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="checkout-button"onClick={() => handleNavigation("/PosLoginCompany")}>
            Pay €20.00
          </button>
        </form>

        <div className="footer">
          <p>
            Powered by <a href="#">Mock Stripe-Style</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Payment;
