import React, { useState } from 'react';
import { Button, Input, Card } from '@fluentui/react-components';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';


<p style={{textAlign:'center',marginTop:'1rem'}}>
  No account? <Link to="/register">Create one</Link>
</p>
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://192.168.1.114:5000/api/auth/login', {
        email,
        password
      });

      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#f3f2f1'
    }}>
      <Card style={{ padding: '2rem', width: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          Teams Clone Login
        </h2>
        
        {error && (
          <div style={{ 
            color: 'red', 
            marginBottom: '1rem', 
            textAlign: 'center',
            padding: '0.5rem',
            backgroundColor: '#ffebee',
            border: '1px solid #ffcdd2',
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <Input
              type="email"
              placeholder="Email (try: test@example.com)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%' }}
              required
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <Input
              type="password"
              placeholder="Password (try: password123)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%' }}
              required
            />
          </div>
          <Button 
            appearance="primary" 
            type="submit" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Login;
