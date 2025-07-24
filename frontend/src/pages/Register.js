import React, { useState } from 'react';
import { Card, Button, Input } from '@fluentui/react-components';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [form, setForm] = useState({
    firstName:'', lastName:'', email:'', password:''
  });
  const [loading,setLoading] = useState(false);
  const [error,setError]   = useState('');
  const navigate = useNavigate();

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await axios.post(
        'http://192.168.1.114:5000/api/auth/register', form
      );
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user',  JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      display:'flex',justifyContent:'center',alignItems:'center',
      height:'100vh',background:'#f3f2f1'
    }}>
      <Card style={{padding:'2rem',width:'420px'}}>
        <h2 style={{textAlign:'center',marginBottom:'1.5rem'}}>
          Create an Account
        </h2>

        {error && (
          <div style={{
            color:'red',background:'#ffebee',border:'1px solid #ffcdd2',
            padding:'.5rem',marginBottom:'1rem',borderRadius:'4px',textAlign:'center'
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <Input name="firstName" placeholder="First name" value={form.firstName}
                 onChange={handleChange} style={{marginBottom:'.8rem'}} required/>
          <Input name="lastName"  placeholder="Last name"  value={form.lastName}
                 onChange={handleChange} style={{marginBottom:'.8rem'}} required/>
          <Input name="email"     placeholder="Email"      value={form.email}
                 onChange={handleChange} style={{marginBottom:'.8rem'}} required/>
          <Input name="password"  type="password" placeholder="Password"
                 value={form.password} onChange={handleChange}
                 style={{marginBottom:'1.2rem'}} required/>

          <Button appearance="primary" type="submit" disabled={loading} style={{width:'100%'}}>
            {loading ? 'Signing up…' : 'Register'}
          </Button>
        </form>

        <p style={{textAlign:'center',marginTop:'1rem'}}>
          Already have an account? <Link to="/">Log in</Link>
        </p>
      </Card>
    </div>
  );
};

export default Register;
