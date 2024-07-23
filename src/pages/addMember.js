import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css'; // Import the global CSS
import { Card, Button, Form, Container, Row, Col } from 'react-bootstrap';


const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    password: '',
    familyId: '',
  });

  const [families, setFamilies] = useState([]);
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
                <Button className="custom-button" onClick={() => router.push('/newfamily')}>Add New Family</Button>
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
                    required
                  />
                </Form.Group>
                <Form.Group controlId="phoneNumber" className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    required
                  />
                </Form.Group>
                <Form.Group controlId="email" className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
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
                    placeholder="Enter password"
                    required
                  />
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
