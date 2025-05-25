
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { CreateUserDialog } from '@/components/admin/CreateUserDialog';
import { UsersList } from '@/components/admin/UsersList';

const AdminUsers = () => {
  const {
    users,
    loading,
    createUser,
    updateUserRole,
    deleteUser
  } = useAdminUsers();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
          <p className="text-muted-foreground">إدارة حسابات المستخدمين والأدوار</p>
        </div>

        <CreateUserDialog onCreateUser={createUser} />
      </div>

      <UsersList
        users={users}
        onUpdateRole={updateUserRole}
        onDeleteUser={deleteUser}
      />
    </div>
  );
};

export default AdminUsers;
