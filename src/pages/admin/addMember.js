import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Card, Button, Form, Container, Row, Col } from 'react-bootstrap';
import '../../styles/globals.css';
import { logoutUser } from "../../middleware/logout"
// Server-side authentication middleware (assuming it's defined elsewhere)
import { adminMiddleware } from "../../middleware/auth";
import Link from 'next/link';
export const getServerSideProps = async (ctx) => {
  const authResult = await adminMiddleware(ctx);
  if (authResult.redirect) return authResult;

  return {
    props: { ...authResult.props },
  };
};

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    password: '',    
    dateOfBirth: '',
    gender: '',
    familyId: '',
  });

  const [families, setFamilies] = useState([]);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        const response = await axios.get('/api/family/list');
        setFamilies(response.data.families);
        if (response.data.families.length > 0) {
          setFormData((prevData) => ({ ...prevData, familyId: response.data.families[0].familyId }));
        }
      } catch (error) {
        console.error('Error fetching families:', error);
        toast.error('Error fetching families.');
      }
    };

    fetchFamilies();
  }, []);

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
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!validatePhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number. Must be 10 digits and start with 6-9.';
    }
    if (!validateEmail(formData.email)) {
      newErrors.phoneNumber = 'Invalid email.';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }
    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 8 characters long';
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
  const handleLogout = () => {
    logoutUser(); // Call the logout function to clear cookies
    router.push('/admin-login'); // Redirect to the login page
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      await axios.post('/api/auth/register', formData);
      toast.success('Member registered successfully!');
      router.push(`/admin/members`);
    } catch (error) {
      console.error('Error registering', error);
      toast.error("Error creating family and member. " + error.response.data.message);
    }
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
            <h2 className="title mb-1">Register a New Member</h2>
            <Link href="/admin/members" >
                    <Button variant="primary" className="custom-button ms-5 my-0 px-3">Cancel</Button>
                  </Link>
          </div>
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
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    isInvalid={!!errors.phoneNumber}
                    required
                  />
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
                <Form.Group controlId="familyId" className="mb-3">
                  <Form.Label>Select Family</Form.Label>
                  <Form.Control
                    as="select"
                    name="familyId"
                    value={formData.familyId}
                    onChange={handleChange}
                    required
                  >
                    {families.map(family => (
                      <option key={family.familyId} value={family.familyId}>
                        {family.familyName} - {family.familyId}
                      </option>
                    ))}
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

export default RegisterForm;
