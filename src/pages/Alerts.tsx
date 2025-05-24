
import { useState, useEffect } from "react";
import { Plus, Bell, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext"; 
import { supabase } from "@/integrations/supabase/client";

type Alert = {
  id: string;
  name: string;
  metric: string;
  condition: string;
  value: number;
  timeframe: string;
  keyword?: string;
  active: boolean;
  notifyVia: string;
  dialectValue?: string;
  user_id?: string;
};

const Alerts = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [newAlertOpen, setNewAlertOpen] = useState(false);
  const [newAlert, setNewAlert] = useState<Partial<Alert>>({
    metric: "sentiment",
    condition: "above",
    value: 50,
    timeframe: "hour",
    keyword: "",
    active: true,
    notifyVia: "app",
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch alerts from Supabase
  useEffect(() => {
    async function fetchAlerts() {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_alerts')
          .select('*')
          .eq('user_id', user.id);
          
        if (error) {
          console.error("Error fetching alerts:", error);
          toast.error("حدث خطأ أثناء جلب التنبيهات");
          return;
        }
        
        // Transform data to match our Alert type
        const transformedAlerts: Alert[] = data.map(alert => ({
          id: alert.id,
          name: alert.name,
          metric: alert.metric,
          condition: alert.condition,
          value: alert.value || 0,
          timeframe: alert.timeframe,
          keyword: alert.keyword || undefined,
          active: alert.active || false,
          notifyVia: alert.notify_via || 'app',
          dialectValue: alert.dialect_value,
        }));
        
        setAlerts(transformedAlerts);
      } catch (err) {
        console.error("Failed to fetch alerts:", err);
        toast.error("فشل في تحميل التنبيهات");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchAlerts();
  }, [user]);
  
  const handleAddAlert = async () => {
    if (!newAlert.name || newAlert.name.trim() === "") {
      toast.error("يرجى تقديم اسم للتنبيه");
      return;
    }
    
    if (!user) {
      toast.error("يجب تسجيل الدخول لإنشاء تنبيهات");
      return;
    }
    
    try {
      // Prepare alert data for insertion
      const alertData = {
        name: newAlert.name,
        user_id: user.id,
        metric: newAlert.metric,
        condition: newAlert.condition, 
        value: newAlert.value,
        timeframe: newAlert.timeframe,
        keyword: newAlert.keyword || null,
        active: newAlert.active ?? true,
        notify_via: newAlert.notifyVia || 'app',
        dialect_value: newAlert.dialectValue || null,
      };
      
      // Insert into database
      const { data, error } = await supabase
        .from('user_alerts')
        .insert(alertData)
        .select();
        
      if (error) {
        console.error("Error creating alert:", error);
        toast.error("حدث خطأ أثناء إنشاء التنبيه");
        return;
      }
      
      // Add new alert to state
      const insertedAlert: Alert = {
        id: data[0].id,
        name: data[0].name,
        metric: data[0].metric,
        condition: data[0].condition,
        value: data[0].value || 0,
        timeframe: data[0].timeframe,
        keyword: data[0].keyword || undefined,
        active: data[0].active || false,
        notifyVia: data[0].notify_via || 'app',
        dialectValue: data[0].dialect_value,
      };
      
      setAlerts([...alerts, insertedAlert]);
      toast.success("تم إنشاء التنبيه بنجاح");
      setNewAlertOpen(false);
      resetNewAlertForm();
      
    } catch (err) {
      console.error("Failed to create alert:", err);
      toast.error("فشل في إنشاء التنبيه");
    }
  };

  const resetNewAlertForm = () => {
    setNewAlert({
      metric: "sentiment",
      condition: "above", 
      value: 50,
      timeframe: "hour",
      keyword: "",
      active: true,
      notifyVia: "app",
    });
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_alerts')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error("Error deleting alert:", error);
        toast.error("حدث خطأ أثناء حذف التنبيه");
        return;
      }
      
      setAlerts(alerts.filter(alert => alert.id !== id));
      toast.info("تم حذف التنبيه");
      
    } catch (err) {
      console.error("Failed to delete alert:", err);
      toast.error("فشل في حذف التنبيه");
    }
  };

  const handleToggleAlert = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('user_alerts')
        .update({ active })
        .eq('id', id);
        
      if (error) {
        console.error("Error updating alert:", error);
        toast.error("حدث خطأ أثناء تحديث التنبيه");
        return;
      }
      
      setAlerts(alerts.map(alert => 
        alert.id === id ? { ...alert, active } : alert
      ));
      toast.success(active ? 'تم تفعيل التنبيه' : 'تم إلغاء تفعيل التنبيه');
      
    } catch (err) {
      console.error("Failed to toggle alert:", err);
      toast.error("فشل في تغيير حالة التنبيه");
    }
  };

  const getAlertDescription = (alert: Alert) => {
    let description = "";
    
    if (alert.metric === "sentiment") {
      const sentimentType = alert.condition === "above" ? "negative" : "positive";
      description = `تنبيه عندما تكون المشاعر ${sentimentType === "negative" ? "السلبية" : "الإيجابية"} ${alert.condition === "above" ? "أعلى من" : alert.condition === "below" ? "أقل من" : "تساوي"} ${alert.value}%`;
    } else if (alert.metric === "engagement") {
      description = `تنبيه عندما يكون التفاعل ${alert.condition === "above" ? "أعلى من" : alert.condition === "below" ? "أقل من" : "يساوي"} ${alert.value}`;
    } else if (alert.metric === "dialect") {
      description = `تنبيه عندما يتم اكتشاف اللهجة ${alert.dialectValue === "Jordanian" ? "الأردنية" : "غير الأردنية"}`;
    }
    
    if (alert.keyword) {
      description += ` للكلمة المفتاحية "${alert.keyword}"`;
    }
    
    const timeframeMap = {
      "hour": "الساعة الأخيرة",
      "day": "اليوم الأخير",
      "week": "الأسبوع الأخير"
    };
    
    description += ` خلال ${timeframeMap[alert.timeframe as keyof typeof timeframeMap]}`;
    
    return description;
  };

  // Show loading state
  if (isLoading && !alerts.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('Alerts')}</h1>
          <p className="text-muted-foreground">
            {t('Get notified when important metrics change')}
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('Alerts')}</h1>
          <p className="text-muted-foreground">
            {t('Get notified when important metrics change')}
          </p>
        </div>
        <Dialog open={newAlertOpen} onOpenChange={setNewAlertOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="ml-2 h-4 w-4" />
              {t('New Alert')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t('Create Alert')}</DialogTitle>
              <DialogDescription>
                {t('Set up parameters for your new alert')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{t('Alert Name')}</Label>
                <Input 
                  id="name" 
                  placeholder={t('Enter alert name')} 
                  value={newAlert.name || ""}
                  onChange={(e) => setNewAlert({...newAlert, name: e.target.value})}
                />
              </div>
              
              <div className="grid gap-2">
                <Label>{t('Alert Type')}</Label>
                <Select 
                  value={newAlert.metric} 
                  onValueChange={(value) => setNewAlert({
                    ...newAlert, 
                    metric: value,
                    condition: value === "dialect" ? "equals" : "above"
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('Select metric')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>{t('Metrics')}</SelectLabel>
                      <SelectItem value="sentiment">{t('Sentiment')}</SelectItem>
                      <SelectItem value="engagement">{t('Engagement')}</SelectItem>
                      <SelectItem value="dialect">{t('Dialect')}</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              {newAlert.metric !== "dialect" && (
                <div className="grid gap-2">
                  <Label>{t('Condition')}</Label>
                  <Select 
                    value={newAlert.condition} 
                    onValueChange={(value) => setNewAlert({...newAlert, condition: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('Select condition')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="above">{t('Above')}</SelectItem>
                      <SelectItem value="below">{t('Below')}</SelectItem>
                      <SelectItem value="equals">{t('Equals')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {newAlert.metric === "dialect" ? (
                <div className="grid gap-2">
                  <Label>{t('Dialect')}</Label>
                  <Select 
                    value={newAlert.dialectValue || "Jordanian"} 
                    onValueChange={(value) => setNewAlert({...newAlert, dialectValue: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر اللهجة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Jordanian">أردنية</SelectItem>
                      <SelectItem value="Non-Jordanian">غير أردنية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <Label>
                      {t('Threshold Value')}: {newAlert.value}%
                    </Label>
                  </div>
                  <Slider
                    value={[newAlert.value || 50]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(values) => setNewAlert({...newAlert, value: values[0]})}
                  />
                </div>
              )}
              
              <div className="grid gap-2">
                <Label>{t('Timeframe')}</Label>
                <Select 
                  value={newAlert.timeframe} 
                  onValueChange={(value) => setNewAlert({...newAlert, timeframe: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('Select timeframe')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hour">{t('Last Hour')}</SelectItem>
                    <SelectItem value="day">{t('Last 24 Hours')}</SelectItem>
                    <SelectItem value="week">{t('Last Week')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="keyword">{t('Keyword (Optional)')}</Label>
                <Input 
                  id="keyword" 
                  placeholder={t('Filter by keyword')} 
                  value={newAlert.keyword || ""}
                  onChange={(e) => setNewAlert({...newAlert, keyword: e.target.value})}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="active" 
                  checked={newAlert.active} 
                  onCheckedChange={(checked) => setNewAlert({...newAlert, active: checked})}
                />
                <Label htmlFor="active" className="mr-2">{t('Enable alert immediately')}</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setNewAlertOpen(false)}>
                {t('Cancel')}
              </Button>
              <Button onClick={handleAddAlert}>{t('Save Alert')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {alerts.map(alert => (
          <Card key={alert.id} className={alert.active ? "" : "opacity-70"}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-primary ml-2" />
                  <CardTitle>{alert.name}</CardTitle>
                </div>
                <Switch 
                  checked={alert.active} 
                  onCheckedChange={(checked) => handleToggleAlert(alert.id, checked)}
                />
              </div>
              <CardDescription className="pt-1">
                {getAlertDescription(alert)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm">
                <div className="rounded-full w-3 h-3 bg-primary ml-2" />
                <span>الإشعار عبر تنبيهات التطبيق</span>
              </div>
            </CardContent>
            <CardFooter className="pt-0 flex justify-between">
              <Button variant="outline" size="sm" onClick={() => handleDeleteAlert(alert.id)}>
                <Trash2 className="h-4 w-4 ml-1" />
                حذف
              </Button>
              <Button variant="ghost" size="sm" onClick={() => toast.success("تم إرسال تنبيه تجريبي")}>
                <Bell className="h-4 w-4 ml-1" />
                {t('Test Alert')}
              </Button>
            </CardFooter>
          </Card>
        ))}
        
        {alerts.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Bell className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('No Alerts Set Up')}</h3>
              <p className="text-muted-foreground text-center mb-4">
                {t('You haven\'t created any alerts yet. Create your first alert to get notified about important changes.')}
              </p>
              <Button onClick={() => setNewAlertOpen(true)}>
                <Plus className="ml-2 h-4 w-4" />
                {t('Create First Alert')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('Alert Types')}</CardTitle>
          <CardDescription>
            {t('Different types of alerts you can set up')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border bg-muted/20 space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="p-1 rounded-full bg-red-500/10">
                    <Check className="h-4 w-4 text-red-500" />
                  </div>
                  <h3 className="font-medium mr-2">{t('Sentiment Alerts')}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('Get notified when sentiment about a topic or keyword crosses a threshold.')}
                </p>
              </div>
              
              <div className="p-4 rounded-lg border bg-muted/20 space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="p-1 rounded-full bg-blue-500/10">
                    <Check className="h-4 w-4 text-blue-500" />
                  </div>
                  <h3 className="font-medium mr-2">{t('Engagement Alerts')}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('Monitor when engagement levels spike or drop for your topics of interest.')}
                </p>
              </div>
              
              <div className="p-4 rounded-lg border bg-muted/20 space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="p-1 rounded-full bg-purple-500/10">
                    <Check className="h-4 w-4 text-purple-500" />
                  </div>
                  <h3 className="font-medium mr-2">{t('Dialect Alerts')}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('Get notified about posts in specific dialects for targeted monitoring.')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Alerts;
