
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { UserWithProfile, Profile } from '@/types/auth';
import { authService } from '@/services/authService';
import { profileService } from '@/services/profileService';

interface UseAuthActionsProps {
  user: UserWithProfile | null;
  setUser: (user: UserWithProfile | null) => void;
  setProfile: (profile: Profile | null) => void;
  setSession: (session: any) => void;
}

export const useAuthActions = ({ user, setUser, setProfile, setSession }: UseAuthActionsProps) => {
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    return await authService.login(email, password);
  };

  const register = async (email: string, password: string, fullName: string) => {
    return await authService.register(email, password, fullName);
  };

  const updateUserProfile = async (profileData: Partial<Profile>) => {
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    try {
      const data = await profileService.updateProfile(user.id, profileData);
      
      // Update local state
      setProfile(data);
      setUser(prev => prev ? { ...prev, profile: data } : null);

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setProfile(null);
    setSession(null);
    navigate('/login');
    toast.success('تم تسجيل الخروج بنجاح');
  };

  return {
    login,
    register,
    updateUserProfile,
    logout
  };
};
