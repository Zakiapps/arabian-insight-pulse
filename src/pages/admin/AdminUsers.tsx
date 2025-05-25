
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { Trash2, UserPlus, Edit, Crown } from 'lucide-react';

interface User {
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

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'user'
  });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

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
        `);

      if (profilesError) throw profilesError;

      // Get auth data separately
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;

      // Get online status separately
      const { data: sessionsData } = await supabase
        .from('user_sessions')
        .select('user_id, is_online')
        .eq('is_online', true);

      // Combine the data with proper typing
      const combinedUsers: User[] = (profilesData || []).map(profile => {
        const authUser = authData.users.find(u => u.id === profile.id);
        const isOnline = sessionsData?.some(s => s.user_id === profile.id) || false;
        
        return {
          id: profile.id,
          email: authUser?.email || '',
          full_name: profile.full_name || '',
          role: profile.role,
          subscription_plan: profile.subscription_plan || 'free',
          avatar_url: profile.avatar_url,
          created_at: profile.created_at,
          last_sign_in_at: authUser?.last_sign_in_at,
          is_online: isOnline,
          payment_methods_count: 0 // Will be updated separately if needed
        };
      });

      setUsers(combinedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('خطأ في تحميل بيانات المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.full_name) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      const { data, error } = await supabase.rpc('admin_create_user', {
        email_param: newUser.email,
        password_param: newUser.password,
        full_name_param: newUser.full_name,
        role_param: newUser.role
      });

      if (error) throw error;

      toast.success('تم إنشاء المستخدم بنجاح');
      setCreateDialogOpen(false);
      setNewUser({ email: '', password: '', full_name: '', role: 'user' });
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error('خطأ في إنشاء المستخدم: ' + error.message);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase.rpc('admin_update_user_role', {
        user_id_param: userId,
        new_role: newRole
      });

      if (error) throw error;

      toast.success('تم تحديث دور المستخدم بنجاح');
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast.error('خطأ في تحديث دور المستخدم');
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

      if (error) throw error;

      toast.success('تم حذف المستخدم بنجاح');
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error('خطأ في حذف المستخدم');
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'moderator':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getSubscriptionBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'premium':
        return 'default';
      case 'pro':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
          <p className="text-muted-foreground">إدارة حسابات المستخدمين والأدوار</p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              إضافة مستخدم جديد
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إنشاء مستخدم جديد</DialogTitle>
              <DialogDescription>
                أدخل بيانات المستخدم الجديد
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="password">كلمة المرور</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="full_name">الاسم الكامل</Label>
                <Input
                  id="full_name"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, full_name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="role">الدور</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">مستخدم</SelectItem>
                    <SelectItem value="moderator">مشرف</SelectItem>
                    <SelectItem value="admin">مدير</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={createUser}>
                إنشاء المستخدم
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة المستخدمين</CardTitle>
          <CardDescription>
            إجمالي المستخدمين: {users.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{user.full_name}</h3>
                      {user.is_online && (
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      )}
                      {user.role === 'admin' && (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex gap-2">
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role === 'admin' ? 'مدير' : user.role === 'moderator' ? 'مشرف' : 'مستخدم'}
                      </Badge>
                      <Badge variant={getSubscriptionBadgeVariant(user.subscription_plan)}>
                        {user.subscription_plan}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      انضم في: {new Date(user.created_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>تعديل دور المستخدم</DialogTitle>
                        <DialogDescription>
                          تعديل دور المستخدم: {user.full_name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>الدور الحالي</Label>
                          <Select
                            defaultValue={user.role}
                            onValueChange={(value) => updateUserRole(user.id, value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">مستخدم</SelectItem>
                              <SelectItem value="moderator">مشرف</SelectItem>
                              <SelectItem value="admin">مدير</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {user.email !== 'admin@arabinsights.com' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
