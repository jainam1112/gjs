import React, { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { setCookie } from 'nookies';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css'; // Custom CSS for additional styles
import { Card, Button, Form, Container, Row, Col } from 'react-bootstrap';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    loginIdentifier: '',
    password: '',
  });
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/login', formData);
      setCookie(null, 'userType', 'member', { path: '/' });
      setCookie(null, 'userId', response.data.userId, { path: '/' });
      toast.success('Login successful');
      const familyId = response.data.familyId;
      router.push('/family/' + familyId); // Adjust this as needed for member redirection
    } catch (error) {
      toast.error('Error logging in');
      console.error('Error logging in', error);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <ToastContainer />
      <Row className="w-100">
        <Col md={{ span: 6, offset: 3 }}>
          <Card className="shadow-lg">
            <Card.Body>
              <Card.Title className="text-center title">Login</Card.Title>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="loginIdentifier" className="mb-3">
                  <Form.Label>Email or Phone</Form.Label>
                  <Form.Control
                    type="text"
                    name="loginIdentifier"
                    value={formData.loginIdentifier}
                    onChange={handleChange}
                    placeholder="Enter your email or phone number"
                    required
                  />
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
                <Button type="submit" className="custom-button w-100">Login</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginForm;
