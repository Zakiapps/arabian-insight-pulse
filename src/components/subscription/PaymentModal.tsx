
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowRight, CreditCard, Landmark, MessageCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  planName: string;
  planPrice: number;
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
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handlePayment = async () => {
    setIsLoading(true);
    
    try {
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
          onClose();
          
          // In a real system, save the pending payment request to database
          // await supabase.from('payment_requests').insert({
          //   user_id: user?.id,
          //   plan_id: planId,
          //   amount: planPrice,
          //   payment_method: 'bank_transfer',
          //   status: 'pending'
          // });
          break;
          
        case 'support':
          // Open WhatsApp with predefined message
          const supportPhone = "+962790000000"; // This would come from admin settings
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
          <div className="flex items-center space-x-2 space-x-reverse">
            <RadioGroupItem value="credit_card" id="credit_card" />
            <Label htmlFor="credit_card" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              الدفع بالبطاقة الائتمانية
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <RadioGroupItem value="bank_transfer" id="bank_transfer" />
            <Label htmlFor="bank_transfer" className="flex items-center gap-2">
              <Landmark className="h-4 w-4" />
              التحويل البنكي
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <RadioGroupItem value="support" id="support" />
            <Label htmlFor="support" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              التواصل مع الدعم (WhatsApp)
            </Label>
          </div>
        </RadioGroup>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            إلغاء
          </Button>
          <Button onClick={handlePayment} disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-t-transparent border-white"></span>
                جارٍ المعالجة...
              </>
            ) : (
              <>
                متابعة
                <ArrowRight className="mr-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
