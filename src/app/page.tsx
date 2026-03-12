"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { LoginPage } from '@/components/pages/LoginPage';
import { DashboardPage } from '@/components/pages/DashboardPage';
import { TaskManagerPage } from '@/components/pages/TaskManagerPage';
import { StudyPlannerPage } from '@/components/pages/StudyPlannerPage';
import { ProductivityPage } from '@/components/pages/ProductivityPage';
import { AIInsightsPage } from '@/components/pages/AIInsightsPage';
import { AnalyticsPage } from '@/components/pages/AnalyticsPage';
import { SettingsPage } from '@/components/pages/SettingsPage';
import { cn } from '@/lib/utils';

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-32 mx-auto bg-muted rounded animate-pulse" />
          <div className="h-3 w-48 mx-auto bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// Page transition wrapper
function PageTransition({ children, pageKey }: { children: React.ReactNode; pageKey: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className="h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default function HomePage() {
  const { user, isAuthenticated, isLoading, setUser, setIsAuthenticated, setIsLoading, currentPage, sidebarOpen } = useStore();
  const [mounted, setMounted] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      
      if (data.success && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Show loading skeleton while checking auth
  if (!mounted || isLoading) {
    return <LoadingSkeleton />;
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Render the current page based on state
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'tasks':
        return <TaskManagerPage />;
      case 'planner':
        return <StudyPlannerPage />;
      case 'productivity':
        return <ProductivityPage />;
      case 'insights':
        return <AIInsightsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div
        className={cn(
          'transition-all duration-200',
          sidebarOpen ? 'ml-[280px]' : 'ml-[80px]'
        )}
      >
        {/* Navbar */}
        <Navbar />
        
        {/* Page Content */}
        <main className="pt-16 p-6 min-h-screen">
          <PageTransition pageKey={currentPage}>
            <div className="max-w-7xl mx-auto">
              {renderPage()}
            </div>
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
