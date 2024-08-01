import React from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
import Link from 'next/link';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css'; // Custom CSS for additional styles

const Home = () => {
  return (
    <div className="home-container">
       <header className="header-panel d-flex justify-content-between align-items-center p-3">
       <div className="logo-image">
        <a href='https://gjs.cyconservices.com' target="_blank">
          <img src="/sjs-logo.jpg" alt="Banner" className="logo-img" />
          </a>
        </div>
        <div className="header-actions">
          <Link href="/admin-login" passHref>
            <Button variant="outline-light" className="me-2">Admin Login</Button>
          </Link>
        </div>
      </header>
    <div className='d-flex justify-content-between h-100 my-5' style={{overflow:"hidden"}}>
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
                  <Link href="/register" passHref>
                    <Button variant="primary" className="custom-secondary-button me-2 px-3">Register</Button>
                  </Link>
                  <Link href="/login" passHref>
                    <Button variant="secondary" className="custom-secondary-button px-3">Login</Button>
                  </Link>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Home;
