
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ClearPostsButton = () => {
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("all");

  const handleClearPosts = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('clear_user_posts');
      
      if (error) throw error;
      
      toast.success("تم مسح المنشورات بنجاح");
      window.location.reload(); // Refresh to update counts
    } catch (error) {
      console.error('Error clearing posts:', error);
      toast.error("حدث خطأ أثناء مسح المنشورات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Trash className="h-4 w-4" />
          مسح المنشورات
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md" dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash className="h-5 w-5 text-destructive" />
            تأكيد مسح المنشورات
          </AlertDialogTitle>
          <AlertDialogDescription className="text-right">
            هذا الإجراء سيؤدي إلى حذف جميع المنشورات المحللة نهائياً. لا يمكن التراجع عن هذا الإجراء.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">النطاق الزمني:</label>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue placeholder="اختر النطاق الزمني" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المنشورات</SelectItem>
                <SelectItem value="week">آخر أسبوع</SelectItem>
                <SelectItem value="month">آخر شهر</SelectItem>
                <SelectItem value="3months">آخر 3 أشهر</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="destructive">تحذير</Badge>
            </div>
            <p className="text-sm text-destructive">
              سيتم حذف جميع البيانات والتحليلات المرتبطة بالمنشورات المحددة
            </p>
          </div>
        </div>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleClearPosts}
            disabled={loading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                جاري المسح...
              </>
            ) : (
              <>
                <Trash className="h-4 w-4 mr-2" />
                تأكيد المسح
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ClearPostsButton;
