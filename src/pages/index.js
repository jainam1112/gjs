import React from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
import Link from 'next/link';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css'; // Custom CSS for additional styles

const Home = () => {
  return (
    <div className="home-container">
      <div className="content-wrapper">
        <div className="banner-image">
          <img src="/banner.jpg" alt="Banner" className="banner-img" />
        </div>
        <div className="info-panel">
          <Container className="d-flex flex-column justify-content-center align-items-center">
            <Row>
              <Col className="text-center">
                <h1 className="title">Welcome to the Gitanjali Jain Sangh Family Management App</h1>
                <div className="button-group">
                  <Link href="/admin-login" passHref>
                    <Button variant="primary" className="custom-button">Admin Login</Button>
                  </Link>
                  <Link href="/register" passHref>
                    <Button variant="primary" className="custom-button me-2">Register a New Family</Button>
                  </Link>
                  <Link href="/login" passHref>
                    <Button variant="secondary" className="custom-secondary-button">Login to Existing Family</Button>
                  </Link>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default Home;
