import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  Button,
  Modal,
  Form,
  Pagination,
  Container,
  Row,
  Col,
  Spinner,
  Card
} from "react-bootstrap";
import { useRouter } from 'next/router';
import { authMiddleware } from '../../middleware/auth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/globals.css';
import { FaUnlockAlt, FaLock } from 'react-icons/fa';
import { logoutUser } from "../../middleware/logout"
export const getServerSideProps = async (ctx) => {
  const authResult = await authMiddleware(ctx);
  if (authResult.redirect) return authResult;

  return {
    props: { ...authResult.props },
  };
};

const FamilyMembersList = () => {
  const [family, setFamily] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState({
    _id: '',
    name: '',
    phoneNumber: '',
    email: '',
    dateOfBirth: '',
    gender: ''
  });
  const [errors, setErrors] = useState({});
  const router = useRouter();
  const { id } = router.query;
  const [isSaving, setIsSaving] = useState(false); // Loading state for save button
  useEffect(() => {
    if (id) {
      const fetchFamily = async () => {
        try {
          const response = await axios.get(`/api/member/listByFamilyId/?familyId=${id}`);
          setFamily(response.data.family);
          setFamilyMembers(response.data.members);
        } catch (error) {
          toast.error('Error fetching family members');
          console.error('Error fetching family', error);
        }
      };

      fetchFamily();
    }
  }, [id]);

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
    if (!editMember.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!validatePhoneNumber(editMember.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number. Must be 10 digits and start with 6-9.';
    }
    if (!validateEmail(editMember.email)) {
      newErrors.email = 'Invalid email address.';
    }
    if (!editMember.dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }
    if (!editMember.gender.trim()) {
      newErrors.gender = 'Gender is required';
    }
    if (!editMember.familyId) {
      newErrors.familyId = 'Family selection is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleEditModal = (member) => {
    setEditMember(member);
    setShowModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsSaving(true);
    try {
      editMember['memberId'] = editMember._id;
      const response = await axios.put(`/api/member/edit`, editMember);
      toast.success('Member updated successfully');
      setFamilyMembers((prevMembers) =>
        prevMembers.map((member) => (member._id === editMember._id ? response.data.member : member))
      );
      setShowModal(false);
    } catch (error) {
      toast.error('Error updating member');
      console.error('Error editing member:', error);
    }finally {
      setIsSaving(false);
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditMember((prevEditMember) => ({
      ...prevEditMember,
      [name]: value,
    }));
  };

  const handleFamilyChange = (e) => {
    const { name, value } = e.target;
    setEditMember((prevEditMember) => ({
      ...prevEditMember,
      familyId: value,
    }));
  };
  const handleDelete = async (memberId) => {
    try {
      await axios.patch(`/api/member/remove`, { memberId });
      setFamilyMembers(familyMembers.filter(member => member._id !== memberId));
      toast.success('Member archived successfully');
    } catch (error) {
      toast.error('Error deleting member');
      console.error('Error deleting member:', error);
    }
  };
  const handleClick = () => {
    var familyName = family.familyName
    var familyId = family.familyId
    router.push({
      pathname: '/addMember/' + family.familyId,
      query: {familyName}
    });
  };
  const handleCloseModal = () => {
    setShowModal(false);
  };
  const handleLogout = () => {
    logoutUser(); // Call the logout function to clear cookies
    router.push('/login'); // Redirect to the login page
  };
  return (
    <Container className="mt-5">
      <ToastContainer />
      <div className="d-flex justify-content-between align-items-center mb-3">
      <div className="logo-image me-2">
          <a href='https://gjs.cyconservices.com' target="_blank" rel="noopener noreferrer">
            <img src="/Gitanjali_Logo-removebg-preview.png" alt="Logo" className="logo-img" />
          </a>
        </div>
        <h2 className="title d-md-block d-none">Family Members List</h2>
        <div>
        {family && (<Button onClick={handleClick} className="custom-button">Add New Member</Button>)}
        <Button className="custom-button" onClick={handleLogout}>
              Logout
            </Button>
            </div>
      </div>
      <h2 className="title d-md-none">Family Members List</h2>
      {family && (
        <div className="mb-3">
          <h4>Family (Surname): {family.familyName}</h4>
          <p><strong>Family ID:</strong> {family.familyId}</p>
        </div>
      )}
        <Table striped bordered hover responsive className="custom-table">
        <thead>
          <tr>
            <th>Family ID</th>
            <th>First Name</th>
            <th>Phone Number</th>
            <th>Email</th>
            <th>Date of Birth</th>
            <th>Gender</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {familyMembers.map(member => (
            <tr key={member._id} className={family.primaryMember === member._id ? 'primary' : (member.deleted === true ? 'archived' : '')}>
              <td><strong>{family.familyId}</strong></td>
              <td>{member.name}</td>
              <td>{member.phoneNumber}</td>
              <td>{member.email}</td>
              <td>{new Date(member.dateOfBirth).toLocaleDateString()}</td>
              <td>{member.gender}</td>
              <td>
                <div className="btn-group" role="group">
                  <Button variant="outline-primary" disabled={family.primaryMember === member._id || member.deleted === true} size="sm" onClick={() => handleEditModal(member)}>Edit</Button>
                  {/* <Button variant="outline-danger" disabled={family.primaryMember === member._id} size="sm" onClick={() => handleDelete(member._id)}>Delete</Button> */}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Edit Member Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Member</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleEditSubmit}>
          <Form.Group className="mb-3" controlId="formName">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter name"
              name="name"
              value={editMember.name}
              onChange={handleChange}
              required
              isInvalid={!!errors.name}
              className="custom-input"
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formPhoneNumber">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter phone number"
              name="phoneNumber"
              value={editMember.phoneNumber}
              onChange={handleChange}
              required
              isInvalid={!!errors.phoneNumber}
              className="custom-input"
            />
            <Form.Control.Feedback type="invalid">
              {errors.phoneNumber}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              name="email"
              value={editMember.email}
              onChange={handleChange}
              required
              isInvalid={!!errors.email}
              className="custom-input"
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="dateOfBirth" className="mb-3">
            <Form.Label>Date of Birth</Form.Label>
            <Form.Control
              type="date"
              name="dateOfBirth"
              value={editMember.dateOfBirth ? new Date(editMember.dateOfBirth).toISOString().split('T')[0] : ''}
              onChange={handleChange}
              required
              isInvalid={!!errors.dateOfBirth}
            />
            <Form.Control.Feedback type="invalid">
              {errors.dateOfBirth}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="gender" className="mb-3">
            <Form.Label>Gender</Form.Label>
            <Form.Control
              as="select"
              name="gender"
              value={editMember.gender}
              onChange={handleChange}
              required
              isInvalid={!!errors.gender}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              {errors.gender}
            </Form.Control.Feedback>
          </Form.Group>
          <Button variant="primary" type="submit" className="custom-button" disabled={isSaving}>
            {isSaving ? <Spinner animation="border" size="sm" /> : "Save Changes"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
    </Container>
  );
};

export default FamilyMembersList;
