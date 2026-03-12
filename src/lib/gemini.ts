// Gemini AI Service for AI-powered features

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message: string;
  };
}

export async function generateWithGemini(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          ...(systemPrompt
            ? [
                {
                  role: "user",
                  parts: [{ text: systemPrompt }],
                },
                {
                  role: "model",
                  parts: [
                    { text: "Understood. I will follow these instructions." },
                  ],
                },
              ]
            : []),
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          topP: 0.9,
          topK: 40,
        },
      }),
    });

    const data: GeminiResponse = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);
      throw new Error("Gemini API failed");
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("No response from Gemini");
    }

    return text;
  } catch (error) {
    console.error("Gemini generation error:", error);
    return "AI service is temporarily unavailable. Please try again.";
  }
}

export async function generateAIInsights(userData: {
  completionRate: number;
  totalStudyMinutes: number;
  avgFocusScore: number;
  subjectStats: Record<string, { total: number; completed: number }>;
  skills: Array<{ name: string; level: number; progress: number }>;
  question?: string;
}) {
  const systemPrompt = `You are an expert learning coach AI helping students improve their productivity and study strategies. Always respond in JSON format.`;

  const prompt = userData.question
    ? userData.question
    : `Analyze this student data and give insights:

Completion Rate: ${userData.completionRate}%
Total Study Hours: ${Math.round(userData.totalStudyMinutes / 60)}
Average Focus Score: ${userData.avgFocusScore}

Subjects:
${Object.entries(userData.subjectStats)
  .map(
    ([s, v]) =>
      `${s}: ${Math.round((v.completed / v.total) * 100)}% (${v.completed}/${
        v.total
      })`
  )
  .join("\n")}

Skills:
${userData.skills
  .map((s) => `${s.name} Level ${s.level} (${s.progress}%)`)
  .join("\n")}

Return JSON in this format:
{
 "insights":[{"type":"recommendation","title":"...","description":"...","action":"..."}],
 "learningStyle":{"Visual":40,"Reading/Writing":25,"Auditory":20,"Kinesthetic":15},
 "studyTip":"..."
}`;

  try {
    const response = await generateWithGemini(prompt, systemPrompt);

    const jsonMatch = response.match(/\{[\s\S]*\}/);

    if (!jsonMatch) throw new Error("Invalid JSON");

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      insights: parsed.insights || [],
      learningStyle: parsed.learningStyle || {
        Visual: 40,
        "Reading/Writing": 25,
        Auditory: 20,
        Kinesthetic: 15,
      },
      studyTip: parsed.studyTip || "Study consistently every day.",
      answer: userData.question ? response : undefined,
    };
  } catch (error) {
    console.error("AI insight parsing error:", error);

    return {
      insights: [
        {
          type: "recommendation",
          title: "Start Tracking Tasks",
          description:
            "Add tasks and study sessions to receive personalized AI insights.",
          action: "Create your first task",
        },
      ],
      learningStyle: {
        Visual: 40,
        "Reading/Writing": 25,
        Auditory: 20,
        Kinesthetic: 15,
      },
      studyTip: "Start with the hardest subject when your focus is highest.",
      answer: userData.question
        ? "Add some tasks or study sessions first so I can analyze your progress."
        : undefined,
    };
  }
}
