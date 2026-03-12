"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  BookOpen,
  Target,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ScheduleEvent {
  id: string;
  title: string;
  subject: string;
  date: Date;
  startTime: string;
  endTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  aiGenerated: boolean;
}

const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Computer Science', 'Economics', 'Psychology', 'Art'];

// Mock schedule data
const mockEvents: ScheduleEvent[] = [
  {
    id: '1',
    title: 'Mathematics - Calculus Review',
    subject: 'Mathematics',
    date: new Date(),
    startTime: '09:00',
    endTime: '11:00',
    difficulty: 'hard',
    priority: 'high',
    completed: false,
    aiGenerated: true,
  },
  {
    id: '2',
    title: 'Physics - Mechanics Practice',
    subject: 'Physics',
    date: new Date(),
    startTime: '14:00',
    endTime: '16:00',
    difficulty: 'medium',
    priority: 'high',
    completed: false,
    aiGenerated: true,
  },
  {
    id: '3',
    title: 'Chemistry - Organic Reactions',
    subject: 'Chemistry',
    date: new Date(Date.now() + 86400000),
    startTime: '10:00',
    endTime: '12:00',
    difficulty: 'hard',
    priority: 'medium',
    completed: false,
    aiGenerated: true,
  },
  {
    id: '4',
    title: 'Biology - Cell Biology',
    subject: 'Biology',
    date: new Date(Date.now() + 172800000),
    startTime: '09:00',
    endTime: '10:30',
    difficulty: 'easy',
    priority: 'low',
    completed: false,
    aiGenerated: false,
  },
];

