import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />; // Используем replace, чтобы не вернуться на защищенную страницу после логина
  }

  return children;
};

export default PrivateRoute;