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
} from "react-bootstrap";
import { adminMiddleware } from "../../middleware/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/globals.css";
import { logoutUser } from "../../middleware/logout";
import { FaUnlockAlt, FaLock } from 'react-icons/fa'; // Import icons for unlock and lock

export const getServerSideProps = async (ctx) => {
  const authResult = await adminMiddleware(ctx);
  if (authResult.redirect) return authResult;

  return {
    props: { ...authResult.props },
  };
};

const MembersPage = () => {
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
  const [showModal, setShowModal] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [membersPerPage] = useState(10);
  const [isPasswordUnlocked, setIsPasswordUnlocked] = useState(false); // State to manage password input unlock

  useEffect(() => {
    fetchMembers();
    fetchFamilies();
  }, [showDeleted, sortBy, currentPage]);

  const fetchMembers = async () => {
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
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error("Error fetching members.");
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
      console.error("Error fetching families:", error);
      toast.error("Error fetching families.");
    }
  };

  const handleEditModal = (member) => {
    setEditMember(member);
    setShowModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedMember = { ...editMember };
      if (!isPasswordUnlocked) {
        delete updatedMember.password; // Remove password if not unlocked
      }
      updatedMember["memberId"] = editMember._id;
      const response = await axios.put(`/api/member/edit`, updatedMember);
      toast.success("Member updated successfully");
      fetchMembers();
      setShowModal(false);
    } catch (error) {
      toast.error("Error updating member");
      console.error("Error editing member:", error);
    }
  };

  const handleDelete = async (memberId, member) => {
    if (
      member.family.primaryMember === memberId &&
      member.family.members.count !== 1
    ) {
      toast.error(
        "Unable to delete primary User with family members registered in it."
      );
    } else {
      try {
        await axios.patch(`/api/member/remove`, { memberId });
        fetchMembers();
      } catch (error) {
        console.error("Error deleting member:", error);
        toast.error("Error deleting member.");
      }
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(
        `/api/member/export${showDeleted ? "/deleted" : ""}`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "members.csv");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error exporting members:", error);
      toast.error("Error exporting members.");
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

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = () => {
    fetchMembers();
  };

  const handleSortChange = (field) => {
    const newSortBy = sortBy === field ? `-${field}` : field; // Toggle sorting order
    setSortBy(newSortBy);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleUnlockPassword = () => {
    setIsPasswordUnlocked(!isPasswordUnlocked);
  };

  const handleLogout = () => {
    logoutUser(); // Call the logout function to clear cookies
    router.push('/admin-login'); // Redirect to the login page
  };

  return (
    <Container className="mt-5">
      <ToastContainer />
      <Row className="mb-4">
        <h2 className="title text-center">Member List</h2>
        <Col
          md={12}
          className="d-flex justify-content-between align-items-center"
        >
          <div>
            <Button href="addMember" className="custom-button me-2 mb-0">
              Add Member
            </Button>
            <Button onClick={handleExport} className="custom-button me-2 mb-0">
              Export Members
            </Button>
            <Button
              variant={showDeleted ? "danger" : "outline-danger"}
              onClick={() => setShowDeleted(!showDeleted)}
            >
              {showDeleted ? "Hide Deleted" : "Show Deleted"}
            </Button>
          </div>
          <div className="d-flex align-items-center">
            <Form.Control
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="me-2 custom-input mb-0"
              style={{ maxWidth: "300px" }}
            />
            <Button onClick={handleSearch} className="custom-button mb-0">
              Search
            </Button>
            <Button className="custom-button mb-0" onClick={handleLogout}>
              Logout
            </Button>
          </div>
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
            <th>Gender</th>
            <th >
              Family ID
            </th>
            <th onClick={() => handleSortChange('familyName')} style={{ cursor: 'pointer' }}>
              Family Name {sortBy === 'familyName' ? '▲' : sortBy === '-familyName' ? '▼' : ''}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.length ? (
            members.map((member) => (
              <tr key={member._id}>
                <td>{member.name}</td>
                <td>{member.phoneNumber}</td>
                <td>{member.email}</td>
                <td>{new Date(member.dateOfBirth).toLocaleDateString()}</td>
                <td>{member.gender}</td>
                <td>{member.familyId}</td>
                <td>{member.family.familyName}</td>
                <td>
                  <Button
                    variant="info"
                    onClick={() => handleEditModal(member)}
                    className="me-2 custom-button"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(member._id, member)}
                    className="custom-button"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">
                No members found
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Pagination */}
      <Pagination className="justify-content-center mt-4 custom-pagination">
        <Pagination.Prev
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        />
        <Pagination.Item active>{currentPage}</Pagination.Item>
        <Pagination.Next
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={members.length < membersPerPage}
        />
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
                className="custom-input"
              />
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
                className="custom-input"
              />
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
                className="custom-input"
              />
            </Form.Group>
            <Form.Group controlId="dateOfBirth" className="mb-3">
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control
                type="date"
                name="dateOfBirth"
                value={editMember.dateOfBirth ? new Date(editMember.dateOfBirth).toISOString().split('T')[0] : ''}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="gender" className="mb-3">
              <Form.Label>Gender</Form.Label>
              <Form.Control
                as="select"
                name="gender"
                value={editMember.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Form.Control>
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
                />
                <Button
                  variant={isPasswordUnlocked ? "success" : "outline-secondary"}
                  onClick={handleUnlockPassword}
                >
                  {isPasswordUnlocked ? <FaLock /> : <FaUnlockAlt />}
                </Button>
              </div>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formFamily">
              <Form.Label>Family</Form.Label>
              <Form.Control
                as="select"
                name="family"
                value={editMember.family}
                onChange={handleChange}
                required
                className="custom-select"
              >
                {families.map((family) => (
                  <option key={family.familyId} value={family.familyId}>
                    {family.familyName} - {family.familyId}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Button variant="primary" type="submit" className="custom-button">
              Save Changes
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default MembersPage;

