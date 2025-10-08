import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';

interface Task {
  id: string;
  title: string;
  notes?: string;
  due_at?: string;
  status_column: 'todo' | 'doing' | 'done';
  assigned_to?: string;
}

interface KanbanBoardProps {
  tasks: Task[];
  onDragEnd: (result: DropResult) => void;
  onTaskClick: (task: Task) => void;
}

const columnConfig = {
  todo: {
    title: 'To Do',
    icon: Circle,
    color: 'text-muted-foreground',
    bg: 'bg-muted/20',
  },
  doing: {
    title: 'In Progress',
    icon: Clock,
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
  done: {
    title: 'Complete',
    icon: CheckCircle2,
    color: 'text-success',
    bg: 'bg-success/10',
  },
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onDragEnd,
  onTaskClick,
}) => {
  const columns = {
    todo: tasks.filter(t => t.status_column === 'todo'),
    doing: tasks.filter(t => t.status_column === 'doing'),
    done: tasks.filter(t => t.status_column === 'done'),
  };

  const handleDragEnd = (result: DropResult) => {
    if (result.destination?.droppableId === 'done' && result.source.droppableId !== 'done') {
      // Task completed - celebrate!
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
    onDragEnd(result);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(columnConfig).map(([columnId, config]) => {
          const Icon = config.icon;
          const columnTasks = columns[columnId as keyof typeof columns];

          return (
            <div key={columnId} className="flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Icon className={cn("h-5 w-5", config.color)} />
                <h3 className="font-semibold">{config.title}</h3>
                <Badge variant="secondary" className="ml-auto">
                  {columnTasks.length}
                </Badge>
              </div>

              <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "flex-1 rounded-lg p-3 transition-colors min-h-[200px]",
                      config.bg,
                      snapshot.isDraggingOver && "ring-2 ring-primary"
                    )}
                  >
                    <AnimatePresence>
                      {columnTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="mb-3"
                            >
                              <motion.div
                                layout
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                                whileHover={{ scale: 1.02 }}
                              >
                                <Card
                                  className={cn(
                                    "p-4 cursor-pointer transition-shadow hover:shadow-elevation-2",
                                    snapshot.isDragging && "shadow-elevation-4 rotate-2"
                                  )}
                                  onClick={() => onTaskClick(task)}
                                >
                                <h4 className="font-medium mb-2">{task.title}</h4>
                                
                                {task.notes && (
                                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                    {task.notes}
                                  </p>
                                )}

                                {task.due_at && (
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {format(new Date(task.due_at), 'MMM d')}
                                  </div>
                                )}
                                </Card>
                              </motion.div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </AnimatePresence>
                    {provided.placeholder}

                    {columnTasks.length === 0 && (
                      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                        No tasks
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};
