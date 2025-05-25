import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Activity, Edit, Shield, Trash2, UserPlus, Users } from "lucide-react";
import { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const userFormSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  full_name: z.string().min(2, "الاسم يجب أن يكون أكثر من حرفين"),
  role: z.enum(["user", "admin"], {
    required_error: "يجب اختيار دور المستخدم",
  }),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل").optional(),
});

type UserFormData = z.infer<typeof userFormSchema>;

interface User {
  id: string;
  email: string;
  created_at: string;
  profile?: {
    full_name: string;
    role: string;
  };
  subscription?: {
    status: string;
    plan: {
      name: string;
    };
  };
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
      full_name: "",
      role: "user",
      password: "",
    },
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Get profiles with user data
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          role,
          created_at
        `);

      if (profilesError) throw profilesError;

      // Transform profiles to user objects
      const usersList: User[] = (profiles || []).map(profile => ({
        id: profile.id,
        email: profile.id, // We'll show the ID as email placeholder
        created_at: profile.created_at,
        profile: {
          full_name: profile.full_name || '',
          role: profile.role,
        }
      }));

      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('خطأ في جلب بيانات المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (data: UserFormData) => {
    try {
      // First check if a profile with this email already exists
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.email)
        .single();

      if (profileCheckError && profileCheckError.code !== 'PGRST116') {
        throw profileCheckError;
      }

      if (existingProfile) {
        toast.error('مستخدم بهذا البريد الإلكتروني موجود بالفعل');
        return;
      }

      // Call the admin_create_user function if no existing profile found
      const { data: result, error } = await supabase.rpc('admin_create_user', {
        email_param: data.email,
        password_param: data.password || 'temp123456',
        full_name_param: data.full_name,
        role_param: data.role
      });

      if (error) throw error;

      toast.success('تم إنشاء المستخدم بنجاح');
      setIsDialogOpen(false);
      form.reset();
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'خطأ في إنشاء المستخدم');
    }
  };

  const handleUpdateUser = async (data: UserFormData) => {
    if (!editingUser) return;

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          role: data.role,
        })
        .eq('id', editingUser.id);

      if (profileError) throw profileError;

      toast.success('تم تحديث المستخدم بنجاح');
      setIsDialogOpen(false);
      setEditingUser(null);
      form.reset();
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error('خطأ في تحديث المستخدم');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;

    try {
      // Call the admin_delete_user function
      const { error } = await supabase.rpc('admin_delete_user', {
        user_id_param: userId
      });

      if (error) throw error;

      toast.success('تم حذف المستخدم بنجاح');
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'خطأ في حذف المستخدم');
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    form.reset({
      email: user.email,
      full_name: user.profile?.full_name || '',
      role: user.profile?.role as "user" | "admin" || 'user',
    });
    setIsDialogOpen(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.profile?.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const activeUsers = users.filter(user => user.subscription?.status === 'active').length;
  const adminUsers = users.filter(user => user.profile?.role === 'admin').length;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة المستخدمين</h2>
          <p className="text-muted-foreground">إدارة حسابات المستخدمين والصلاحيات</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingUser(null);
              form.reset();
            }}>
              <UserPlus className="h-4 w-4 ml-2" />
              إضافة مستخدم جديد
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
              </DialogTitle>
              <DialogDescription>
                {editingUser ? 'تعديل بيانات المستخدم' : 'إنشاء حساب مستخدم جديد'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(editingUser ? handleUpdateUser : handleCreateUser)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>البريد الإلكتروني</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!!editingUser} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم الكامل</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الدور</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر دور المستخدم" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">مستخدم</SelectItem>
                          <SelectItem value="admin">مشرف</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!editingUser && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>كلمة المرور (اختيارية)</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} placeholder="كلمة مرور مؤقتة" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <DialogFooter>
                  <Button type="submit">
                    {editingUser ? 'تحديث' : 'إنشاء'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المستخدمون النشطون</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المشرفون</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsers}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة المستخدمين</CardTitle>
          <CardDescription>إدارة جميع المستخدمين والصلاحيات</CardDescription>
          <div className="flex gap-4">
            <Input
              placeholder="البحث بالاسم أو المعرف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="تصفية حسب الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأدوار</SelectItem>
                <SelectItem value="user">مستخدم</SelectItem>
                <SelectItem value="admin">مشرف</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">جاري التحميل...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>المعرف</TableHead>
                  <TableHead>الدور</TableHead>
                  <TableHead>الاشتراك</TableHead>
                  <TableHead>تاريخ الإنشاء</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.profile?.full_name || 'غير محدد'}</TableCell>
                    <TableCell className="font-mono text-xs">{user.id.slice(0, 8)}...</TableCell>
                    <TableCell>
                      <Badge variant={user.profile?.role === 'admin' ? 'destructive' : 'secondary'}>
                        {user.profile?.role === 'admin' ? 'مشرف' : 'مستخدم'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.subscription ? (
                        <Badge variant="outline">
                          {user.subscription.plan?.name || 'نشط'}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">مجاني</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('ar-SA')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {user.id !== 'admin@arabinsights.com' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;