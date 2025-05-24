
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

const accountFormSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون على الأقل حرفين"),
  email: z.string().email("عنوان البريد الإلكتروني غير صالح"),
  company: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, "كلمة المرور يجب أن تكون على الأقل 8 أحرف").optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: "كلمة المرور الحالية مطلوبة لتعيين كلمة مرور جديدة",
  path: ["currentPassword"],
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

const apiFormSchema = z.object({
  apiKey: z.string().optional(),
  webhookUrl: z.string().url().optional().or(z.literal("")),
  accessLevel: z.enum(["read_only", "read_write"]),
});

const notificationFormSchema = z.object({
  emailNotifications: z.boolean(),
  appNotifications: z.boolean(),
  sentimentAlerts: z.boolean(),
  dialectAlerts: z.boolean(),
  reportGeneration: z.boolean(),
});

const Settings = () => {
  const { user, updateUserProfile } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("account");
  
  // Account form
  const accountForm = useForm<z.infer<typeof accountFormSchema>>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: user?.profile?.full_name || "",
      email: user?.email || "",
      company: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // API form
  const apiForm = useForm<z.infer<typeof apiFormSchema>>({
    resolver: zodResolver(apiFormSchema),
    defaultValues: {
      apiKey: "",
      webhookUrl: "",
      accessLevel: "read_only",
    },
  });

  // Notifications form
  const notificationForm = useForm<z.infer<typeof notificationFormSchema>>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: true,
      appNotifications: true,
      sentimentAlerts: true,
      dialectAlerts: true,
      reportGeneration: true,
    },
  });

  async function onAccountSubmit(values: z.infer<typeof accountFormSchema>) {
    try {
      // Update user profile in Supabase
      if (user) {
        // Update profile name
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ full_name: values.name })
          .eq('id', user.id);
          
        if (profileError) {
          console.error("Error updating profile:", profileError);
          toast.error("حدث خطأ أثناء تحديث الملف الشخصي");
          return;
        }
        
        // Update email if changed
        if (values.email !== user.email) {
          const { error: emailError } = await supabase.auth.updateUser({
            email: values.email,
          });
          
          if (emailError) {
            console.error("Error updating email:", emailError);
            toast.error("حدث خطأ أثناء تحديث البريد الإلكتروني");
            return;
          }
          
          toast.info("تم إرسال رابط تأكيد البريد الإلكتروني الجديد");
        }
        
        // Update password if provided
        if (values.currentPassword && values.newPassword) {
          const { error: passwordError } = await supabase.auth.updateUser({
            password: values.newPassword,
          });
          
          if (passwordError) {
            console.error("Error updating password:", passwordError);
            toast.error("حدث خطأ أثناء تحديث كلمة المرور");
            return;
          }
          
          toast.success("تم تحديث كلمة المرور بنجاح");
          accountForm.setValue("currentPassword", "");
          accountForm.setValue("newPassword", "");
          accountForm.setValue("confirmPassword", "");
        }
        
        // Update local user state
        if (updateUserProfile) {
          updateUserProfile({
            ...user,
            profile: {
              ...user.profile,
              full_name: values.name
            },
            email: values.email
          });
        }
        
        toast.success("تم تحديث إعدادات الحساب!");
      }
    } catch (error) {
      console.error("Account update error:", error);
      toast.error("فشل في تحديث إعدادات الحساب");
    }
  }

  function onApiSubmit(values: z.infer<typeof apiFormSchema>) {
    toast.success("تم تحديث إعدادات API!");
    console.log(values);
  }

  function onNotificationSubmit(values: z.infer<typeof notificationFormSchema>) {
    toast.success("تم تحديث تفضيلات الإشعارات!");
    console.log(values);
  }

  function generateApiKey() {
    // Simulate generating an API key
    const newApiKey = "ak_" + Math.random().toString(36).substring(2, 15);
    apiForm.setValue("apiKey", newApiKey);
    toast.success("تم إنشاء مفتاح API جديد!");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('Settings')}</h1>
        <p className="text-muted-foreground">
          {t('Manage your account settings and preferences')}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="account">{t('Account')}</TabsTrigger>
          <TabsTrigger value="api">{t('API')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('Notifications')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>{t('Account')}</CardTitle>
              <CardDescription>
                {t('Update your personal information and password')}
              </CardDescription>
            </CardHeader>
            <Form {...accountForm}>
              <form onSubmit={accountForm.handleSubmit(onAccountSubmit)}>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={accountForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('Name')}</FormLabel>
                          <FormControl>
                            <Input placeholder="اسمك" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={accountForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('Email')}</FormLabel>
                          <FormControl>
                            <Input placeholder="بريدك الإلكتروني" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={accountForm.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('Company (Optional)')}</FormLabel>
                          <FormControl>
                            <Input placeholder="شركتك" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">{t('Change Password')}</h3>
                    <div className="space-y-4 mt-4">
                      <FormField
                        control={accountForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('Current password')}</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="••••••••" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={accountForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('New password')}</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="••••••••" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                            <FormDescription>
                              {t('Must be at least 8 characters')}
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={accountForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('Confirm new password')}</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="••••••••" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit">{t('Save changes')}</Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
        
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>{t('API Settings')}</CardTitle>
              <CardDescription>
                {t('Manage your API keys and webhooks')}
              </CardDescription>
            </CardHeader>
            <Form {...apiForm}>
              <form onSubmit={apiForm.handleSubmit(onApiSubmit)}>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={apiForm.control}
                      name="apiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('API Key')}</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input 
                                readOnly 
                                {...field} 
                                placeholder={t('No API key generated')}
                              />
                            </FormControl>
                            <Button type="button" onClick={generateApiKey}>
                              {t('Generate')}
                            </Button>
                          </div>
                          <FormDescription>
                            {t('Use this key to access the ArabInsights API')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={apiForm.control}
                      name="accessLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('Access Level')}</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder={t('Select access level')} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="read_only">{t('Read Only')}</SelectItem>
                                <SelectItem value="read_write">{t('Read & Write')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormDescription>
                            {t('Control the level of access for this API key')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={apiForm.control}
                      name="webhookUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('Webhook URL (Optional)')}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://your-server.com/webhook" 
                              {...field} 
                              dir="ltr"
                            />
                          </FormControl>
                          <FormDescription>
                            {t('We\'ll send alert notifications to this URL')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit">{t('Save API settings')}</Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t('Notification Preferences')}</CardTitle>
              <CardDescription>
                {t('Choose how and when you receive notifications')}
              </CardDescription>
            </CardHeader>
            <Form {...notificationForm}>
              <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)}>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">{t('Delivery Methods')}</h3>
                      <div className="space-y-4 mt-4">
                        <FormField
                          control={notificationForm.control}
                          name="emailNotifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>{t('Email Notifications')}</FormLabel>
                                <FormDescription>
                                  {t('Receive notifications via email')}
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationForm.control}
                          name="appNotifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>{t('App Notifications')}</FormLabel>
                                <FormDescription>
                                  {t('Receive notifications in the dashboard')}
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium">{t('Alert Types')}</h3>
                      <div className="space-y-4 mt-4">
                        <FormField
                          control={notificationForm.control}
                          name="sentimentAlerts"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>{t('Sentiment Alerts')}</FormLabel>
                                <FormDescription>
                                  {t('Notify when sentiment thresholds are triggered')}
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationForm.control}
                          name="dialectAlerts"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>{t('Dialect Alerts')}</FormLabel>
                                <FormDescription>
                                  {t('Notify about dialect-specific triggers')}
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationForm.control}
                          name="reportGeneration"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>{t('Report Generation')}</FormLabel>
                                <FormDescription>
                                  {t('Notify when reports are ready for viewing')}
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit">{t('Save notification preferences')}</Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
