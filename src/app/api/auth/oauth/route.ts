import { NextResponse } from 'next/server';
import { generateAccessToken, generateRefreshToken, setAuthCookies } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Demo OAuth implementation - creates/finds users by provider
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider } = body;

    if (!provider || !['google', 'github'].includes(provider)) {
      return NextResponse.json(
        { success: false, error: 'Invalid OAuth provider' },
        { status: 400 }
      );
    }

    // For demo purposes, we simulate OAuth login
    // In production, you would validate the OAuth token from Google/GitHub
    
    // Generate a demo user based on provider
    const demoEmail = `${provider}user@studyai.com`;
    const demoName = provider === 'google' ? 'Google User' : 'GitHub User';
    const demoAvatar = provider === 'google' 
      ? 'https://lh3.googleusercontent.com/a/default-user'
      : 'https://avatars.githubusercontent.com/u/0';
    const demoOauthId = `${provider}_demo_${Date.now()}`;

    // Check if user exists by OAuth provider
    let user = await prisma.user.findFirst({
      where: {
        oauthProvider: provider,
        email: demoEmail,
      },
    });

    // If not found by OAuth, check by email (in case they linked accounts)
    if (!user) {
      user = await prisma.user.findUnique({
        where: { email: demoEmail },
      });
    }

    // Create new user if doesn't exist
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: demoEmail,
          name: demoName,
          avatar: demoAvatar,
          oauthProvider: provider,
          oauthId: demoOauthId,
          password: null, // OAuth users don't have passwords
          role: 'user',
        },
      });
    } else {
      // Update OAuth info if needed
      if (!user.oauthProvider) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            oauthProvider: provider,
            oauthId: demoOauthId,
            avatar: demoAvatar,
          },
        });
      }
    }

    // Generate tokens
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await generateAccessToken(payload);
    const refreshToken = await generateRefreshToken(payload);

    // Store refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // Set cookies
    await setAuthCookies(accessToken, refreshToken);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        oauthProvider: user.oauthProvider,
      },
      message: `${provider.charAt(0).toUpperCase() + provider.slice(1)} login successful`,
    });
  } catch (error) {
    console.error('OAuth error:', error);
    return NextResponse.json(
      { success: false, error: 'OAuth authentication failed' },
      { status: 500 }
    );
  }
}
