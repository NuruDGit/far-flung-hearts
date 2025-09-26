import React from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import Header from '@/components/Header';
import CallHistory from '@/components/CallHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone } from 'lucide-react';

const CallHistoryPage = () => {
  const { user } = useAuth();

  // For demo purposes, using a sample pair ID
  // In a real app, you'd get this from the user's active pair
  const samplePairId = "sample-pair-id";

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
              pairId={samplePairId} 
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