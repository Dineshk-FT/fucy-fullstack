import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const RequireAuth = ({ children }) => {
  const { isLoggedIn } = useSelector((state) => state?.userDetails);
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = checkIfUserIsAuthenticated();
    console.log('first', window.location.pathname);

    if (!isAuthenticated && window.location.pathname === '/home') {
      console.log(1);
      navigate('/home');
    }

    if (!isAuthenticated && window.location.pathname !== '/home') {
      console.log(2);
      navigate('/login');
    }
  }, [navigate]);

  const checkIfUserIsAuthenticated = () => {
    return isLoggedIn;
  };

  return <>{children}</>;
};

export default RequireAuth;
