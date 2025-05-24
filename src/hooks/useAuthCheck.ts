
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useAuthCheck = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const checkAuth = () => {
    if (!isAuthenticated || !user) {
      toast.error('يجب تسجيل الدخول أولاً');
      navigate('/login');
      return false;
    }
    return true;
  };

  return { checkAuth, user, isAuthenticated };
};
