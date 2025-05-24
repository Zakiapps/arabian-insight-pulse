
import { Session, User } from '@supabase/supabase-js';

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
};

export type UserWithProfile = User & {
  profile?: Profile;
};

export interface AuthContextType {
  user: UserWithProfile | null;
  profile: Profile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  logout: () => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<{
    error: Error | null;
    data: { user: User | null; session: Session | null };
  }>;
  updateUserProfile: (profileData: Partial<Profile>) => Promise<{
    error: Error | null;
    data: Profile | null;
  }>;
}
