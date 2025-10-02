import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Calendar, User, Edit2, Trash2, MoreHorizontal, MoreVertical, Target, Heart, Star, Trophy, Flag, Lightbulb, Zap, Archive, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { CreateGoalDialog } from '@/components/goals/CreateGoalDialog';
import { EditGoalDialog } from '@/components/goals/EditGoalDialog';
import { CreateTaskDialog } from '@/components/goals/CreateTaskDialog';
import { EditTaskDialog } from '@/components/goals/EditTaskDialog';
import { AIRecommendations } from '@/components/goals/AIRecommendations';
import { ExpandableTaskDescription } from '@/components/goals/ExpandableTaskDescription';
import { TaskAssignmentSelector } from '@/components/goals/TaskAssignmentSelector';
import AppNavigation from '@/components/AppNavigation';

interface Task {
  id: string;
  title: string;
  notes?: string;
  due_at?: string;
  status_column: 'todo' | 'doing' | 'done';
  pair_id: string;
  goal_id?: string;
  completed_at?: string;
  archived_at?: string;
  is_archived?: boolean;
  assigned_to?: string;
}

interface Goal {
  id: string;
  description?: string;
  target_date?: string;
  pair_id: string;
  color?: string;
  icon?: string;
}

export default function GoalsPage() {
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showEditGoal, setShowEditGoal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);
  const [showEditTask, setShowEditTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showDeleteTaskAlert, setShowDeleteTaskAlert] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [aiRecommendationsTab, setAiRecommendationsTab] = useState("goals");
  const [showArchivedTasks, setShowArchivedTasks] = useState(false);
  const [preselectedGoalId, setPreselectedGoalId] = useState<string>('');
  const { toast } = useToast();

  // Filter tasks based on archive status
  const activeTasks = tasks.filter(t => !t.is_archived);
  const archivedTasks = tasks.filter(t => t.is_archived);
  const displayTasks = showArchivedTasks ? tasks : activeTasks;

  const columns = {
    todo: { title: 'To Do', tasks: displayTasks.filter(t => t.status_column === 'todo') },
    doing: { title: 'In Progress', tasks: displayTasks.filter(t => t.status_column === 'doing') },
    done: { title: 'Complete', tasks: displayTasks.filter(t => t.status_column === 'done') }
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
        supabase.from('goal_tasks').select('*, assigned_to').eq('pair_id', pairData.id),
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
    // Set the tab to tasks first
    setAiRecommendationsTab("tasks");
    
    // Then scroll to the element
    setTimeout(() => {
      const element = document.getElementById('ai-recommendations');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100); // Small delay to ensure tab state is updated
  };

  const getGoalProgress = (goalId: string) => {
    const goalTasks = tasks.filter(task => task.goal_id === goalId && !task.is_archived);
    if (goalTasks.length === 0) return { completed: 0, total: 0, percentage: 0 };
    
    const completed = goalTasks.filter(task => task.status_column === 'done').length;
    const total = goalTasks.length;
    const percentage = Math.round((completed / total) * 100);
    
    return { completed, total, percentage };
  };

  const getGoalStatus = (goal: Goal) => {
    if (!goal.target_date) return 'no-date';
    
    const targetDate = new Date(goal.target_date);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 7) return 'due-soon';
    if (diffDays <= 30) return 'upcoming';
    return 'on-track';
  };

  const getGoalStatusColors = (status: string) => {
    switch (status) {
      case 'overdue':
        return {
          border: 'border-destructive',
          background: 'bg-destructive/5',
          badge: 'destructive'
        };
      case 'due-soon':
        return {
          border: 'border-orange-500',
          background: 'bg-orange-50 dark:bg-orange-950/20',
          badge: 'default'
        };
      case 'upcoming':
        return {
          border: 'border-yellow-500',
          background: 'bg-yellow-50 dark:bg-yellow-950/20',
          badge: 'secondary'
        };
      case 'on-track':
        return {
          border: 'border-green-500',
          background: 'bg-green-50 dark:bg-green-950/20',
          badge: 'secondary'
        };
      default:
        return {
          border: 'border-muted',
          background: 'bg-card',
          badge: 'outline'
        };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'Overdue';
      case 'due-soon':
        return 'Due Soon';
      case 'upcoming':
        return 'Upcoming';
      case 'on-track':
        return 'On Track';
      default:
        return 'No Target Date';
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

  const getGoalForTask = (goalId?: string) => {
    if (!goalId) return null;
    return goals.find(goal => goal.id === goalId);
  };

  const getIconComponent = (iconName?: string) => {
    const iconMap: Record<string, any> = {
      target: Target,
      heart: Heart,
      star: Star,
      trophy: Trophy,
      flag: Flag,
      lightbulb: Lightbulb,
      zap: Zap,
    };
    return iconMap[iconName || 'target'] || Target;
  };

  const getColorClass = (colorName?: string) => {
    const colorMap: Record<string, string> = {
      heart: 'text-love-heart',
      coral: 'text-love-coral',
      deep: 'text-love-deep',
      primary: 'text-primary',
      accent: 'text-accent',
      secondary: 'text-secondary',
      muted: 'text-muted',
      destructive: 'text-destructive',
    };
    return colorMap[colorName || 'heart'] || 'text-love-heart';
  };

  const getBgColorClass = (colorName?: string) => {
    const bgColorMap: Record<string, string> = {
      heart: 'bg-love-heart/10',
      coral: 'bg-love-coral/10',
      deep: 'bg-love-deep/10',
      primary: 'bg-primary/10',
      accent: 'bg-accent/10',
      secondary: 'bg-secondary/10',
      muted: 'bg-muted/10',
      destructive: 'bg-destructive/10',
    };
    return bgColorMap[colorName || 'heart'] || 'bg-love-heart/10';
  };

  const getBorderColorClass = (colorName?: string) => {
    const borderColorMap: Record<string, string> = {
      heart: 'border-love-heart',
      coral: 'border-love-coral',
      deep: 'border-love-deep',
      primary: 'border-primary',
      accent: 'border-accent',
      secondary: 'border-secondary',
      muted: 'border-muted',
      destructive: 'border-destructive',
  };
    return borderColorMap[colorName || 'heart'] || 'border-love-heart';
  };

  const manualArchiveCompletedTasks = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('archive-completed-tasks');
      
      if (error) throw error;
      
      toast({
        title: "Tasks Archived",
        description: `${data.archivedCount} completed tasks have been archived.`
      });
      
      // Refresh data to show updated task list
      fetchData();
    } catch (error) {
      console.error('Error archiving tasks:', error);
      toast({
        title: "Error",
        description: "Failed to archive completed tasks. Please try again.",
        variant: "destructive"
      });
    }
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

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setShowEditTask(true);
  };

  const handleDeleteTask = (task: Task) => {
    setTaskToDelete(task);
    setShowDeleteTaskAlert(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      const { error } = await supabase
        .from('goal_tasks')
        .delete()
        .eq('id', taskToDelete.id);

      if (error) throw error;

      toast({
        title: "Task deleted!",
        description: "The task has been removed successfully."
      });

      setShowDeleteTaskAlert(false);
      setTaskToDelete(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <>
      <AppNavigation />
      <div className="container mx-auto p-4 max-w-6xl space-y-6 pb-24">
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
            <div className="grid gap-4 md:grid-cols-2">
              {goals.map(goal => {
                const status = getGoalStatus(goal);
                const colors = getGoalStatusColors(status);
                
                return (
                  <Card key={goal.id} className={`${colors.border} ${colors.background} relative overflow-hidden shadow-sm hover:shadow-md transition-shadow`}>
                    <div 
                      className={`absolute left-0 top-0 bottom-0 w-1 ${getBorderColorClass(goal.color)}`}
                    />
                    <CardHeader className="p-6 pl-8 pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {goal.target_date ? (
                                <>Target: {new Date(goal.target_date).toLocaleDateString()}</>
                              ) : (
                                <>No target date set</>
                              )}
                            </div>
                            <div className="flex items-center gap-3 w-full">
                              <Badge variant="secondary" className="text-xs px-3 py-1 whitespace-nowrap">
                                Active Goal
                              </Badge>
                              <Badge variant={colors.badge as any} className="text-xs px-3 py-1 whitespace-nowrap">
                                {getStatusLabel(status)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            onClick={() => {
                              setPreselectedGoalId(goal.id);
                              setShowCreateTask(true);
                            }}
                            size="sm"
                            variant="outline"
                            className="h-9 px-4 text-xs"
                          >
                            <Plus className="h-3 w-3 mr-2" />
                            Tasks
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
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
                                className="text-destructive focus:text-destructive-foreground focus:bg-destructive hover:text-destructive-foreground hover:bg-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Goal
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="px-6 pb-6 pl-8 pt-0">
                      <h4 className="font-medium text-foreground mb-6 text-lg">{goal.description}</h4>
                      
                      <div className="space-y-3">
                        {(() => {
                          const progress = getGoalProgress(goal.id);
                          return (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span className="font-medium">Task Progress</span>
                                <span className="font-medium">{progress.completed}/{progress.total} tasks ({progress.percentage}%)</span>
                              </div>
                              <Progress 
                                value={progress.percentage} 
                                className="h-3 bg-secondary"
                              />
                            </div>
                          );
                        })()}
                        </div>
                      </CardContent>
                    </Card>
                );
              })}
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
            defaultTab={aiRecommendationsTab}
          />
        </div>

        {/* Tasks Kanban Board Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Task Board</h2>
            <div className="flex items-center gap-3">
              {/* Desktop buttons - hidden on mobile */}
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowArchivedTasks(!showArchivedTasks)}
                  className="flex items-center gap-2"
                >
                  {showArchivedTasks ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showArchivedTasks ? 'Hide Archived' : `Show Archived (${archivedTasks.length})`}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={manualArchiveCompletedTasks}
                  className="flex items-center gap-2"
                  title="Archive tasks completed more than 7 days ago"
                >
                  <Archive className="h-4 w-4" />
                  Archive Old
                </Button>
              </div>
              
              {/* Mobile dropdown - shown only on mobile */}
              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background border">
                    <DropdownMenuItem onClick={() => setShowArchivedTasks(!showArchivedTasks)}>
                      {showArchivedTasks ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                      {showArchivedTasks ? 'Hide Archived' : `Show Archived (${archivedTasks.length})`}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={manualArchiveCompletedTasks}>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive Old Tasks
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
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
                                   <div className="flex items-start justify-between mb-2">
                                     <h4 className="font-medium text-foreground flex-1">{task.title}</h4>
                                     <div className="flex items-center gap-2">
                                       {task.is_archived && (
                                         <Badge variant="secondary" className="text-xs">
                                           <Archive className="h-3 w-3 mr-1" />
                                           Archived
                                         </Badge>
                                       )}
                                       <DropdownMenu>
                                         <DropdownMenuTrigger asChild>
                                           <Button variant="ghost" className="h-6 w-6 p-0">
                                             <MoreHorizontal className="h-4 w-4" />
                                           </Button>
                                         </DropdownMenuTrigger>
                                         <DropdownMenuContent align="end">
                                           <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                             <Edit2 className="h-4 w-4 mr-2" />
                                             Edit Task
                                           </DropdownMenuItem>
                                           <DropdownMenuItem 
                                             onClick={() => handleDeleteTask(task)}
                                             className="text-destructive"
                                           >
                                             <Trash2 className="h-4 w-4 mr-2" />
                                             Delete Task
                                           </DropdownMenuItem>
                                         </DropdownMenuContent>
                                       </DropdownMenu>
                                     </div>
                                   </div>
                                   {task.notes && (
                                     <div className="mb-3">
                                       <ExpandableTaskDescription description={task.notes} />
                                     </div>
                                   )}
                                   <div className="flex flex-wrap gap-2 mb-3">
                                     {task.goal_id && (() => {
                                       const goal = getGoalForTask(task.goal_id);
                                       if (goal) {
                                         const IconComponent = getIconComponent(goal.icon);
                                         return (
                                           <Badge 
                                             variant="outline" 
                                             className={`text-xs flex items-center gap-1 ${getBorderColorClass(goal.color)} ${getColorClass(goal.color)} bg-background/50`}
                                           >
                                             <IconComponent size={12} className={getColorClass(goal.color)} />
                                             <span className="font-medium">Goal:</span>
                                             {goal.description || 'Unknown Goal'}
                                           </Badge>
                                         );
                                       }
                                       return null;
                                     })()}
                                   </div>
                                   
                                   <div className="flex items-center justify-between mb-2">
                                     <TaskAssignmentSelector 
                                       taskId={task.id}
                                       currentAssignee={task.assigned_to}
                                       onAssignmentChange={fetchData}
                                     />
                                   </div>
                                   {task.due_at && (
                                     <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                                       <Calendar className="h-3 w-3" />
                                       <span>Due: {new Date(task.due_at).toLocaleDateString()}</span>
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
          onOpenChange={(open) => {
            setShowCreateTask(open);
            if (!open) setPreselectedGoalId(''); // Clear preselection when closing
          }}
          onTaskCreated={fetchData}
          goals={goals}
          preselectedGoalId={preselectedGoalId}
        />

        <EditTaskDialog
          open={showEditTask}
          onOpenChange={setShowEditTask}
          onTaskUpdated={fetchData}
          task={selectedTask}
          goals={goals}
        />

        {/* Delete Goal Confirmation Alert */}
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

        {/* Delete Task Confirmation Alert */}
        <AlertDialog open={showDeleteTaskAlert} onOpenChange={setShowDeleteTaskAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Task</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this task? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDeleteTask}
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