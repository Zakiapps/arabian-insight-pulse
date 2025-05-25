
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Edit, Crown } from 'lucide-react';
import { User } from '@/types/admin';

interface UserItemProps {
  user: User;
  onUpdateRole: (userId: string, newRole: string) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
}

export const UserItem = ({ user, onUpdateRole, onDeleteUser }: UserItemProps) => {
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'moderator':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getSubscriptionBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'premium':
        return 'default';
      case 'pro':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center space-x-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{user.full_name}</h3>
            {user.is_online && (
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            )}
            {user.role === 'admin' && (
              <Crown className="h-4 w-4 text-yellow-500" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <div className="flex gap-2">
            <Badge variant={getRoleBadgeVariant(user.role)}>
              {user.role === 'admin' ? 'مدير' : user.role === 'moderator' ? 'مشرف' : 'مستخدم'}
            </Badge>
            <Badge variant={getSubscriptionBadgeVariant(user.subscription_plan)}>
              {user.subscription_plan}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            انضم في: {new Date(user.created_at).toLocaleDateString('ar-SA')}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تعديل دور المستخدم</DialogTitle>
              <DialogDescription>
                تعديل دور المستخدم: {user.full_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>الدور الحالي</Label>
                <Select
                  defaultValue={user.role}
                  onValueChange={(value) => onUpdateRole(user.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">مستخدم</SelectItem>
                    <SelectItem value="moderator">مشرف</SelectItem>
                    <SelectItem value="admin">مدير</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {user.email !== 'admin@arabinsights.com' && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDeleteUser(user.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
