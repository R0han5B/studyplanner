"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Clock,
  Flag,
  MoreVertical,
  Calendar,
  Trash2,
  Edit,
  GripVertical,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore, Task } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Mock tasks data
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Complete Physics Assignment',
    description: 'Chapter 5 problems on thermodynamics',
    status: 'pending',
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    completedAt: null,
    subject: 'Physics',
    tags: ['homework', 'urgent'],
    order: 0,
    estimatedMinutes: 120,
    actualMinutes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Study for Math Quiz',
    description: 'Review calculus integration techniques',
    status: 'in_progress',
    priority: 'high',
    dueDate: new Date(Date.now() + 172800000).toISOString(),
    completedAt: null,
    subject: 'Mathematics',
    tags: ['quiz', 'calculus'],
    order: 1,
    estimatedMinutes: 90,
    actualMinutes: 45,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Read Chemistry Chapter 8',
    description: 'Organic chemistry reactions',
    status: 'completed',
    priority: 'medium',
    dueDate: new Date(Date.now() - 86400000).toISOString(),
    completedAt: new Date().toISOString(),
    subject: 'Chemistry',
    tags: ['reading'],
    order: 2,
    estimatedMinutes: 60,
    actualMinutes: 55,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Write Biology Lab Report',
    description: 'Cell division observation lab',
    status: 'pending',
    priority: 'low',
    dueDate: new Date(Date.now() + 259200000).toISOString(),
    completedAt: null,
    subject: 'Biology',
    tags: ['lab', 'report'],
    order: 3,
    estimatedMinutes: 180,
    actualMinutes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Practice Programming Problems',
    description: 'LeetCode daily challenges',
    status: 'in_progress',
    priority: 'medium',
    dueDate: null,
    completedAt: null,
    subject: 'Computer Science',
    tags: ['coding', 'practice'],
    order: 4,
    estimatedMinutes: 45,
    actualMinutes: 20,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

interface SortableTaskProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

function SortableTask({ task, onToggleComplete, onDelete }: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'group relative flex items-start gap-3 p-4 rounded-xl border border-border bg-card',
        'hover:shadow-md hover:border-violet-500/30 transition-all duration-200',
        isDragging && 'shadow-lg ring-2 ring-violet-500 z-50',
        task.status === 'completed' && 'opacity-60'
      )}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="mt-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </button>

      {/* Checkbox */}
      <Checkbox
        checked={task.status === 'completed'}
        onCheckedChange={() => onToggleComplete(task.id)}
        className="mt-1"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <h4 className={cn(
              'font-medium',
              task.status === 'completed' && 'line-through text-muted-foreground'
            )}>
              {task.title}
            </h4>
            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="gap-2">
                <Edit className="w-4 h-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="gap-2 text-rose-500 focus:text-rose-500"
                onClick={() => onDelete(task.id)}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {task.subject && (
            <Badge variant="secondary" className="text-xs">
              {task.subject}
            </Badge>
          )}
          {task.priority && (
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                task.priority === 'high' && 'border-rose-500 text-rose-500',
                task.priority === 'medium' && 'border-amber-500 text-amber-500',
                task.priority === 'low' && 'border-emerald-500 text-emerald-500'
              )}
            >
              <Flag className="w-3 h-3 mr-1" />
              {task.priority}
            </Badge>
          )}
          {task.dueDate && (
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                isOverdue && 'border-rose-500 text-rose-500'
              )}
            >
              {isOverdue ? (
                <AlertCircle className="w-3 h-3 mr-1" />
              ) : (
                <Calendar className="w-3 h-3 mr-1" />
              )}
              {formatDueDate(task.dueDate)}
            </Badge>
          )}
          {task.estimatedMinutes && (
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {task.estimatedMinutes} min
            </Badge>
          )}
          {task.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function formatDueDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return `${Math.abs(days)} days ago`;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 7) return `${days} days`;
  return date.toLocaleDateString();
}

export function TaskManagerPage() {
  const { taskFilters, setTaskFilters } = useStore();
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    subject: '',
    dueDate: '',
  });
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Status filter
      if (activeFilter !== 'all' && task.status !== activeFilter) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.subject?.toLowerCase().includes(query) ||
          task.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }
      
      return true;
    });
  }, [tasks, activeFilter, searchQuery]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  };

  const toggleTaskComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              status: task.status === 'completed' ? 'pending' : 'completed',
              completedAt: task.status === 'completed' ? null : new Date().toISOString(),
            }
          : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const addTask = () => {
    if (!newTask.title.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description || null,
      status: 'pending',
      priority: newTask.priority,
      dueDate: newTask.dueDate || null,
      completedAt: null,
      subject: newTask.subject || null,
      tags: [],
      order: tasks.length,
      estimatedMinutes: null,
      actualMinutes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks((prev) => [task, ...prev]);
    setNewTask({ title: '', description: '', priority: 'medium', subject: '', dueDate: '' });
    setIsAddDialogOpen(false);
  };

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Task Manager</h2>
          <p className="text-muted-foreground">
            {taskStats.completed} of {taskStats.total} tasks completed
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Task title..."
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Task description..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(v: any) => setNewTask({ ...newTask, priority: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    placeholder="Subject..."
                    value={newTask.subject}
                    onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
              <Button onClick={addTask} className="w-full">
                Create Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', count: taskStats.total, color: 'text-foreground' },
          { label: 'Pending', count: taskStats.pending, color: 'text-amber-500' },
          { label: 'In Progress', count: taskStats.inProgress, color: 'text-blue-500' },
          { label: 'Completed', count: taskStats.completed, color: 'text-emerald-500' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={cn('text-2xl font-bold', stat.color)}>{stat.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'in_progress', 'completed'] as const).map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? 'default' : 'outline'}
              onClick={() => setActiveFilter(filter)}
              className="capitalize"
            >
              {filter === 'in_progress' ? 'In Progress' : filter}
            </Button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={filteredTasks} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            <AnimatePresence>
              {filteredTasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No tasks found</p>
                  <Button variant="link" onClick={() => setIsAddDialogOpen(true)}>
                    Add your first task
                  </Button>
                </motion.div>
              ) : (
                filteredTasks.map((task) => (
                  <SortableTask
                    key={task.id}
                    task={task}
                    onToggleComplete={toggleTaskComplete}
                    onDelete={deleteTask}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId ? (
            <div className="p-4 rounded-xl border border-violet-500 bg-card shadow-xl">
              {tasks.find((t) => t.id === activeId)?.title}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </motion.div>
  );
}
