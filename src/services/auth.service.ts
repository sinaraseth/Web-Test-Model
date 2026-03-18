import nodemailer from 'nodemailer';
import { supabaseServer } from '../lib/supabase/server';

// ─── OTP Generation ─────────────────────────────────────────────────────────

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── Email OTP via Gmail ─────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendEmailOTP(email: string, code: string): Promise<void> {
  await transporter.sendMail({
    from: `"AI Documentation" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Your Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 12px;">
        <h2 style="color: #1a1a1a; margin-bottom: 8px;">Verification Code</h2>
        <p style="color: #555; margin-bottom: 24px;">Enter this code to sign in to AI Documentation:</p>
        <div style="background: #1a1a1a; color: #fff; font-size: 36px; font-weight: bold; letter-spacing: 12px; text-align: center; padding: 20px; border-radius: 8px;">
          ${code}
        </div>
        <p style="color: #999; font-size: 13px; margin-top: 20px; text-align: center;">
          This code expires in <strong>5 minutes</strong>. Do not share it with anyone.
        </p>
      </div>
    `,
  });
}

// ─── OTP DB Operations ───────────────────────────────────────────────────────

export async function saveOTP(identifier: string, code: string): Promise<void> {
  // Invalidate any previous unused codes for this identifier
  await supabaseServer
    .from('otp_codes')
    .update({ used: true })
    .eq('identifier', identifier)
    .eq('used', false);

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min

  const { error } = await supabaseServer.from('otp_codes').insert({
    identifier,
    code,
    expires_at: expiresAt,
    used: false,
  });

  if (error) throw new Error(`Failed to save OTP: ${error.message}`);
}

export async function verifyOTP(
  identifier: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabaseServer
    .from('otp_codes')
    .select('*')
    .eq('identifier', identifier)
    .eq('code', code)
    .eq('used', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return { success: false, error: 'Invalid or expired code.' };
  }

  const isExpired = new Date(data.expires_at) < new Date();
  if (isExpired) {
    return { success: false, error: 'Code has expired. Please request a new one.' };
  }

  // Mark as used
  await supabaseServer.from('otp_codes').update({ used: true }).eq('id', data.id);

  return { success: true };
}

// ─── User Operations ─────────────────────────────────────────────────────────

export async function findUserByEmail(email: string) {
  const { data, error } = await supabaseServer
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function createUserByEmail(email: string, fullName?: string) {
  const payload: { email: string; role: 'user'; is_verified: boolean; full_name?: string } = {
    email,
    role: 'user',
    is_verified: true,
  };

  if (fullName && fullName.trim().length > 0) {
    payload.full_name = fullName.trim();
  }

  const { data: newUser, error } = await supabaseServer
    .from('users')
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(`Failed to create user: ${error.message}`);
  return newUser;
}

export async function markUserVerified(userId: string) {
  const { error } = await supabaseServer
    .from('users')
    .update({ is_verified: true })
    .eq('id', userId);

  if (error) throw new Error(`Failed to mark user verified: ${error.message}`);
}

export async function getUserById(id: string) {
  const { data, error } = await supabaseServer
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}
