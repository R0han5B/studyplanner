"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Brain,
  Target,
  CheckCircle,
  Flame,
  BarChart3,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Timer settings
const TIMER_SETTINGS = {
  work: 25 * 60, // 25 minutes
  shortBreak: 5 * 60, // 5 minutes
  longBreak: 15 * 60, // 15 minutes
};

// Mock productivity data
const weeklyHeatmap = [
  { day: 'Mon', hours: [0, 0, 0, 1, 2, 3, 2, 1, 2, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { day: 'Tue', hours: [0, 0, 0, 0, 0, 1, 2, 3, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0] },
  { day: 'Wed', hours: [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 2, 1, 2, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0] },
  { day: 'Thu', hours: [0, 0, 0, 0, 1, 2, 2, 1, 0, 0, 0, 0, 0, 0, 1, 2, 3, 2, 1, 0, 0, 0, 0, 0] },
  { day: 'Fri', hours: [0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { day: 'Sat', hours: [0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 2, 2, 1, 1, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0] },
  { day: 'Sun', hours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
];

const sessionsToday = [
  { id: 1, subject: 'Mathematics', duration: 25, completed: true, time: '9:00 AM' },
  { id: 2, subject: 'Physics', duration: 25, completed: true, time: '10:00 AM' },
  { id: 3, subject: 'Chemistry', duration: 25, completed: true, time: '11:00 AM' },
  { id: 4, subject: 'Biology', duration: 15, completed: false, time: '2:00 PM' },
];

export function ProductivityPage() {
  const { currentPomodoro, updatePomodoro, resetPomodoro } = useStore();
  const [timerType, setTimerType] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [timeLeft, setTimeLeft] = useState(TIMER_SETTINGS.work);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(3);
  const [currentTask] = useState('Mathematics - Calculus');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect - handles countdown and completion
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer complete - stop the interval
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            // Use a microtask to update state after the current render
            queueMicrotask(() => {
              setIsRunning(false);
              setSessionsCompleted((s) => {
                const newCount = s + 1;
                const nextBreak = newCount % 4 === 0 ? 'longBreak' : 'shortBreak';
                setTimerType(nextBreak);
                setTimeLeft(TIMER_SETTINGS[nextBreak]);
                return newCount;
              });
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timerType]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(TIMER_SETTINGS[timerType]);
  };

  const switchTimerType = (type: 'work' | 'shortBreak' | 'longBreak') => {
    setIsRunning(false);
    setTimerType(type);
    setTimeLeft(TIMER_SETTINGS[type]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((TIMER_SETTINGS[timerType] - timeLeft) / TIMER_SETTINGS[timerType]) * 100;

  const todayStats = {
    studyHours: 4.5,
    sessionsCompleted: sessionsCompleted,
    focusScore: 87,
    streak: 7,
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
          <h2 className="text-2xl font-bold">Productivity Tracker</h2>
          <p className="text-muted-foreground">
            Focus sessions and Pomodoro timer
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="gap-1">
            <Flame className="w-3 h-3" />
            {todayStats.streak} day streak
          </Badge>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Study Hours Today', value: `${todayStats.studyHours}h`, icon: Timer, color: 'text-violet-500' },
          { label: 'Sessions Completed', value: todayStats.sessionsCompleted.toString(), icon: CheckCircle, color: 'text-emerald-500' },
          { label: 'Focus Score', value: `${todayStats.focusScore}%`, icon: Target, color: 'text-blue-500' },
          { label: 'Current Streak', value: `${todayStats.streak} days`, icon: Flame, color: 'text-amber-500' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
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
        {/* Pomodoro Timer */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="w-5 h-5" />
              Pomodoro Timer
            </CardTitle>
            <CardDescription>
              Stay focused with the Pomodoro Technique
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Timer Type Tabs */}
            <Tabs value={timerType} onValueChange={(v: any) => switchTimerType(v)} className="mb-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="work" className="gap-2">
                  <Brain className="w-4 h-4" />
                  Focus
                </TabsTrigger>
                <TabsTrigger value="shortBreak" className="gap-2">
                  <Coffee className="w-4 h-4" />
                  Short Break
                </TabsTrigger>
                <TabsTrigger value="longBreak" className="gap-2">
                  <Coffee className="w-4 h-4" />
                  Long Break
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Timer Display */}
            <div className="flex flex-col items-center py-8">
              {/* Circular Progress */}
              <div className="relative w-64 h-64">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted"
                  />
                  <motion.circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    className={cn(
                      timerType === 'work' && 'text-violet-500',
                      timerType === 'shortBreak' && 'text-emerald-500',
                      timerType === 'longBreak' && 'text-blue-500'
                    )}
                    style={{
                      strokeDasharray: 2 * Math.PI * 120,
                      strokeDashoffset: 2 * Math.PI * 120 * (1 - progress / 100),
                    }}
                    initial={false}
                    animate={{ strokeDashoffset: 2 * Math.PI * 120 * (1 - progress / 100) }}
                    transition={{ duration: 0.5 }}
                  />
                </svg>
                
                {/* Time Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    key={timeLeft}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-6xl font-bold tabular-nums"
                  >
                    {formatTime(timeLeft)}
                  </motion.span>
                  {timerType === 'work' && currentTask && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {currentTask}
                    </p>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-12 h-12 rounded-full"
                  onClick={resetTimer}
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleTimer}
                  className={cn(
                    'w-16 h-16 rounded-full flex items-center justify-center',
                    'shadow-lg transition-colors',
                    timerType === 'work' && 'bg-violet-500 hover:bg-violet-600 text-white',
                    timerType === 'shortBreak' && 'bg-emerald-500 hover:bg-emerald-600 text-white',
                    timerType === 'longBreak' && 'bg-blue-500 hover:bg-blue-600 text-white'
                  )}
                >
                  {isRunning ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-1" />
                  )}
                </motion.button>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-12 h-12 rounded-full"
                >
                  <Zap className="w-5 h-5" />
                </Button>
              </div>

              {/* Session Indicators */}
              <div className="flex items-center gap-2 mt-6">
                <span className="text-sm text-muted-foreground">Session:</span>
                {[1, 2, 3, 4].map((session) => (
                  <div
                    key={session}
                    className={cn(
                      'w-3 h-3 rounded-full',
                      session <= sessionsCompleted % 4 || (sessionsCompleted % 4 === 0 && sessionsCompleted > 0)
                        ? 'bg-violet-500'
                        : 'bg-muted'
                    )}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Today's Sessions</CardTitle>
            <CardDescription>
              {sessionsToday.length} sessions recorded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessionsToday.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border border-border',
                    session.completed && 'bg-emerald-500/5 border-emerald-500/20'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center',
                    session.completed ? 'bg-emerald-500/10' : 'bg-muted'
                  )}>
                    {session.completed ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Timer className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{session.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.duration} min • {session.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Productivity Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Weekly Activity Heatmap
          </CardTitle>
          <CardDescription>
            Your most productive hours this week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Hour Labels */}
              <div className="flex mb-2">
                <div className="w-12" />
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 text-center text-xs text-muted-foreground"
                  >
                    {i % 6 === 0 ? `${i}` : ''}
                  </div>
                ))}
              </div>

              {/* Heatmap Grid */}
              {weeklyHeatmap.map((row) => (
                <div key={row.day} className="flex items-center gap-1 mb-1">
                  <div className="w-12 text-xs text-muted-foreground">{row.day}</div>
                  <div className="flex gap-0.5 flex-1">
                    {row.hours.map((intensity, hour) => (
                      <div
                        key={hour}
                        className={cn(
                          'flex-1 h-6 rounded-sm',
                          intensity === 0 && 'bg-muted',
                          intensity === 1 && 'bg-violet-200 dark:bg-violet-900',
                          intensity === 2 && 'bg-violet-400 dark:bg-violet-700',
                          intensity === 3 && 'bg-violet-600 dark:bg-violet-500'
                        )}
                        title={`${row.day} ${hour}:00 - ${intensity > 0 ? `${intensity}h studied` : 'No activity'}`}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Legend */}
              <div className="flex items-center justify-end gap-2 mt-4">
                <span className="text-xs text-muted-foreground">Less</span>
                <div className="flex gap-1">
                  <div className="w-4 h-4 rounded-sm bg-muted" />
                  <div className="w-4 h-4 rounded-sm bg-violet-200 dark:bg-violet-900" />
                  <div className="w-4 h-4 rounded-sm bg-violet-400 dark:bg-violet-700" />
                  <div className="w-4 h-4 rounded-sm bg-violet-600 dark:bg-violet-500" />
                </div>
                <span className="text-xs text-muted-foreground">More</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: 'Quick Focus Session',
            description: 'Start a 25-minute focus session immediately',
            icon: Zap,
            color: 'from-violet-500 to-purple-600',
            action: () => {
              setTimerType('work');
              setTimeLeft(TIMER_SETTINGS.work);
              setIsRunning(true);
            },
          },
          {
            title: 'Take a Break',
            description: '5-minute break to recharge',
            icon: Coffee,
            color: 'from-emerald-500 to-teal-600',
            action: () => {
              setTimerType('shortBreak');
              setTimeLeft(TIMER_SETTINGS.shortBreak);
              setIsRunning(true);
            },
          },
          {
            title: 'Long Break',
            description: '15-minute break after 4 sessions',
            icon: Coffee,
            color: 'from-blue-500 to-cyan-600',
            action: () => {
              setTimerType('longBreak');
              setTimeLeft(TIMER_SETTINGS.longBreak);
              setIsRunning(true);
            },
          },
        ].map((action) => (
          <motion.div
            key={action.title}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className="cursor-pointer overflow-hidden"
              onClick={action.action}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center',
                    action.color
                  )}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
