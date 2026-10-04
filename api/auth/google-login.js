import supabase from '../db-client.js';
import { generateToken, isValidEmail, generateId } from '../../src/lib/auth-utils.ts';

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

    const { googleId, email, displayName, avatar, idToken } = req.body;

    // Validasi input
    if (!googleId || !email || !displayName) {
      return res.status(400).json({
        success: false,
        message: 'Google ID, email, dan nama wajib diisi',
        error: 'MISSING_FIELDS',
      });
    }

    // Validasi format email
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email dari Google tidak valid',
        error: 'INVALID_EMAIL_FORMAT',
      });
    }

    // Cari user berdasarkan google_id
    const { data: existingUser } = await supabase
      .from('user_accounts')
      .select('*')
      .eq('google_id', googleId)
      .maybeSingle();

    if (existingUser) {
      // User sudah ada dengan Google ID ini
      // Verifikasi email cocok
      if (existingUser.email.toLowerCase() !== email.toLowerCase()) {
        return res.status(403).json({
          success: false,
          message: 'Email Google tidak sesuai dengan email terdaftar',
          error: 'EMAIL_MISMATCH',
        });
      }

      // Generate token
      const token = generateToken(existingUser.id, existingUser.email);

      // Update last login & verify google
      await supabase
        .from('user_accounts')
        .update({
          last_login: new Date().toISOString(),
          google_verified: true,
        })
        .eq('id', existingUser.id);

      const { password_hash, ...userWithoutPassword } = existingUser;

      return res.status(200).json({
        success: true,
        message: 'Login dengan Google berhasil',
        token,
        user: {
          id: userWithoutPassword.id,
          email: userWithoutPassword.email,
          displayName: userWithoutPassword.display_name,
          avatar: userWithoutPassword.avatar_url,
          jenjang: userWithoutPassword.jenjang,
          kelas: userWithoutPassword.kelas,
          emailVerified: userWithoutPassword.email_verified,
          googleVerified: true,
          createdAt: userWithoutPassword.created_at,
          lastLogin: userWithoutPassword.last_login,
        },
      });
    }

    // Cari user berdasarkan email (untuk linking account)
    const { data: userByEmail } = await supabase
      .from('user_accounts')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (userByEmail) {
      // Email sudah terdaftar, tapi Google ID belum terhubung
      // TOLAK: Email harus terhubung dengan Google account yang sama
      return res.status(403).json({
        success: false,
        message: 'Email ini sudah terdaftar. Silakan login dengan email dan password terlebih dahulu, kemudian link akun Google di pengaturan profil',
        error: 'EMAIL_ALREADY_REGISTERED',
        action: 'LINK_ACCOUNT_REQUIRED',
      });
    }

    // Buat user baru dengan Google
    const userId = generateId();
    const { data: newUser, error: insertError } = await supabase
      .from('user_accounts')
      .insert({
        id: userId,
        email: email.toLowerCase(),
        google_id: googleId,
        display_name: displayName,
        avatar_url: avatar,
        email_verified: true, // Google sudah verify email
        google_verified: true,
        jenjang: 'Umum',
        kelas: 'Umum',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Generate token
    const token = generateToken(newUser.id, newUser.email);

    return res.status(201).json({
      success: true,
      message: 'Registrasi dan login dengan Google berhasil',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        displayName: newUser.display_name,
        avatar: newUser.avatar_url,
        jenjang: newUser.jenjang,
        kelas: newUser.kelas,
        emailVerified: true,
        googleVerified: true,
        createdAt: newUser.created_at,
        lastLogin: newUser.created_at,
      },
    });
  } catch (err) {
    console.error('Google auth error:', err);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: 'SERVER_ERROR',
    });
  }
}
