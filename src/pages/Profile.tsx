
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Shield, Calendar, Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const { profile, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: user?.email || '',
  });

  const handleSave = () => {
    // Here you would typically make an API call to update the profile
    toast.success("تم تحديث الملف الشخصي بنجاح");
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">الملف الشخصي</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="gap-2">
            <Edit2 className="h-4 w-4" />
            تعديل الملف الشخصي
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              حفظ
            </Button>
            <Button variant="outline" onClick={handleCancel} className="gap-2">
              <X className="h-4 w-4" />
              إلغاء
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="text-2xl">
                  {profile?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-xl">{profile?.full_name || 'مستخدم'}</CardTitle>
            <div className="flex justify-center">
              <Badge variant={profile?.role === 'admin' ? 'destructive' : 'secondary'}>
                {profile?.role === 'admin' ? 'مدير النظام' : 'مستخدم'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">تاريخ الانضمام:</span>
                <span>{new Date(user?.created_at || '').toLocaleDateString('ar-SA')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">الحالة:</span>
                <Badge variant="outline" className="text-green-600">
                  نشط
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              المعلومات الشخصية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">الاسم الكامل</Label>
                {isEditing ? (
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  />
                ) : (
                  <div className="px-3 py-2 border rounded-md bg-muted/50">
                    {profile?.full_name || 'غير محدد'}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div className="px-3 py-2 border rounded-md bg-muted/50 flex-1">
                    {user?.email || 'غير محدد'}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>الدور</Label>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <Badge variant={profile?.role === 'admin' ? 'destructive' : 'secondary'}>
                    {profile?.role === 'admin' ? 'مدير النظام' : 'مستخدم عادي'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>معرف المستخدم</Label>
                <div className="px-3 py-2 border rounded-md bg-muted/50 font-mono text-sm">
                  {user?.id || 'غير متوفر'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            الأمان والخصوصية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">تغيير كلمة المرور</p>
                <p className="text-sm text-muted-foreground">قم بتحديث كلمة المرور لحماية حسابك</p>
              </div>
              <Button variant="outline">
                تغيير كلمة المرور
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">المصادقة الثنائية</p>
                <p className="text-sm text-muted-foreground">أضف طبقة حماية إضافية لحسابك</p>
              </div>
              <Button variant="outline" disabled>
                قريباً
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
