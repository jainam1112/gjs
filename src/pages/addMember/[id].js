import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { ToastContainer, toast } from 'react-toastify';
import { authMiddleware } from "../../middleware/auth"; // Adjust path if needed
import { logoutUser } from "../../middleware/logout"
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/globals.css'; // Import the global CSS
import { Card, Button, Form, Container, Row, Col, Tooltip, OverlayTrigger } from "react-bootstrap";
import Link from 'next/link';
export const getServerSideProps = async (ctx) => {
  const authResult = await authMiddleware(ctx);
  if (authResult.redirect) return authResult;

  return {
    props: { ...authResult.props }, // Pass additional props if needed
  };
};

const RegisterForm = () => {
  const router = useRouter();
  const { familyName, id } = router.query;
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    dateOfBirth: '',
    email:'',
    gender: '',
    password: '',
    familyId: id,
  });

  const [errors, setErrors] = useState({});
  const [families, setFamilies] = useState([]);

  const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^[6-9]\d{9}$/; // Indian phone number validation
    return phoneRegex.test(phoneNumber);
  };
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };


  const generateDummyPhoneNumber = async () => {
    try {
      const response = await axios.get("/api/utils/generatePhoneNumber");
      setFormData({ ...formData, phoneNumber: response.data.dummyPhoneNumber });
    } catch (error) {
      toast.error("Error generating phone number.");
    }
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!validatePhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number. Must be 10 digits and start with 6-9.';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }
    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    if (!validateEmail(formData.email)) {
      newErrors.phoneNumber = 'Invalid email.';
    }
    if (!formData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }
    if (!formData.gender.trim()) {
      newErrors.gender = 'Gender is required';
    }
    if (!formData.familyId) {
      newErrors.familyId = 'Family selection is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      await axios.post('/api/auth/register', formData);
      toast.success('Member registered successfully!');
      router.push(`/family/${formData.familyId}`);
    } catch (error) {
      console.error('Error registering', error);
      toast.error("Error creating family and member. " + error.response.data.message);
    }
  };

  const handleLogout = () => {
    logoutUser(); // Call the logout function to clear cookies
    router.push('/login'); // Redirect to the login page
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <ToastContainer />
      <Row className="w-100">
        <Col md={{ span: 6, offset: 3 }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="logo-image me-2">
          <a href='https://gjs.cyconservices.com' target="_blank" rel="noopener noreferrer">
            <img src="/Gitanjali_Logo-removebg-preview.png" alt="Logo" className="logo-img" />
          </a>
        </div>
            <h2 className="title mb-1 d-none d-md-block">Register a New Member</h2>
            <Link href={"/family/"+id} >
                    <Button variant="primary" className="custom-button ms-5 my-0 px-3">Cancel</Button>
                  </Link>
          </div>
          <h2 className="title mb-1 d-md-none">Register a New Member</h2>
          <div class="card">
            <div class="card-body">
              <strong>Note: </strong>Members residing in Saibaba Nagar and nearby surrounding
              area are only allowed to register as member. Final membership
              decision will be taken by Shri Sangh only.
            </div>
          </div>
          <h4 className="sub-title mt-2 mb-3"><small>{familyName && "Family Name: "+ familyName}</small></h4>
          <Card className="shadow-lg">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="name" className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter name"
                    isInvalid={!!errors.name}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="phoneNumber" className="mb-3">
                  <Form.Label>Phone Number/login Number</Form.Label>
                  <div className="d-flex">
                    <Form.Control
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="Enter primary member phone number"
                      isInvalid={!!errors.phoneNumber}
                      required
                    />
                    <OverlayTrigger
                      placement="right"
                      overlay={<Tooltip>If you don&apos;t have a phone number, use this to create a unique login number.</Tooltip>}
                    >
                      <Button
                        type="button"
                        onClick={generateDummyPhoneNumber}
                        className="custom-secondary-button ms-2 mb-0"
                        
                      >
                        Generate Login Number
                      </Button>
                    </OverlayTrigger>
                  </div>
                  <Form.Control.Feedback type="invalid">
                    {errors.phoneNumber}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="email" className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    isInvalid={!!errors.email}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="dateOfBirth" className="mb-3">
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    isInvalid={!!errors.dateOfBirth}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.dateOfBirth}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="gender" className="mb-3">
                  <Form.Label>Gender</Form.Label>
                  <Form.Control
                    as="select"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    isInvalid={!!errors.gender}
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>

                  </Form.Control>
                  <Form.Control.Feedback type="invalid">
                    {errors.gender}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="password" className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    isInvalid={!!errors.password}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
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

export default RegisterForm;
