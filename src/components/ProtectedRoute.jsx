import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spin } from 'antd';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/supplier-login', {
        state: { from: location.pathname }
      });
    } else if (!loading && requiredRole && user.role !== requiredRole) {
      navigate('/unauthorized');
    }
  }, [user, loading, navigate, location, requiredRole]);

  if (loading) {
    return <Spin size="large" />;
  }

  return user ? children : null;
};

export default ProtectedRoute;