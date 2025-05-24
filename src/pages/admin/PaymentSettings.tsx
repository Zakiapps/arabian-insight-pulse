
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const paymentSettingsSchema = z.object({
  bank_name: z.string().min(1, "يجب إدخال اسم البنك"),
  account_name: z.string().min(1, "يجب إدخال اسم صاحب الحساب"),
  account_number: z.string().min(1, "يجب إدخال رقم الحساب"),
  iban: z.string().min(1, "يجب إدخال رقم الآيبان"),
  whatsapp_number: z.string().min(1, "يجب إدخال رقم واتساب للدعم"),
  enable_credit_card: z.boolean(),
  enable_bank_transfer: z.boolean(),
  enable_support_contact: z.boolean(),
});

type PaymentSettingsForm = z.infer<typeof paymentSettingsSchema>;

// We'll store payment settings in system_settings table instead
const SETTINGS_KEY = 'payment_settings';

const PaymentSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<PaymentSettingsForm>({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: {
      bank_name: "",
      account_name: "",
      account_number: "",
      iban: "",
      whatsapp_number: "+962",
      enable_credit_card: true,
      enable_bank_transfer: true,
      enable_support_contact: true,
    }
  });
  
  useEffect(() => {
    const fetchPaymentSettings = async () => {
      try {
        // Store settings in a transaction with a special id for system settings
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('payment_method', SETTINGS_KEY)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          // PGRST116 means no rows returned, not an error for our use case
          console.error("Error fetching payment settings:", error);
          return;
        }
        
        if (data && data.metadata) {
          // Settings are stored in the metadata field as JSON
          const settings = typeof data.metadata === 'string' ? JSON.parse(data.metadata) : data.metadata;
          
          form.reset({
            bank_name: settings.bank_name || "",
            account_name: settings.account_name || "",
            account_number: settings.account_number || "",
            iban: settings.iban || "",
            whatsapp_number: settings.whatsapp_number || "+962",
            enable_credit_card: settings.enable_credit_card !== undefined ? settings.enable_credit_card : true,
            enable_bank_transfer: settings.enable_bank_transfer !== undefined ? settings.enable_bank_transfer : true,
            enable_support_contact: settings.enable_support_contact !== undefined ? settings.enable_support_contact : true,
          });
        }
      } catch (error) {
        console.error("Error fetching payment settings:", error);
      }
    };
    
    fetchPaymentSettings();
  }, [form]);
  
  const onSubmit = async (values: PaymentSettingsForm) => {
    setIsLoading(true);
    
    try {
      // Get the current user's ID
      const currentUser = await supabase.auth.getUser();
      const userId = currentUser.data.user?.id;
      
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      // Store settings in transactions table with a special payment_method
      const { error } = await supabase
        .from('transactions')
        .upsert({
          id: SETTINGS_KEY, // Use a constant string as ID for settings
          user_id: userId,
          amount: 0, // Not a real transaction
          status: 'system',
          payment_method: SETTINGS_KEY,
          currency: 'system',
          metadata: values, // Store settings in metadata field
        });
        
      if (error) throw error;
      
      toast.success("تم حفظ إعدادات الدفع بنجاح");
    } catch (error) {
      console.error("Error saving payment settings:", error);
      toast.error("حدث خطأ أثناء حفظ الإعدادات");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h3 className="text-lg font-medium">إعدادات الدفع</h3>
        <p className="text-sm text-muted-foreground">
          تكوين طرق الدفع وإعدادات المعاملات المالية
        </p>
      </div>
      <Separator />
      
      <Tabs defaultValue="methods">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="methods">طرق الدفع</TabsTrigger>
          <TabsTrigger value="bank">التحويل البنكي</TabsTrigger>
          <TabsTrigger value="support">بيانات الدعم</TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <TabsContent value="methods">
              <Card>
                <CardHeader>
                  <CardTitle>طرق الدفع المتاحة</CardTitle>
                  <CardDescription>
                    إدارة طرق الدفع التي يمكن للمستخدمين استخدامها للاشتراك
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="enable_credit_card"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            الدفع ببطاقة الائتمان
                          </FormLabel>
                          <FormDescription>
                            السماح للمستخدمين بالدفع عبر بطاقات الائتمان
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
                    control={form.control}
                    name="enable_bank_transfer"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            التحويل البنكي
                          </FormLabel>
                          <FormDescription>
                            السماح للمستخدمين بالدفع عبر التحويل البنكي
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
                    control={form.control}
                    name="enable_support_contact"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            التواصل مع الدعم
                          </FormLabel>
                          <FormDescription>
                            السماح للمستخدمين بالتواصل مع الدعم للدفع عبر واتساب
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
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="bank">
              <Card>
                <CardHeader>
                  <CardTitle>معلومات الحساب البنكي</CardTitle>
                  <CardDescription>
                    ادخال معلومات الحساب البنكي للتحويلات المالية
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="bank_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم البنك</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="account_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم صاحب الحساب</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="account_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الحساب</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="iban"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الآيبان (IBAN)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="support">
              <Card>
                <CardHeader>
                  <CardTitle>بيانات التواصل مع الدعم</CardTitle>
                  <CardDescription>
                    إدخال معلومات التواصل للمستخدمين للدفع عبر الدعم
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="whatsapp_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الواتساب للدعم</FormLabel>
                        <FormDescription>
                          يجب أن يتضمن الرقم رمز البلد مثل +962
                        </FormDescription>
                        <FormControl>
                          <Input {...field} dir="ltr" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <div className="mt-6">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-t-transparent border-white"></span>
                    جاري الحفظ...
                  </>
                ) : (
                  "حفظ الإعدادات"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
};

export default PaymentSettings;
