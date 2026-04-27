import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import LessonViewer from './pages/LessonViewer.jsx';
import ProjectBoard from './pages/ProjectBoard.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/lesson/:id" element={<LessonViewer />} />
        <Route path="/projects" element={<ProjectBoard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
