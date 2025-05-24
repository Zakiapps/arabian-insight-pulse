import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, CheckCircle, Tag, Pencil, X, Check } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  is_active: boolean;
}

export default function AdminPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [planFormData, setPlanFormData] = useState({
    name: "",
    description: "",
    price_monthly: 0,
    price_yearly: 0,
    features: [""],
    is_active: true,
  });

  // Fetch plans from Supabase
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("price_monthly", { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        // Parse JSON features to string array
        const parsedPlans = data.map(plan => ({
          ...plan,
          features: Array.isArray(plan.features) ? 
            plan.features.map(feature => String(feature)) : []
        }));
        setPlans(parsedPlans);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("فشل في جلب الخطط");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Format price to display as currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price / 100);
  };

  // Handle create plan
  const handleCreatePlan = () => {
    setPlanFormData({
      name: "",
      description: "",
      price_monthly: 0,
      price_yearly: 0,
      features: [""],
      is_active: true,
    });
    setIsCreateDialogOpen(true);
  };

  // Handle edit plan
  const handleEditPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setPlanFormData({
      name: plan.name,
      description: plan.description || "",
      price_monthly: plan.price_monthly,
      price_yearly: plan.price_yearly,
      features: [...plan.features, ""], // Add empty item for adding new features
      is_active: plan.is_active,
    });
    setIsEditDialogOpen(true);
  };

  // Add feature
  const addFeature = () => {
    setPlanFormData({
      ...planFormData,
      features: [...planFormData.features, ""]
    });
  };

  // Update feature
  const updateFeature = (index: number, value: string) => {
    const updatedFeatures = [...planFormData.features];
    updatedFeatures[index] = value;
    setPlanFormData({
      ...planFormData,
      features: updatedFeatures
    });
  };

  // Remove feature
  const removeFeature = (index: number) => {
    const updatedFeatures = planFormData.features.filter((_, i) => i !== index);
    setPlanFormData({
      ...planFormData,
      features: updatedFeatures
    });
  };

  // Save plan to Supabase
  const savePlan = async (isNew: boolean) => {
    try {
      // Filter out empty features
      const filteredFeatures = planFormData.features.filter(f => f.trim() !== "");
      
      const planData = {
        name: planFormData.name,
        description: planFormData.description,
        price_monthly: planFormData.price_monthly,
        price_yearly: planFormData.price_yearly,
        features: filteredFeatures,
        is_active: planFormData.is_active
      };

      if (isNew) {
        const { error } = await supabase
          .from('subscription_plans')
          .insert(planData);

        if (error) throw error;
        
        toast.success("تم إنشاء الخطة بنجاح");
        setIsCreateDialogOpen(false);
      } else if (selectedPlan) {
        const { error } = await supabase
          .from('subscription_plans')
          .update(planData)
          .eq('id', selectedPlan.id);

        if (error) throw error;
        
        toast.success("تم تحديث الخطة بنجاح");
        setIsEditDialogOpen(false);
      }

      fetchPlans(); // Refresh the plans list
    } catch (error) {
      console.error("Error saving plan:", error);
      toast.error("فشل في حفظ الخطة");
    }
  };

  // Toggle plan active status
  const togglePlanStatus = async (plan: Plan) => {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .update({ is_active: !plan.is_active })
        .eq('id', plan.id);

      if (error) throw error;
      
      toast.success(`تم ${plan.is_active ? "إلغاء تفعيل" : "تفعيل"} الخطة بنجاح`);
      fetchPlans(); // Refresh the plans list
    } catch (error) {
      console.error("Error toggling plan status:", error);
      toast.error("فشل في تحديث حالة الخطة");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">خطط الاشتراك</h1>
        <Button onClick={handleCreatePlan}>
          <Plus className="mr-2 h-4 w-4" />
          إضافة خطة
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">لا توجد خطط اشتراك بعد.</p>
          <Button variant="outline" onClick={handleCreatePlan} className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            إضافة خطة
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map(plan => (
            <Card key={plan.id} className={!plan.is_active ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      {plan.name}
                      {!plan.is_active && (
                        <Badge variant="outline" className="ml-2">
                          غير نشط
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => handleEditPlan(plan)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">الدفع الشهري</span>
                  <span className="text-xl font-bold">{formatPrice(plan.price_monthly)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">الدفع السنوي</span>
                  <div className="text-right">
                    <div className="text-xl font-bold">{formatPrice(plan.price_yearly)}</div>
                    <div className="text-sm text-muted-foreground">
                      (توفير {formatPrice(plan.price_monthly * 12 - plan.price_yearly)})
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">المميزات:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`active-${plan.id}`}
                      checked={plan.is_active}
                      onCheckedChange={() => togglePlanStatus(plan)}
                    />
                    <Label htmlFor={`active-${plan.id}`}>
                      {plan.is_active ? "نشط" : "غير نشط"}
                    </Label>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleEditPlan(plan)}>
                    <Edit className="mr-2 h-4 w-4" />
                    تعديل
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create Plan Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>إنشاء خطة جديدة</DialogTitle>
            <DialogDescription>
              قم بإنشاء خطة اشتراك جديدة وتحديد سعرها ومميزاتها.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            
            <div className="grid gap-2">
              <Label htmlFor="plan-name">اسم الخطة</Label>
              <Input
                id="plan-name"
                value={planFormData.name}
                onChange={(e) => setPlanFormData({...planFormData, name: e.target.value})}
                placeholder="مثال: الخطة الأساسية"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="plan-description">وصف الخطة</Label>
              <Textarea
                id="plan-description"
                value={planFormData.description}
                onChange={(e) => setPlanFormData({...planFormData, description: e.target.value})}
                placeholder="وصف موجز للخطة"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="monthly-price">السعر الشهري (USD)</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                  <Input
                    id="monthly-price"
                    type="number"
                    value={planFormData.price_monthly / 100}
                    onChange={(e) => setPlanFormData({...planFormData, price_monthly: Math.round(parseFloat(e.target.value) * 100)})}
                    className="pl-7"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="yearly-price">السعر السنوي (USD)</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                  <Input
                    id="yearly-price"
                    type="number"
                    value={planFormData.price_yearly / 100}
                    onChange={(e) => setPlanFormData({...planFormData, price_yearly: Math.round(parseFloat(e.target.value) * 100)})}
                    className="pl-7"
                  />
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>المميزات</Label>
                <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                  <Plus className="h-4 w-4 mr-1" />
                  إضافة ميزة
                </Button>
              </div>
              <div className="space-y-2">
                {planFormData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder="وصف الميزة"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFeature(index)}
                      disabled={planFormData.features.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="plan-active"
                checked={planFormData.is_active}
                onCheckedChange={(checked) => setPlanFormData({...planFormData, is_active: checked})}
              />
              <Label htmlFor="plan-active">خطة نشطة</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={() => savePlan(true)}>
              إنشاء الخطة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>تعديل الخطة</DialogTitle>
            <DialogDescription>
              قم بتعديل تفاصيل الخطة وسعرها ومميزاتها.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            
            <div className="grid gap-2">
              <Label htmlFor="edit-plan-name">اسم الخطة</Label>
              <Input
                id="edit-plan-name"
                value={planFormData.name}
                onChange={(e) => setPlanFormData({...planFormData, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-plan-description">وصف الخطة</Label>
              <Textarea
                id="edit-plan-description"
                value={planFormData.description}
                onChange={(e) => setPlanFormData({...planFormData, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-monthly-price">السعر الشهري (USD)</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                  <Input
                    id="edit-monthly-price"
                    type="number"
                    value={planFormData.price_monthly / 100}
                    onChange={(e) => setPlanFormData({...planFormData, price_monthly: Math.round(parseFloat(e.target.value) * 100)})}
                    className="pl-7"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-yearly-price">السعر السنوي (USD)</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                  <Input
                    id="edit-yearly-price"
                    type="number"
                    value={planFormData.price_yearly / 100}
                    onChange={(e) => setPlanFormData({...planFormData, price_yearly: Math.round(parseFloat(e.target.value) * 100)})}
                    className="pl-7"
                  />
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>المميزات</Label>
                <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                  <Plus className="h-4 w-4 mr-1" />
                  إضافة ميزة
                </Button>
              </div>
              <div className="space-y-2">
                {planFormData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder="وصف الميزة"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFeature(index)}
                      disabled={planFormData.features.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-plan-active"
                checked={planFormData.is_active}
                onCheckedChange={(checked) => setPlanFormData({...planFormData, is_active: checked})}
              />
              <Label htmlFor="edit-plan-active">خطة نشطة</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={() => savePlan(false)}>
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
