
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const AdminRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [credentials] = useState({
    email: "admin@arabinsights.com",
    password: "AdminPass123!",
    fullName: "مدير المنصة"
  });

  const createAdminAccount = async () => {
    setLoading(true);
    try {
      // Sign up the admin user
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.fullName
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Update the profile to set admin role
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', data.user.id);

        if (profileError) throw profileError;

        toast.success("تم إنشاء حساب المدير بنجاح!");
        console.log("Admin account created:", {
          email: credentials.email,
          password: credentials.password,
          userId: data.user.id
        });
      }
    } catch (error: any) {
      console.error("Error creating admin account:", error);
      toast.error(`خطأ في إنشاء الحساب: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>إنشاء حساب المدير</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">البريد الإلكتروني</label>
          <Input value={credentials.email} disabled />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">كلمة المرور</label>
          <Input value={credentials.password} disabled />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">الاسم الكامل</label>
          <Input value={credentials.fullName} disabled />
        </div>
        <Button 
          onClick={createAdminAccount} 
          disabled={loading}
          className="w-full"
        >
          {loading ? "جاري الإنشاء..." : "إنشاء حساب المدير"}
        </Button>
        <div className="text-sm text-muted-foreground">
          <p>بعد إنشاء الحساب، استخدم البيانات التالية لتسجيل الدخول:</p>
          <p>البريد: {credentials.email}</p>
          <p>كلمة المرور: {credentials.password}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminRegistration;
