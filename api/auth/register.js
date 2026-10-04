import supabase from '../db-client.js';
import { hashPassword, generateToken, isValidEmail, validatePassword, generateId } from '../../src/lib/auth-utils.ts';

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

    const { email, password, confirmPassword, displayName, jenjang, kelas } = req.body;

    // Validasi input
    if (!email || !password || !confirmPassword || !displayName) {
      return res.status(400).json({
        success: false,
        message: 'Semua field wajib diisi',
        error: 'MISSING_FIELDS',
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

    // Validasi password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password dan konfirmasi password tidak cocok',
        error: 'PASSWORD_MISMATCH',
      });
    }

    // Validasi kekuatan password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Password tidak memenuhi kriteria keamanan',
        error: 'WEAK_PASSWORD',
        details: passwordValidation.errors,
      });
    }

    // Cek email sudah terdaftar
    const { data: existingUser } = await supabase
      .from('user_accounts')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar. Silakan login atau gunakan email lain',
        error: 'EMAIL_ALREADY_EXISTS',
      });
    }

    // Hash password
    const passwordHash = hashPassword(password);
    const userId = generateId();

    // Buat user account
    const { data: newUser, error: insertError } = await supabase
      .from('user_accounts')
      .insert({
        id: userId,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        display_name: displayName,
        jenjang: jenjang || 'Umum',
        kelas: kelas || 'Umum',
        email_verified: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Send verification email
    // TODO: Implement email verification
    // const verificationToken = generateToken(userId, email);
    // await sendVerificationEmail(email, verificationToken);

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil. Silakan verifikasi email Anda',
      user: {
        id: newUser.id,
        email: newUser.email,
        displayName: newUser.display_name,
        jenjang: newUser.jenjang,
        kelas: newUser.kelas,
        emailVerified: false,
      },
    });
  } catch (err) {
    console.error('Auth register error:', err);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: 'SERVER_ERROR',
    });
  }
}
