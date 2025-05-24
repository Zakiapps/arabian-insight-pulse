
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        toast.error('خطأ في تسجيل الدخول: ' + error.message);
      } else {
        console.log('Login successful, waiting for auth state update...');
        toast.success('تم تسجيل الدخول بنجاح');
        // Navigation will happen automatically via useEffect when isAuthenticated becomes true
      }
    } catch (error: any) {
      console.error('Login exception:', error);
      toast.error('حدث خطأ غير متوقع: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state during auth check
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">جاري التحقق من حالة تسجيل الدخول...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">تسجيل الدخول</CardTitle>
          <CardDescription>
            أدخل بياناتك للوصول إلى حسابك
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link to="/signup" className="text-sm text-blue-600 hover:text-blue-500">
              ليس لديك حساب؟ إنشاء حساب جديد
            </Link>
          </div>
          <div className="mt-2 text-center">
            <Link to="/" className="text-sm text-gray-600 hover:text-gray-500">
              العودة إلى الصفحة الرئيسية
            </Link>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-xs text-blue-700 text-center">
              للتجربة: admin@arabinsights.com / password
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;
