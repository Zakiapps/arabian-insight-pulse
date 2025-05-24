
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MoreHorizontal, Search, Trash, Edit, UserPlus, Check, X, Shield, ShieldAlert, Filter, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";

interface User {
  id: string;
  email: string;
  created_at: string;
  profile?: {
    full_name: string | null;
    role: string;
  };
  last_sign_in_at: string | null;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    full_name: "",
    role: "user",
  });
  const [filter, setFilter] = useState('all'); // all, admin, user

  // Mock fetching users since we can't use admin APIs in the client
  const mockFetchUsers = async () => {
    setLoading(true);
    try {
      // In a real app, this would be a call to a secure backend endpoint
      setTimeout(() => {
        // Mock user data
        const mockUsers = [
          {
            id: "1",
            email: "admin@example.com",
            created_at: "2023-05-15T10:00:00Z",
            last_sign_in_at: "2023-06-15T10:00:00Z",
            profile: {
              full_name: "مدير النظام",
              role: "admin"
            }
          },
          {
            id: "2",
            email: "ahmad@example.com",
            created_at: "2023-05-16T10:00:00Z",
            last_sign_in_at: "2023-06-14T10:00:00Z",
            profile: {
              full_name: "أحمد محمد",
              role: "user"
            }
          },
          {
            id: "3",
            email: "fatima@example.com",
            created_at: "2023-05-17T10:00:00Z",
            last_sign_in_at: "2023-06-12T10:00:00Z",
            profile: {
              full_name: "فاطمة أحمد",
              role: "user"
            }
          },
          {
            id: "4",
            email: "omar@example.com",
            created_at: "2023-05-18T10:00:00Z",
            last_sign_in_at: "2023-06-10T10:00:00Z",
            profile: {
              full_name: "عمر خالد",
              role: "user"
            }
          },
          {
            id: "5",
            email: "supervisor@example.com",
            created_at: "2023-05-19T10:00:00Z",
            last_sign_in_at: "2023-06-16T10:00:00Z",
            profile: {
              full_name: "مشرف النظام",
              role: "admin"
            }
          }
        ];
        
        setUsers(mockUsers);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("فشل في جلب بيانات المستخدمين");
      setLoading(false);
    }
  };

  useEffect(() => {
    // In a real app with proper backend, use fetchUsers()
    // For demo purposes, we use mockFetchUsers
    mockFetchUsers();
  }, []);

  // Filter users based on search query and role filter
  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = user.email.toLowerCase().includes(searchLower) ||
      user.profile?.full_name?.toLowerCase().includes(searchLower);
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'admin') return matchesSearch && user.profile?.role === 'admin';
    if (filter === 'user') return matchesSearch && user.profile?.role === 'user';
    return matchesSearch;
  });

  // Handle edit user
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      full_name: user.profile?.full_name || "",
      role: user.profile?.role || "user",
    });
    setIsEditDialogOpen(true);
  };

  // Handle delete user
  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  // Save user changes
  const saveUserChanges = async () => {
    if (!selectedUser) return;
    
    try {
      // In a real app, this would update the user's profile
      toast.success("تم تحديث بيانات المستخدم بنجاح");
      
      // Update local state to reflect changes
      setUsers(users.map(u => {
        if (u.id === selectedUser.id) {
          return {
            ...u,
            profile: {
              ...u.profile,
              full_name: editFormData.full_name,
              role: editFormData.role
            }
          };
        }
        return u;
      }));
      
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("فشل في تحديث بيانات المستخدم");
    }
  };

  // Confirm delete user
  const confirmDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      // In a real app, this would delete the user
      toast.success("تم حذف المستخدم بنجاح");
      
      // Update local state to remove the user
      setUsers(users.filter(u => u.id !== selectedUser.id));
      
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("فشل في حذف المستخدم");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">المستخدمين</h1>
        <Button>
          <UserPlus className="ml-2 h-4 w-4" />
          إضافة مستخدم
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilter('all')}>جميع المستخدمين</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('admin')}>المدراء فقط</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('user')}>المستخدمين العاديين</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
      
          <div className="rounded-md border mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المستخدم</TableHead>
                  <TableHead>الدور</TableHead>
                  <TableHead>تاريخ الإنشاء</TableHead>
                  <TableHead>آخر تسجيل دخول</TableHead>
                  <TableHead className="w-[100px]">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex justify-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      لم يتم العثور على مستخدمين.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-bold">
                              {user.profile?.full_name?.charAt(0) || user.email.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div>{user.profile?.full_name || "غير معروف"}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.profile?.role === "admin" ? (
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
                      <TableCell>{format(new Date(user.created_at), "yyyy/MM/dd")}</TableCell>
                      <TableCell>
                        {user.last_sign_in_at ? (
                          format(new Date(user.last_sign_in_at), "yyyy/MM/dd")
                        ) : (
                          <span className="text-muted-foreground">لم يسجل الدخول بعد</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">فتح القائمة</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="ml-2 h-4 w-4" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash className="ml-2 h-4 w-4" />
                              حذف
                            </DropdownMenuItem>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل المستخدم</DialogTitle>
            <DialogDescription>تعديل معلومات المستخدم ودوره.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">الاسم الكامل</label>
              <Input
                id="name"
                value={editFormData.full_name}
                onChange={(e) => setEditFormData({...editFormData, full_name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">الدور</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={editFormData.role === "user" ? "default" : "outline"}
                  onClick={() => setEditFormData({...editFormData, role: "user"})}
                  className="flex-1"
                >
                  <Shield className="ml-2 h-4 w-4" />
                  مستخدم
                </Button>
                <Button
                  type="button"
                  variant={editFormData.role === "admin" ? "default" : "outline"}
                  onClick={() => setEditFormData({...editFormData, role: "admin"})}
                  className="flex-1"
                >
                  <ShieldAlert className="ml-2 h-4 w-4" />
                  مدير
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={saveUserChanges}>
              حفظ التغييرات
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
    </div>
  );
}
