import { NextResponse } from 'next/server';
import { loginUser, registerUser, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Demo credentials
const DEMO_EMAIL = 'demo@studyai.com';
const DEMO_PASSWORD = 'demo12345';
const DEMO_NAME = 'Demo User';

async function ensureDemoUserExists() {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: DEMO_EMAIL },
    });

    if (!existingUser) {
      // Create demo user with proper password hashing
      const hashedPassword = await hashPassword(DEMO_PASSWORD);
      await prisma.user.create({
        data: {
          email: DEMO_EMAIL,
          password: hashedPassword,
          name: DEMO_NAME,
          role: 'user',
        },
      });
      console.log('Demo user created successfully');
    }
  } catch (error) {
    console.error('Error ensuring demo user:', error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Handle demo account - ensure it exists before login
    if (email.toLowerCase() === DEMO_EMAIL) {
      await ensureDemoUserExists();
    }

    const result = await loginUser(email, password);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: result.user,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
