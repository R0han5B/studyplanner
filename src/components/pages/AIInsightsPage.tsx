"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Target,
  Brain,
  BookOpen,
  Clock,
  RefreshCw,
  ChevronRight,
  Zap,
  Award,
  BarChart3,
  Send,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Insight {
  type: 'strength' | 'improvement' | 'recommendation' | 'alert';
  title: string;
  description: string;
  action?: string;
}

interface AIInsightsData {
  insights: Insight[];
  learningStyle: {
    Visual: number;
    'Reading/Writing': number;
    Auditory: number;
    Kinesthetic: number;
  };
  studyTip: string;
  answer?: string;
}

const learningStyles = [
  { style: 'Visual', key: 'Visual' as const },
  { style: 'Reading/Writing', key: 'Reading/Writing' as const },
  { style: 'Auditory', key: 'Auditory' as const },
  { style: 'Kinesthetic', key: 'Kinesthetic' as const },
];

const subjectRecommendations = [
  { subject: 'Mathematics', current: 78, target: 85, recommendation: 'Focus on integration techniques and practice 10 more problems daily.' },
  { subject: 'Physics', current: 65, target: 80, recommendation: 'Review mechanics fundamentals and complete lab reports on time.' },
  { subject: 'Chemistry', current: 45, target: 75, recommendation: 'Spend more time on organic chemistry. Use visual aids for molecular structures.' },
  { subject: 'Biology', current: 82, target: 90, recommendation: 'Great progress! Challenge yourself with advanced topics in genetics.' },
];

