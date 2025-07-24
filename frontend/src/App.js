import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { FluentProvider, teamsLightTheme } from '@fluentui/react-components';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';   // we’ll create this now
import ProtectedRoute from './components/ProtectedRoute';
import Register from './pages/Register';
// ...other imports



function App() {
  return (
    <FluentProvider theme={teamsLightTheme}>
      <Routes>
      <Route path="/"         element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard"
         element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
      </Routes>
    </FluentProvider>
  );
}


export default App;
