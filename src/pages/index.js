import React from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
import Link from 'next/link';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css'; // Custom CSS for additional styles

const Home = () => {
  return (
    <div className="home-container">
      {/* Header */}
      

      {/* Main Content */}
      <div className='content-wrapper'>
        {/* Banner Image */}
        <div className="banner-image">
          <picture>
            {/* Mobile Banner */}
            <source media="(max-width: 767px)" srcSet="/banner-mobile.jpg" />
            {/* Default (Desktop) Banner */}
            <source media="(min-width: 768px)" srcSet="/banner-revised.jpg" />
            <img src="/banner-revised.jpg" alt="Banner" className="banner-img img-fluid w-100" />
          </picture>
        </div>

        {/* Info Panel */}
        <header className=" d-flex justify-content-between align-items-center py-1 px-4">
        <div className="logo-image">
          <a href='https://gjs.cyconservices.com' target="_blank" rel="noopener noreferrer">
            <img src="/Gitanjali_Logo-removebg-preview.png" alt="Logo" className="logo-img" />
          </a>
        </div>
        <h1 className="title d-md-block d-none">Welcome to the Gitanjali Jain Sangh Family Management App</h1>
        <div >
          <Link href="/admin-login" passHref>
            <Button variant="primary" className="custom-button me-2 px-3">Admin Login</Button>
          </Link>
        </div>
      </header>
      <h1 className="title d-md-none mx-3">Welcome to the Gitanjali Jain Sangh Family Management App</h1>
        <div className="info-panel ">
          <Container className="d-flex flex-md-column justify-content-center align-items-center text-center">
            <Row>
              <Col>
             



              
                <div className="button-group d-flex flex-column flex-md-row">
                  
                  <Link href="/login" passHref>
                    <Button variant="secondary" className="custom-secondary-button px-3 w-100">Login</Button>
                  </Link>
                  <Link href="/register" passHref>
                    <Button variant="primary" className="custom-button ms-md-2 px-3 w-100">Register</Button>
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
