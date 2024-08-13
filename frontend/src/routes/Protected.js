import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RequireAuth = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = checkIfUserIsAuthenticated();

    if (!isAuthenticated) {
      navigate('/login');
    }
  
  }, [navigate]);

  const checkIfUserIsAuthenticated = () => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    // console.log('isLoggedIn', isLoggedIn)
    return isLoggedIn ;
  };

  return <>{children}</>;
};

export default RequireAuth;
