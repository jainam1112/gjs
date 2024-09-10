import React, { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { setCookie } from 'nookies';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css'; // Import the global CSS
import { Card, Button, Form, Container, Row, Col, Spinner } from 'react-bootstrap';

const AdminLoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsLoading(true); // Set loading state to true before making the request
    try {
      const response = await axios.post('/api/auth/admin-login', formData);
      setCookie(null, 'userType', 'admin', { path: '/' });
      setCookie(null, 'userId', response.data.userId, { path: '/' });
      toast.success('Login successful');
      router.push('/admin/members');
    } catch (error) {
      toast.error('Error: ' + (error.response.data.message ? error.response.data.message : 'Internal error'));
      console.error('Error logging in', error);
    } finally {
      setIsLoading(false); // Set loading state back to false after the request is completed
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <ToastContainer />
      <Row className="w-100">
        <Col md={{ span: 6, offset: 3 }}>
          <Card className="shadow-lg">
            <Card.Body>
              <Card.Title className="text-center title">Admin Login</Card.Title>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="email" className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    name="text"
                    type="text"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your username"
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
                    placeholder="Enter your password"
                    required
                  />
                </Form.Group>
                <Button type="submit" className="custom-button w-100" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Logging in...
                    </>
                  ) : 'Login'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminLoginForm;
