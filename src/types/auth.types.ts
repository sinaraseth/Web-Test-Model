export type UserRole = 'user' | 'admin';
export type AuthIntent = 'login' | 'register';

export interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  role: UserRole;
  is_verified: boolean;
  created_at: string;
}

export interface JWTPayload {
  userId: string;
  role: UserRole;
  identifier: string; // email or phone
  iat?: number;
  exp?: number;
}

export interface OTPRequest {
  identifier: string; // email or phone
  type: 'email' | 'phone';
  intent: AuthIntent;
  fullName?: string;
}

export interface OTPVerifyRequest {
  identifier: string;
  code: string;
  intent: AuthIntent;
  fullName?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAdmin: boolean;
}

export interface SendOtpResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  user?: {
    id: string;
    email: string | null;
    role: UserRole;
  };
  error?: string;
}
