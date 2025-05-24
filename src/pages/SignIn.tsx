
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { BarChart3, Eye, EyeOff } from 'lucide-react';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      console.log('User is authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setLoading(true);
    console.log('Attempting login for:', email);

    try {
      const { error } = await login(email, password);
      if (error) {
        console.error('Login error:', error);
        let errorMessage = 'خطأ في تسجيل الدخول';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'بيانات الدخول غير صحيحة';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'يرجى تأكيد البريد الإلكتروني أولاً';
        } else {
          errorMessage = error.message;
        }
        
        toast.error(errorMessage);
      } else {
        console.log('Login successful');
        toast.success('تم تسجيل الدخول بنجاح');
        // Navigation will happen automatically via useEffect
      }
    } catch (error: any) {
      console.error('Login exception:', error);
      toast.error('حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state during auth check
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white" dir="rtl">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-xl bg-gradient-to-br from-primary to-blue-600 p-3">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">جاري التحقق من حالة تسجيل الدخول...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-6">
            <div className="rounded-xl bg-gradient-to-br from-primary to-blue-600 p-3 shadow-lg">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">تسجيل الدخول</CardTitle>
          <CardDescription className="text-lg">
            أدخل بياناتك للوصول إلى حسابك
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-base font-medium">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 h-12 text-base"
                disabled={loading}
                placeholder="admin@arabinsights.com"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-base font-medium">كلمة المرور</Label>
              <div className="relative mt-2">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 text-base pr-12"
                  disabled={loading}
                  placeholder="password"
                />
                <button
                  type="button"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-base bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent ml-2" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                'تسجيل الدخول'
              )}
            </Button>
          </form>
          
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <Link to="/signup" className="text-primary hover:text-primary/80 font-medium">
                ليس لديك حساب؟ إنشاء حساب جديد
              </Link>
            </div>
            <div className="text-center">
              <Link to="/" className="text-gray-600 hover:text-gray-800">
                العودة إلى الصفحة الرئيسية
              </Link>
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 text-center font-medium">
                للتجربة: admin@arabinsights.com / password
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;
