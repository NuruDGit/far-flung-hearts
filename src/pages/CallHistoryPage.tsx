import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { useActivePair } from '@/hooks/useActivePair';
import Header from '@/components/Header';
import CallHistory from '@/components/CallHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Loader2 } from 'lucide-react';

const CallHistoryPage = () => {
  const { user } = useAuth();
  const { pair, loading: pairLoading } = useActivePair();
  const navigate = useNavigate();

  if (pairLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  if (!pair) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle>No Active Pair</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                You need to be paired to view call history.
              </p>
              <Button onClick={() => navigate('/app/pair-setup')}>
                Set Up Pair
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Phone className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Call History</h1>
              <p className="text-muted-foreground">
                View your call statistics and recent call history
              </p>
            </div>
          </div>

          {user ? (
            <CallHistory 
              pairId={pair.id} 
              userId={user.id} 
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Sign In Required</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Please sign in to view your call history.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default CallHistoryPage;