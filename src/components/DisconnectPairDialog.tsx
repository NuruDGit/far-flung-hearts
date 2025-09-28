import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { UserX, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface DisconnectPairDialogProps {
  pairId: string;
  partnerName?: string;
}

export const DisconnectPairDialog = ({ pairId, partnerName }: DisconnectPairDialogProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleDisconnect = async () => {
    if (!user) return;
    
    setIsDisconnecting(true);
    
    try {
      const { error } = await supabase
        .from('pairs')
        .update({
          status: 'disconnected',
          disconnected_by: user.id,
          disconnected_at: new Date().toISOString(),
        })
        .eq('id', pairId);

      if (error) throw error;

      toast.success('You have successfully disconnected from your pair');
      setIsOpen(false);
      
      // Navigate back to pair setup after disconnect
      navigate('/pair-setup');
    } catch (error) {
      console.error('Error disconnecting pair:', error);
      toast.error('Failed to disconnect. Please try again.');
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="sm"
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          <UserX className="h-4 w-4 mr-2" />
          Disconnect Pair
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">
            Disconnect from {partnerName || 'Your Partner'}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            <div className="space-y-3">
              <p>
                Are you sure you want to disconnect from your pair? This action will:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>End your current pair connection</li>
                <li>Stop sharing mood logs and activities</li>
                <li>Disable couple features like messaging and shared goals</li>
                <li>Require a new invitation to reconnect</li>
              </ul>
              <p className="text-red-600 font-medium">
                This action cannot be undone easily.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDisconnecting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDisconnecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Disconnecting...
              </>
            ) : (
              'Yes, Disconnect'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};