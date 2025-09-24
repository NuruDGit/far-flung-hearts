import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Calendar, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { CreateGoalDialog } from '@/components/goals/CreateGoalDialog';
import { CreateTaskDialog } from '@/components/goals/CreateTaskDialog';

interface Task {
  id: string;
  title: string;
  notes?: string;
  due_at?: string;
  status_column: 'todo' | 'in_progress' | 'complete';
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
  const { toast } = useToast();

  const columns = {
    todo: { title: 'To Do', tasks: tasks.filter(t => t.status_column === 'todo') },
    in_progress: { title: 'In Progress', tasks: tasks.filter(t => t.status_column === 'in_progress') },
    complete: { title: 'Complete', tasks: tasks.filter(t => t.status_column === 'complete') }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksResponse, goalsResponse] = await Promise.all([
        supabase.from('goal_tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('goalboard').select('*').order('created_at', { ascending: false })
      ]);

      if (tasksResponse.error) throw tasksResponse.error;
      if (goalsResponse.error) throw goalsResponse.error;

      setTasks((tasksResponse.data || []).map(task => ({
        ...task,
        status_column: task.status_column as 'todo' | 'in_progress' | 'complete'
      })));
      setGoals(goalsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load goals and tasks",
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

    const newStatus = destination.droppableId as 'todo' | 'in_progress' | 'complete';
    
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
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

      {goals.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Current Goals</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {goals.map(goal => (
              <Card key={goal.id} className="border-muted">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{goal.description}</CardTitle>
                </CardHeader>
                <CardContent>
                  {goal.target_date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Target: {new Date(goal.target_date).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    className={`min-h-[400px] space-y-3 ${
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
                                <p className="text-sm text-muted-foreground mb-3">{task.notes}</p>
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

      <CreateGoalDialog
        open={showCreateGoal}
        onOpenChange={setShowCreateGoal}
        onGoalCreated={fetchData}
      />

      <CreateTaskDialog
        open={showCreateTask}
        onOpenChange={setShowCreateTask}
        onTaskCreated={fetchData}
      />
    </div>
  );
}