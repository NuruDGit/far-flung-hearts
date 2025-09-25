import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Calendar, User, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { CreateGoalDialog } from '@/components/goals/CreateGoalDialog';
import { EditGoalDialog } from '@/components/goals/EditGoalDialog';
import { CreateTaskDialog } from '@/components/goals/CreateTaskDialog';
import { AIRecommendations } from '@/components/goals/AIRecommendations';
import AppNavigation from '@/components/AppNavigation';

interface Task {
  id: string;
  title: string;
  notes?: string;
  due_at?: string;
  status_column: 'todo' | 'doing' | 'done';
  pair_id: string;
}

interface Goal {
  id: string;
  description?: string;
  target_date?: string;
  pair_id: string;
}

export default function GoalsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showEditGoal, setShowEditGoal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);
  const { toast } = useToast();

  const columns = {
    todo: { title: 'To Do', tasks: tasks.filter(t => t.status_column === 'todo') },
    doing: { title: 'In Progress', tasks: tasks.filter(t => t.status_column === 'doing') },
    done: { title: 'Complete', tasks: tasks.filter(t => t.status_column === 'done') }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('Fetching goals and tasks data...');
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No authenticated user found');

      console.log('Current user:', user.id);

      // Get user's pair
      const { data: pairData, error: pairError } = await supabase
        .from('pairs')
        .select('id')
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .single();

      if (pairError) {
        console.error('Pair error:', pairError);
        throw new Error('No pair found. Please set up your relationship first.');
      }
      
      console.log('User pair:', pairData);

      const [tasksResponse, goalsResponse] = await Promise.all([
        supabase.from('goal_tasks').select('*').eq('pair_id', pairData.id),
        supabase.from('goalboard').select('*').eq('pair_id', pairData.id)
      ]);

      console.log('Tasks response:', tasksResponse);
      console.log('Goals response:', goalsResponse);

      if (tasksResponse.error) throw tasksResponse.error;
      if (goalsResponse.error) throw goalsResponse.error;

      setTasks((tasksResponse.data || []).map(task => ({
        ...task,
        status_column: task.status_column as 'todo' | 'doing' | 'done'
      })));
      setGoals(goalsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load goals and tasks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;

    const task = tasks.find(t => t.id === draggableId);
    if (!task) return;

    const newStatus = destination.droppableId as 'todo' | 'doing' | 'done';
    
    try {
      const { error } = await supabase
        .from('goal_tasks')
        .update({ status_column: newStatus })
        .eq('id', task.id);

      if (error) throw error;

      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === task.id ? { ...t, status_column: newStatus } : t
        )
      );

      toast({
        title: "Task updated",
        description: `Task moved to ${columns[newStatus].title}`
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive"
      });
    }
  };

  const scrollToAIRecommendations = () => {
    const element = document.getElementById('ai-recommendations');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      // Switch to tasks tab
      const taskTab = element.querySelector('[data-tabs-trigger="tasks"]') as HTMLButtonElement;
      if (taskTab) {
        taskTab.click();
      }
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowEditGoal(true);
  };

  const handleDeleteGoal = (goal: Goal) => {
    setGoalToDelete(goal);
    setShowDeleteAlert(true);
  };

  const confirmDeleteGoal = async () => {
    if (!goalToDelete) return;

    try {
      const { error } = await supabase
        .from('goalboard')
        .delete()
        .eq('id', goalToDelete.id);

      if (error) throw error;

      toast({
        title: "Goal deleted",
        description: "Your goal has been deleted successfully."
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: "Error",
        description: "Failed to delete goal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setShowDeleteAlert(false);
      setGoalToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <AppNavigation />
      <div className="container mx-auto p-4 max-w-6xl space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Goals & Tasks</h1>
            <p className="text-muted-foreground mt-2">Track your relationship goals and daily tasks together</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setShowCreateGoal(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
            <Button onClick={() => setShowCreateTask(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Current Goals Section */}
        {goals.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Current Goals
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {goals.map(goal => (
                <Card key={goal.id} className="border-muted">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground mb-2">{goal.description}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <Calendar className="h-4 w-4" />
                          {goal.target_date ? (
                            <>Target: {new Date(goal.target_date).toLocaleDateString()}</>
                          ) : (
                            <>No target date set</>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="secondary">Active Goal</Badge>
                          {goal.target_date && (
                            <Badge variant="outline">
                              {new Date(goal.target_date) > new Date() ? 'Upcoming' : 'Overdue'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          onClick={() => scrollToAIRecommendations()}
                          size="sm"
                          variant="outline"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Tasks
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditGoal(goal)}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit Goal
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteGoal(goal)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Goal
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendations Section */}
        <div id="ai-recommendations">
          <AIRecommendations
            onGoalCreated={fetchData}
            onTaskCreated={fetchData}
            existingGoals={goals}
            existingTasks={tasks}
          />
        </div>

        {/* Tasks Kanban Board Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Task Board</h2>
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {Object.entries(columns).map(([columnId, column]) => (
                <div key={columnId} className="bg-muted/30 rounded-lg p-4">
                  <h3 className="font-semibold mb-4 text-foreground flex items-center gap-2">
                    {column.title}
                    <Badge variant="secondary">{column.tasks.length}</Badge>
                  </h3>
                  
                  <Droppable droppableId={columnId}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[300px] space-y-3 ${
                          snapshot.isDraggingOver ? 'bg-muted/50' : ''
                        } rounded-lg p-2 transition-colors`}
                      >
                        {column.tasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`cursor-move transition-shadow ${
                                  snapshot.isDragging ? 'shadow-lg' : ''
                                }`}
                              >
                                <CardContent className="p-4">
                                  <h4 className="font-medium text-foreground mb-2">{task.title}</h4>
                                  {task.notes && (
                                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{task.notes}</p>
                                  )}
                                  {task.due_at && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <Calendar className="h-3 w-3" />
                                      Due: {new Date(task.due_at).toLocaleDateString()}
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        </div>

        {/* Dialogs */}
        <CreateGoalDialog
          open={showCreateGoal}
          onOpenChange={setShowCreateGoal}
          onGoalCreated={fetchData}
        />

        <EditGoalDialog
          open={showEditGoal}
          onOpenChange={setShowEditGoal}
          onGoalUpdated={fetchData}
          goal={selectedGoal}
        />

        <CreateTaskDialog
          open={showCreateTask}
          onOpenChange={setShowCreateTask}
          onTaskCreated={fetchData}
        />

        {/* Delete Confirmation Alert */}
        <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Goal</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this goal? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDeleteGoal}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}