import supabase from '../db-client.js';
import { verifyPassword, generateToken, isValidEmail } from '../../src/lib/auth-utils.ts';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.VITE_APP_URL || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi',
        error: 'MISSING_CREDENTIALS',
      });
    }

    // Validasi format email
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email tidak valid',
        error: 'INVALID_EMAIL_FORMAT',
      });
    }

    // Cari user di database
    const { data: user, error: queryError } = await supabase
      .from('user_accounts')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (queryError) throw queryError;

    // User tidak ditemukan
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah',
        error: 'INVALID_CREDENTIALS',
      });
    }

    // User belum verifikasi email
    if (!user.email_verified) {
      return res.status(403).json({
        success: false,
        message: 'Silakan verifikasi email terlebih dahulu',
        error: 'EMAIL_NOT_VERIFIED',
      });
    }

    // Verifikasi password
    const passwordValid = verifyPassword(password, user.password_hash);
    if (!passwordValid) {
      // Log failed attempt
      await supabase
        .from('login_attempts')
        .insert({ email: email.toLowerCase(), success: false });

      return res.status(401).json({
        success: false,
        message: 'Email atau password salah',
        error: 'INVALID_CREDENTIALS',
      });
    }

    // Jika login Google required tapi belum terhubung
    if (user.require_google_account && !user.google_id) {
      return res.status(403).json({
        success: false,
        message: 'Akun Anda harus terhubung dengan Google. Silakan link akun Google terlebih dahulu',
        error: 'GOOGLE_ACCOUNT_REQUIRED',
      });
    }

    // Generate token
    const token = generateToken(user.id, user.email);

    // Update last login
    await supabase
      .from('user_accounts')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Log successful login
    await supabase
      .from('login_attempts')
      .insert({ email: email.toLowerCase(), success: true });

    // Return user data (tanpa password)
    const { password_hash, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      token,
      user: {
        id: userWithoutPassword.id,
        email: userWithoutPassword.email,
        displayName: userWithoutPassword.display_name,
        avatar: userWithoutPassword.avatar_url,
        jenjang: userWithoutPassword.jenjang,
        kelas: userWithoutPassword.kelas,
        emailVerified: userWithoutPassword.email_verified,
        googleVerified: !!userWithoutPassword.google_id,
        createdAt: userWithoutPassword.created_at,
        lastLogin: userWithoutPassword.last_login,
      },
    });
  } catch (err) {
    console.error('Auth login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: 'SERVER_ERROR',
    });
  }
}
