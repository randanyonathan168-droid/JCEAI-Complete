import supabase from '../db-client.js';
import { verifyPassword, isValidEmail } from '../../src/lib/auth-utils.ts';

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

    const { userId, googleId, googleEmail, googleDisplayName, googleAvatar } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Tidak ada token autentikasi',
        error: 'MISSING_AUTH_TOKEN',
      });
    }

    // Validasi input
    if (!userId || !googleId || !googleEmail) {
      return res.status(400).json({
        success: false,
        message: 'User ID, Google ID, dan email Google wajib diisi',
        error: 'MISSING_FIELDS',
      });
    }

    // Cari user
    const { data: user, error: userError } = await supabase
      .from('user_accounts')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan',
        error: 'USER_NOT_FOUND',
      });
    }

    // Validasi email Google cocok dengan email user
    if (user.email.toLowerCase() !== googleEmail.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: 'Email Google harus sama dengan email akun Anda',
        error: 'EMAIL_MISMATCH',
      });
    }

    // Cek apakah Google ID sudah terhubung ke user lain
    const { data: conflictUser } = await supabase
      .from('user_accounts')
      .select('id')
      .eq('google_id', googleId)
      .neq('id', userId)
      .maybeSingle();

    if (conflictUser) {
      return res.status(409).json({
        success: false,
        message: 'Google ID ini sudah terhubung ke akun lain',
        error: 'GOOGLE_ID_ALREADY_LINKED',
      });
    }

    // Link Google ke akun user
    const { data: updatedUser, error: updateError } = await supabase
      .from('user_accounts')
      .update({
        google_id: googleId,
        google_verified: true,
        avatar_url: googleAvatar,
        display_name: googleDisplayName || user.display_name,
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) throw updateError;

    return res.status(200).json({
      success: true,
      message: 'Akun Google berhasil ditautkan',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        displayName: updatedUser.display_name,
        avatar: updatedUser.avatar_url,
        googleVerified: true,
      },
    });
  } catch (err) {
    console.error('Link Google error:', err);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: 'SERVER_ERROR',
    });
  }
}
