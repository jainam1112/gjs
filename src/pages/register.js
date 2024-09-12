import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css"; // Custom CSS for additional styles
import { Card, Button, Form, Container, Row, Col } from "react-bootstrap";
import Link from 'next/link';
const RegisterFamilyAndMemberForm = () => {
  const [formData, setFormData] = useState({
    familyName: "",
    name: "",
    phoneNumber: "",
    email: "",
    password: "",
    dateOfBirth: "",
    gender: "",
  });

  const [errors, setErrors] = useState({});
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^[6-9]\d{9}$/; // Indian phone number validation
    return phoneRegex.test(phoneNumber);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!validateEmail(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!validatePhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber =
        "Invalid phone number. It should be a 10-digit Indian phone number starting with 6-9";
    }
    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      const response = await axios.post(
        "/api/auth/registerWithPrimaryMember",
        formData
      );
      toast.success("Family and primary member registered successfully!");
      const familyId = response.data.family.familyId;
      router.push(`/family/${familyId}`);
    } catch (error) {
      toast.error("Error creating family and member. " + error.response.data.message);
      console.error("Error creating family and member:", error);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100 py-3">
      <ToastContainer />
      <Row className="w-100">
        <Col md={{ span: 6, offset: 3 }}>
        
          
          <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="logo-image me-2">
          <a href='https://gjs.cyconservices.com' target="_blank" rel="noopener noreferrer">
            <img src="/Gitanjali_Logo-removebg-preview.png" alt="Logo" className="logo-img" />
          </a>
        </div><h2 className="title d-none d-md-block">Register New Family</h2>
        <div className="d-flex justify-content-flex-end">
        <Link href="/" >
                    <Button variant="primary" className="custom-button ms-5 my-0 px-3">Back</Button>
                  </Link>
                  </div>
          </div>
          <h2 className="title d-md-none">Register New Family</h2>
          <div class="card mb-3">
            <div class="card-body">
            <strong>Note: </strong> Members residing in Saibaba Nagar and nearby surrounding
              area are only allowed to register as member. Final membership
              decision will be taken by Shri Sangh only.
            </div>
          </div>
          <Card className="shadow-lg">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="familyName" className="mb-3">
                  <Form.Label>Family Name (Surname)</Form.Label>
                  <Form.Control
                    type="text"
                    name="familyName"
                    value={formData.familyName}
                    onChange={handleChange}
                    placeholder="Enter family name"
                    required
                  />
                </Form.Group>
                <Form.Group controlId="name" className="mb-3">
                  <Form.Label>Primary Member First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter primary member name"
                    required
                  />
                </Form.Group>
                <Form.Group controlId="phoneNumber" className="mb-3">
                  <Form.Label>Primary Member Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter primary member phone number"
                    isInvalid={!!errors.phoneNumber}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.phoneNumber}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="email" className="mb-3">
                  <Form.Label>Primary Member Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter primary member email"
                    isInvalid={!!errors.email}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="password" className="mb-3">
                  <Form.Label>Primary Member Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    isInvalid={!!errors.password}
                    placeholder="Enter primary member password"
                    required
                  />
                   <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="dateOfBirth" className="mb-3">
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="gender" className="mb-3">
                  <Form.Label>Gender</Form.Label>
                  <Form.Control
                    as="select"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </Form.Control>
                </Form.Group>
                <Button type="submit" className="custom-button w-100">
                  Register
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterFamilyAndMemberForm;
