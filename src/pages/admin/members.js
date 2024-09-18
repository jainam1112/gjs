import React, { useState, useEffect } from "react";
import axios from "axios";
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
import { adminMiddleware } from "../../middleware/auth";
import { useRouter } from 'next/router';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/globals.css";
import { logoutUser } from "../../middleware/logout";
import { FaUnlockAlt, FaLock } from 'react-icons/fa';
import Link from 'next/link';
export const getServerSideProps = async (ctx) => {
  const authResult = await adminMiddleware(ctx);
  if (authResult.redirect) return authResult;

  return {
    props: { ...authResult.props },
  };
};

const MembersPage = () => {
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [families, setFamilies] = useState([]);
  const [editMember, setEditMember] = useState({
    _id: "",
    name: "",
    phoneNumber: "",
    email: "",
    dateOfBirth: '',
    gender: '',
    family: "",
    familyId: "",
    familyName: "",
    password: "",
    deleted: false,
  });
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [membersPerPage] = useState(10);
  const [totalMembers,setTotalMembers] = useState(10);
  const [totalFamilies,setTotalFamilies] = useState(1);
  const [isPasswordUnlocked, setIsPasswordUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // General loading state
  const [isExporting, setIsExporting] = useState(false); // Loading state for export
  const [isSaving, setIsSaving] = useState(false); // Loading state for save button
  const [loadingAction, setLoadingAction] = useState({}); // Individual loading state for delete and edit actions
 
  useEffect(() => {
    fetchMembers();
    fetchFamilies();
  }, [showDeleted, sortBy, currentPage]);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      let endpoint = `/api/member/list?page=${currentPage}&limit=${membersPerPage}`;
      if (searchQuery) {
        endpoint += `&q=${searchQuery}`;
      }
      if (sortBy) {
        endpoint += `&sortBy=${sortBy}`;
      }
      if (showDeleted) {
        endpoint += `&deleted=true`;
      }

      const response = await axios.get(endpoint);
      const membersData = response.data.members.map((member) => ({
        ...member,
        familyId: member.family.familyId,
        familyName: member.family.familyName,
      }));
      setMembers(membersData);
      setTotalMembers(response.data.totalMembers)
      setTotalFamilies(response.data.totalFamilies)
    } catch (error) {
      toast.error("Error fetching members.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFamilies = async () => {
    try {
      const response = await axios.get("/api/family/list");
      setFamilies(response.data.families);
      if (response.data.families.length > 0) {
        setEditMember((prevEditMember) => ({
          ...prevEditMember,
          familyId: response.data.families[0].familyId,
        }));
      }
    } catch (error) {
      toast.error("Error fetching families.");
    }
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
      const updatedMember = { ...editMember };
      if (!isPasswordUnlocked) {
        delete updatedMember.password;
      }
      updatedMember["memberId"] = editMember._id;
      await axios.put(`/api/member/edit`, updatedMember);
      toast.success("Member updated successfully");
      fetchMembers();
      setShowModal(false);
    } catch (error) {
      toast.error("Error updating member");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (memberId, member) => {
    setLoadingAction({ ...loadingAction, [memberId]: true }); // Set delete loading state
    try {
      await axios.patch(`/api/member/remove`, { memberId });
      toast.success("Member archived successfully.");
      fetchMembers();
    } catch (error) {
      toast.error("Error deleting member.");
    } finally {
      setLoadingAction({ ...loadingAction, [memberId]: false }); // Reset delete loading state
    }
  };

  const handleRestore = async (memberId) => {
    setLoadingAction({ ...loadingAction, [memberId]: true }); // Set restore loading state
    try {
      await axios.patch(`/api/member/restore`, { memberId });
      toast.success("Member restored successfully.");
      fetchMembers();
    } catch (error) {
      toast.error("Error restoring member.");
    } finally {
      setLoadingAction({ ...loadingAction, [memberId]: false }); // Reset restore loading state
    }
  };

  const handlePermanentDelete = async (memberId) => {
    setLoadingAction({ ...loadingAction, [memberId]: true }); // Set delete loading state
    try {
      await axios.delete(`/api/member/delete`, { data: { memberId } }); // Send DELETE request with memberId
      toast.success("Member permanently deleted successfully.");
      fetchMembers(); // Fetch updated list after deletion
    } catch (error) {
      toast.error("Error permanently deleting member.");
    } finally {
      setLoadingAction({ ...loadingAction, [memberId]: false }); // Reset delete loading state
    }
  };
  

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

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await axios.get(
        `/api/member/export${showDeleted ? "/deleted" : ""}`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "members.csv");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      toast.error("Error exporting members.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
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


  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = () => {
    fetchMembers();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSortChange = (field) => {
    const newSortBy = sortBy === field ? `-${field}` : field;
    setSortBy(newSortBy);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleUnlockPassword = () => {
    setIsPasswordUnlocked(!isPasswordUnlocked);
  };

  const handleLogout = () => {
    logoutUser();
    router.push('/admin-login');
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '';
    const dob = new Date(dateOfBirth);
    const ageDiff = Date.now() - dob.getTime();
    const ageDate = new Date(ageDiff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const totalPages = Math.ceil(totalMembers / membersPerPage);
  return (
    <Container className="mt-5">
      <ToastContainer />
      <Row className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
      <div className="logo-image me-2">
          <a href='https://gjs.cyconservices.com' target="_blank" rel="noopener noreferrer">
            <img src="/Gitanjali_Logo-removebg-preview.png" alt="Logo" className="logo-img" />
          </a>
        </div>
        <h2 className="title text-center d-none d-md-block">Members List</h2>
        <Button className="custom-button mb-0" onClick={handleLogout}>
              Logout
            </Button>
        </div>
        <h2 className="title text-center d-md-none">Members List</h2>
        <Col md={12} className="">
  <Card className="shadow-lg">
    <Card.Body>
      <Row className="d-flex justify-content-between align-items-center">
        <Col xs={12} md={6} className="mb-3 mb-md-0">
          <div className="d-flex flex-wrap">
            <Button href="addMember" className="custom-button me-2 mb-2 mb-md-0">
              Add Member
            </Button>
            <Link href={{ pathname: '/register', query: { returnback: '/admin/members' } }} passHref>
  <Button className="custom-button me-2 mb-2 mb-md-0">
    Add Family
  </Button>
</Link>
            <Button onClick={handleExport} className="custom-button me-2 mb-2 mb-md-0">
              {isExporting ? <Spinner animation="border" size="sm" /> : "Export Members"}
            </Button>
            <Button
              variant={showDeleted ? "danger" : "outline-danger"}
              onClick={() => {
                setShowDeleted(!showDeleted);
                setCurrentPage(1);
              }}
              className="mb-2 mb-md-0"
            >
              {showDeleted ? "Hide Deleted" : "Show Deleted"}
            </Button>
          </div>
        </Col>

        <Col xs={12} md={6} className="d-flex justify-content-end">
          <div className="d-flex align-items-center w-100 flex-md-nowrap">
            <Form.Control
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress} // Trigger search on Enter
              className="me-2 custom-input w-100 mb-md-0"
              style={{ maxWidth: "300px" }}
            />
            <Button onClick={handleSearch} className="custom-button w-100 w-md-auto mb-0">
              Search
            </Button>
          </div>
        </Col>
      </Row>
      <Row className="d-flex justify-content-between align-items-center">
        <Col xs={12} md={12} className="mt-3">
        <div className="d-flex ">
          <h4 className="sub-title mb-0">Total Families: {totalFamilies } <span className="d-md-inline-flex d-none">|</span> <span className="text-nowrap">Total Members: {totalMembers }</span></h4> 
          
        </div>
        </Col>
        </Row>
    </Card.Body>
  </Card>
</Col>

      </Row>
   

      <Table striped bordered hover responsive className="custom-table">
  <thead>
    <tr>
      <th onClick={() => handleSortChange('name')} style={{ cursor: 'pointer' }}>
        First Name {sortBy === 'name' ? '▲' : sortBy === '-name' ? '▼' : ''}
      </th>
      <th onClick={() => handleSortChange('phoneNumber')} style={{ cursor: 'pointer' }}>
        Phone Number {sortBy === 'phoneNumber' ? '▲' : sortBy === '-phoneNumber' ? '▼' : ''}
      </th>
      <th onClick={() => handleSortChange('email')} style={{ cursor: 'pointer' }}>
        Email {sortBy === 'email' ? '▲' : sortBy === '-email' ? '▼' : ''}
      </th>
      <th>Date of Birth</th>
      <th>Age</th> {/* New Age column */}
      <th>Gender</th>
      <th>Family ID</th>
      <th onClick={() => handleSortChange('familyName')} style={{ cursor: 'pointer' }}>
        Family Name {sortBy === 'familyName' ? '▲' : sortBy === '-familyName' ? '▼' : ''}
      </th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {isLoading ? (
      <tr>
        <td colSpan="9" className="text-center">
          <Spinner animation="border" />
        </td>
      </tr>
    ) : members.length ? (
      members.map((member) => (
        <tr key={member._id}>
          <td>{member.name}</td>
          <td>{member.phoneNumber}</td>
          <td>{member.email}</td>
          <td>{member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString('en-GB') : ''}</td>
          <td>{calculateAge(member.dateOfBirth)}</td> {/* Display calculated age */}
          <td>{member.gender}</td>
          <td>{member.familyId}</td>
          <td>{member.familyName}</td>
          <td className="text-center">
            {!showDeleted ? (
              <Button
                variant="warning"
                className="mb-2"
                onClick={() => handleEditModal(member)}
                disabled={loadingAction[member._id]}
              >
                {loadingAction[member._id] ? <Spinner animation="border" size="sm" /> : 'Edit'}
              </Button>
            ) : (
              <Button
                variant="warning"
                onClick={() => handleRestore(member._id)}
                className="mb-2"
                disabled={loadingAction[member._id]}
              >
                {loadingAction[member._id] ? <Spinner animation="border" size="sm" /> : 'Restore'}
              </Button>
            )}
            {!showDeleted ? (
              <Button
                variant="danger"
                onClick={() => handleDelete(member._id)}
                className="ms-2 mb-2"
                disabled={loadingAction[member._id]}
              >
                {loadingAction[member._id] ? <Spinner animation="border" size="sm" /> : 'Archive'}
              </Button>
            ) : (
              <Button
                variant="danger"
                onClick={() => handlePermanentDelete(member._id)}
                className="ms-2 mb-2"
                disabled={loadingAction[member._id]}
              >
                {loadingAction[member._id] ? <Spinner animation="border" size="sm" /> : 'Permanent Delete'}
              </Button>
            )}
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="9" className="text-center">
          No members found
        </td>
      </tr>
    )}
  </tbody>
</Table>

<Pagination className="justify-content-center mt-4 custom-pagination">
  {/* Go to first page */}
  <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
  
  {/* Go to previous page */}
  <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />

  {/* Display the current page out of total pages */}
  <span className="mx-3 align-self-center">
    Page {currentPage} of {totalPages}
  </span>

  {/* Dropdown to select a specific page */}
  <Form.Select
    value={currentPage}
    onChange={(e) => handlePageChange(Number(e.target.value))}
    style={{ width: 'auto', display: 'inline-block' }}
    className="me-3"
  >
    {Array.from({ length: totalPages }, (_, index) => (
      <option key={index + 1} value={index + 1}>
        {index + 1}
      </option>
    ))}
  </Form.Select>

  {/* Go to next page */}
  <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />

  {/* Go to last page */}
  <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
</Pagination>

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
          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <div className="d-flex align-items-center">
              <Form.Control
                type="password"
                placeholder="Enter new password (leave empty to keep current)"
                name="password"
                value={editMember.password}
                onChange={handleChange}
                className="custom-input me-2"
                disabled={!isPasswordUnlocked} // Disable input based on state
                isInvalid={!!errors.password}
              />
              <Button
                variant={isPasswordUnlocked ? "success" : "outline-secondary"}
                onClick={handleUnlockPassword}
              >
                {isPasswordUnlocked ? <FaLock /> : <FaUnlockAlt />}
              </Button>
            </div>
            <Form.Control.Feedback type="invalid">
              {errors.password}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formFamily">
            <Form.Label>Family</Form.Label>
            <Form.Control
              as="select"
              name="familyId"
              value={editMember.familyId}
              onChange={handleFamilyChange}
              required
              isInvalid={!!errors.familyId}
              className="custom-select"
            >
              {families.map((family) => (
                <option key={family.familyId} value={family.familyId}>
                  {family.familyName} - {family.familyId}
                </option>
              ))}
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              {errors.familyId}
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

export default MembersPage;

