import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateAIInsights } from "@/lib/gemini";

// POST /api/ai/insights
export async function POST(request: Request) {
  try {
    const userPayload = await getCurrentUser();

    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { question } = body;

    // Fetch user data
    const [tasks, studySessions, skills] = await Promise.all([
      prisma.task.findMany({
        where: { userId: userPayload.userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.studySession.findMany({
        where: { userId: userPayload.userId },
        orderBy: { startTime: "desc" },
        take: 30,
      }),
      prisma.skill.findMany({
        where: { userId: userPayload.userId },
      }),
    ]);

    // Task stats
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const totalTasks = tasks.length;

    const completionRate =
      totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 50; // fallback

    // Study minutes
    const totalStudyMinutes = studySessions.reduce(
      (acc, s) => acc + (s.duration || 0),
      0
    );

    // Subject stats
    const subjectStats: Record<string, { total: number; completed: number }> =
      {};

    tasks.forEach((task) => {
      if (!task.subject) return;

      if (!subjectStats[task.subject]) {
        subjectStats[task.subject] = { total: 0, completed: 0 };
      }

      subjectStats[task.subject].total++;

      if (task.status === "completed") {
        subjectStats[task.subject].completed++;
      }
    });

    // Fallback demo subjects if empty
    const finalSubjectStats =
      Object.keys(subjectStats).length > 0
        ? subjectStats
        : {
            Math: { total: 5, completed: 3 },
            Science: { total: 4, completed: 2 },
          };

    // Fallback skills if none exist
    const finalSkills =
      skills.length > 0
        ? skills.map((s) => ({
            name: s.name,
            level: s.level,
            progress: s.progress,
          }))
        : [
            { name: "Problem Solving", level: 4, progress: 40 },
            { name: "Critical Thinking", level: 5, progress: 50 },
          ];

    // Generate AI insights
    const result = await generateAIInsights({
      completionRate,
      totalStudyMinutes: totalStudyMinutes || 120,
      avgFocusScore: 75,
      subjectStats: finalSubjectStats,
      skills: finalSkills,
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
    console.error("Generate AI insights error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}
