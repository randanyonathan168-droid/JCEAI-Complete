import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, AlertCircle, Loader, Eye, EyeOff, CheckCircle } from 'lucide-react';

interface PasswordStrength {
  score: number;
  valid: boolean;
  errors: string[];
}

export function RegisterPage() {
  const { register, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [jenjang, setJenjang] = useState('SMP');
  const [kelas, setKelas] = useState('7');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    valid: false,
    errors: [],
  });

  const validatePassword = (pwd: string): PasswordStrength => {
    const errors: string[] = [];
    let score = 0;

    if (pwd.length >= 8) score += 20;
    else errors.push('Minimal 8 karakter');

    if (/[A-Z]/.test(pwd)) score += 20;
    else errors.push('Harus ada huruf besar');

    if (/[a-z]/.test(pwd)) score += 20;
    else errors.push('Harus ada huruf kecil');

    if (/[0-9]/.test(pwd)) score += 20;
    else errors.push('Harus ada angka');

    if (/[!@#$%^&*]/.test(pwd)) score += 20;
    else errors.push('Harus ada simbol (!@#$%^&*)');

    return {
      score,
      valid: errors.length === 0,
      errors,
    };
  };

  const handlePasswordChange = (pwd: string) => {
    setPassword(pwd);
    setPasswordStrength(validatePassword(pwd));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    // Validasi
    if (!email || !displayName || !password || !confirmPassword) {
      setFormError('Semua field wajib diisi');
      return;
    }

    if (!email.includes('@')) {
      setFormError('Format email tidak valid');
      return;
    }

    if (!passwordStrength.valid) {
      setFormError('Password tidak memenuhi kriteria keamanan');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Password dan konfirmasi password tidak cocok');
      return;
    }

    const response = await register(email, password, confirmPassword, displayName, jenjang, kelas);
    if (!response.success) {
      setFormError(response.message || 'Registrasi gagal');
    }
  };

  const displayError = formError || error;
  const getKelasOptions = () => {
    switch (jenjang) {
      case 'SD':
        return Array.from({ length: 6 }, (_, i) => (i + 1).toString());
      case 'SMP':
        return ['7', '8', '9'];
      case 'SMA':
        return ['10', '11', '12'];
      case 'SMK':
        return ['10', '11', '12', '13'];
      default:
        return ['Umum'];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-amber-400 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-3xl font-bold">J</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">JCEAI</h1>
          <p className="text-gray-400">Daftar dan Mulai Belajar</p>
        </div>

        {/* Register Form */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Buat Akun Baru</h2>

          {/* Error Alert */}
          {displayError && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{displayError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition"
                />
              </div>
            </div>

            {/* Display Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nama Anda"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition"
                />
              </div>
            </div>

            {/* Jenjang & Kelas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Jenjang</label>
                <select
                  value={jenjang}
                  onChange={(e) => {
                    setJenjang(e.target.value);
                    setKelas('Umum');
                  }}
                  className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition"
                >
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                  <option value="SMK">SMK</option>
                  <option value="Umum">Umum</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Kelas</label>
                <select
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition"
                >
                  {getKelasOptions().map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {password && (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-1 h-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full ${
                          i < passwordStrength.score / 20
                            ? 'bg-red-500'
                            : 'bg-slate-700/50'
                        }`}
                      />
                    ))}
                  </div>
                  {passwordStrength.errors.length > 0 && (
                    <ul className="text-xs text-red-400 space-y-1">
                      {passwordStrength.errors.map((error, i) => (
                        <li key={i}>• {error}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Konfirmasi Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword && password === confirmPassword && (
                <div className="flex items-center gap-2 mt-2 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Password cocok
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 py-2.5 bg-gradient-to-r from-red-500 to-amber-400 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-red-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Sedang Daftar...
                </>
              ) : (
                'Daftar'
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-gray-400 text-sm mt-6">
            Sudah punya akun?{' '}
            <a href="/login" className="text-red-400 hover:text-red-300 font-semibold transition">
              Masuk di sini
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
