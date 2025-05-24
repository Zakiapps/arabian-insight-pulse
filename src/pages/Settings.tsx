
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
  company: z.string().optional(),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, {
    message: "Current password is required.",
  }),
  newPassword: z.string().min(8, {
    message: "New password must be at least 8 characters.",
  }),
  confirmPassword: z.string().min(8, {
    message: "Please confirm your new password.",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const apiFormSchema = z.object({
  accessLevel: z.enum(["read", "write"]),
  webhookUrl: z.string().url({
    message: "Please enter a valid URL.",
  }).optional().or(z.literal("")),
});

const notificationSchema = z.object({
  emailNotifications: z.boolean().default(false),
  appNotifications: z.boolean().default(true),
  sentimentAlerts: z.boolean().default(true),
  dialectAlerts: z.boolean().default(false),
  reportNotifications: z.boolean().default(true),
});

export default function Settings() {
  const { t } = useLanguage();
  const { user, profile, updateUserProfile } = useAuth();
  const [apiKey, setApiKey] = useState<string | null>(null);
  
  // Profile form
  const profileForm = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
    },
  });

  // Password form
  const passwordForm = useForm({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // API form
  const apiForm = useForm({
    resolver: zodResolver(apiFormSchema),
    defaultValues: {
      accessLevel: "read" as const, // Fix the type issue by explicitly typing as const
      webhookUrl: "",
    },
  });

  // Notifications form
  const notificationsForm = useForm({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: false,
      appNotifications: true,
      sentimentAlerts: true,
      dialectAlerts: false,
      reportNotifications: true,
    },
  });

  useEffect(() => {
    // Set form values once profile is loaded
    if (profile && user) {
      profileForm.reset({
        name: profile.full_name || "",
        email: user.email || "",
        company: "",
      });
    }
  }, [profile, user]);

  const onProfileSubmit = async (data: z.infer<typeof profileFormSchema>) => {
    try {
      const { error } = await updateUserProfile({
        full_name: data.name
      });

      if (error) throw error;
      
      toast.success(t('Profile updated successfully'));
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('Failed to update profile'));
    }
  };

  const onPasswordSubmit = async (data: z.infer<typeof passwordFormSchema>) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) throw error;
      
      toast.success(t('Password updated successfully'));
      passwordForm.reset();
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(t('Failed to update password'));
    }
  };

  const generateApiKey = () => {
    // Generate random API key
    const newApiKey = Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    
    setApiKey(newApiKey);
    toast.success(t('API key generated successfully'));
  };

  const onApiSubmit = (data: z.infer<typeof apiFormSchema>) => {
    toast.success(t('API settings saved successfully'));
    console.log('API Form data:', data);
  };

  const onNotificationSubmit = (data: z.infer<typeof notificationSchema>) => {
    toast.success(t('Notification preferences saved'));
    console.log('Notification Form data:', data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('Settings')}</h1>
        <p className="text-muted-foreground">
          {t('Manage your account settings and preferences')}
        </p>
      </div>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">{t('Account')}</TabsTrigger>
          <TabsTrigger value="api">{t('API')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('Notifications')}</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-4">
          {/* Profile Form */}
          <Card>
            <CardHeader>
              <CardTitle>{t('Profile')}</CardTitle>
              <CardDescription>
                {t('Update your personal information and password')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('Name')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('Your name')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('Email')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('Your email')} {...field} disabled />
                        </FormControl>
                        <FormDescription>
                          {t('Email cannot be changed')}
                        </FormDescription>
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
                          <Input placeholder={t('Your company')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit">{t('Save changes')}</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          {/* Password Form */}
          <Card>
            <CardHeader>
              <CardTitle>{t('Change Password')}</CardTitle>
              <CardDescription>
                {t('Update your password')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('Current password')}</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('New password')}</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormDescription>
                          {t('Must be at least 8 characters')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('Confirm new password')}</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit">{t('Change Password')}</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('API Settings')}</CardTitle>
              <CardDescription>
                {t('Manage your API keys and webhooks')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">{t('API Key')}</h3>
                <div className="flex items-center justify-between">
                  <div className="font-mono bg-muted p-2 rounded-md flex-1 mr-2 overflow-auto">
                    {apiKey ? apiKey : t('No API key generated')}
                  </div>
                  <Button onClick={generateApiKey} variant="outline" size="sm">
                    {t('Generate')}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('Use this key to access the ArabInsights API')}
                </p>
              </div>
              
              <Form {...apiForm}>
                <form onSubmit={apiForm.handleSubmit(onApiSubmit)} className="space-y-4">
                  <FormField
                    control={apiForm.control}
                    name="accessLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('Access Level')}</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('Select access level')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="read">{t('Read Only')}</SelectItem>
                            <SelectItem value="write">{t('Read & Write')}</SelectItem>
                          </SelectContent>
                        </Select>
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
                          <Input placeholder="https://your-server.com/webhook" {...field} />
                        </FormControl>
                        <FormDescription>
                          {t('We\'ll send alert notifications to this URL')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit">{t('Save API settings')}</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('Notification Preferences')}</CardTitle>
              <CardDescription>
                {t('Choose how and when you receive notifications')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...notificationsForm}>
                <form onSubmit={notificationsForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">{t('Delivery Methods')}</h3>
                    
                    <FormField
                      control={notificationsForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3 border rounded-md">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              {t('Email Notifications')}
                            </FormLabel>
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
                      control={notificationsForm.control}
                      name="appNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3 border rounded-md">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              {t('App Notifications')}
                            </FormLabel>
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
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">{t('Alert Types')}</h3>
                    
                    <FormField
                      control={notificationsForm.control}
                      name="sentimentAlerts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3 border rounded-md">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              {t('Sentiment Analysis')}
                            </FormLabel>
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
                      control={notificationsForm.control}
                      name="dialectAlerts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3 border rounded-md">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              {t('Dialect Detection')}
                            </FormLabel>
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
                      control={notificationsForm.control}
                      name="reportNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3 border rounded-md">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              {t('Report Generation')}
                            </FormLabel>
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
                  
                  <Button type="submit">{t('Save notification preferences')}</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
