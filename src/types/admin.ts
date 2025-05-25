
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  subscription_plan: string;
  avatar_url?: string;
  created_at: string;
  last_sign_in_at?: string;
  is_online: boolean;
  payment_methods_count: number;
}

export interface ProfileData {
  id: string;
  full_name: string | null;
  role: string;
  subscription_plan: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface NewUser {
  email: string;
  password: string;
  full_name: string;
  role: string;
}
