import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function PrivateRoute({ element: Component, ...rest }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  return currentUser ? (
    <Component {...rest} />
  ) : (
    <Navigate to="/login" state={{ from: location }} />
  );
}

export default PrivateRoute;

