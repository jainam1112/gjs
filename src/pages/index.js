import React from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
import Link from 'next/link';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css'; // Custom CSS for additional styles

const Home = () => {
  return (
    <div className="home-container">
      <Container className="mt-5">
        <Row>
          <Col>
            <h1 className="title">Welcome to the Gitanjali Jain Sangh Family Management App</h1>
          </Col>
          <Col className="text-right">
            <Link href="/admin-login" passHref>
              <Button variant="primary" className="custom-button">Admin Login</Button>
            </Link>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col>
            <Link href="/register" passHref>
              <Button variant="primary" className="custom-button mr-2">Register a New Family</Button>
            </Link>
            <Link href="/login" passHref>
              <Button variant="secondary" className="custom-secondary-button">Login to Existing Family</Button>
            </Link>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;
