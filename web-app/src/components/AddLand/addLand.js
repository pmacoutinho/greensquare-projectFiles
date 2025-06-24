import React, { useState } from 'react';
import { Button, Input, Checkbox,  Form } from "@nextui-org/react";
import "./add.css";
import { useNavigate } from "react-router-dom";


const LandFormPage = () => {


    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path); // Navigate to the specified path
    };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    carbonCredits: '',
    carbonValue: '',
    Latitude: '',
    Longitude: '',
    Biome: '',
    AverageHumidity: '',
    AverageTemperature: '',
    ElevationMeters: '',
    ForestDensity: '',
    TreeSpecies: '',
    SoilType: '',
    certificationDate: '',
    CertificationAuthority: ''
  });
  
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Perform validation
    const newErrors = validateForm(formData);
    if (Object.keys(newErrors).length === 0) {
      setSubmitted(formData);
      setErrors({});
    } else {
      setErrors(newErrors);
    }
  };

  const validateForm = (data) => {
    const newErrors = {};
    if (!data.name) newErrors.name = 'Please enter your Land ID number';
    if (!data.email) newErrors.email = 'Please enter your email';
    if (!data.password) newErrors.password = 'Please enter your password';
    if (!data.carbonCredits) newErrors.carbonCredits = 'Please enter the carbon credits';
    // Add more validations here as needed
    return newErrors;
  };

  return (
    <div className="land-form-container">
      <h1>Add Land to your portfolio</h1>
      <Form onSubmit={handleSubmit}>

        <div className="form-group">
          <Input
            name="carbonValue"
            value={formData.carbonValue}
            onChange={handleChange}
            placeholder="Enter your value for the carbon credits(€)"
            type="number"
          />
        </div>

        <div className="form-group">
          <Input
            name="Latitude"
            value={formData.Latitude}
            onChange={handleChange}
            placeholder="Enter Latitude"
            type="text"
          />
        </div>

        <div className="form-group">
          <Input
            name="Longitude"
            value={formData.Longitude}
            onChange={handleChange}
            placeholder="Enter Longitude"
            type="text"
          />
        </div>

        <div className="form-group">
          <Input
            name="Biome"
            value={formData.Biome}
            onChange={handleChange}
            placeholder="Enter Biome"
            type="text"
          />
        </div>

        <div className="form-group">
          <Input
            name="AverageHumidity"
            value={formData.AverageHumidity}
            onChange={handleChange}
            placeholder="Enter Average Humidity"
            type="number"
          />
        </div>

        <div className="form-group">
          <Input
            name="AverageTemperature"
            value={formData.AverageTemperature}
            onChange={handleChange}
            placeholder="Enter Average Temperature"
            type="number"
          />
        </div>

        <div className="form-group">
          <Input
            name="ElevationMeters"
            value={formData.ElevationMeters}
            onChange={handleChange}
            placeholder="Enter Elevation Meters"
            type="number"
          />
        </div>

        <div className="form-group">
          <Input
            name="ForestDensity"
            value={formData.ForestDensity}
            onChange={handleChange}
            placeholder="Enter Forest Density(%)"
            type="number"
          />
        </div>

        <div className="form-group">
          <Input
            name="TreeSpecies"
            value={formData.TreeSpecies}
            onChange={handleChange}
            placeholder="Enter Tree Species"
            type="text"
          />
        </div>

        <div className="form-group">
          <Input
            name="SoilType"
            value={formData.SoilType}
            onChange={handleChange}
            placeholder="Enter Soil Type"
            type="text"
          />
        </div>

        <div className="form-group">
          <Input
            name="certificationDate"
            value={formData.certificationDate}
            onChange={handleChange}
            placeholder="Enter Certification Date"
            type="date"
          />
        </div>

        <div className="form-group">
          <Input
            name="CertificationAuthority"
            value={formData.CertificationAuthority}
            onChange={handleChange}
            placeholder="Enter Certification Authority"
            type="text"
          />
        </div>


        <div className="form-actions">
          <Button type="submit"onClick={() => handleNavigation("/PosLoginLandowner")}>Submit</Button>
          <Button type="reset" onClick={() => setFormData({})}>Reset</Button>
        </div>
      </Form>

      {submitted && (
        <div className="submitted-data">
          <h3>Submitted Data:</h3>
          <pre>{JSON.stringify(submitted, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default LandFormPage;
