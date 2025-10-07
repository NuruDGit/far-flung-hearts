import { useAdmin } from '@/hooks/useAdmin';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserManagement } from '@/components/admin/UserManagement';
import { SecurityLogs } from '@/components/admin/SecurityLogs';
import { SecurityAuditLogs } from '@/components/admin/SecurityAuditLogs';
import { SubscriptionStats } from '@/components/admin/SubscriptionStats';
import { ContentModeration } from '@/components/admin/ContentModeration';

const AdminDashboard = () => {
  const { isAdmin, loading } = useAdmin();
  const navigate = useNavigate();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-love-light to-love-soft flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-love-heart mx-auto mb-4"></div>
          <p className="text-love-deep">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-love-light to-love-soft">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/app')}
              className="hover:bg-love-light"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to App
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-love-heart to-love-coral flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-love-deep">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage users, security, and content</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="security">Security Logs</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="subscriptions" className="space-y-6">
            <SubscriptionStats />
          </TabsContent>
          
          <TabsContent value="security" className="space-y-6">
            <SecurityAuditLogs />
            <SecurityLogs />
          </TabsContent>
          
          <TabsContent value="content" className="space-y-6">
            <ContentModeration />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
