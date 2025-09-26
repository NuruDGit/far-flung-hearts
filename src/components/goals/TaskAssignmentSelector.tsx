import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { User, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  display_name?: string;
  first_name?: string;
  avatar_url?: string;
}

interface TaskAssignmentSelectorProps {
  taskId: string;
  currentAssignee?: string;
  onAssignmentChange?: () => void;
}

export function TaskAssignmentSelector({ 
  taskId, 
  currentAssignee, 
  onAssignmentChange 
}: TaskAssignmentSelectorProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPairProfiles();
  }, []);

  const fetchPairProfiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get the user's pair
      const { data: pairs } = await supabase
        .from('pairs')
        .select('user_a, user_b')
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .eq('status', 'active')
        .single();

      if (!pairs) return;

      const userIds = [pairs.user_a, pairs.user_b];

      // Get profiles for both users
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, display_name, first_name, avatar_url')
        .in('id', userIds);

      if (profilesData) {
        setProfiles(profilesData);
      }
    } catch (error) {
      console.error('Error fetching pair profiles:', error);
    }
  };

  const updateAssignment = async (assigneeId: string | null) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('goal_tasks')
        .update({ assigned_to: assigneeId })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: assigneeId ? 'Task assigned successfully' : 'Task unassigned',
        description: assigneeId 
          ? 'The task has been assigned to a team member.' 
          : 'The task is now unassigned.',
      });

      onAssignmentChange?.();
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast({
        title: 'Error updating assignment',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (profile: Profile) => {
    return profile.display_name || profile.first_name || 'Unknown';
  };

  const currentProfile = profiles.find(p => p.id === currentAssignee);

  return (
    <div className="flex items-center gap-1">
      {currentProfile ? (
        <div className="flex items-center gap-1">
          <Avatar className="h-5 w-5">
            <AvatarImage src={currentProfile.avatar_url || ''} />
            <AvatarFallback className="text-xs">
              {getDisplayName(currentProfile).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">
            {getDisplayName(currentProfile)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateAssignment(null)}
            disabled={loading}
            className="h-5 w-5 p-0"
          >
            <UserX className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          {profiles.map((profile) => (
            <Button
              key={profile.id}
              variant="ghost"
              size="sm"
              onClick={() => updateAssignment(profile.id)}
              disabled={loading}
              className="h-6 px-1 flex items-center gap-1"
            >
              <Avatar className="h-4 w-4">
                <AvatarImage src={profile.avatar_url || ''} />
                <AvatarFallback className="text-xs">
                  {getDisplayName(profile).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs">{getDisplayName(profile)}</span>
            </Button>
          ))}
          {profiles.length === 0 && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              Unassigned
            </span>
          )}
        </div>
      )}
    </div>
  );
}