// Gemini AI Service for AI-powered features

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyC7ah6O_kHbsgcmpJw2bANF4qdiFliRckE';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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

export async function generateWithGemini(prompt: string, systemPrompt?: string): Promise<string> {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          ...(systemPrompt ? [{
            role: 'user',
            parts: [{ text: systemPrompt }]
          },
          {
            role: 'model',
            parts: [{ text: 'I understand. I will follow these instructions.' }]
          }] : []),
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          topP: 0.95,
          topK: 40,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return text;
  } catch (error) {
    console.error('Error generating with Gemini:', error);
    throw error;
  }
}

export async function generateAIInsights(userData: {
  completionRate: number;
  totalStudyMinutes: number;
  avgFocusScore: number;
  subjectStats: Record<string, { total: number; completed: number }>;
  skills: Array<{ name: string; level: number; progress: number }>;
  question?: string;
}): Promise<{
  insights: Array<{
    type: string;
    title: string;
    description: string;
    action: string;
  }>;
  learningStyle: {
    Visual: number;
    'Reading/Writing': number;
    Auditory: number;
    Kinesthetic: number;
  };
  studyTip: string;
  answer?: string;
}> {
  const systemPrompt = `You are an expert learning coach AI that provides personalized insights for students. You analyze student data and provide actionable advice. Always respond with valid JSON in the exact format requested. Be specific and practical in your recommendations.`;

  const prompt = userData.question 
    ? userData.question
    : `Analyze the following student data and provide personalized learning insights:

Student Statistics:
- Task Completion Rate: ${userData.completionRate}%
- Total Study Hours: ${Math.round(userData.totalStudyMinutes / 60)}
- Average Focus Score: ${userData.avgFocusScore}%
- Active Subjects: ${Object.keys(userData.subjectStats).length}

Subject Performance:
${Object.entries(userData.subjectStats)
  .map(([subject, stats]) => `- ${subject}: ${Math.round((stats.completed / stats.total) * 100)}% completion (${stats.completed}/${stats.total} tasks)`)
  .join('\n') || 'No subject data available'}

Skills Progress:
${userData.skills.map(s => `- ${s.name}: Level ${s.level}, Progress ${s.progress}%`).join('\n') || 'No skills tracked yet'}

Provide your response as valid JSON in exactly this format:
{
  "insights": [
    {
      "type": "strength" | "improvement" | "recommendation" | "alert",
      "title": "Short descriptive title",
      "description": "Detailed description with specific actionable advice",
      "action": "Specific action the student should take"
    }
  ],
  "learningStyle": {
    "Visual": <number 0-100>,
    "Reading/Writing": <number 0-100>,
    "Auditory": <number 0-100>,
    "Kinesthetic": <number 0-100>
  },
  "studyTip": "A personalized study tip based on the analysis"
}

Provide exactly 4-6 insights. Make sure the learningStyle percentages add up to 100.`;

  try {
    const responseText = await generateWithGemini(prompt, systemPrompt);
    
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and normalize the response
      return {
        insights: parsed.insights || [],
        learningStyle: parsed.learningStyle || {
          Visual: 40,
          'Reading/Writing': 25,
          Auditory: 20,
          Kinesthetic: 15,
        },
        studyTip: parsed.studyTip || 'Take regular breaks to improve retention.',
        answer: userData.question ? responseText : undefined,
      };
    }
    
    throw new Error('No valid JSON found in response');
  } catch (error) {
    console.error('Error parsing AI insights:', error);
    
    // Return default insights on error
    return {
      insights: [
        {
          type: 'recommendation',
          title: 'Start Tracking Your Progress',
          description: 'Begin by adding tasks and logging study sessions to get personalized AI insights.',
          action: 'Add your first task and complete a study session',
        },
        {
          type: 'strength',
          title: 'Ready to Learn',
          description: 'Your account is set up and ready. Consistent tracking will help identify your learning patterns.',
          action: 'Set up your first study schedule',
        },
        {
          type: 'recommendation',
          title: 'Use the Pomodoro Timer',
          description: 'Break your study sessions into focused 25-minute blocks with short breaks for better retention.',
          action: 'Try the Pomodoro timer in the Productivity section',
        },
      ],
      learningStyle: {
        Visual: 40,
        'Reading/Writing': 25,
        Auditory: 20,
        Kinesthetic: 15,
      },
      studyTip: 'Start with the most challenging subjects when your energy is highest.',
      answer: userData.question ? 'I need more data to provide personalized insights. Start by tracking your tasks and study sessions!' : undefined,
    };
  }
}

export async function generateStudySchedule(params: {
  subjects: string[];
  examDates: Array<{ subject: string; date: string }>;
  dailyStudyHours: number;
  difficultyLevels: Array<{ subject: string; level: string }>;
  priorities: Array<{ subject: string; priority: string }>;
}): Promise<{
  schedule: Array<{
    day: number;
    date: string;
    sessions: Array<{
      subject: string;
      startTime: string;
      endTime: string;
      focus: string;
    }>;
  }>;
  tips: string[];
}> {
  const systemPrompt = `You are an expert study planner AI. Create optimized study schedules that balance subjects based on priority, difficulty, and available time. Always respond with valid JSON.`;

  const prompt = `Create a 7-day study schedule based on:

Subjects: ${params.subjects.join(', ')}
Daily Study Hours Available: ${params.dailyStudyHours}
Exam Dates: ${params.examDates.map(e => `${e.subject}: ${e.date}`).join(', ') || 'Not specified'}
Difficulty Levels: ${params.difficultyLevels.map(d => `${d.subject}: ${d.level}`).join(', ')}
Priority Levels: ${params.priorities.map(p => `${p.subject}: ${p.priority}`).join(', ')}

Generate a JSON schedule in this exact format:
{
  "schedule": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "sessions": [
        {
          "subject": "Subject Name",
          "startTime": "HH:MM",
          "endTime": "HH:MM",
          "focus": "specific topic or activity"
        }
      ]
    }
  ],
  "tips": ["tip1", "tip2", "tip3"]
}

Important:
- Distribute time proportionally based on priority and difficulty
- Include breaks between sessions
- Vary subjects throughout the day
- Higher priority subjects should get more time
- Start dates from today`;

  try {
    const responseText = await generateWithGemini(prompt, systemPrompt);
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('No valid JSON found');
  } catch (error) {
    console.error('Error generating schedule:', error);
    
    // Generate a basic schedule as fallback
    const today = new Date();
    const schedule: { day: number; date: string; sessions: { subject: string; startTime: string; endTime: string; focus: string; }[]; }[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      const sessions: { subject: string; startTime: string; endTime: string; focus: string; }[] = [];
      let currentHour = 9;
      
      for (const subject of params.subjects.slice(0, 3)) {
        sessions.push({
          subject,
          startTime: `${String(currentHour).padStart(2, '0')}:00`,
          endTime: `${String(currentHour + 1).padStart(2, '0')}:00`,
          focus: `Review and practice`,
        });
        currentHour += 2;
      }
      
      schedule.push({
        day: i + 1,
        date: date.toISOString().split('T')[0],
        sessions,
      });
    }
    
    return {
      schedule,
      tips: [
        'Take 5-10 minute breaks between study sessions',
        'Review material before sleep for better retention',
        'Practice active recall instead of passive reading',
      ],
    };
  }
}
