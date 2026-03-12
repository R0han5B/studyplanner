"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Target,
  Award,
  BookOpen,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

// Mock data
const weeklyStudyData = [
  { day: 'Mon', hours: 4.5, target: 5 },
  { day: 'Tue', hours: 3.2, target: 5 },
  { day: 'Wed', hours: 5.1, target: 5 },
  { day: 'Thu', hours: 2.8, target: 5 },
  { day: 'Fri', hours: 4.0, target: 5 },
  { day: 'Sat', hours: 6.2, target: 6 },
  { day: 'Sun', hours: 3.5, target: 4 },
];

const monthlyData = [
  { week: 'Week 1', hours: 28, tasks: 45 },
  { week: 'Week 2', hours: 32, tasks: 52 },
  { week: 'Week 3', hours: 25, tasks: 38 },
  { week: 'Week 4', hours: 35, tasks: 58 },
];

const subjectData = [
  { name: 'Mathematics', value: 35, color: '#8b5cf6' },
  { name: 'Physics', value: 25, color: '#06b6d4' },
  { name: 'Chemistry', value: 20, color: '#10b981' },
  { name: 'Biology', value: 15, color: '#f59e0b' },
  { name: 'English', value: 5, color: '#ec4899' },
];

const skillRadar = [
  { subject: 'Problem Solving', score: 85 },
  { subject: 'Time Management', score: 72 },
  { subject: 'Focus', score: 90 },
  { subject: 'Consistency', score: 78 },
  { subject: 'Comprehension', score: 88 },
  { subject: 'Memory', score: 65 },
];

const completionRate = [
  { day: 'Mon', rate: 80 },
  { day: 'Tue', rate: 65 },
  { day: 'Wed', rate: 90 },
  { day: 'Thu', rate: 55 },
  { day: 'Fri', rate: 75 },
  { day: 'Sat', rate: 95 },
  { day: 'Sun', rate: 70 },
];

const topPerformingTopics = [
  { topic: 'Calculus Integration', score: 95, trend: 'up' },
  { topic: 'Newton\'s Laws', score: 88, trend: 'up' },
  { topic: 'Cell Biology', score: 85, trend: 'stable' },
  { topic: 'Organic Reactions', score: 72, trend: 'down' },
  { topic: 'Essay Writing', score: 90, trend: 'up' },
];

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  const stats = [
    {
      label: 'Total Study Hours',
      value: '127.5h',
      change: '+12.5%',
      trend: 'up',
      icon: Clock,
      color: 'text-violet-500',
    },
    {
      label: 'Tasks Completed',
      value: '248',
      change: '+8%',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-emerald-500',
    },
    {
      label: 'Avg. Focus Score',
      value: '87%',
      change: '+5%',
      trend: 'up',
      icon: Target,
      color: 'text-blue-500',
    },
    {
      label: 'Current Streak',
      value: '7 days',
      change: '+2',
      trend: 'up',
      icon: Award,
      color: 'text-amber-500',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Analytics Dashboard
          </h2>
          <p className="text-muted-foreground">
            Detailed insights into your learning progress
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {stat.trend === 'up' ? (
                          <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 text-rose-500" />
                        )}
                        <span className={cn(
                          'text-xs font-medium',
                          stat.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'
                        )}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div className={cn('w-10 h-10 rounded-lg bg-muted flex items-center justify-center', stat.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Study Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Study Hours</CardTitle>
            <CardDescription>Hours studied vs target</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyStudyData}>
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
                  <Legend />
                  <Bar dataKey="hours" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Hours" />
                  <Bar dataKey="target" fill="#e5e7eb" radius={[4, 4, 0, 0]} name="Target" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Subject Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Study Time by Subject</CardTitle>
            <CardDescription>Distribution of your study hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {subjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Progress Trend</CardTitle>
            <CardDescription>Study hours and tasks over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="week" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="#8b5cf6"
                    fillOpacity={1}
                    fill="url(#colorHours)"
                    name="Hours"
                  />
                  <Area
                    type="monotone"
                    dataKey="tasks"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorTasks)"
                    name="Tasks"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Skill Radar */}
        <Card>
          <CardHeader>
            <CardTitle>Skill Assessment</CardTitle>
            <CardDescription>Your learning competencies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillRadar}>
                  <PolarGrid className="stroke-muted" />
                  <PolarAngleAxis dataKey="subject" className="text-xs" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.3}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completion Rate Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Task Completion Rate</CardTitle>
          <CardDescription>Percentage of tasks completed each day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={completionRate}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis domain={[0, 100]} className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => [`${value}%`, 'Completion Rate']}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Top Performing Topics
            </CardTitle>
            <CardDescription>Based on your recent assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformingTopics.map((topic, index) => (
                <motion.div
                  key={topic.topic}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{topic.topic}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{topic.score}%</span>
                        {topic.trend === 'up' && <ArrowUpRight className="w-3 h-3 text-emerald-500" />}
                        {topic.trend === 'down' && <ArrowDownRight className="w-3 h-3 text-rose-500" />}
                      </div>
                    </div>
                    <Progress value={topic.score} className="h-2" />
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Insights */}
        <Card className="bg-gradient-to-br from-violet-500/5 to-indigo-500/5 border-violet-500/20">
          <CardHeader>
            <CardTitle>Weekly Insights</CardTitle>
            <CardDescription>Key takeaways from your data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  icon: TrendingUp,
                  title: 'Best Performance Day',
                  value: 'Saturday',
                  description: '6.2 hours studied, 95% completion',
                  color: 'text-emerald-500',
                },
                {
                  icon: Clock,
                  title: 'Peak Hours',
                  value: '9 AM - 11 AM',
                  description: 'Highest focus scores during this time',
                  color: 'text-blue-500',
                },
                {
                  icon: BookOpen,
                  title: 'Most Studied Subject',
                  value: 'Mathematics',
                  description: '35% of total study time',
                  color: 'text-violet-500',
                },
                {
                  icon: Target,
                  title: 'Weekly Goal Progress',
                  value: '87%',
                  description: 'On track to exceed weekly targets',
                  color: 'text-amber-500',
                },
              ].map((insight, index) => {
                const Icon = insight.icon;
                return (
                  <motion.div
                    key={insight.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-background"
                  >
                    <div className={cn('w-8 h-8 rounded-lg bg-muted flex items-center justify-center', insight.color)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{insight.title}</span>
                        <span className="text-sm font-semibold">{insight.value}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{insight.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
