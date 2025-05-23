
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
  DialogFooter,
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
import { MoreHorizontal, Search, CheckCircle, AlertCircle, ReceiptIcon, Download, Eye, ArrowDownUp, CreditCard } from "lucide-react";
import { format } from "date-fns";

interface Transaction {
  id: string;
  user_id: string;
  subscription_id: string | null;
  amount: number;
  currency: string;
  status: string;
  payment_method: string | null;
  created_at: string;
  user?: {
    email: string;
    profile?: {
      full_name: string | null;
    };
  };
  subscription?: {
    plan?: {
      name: string;
    };
  };
}

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fetch transactions with related user and subscription data
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          user:user_id (
            email,
            profile:profiles (
              full_name
            )
          ),
          subscription:subscription_id (
            plan:plan_id (
              name
            )
          )
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setTransactions(data);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  // Mock fetching transactions
  const mockFetchTransactions = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        // Mock transaction data
        const mockTransactions = [
          {
            id: "1",
            user_id: "user-1",
            subscription_id: "sub-1",
            amount: 999,
            currency: "usd",
            status: "succeeded",
            payment_method: "card",
            created_at: "2023-05-01T00:00:00Z",
            user: {
              email: "user1@example.com",
              profile: {
                full_name: "User One"
              }
            },
            subscription: {
              plan: {
                name: "Basic"
              }
            }
          },
          {
            id: "2",
            user_id: "user-2",
            subscription_id: "sub-2",
            amount: 1999,
            currency: "usd",
            status: "succeeded",
            payment_method: "card",
            created_at: "2023-04-15T00:00:00Z",
            user: {
              email: "user2@example.com",
              profile: {
                full_name: "User Two"
              }
            },
            subscription: {
              plan: {
                name: "Premium"
              }
            }
          },
          {
            id: "3",
            user_id: "user-3",
            subscription_id: "sub-3",
            amount: 4999,
            currency: "usd",
            status: "failed",
            payment_method: "card",
            created_at: "2023-05-10T00:00:00Z",
            user: {
              email: "user3@example.com",
              profile: {
                full_name: "User Three"
              }
            },
            subscription: {
              plan: {
                name: "Enterprise"
              }
            }
          },
          {
            id: "4",
            user_id: "user-2",
            subscription_id: null,
            amount: 500,
            currency: "usd",
            status: "succeeded",
            payment_method: "bank_transfer",
            created_at: "2023-05-12T00:00:00Z",
            user: {
              email: "user2@example.com",
              profile: {
                full_name: "User Two"
              }
            }
          }
        ];
        
        setTransactions(mockTransactions);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to fetch transactions");
      setLoading(false);
    }
  };

  useEffect(() => {
    // In a real app with proper backend, use fetchTransactions()
    // For demo purposes, we use mockFetchTransactions
    mockFetchTransactions();
  }, []);

  // Format price to display as currency
  const formatPrice = (price: number, currency: string = "usd") => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(price / 100); // Convert cents to dollars
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "succeeded":
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            ناجح
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            فشل
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            قيد الانتظار
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

  // Get payment method display
  const getPaymentMethod = (method: string | null) => {
    if (!method) return "غير معروف";
    
    switch (method) {
      case "card":
        return "بطاقة ائتمان";
      case "bank_transfer":
        return "تحويل بنكي";
      default:
        return method;
    }
  };

  // View transaction details
  const viewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsViewDialogOpen(true);
  };

  // Toggle sort
  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Sort and filter transactions
  const sortAndFilterTransactions = () => {
    let filtered = [...transactions];
    
    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(transaction => 
        transaction.user?.email.toLowerCase().includes(searchLower) ||
        transaction.user?.profile?.full_name?.toLowerCase().includes(searchLower) ||
        transaction.subscription?.plan?.name?.toLowerCase().includes(searchLower) ||
        transaction.id.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(transaction => transaction.status === statusFilter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "date":
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });
    
    return filtered;
  };

  const filteredTransactions = sortAndFilterTransactions();

  // Export transactions as CSV (mock function)
  const exportTransactions = () => {
    toast.success("Transactions exported successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">المعاملات المالية</h1>
        <Button onClick={exportTransactions}>
          <Download className="mr-2 h-4 w-4" />
          تصدير (CSV)
        </Button>
      </div>
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="بحث عن مستخدم، معرف..."
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
            <SelectItem value="succeeded">ناجح</SelectItem>
            <SelectItem value="failed">فشل</SelectItem>
            <SelectItem value="pending">قيد الانتظار</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المستخدم</TableHead>
              <TableHead>المرجع</TableHead>
              <TableHead>
                <button 
                  onClick={() => toggleSort("date")}
                  className="flex items-center"
                >
                  التاريخ
                  <ArrowDownUp className="ml-2 h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>
                <button 
                  onClick={() => toggleSort("amount")}
                  className="flex items-center"
                >
                  المبلغ
                  <ArrowDownUp className="ml-2 h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>طريقة الدفع</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="w-[100px]">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  لم يتم العثور على معاملات.
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map(transaction => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div>
                      <div>{transaction.user?.profile?.full_name || "غير معروف"}</div>
                      <div className="text-sm text-muted-foreground">{transaction.user?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {transaction.subscription_id ? (
                      <div>
                        <div>{transaction.subscription.plan?.name}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[120px]">
                          #{transaction.id.substring(0, 8)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground truncate max-w-[120px]">
                        #{transaction.id.substring(0, 8)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(transaction.created_at), "yyyy/MM/dd")}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatPrice(transaction.amount, transaction.currency)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      {getPaymentMethod(transaction.payment_method)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(transaction.status)}
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
                        <DropdownMenuItem onClick={() => viewTransaction(transaction)}>
                          <Eye className="mr-2 h-4 w-4" />
                          عرض التفاصيل
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.success("Receipt generated")}>
                          <ReceiptIcon className="mr-2 h-4 w-4" />
                          إنشاء إيصال
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

      {/* View Transaction Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>تفاصيل المعاملة</DialogTitle>
            <DialogDescription>
              عرض تفاصيل كاملة للمعاملة المالية.
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">الحالة:</span>
                {getStatusBadge(selectedTransaction.status)}
              </div>
              
              <div className="grid gap-2">
                <h3 className="text-sm font-medium">معلومات المعاملة</h3>
                <div className="bg-muted p-3 rounded-md space-y-1">
                  <div><span className="font-semibold">المعرف:</span> {selectedTransaction.id}</div>
                  <div><span className="font-semibold">المبلغ:</span> {formatPrice(selectedTransaction.amount, selectedTransaction.currency)}</div>
                  <div><span className="font-semibold">العملة:</span> {selectedTransaction.currency.toUpperCase()}</div>
                  <div><span className="font-semibold">طريقة الدفع:</span> {getPaymentMethod(selectedTransaction.payment_method)}</div>
                  <div><span className="font-semibold">التاريخ:</span> {format(new Date(selectedTransaction.created_at), "yyyy/MM/dd HH:mm:ss")}</div>
                </div>
              </div>
              
              <div className="grid gap-2">
                <h3 className="text-sm font-medium">معلومات المستخدم</h3>
                <div className="bg-muted p-3 rounded-md">
                  <div><span className="font-semibold">الاسم:</span> {selectedTransaction.user?.profile?.full_name}</div>
                  <div><span className="font-semibold">البريد الإلكتروني:</span> {selectedTransaction.user?.email}</div>
                </div>
              </div>
              
              {selectedTransaction.subscription_id && (
                <div className="grid gap-2">
                  <h3 className="text-sm font-medium">معلومات الاشتراك</h3>
                  <div className="bg-muted p-3 rounded-md">
                    <div><span className="font-semibold">الخطة:</span> {selectedTransaction.subscription?.plan?.name}</div>
                    <div><span className="font-semibold">معرف الاشتراك:</span> {selectedTransaction.subscription_id}</div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              إغلاق
            </Button>
            <Button onClick={() => toast.success("Receipt generated")}>
              <ReceiptIcon className="mr-2 h-4 w-4" />
              إنشاء إيصال
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
