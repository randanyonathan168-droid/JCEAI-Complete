export interface User {
  id: string;
  email: string;
  googleId?: string;
  displayName: string;
  avatar?: string;
  jenjang: string; // SD, SMP, SMA, SMK
  kelas: string; // 1-13
  emailVerified: boolean;
  googleVerified: boolean;
  createdAt: string;
  lastLogin: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  googleId?: string;
  jenjang: string;
  kelas: string;
}

export interface GoogleLoginRequest {
  googleId: string;
  email: string;
  displayName: string;
  avatar?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  error?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}
