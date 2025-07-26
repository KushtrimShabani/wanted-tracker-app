import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCheck = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Optional: Validate token format (basic check)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      if (payload.exp && payload.exp < now) {
        // Token expired
        localStorage.removeItem('jwt_token');
        navigate('/login');
        return;
      }
    } catch (error) {
      // Invalid token format
      localStorage.removeItem('jwt_token');
      navigate('/login');
      return;
    }
  }, [navigate]);

  return children;
};

export default AuthCheck; 