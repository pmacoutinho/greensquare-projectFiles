import React, { useState, useEffect } from 'react';
import Team from '../index/Team';
import './posLoginLandowner.css'; // Adjust the path to your CSS file
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

    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path); // Navigate to the specified path
    };



    const [showOfferPopup, setShowOfferPopup] = useState(false); // State to control offer popup visibility
    const [showAddLandForm, setShowAddLandForm] = useState(false); // State to show/hide form
    const [lands, setLands] = useState([]); // State to store the lands data
    const [isLoading, setIsLoading] = useState(true); // State to manage loading state
    const [error, setError] = useState(null); // State to manage any errors
    // Fetch lands data when the component mounts

    const [offers, setOffers] = useState([]);

    const [showPrompt, setShowPrompt] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null); // State to store the clicked row data
    const [showPopup, setShowPopup] = useState(false); // State to control popup visibility
    const [offerAmount, setOfferAmount] = useState(''); // State to store the offer amount
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    
    
    const handleRowClick = (rowData) => {
        setSelectedRow(rowData); // Set the clicked row data
        setShowPopup(true); // Show the popup
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

    const handleOfferClick = (offer) => {
        setSelectedOffer(offer);
        setShowPrompt(true);
    };

    const handleAccept = () => {
        // Handle the offer acceptance logic here
        console.log(`Offer accepted: ${selectedOffer.buyer} - $${selectedOffer.value}`);
        setShowPrompt(false); // Close the prompt
    };

    const handleDeny = () => {
        // Handle the offer denial logic here
        console.log(`Offer denied: ${selectedOffer.buyer} - $${selectedOffer.value}`);
        setShowPrompt(false); // Close the prompt
    };


    const handleClose = () => {
        setShowPrompt(false); // Close the prompt without accepting or denying
    };
        
    useEffect(() => {
        async function fetchLands() {
            try {
                const response = await fetch('https://veg3j8ucql.execute-api.us-east-1.amazonaws.com/getLands');
                
                //if (!response.ok) {
                //    throw new Error(`Failed to fetch lands: ${response.statusText}`);
                //}
    
                const result = await response.json();
                console.log("Fetched Lands API Response:", result); // Log the API response for debugging
    
                // Handle different possible structures of the response
                if (Array.isArray(result)) {
                    setLands(result); // If the result is an array
                } else if (result && result.lands && Array.isArray(result.lands)) {
                    setLands(result.lands); // If lands are under a 'lands' property
                } else if (result && result.data && Array.isArray(result.data)) {
                    setLands(result.data); // If lands are under a 'data' property
                } else {
                    console.error("Unexpected API response format:", result);
                    setError('Invalid data format');
                }
            } catch (error) {
                //console.error("Error fetching lands:", error);
                //setError(error.message);
            } finally {
                setIsLoading(false); // Set loading to false after the fetch completes
            }
        }
    
        fetchLands();
    }, []); // Empty dependency array ensures this runs only once when the component mounts
    
    
    const closeOfferPopup = () => {
        console.log("Closing popup");
        setShowOfferPopup(false);
    };
    

    const handleAcceptOffer = () => {
        alert(`You accepted the offer from ${selectedOffer.buyer} for Land ID ${selectedOffer.landId} with a proposed value of $${selectedOffer.value}`);
        closeOfferPopup(); // Close the popup after accepting
    };

    const handleDeclineOffer = () => {
        alert(`You declined the offer from ${selectedOffer.buyer} for Land ID ${selectedOffer.landId}`);
        closeOfferPopup(); // Close the popup after declining
    };

    const handleAddLandClick = () => {
        setShowAddLandForm(true); // Show the form when 'Add Land' button is clicked
    };

    const handleFormClose = () => {
        setShowAddLandForm(false); // Hide the form when 'Close' is clicked
    };

    const closePopup = () => {
        setShowPopup(false); // Hide the popup
    };
   
    

    useEffect(() => {
        async function fetchOffers() {
            try {
                const response = await fetch('https://veg3j8ucql.execute-api.us-east-1.amazonaws.com/getOffers');
    
                //if (!response.ok) {
                //    throw new Error(`Failed to fetch offers: ${response.statusText}`);
                //}
    
                const result = await response.json();
                console.log("Fetched Offers API Response:", result); // Log the API response for debugging
    
                // Handle different possible structures of the response
                if (Array.isArray(result)) {
                    setOffers(result); // If the result is an array
                } else if (result && result.offers && Array.isArray(result.offers)) {
                    setOffers(result.offers); // If offers are under an 'offers' property
                } else if (result && result.data && Array.isArray(result.data)) {
                    setOffers(result.data); // If offers are under a 'data' property
                } else {
                    //console.error("Unexpected API response format:", result);
                    //setError('Invalid data format');
                }
            } catch (error) {
                console.error("Error fetching offers:", error);
                setError(error.message);
            } finally {
                setIsLoading(false); // Set loading to false after the fetch completes
            }
        }
    
        fetchOffers();
    }, []); // Empty dependency array ensures this runs only once when the component mounts
    
    async function handleSubmit(event) {
        event.preventDefault(); // Prevent the default form behavior
    
        // Extract form values
        const land = {
            id: event.target.landId.value, // Matches the 'name' attribute in the input fields
            landowner_id: 2,
            size: parseFloat(event.target.size.value),
            location: event.target.location.value,
            carbon_credits: parseInt(event.target.credits.value, 10),
            base_value: parseFloat(event.target.value.value),
        };
    
        console.log(land.id);
        console.log(land.landowner_id);
        console.log(land.size);
        console.log(land.location);
        console.log(land.carbon_credits);
        console.log(land.base_value);
    
        try {
            const response = await fetch("https://m5yzmb5e48.execute-api.us-east-1.amazonaws.com/addLands", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "http://localhost:3000/PosLoginLandowner",  // Allow requests from any origin
                    "Access-Control-Allow-Methods":'POST, GET, OPTIONS, PUT, DELETE',  // Allow POST method
                    "Access-Control-Allow-Headers": 'Content-Type, Authorization, X-Requested-With', // Allow content type header
                    'Access-Control-Allow-Credentials' : 'true'
                },
                body: JSON.stringify(land), // Send form data as JSON
            });
    
            const result = await response.json();
    
            if (response.ok) {
                alert(result.message || "Land added successfully!");
                setLands((prevLands) => [...prevLands, land]); // Update the state to include the new land
                handleFormClose(); // Close the form after submission
            } else {
                alert(`Error: ${result.message || "Failed to add land."}`);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("An unexpected error occurred while adding the land.");
        }
    }
        const [rows, setRows] = useState([
          {
            id: 1,
            size: 5000,
            location: 'Porto',
            credits: 1000,
            value: 2000,
            listed: 'No',
          },
        ]);
      
        const toggleListed = (id) => {
            setRows((prevRows) =>
              prevRows.map((row) =>
                row.id === id ? { ...row, listed: !row.listed } : row
              )
            );
          };
         
    

    return (
        <div>
        <section id="section1" className="section">
            <div className="content-box2">
                <h1>My Lands</h1>
                <Button onClick={() => handleNavigation("/AddLand")} className="button-add-land">Add Land</Button>
                    
                    <Table aria-label="My Credits Table">
                        <TableHeader>
                            <TableColumn>Land ID</TableColumn>
                            <TableColumn>Size (m²)</TableColumn>
                            <TableColumn>Location</TableColumn>
                            <TableColumn>Carbon Credits</TableColumn>
                            <TableColumn>Land Value (€)</TableColumn>
                            <TableColumn>Listed on Marketplace</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {rows.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>{row.id}</TableCell>
                                <TableCell>{row.size}</TableCell>
                                <TableCell>{row.location}</TableCell>
                                <TableCell>{row.credits}</TableCell>
                                <TableCell>{row.value}</TableCell>
                                <TableCell>
                                <label className="switch">
                                    <input
                                    type="checkbox"
                                    checked={row.listed}
                                    onChange={() => toggleListed(row.id)}
                                    />
                                    <span className="slider"></span>
                                </label>
                                </TableCell>
                            </TableRow>
                            ))}
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
                            <TableColumn>Company_name</TableColumn>
                            <TableColumn>Carbon Credits</TableColumn>
                            <TableColumn>Base Value(€)</TableColumn>
                            <TableColumn>Offered Value(€)</TableColumn>

                        </TableHeader>
                        <TableBody>
                            {[
                                { id: 1, Company_name:'GreenCircle', credits: 1000, value: 2000, offered_value: 2000 },
                            ].map((row) => (
                                <TableRow key={row.id} onClick={() => handleRowClick(row)}>
                                    <TableCell>{row.id}</TableCell>
                                    <TableCell>{row.Company_name}</TableCell>
                                    <TableCell>{row.credits}</TableCell>
                                    <TableCell>{row.value}</TableCell>
                                    <TableCell>{row.offered_value}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {showPopup && selectedRow && (
                            <div className="popup">
                                <div className="popup-content">
                                    <h2>Row Details</h2>
                                    <p><strong>Land ID:</strong> {selectedRow.id}</p>
                                    <p><strong>Company_name</strong> {selectedRow.Company_name}</p>
                                    <p><strong>Carbon Credits:</strong> {selectedRow.credits}</p>
                                    <p><strong>Base Value(€):</strong> {selectedRow.value}</p>
                                    <p><strong>Offered Value(€):</strong> {selectedRow.offered_value}</p>

                                    <div className="popup-buttons">
                                        <button onClick={closePopup} className="close-button2">Close</button>
                                        <button className="accept-button2">Accept Offer</button>
                                        <button className="reject-button2">Reject Offer</button>
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
