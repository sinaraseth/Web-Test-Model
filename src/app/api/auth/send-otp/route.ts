import { NextRequest, NextResponse } from 'next/server';
import {
  findUserByEmail,
  generateOTP,
  saveOTP,
  sendEmailOTP,
} from '../../../../services/auth.service';

export async function POST(request: NextRequest) {
  try {
    const { identifier, type, intent } = await request.json();

    if (!identifier || !type || !intent) {
      return NextResponse.json(
        { error: 'Missing identifier, type, or intent.' },
        { status: 400 }
      );
    }

    if (intent !== 'login' && intent !== 'register') {
      return NextResponse.json(
        { error: 'Intent must be either login or register.' },
        { status: 400 }
      );
    }

    if (type !== 'email') {
      // Phone OTP: coming soon (Twilio integration)
      return NextResponse.json(
        { error: 'Phone OTP is not available yet. Please use email.' },
        { status: 400 }
      );
    }

    const normalizedIdentifier = String(identifier).trim().toLowerCase();

    if (type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedIdentifier)) {
        return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
      }
    }

    const existingUser = await findUserByEmail(normalizedIdentifier);

    if (intent === 'register' && existingUser) {
      return NextResponse.json(
        { error: 'This email is already registered. Please login instead.' },
        { status: 409 }
      );
    }

    if (intent === 'login' && !existingUser) {
      return NextResponse.json(
        { error: 'Account not found. Please register first.' },
        { status: 404 }
      );
    }

    const code = generateOTP();
    await saveOTP(normalizedIdentifier, code);

    await sendEmailOTP(normalizedIdentifier, code);

    return NextResponse.json({
      success: true,
      message:
        intent === 'register'
          ? 'Registration OTP sent successfully.'
          : 'Login OTP sent successfully.',
    });
  } catch (err) {
    console.error('[send-otp]', err);
    return NextResponse.json({ error: 'Failed to send OTP. Please try again.' }, { status: 500 });
  }
}
