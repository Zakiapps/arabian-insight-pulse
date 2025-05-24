
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2 } from "lucide-react";

// Define form validation schemas
const profileSchema = z.object({
  full_name: z.string().min(2, { message: "الاسم يجب أن يكون على الأقل حرفين" }),
  company: z.string().optional(),
});

const apiSchema = z.object({
  access_level: z.enum(["read", "write"]),
  webhook_url: z.string().url({ message: "يجب إدخال رابط صحيح" }).optional().or(z.literal("")),
});

const notificationSchema = z.object({
  email_notifications: z.boolean(),
  app_notifications: z.boolean(),
  sentiment_alerts: z.boolean(),
  dialect_alerts: z.boolean(),
  report_notifications: z.boolean(),
});

const Settings = () => {
  const { user, updateUserProfile } = useAuth();
  const { t } = useLanguage();
  const [isUpdating, setIsUpdating] = useState(false);
  const [apiKey, setApiKey] = useState("");

  // Profile form
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.profile?.full_name || "",
      company: "",
    },
  });

  // API form
  const apiForm = useForm({
    resolver: zodResolver(apiSchema),
    defaultValues: {
      access_level: "read" as const,
      webhook_url: "",
    },
  });

  // Notification form
  const notificationForm = useForm({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      email_notifications: true,
      app_notifications: true,
      sentiment_alerts: true,
      dialect_alerts: false,
      report_notifications: true,
    },
  });

  const onProfileSubmit = async (data: z.infer<typeof profileSchema>) => {
    setIsUpdating(true);
    try {
      const { error } = await updateUserProfile({
        full_name: data.full_name,
      });
      
      if (error) throw error;
      toast.success("تم تحديث الملف الشخصي بنجاح");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("حدث خطأ أثناء تحديث الملف الشخصي");
    } finally {
      setIsUpdating(false);
    }
  };

  const onApiSubmit = (data: z.infer<typeof apiSchema>) => {
    toast.success("تم حفظ إعدادات API بنجاح");
    console.log(data);
  };

  const onNotificationSubmit = (data: z.infer<typeof notificationSchema>) => {
    toast.success("تم حفظ تفضيلات الإشعارات بنجاح");
    console.log(data);
  };

  const generateApiKey = () => {
    // Simple API key generation for demo purposes
    const key = "api_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setApiKey(key);
    toast.success("تم إنشاء مفتاح API جديد");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('Settings')}</h1>
        <p className="text-muted-foreground">
          {t('Update your personal information and preferences')}
        </p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="account">{t('Account')}</TabsTrigger>
          <TabsTrigger value="api">{t('API')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('Notifications')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>{t('Account Settings')}</CardTitle>
              <CardDescription>
                {t('Update your personal information and password')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  <FormField
                    control={profileForm.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('Name')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('Company (Optional)')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-4 border-t">
                    <CardTitle className="mb-4 text-lg">{t('Change Password')}</CardTitle>
                    <div className="space-y-4">
                      <FormItem>
                        <FormLabel>{t('Current password')}</FormLabel>
                        <FormControl>
                          <Input type="password" />
                        </FormControl>
                      </FormItem>
                      
                      <FormItem>
                        <FormLabel>{t('New password')}</FormLabel>
                        <FormControl>
                          <Input type="password" />
                        </FormControl>
                        <FormDescription>
                          {t('Must be at least 8 characters')}
                        </FormDescription>
                      </FormItem>
                      
                      <FormItem>
                        <FormLabel>{t('Confirm new password')}</FormLabel>
                        <FormControl>
                          <Input type="password" />
                        </FormControl>
                      </FormItem>
                    </div>
                  </div>
                  
                  <Button type="submit" className="mr-auto" disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        {t('Saving...')}
                      </>
                    ) : (
                      t('Save changes')
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
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
            <CardContent>
              <Form {...apiForm}>
                <form onSubmit={apiForm.handleSubmit(onApiSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-base font-semibold">{t('API Key')}</h3>
                      {!apiKey ? (
                        <div className="flex items-center gap-4">
                          <p className="text-sm text-muted-foreground">{t('No API key generated')}</p>
                          <Button type="button" onClick={generateApiKey} variant="outline" size="sm">
                            {t('Generate')}
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between border rounded-md p-2 bg-muted/30">
                            <code className="text-sm font-mono">{apiKey}</code>
                            <Button type="button" onClick={() => {
                              navigator.clipboard.writeText(apiKey);
                              toast.success("تم نسخ مفتاح API");
                            }} variant="ghost" size="sm">
                              نسخ
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {t('Use this key to access the ArabInsights API')}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <FormField
                      control={apiForm.control}
                      name="access_level"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>{t('Access Level')}</FormLabel>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="read"
                                value="read"
                                checked={field.value === "read"}
                                onChange={() => field.onChange("read")}
                                className="h-4 w-4"
                              />
                              <label htmlFor="read" className="text-sm">{t('Read Only')}</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="write"
                                value="write"
                                checked={field.value === "write"}
                                onChange={() => field.onChange("write")}
                                className="h-4 w-4"
                              />
                              <label htmlFor="write" className="text-sm">{t('Read & Write')}</label>
                            </div>
                          </div>
                          <FormDescription>
                            {t('Control the level of access for this API key')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={apiForm.control}
                      name="webhook_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('Webhook URL (Optional)')}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://" />
                          </FormControl>
                          <FormDescription>
                            {t('We\'ll send alert notifications to this URL')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button type="submit">
                    {t('Save API settings')}
                  </Button>
                </form>
              </Form>
            </CardContent>
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
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-semibold mb-2">{t('Delivery Methods')}</h3>
                      <div className="space-y-2">
                        <FormField
                          control={notificationForm.control}
                          name="email_notifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
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
                          name="app_notifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
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
                      <h3 className="text-base font-semibold mb-2">{t('Alert Types')}</h3>
                      <div className="space-y-2">
                        <FormField
                          control={notificationForm.control}
                          name="sentiment_alerts"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
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
                          name="dialect_alerts"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
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
                          name="report_notifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
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
                  
                  <Button type="submit">
                    {t('Save notification preferences')}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
