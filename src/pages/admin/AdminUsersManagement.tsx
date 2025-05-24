
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserManagement from '@/components/admin/UserManagement';
import TextAnalysisSection from '@/components/admin/TextAnalysisSection';
import { Users, MessageSquare } from 'lucide-react';

const AdminUsersManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
        <p className="text-muted-foreground">إدارة المستخدمين وتحليل النصوص</p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            المستخدمين
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            تحليل النصوص
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="mt-6">
          <UserManagement />
        </TabsContent>
        
        <TabsContent value="analysis" className="mt-6">
          <TextAnalysisSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminUsersManagement;
