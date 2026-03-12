import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateAIInsights, generateWithGemini } from '@/lib/gemini';

// POST /api/ai/insights - Generate AI insights
export async function POST(request: Request) {
  try {
    const userPayload = await getCurrentUser();

    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { question } = body;

    // Get user's data for analysis
    const [tasks, studySessions, skills] = await Promise.all([
      prisma.task.findMany({
        where: { userId: userPayload.userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.studySession.findMany({
        where: { userId: userPayload.userId },
        orderBy: { startTime: 'desc' },
        take: 30,
      }),
      prisma.skill.findMany({
        where: { userId: userPayload.userId },
      }),
    ]);

    // Calculate statistics
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const totalStudyMinutes = studySessions.reduce((acc, s) => acc + (s.duration || 0), 0);

    // Subject analysis
    const subjectStats: Record<string, { total: number; completed: number }> = {};
    tasks.forEach(task => {
      if (task.subject) {
        if (!subjectStats[task.subject]) {
          subjectStats[task.subject] = { total: 0, completed: 0 };
        }
        subjectStats[task.subject].total++;
        if (task.status === 'completed') {
          subjectStats[task.subject].completed++;
        }
      }
    });

    // Generate AI insights using Gemini
    const result = await generateAIInsights({
      completionRate,
      totalStudyMinutes,
      avgFocusScore: 75, // Default focus score
      subjectStats,
      skills: skills.map(s => ({
        name: s.name,
        level: s.level,
        progress: s.progress,
      })),
      question,
    });

    return NextResponse.json({
      success: true,
      insights: result.insights,
      learningStyle: result.learningStyle,
      studyTip: result.studyTip,
      answer: result.answer,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Generate AI insights error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
