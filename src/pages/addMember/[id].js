import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { ToastContainer, toast } from 'react-toastify';
import { authMiddleware } from '../../middleware/auth';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/globals.css'; // Import the global CSS
import { Card, Button, Form, Container, Row, Col } from 'react-bootstrap';

export const getServerSideProps = async (ctx) => {
  const authResult = await authMiddleware(ctx);
  if (authResult.redirect) return authResult;

  return {
    props: { ...authResult.props },
  };
};

const RegisterForm = () => {
  const router = useRouter();
  const { id } = router.query;
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    password: '',
    familyId: id || '',
  });

  const [errors, setErrors] = useState({});
  const [families, setFamilies] = useState([]);

  // Fetch families if needed and commented code is reactivated
  // useEffect(() => {
  //   const fetchFamilies = async () => {
  //     try {
  //       const response = await axios.get('/api/family/list');
  //       setFamilies(response.data.families);
  //       if (response.data.families.length > 0) {
  //         setFormData((prevData) => ({ ...prevData, familyId: response.data.families[0].familyId }));
  //       }
  //     } catch (error) {
  //       console.error('Error fetching families:', error);
  //       toast.error('Error fetching families.');
  //     }
  //   };

  //   fetchFamilies();
  // }, []);

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
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!validatePhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number. Must be 10 digits and start with 6-9.';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
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
      toast.error('Error registering member.');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <ToastContainer />
      <Row className="w-100">
        <Col md={{ span: 6, offset: 3 }}>
          <Card className="shadow-lg">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="title">Register a New Member</h2>
                {/* <Button className="custom-button" onClick={() => router.push('/newfamily')}>Add New Family</Button> */}
              </div>

              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="name" className="mb-3">
                  <Form.Label>Name</Form.Label>
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
                {/* Commented out familyId selection */}
                {/* <Form.Group controlId="familyId" className="mb-3">
                  <Form.Label>Select Family</Form.Label>
                  <Form.Control
                    as="select"
                    name="familyId"
                    value={formData.familyId}
                    onChange={handleChange}
                    isInvalid={!!errors.familyId}
                    required
                  >
                    {families.map(family => (
                      <option key={family.familyId} value={family.familyId}>
                        {family.familyName} - {family.familyId}
                      </option>
                    ))}
                  </Form.Control>
                  <Form.Control.Feedback type="invalid">
                    {errors.familyId}
                  </Form.Control.Feedback>
                </Form.Group> */}
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
