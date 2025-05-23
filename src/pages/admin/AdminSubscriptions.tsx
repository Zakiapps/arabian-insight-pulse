
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { MoreHorizontal, Search, CheckCircle, AlertCircle, RotateCw, Calendar, Download, Ban, Eye, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface UserProfile {
  full_name: string | null;
}

interface UserData {
  email: string;
  profile?: UserProfile;
}

interface PlanData {
  name: string;
  price_monthly: number;
}

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at: string | null;
  created_at: string;
  user?: UserData | null;
  plan?: PlanData | null;
}

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  // Fetch subscriptions with related user and plan data
  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select(`
          *,
          user:user_id (
            email,
            profile:profiles (
              full_name
            )
          ),
          plan:plan_id (
            name,
            price_monthly
          )
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        // Transform data to match our interface
        const formattedSubscriptions = data.map(item => {
          // Handle potential errors in the joined data
          const userObj = item.user && typeof item.user === 'object' ? item.user : null;
          const user = userObj ? {
            email: 'email' in userObj ? String(userObj.email) || '' : '',
            profile: {
              full_name: userObj && 
                        userObj.profile && 
                        typeof userObj.profile === 'object' && 
                        'full_name' in userObj.profile ? 
                        String(userObj.profile.full_name) || null : null
            }
          } : {
            email: 'Unknown',
            profile: { full_name: null }
          };
          
          const plan = item.plan && typeof item.plan === 'object' ? {
            name: item.plan.name || 'Unknown Plan',
            price_monthly: item.plan.price_monthly || 0
          } : {
            name: 'Unknown Plan',
            price_monthly: 0
          };
          
          return {
            ...item,
            user,
            plan
          };
        });
        
        setSubscriptions(formattedSubscriptions);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast.error("Failed to fetch subscriptions");
    } finally {
      setLoading(false);
    }
  };

  // Mock fetching subscriptions
  const mockFetchSubscriptions = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        // Mock subscription data
        const mockSubscriptions = [
          {
            id: "1",
            user_id: "user-1",
            plan_id: "plan-1",
            status: "active",
            current_period_start: "2023-05-01T00:00:00Z",
            current_period_end: "2023-06-01T00:00:00Z",
            cancel_at: null,
            created_at: "2023-05-01T00:00:00Z",
            user: {
              email: "user1@example.com",
              profile: {
                full_name: "User One"
              }
            },
            plan: {
              name: "Basic",
              price_monthly: 999
            }
          },
          {
            id: "2",
            user_id: "user-2",
            plan_id: "plan-2",
            status: "canceled",
            current_period_start: "2023-04-15T00:00:00Z",
            current_period_end: "2023-05-15T00:00:00Z",
            cancel_at: "2023-05-15T00:00:00Z",
            created_at: "2023-04-15T00:00:00Z",
            user: {
              email: "user2@example.com",
              profile: {
                full_name: "User Two"
              }
            },
            plan: {
              name: "Premium",
              price_monthly: 1999
            }
          },
          {
            id: "3",
            user_id: "user-3",
            plan_id: "plan-3",
            status: "past_due",
            current_period_start: "2023-05-10T00:00:00Z",
            current_period_end: "2023-06-10T00:00:00Z",
            cancel_at: null,
            created_at: "2023-05-10T00:00:00Z",
            user: {
              email: "user3@example.com",
              profile: {
                full_name: "User Three"
              }
            },
            plan: {
              name: "Enterprise",
              price_monthly: 4999
            }
          }
        ];
        
        setSubscriptions(mockSubscriptions as Subscription[]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast.error("Failed to fetch subscriptions");
      setLoading(false);
    }
  };

  useEffect(() => {
    // In a real app with proper backend, use fetchSubscriptions()
    // For demo purposes, we use mockFetchSubscriptions
    mockFetchSubscriptions();
  }, []);

  // Format price to display as currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price / 100); // Convert cents to dollars
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            نشط
          </Badge>
        );
      case "past_due":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            متأخر السداد
          </Badge>
        );
      case "canceled":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Ban className="h-3 w-3" />
            ملغي
          </Badge>
        );
      case "trialing":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 flex items-center gap-1">
            <RotateCw className="h-3 w-3" />
            فترة تجريبية
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            {status}
          </Badge>
        );
    }
  };

  // View subscription details
  const viewSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsViewDialogOpen(true);
  };

  // Handle renew subscription
  const handleRenewSubscription = async (subscription: Subscription) => {
    try {
      // In a real app, this would call a backend API to renew the subscription
      // For demo, update the local state
      const updatedSubscriptions = subscriptions.map(sub => {
        if (sub.id === subscription.id) {
          // Extend by one month
          const currentEnd = new Date(subscription.current_period_end);
          const newEnd = new Date(currentEnd);
          newEnd.setMonth(currentEnd.getMonth() + 1);
          
          return {
            ...sub,
            status: "active",
            cancel_at: null,
            current_period_end: newEnd.toISOString()
          };
        }
        return sub;
      });
      
      setSubscriptions(updatedSubscriptions);
      
      if (selectedSubscription?.id === subscription.id) {
        const updatedSubscription = updatedSubscriptions.find(sub => sub.id === subscription.id);
        if (updatedSubscription) {
          setSelectedSubscription(updatedSubscription);
        }
      }
      
      toast.success("Subscription renewed successfully");
    } catch (error) {
      console.error("Error renewing subscription:", error);
      toast.error("Failed to renew subscription");
    }
  };

  // Handle cancel subscription
  const handleCancelSubscription = async (subscription: Subscription) => {
    try {
      // In a real app, this would call a backend API to cancel the subscription
      // For demo, update the local state
      const updatedSubscriptions = subscriptions.map(sub => {
        if (sub.id === subscription.id) {
          return {
            ...sub,
            status: "canceled",
            cancel_at: new Date().toISOString()
          };
        }
        return sub;
      });
      
      setSubscriptions(updatedSubscriptions);
      
      if (selectedSubscription?.id === subscription.id) {
        const updatedSubscription = updatedSubscriptions.find(sub => sub.id === subscription.id);
        if (updatedSubscription) {
          setSelectedSubscription(updatedSubscription);
        }
      }
      
      toast.success("Subscription canceled successfully");
    } catch (error) {
      console.error("Error canceling subscription:", error);
      toast.error("Failed to cancel subscription");
    }
  };

  // Filter subscriptions based on search and status filter
  const filteredSubscriptions = subscriptions.filter(subscription => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (subscription.user?.email?.toLowerCase().includes(searchLower) ?? false) ||
      (subscription.user?.profile?.full_name?.toLowerCase().includes(searchLower) ?? false) ||
      (subscription.plan?.name?.toLowerCase().includes(searchLower) ?? false);
    
    const matchesStatus = statusFilter === "all" || subscription.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Export subscriptions as CSV (mock function)
  const exportSubscriptions = () => {
    toast.success("Subscriptions exported successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">الاشتراكات</h1>
        <Button onClick={exportSubscriptions}>
          <Download className="mr-2 h-4 w-4" />
          تصدير (CSV)
        </Button>
      </div>
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="بحث عن مستخدم، خطة..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-[180px]">
            <SelectValue placeholder="تصفية حسب الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="active">نشط</SelectItem>
            <SelectItem value="past_due">متأخر السداد</SelectItem>
            <SelectItem value="canceled">ملغي</SelectItem>
            <SelectItem value="trialing">فترة تجريبية</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المستخدم</TableHead>
              <TableHead>الخطة</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>تاريخ البدء</TableHead>
              <TableHead>تاريخ الانتهاء</TableHead>
              <TableHead className="w-[100px]">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredSubscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  لم يتم العثور على اشتراكات.
                </TableCell>
              </TableRow>
            ) : (
              filteredSubscriptions.map(subscription => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <div>
                      <div>{subscription.user?.profile?.full_name || "غير معروف"}</div>
                      <div className="text-sm text-muted-foreground">{subscription.user?.email || "بريد غير معروف"}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{subscription.plan?.name || "خطة غير معروفة"}</div>
                      <div className="text-sm text-muted-foreground">{formatPrice(subscription.plan?.price_monthly || 0)} / شهرياً</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(subscription.status)}
                  </TableCell>
                  <TableCell>
                    {format(new Date(subscription.current_period_start), "yyyy/MM/dd")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(subscription.current_period_end), "yyyy/MM/dd")}
                    </div>
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
                        <DropdownMenuItem onClick={() => viewSubscription(subscription)}>
                          <Eye className="mr-2 h-4 w-4" />
                          عرض التفاصيل
                        </DropdownMenuItem>
                        {subscription.status !== "active" && (
                          <DropdownMenuItem onClick={() => handleRenewSubscription(subscription)}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            تجديد الاشتراك
                          </DropdownMenuItem>
                        )}
                        {subscription.status === "active" && (
                          <DropdownMenuItem onClick={() => handleCancelSubscription(subscription)}>
                            <Ban className="mr-2 h-4 w-4" />
                            إلغاء الاشتراك
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

      {/* View Subscription Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>تفاصيل الاشتراك</DialogTitle>
            <DialogDescription>
              عرض تفاصيل كاملة للاشتراك وسجل المدفوعات.
            </DialogDescription>
          </DialogHeader>
          {selectedSubscription && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">الحالة:</span>
                {getStatusBadge(selectedSubscription.status)}
              </div>
              
              <div className="grid gap-2">
                <h3 className="text-sm font-medium">معلومات المستخدم</h3>
                <div className="bg-muted p-3 rounded-md">
                  <div><span className="font-semibold">الاسم:</span> {selectedSubscription.user?.profile?.full_name || "غير معروف"}</div>
                  <div><span className="font-semibold">البريد الإلكتروني:</span> {selectedSubscription.user?.email || "غير معروف"}</div>
                </div>
              </div>
              
              <div className="grid gap-2">
                <h3 className="text-sm font-medium">معلومات الخطة</h3>
                <div className="bg-muted p-3 rounded-md">
                  <div><span className="font-semibold">الخطة:</span> {selectedSubscription.plan?.name || "غير معروفة"}</div>
                  <div><span className="font-semibold">السعر:</span> {formatPrice(selectedSubscription.plan?.price_monthly || 0)} / شهرياً</div>
                </div>
              </div>
              
              <div className="grid gap-2">
                <h3 className="text-sm font-medium">التواريخ</h3>
                <div className="bg-muted p-3 rounded-md space-y-1">
                  <div><span className="font-semibold">تاريخ الإنشاء:</span> {format(new Date(selectedSubscription.created_at), "yyyy/MM/dd")}</div>
                  <div><span className="font-semibold">بداية الفترة الحالية:</span> {format(new Date(selectedSubscription.current_period_start), "yyyy/MM/dd")}</div>
                  <div><span className="font-semibold">نهاية الفترة الحالية:</span> {format(new Date(selectedSubscription.current_period_end), "yyyy/MM/dd")}</div>
                  {selectedSubscription.cancel_at && (
                    <div><span className="font-semibold">تاريخ الإلغاء:</span> {format(new Date(selectedSubscription.cancel_at), "yyyy/MM/dd")}</div>
                  )}
                </div>
              </div>
              
              <div className="grid gap-2">
                <h3 className="text-sm font-medium">سجل المدفوعات</h3>
                <div className="bg-muted p-3 rounded-md space-y-1 text-center">
                  <p className="text-muted-foreground">سيظهر سجل المدفوعات هنا</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="space-x-2">
            {selectedSubscription && selectedSubscription.status !== "active" && (
              <Button onClick={() => handleRenewSubscription(selectedSubscription)}>
                <RefreshCw className="mr-2 h-4 w-4" />
                تجديد الاشتراك
              </Button>
            )}
            {selectedSubscription && selectedSubscription.status === "active" && (
              <Button variant="destructive" onClick={() => handleCancelSubscription(selectedSubscription)}>
                <Ban className="mr-2 h-4 w-4" />
                إلغاء الاشتراك
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
