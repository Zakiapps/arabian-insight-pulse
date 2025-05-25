
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const useAuthNavigation = () => {
  const navigate = useNavigate();
  const { logout: authLogout } = useAuth();

  const logout = async () => {
    await authLogout();
    navigate('/login'); // تصحيح: استخدام /login بدلاً من /login
  };

  const redirectToDashboard = () => {
    navigate('/dashboard');
  };

  const redirectToLogin = () => {
    navigate('/login'); // تصحيح: استخدام /login
  };

  return {
    logout,
    redirectToDashboard,
    redirectToLogin
  };
};
