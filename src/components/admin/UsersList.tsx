
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from '@/types/admin';
import { UserItem } from './UserItem';

interface UsersListProps {
  users: User[];
  onUpdateRole: (userId: string, newRole: string) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
}

export const UsersList = ({ users, onUpdateRole, onDeleteUser }: UsersListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>قائمة المستخدمين</CardTitle>
        <CardDescription>
          إجمالي المستخدمين: {users.length}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <UserItem
              key={user.id}
              user={user}
              onUpdateRole={onUpdateRole}
              onDeleteUser={onDeleteUser}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
