import crypto from 'crypto';

// Hash password dengan bcrypt-like algorithm
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  return `${salt}:${hash}`;
}

// Verify password
export function verifyPassword(password: string, hashedPassword: string): boolean {
  try {
    const [salt, hash] = hashedPassword.split(':');
    const testHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
    return testHash === hash;
  } catch {
    return false;
  }
}

// Generate JWT Token (simple implementation)
export function generateToken(userId: string, email: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 hari
    })
  ).toString('base64');

  const signature = crypto
    .createHmac('sha256', process.env.VITE_JWT_SECRET || 'your-secret-key-change-this')
    .update(`${header}.${payload}`)
    .digest('base64');

  return `${header}.${payload}.${signature}`;
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) errors.push('Password minimal 8 karakter');
  if (!/[A-Z]/.test(password)) errors.push('Password harus mengandung huruf besar');
  if (!/[a-z]/.test(password)) errors.push('Password harus mengandung huruf kecil');
  if (!/[0-9]/.test(password)) errors.push('Password harus mengandung angka');
  if (!/[!@#$%^&*]/.test(password)) errors.push('Password harus mengandung simbol (!@#$%^&*)');

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Generate UUID
export function generateId(): string {
  return crypto.randomUUID();
}
