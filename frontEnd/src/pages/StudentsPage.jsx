import React, { useState, useEffect } from 'react';
import { studentsAPI } from '../api';
import StudentForm from '../components/StudentForm';

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await studentsAPI.getAll();
      setStudents(response.data?.data || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (studentData) => {
    try {
      setFormLoading(true);
      await studentsAPI.create(studentData);
      setShowForm(false);
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create student');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (studentData) => {
    try {
      setFormLoading(true);
      await studentsAPI.update(editingStudent.id, studentData);
      setEditingStudent(null);
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update student');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentsAPI.delete(id);
        fetchStudents();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete student');
      }
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingStudent(null);
  };

  if (showForm) {
    return (
      <div className="page">
        <StudentForm
          student={editingStudent}
          onSubmit={editingStudent ? handleUpdate : handleCreate}
          onCancel={handleCancel}
          loading={formLoading}
        />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Student Management</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Add New Student
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="stats">
        <strong>Total Students:</strong> {students.length}
      </div>

      {loading ? (
        <div className="loading">Loading students...</div>
      ) : students.length === 0 ? (
        <div className="no-data">No students found. Click "Add New Student" to create one.</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Date of Birth</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>{student.first_name} {student.last_name}</td>
                  <td>{student.email}</td>
                  <td>{student.phone || 'N/A'}</td>
                  <td>{student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'N/A'}</td>
                  <td>{student.category_name || 'N/A'}</td>
                  <td>
                    <button className="btn btn-sm btn-edit" onClick={() => handleEdit(student)}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-delete" onClick={() => handleDelete(student.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;
