import { NextRequest, NextResponse } from 'next/server';
import {
  createUserByEmail,
  findUserByEmail,
  markUserVerified,
  verifyOTP,
} from '../../../../services/auth.service';
import { signToken } from '../../../../lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const { identifier, code, intent, fullName } = await request.json();

    if (!identifier || !code || !intent) {
      return NextResponse.json({ error: 'Missing fields.' }, { status: 400 });
    }

    if (intent !== 'login' && intent !== 'register') {
      return NextResponse.json(
        { error: 'Intent must be either login or register.' },
        { status: 400 }
      );
    }

    const normalizedIdentifier = String(identifier).trim().toLowerCase();

    // Step 1: Verify OTP code
    const result = await verifyOTP(normalizedIdentifier, code);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    let user = null;

    // Step 2: Resolve user by auth intent
    if (intent === 'register') {
      const existingUser = await findUserByEmail(normalizedIdentifier);
      if (existingUser) {
        return NextResponse.json(
          { error: 'This email is already registered. Please login instead.' },
          { status: 409 }
        );
      }

      user = await createUserByEmail(
        normalizedIdentifier,
        typeof fullName === 'string' ? fullName : undefined
      );
    } else {
      user = await findUserByEmail(normalizedIdentifier);
      if (!user) {
        return NextResponse.json(
          { error: 'Account not found. Please register first.' },
          { status: 404 }
        );
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Could not resolve user account.' }, { status: 500 });
    }

    if (!user.is_verified) {
      await markUserVerified(user.id);
    }

    // Step 3: Create JWT token
    const token = signToken({
      userId: user.id,
      role: user.role,
      identifier: user.email ?? normalizedIdentifier,
    });

    // Step 4: Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      intent,
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (err) {
    if (
      err instanceof Error &&
      (err.message.includes('users_email_key') || err.message.toLowerCase().includes('duplicate'))
    ) {
      return NextResponse.json(
        { error: 'This email is already registered. Please login instead.' },
        { status: 409 }
      );
    }

    console.error('[verify-otp]', err);
    return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 500 });
  }
}
