
import { useState } from "react";
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

// Mock existing alerts
const initialAlerts = [
  {
    id: "1",
    name: "High negative sentiment",
    metric: "sentiment",
    condition: "above",
    value: 50,
    timeframe: "hour",
    keyword: "الحكومة",
    active: true,
    notifyVia: "app",
  },
  {
    id: "2",
    name: "Low engagement alert",
    metric: "engagement",
    condition: "below",
    value: 100,
    timeframe: "day",
    keyword: "الاقتصاد",
    active: false,
    notifyVia: "app",
  },
  {
    id: "3",
    name: "Jordan dialect monitor",
    metric: "dialect",
    condition: "equals",
    value: 0, // Not used for dialect
    timeframe: "day",
    keyword: "",
    active: true,
    notifyVia: "app",
    dialectValue: "Jordanian",
  },
];

type Alert = typeof initialAlerts[0];

const Alerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
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
  
  const handleAddAlert = () => {
    if (!newAlert.name || newAlert.name.trim() === "") {
      toast.error("Please provide a name for the alert");
      return;
    }
    
    const alert = {
      id: `${Date.now()}`,
      ...newAlert,
      name: newAlert.name || "New Alert",
      value: newAlert.value || 50,
      active: newAlert.active ?? true,
    } as Alert;
    
    setAlerts([...alerts, alert]);
    toast.success("Alert created successfully");
    setNewAlertOpen(false);
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

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
    toast.info("Alert deleted");
  };

  const handleToggleAlert = (id: string, active: boolean) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, active } : alert
    ));
    toast.success(`Alert ${active ? 'activated' : 'deactivated'}`);
  };

  const getAlertDescription = (alert: Alert) => {
    let description = "";
    
    if (alert.metric === "sentiment") {
      const sentimentType = alert.condition === "above" ? "negative" : "positive";
      description = `Alert when ${sentimentType} sentiment is ${alert.condition} ${alert.value}%`;
    } else if (alert.metric === "engagement") {
      description = `Alert when engagement is ${alert.condition} ${alert.value}`;
    } else if (alert.metric === "dialect") {
      description = `Alert when dialect detected as ${alert.dialectValue || "Jordanian"}`;
    }
    
    if (alert.keyword) {
      description += ` for keyword "${alert.keyword}"`;
    }
    
    description += ` within the last ${alert.timeframe}`;
    
    return description;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alerts</h1>
          <p className="text-muted-foreground">
            Get notified when important metrics change
          </p>
        </div>
        <Dialog open={newAlertOpen} onOpenChange={setNewAlertOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Alert
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Alert</DialogTitle>
              <DialogDescription>
                Set up parameters for your new alert
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Alert Name</Label>
                <Input 
                  id="name" 
                  placeholder="Enter alert name" 
                  value={newAlert.name || ""}
                  onChange={(e) => setNewAlert({...newAlert, name: e.target.value})}
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Alert Type</Label>
                <Select 
                  value={newAlert.metric} 
                  onValueChange={(value) => setNewAlert({
                    ...newAlert, 
                    metric: value,
                    condition: value === "dialect" ? "equals" : "above"
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Metrics</SelectLabel>
                      <SelectItem value="sentiment">Sentiment</SelectItem>
                      <SelectItem value="engagement">Engagement</SelectItem>
                      <SelectItem value="dialect">Dialect</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              {newAlert.metric !== "dialect" && (
                <div className="grid gap-2">
                  <Label>Condition</Label>
                  <Select 
                    value={newAlert.condition} 
                    onValueChange={(value) => setNewAlert({...newAlert, condition: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="above">Above</SelectItem>
                      <SelectItem value="below">Below</SelectItem>
                      <SelectItem value="equals">Equals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {newAlert.metric === "dialect" ? (
                <div className="grid gap-2">
                  <Label>Dialect</Label>
                  <Select 
                    value={newAlert.dialectValue || "Jordanian"} 
                    onValueChange={(value) => setNewAlert({...newAlert, dialectValue: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select dialect" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Jordanian">Jordanian</SelectItem>
                      <SelectItem value="Non-Jordanian">Non-Jordanian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <Label>Threshold Value: {newAlert.value}%</Label>
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
                <Label>Timeframe</Label>
                <Select 
                  value={newAlert.timeframe} 
                  onValueChange={(value) => setNewAlert({...newAlert, timeframe: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hour">Last Hour</SelectItem>
                    <SelectItem value="day">Last 24 Hours</SelectItem>
                    <SelectItem value="week">Last Week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="keyword">Keyword (Optional)</Label>
                <Input 
                  id="keyword" 
                  placeholder="Filter by keyword" 
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
                <Label htmlFor="active">Enable alert immediately</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setNewAlertOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddAlert}>Save Alert</Button>
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
                  <Bell className="h-5 w-5 text-primary" />
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
                <div className="rounded-full w-3 h-3 bg-primary mr-2" />
                <span>Notify via app notifications</span>
              </div>
            </CardContent>
            <CardFooter className="pt-0 flex justify-between">
              <Button variant="outline" size="sm" onClick={() => handleDeleteAlert(alert.id)}>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
              <Button variant="ghost" size="sm" onClick={() => toast.success("Test notification sent")}>
                <Bell className="h-4 w-4 mr-1" />
                Test Alert
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
              <h3 className="text-lg font-semibold mb-2">No Alerts Set Up</h3>
              <p className="text-muted-foreground text-center mb-4">
                You haven't created any alerts yet. Create your first alert to get notified about important changes.
              </p>
              <Button onClick={() => setNewAlertOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Alert
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alert Types</CardTitle>
          <CardDescription>
            Different types of alerts you can set up
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
                  <h3 className="font-medium">Sentiment Alerts</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Get notified when sentiment about a topic or keyword crosses a threshold.
                </p>
              </div>
              
              <div className="p-4 rounded-lg border bg-muted/20 space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="p-1 rounded-full bg-blue-500/10">
                    <Check className="h-4 w-4 text-blue-500" />
                  </div>
                  <h3 className="font-medium">Engagement Alerts</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Monitor when engagement levels spike or drop for your topics of interest.
                </p>
              </div>
              
              <div className="p-4 rounded-lg border bg-muted/20 space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="p-1 rounded-full bg-purple-500/10">
                    <Check className="h-4 w-4 text-purple-500" />
                  </div>
                  <h3 className="font-medium">Dialect Alerts</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Get notified about posts in specific dialects for targeted monitoring.
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
