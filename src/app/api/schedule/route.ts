import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/schedule - Get all schedules for the current user
export async function GET() {
  try {
    const userPayload = await getCurrentUser();

    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const schedules = await prisma.schedule.findMany({
      where: { userId: userPayload.userId },
      orderBy: { startDate: 'asc' },
    });

    return NextResponse.json({
      success: true,
      schedules: schedules.map(s => ({
        ...s,
        scheduleData: s.scheduleData ? JSON.parse(s.scheduleData) : null,
      })),
    });
  } catch (error) {
    console.error('Get schedules error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/schedule - Generate AI schedule
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
    const {
      subjects,
      examDates,
      dailyStudyHours,
      difficultyLevels,
      priorities,
    } = body;

    // Generate AI schedule (simplified version)
    // In production, this would use the z-ai-web-dev-sdk
    const scheduleData = generateSchedule(
      subjects,
      examDates,
      dailyStudyHours,
      difficultyLevels,
      priorities
    );

    // Save the schedule
    const schedule = await prisma.schedule.create({
      data: {
        title: 'AI Generated Study Schedule',
        subject: subjects.join(', '),
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        hoursPerDay: dailyStudyHours,
        difficulty: 'medium',
        priority: 'high',
        scheduleData: JSON.stringify(scheduleData),
        aiGenerated: true,
        userId: userPayload.userId,
      },
    });

    return NextResponse.json({
      success: true,
      schedule: {
        ...schedule,
        scheduleData: JSON.parse(schedule.scheduleData || 'null'),
      },
      message: 'Schedule generated successfully',
    });
  } catch (error) {
    console.error('Generate schedule error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to generate schedule (simplified)
function generateSchedule(
  subjects: string[],
  examDates: any[],
  dailyHours: number,
  difficulties: any[],
  priorities: any[]
) {
  const schedule: any[] = [];
  const today = new Date();
  
  // Generate a 7-day schedule
  for (let day = 0; day < 7; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() + day);
    
    // Calculate hours per subject based on priority and difficulty
    const hoursPerSubject = dailyHours / subjects.length;
    
    subjects.forEach((subject, index) => {
      const priority = priorities.find(p => p.subject === subject)?.priority || 'medium';
      const difficulty = difficulties.find(d => d.subject === subject)?.level || 'medium';
      
      // Adjust hours based on priority and difficulty
      let adjustedHours = hoursPerSubject;
      if (priority === 'high') adjustedHours *= 1.3;
      if (priority === 'low') adjustedHours *= 0.7;
      if (difficulty === 'hard') adjustedHours *= 1.2;
      if (difficulty === 'easy') adjustedHours *= 0.8;
      
      schedule.push({
        day: day + 1,
        date: date.toISOString().split('T')[0],
        subject,
        hours: Math.round(adjustedHours * 10) / 10,
        priority,
        difficulty,
        sessions: [
          { start: '09:00', end: '10:30', type: 'study' },
          { start: '14:00', end: '15:30', type: 'practice' },
        ],
      });
    });
  }
  
  return schedule;
}
