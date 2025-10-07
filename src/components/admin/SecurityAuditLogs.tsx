import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Info, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface SecurityAuditLog {
  id: string;
  created_at: string;
  user_id: string | null;
  severity: 'info' | 'warning' | 'critical';
  resource_type: string | null;
  resource_id: string | null;
  action: string;
  event_type: string;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, any>;
  success: boolean;
}

export const SecurityAuditLogs = () => {
  const [logs, setLogs] = useState<SecurityAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');

  const fetchLogs = async () => {
    try {
      let query = supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (severityFilter !== 'all') {
        query = query.eq('severity', severityFilter);
      }

      if (eventTypeFilter !== 'all') {
        query = query.eq('event_type', eventTypeFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs((data || []) as SecurityAuditLog[]);
    } catch (error: any) {
      console.error('Error fetching security logs:', error);
      toast.error('Failed to load security audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [severityFilter, eventTypeFilter]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, any> = {
      critical: 'destructive',
      warning: 'outline',
      info: 'secondary'
    };
    return <Badge variant={variants[severity] || 'default'}>{severity.toUpperCase()}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Loading security audit logs...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-love-heart" />
          Security Audit Logs
        </CardTitle>
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="failed_login">Failed Login</SelectItem>
                <SelectItem value="profile_update">Profile Update</SelectItem>
                <SelectItem value="password_change">Password Change</SelectItem>
                <SelectItem value="subscription_change">Subscription Change</SelectItem>
                <SelectItem value="admin_action">Admin Action</SelectItem>
                <SelectItem value="data_export">Data Export</SelectItem>
                <SelectItem value="account_deletion">Account Deletion</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={fetchLogs}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium mb-2">No security logs found</h3>
            <p className="text-sm text-muted-foreground">
              Security events will appear here when they occur
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getSeverityIcon(log.severity)}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{log.action}</h4>
                        {getSeverityBadge(log.severity)}
                        <Badge variant="outline">{log.event_type}</Badge>
                        {!log.success && (
                          <Badge variant="destructive">Failed</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(log.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                  {log.user_id && (
                    <div>
                      <span className="text-muted-foreground">User ID:</span>
                      <p className="font-mono text-xs">{log.user_id}</p>
                    </div>
                  )}
                  {log.ip_address && (
                    <div>
                      <span className="text-muted-foreground">IP Address:</span>
                      <p className="font-mono">{log.ip_address}</p>
                    </div>
                  )}
                  {log.resource_type && (
                    <div>
                      <span className="text-muted-foreground">Resource Type:</span>
                      <p>{log.resource_type}</p>
                    </div>
                  )}
                  {log.resource_id && (
                    <div>
                      <span className="text-muted-foreground">Resource ID:</span>
                      <p className="font-mono text-xs">{log.resource_id}</p>
                    </div>
                  )}
                </div>

                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <div className="mt-3 p-2 bg-muted rounded text-xs">
                    <span className="text-muted-foreground block mb-1">Metadata:</span>
                    <pre className="overflow-x-auto">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </div>
                )}

                {log.user_agent && (
                  <div className="mt-2 text-xs text-muted-foreground truncate">
                    User Agent: {log.user_agent}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