export function AIInsightsPage() {
  const { tasks } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [data, setData] = useState<AIInsightsData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'strength' | 'improvement' | 'recommendation' | 'alert'>('all');
  const [question, setQuestion] = useState('');
  const [chatAnswer, setChatAnswer] = useState<string | null>(null);

  // Load insights on mount
  useEffect(() => {
    generateInsights();
  }, []);

  const generateInsights = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const result = await response.json();
      if (result.success) {
        setData(result);
      }
    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) return;
    
    setIsChatLoading(true);
    setChatAnswer(null);
    
    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const result = await response.json();
      if (result.success && result.answer) {
        setChatAnswer(result.answer);
      }
    } catch (error) {
      console.error('Failed to get answer:', error);
      setChatAnswer('Sorry, I encountered an error. Please try again.');
    } finally {
      setIsChatLoading(false);
    }
  };

  const filteredInsights = data?.insights?.filter(
    (insight) => selectedCategory === 'all' || insight.type === selectedCategory
  ) || [];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'strength':
        return CheckCircle;
      case 'improvement':
        return TrendingUp;
      case 'recommendation':
        return Lightbulb;
      case 'alert':
        return AlertTriangle;
      default:
        return Sparkles;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'strength':
        return 'border-emerald-500/50 bg-emerald-500/5';
      case 'improvement':
        return 'border-amber-500/50 bg-amber-500/5';
      case 'recommendation':
        return 'border-blue-500/50 bg-blue-500/5';
      case 'alert':
        return 'border-rose-500/50 bg-rose-500/5';
      default:
        return 'border-border';
    }
  };

  const getInsightIconColor = (type: string) => {
    switch (type) {
      case 'strength':
        return 'text-emerald-500';
      case 'improvement':
        return 'text-amber-500';
      case 'recommendation':
        return 'text-blue-500';
      case 'alert':
        return 'text-rose-500';
      default:
        return 'text-muted-foreground';
    }
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
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-violet-500" />
            AI Insights
          </h2>
          <p className="text-muted-foreground">
            Personalized recommendations powered by Gemini AI
          </p>
        </div>
        <Button onClick={generateInsights} disabled={isLoading}>
          <RefreshCw className={cn('w-4 h-4 mr-2', isLoading && 'animate-spin')} />
          {isLoading ? 'Analyzing...' : 'Refresh Insights'}
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tasks Analyzed', value: tasks.length.toString(), icon: Target, color: 'text-violet-500' },
          { label: 'Insights Generated', value: data?.insights?.length?.toString() || '0', icon: Sparkles, color: 'text-amber-500' },
          { label: 'Learning Style', value: 'Mixed', icon: Brain, color: 'text-blue-500' },
          { label: 'Focus Areas', value: '3', icon: Zap, color: 'text-emerald-500' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-lg bg-muted flex items-center justify-center', stat.color)}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Insights List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Personalized Insights</CardTitle>
                <CardDescription>AI-powered analysis of your learning patterns</CardDescription>
              </div>
            </div>
            {/* Filter Tabs */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {[
                { id: 'all', label: 'All' },
                { id: 'strength', label: 'Strengths' },
                { id: 'improvement', label: 'Improvements' },
                { id: 'recommendation', label: 'Recommendations' },
                { id: 'alert', label: 'Alerts' },
              ].map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className="whitespace-nowrap"
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                // Loading skeleton
                [...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 rounded-xl border border-border animate-pulse">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/3" />
                        <div className="h-3 bg-muted rounded w-full" />
                        <div className="h-3 bg-muted rounded w-2/3" />
                      </div>
                    </div>
                  </div>
                ))
              ) : filteredInsights.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No insights yet. Start by tracking your tasks!</p>
                </div>
              ) : (
                <AnimatePresence>
                  {filteredInsights.map((insight, index) => {
                    const Icon = getInsightIcon(insight.type);
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          'p-4 rounded-xl border-2 transition-all cursor-pointer',
                          getInsightColor(insight.type),
                          'hover:shadow-md'
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <div className={cn('w-10 h-10 rounded-lg bg-muted flex items-center justify-center', getInsightIconColor(insight.type))}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">{insight.title}</h4>
                              <Badge variant="secondary" className="text-xs capitalize">
                                {insight.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {insight.description}
                            </p>
                            {insight.action && (
                              <Button variant="link" className="p-0 h-auto mt-2 text-sm">
                                {insight.action}
                                <ChevronRight className="w-3 h-3 ml-1" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Learning Profile */}
        <div className="space-y-6">
          {/* Learning Style */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Learning Style
              </CardTitle>
              <CardDescription>Your dominant learning preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {learningStyles.map((style) => (
                  <div key={style.style} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{style.style}</span>
                      <span className="font-medium">{data?.learningStyle?.[style.key] || 25}%</span>
                    </div>
                    <Progress value={data?.learningStyle?.[style.key] || 25} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Study Tip */}
          <Card className="bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border-violet-500/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                Study Tip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {data?.studyTip || 'Take regular breaks to improve retention and use active recall techniques for better memory consolidation.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Subject Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Subject-Specific Recommendations
          </CardTitle>
          <CardDescription>
            AI-generated action plans for each subject
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjectRecommendations.map((subject, index) => (
              <motion.div
                key={subject.subject}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl border border-border"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{subject.subject}</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">{subject.current}%</span>
                    <span>→</span>
                    <span className="text-violet-500 font-medium">{subject.target}%</span>
                  </div>
                </div>
                <Progress 
                  value={subject.current} 
                  className="h-2 mb-3"
                />
                <p className="text-sm text-muted-foreground">
                  {subject.recommendation}
                </p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Chat Interface */}
      <Card className="bg-gradient-to-r from-violet-500/5 to-indigo-500/5 border-violet-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-500" />
            Ask AI Coach
          </CardTitle>
          <CardDescription>
            Get personalized advice powered by Gemini AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Ask anything about your studies..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && askQuestion()}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <Button onClick={askQuestion} disabled={isChatLoading || !question.trim()}>
              {isChatLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          {/* Chat Answer */}
          {chatAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-lg bg-muted/50 border border-border"
            >
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-violet-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm whitespace-pre-wrap">{chatAnswer}</p>
                </div>
              </div>
            </motion.div>
          )}
          
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              'How can I improve my focus?',
              'What subjects should I prioritize?',
              'Create a study plan for me',
              'Analyze my weaknesses',
            ].map((q) => (
              <Button 
                key={q} 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setQuestion(q);
                  setTimeout(() => askQuestion(), 100);
                }}
              >
                {q}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
