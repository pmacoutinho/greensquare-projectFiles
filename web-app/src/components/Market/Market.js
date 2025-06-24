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

const Market = () => {
    const [selectedRow, setSelectedRow] = useState(null); // State to store the clicked row data
    const [showPopup, setShowPopup] = useState(false); // State to control popup visibility
    const [offerAmount, setOfferAmount] = useState(''); // State to store the offer amount
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    
    
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
            <section id="section2" className="section">

                <div className="content-box2">
                    <h1>Marketplace</h1>
                    <p>Select a table row.</p>
                        {/* New Table */}
                        <Table aria-label="Marketplace Land Table" className="table-marketplace">
                            <TableHeader>
                                <TableColumn>Land ID</TableColumn>
                                <TableColumn>Size(m²)</TableColumn>
                                <TableColumn>Location</TableColumn>
                                <TableColumn>Carbon Credits</TableColumn>
                                <TableColumn>Base Value(€)</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {[
                                    { id: 1, size: 5000, location: 'Porto', credits: 1000, value: 2000 },
                                    { id: 2, size: 3000, location: 'Lisboa', credits: 800, value: 1500 },
                                    { id: 3, size: 4500, location: 'Alentejo', credits: 1200, value: 2200 }
                                ].map((row) => (
                                    <TableRow key={row.id} onClick={() => handleRowClick(row)}>
                                        <TableCell>{row.id}</TableCell>
                                        <TableCell>{row.size}</TableCell>
                                        <TableCell>{row.location}</TableCell>
                                        <TableCell>{row.credits}</TableCell>
                                        <TableCell>{row.value}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Popup */}
                        {showPopup && selectedRow && (
                            <div className="popup">
                                <div className="popup-content">
                                    <h2>Row Details</h2>
                                    <p><strong>Land ID:</strong> {selectedRow.id}</p>
                                    <p><strong>Size(m²):</strong> {selectedRow.size}</p>
                                    <p><strong>Location:</strong> {selectedRow.location}</p>
                                    <p><strong>Carbon Credits:</strong> {selectedRow.credits}</p>
                                    <p><strong>Base Value(€):</strong> {selectedRow.value}</p>

                                    <div>
                                        <label htmlFor="offerAmount">Offer Amount:</label>
                                        <input
                                            type="number"
                                            id="offerAmount"
                                            value={offerAmount}
                                            onChange={(e) => setOfferAmount(e.target.value)}
                                            placeholder="Enter offer amount"
                                        />
                                    </div>

                                    <div className="popup-buttons">
                                        <button onClick={closePopup}>Close</button>
                                        <button onClick={handleMakeOffer} primary>Make Offer</button>
                                    </div>
                                </div>  
                            </div>
                        )}
                    </div>
            </section>            
        </div>
    );
};

export default Market;
