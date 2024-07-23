import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Container, Table } from 'react-bootstrap';
import { useRouter } from 'next/router';
import { authMiddleware } from '../../middleware/auth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/globals.css';

export const getServerSideProps = async (ctx) => {
  const authResult = await authMiddleware(ctx);
  if (authResult.redirect) return authResult;

  // Fetch other data here if needed

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
  });
  const router = useRouter();
  const { id } = router.query;

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

  const handleEditModal = (member) => {
    setEditMember(member);
    setShowModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
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
    }
  };

  const handleDelete = async (memberId) => {
    try {
      await axios.patch(`/api/member/remove`, { memberId });
      setFamilyMembers(familyMembers.filter(member => member._id !== memberId));
      toast.success('Member deleted successfully');
    } catch (error) {
      toast.error('Error deleting member');
      console.error('Error deleting member:', error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <Container className="mt-5">
      <ToastContainer />
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="title">Family Members List</h2>
        <Button href="/addMember" className="custom-button">Add New Member</Button>
      </div>
      {family && (
        <div className="mb-3">
          <h4>Family: {family.familyName}</h4>
          <p><strong>Family ID:</strong> {family.familyId}</p>
        </div>
      )}
      <Table striped bordered hover className="custom-table">
        <thead>
          <tr>
            <th>Family ID</th>
            <th>Name</th>
            <th>Phone Number</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {familyMembers.map(member => (
            <tr key={member._id}>
              <td><strong>{family.familyId}</strong></td>
              <td>{member.name}</td>
              <td>{member.phoneNumber}</td>
              <td>{member.email}</td>
              <td>
                <div className="btn-group" role="group">
                  <Button variant="outline-primary" size="sm" onClick={() => handleEditModal(member)}>Edit</Button>
                  <Button variant="outline-danger" size="sm" onClick={() => handleDelete(member._id)}>Delete</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Edit Member Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleEditSubmit}>
            <div className="mb-3">
              <label htmlFor="edit-name" className="form-label">Name</label>
              <input
                type="text"
                id="edit-name"
                className="form-control"
                value={editMember.name}
                onChange={(e) => setEditMember({ ...editMember, name: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="edit-phoneNumber" className="form-label">Phone Number</label>
              <input
                type="text"
                id="edit-phoneNumber"
                className="form-control"
                value={editMember.phoneNumber}
                onChange={(e) => setEditMember({ ...editMember, phoneNumber: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="edit-email" className="form-label">Email</label>
              <input
                type="email"
                id="edit-email"
                className="form-control"
                value={editMember.email}
                onChange={(e) => setEditMember({ ...editMember, email: e.target.value })}
                required
              />
            </div>
            <Button variant="primary" type="submit">Save Changes</Button>
          </form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default FamilyMembersList;
