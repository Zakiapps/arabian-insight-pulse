
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowRight, CreditCard, Landmark, MessageCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from "@/integrations/supabase/client";

const SETTINGS_KEY = 'payment_settings';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  planName: string;
  planPrice: number;
}

interface PaymentSettings {
  bank_name: string;
  account_name: string;
  account_number: string;
  iban: string;
  whatsapp_number: string;
  enable_credit_card: boolean;
  enable_bank_transfer: boolean;
  enable_support_contact: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  planId,
  planName,
  planPrice,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'bank_transfer' | 'support'>('credit_card');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    if (isOpen) {
      fetchPaymentSettings();
    }
  }, [isOpen]);
  
  const fetchPaymentSettings = async () => {
    setIsLoadingSettings(true);
    try {
      // Get payment settings from transactions table
      const { data, error } = await supabase
        .from('transactions')
        .select('metadata')
        .eq('payment_method', SETTINGS_KEY)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching payment settings:", error);
        toast.error("تعذر تحميل إعدادات الدفع");
        return;
      }
      
      if (data?.metadata) {
        const settings = typeof data.metadata === 'string' ? JSON.parse(data.metadata) : data.metadata;
        setPaymentSettings(settings);
      } else {
        // Default settings if none found
        setPaymentSettings({
          bank_name: "البنك الأهلي الأردني",
          account_name: "شركة رؤى عربية",
          account_number: "12345678",
          iban: "JO94CBJO0010000000000131000302",
          whatsapp_number: "+962790000000",
          enable_credit_card: true,
          enable_bank_transfer: true,
          enable_support_contact: true
        });
      }
    } catch (error) {
      console.error("Error fetching payment settings:", error);
      toast.error("تعذر تحميل إعدادات الدفع");
    } finally {
      setIsLoadingSettings(false);
    }
  };
  
  // Filter out disabled payment methods
  useEffect(() => {
    if (paymentSettings) {
      // If current selected method is disabled, select first available
      if (
        (paymentMethod === 'credit_card' && !paymentSettings.enable_credit_card) ||
        (paymentMethod === 'bank_transfer' && !paymentSettings.enable_bank_transfer) ||
        (paymentMethod === 'support' && !paymentSettings.enable_support_contact)
      ) {
        if (paymentSettings.enable_credit_card) {
          setPaymentMethod('credit_card');
        } else if (paymentSettings.enable_bank_transfer) {
          setPaymentMethod('bank_transfer');
        } else if (paymentSettings.enable_support_contact) {
          setPaymentMethod('support');
        }
      }
    }
  }, [paymentSettings, paymentMethod]);
  
  const handlePayment = async () => {
    if (!paymentSettings) return;
    
    setIsLoading(true);
    
    try {
      // Save transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user?.id,
          amount: planPrice,
          status: 'pending',
          payment_method: paymentMethod,
          currency: 'USD',
          metadata: {
            plan_id: planId,
            plan_name: planName
          }
        });
        
      if (transactionError) {
        throw transactionError;
      }
      
      switch (paymentMethod) {
        case 'credit_card':
          // Would integrate with Stripe or other payment processor here
          toast.info("سيتم تحويلك لصفحة الدفع بالبطاقة...");
          // redirect to stripe or other payment processor
          setTimeout(() => {
            toast.success("تمت عملية الدفع بنجاح!");
            onClose();
          }, 2000);
          break;
          
        case 'bank_transfer':
          // Show bank transfer instructions
          toast.info("تم إرسال تعليمات التحويل البنكي إلى بريدك الإلكتروني", {
            duration: 5000,
          });
          toast.success(
            <div className="space-y-2">
              <p className="font-bold">معلومات التحويل البنكي:</p>
              <p>البنك: {paymentSettings.bank_name}</p>
              <p>اسم الحساب: {paymentSettings.account_name}</p>
              <p>رقم الحساب: {paymentSettings.account_number}</p>
              <p>رقم الآيبان: {paymentSettings.iban}</p>
              <p className="text-xs text-muted-foreground mt-2">يرجى إرسال إيصال التحويل عبر رسالة واتساب</p>
            </div>,
            {
              duration: 10000,
            }
          );
          onClose();
          break;
          
        case 'support':
          // Open WhatsApp with predefined message
          const supportPhone = paymentSettings.whatsapp_number;
          const message = `مرحبا، أود الاشتراك في خطة ${planName} بقيمة ${planPrice} دولار. معرف المستخدم الخاص بي هو: ${user?.id}`;
          const whatsappUrl = `https://wa.me/${supportPhone}?text=${encodeURIComponent(message)}`;
          window.open(whatsappUrl, '_blank');
          onClose();
          break;
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("حدث خطأ أثناء معالجة الدفع");
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoadingSettings) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[425px]" dir="rtl">
          <div className="flex items-center justify-center p-6">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  if (!paymentSettings) return null;
  
  const availablePaymentMethods = [
    { id: 'credit_card', label: 'الدفع بالبطاقة الائتمانية', icon: CreditCard, enabled: paymentSettings.enable_credit_card },
    { id: 'bank_transfer', label: 'التحويل البنكي', icon: Landmark, enabled: paymentSettings.enable_bank_transfer },
    { id: 'support', label: 'التواصل مع الدعم (WhatsApp)', icon: MessageCircle, enabled: paymentSettings.enable_support_contact }
  ].filter(method => method.enabled);
  
  // If no payment methods are available
  if (availablePaymentMethods.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[425px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>عذراً</DialogTitle>
            <DialogDescription>
              طرق الدفع غير متوفرة حالياً، يرجى المحاولة لاحقاً.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>اختر طريقة الدفع</DialogTitle>
          <DialogDescription>
            أنت تقوم بالاشتراك في {planName} بقيمة {planPrice} دولار
          </DialogDescription>
        </DialogHeader>
        
        <RadioGroup 
          value={paymentMethod} 
          onValueChange={(value) => setPaymentMethod(value as any)} 
          className="grid gap-4 py-4"
        >
          {availablePaymentMethods.map(method => (
            <div key={method.id} className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value={method.id} id={method.id} />
              <Label htmlFor={method.id} className="flex items-center gap-2">
                <method.icon className="h-4 w-4" />
                {method.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            إلغاء
          </Button>
          <Button onClick={handlePayment} disabled={isLoading} className="relative overflow-hidden group">
            <span className="absolute inset-0 bg-primary-dark/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
            {isLoading ? (
              <>
                <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-t-transparent border-white"></span>
                جارٍ المعالجة...
              </>
            ) : (
              <>
                متابعة
                <ArrowRight className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
