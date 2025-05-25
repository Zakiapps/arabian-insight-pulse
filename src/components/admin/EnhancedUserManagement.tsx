
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { 
  UserPlus, 
  Edit, 
  Trash2, 
  Shield, 
  Users, 
  Activity, 
  Search,
  Filter,
  MoreHorizontal,
  Crown,
  Mail,
  Calendar,
  Eye,
  EyeOff
} from "lucide-react";
import { FluidContainer, ModernLayout, ModernGrid } from '@/components/layouts/ModernLayout';
import { ModernButton, ToggleButton } from '@/components/ui/modern-button';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { User } from '@/types/admin';

interface UserFormData {
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  password?: string;
}

const EnhancedUserManagement = () => {
  const { users, loading, createUser, updateUserRole, deleteUser, fetchUsers } = useAdminUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [userForm, setUserForm] = useState<UserFormData>({
    email: "",
    full_name: "",
    role: "user",
    password: ""
  });

  const resetForm = () => {
    setUserForm({
      email: "",
      full_name: "",
      role: "user",
      password: ""
    });
  };

  const handleCreateUser = async () => {
    if (!userForm.email || !userForm.full_name) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const success = await createUser({
      email: userForm.email,
      full_name: userForm.full_name,
      role: userForm.role,
      password: userForm.password || 'temp123456'
    });

    if (success) {
      setIsCreateDialogOpen(false);
      resetForm();
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setUserForm({
      email: user.email,
      full_name: user.full_name,
      role: user.role as 'user' | 'admin',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    await updateUserRole(selectedUser.id, userForm.role);
    setIsEditDialogOpen(false);
    setSelectedUser(null);
    resetForm();
  };

  const handleDeleteUser = async (userId: string) => {
    await deleteUser(userId);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'online' && user.is_online) ||
                         (statusFilter === 'offline' && !user.is_online);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    online: users.filter(u => u.is_online).length,
    premium: users.filter(u => u.subscription_plan !== 'free').length
  };

  if (loading) {
    return (
      <FluidContainer>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </FluidContainer>
    );
  }

  return (
    <FluidContainer>
      <ModernLayout spacing="lg">
        {/* Header */}
        <div className="flex items-center justify-between" dir="rtl">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              إدارة المستخدمين المتطورة
            </h1>
            <p className="text-muted-foreground mt-2">إدارة شاملة لحسابات المستخدمين والصلاحيات</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <ModernButton onClick={resetForm} className="shadow-lg">
                <UserPlus className="h-5 w-5 ml-2" />
                إضافة مستخدم جديد
              </ModernButton>
            </DialogTrigger>
            <DialogContent className="max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <UserPlus className="h-5 w-5" />
                  إنشاء مستخدم جديد
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>البريد الإلكتروني</Label>
                  <Input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <Label>الاسم الكامل</Label>
                  <Input
                    value={userForm.full_name}
                    onChange={(e) => setUserForm(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="الاسم الكامل"
                  />
                </div>
                <div>
                  <Label>الدور</Label>
                  <Select value={userForm.role} onValueChange={(value: 'user' | 'admin') => setUserForm(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">مستخدم</SelectItem>
                      <SelectItem value="admin">مشرف</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>كلمة المرور (اختيارية)</Label>
                  <Input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="كلمة مرور مؤقتة"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <ModernButton onClick={handleCreateUser} className="flex-1">
                    إنشاء المستخدم
                  </ModernButton>
                  <ModernButton variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1">
                    إلغاء
                  </ModernButton>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <ModernGrid cols={4}>
          <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">إجمالي المستخدمين</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">المستخدمون النشطون</p>
                  <p className="text-3xl font-bold text-green-900">{stats.online}</p>
                </div>
                <Activity className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">المشرفون</p>
                  <p className="text-3xl font-bold text-purple-900">{stats.admins}</p>
                </div>
                <Shield className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">المشتركون المميزون</p>
                  <p className="text-3xl font-bold text-orange-900">{stats.premium}</p>
                </div>
                <Crown className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </ModernGrid>

        {/* Filters and Search */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4" dir="rtl">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="البحث بالاسم أو البريد الإلكتروني..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأدوار</SelectItem>
                    <SelectItem value="user">مستخدم</SelectItem>
                    <SelectItem value="admin">مشرف</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="online">متصل</SelectItem>
                    <SelectItem value="offline">غير متصل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-right" dir="rtl">
              قائمة المستخدمين ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="text-right" dir="rtl">
                    <TableHead className="text-right">المستخدم</TableHead>
                    <TableHead className="text-right">الدور</TableHead>
                    <TableHead className="text-right">الاشتراك</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">تاريخ الانضمام</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3" dir="rtl">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback>
                              {user.full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{user.full_name}</p>
                              {user.role === 'admin' && (
                                <Crown className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                          {user.role === 'admin' ? 'مشرف' : 'مستخدم'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.subscription_plan === 'free' ? 'outline' : 'default'}>
                          {user.subscription_plan === 'free' ? 'مجاني' : user.subscription_plan}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${user.is_online ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className="text-sm">
                            {user.is_online ? 'متصل' : 'غير متصل'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(user.created_at).toLocaleDateString('ar-SA')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          {user.email !== 'admin@arabinsights.com' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
            </div>
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Edit className="h-5 w-5" />
                تعديل المستخدم
              </DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4 mt-4">
                <div>
                  <Label>البريد الإلكتروني</Label>
                  <Input value={userForm.email} disabled />
                </div>
                <div>
                  <Label>الاسم الكامل</Label>
                  <Input
                    value={userForm.full_name}
                    onChange={(e) => setUserForm(prev => ({ ...prev, full_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>الدور</Label>
                  <Select value={userForm.role} onValueChange={(value: 'user' | 'admin') => setUserForm(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">مستخدم</SelectItem>
                      <SelectItem value="admin">مشرف</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3 pt-4">
                  <ModernButton onClick={handleUpdateUser} className="flex-1">
                    حفظ التغييرات
                  </ModernButton>
                  <ModernButton variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                    إلغاء
                  </ModernButton>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </ModernLayout>
    </FluidContainer>
  );
};

export default EnhancedUserManagement;
