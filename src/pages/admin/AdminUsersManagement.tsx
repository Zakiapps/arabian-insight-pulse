
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { 
  MoreHorizontal, 
  Search, 
  Trash, 
  Edit, 
  UserPlus, 
  Check, 
  X, 
  Shield, 
  ShieldAlert, 
  Filter, 
  ChevronDown,
  Upload,
  Trash2,
  Eye,
  CreditCard,
  Circle,
  Save
} from "lucide-react";
import { format } from "date-fns";

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  subscription_plan: string;
  avatar_url: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  is_online: boolean;
  payment_methods_count: number;
}

interface PaymentMethod {
  id: string;
  type: string;
  last_four: string | null;
  brand: string | null;
  is_default: boolean;
}

export default function AdminUsersManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isClearDataDialogOpen, setIsClearDataDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userPaymentMethods, setUserPaymentMethods] = useState<PaymentMethod[]>([]);
  const [editFormData, setEditFormData] = useState({
    full_name: "",
    email: "",
    role: "user",
    subscription_plan: "free",
  });
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: "credit_card",
    last_four: "",
    brand: "",
    is_default: false,
  });
  const [filter, setFilter] = useState('all');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Fetch all users using the admin function
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_all_users_admin');
      
      if (error) throw error;
      
      setUsers(data || []);
      console.log('Fetched users:', data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("فشل في جلب بيانات المستخدمين");
    } finally {
      setLoading(false);
    }
  };

  // Fetch payment methods for a user
  const fetchUserPaymentMethods = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      setUserPaymentMethods(data || []);
      console.log('Fetched payment methods:', data);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      toast.error("فشل في جلب طرق الدفع");
    }
  };

  // Set up real-time subscription for online status and refresh every 30 seconds
  useEffect(() => {
    fetchUsers();

    // Subscribe to real-time updates for user sessions
    const channel = supabase
      .channel('user-sessions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_sessions'
        },
        () => {
          console.log('Real-time update received');
          fetchUsers();
        }
      )
      .subscribe();

    // Refresh users every 30 seconds for real-time status
    const interval = setInterval(fetchUsers, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  // Filter users based on search query and role filter
  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = user.email.toLowerCase().includes(searchLower) ||
      user.full_name?.toLowerCase().includes(searchLower);
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'admin') return matchesSearch && user.role === 'admin';
    if (filter === 'user') return matchesSearch && user.role === 'user';
    if (filter === 'online') return matchesSearch && user.is_online;
    return matchesSearch;
  });

  // Handle edit user
  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setEditFormData({
      full_name: user.full_name || "",
      email: user.email || "",
      role: user.role || "user",
      subscription_plan: user.subscription_plan || "free",
    });
    setIsEditDialogOpen(true);
  };

  // Handle payment methods view
  const handleViewPayments = async (user: AdminUser) => {
    setSelectedUser(user);
    await fetchUserPaymentMethods(user.id);
    setIsPaymentDialogOpen(true);
  };

  // Handle avatar upload
  const handleAvatarUpload = async () => {
    if (!avatarFile || !selectedUser) return;

    setUploading(true);
    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${selectedUser.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(fileName, avatarFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(fileName);

      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', selectedUser.id);

      if (updateError) throw updateError;

      toast.success("تم تحديث الصورة الشخصية بنجاح");
      fetchUsers();
      setAvatarFile(null);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("فشل في رفع الصورة الشخصية");
    } finally {
      setUploading(false);
    }
  };

  // Save user changes
  const saveUserChanges = async () => {
    if (!selectedUser) return;
    
    try {
      // Update profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: editFormData.full_name,
          role: editFormData.role,
          subscription_plan: editFormData.subscription_plan,
        })
        .eq('id', selectedUser.id);

      if (profileError) throw profileError;

      toast.success("تم تحديث بيانات المستخدم بنجاح");
      fetchUsers();
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("فشل في تحديث بيانات المستخدم");
    }
  };

  // Add payment method
  const addPaymentMethod = async () => {
    if (!selectedUser) return;
    
    try {
      const { error } = await supabase
        .from('payment_methods')
        .insert({
          user_id: selectedUser.id,
          type: newPaymentMethod.type,
          last_four: newPaymentMethod.last_four,
          brand: newPaymentMethod.brand,
          is_default: newPaymentMethod.is_default,
        });

      if (error) throw error;
      
      toast.success("تم إضافة طريقة الدفع بنجاح");
      await fetchUserPaymentMethods(selectedUser.id);
      setIsAddPaymentDialogOpen(false);
      setNewPaymentMethod({
        type: "credit_card",
        last_four: "",
        brand: "",
        is_default: false,
      });
    } catch (error) {
      console.error("Error adding payment method:", error);
      toast.error("فشل في إضافة طريقة الدفع");
    }
  };

  // Remove payment method
  const removePaymentMethod = async (paymentMethodId: string) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', paymentMethodId);

      if (error) throw error;
      
      toast.success("تم حذف طريقة الدفع بنجاح");
      if (selectedUser) {
        await fetchUserPaymentMethods(selectedUser.id);
      }
    } catch (error) {
      console.error("Error removing payment method:", error);
      toast.error("فشل في حذف طريقة الدفع");
    }
  };

  // Delete user
  const confirmDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      // Delete user profile (this will cascade to auth.users)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedUser.id);

      if (error) throw error;
      
      toast.success("تم حذف المستخدم بنجاح");
      fetchUsers();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("فشل في حذف المستخدم");
    }
  };

  // Clear all dummy data
  const clearDummyData = async () => {
    try {
      const { error } = await supabase.rpc('clear_dummy_data');
      
      if (error) throw error;
      
      toast.success("تم مسح البيانات التجريبية بنجاح");
      fetchUsers();
      setIsClearDataDialogOpen(false);
    } catch (error) {
      console.error("Error clearing dummy data:", error);
      toast.error("فشل في مسح البيانات التجريبية");
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsClearDataDialogOpen(true)} variant="outline">
            <Trash2 className="ml-2 h-4 w-4" />
            مسح البيانات التجريبية
          </Button>
          <Button>
            <UserPlus className="ml-2 h-4 w-4" />
            إضافة مستخدم
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>المستخدمون النشطون ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="البحث عن مستخدم..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    <span>
                      {filter === 'all' && 'جميع المستخدمين'}
                      {filter === 'admin' && 'المدراء فقط'}
                      {filter === 'user' && 'المستخدمين العاديين'}
                      {filter === 'online' && 'المتصلين الآن'}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilter('all')}>جميع المستخدمين</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('admin')}>المدراء فقط</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('user')}>المستخدمين العاديين</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('online')}>المتصلين الآن</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
      
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المستخدم</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>الدور</TableHead>
                  <TableHead>خطة الاشتراك</TableHead>
                  <TableHead>طرق الدفع</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>تاريخ الإنشاء</TableHead>
                  <TableHead>آخر تسجيل دخول</TableHead>
                  <TableHead className="w-[100px]">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex justify-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      لم يتم العثور على مستخدمين.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map(user => (
                    <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleEditUser(user)}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar_url || ''} />
                            <AvatarFallback>
                              {user.full_name?.charAt(0) || user.email.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div>{user.full_name || "غير معروف"}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.role === "admin" ? (
                          <Badge variant="secondary" className="flex items-center gap-1 w-fit bg-primary text-primary-foreground">
                            <ShieldAlert className="h-3 w-3" />
                            مدير
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            <Shield className="h-3 w-3" />
                            مستخدم
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.subscription_plan === 'free' ? 'outline' : 'default'}>
                          {user.subscription_plan === 'free' && 'مجاني'}
                          {user.subscription_plan === 'pro' && 'احترافي'}
                          {user.subscription_plan === 'enterprise' && 'مؤسسي'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewPayments(user);
                          }}
                          className="flex items-center gap-1"
                        >
                          <CreditCard className="h-4 w-4" />
                          {user.payment_methods_count}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Circle className={`h-3 w-3 ${user.is_online ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'}`} />
                          <span className="text-sm">
                            {user.is_online ? 'متصل' : 'غير متصل'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(user.created_at), "yyyy/MM/dd")}</TableCell>
                      <TableCell>
                        {user.last_sign_in_at ? (
                          format(new Date(user.last_sign_in_at), "yyyy/MM/dd HH:mm")
                        ) : (
                          <span className="text-muted-foreground">لم يسجل الدخول بعد</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">فتح القائمة</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleEditUser(user);
                            }}>
                              <Edit className="ml-2 h-4 w-4" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleViewPayments(user);
                            }}>
                              <CreditCard className="ml-2 h-4 w-4" />
                              طرق الدفع
                            </DropdownMenuItem>
                            {user.email !== 'admin@arabinsights.com' && (
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedUser(user);
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash className="ml-2 h-4 w-4" />
                                حذف
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل المستخدم</DialogTitle>
            <DialogDescription>تعديل معلومات المستخدم ودوره وخطة الاشتراك.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <Avatar className="h-20 w-20 mx-auto mb-4">
                <AvatarImage src={selectedUser?.avatar_url || ''} />
                <AvatarFallback>
                  {selectedUser?.full_name?.charAt(0) || selectedUser?.email.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                />
                {avatarFile && (
                  <Button 
                    onClick={handleAvatarUpload} 
                    disabled={uploading}
                    size="sm"
                  >
                    <Upload className="ml-2 h-4 w-4" />
                    {uploading ? 'جاري الرفع...' : 'رفع الصورة'}
                  </Button>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">الاسم الكامل</label>
              <Input
                id="name"
                value={editFormData.full_name}
                onChange={(e) => setEditFormData({...editFormData, full_name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">البريد الإلكتروني</label>
              <Input
                id="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">لا يمكن تعديل البريد الإلكتروني</p>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">الدور</label>
              <Select
                value={editFormData.role}
                onValueChange={(value) => setEditFormData({...editFormData, role: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">مستخدم</SelectItem>
                  <SelectItem value="admin">مدير</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">خطة الاشتراك</label>
              <Select
                value={editFormData.subscription_plan}
                onValueChange={(value) => setEditFormData({...editFormData, subscription_plan: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">مجاني</SelectItem>
                  <SelectItem value="pro">احترافي</SelectItem>
                  <SelectItem value="enterprise">مؤسسي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={saveUserChanges}>
              <Save className="ml-2 h-4 w-4" />
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Methods Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>طرق الدفع - {selectedUser?.full_name}</DialogTitle>
            <DialogDescription>إدارة طرق الدفع للمستخدم</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">طرق الدفع المسجلة</h4>
              <Button onClick={() => setIsAddPaymentDialogOpen(true)} size="sm">
                <CreditCard className="ml-2 h-4 w-4" />
                إضافة طريقة دفع
              </Button>
            </div>
            {userPaymentMethods.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">لا توجد طرق دفع مسجلة</p>
            ) : (
              userPaymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5" />
                    <div>
                      <div className="font-medium">
                        {method.type === 'credit_card' && 'بطاقة ائتمان'}
                        {method.type === 'paypal' && 'PayPal'}
                        {method.type === 'bank_transfer' && 'تحويل بنكي'}
                      </div>
                      {method.last_four && (
                        <div className="text-sm text-muted-foreground">
                          {method.brand} ••••{method.last_four}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {method.is_default && (
                      <Badge variant="outline">افتراضي</Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removePaymentMethod(method.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Payment Method Dialog */}
      <Dialog open={isAddPaymentDialogOpen} onOpenChange={setIsAddPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة طريقة دفع جديدة</DialogTitle>
            <DialogDescription>إضافة طريقة دفع للمستخدم</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">نوع طريقة الدفع</label>
              <Select
                value={newPaymentMethod.type}
                onValueChange={(value) => setNewPaymentMethod({...newPaymentMethod, type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">بطاقة ائتمان</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">آخر 4 أرقام</label>
              <Input
                value={newPaymentMethod.last_four}
                onChange={(e) => setNewPaymentMethod({...newPaymentMethod, last_four: e.target.value})}
                placeholder="1234"
                maxLength={4}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">العلامة التجارية</label>
              <Input
                value={newPaymentMethod.brand}
                onChange={(e) => setNewPaymentMethod({...newPaymentMethod, brand: e.target.value})}
                placeholder="Visa, Mastercard, etc."
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_default"
                checked={newPaymentMethod.is_default}
                onChange={(e) => setNewPaymentMethod({...newPaymentMethod, is_default: e.target.checked})}
              />
              <label htmlFor="is_default" className="text-sm font-medium">
                جعل هذه الطريقة افتراضية
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPaymentDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={addPaymentMethod}>
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف المستخدم</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من أنك تريد حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              <X className="ml-2 h-4 w-4" />
              إلغاء
            </Button>
            <Button variant="destructive" onClick={confirmDeleteUser}>
              <Check className="ml-2 h-4 w-4" />
              تأكيد الحذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Dummy Data Dialog */}
      <Dialog open={isClearDataDialogOpen} onOpenChange={setIsClearDataDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>مسح البيانات التجريبية</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من أنك تريد مسح جميع البيانات التجريبية؟ سيتم حذف جلسات المستخدمين وطرق الدفع وإعادة تعيين ملفات التعريف.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsClearDataDialogOpen(false)}>
              <X className="ml-2 h-4 w-4" />
              إلغاء
            </Button>
            <Button variant="destructive" onClick={clearDummyData}>
              <Check className="ml-2 h-4 w-4" />
              تأكيد المسح
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
