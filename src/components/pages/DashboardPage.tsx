"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
  TrendingUp,
  Target,
  Calendar,
  ArrowRight,
  Sparkles,
  Award,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Mock data for charts
const weeklyData = [
  { day: 'Mon', hours: 4.5, tasks: 8 },
  { day: 'Tue', hours: 3.2, tasks: 5 },
  { day: 'Wed', hours: 5.1, tasks: 10 },
  { day: 'Thu', hours: 2.8, tasks: 4 },
  { day: 'Fri', hours: 4.0, tasks: 7 },
  { day: 'Sat', hours: 6.2, tasks: 12 },
  { day: 'Sun', hours: 3.5, tasks: 6 },
];

const subjectProgress = [
  { subject: 'Mathematics', progress: 78, color: '#8b5cf6' },
  { subject: 'Physics', progress: 65, color: '#06b6d4' },
  { subject: 'Chemistry', progress: 82, color: '#10b981' },
  { subject: 'Biology', progress: 45, color: '#f59e0b' },
  { subject: 'English', progress: 90, color: '#ec4899' },
];

const recentActivity = [
  { id: 1, type: 'task', title: 'Completed Physics Assignment', time: '2 hours ago', icon: CheckCircle2 },
  { id: 2, type: 'session', title: 'Study Session - Mathematics', time: '4 hours ago', icon: Clock },
  { id: 3, type: 'achievement', title: 'Earned "Week Warrior" badge', time: 'Yesterday', icon: Award },
  { id: 4, type: 'ai', title: 'AI suggested new study plan', time: 'Yesterday', icon: Sparkles },
];

const upcomingTasks = [
  { id: 1, title: 'Math Quiz Preparation', due: 'Today, 3:00 PM', priority: 'high' },
  { id: 2, title: 'Physics Lab Report', due: 'Tomorrow', priority: 'medium' },
  { id: 3, title: 'Chemistry Notes Review', due: 'Wed, Jan 15', priority: 'low' },
];

export function DashboardPage() {
  const { user, tasks, setCurrentPage } = useStore();

  const stats = [
    {
      title: 'Study Hours Today',
      value: '4.5h',
      change: '+0.5h',
      icon: Clock,
      color: 'from-violet-500 to-purple-600',
      trend: 'up',
    },
    {
      title: 'Tasks Completed',
      value: '12/15',
      change: '80%',
      icon: CheckCircle2,
      color: 'from-emerald-500 to-teal-600',
      trend: 'up',
    },
    {
      title: 'Current Streak',
      value: '7 days',
      change: '+2',
      icon: Flame,
      color: 'from-amber-500 to-orange-600',
      trend: 'up',
    },
    {
      title: 'Focus Score',
      value: '87%',
      change: '+5%',
      icon: Target,
      color: 'from-cyan-500 to-blue-600',
      trend: 'up',
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Banner */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-purple-500/10 border-violet-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">
                  Good {getTimeOfDay()}, {user?.name?.split(' ')[0] || 'Student'}! 👋
                </h2>
                <p className="text-muted-foreground">
                  You've studied for <span className="font-semibold text-violet-500">4.5 hours</span> today.
                  Keep up the great work!
                </p>
                <div className="flex gap-3 mt-4">
                  <Button onClick={() => setCurrentPage('planner')} className="gap-2">
                    <Calendar className="w-4 h-4" />
                    Plan Today
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentPage('productivity')} className="gap-2">
                    <Zap className="w-4 h-4" />
                    Quick Focus
                  </Button>
                </div>
              </div>
              <div className="hidden md:block">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-12 h-12 text-white" />
                  </div>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                      <Badge variant="secondary" className="text-xs">
                        {stat.change} from yesterday
                      </Badge>
                    </div>
                    <div className={cn(
                      'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg',
                      stat.color
                    )}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  {/* Background decoration */}
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br opacity-5 rounded-full" />
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>Your study hours and tasks completed</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-1">
                This Week
                <ArrowRight className="w-3 h-3" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="hours"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorHours)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Subject Progress */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Subject Progress</CardTitle>
              <CardDescription>Your mastery by subject</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subjectProgress.map((subject) => (
                <div key={subject.subject} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{subject.subject}</span>
                    <span className="text-muted-foreground">{subject.progress}%</span>
                  </div>
                  <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${subject.progress}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="absolute h-full rounded-full"
                      style={{ backgroundColor: subject.color }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest learning activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Tasks */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Tasks</CardTitle>
                <CardDescription>Tasks due soon</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setCurrentPage('tasks')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-3 rounded-lg border border-border hover:border-violet-500/50 transition-colors cursor-pointer"
                  >
                    <div className={cn(
                      'w-3 h-3 rounded-full',
                      task.priority === 'high' && 'bg-rose-500',
                      task.priority === 'medium' && 'bg-amber-500',
                      task.priority === 'low' && 'bg-emerald-500'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.due}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Recommendations */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-indigo-500/5 to-violet-500/5 border-indigo-500/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-500" />
              <CardTitle>AI Recommendations</CardTitle>
            </div>
            <CardDescription>Personalized suggestions based on your learning patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: 'Focus on Chemistry',
                  description: 'Your chemistry scores have dropped 15% this week. Consider scheduling extra practice sessions.',
                  action: 'Schedule Session',
                },
                {
                  title: 'Take a Break',
                  description: 'You\'ve studied for 6 hours straight. A 15-minute break will improve retention.',
                  action: 'Start Break',
                },
                {
                  title: 'Optimal Study Time',
                  description: 'Your peak performance is between 9-11 AM. Schedule difficult subjects then.',
                  action: 'Adjust Schedule',
                },
              ].map((rec, index) => (
                <motion.div
                  key={rec.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-xl bg-background border border-border"
                >
                  <h4 className="font-medium mb-2">{rec.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                  <Button variant="outline" size="sm" className="w-full">
                    {rec.action}
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}
