import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./Navbar"; // Assuming your Navbar is exported from this file
import Sections from "./Sections";
import PosLoginCompany from "../PosLoginCompany/PosLoginCompany";
import PosLoginLandowner from "../PosLoginLandowner/PosLoginLandowner";
import Market from "../Market/Market"
import Pay from "../Payment/Payment"
import AddLand from "../AddLand/addLand"
import forestImage from "../../images/forest.jpg";
import "../../App.css";

const App = () => {
    const location = useLocation();

    // Define routes where the navbar should NOT be shown
    const hiddenNavbarRoutes = ["/PosLoginCompany", "/PosLoginLandowner", "/Market", "/Pay", "/AddLand"];

    return (
        <div>
            {/* Conditionally render the Navbar */}
            {!hiddenNavbarRoutes.includes(location.pathname) && <Navbar />}

            <Routes>
                <Route
                    path="/"
                    element={
                        <>
                            <header className="hero">
                                <img
                                    src={forestImage}
                                    alt="Hero"
                                    className="hero-image"
                                />
                                <div className="hero-overlay">
                                    <h1>GreenSquare</h1>
                                    <p>"In a country like Portugal, where 97% of the land ownership is private"</p>
                                </div>
                            </header>
                            <Sections />
                        </>
                    }
                />
                <Route path="/PosLoginCompany" element={<PosLoginCompany />} />
                <Route path="/PosLoginLandowner" element={<PosLoginLandowner />} />
                <Route path="/Market" element={<Market />} />
                <Route path="/Pay" element={<Pay />} />
                <Route path="/AddLand" element={<AddLand />} />

            </Routes>
        </div>
    );
};

export default App;