export function StudyPlannerPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [events, setEvents] = useState<ScheduleEvent[]>(mockEvents);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  
  // New event form
  const [newEvent, setNewEvent] = useState({
    title: '',
    subject: '',
    startTime: '09:00',
    endTime: '10:00',
    difficulty: 'medium' as const,
    priority: 'medium' as const,
  });

  // AI Schedule form
  const [aiScheduleForm, setAiScheduleForm] = useState({
    subjects: [] as string[],
    newSubject: '',
    dailyHours: '4',
    examDate: '',
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const previousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(event.date, date));
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const addSubjectToAIForm = () => {
    const subject = aiScheduleForm.newSubject.trim();
    if (subject && !aiScheduleForm.subjects.includes(subject)) {
      setAiScheduleForm(prev => ({
        ...prev,
        subjects: [...prev.subjects, subject],
        newSubject: '',
      }));
    }
  };

  const removeSubjectFromAIForm = (subject: string) => {
    setAiScheduleForm(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s !== subject),
    }));
  };

  const generateAISchedule = async () => {
    if (aiScheduleForm.subjects.length === 0) {
      alert('Please add at least one subject');
      return;
    }

    setIsGenerating(true);

    try {
      // Call the Gemini API to generate schedule
      const response = await fetch('/api/schedule/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects: aiScheduleForm.subjects,
          dailyStudyHours: parseInt(aiScheduleForm.dailyHours),
          examDate: aiScheduleForm.examDate || null,
        }),
      });

      const result = await response.json();

      if (result.success && result.schedule) {
        // Convert the generated schedule to events
        const generatedEvents: ScheduleEvent[] = result.schedule.flatMap((day: any, dayIndex: number) => 
          day.sessions.map((session: any, sessionIndex: number) => ({
            id: `ai-${Date.now()}-${dayIndex}-${sessionIndex}`,
            title: session.focus || `${session.subject} Study Session`,
            subject: session.subject,
            date: new Date(day.date),
            startTime: session.startTime,
            endTime: session.endTime,
            difficulty: 'medium' as const,
            priority: 'medium' as const,
            completed: false,
            aiGenerated: true,
          }))
        );

        setEvents((prev) => [...prev, ...generatedEvents]);
        setShowAIDialog(false);
        setAiScheduleForm({
          subjects: [],
          newSubject: '',
          dailyHours: '4',
          examDate: '',
        });
      } else {
        // Fallback to local generation if API fails
        const generatedEvents: ScheduleEvent[] = [];
        const today = new Date();
        
        for (let day = 0; day < 7; day++) {
          const date = new Date(today);
          date.setDate(date.getDate() + day);
          
          let currentHour = 9;
          for (const subject of aiScheduleForm.subjects) {
            generatedEvents.push({
              id: `ai-${Date.now()}-${day}-${subject}`,
              title: `AI Generated: ${subject}`,
              subject: subject,
              date: date,
              startTime: `${String(currentHour).padStart(2, '0')}:00`,
              endTime: `${String(currentHour + 1).padStart(2, '0')}:00`,
              difficulty: 'medium' as const,
              priority: 'high' as const,
              completed: false,
              aiGenerated: true,
            });
            currentHour += 2;
          }
        }

        setEvents((prev) => [...prev, ...generatedEvents]);
        setShowAIDialog(false);
      }
    } catch (error) {
      console.error('Error generating AI schedule:', error);
      alert('Failed to generate schedule. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const addEvent = () => {
    if (!newEvent.title || !newEvent.subject || !selectedDate) return;

    const event: ScheduleEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      subject: newEvent.subject,
      date: selectedDate,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      difficulty: newEvent.difficulty,
      priority: newEvent.priority,
      completed: false,
      aiGenerated: false,
    };

    setEvents((prev) => [...prev, event]);
    setNewEvent({
      title: '',
      subject: '',
      startTime: '09:00',
      endTime: '10:00',
      difficulty: 'medium',
      priority: 'medium',
    });
    setShowAddDialog(false);
  };

  const toggleEventComplete = (id: string) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id ? { ...event, completed: !event.completed } : event
      )
    );
  };

  const totalStudyHours = events.reduce((acc, event) => {
    const start = parseInt(event.startTime.split(':')[0]);
    const end = parseInt(event.endTime.split(':')[0]);
    return acc + (end - start);
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Study Planner</h2>
          <p className="text-muted-foreground">
            Plan and schedule your study sessions with AI assistance
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate AI Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-500" />
                  Generate AI Schedule
                </DialogTitle>
                <DialogDescription>
                  Let AI create an optimized study schedule for you
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                {/* Subjects Input */}
                <div className="space-y-2">
                  <Label>Subjects to Study</Label>
                  <div className="flex gap-2">
                    <Select
                      value={aiScheduleForm.newSubject}
                      onValueChange={(v) => setAiScheduleForm(prev => ({ ...prev, newSubject: v }))}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.filter(s => !aiScheduleForm.subjects.includes(s)).map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" onClick={addSubjectToAIForm}>Add</Button>
                  </div>
                  {/* Selected Subjects */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {aiScheduleForm.subjects.map((subject) => (
                      <Badge key={subject} variant="secondary" className="gap-1">
                        {subject}
                        <button onClick={() => removeSubjectFromAIForm(subject)} className="ml-1 hover:text-destructive">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Daily Hours */}
                <div className="space-y-2">
                  <Label>Hours per Day</Label>
                  <Select
                    value={aiScheduleForm.dailyHours}
                    onValueChange={(v) => setAiScheduleForm(prev => ({ ...prev, dailyHours: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 hours</SelectItem>
                      <SelectItem value="4">4 hours</SelectItem>
                      <SelectItem value="6">6 hours</SelectItem>
                      <SelectItem value="8">8 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Exam Date */}
                <div className="space-y-2">
                  <Label>Exam Date (Optional)</Label>
                  <Input
                    type="date"
                    value={aiScheduleForm.examDate}
                    onChange={(e) => setAiScheduleForm(prev => ({ ...prev, examDate: e.target.value }))}
                  />
                </div>

                <Button 
                  className="w-full" 
                  onClick={generateAISchedule}
                  disabled={isGenerating || aiScheduleForm.subjects.length === 0}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Schedule
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Study Session</DialogTitle>
                <DialogDescription>
                  Schedule a new study session for {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="Study session title..."
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select
                    value={newEvent.subject}
                    onValueChange={(v) => setNewEvent({ ...newEvent, subject: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select
                      value={newEvent.difficulty}
                      onValueChange={(v: any) => setNewEvent({ ...newEvent, difficulty: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={newEvent.priority}
                      onValueChange={(v: any) => setNewEvent({ ...newEvent, priority: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={addEvent} className="w-full">
                  Add Session
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Hours This Week', value: `${totalStudyHours}h`, icon: Clock, color: 'text-violet-500' },
          { label: 'Sessions Scheduled', value: events.length.toString(), icon: CalendarIcon, color: 'text-blue-500' },
          { label: 'AI Generated', value: events.filter((e) => e.aiGenerated).length.toString(), icon: Sparkles, color: 'text-amber-500' },
          { label: 'Completed', value: events.filter((e) => e.completed).length.toString(), icon: CheckCircle, color: 'text-emerald-500' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={cn('w-10 h-10 rounded-lg bg-muted flex items-center justify-center', stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{format(currentDate, 'MMMM yyyy')}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={previousMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Weekday Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
              
              {/* Empty cells for days before month start */}
              {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="p-2 aspect-square" />
              ))}
              
              {/* Days */}
              {days.map((day) => {
                const dayEvents = getEventsForDate(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const hasEvents = dayEvents.length > 0;

                return (
                  <motion.button
                    key={day.toISOString()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      'p-2 aspect-square rounded-lg text-sm relative transition-colors',
                      'hover:bg-muted',
                      isSelected && 'bg-violet-500 text-white hover:bg-violet-600',
                      isToday(day) && !isSelected && 'ring-2 ring-violet-500',
                      !isSameMonth(day, currentDate) && 'text-muted-foreground opacity-50'
                    )}
                  >
                    <span>{format(day, 'd')}</span>
                    {hasEvents && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {dayEvents.slice(0, 3).map((event, i) => (
                          <div
                            key={i}
                            className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              isSelected ? 'bg-white' : 'bg-violet-500'
                            )}
                            title={event.subject}
                          />
                        ))}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a date'}
            </CardTitle>
            <CardDescription>
              {selectedDateEvents.length} sessions scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedDateEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No sessions scheduled</p>
                  <Button variant="link" size="sm" onClick={() => setShowAddDialog(true)}>
                    Add a session
                  </Button>
                </div>
              ) : (
                selectedDateEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'p-4 rounded-lg border border-border',
                      'hover:shadow-md transition-shadow',
                      event.completed && 'opacity-60'
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {event.aiGenerated && (
                          <Sparkles className="w-4 h-4 text-amber-500" />
                        )}
                        <h4 className={cn(
                          'font-medium',
                          event.completed && 'line-through'
                        )}>
                          {event.title}
                        </h4>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => toggleEventComplete(event.id)}
                      >
                        {event.completed ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {event.subject}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs',
                          event.difficulty === 'hard' && 'border-rose-500 text-rose-500',
                          event.difficulty === 'medium' && 'border-amber-500 text-amber-500',
                          event.difficulty === 'easy' && 'border-emerald-500 text-emerald-500'
                        )}
                      >
                        {event.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {event.startTime} - {event.endTime}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
