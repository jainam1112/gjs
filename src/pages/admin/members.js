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
  const [showModal, setShowModal] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [membersPerPage] = useState(10);
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
      toast.success("Member deleted successfully.");
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
              className="me-2 custom-input w-100 mb-2 mb-md-0"
              style={{ maxWidth: "300px" }}
            />
            <Button onClick={handleSearch} className="custom-button w-100 w-md-auto mb-0">
              Search
            </Button>
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
          {isLoading ? (
            <tr>
              <td colSpan="8" className="text-center">
                <Spinner animation="border" />
              </td>
            </tr>
          ) : (
            members.length ? ( members.map((member) => (
              <tr key={member._id}>
                <td>{member.name}</td>
                <td>{member.phoneNumber}</td>
                <td>{member.email}</td>
                <td>{member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString('en-CA'): ''}</td>
                <td>{member.gender}</td>
                <td>{member.familyId}</td>
                <td>{member.familyName}</td>
                <td className="text-center">
                  {!showDeleted ? <Button
                    variant="warning"
                    className="mb-2"
                    onClick={() => handleEditModal(member)}
                    disabled={loadingAction[member._id]}
                  >
                    {loadingAction[member._id] ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      "Edit"
                    )}
                  </Button> : <Button
                    variant="warning"
                    onClick={() => handleDelete(member._id)}
                     className="mb-2"
                    disabled={loadingAction[member._id]}
                  >
                    {loadingAction[member._id] ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      "Delete"
                    )}
                  </Button>}
                  {showDeleted ? <Button
                    variant="danger"
                    onClick={() => handleRestore(member._id)}
                    className="ms-2 mb-2"
                    disabled={loadingAction[member._id]}
                  >
                    {loadingAction[member._id] ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      "Restore"
                    )}
                  </Button> : <Button
                    variant="danger"
                    onClick={() => handlePermanentDelete(member._id)}
                    className="ms-2 mb-2"
                    disabled={loadingAction[member._id]}
                  >
                    {loadingAction[member._id] ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      "Permanent Delete"
                    )}
                  </Button>}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">
                No members found
              </td>
            </tr>
          ))}
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
                value={editMember.familyId}
                onChange={handleFamilyChange}
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

