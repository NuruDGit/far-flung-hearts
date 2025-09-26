import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Video, Clock, Calendar, TrendingUp } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface CallHistoryEntry {
  id: string;
  caller_id: string;
  receiver_id: string;
  call_type: string;
  duration_seconds: number;
  end_reason: string;
  started_at: string;
  ended_at: string;
  quality_score?: number;
}

interface CallHistoryProps {
  pairId: string;
  userId: string;
}

const CallHistory: React.FC<CallHistoryProps> = ({ pairId, userId }) => {
  const [callHistory, setCallHistory] = useState<CallHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCalls: 0,
    totalDuration: 0,
    averageDuration: 0,
    successRate: 0,
  });

  useEffect(() => {
    fetchCallHistory();
  }, [pairId]);

  const fetchCallHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('call_history')
        .select('*')
        .eq('pair_id', pairId)
        .order('started_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setCallHistory(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching call history:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (history: CallHistoryEntry[]) => {
    const totalCalls = history.length;
    const totalDuration = history.reduce((sum, call) => sum + call.duration_seconds, 0);
    const averageDuration = totalCalls > 0 ? totalDuration / totalCalls : 0;
    const successfulCalls = history.filter(call => call.end_reason === 'completed').length;
    const successRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0;

    setStats({
      totalCalls,
      totalDuration,
      averageDuration,
      successRate,
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getEndReasonBadge = (reason: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      completed: 'default',
      declined: 'secondary',
      failed: 'destructive',
      timeout: 'outline',
      network_error: 'destructive',
    };

    return (
      <Badge variant={variants[reason] || 'outline'}>
        {reason.replace('_', ' ')}
      </Badge>
    );
  };

  const getQualityIndicator = (score?: number) => {
    if (!score) return null;
    
    const quality = score >= 0.8 ? 'Excellent' : score >= 0.6 ? 'Good' : 'Poor';
    const color = score >= 0.8 ? 'text-green-600' : score >= 0.6 ? 'text-yellow-600' : 'text-red-600';
    
    return <span className={`text-sm ${color}`}>{quality}</span>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Call History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Calls</p>
                <p className="text-2xl font-bold">{stats.totalCalls}</p>
              </div>
              <Phone className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Time</p>
                <p className="text-2xl font-bold">{formatDuration(stats.totalDuration)}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Duration</p>
                <p className="text-2xl font-bold">{formatDuration(Math.round(stats.averageDuration))}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</p>
              </div>
              <Video className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call History List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Calls
          </CardTitle>
        </CardHeader>
        <CardContent>
          {callHistory.length === 0 ? (
            <div className="text-center py-8">
              <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No call history yet</p>
              <p className="text-sm text-muted-foreground">Your calls will appear here once you start making them</p>
            </div>
          ) : (
            <div className="space-y-4">
              {callHistory.map((call) => (
                <div
                  key={call.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-muted">
                      {call.call_type === 'video' ? (
                        <Video className="h-4 w-4" />
                      ) : (
                        <Phone className="h-4 w-4" />
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {call.caller_id === userId ? 'Outgoing' : 'Incoming'} {call.call_type} call
                        </span>
                        {getEndReasonBadge(call.end_reason)}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(call.started_at), 'MMM d, yyyy HH:mm')}
                        </span>
                        
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(call.duration_seconds)}
                        </span>
                        
                        {getQualityIndicator(call.quality_score)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(call.started_at), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CallHistory;