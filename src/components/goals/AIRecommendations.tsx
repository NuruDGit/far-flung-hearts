import React, { useState, useEffect } from 'react';
import { Brain, Lightbulb, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface GoalSuggestion {
  description: string;
  target_date: string;
  color: string;
  icon: string;
}

interface TaskSuggestion {
  title: string;
  notes: string;
  goal_id: string;
  due_at: string;
}

interface AIRecommendationsProps {
  onGoalCreated: () => void;
  onTaskCreated: () => void;
  existingGoals: any[];
  existingTasks: any[];
  defaultTab?: string;
}

export function AIRecommendations({ onGoalCreated, onTaskCreated, existingGoals, existingTasks, defaultTab = "goals" }: AIRecommendationsProps) {
  const [loading, setLoading] = useState(false);
  const [goalSuggestions, setGoalSuggestions] = useState<GoalSuggestion[]>([]);
  const [taskSuggestions, setTaskSuggestions] = useState<TaskSuggestion[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [activeTab, setActiveTab] = useState(defaultTab);
  const { toast } = useToast();

  // Update active tab when defaultTab prop changes
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const generateGoalSuggestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('goal-recommendations', {
        body: {
          type: 'goal_suggestions',
          context: {
            existingGoalsCount: existingGoals.length,
            existingGoals: existingGoals.map(g => g.description).slice(0, 3),
            relationshipStage: 'committed',
            availableColors: ['heart', 'coral', 'deep', 'primary', 'accent', 'secondary'],
            availableIcons: ['target', 'heart', 'star', 'trophy', 'flag', 'lightbulb', 'zap']
          }
        }
      });

      if (error) throw error;

      if (data.success && Array.isArray(data.recommendations)) {
        setGoalSuggestions(data.recommendations);
        toast({
          title: "AI Recommendations Generated!",
          description: "Here are some personalized goal suggestions for you."
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error generating goal suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to generate goal suggestions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateTaskSuggestions = async (goalDescription: string) => {
    setLoading(true);
    try {
      const selectedGoalObj = existingGoals.find(g => g.description === goalDescription);
      const { data, error } = await supabase.functions.invoke('goal-recommendations', {
        body: {
          type: 'task_suggestions',
          context: {
            goalDescription,
            goalId: selectedGoalObj?.id || null,
            existingTasksCount: existingTasks.length,
            existingGoals: existingGoals.map(g => ({id: g.id, description: g.description}))
          }
        }
      });

      if (error) throw error;

      if (data.success && Array.isArray(data.recommendations)) {
        setTaskSuggestions(data.recommendations);
        setSelectedGoal(goalDescription);
        toast({
          title: "Task Suggestions Generated!",
          description: "Here are AI-powered task ideas for your goal."
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error generating task suggestions:', error);
      toast({
        title: "Error", 
        description: "Failed to generate task suggestions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createGoalFromSuggestion = async (suggestion: GoalSuggestion) => {
    try {
      const { data: pairData, error: pairError } = await supabase
        .from('pairs')
        .select('id')
        .or(`user_a.eq.${(await supabase.auth.getUser()).data.user?.id},user_b.eq.${(await supabase.auth.getUser()).data.user?.id}`)
        .single();

      if (pairError) throw pairError;
      if (!pairData) throw new Error('No pair found');

      const { error } = await supabase
        .from('goalboard')
        .insert({
          description: suggestion.description,
          target_date: suggestion.target_date,
          color: suggestion.color,
          icon: suggestion.icon,
          pair_id: pairData.id
        });

      if (error) throw error;

      toast({
        title: "Goal Created!",
        description: "AI suggestion has been added to your goals."
      });

      onGoalCreated();
      // Remove the suggestion from the list
      setGoalSuggestions(prev => prev.filter(g => g.description !== suggestion.description));
    } catch (error) {
      console.error('Error creating goal from suggestion:', error);
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive"
      });
    }
  };

  const createTaskFromSuggestion = async (suggestion: TaskSuggestion) => {
    try {
      const { data: pairData, error: pairError } = await supabase
        .from('pairs')
        .select('id')
        .or(`user_a.eq.${(await supabase.auth.getUser()).data.user?.id},user_b.eq.${(await supabase.auth.getUser()).data.user?.id}`)
        .single();

      if (pairError) throw pairError;
      if (!pairData) throw new Error('No pair found');

      const { error } = await supabase
        .from('goal_tasks')
        .insert({
          title: suggestion.title,
          notes: suggestion.notes,
          due_at: suggestion.due_at,
          goal_id: suggestion.goal_id === 'no-goal' ? null : suggestion.goal_id || null,
          status_column: 'todo',
          pair_id: pairData.id
        });

      if (error) throw error;

      toast({
        title: "Task Created!",
        description: "AI suggestion has been added to your tasks."
      });

      onTaskCreated();
      // Remove the suggestion from the list
      setTaskSuggestions(prev => prev.filter(t => t.title !== suggestion.title));
    } catch (error) {
      console.error('Error creating task from suggestion:', error);
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <div className="relative">
            <Brain className="h-5 w-5 text-primary animate-pulse" />
            <div className="absolute inset-0 h-5 w-5 rounded-full bg-primary/20 animate-ping"></div>
          </div>
          AI Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="goals" data-tabs-trigger="goals">Goal Ideas</TabsTrigger>
            <TabsTrigger value="tasks" data-tabs-trigger="tasks">Task Ideas</TabsTrigger>
          </TabsList>

          <TabsContent value="goals" className="space-y-4">
            <div className="flex flex-col gap-3">
              <div className="w-full">
                <Button 
                  onClick={generateGoalSuggestions} 
                  disabled={loading}
                  size="sm"
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Lightbulb className="h-4 w-4 mr-2" />
                  )}
                  Generate Ideas
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Get AI-powered goal suggestions tailored to your relationship
              </p>
            </div>

            {goalSuggestions.length > 0 && (
              <div className="grid gap-3">
                {goalSuggestions.map((suggestion, index) => (
                  <Card key={index} className="border-muted">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground mb-3">{suggestion.description}</p>
                          <div className="flex gap-2">
                            <Badge variant="secondary">{suggestion.color}</Badge>
                            <Badge variant="outline">{suggestion.icon}</Badge>
                            {suggestion.target_date && <Badge variant="outline">{suggestion.target_date}</Badge>}
                          </div>
                        </div>
                        <Button 
                          onClick={() => createGoalFromSuggestion(suggestion)}
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Select a goal to get AI-powered task suggestions
              </p>
              
              {existingGoals.length > 0 ? (
                <div className="grid gap-2">
                  {existingGoals.map((goal) => (
                    <Button
                      key={goal.id}
                      variant="outline"
                      className="justify-start text-left h-auto p-3"
                      onClick={() => generateTaskSuggestions(goal.description)}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Lightbulb className="h-4 w-4 mr-2" />
                      )}
                      {goal.description}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Create some goals first to get task suggestions
                </p>
              )}
            </div>

            {taskSuggestions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Tasks for: {selectedGoal}</span>
                </div>
                
                <div className="grid gap-3">
                  {taskSuggestions.map((suggestion, index) => (
                    <Card key={index} className="border-muted">
                      <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground mb-2">{suggestion.title}</h4>
                              <p className="text-sm text-muted-foreground mb-3">{suggestion.notes}</p>
                              <div className="flex gap-2">
                                {suggestion.goal_id && suggestion.goal_id !== 'no-goal' && (
                                  <Badge variant="secondary">Goal: {existingGoals.find(g => g.id === suggestion.goal_id)?.description?.slice(0, 20) || 'Unknown Goal'}</Badge>
                                )}
                                {suggestion.due_at && <Badge variant="outline">Due: {new Date(suggestion.due_at).toLocaleDateString()}</Badge>}
                              </div>
                            </div>
                          <Button 
                            onClick={() => createTaskFromSuggestion(suggestion)}
                            size="sm"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}