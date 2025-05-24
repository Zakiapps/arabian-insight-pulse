
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
      
      // Update local state - fix the TypeScript error
      setProfile(data);
      if (user) {
        setUser({ ...user, profile: data });
      }

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
    toast.success('تم تسجيل الخروج بنجاح');
    // Navigation will be handled by the component that calls logout
  };

  return {
    login,
    register,
    updateUserProfile,
    logout
  };
};
