
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { User, ProfileData, NewUser } from '@/types/admin';

export const useAdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get profiles data
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          role,
          subscription_plan,
          avatar_url,
          created_at
        `)
        .returns<ProfileData[]>();

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      if (!profilesData || !Array.isArray(profilesData)) {
        console.warn('No profiles found');
        setUsers([]);
        return;
      }

      // Get online status
      const { data: sessionsData } = await supabase
        .from('user_sessions')
        .select('user_id, is_online')
        .eq('is_online', true);

      // Transform profiles to users
      const usersList: User[] = profilesData.map((profile: ProfileData) => {
        const isOnline = sessionsData?.some(s => s.user_id === profile.id) || false;
        
        return {
          id: profile.id,
          email: profile.id, // Using ID as email placeholder
          full_name: profile.full_name || '',
          role: profile.role,
          subscription_plan: profile.subscription_plan || 'free',
          avatar_url: profile.avatar_url || undefined,
          created_at: profile.created_at,
          last_sign_in_at: undefined,
          is_online: isOnline,
          payment_methods_count: 0
        };
      });

      setUsers(usersList);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('خطأ في تحميل بيانات المستخدمين: ' + (error.message || 'خطأ غير معروف'));
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (newUser: NewUser) => {
    if (!newUser.email || !newUser.password || !newUser.full_name) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('admin_create_user', {
        email_param: newUser.email,
        password_param: newUser.password,
        full_name_param: newUser.full_name,
        role_param: newUser.role
      });

      if (error) {
        console.error('Error creating user:', error);
        throw error;
      }

      toast.success('تم إنشاء المستخدم بنجاح');
      fetchUsers();
      return true;
    } catch (error: any) {
      console.error('Error creating user:', error);
      if (error.message.includes('already exists')) {
        toast.error('المستخدم موجود بالفعل');
      } else {
        toast.error('خطأ في إنشاء المستخدم: ' + (error.message || 'خطأ غير معروف'));
      }
      return false;
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase.rpc('admin_update_user_role', {
        user_id_param: userId,
        new_role: newRole
      });

      if (error) {
        console.error('Error updating user role:', error);
        throw error;
      }

      toast.success('تم تحديث دور المستخدم بنجاح');
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast.error('خطأ في تحديث دور المستخدم: ' + (error.message || 'خطأ غير معروف'));
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      return;
    }

    try {
      const { error } = await supabase.rpc('admin_delete_user', {
        user_id_param: userId
      });

      if (error) {
        console.error('Error deleting user:', error);
        throw error;
      }

      toast.success('تم حذف المستخدم بنجاح');
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error('خطأ في حذف المستخدم: ' + (error.message || 'خطأ غير معروف'));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    createUser,
    updateUserRole,
    deleteUser,
    fetchUsers
  };
};
