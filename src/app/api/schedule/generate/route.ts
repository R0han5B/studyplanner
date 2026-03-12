import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { generateStudySchedule } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const userPayload = await getCurrentUser();

    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { subjects, dailyHours, examDate } = body;

    if (!subjects || subjects.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one subject is required' },
        { status: 400 }
      );
    }

    // Generate schedule using Gemini
    const result = await generateStudySchedule({
      subjects,
      examDates: examDate ? [{ subject: subjects[0], date: examDate }] : [],
      dailyStudyHours: parseInt(dailyHours) || 4,
      difficultyLevels: subjects.map(s => ({ subject: s, level: 'medium' })),
      priorities: subjects.map(s => ({ subject: s, priority: 'medium' })),
    });

    return NextResponse.json({
      success: true,
      schedule: result.schedule,
      tips: result.tips,
    });
  } catch (error) {
    console.error('Generate schedule error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate schedule' },
      { status: 500 }
    );
  }
}
