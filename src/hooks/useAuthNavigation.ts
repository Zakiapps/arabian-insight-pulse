
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const useAuthNavigation = () => {
  const navigate = useNavigate();
  const { logout: authLogout } = useAuth();

  const logout = async () => {
    await authLogout();
    navigate('/login');
  };

  const redirectToDashboard = () => {
    navigate('/dashboard');
  };

  const redirectToLogin = () => {
    navigate('/login');
  };

  return {
    logout,
    redirectToDashboard,
    redirectToLogin
  };
};
