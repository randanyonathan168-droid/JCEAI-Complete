import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, Loader } from 'lucide-react';

export function GoogleLoginHandler() {
  const { loginWithGoogle, linkGoogle, isLoading, error } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    // Simulasi Google API - dalam produksi gunakan Google Sign-In SDK
    handleGoogleSignIn();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsProcessing(true);
    setLocalError(null);

    try {
      // INSTRUKSI IMPLEMENTASI:
      // 1. Install Google Sign-In SDK:
      //    <script src="https://accounts.google.com/gsi/client" async defer></script>
      //
      // 2. Initialize di component:
      //    window.google.accounts.id.initialize({ client_id: process.env.VITE_GOOGLE_CLIENT_ID })
      //
      // 3. Callback handler:
      //    window.google.accounts.id.renderButton(element, { theme: 'dark' })
      //
      // 4. Response akan berisi credential (idToken)
      //
      // 5. Decode idToken di backend untuk dapatkan:
      //    - sub (Google ID)
      //    - email
      //    - name (displayName)
      //    - picture (avatar)

      // Placeholder untuk demo
      console.log('Google Sign-In handler initialized');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal inisialisasi Google Sign-In';
      setLocalError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="w-full">
      {displayError && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm">{displayError}</p>
        </div>
      )}

      <button
        disabled={isLoading || isProcessing}
        className="w-full py-2.5 bg-slate-700/50 border border-slate-600/50 text-white font-semibold rounded-lg hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading || isProcessing ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Memproses...
          </>
        ) : (
          <>
            <img
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%234285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/%3E%3Cpath fill='%2334A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/%3E%3Cpath fill='%23FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/%3E%3Cpath fill='%23EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/%3E%3C/svg%3E"
              alt="Google"
              className="w-5 h-5"
            />
            Masuk dengan Google
          </>
        )}
      </button>

      {/* Google Sign-In Script - uncomment saat production */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
        // Script ini akan diload:
        // <script src="https://accounts.google.com/gsi/client" async defer><\/script>
        // 
        // Kemudian initialize:
        // window.google.accounts.id.initialize({
        //   client_id: '${process.env.VITE_GOOGLE_CLIENT_ID}',
        //   callback: handleGoogleLoginCallback
        // });
      `,
        }}
      />
    </div>
  );
}
