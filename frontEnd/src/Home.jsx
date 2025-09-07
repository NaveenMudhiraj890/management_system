import React, { useState, useEffect } from 'react';
import { usersAPI } from './api';

function Home() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    usersAPI.getAll()
      .then((res) => {
        if (!mounted) return;
        setUsers(Array.isArray(res.data?.data) ? res.data.data : []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message || 'Failed to load users');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="page">
      <h1>Dashboard</h1>
      <div className="stats">
        <strong>Total Users:</strong> {users.length}
      </div>
      
      {loading && <div className="loading">Loading users...</div>}
      {error && <div className="error-message">{error}</div>}
      
      {!loading && !error && users.length > 0 && (
        <div className="table-container">
          <h3>Recent Users</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 5).map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Home;