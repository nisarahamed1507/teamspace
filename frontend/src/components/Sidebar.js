import React, { useState, useEffect } from 'react';
import { Button } from '@fluentui/react-components';
import { useNavigate } from 'react-router-dom';
import { useVideo } from '../features/video/VideoContext';
import axios from 'axios';

const Sidebar = () => {
  const navigate = useNavigate();
  const { callUser } = useVideo();
  const [users, setUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // Fetch all users for calling
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.filter(user => user.email !== currentUser.email));
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleStartCall = () => {
    setShowUserList(!showUserList);
    if (!showUserList) {
      fetchUsers();
    }
  };

  const handleCallUser = (userEmail) => {
    callUser(userEmail);
    setShowUserList(false);
  };

  return (
    <div style={{
      width: '220px',
      minHeight: '100vh',
      background: '#f4f6fa',
      borderRight: '1px solid #e5e5e5',
      padding: '1rem 0',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ fontWeight: 600, paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        Welcome, {currentUser.firstName || currentUser.email}
      </div>
      
      <div style={{ fontWeight: 600, paddingLeft: '1.5rem', marginBottom: '2rem' }}>My Teams</div>
      <ul style={{ listStyle: 'none', paddingLeft: 0, flex: 1 }}>
        <li style={{ padding: '0.5rem 1.5rem', background: '#e3f2fd', fontWeight: 500 }}>General</li>
        <li style={{ padding: '0.5rem 1.5rem' }}>Project Alpha</li>
      </ul>

      {/* Video call section */}
      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e5e5e5' }}>
        <Button 
          appearance="primary" 
          onClick={handleStartCall}
          style={{ width: '100%', marginBottom: '0.5rem' }}
        >
          📹 {showUserList ? 'Cancel' : 'Start Video Call'}
        </Button>

        {/* User list for calling */}
        {showUserList && (
          <div style={{
            maxHeight: '200px',
            overflowY: 'auto',
            backgroundColor: 'white',
            border: '1px solid #e5e5e5',
            borderRadius: '4px',
            marginBottom: '0.5rem'
          }}>
            {users.length > 0 ? (
              users.map(user => (
                <div
                  key={user._id}
                  onClick={() => handleCallUser(user.email)}
                  style={{
                    padding: '0.5rem',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f0f0f0',
                    ':hover': { backgroundColor: '#f5f5f5' }
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                >
                  {user.firstName} {user.lastName} ({user.email})
                </div>
              ))
            ) : (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                No other users available
              </div>
            )}
          </div>
        )}

        <Button 
          appearance="outline" 
          onClick={handleLogout}
          style={{ width: '100%' }}
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
