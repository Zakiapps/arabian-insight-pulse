
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

const formSchema = z.object({
  email: z.string().email("عنوان البريد الإلكتروني غير صالح"),
  password: z.string().min(6, "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل"),
});

type FormValues = z.infer<typeof formSchema>;

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Check for verification success in URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('verified') === 'true') {
      toast.success("تم التحقق من البريد الإلكتروني بنجاح! يمكنك الآن تسجيل الدخول.");
    }
  }, [location]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setLoginError(null);

    try {
      const { error, data } = await login(values.email, values.password);
      
      if (error) {
        console.error("فشل تسجيل الدخول:", error);
        setLoginError(error.message || "حدث خطأ أثناء تسجيل الدخول");
        setIsLoading(false);
        return;
      }
      
      if (data) {
        toast.success("تم تسجيل الدخول بنجاح");
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 500);
      }
    } catch (error: any) {
      console.error("فشل تسجيل الدخول:", error);
      setLoginError(error.message || "حدث خطأ أثناء تسجيل الدخول");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4" dir="rtl">
      <div className="w-full max-w-md space-y-6">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-md bg-primary p-2">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">رؤى عربية</h1>
          <p className="text-muted-foreground mt-2">مراقبة وتحليل محتوى وسائل التواصل الاجتماعي العربية</p>
        </div>

        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle>تسجيل الدخول إلى حسابك</CardTitle>
            <CardDescription>
              أدخل بريدك الإلكتروني وكلمة المرور لتسجيل الدخول
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loginError && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4 text-sm">
                {loginError}
              </div>
            )}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>البريد الإلكتروني</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="name@company.com" 
                          {...field} 
                          autoComplete="email"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>كلمة المرور</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          {...field} 
                          autoComplete="current-password"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-t-transparent border-white"></span>
                      جاري تسجيل الدخول...
                    </>
                  ) : "تسجيل الدخول"}
                </Button>
                <div className="text-center text-sm">
                  <p className="text-muted-foreground">
                    للتجربة: استخدم admin@example.com / password
                  </p>
                </div>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="text-center text-sm text-muted-foreground">
              ليس لديك حساب؟{" "}
              <Link to="/register" className="text-primary hover:underline">
                إنشاء حساب جديد
              </Link>
            </div>
            <div className="text-center text-sm">
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                العودة إلى الصفحة الرئيسية
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
