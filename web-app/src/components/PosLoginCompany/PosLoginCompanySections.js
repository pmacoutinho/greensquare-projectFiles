import React, { useState } from 'react';
import Team from '../index/Team';
import '../../posLogin.css'; // Adjust the path to your CSS file
import { Button, Input, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Form } from "@nextui-org/react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
  } from "@nextui-org/react";
  import {Select, SelectItem, Checkbox} from "@nextui-org/react";
  import { useNavigate } from "react-router-dom";

const Sections = () => {
    const [selectedRow, setSelectedRow] = useState(null); // State to store the clicked row data
    const [showPopup, setShowPopup] = useState(false); // State to control popup visibility
    const [offerAmount, setOfferAmount] = useState(''); // State to store the offer amount
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path); // Navigate to the specified path
    }
    
    const handleRowClick = (rowData) => {
        setSelectedRow(rowData); // Set the clicked row data
        setShowPopup(true); // Show the popup
    };

    const closePopup = () => {
        setShowPopup(false); // Hide the popup
    };

    const [password, setPassword] = React.useState("");
    const [submitted, setSubmitted] = React.useState(null);
    const [errors, setErrors] = React.useState({});
  
    // Real-time password validation
    const getPasswordError = (value) => {
      if (value.length < 4) {
        return "Password must be 4 characters or more";
      }
      if ((value.match(/[A-Z]/g) || []).length < 1) {
        return "Password needs at least 1 uppercase letter";
      }
      if ((value.match(/[^a-z]/gi) || []).length < 1) {
        return "Password needs at least 1 symbol";
      }
  
      return null;
    };
  
    const onSubmit = (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.currentTarget));
  
      // Custom validation checks
      const newErrors = {};
  
      // Password validation
      const passwordError = getPasswordError(data.password);
  
      if (passwordError) {
        newErrors.password = passwordError;
      }
  
      // Username validation
      if (data.name === "admin") {
        newErrors.name = "Nice try! Choose a different username";
      }
  
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
  
        return;
      }
  
      if (data.terms !== "true") {
        setErrors({terms: "Please accept the terms"});
  
        return;
      }
  
      // Clear errors and submit
      setErrors({});
      setSubmitted(data);
    };



    const handleMakeOffer = async () => {
        if (!offerAmount) {
            alert("Please enter an offer amount.");
            return;
        }
    
        // Data to send to the API
        const payload = {
            landowner_id: "12345", // Replace with the actual landowner_id
            company_id: "67890",   // Replace with the actual company_id (e.g., from user context or state)
            land_id: selectedRow.id,
            offer_value: parseFloat(offerAmount), // Convert to a number
        };
    
        try {
            const response = await fetch("https://m5yzmb5e48.execute-api.us-east-1.amazonaws.com/makeOffer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
    
            if (response.ok) {
                alert(`Offer of $${offerAmount} made successfully for Land ID ${selectedRow.id}`);
                closePopup(); // Close the popup after success
            } else {
                const errorData = await response.json();
                console.error("Failed to make offer:", errorData);
                alert(`Failed to make an offer: ${errorData.message || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error making offer:", error);
            alert("An error occurred while making the offer. Please try again.");
        }
    };
    const [action, setAction] = React.useState(null);


    return (
        <div>
            <section id="section1" className="section">

                <div className="content-box2">
                    
                    <h1>My Credits</h1>

                    <Table aria-label="My Credits Table">
                        <TableHeader>
                            <TableColumn>Land ID</TableColumn>
                            <TableColumn>Size(m²)</TableColumn>
                            <TableColumn>Location</TableColumn>
                            <TableColumn>Carbon Credits</TableColumn>
                            <TableColumn>Paid Value(€)</TableColumn>
                        </TableHeader>
                        <TableBody>
                            <TableRow key="1">
                                <TableCell>1</TableCell>
                                <TableCell>5000</TableCell>
                                <TableCell>Porto</TableCell>
                                <TableCell>1000</TableCell>
                                <TableCell>2000</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </section>

            <section id="section3" className="section">
                <div className="content-box2">
                    <h1>Offers</h1>
                    <p>Select an offer</p>
                    <Table aria-label="Marketplace Land Table" className="table-marketplace">
                    <TableHeader>
                        <TableColumn>Land ID</TableColumn>
                        <TableColumn>Company Name</TableColumn>
                        <TableColumn>Carbon Credits</TableColumn>
                        <TableColumn>Base Value (€)</TableColumn>
                        <TableColumn>Offered Value (€)</TableColumn>
                        <TableColumn>Accepted</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {[
                        { id: 1, Company_name: 'GreenCircle', credits: 1000, value: 2000, offered_value: 2000, accepted: 'Yes' },
                        { id: 2, Company_name: 'EcoPlan', credits: 1500, value: 3000, offered_value: 3200, accepted: 'No' },
                        ].map((row) => (
                        <TableRow key={row.id} onClick={() => handleRowClick(row)}>
                            <TableCell>{row.id}</TableCell>
                            <TableCell>{row.Company_name}</TableCell>
                            <TableCell>{row.credits}</TableCell>
                            <TableCell>{row.value}</TableCell>
                            <TableCell>{row.offered_value}</TableCell>
                            <TableCell>{row.accepted}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>

                    {showPopup && selectedRow && selectedRow.accepted === 'Yes' && (
                    <div className="popup">
                        <div className="popup-content">
                        <p><strong>Your offer was accepted</strong></p>
                        <p><strong>Proceed to Payment?</strong></p>
                        <div className="popup-buttons">
                            <button className="cancel" onClick={closePopup}>Cancel</button>
                            <button className="pay" onClick={() => handleNavigation("/Pay")}>Payment</button>
                        </div>
                        </div>
                    </div>
                    )}
                </div>
                </section>


            <section id="section4" className="section">
                <div className="content-box2">
                    <h1>Contact Support</h1>
                    <Team />
                </div>
            </section>

        </div>
    );
};

export default Sections;
