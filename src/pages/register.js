import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css'; // Custom CSS for additional styles
import { Card, Button, Form, Container, Row, Col } from 'react-bootstrap';

const RegisterFamilyAndMemberForm = () => {
  const [formData, setFormData] = useState({
    familyName: '',
    name: '',
    phoneNumber: '',
    email: '',
    password: ''
  });

  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/registerWithPrimaryMember', formData);
      toast.success('Family and primary member registered successfully!');
      const familyId = response.data.family.familyId;
      router.push(`/family/${familyId}`);
    } catch (error) {
      toast.error('Error creating family and member.');
      console.error('Error creating family and member:', error);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <ToastContainer />
      <Row className="w-100">
        <Col md={{ span: 6, offset: 3 }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="title">Register New Family</h2>
            <Button className="custom-button" onClick={() => router.push('/register')}>Add New Family</Button>
          </div>
          <Card className="shadow-lg">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="familyName" className="mb-3">
                  <Form.Label>Family Name</Form.Label>
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
                  <Form.Label>Primary Member Name</Form.Label>
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
                    required
                  />
                </Form.Group>
                <Form.Group controlId="email" className="mb-3">
                  <Form.Label>Primary Member Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter primary member email"
                    required
                  />
                </Form.Group>
                <Form.Group controlId="password" className="mb-3">
                  <Form.Label>Primary Member Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter primary member password"
                    required
                  />
                </Form.Group>
                <Button type="submit" className="custom-button w-100">Register</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterFamilyAndMemberForm;
