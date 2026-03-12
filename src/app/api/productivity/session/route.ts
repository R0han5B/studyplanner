import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';

const sessionSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  duration: z.number().min(1, 'Duration is required'),
  focusScore: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const payload = await getAuthUser();
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const data = sessionSchema.parse(body);
    
    // Create study session
    const session = await db.studySession.create({
      data: {
        subject: data.subject,
        startTime: new Date(Date.now() - data.duration * 60 * 1000),
        endTime: new Date(),
        duration: data.duration,
        focusScore: data.focusScore,
        notes: data.notes,
        userId: payload.userId,
      },
    });
    
    // Update or create productivity log for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingLog = await db.productivityLog.findFirst({
      where: {
        userId: payload.userId,
        date: today,
      },
    });
    
    if (existingLog) {
      await db.productivityLog.update({
        where: { id: existingLog.id },
        data: {
          studyHours: existingLog.studyHours + data.duration / 60,
          focusScore: data.focusScore
            ? (existingLog.focusScore * existingLog.studyHours + data.focusScore * (data.duration / 60)) /
              (existingLog.studyHours + data.duration / 60)
            : existingLog.focusScore,
        },
      });
    } else {
      await db.productivityLog.create({
        data: {
          date: today,
          studyHours: data.duration / 60,
          focusScore: data.focusScore || 0,
          userId: payload.userId,
        },
      });
    }
    
    return NextResponse.json({ session });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    
    console.error('Log session error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
