import React, { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { setCookie } from 'nookies';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css'; // Custom CSS for additional styles
import { Card, Button, Form, Container, Row, Col, Spinner, Modal } from 'react-bootstrap';
import Link from 'next/link';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phoneNumber);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!validatePhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number';
    }
    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsLoading(true); 
    try {
      const response = await axios.post('/api/auth/login', formData);
      setCookie(null, 'userType', 'member', { path: '/' });
      setCookie(null, 'userId', response.data.userId, { path: '/' });
      toast.success('Login successful');
      const familyId = response.data.familyId;
      router.push('/family/' + familyId);
    } catch (error) {
      toast.error('Error: ' + (error.response?.data?.message || 'Login failed'));
      console.error('Error logging in', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
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
        </div><h2 className="title">Login</h2>
        <div className="d-flex justify-content-flex-end">
        <Link href="/" >
                    <Button variant="primary" className="custom-button ms-5 my-0 px-3">Back</Button>
                  </Link>
                  </div>
          </div>

          <Card className="shadow-lg">
            <Card.Body>
            
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="phoneNumber" className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    isInvalid={!!errors.phoneNumber}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.phoneNumber}
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
                    isInvalid={!!errors.password}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="d-flex justify-content-between align-items-center">
                  {/* Forgot Password Link */}
                  <Button variant="link" onClick={handleForgotPassword} className="p-0">
                    Forgot Password?
                  </Button>

                  {/* Register CTA */}
                  <Link href="/register" passHref>
                    <Button variant="link" className="p-0">
                      Don't have an account? Register
                    </Button>
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="custom-button w-100 mt-3"
                  disabled={isLoading}
                >
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
                  ) : (
                    'Login'
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Forgot Password Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Forgot Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Please contact the administrator at <a href="mailto:sgjsb1978@gmail.com">sgjsb1978@gmail.com</a> to reset your password.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default LoginForm;
