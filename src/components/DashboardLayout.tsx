import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, LogOut, Menu, X, Home, BookOpen, MessageSquare, CheckSquare, Bookmark } from 'lucide-react';
import { useState } from 'react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <p className="text-white">Redirecting to login...</p>
      </div>
    );
  }

  const navItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: BookOpen, label: 'Materi', href: '/materi' },
    { icon: MessageSquare, label: 'Chat AI', href: '/chat' },
    { icon: CheckSquare, label: 'Quiz', href: '/quiz' },
    { icon: Bookmark, label: 'Bookmark', href: '/bookmark' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-800 border-r border-slate-700 transition-all duration-300 fixed h-screen flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-red-500 to-amber-400 flex items-center justify-center">
            <span className="text-white font-bold text-lg">J</span>
          </div>
          {sidebarOpen && <span className="text-white font-bold">JCEAI</span>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-slate-700 hover:text-white transition"
              >
                <Icon className="w-5 h-5" />
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </a>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3">
            {user.avatar ? (
              <img src={user.avatar} alt={user.displayName} className="w-10 h-10 rounded-full" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-400" />
              </div>
            )}
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{user.displayName}</p>
                <p className="text-gray-400 text-xs truncate">{user.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className="w-full mt-4 flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg transition text-sm"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${
        sidebarOpen ? 'ml-64' : 'ml-20'
      } flex-1 transition-all duration-300 flex flex-col`}>
        {/* Top Bar */}
        <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-700 rounded-lg text-gray-400 hover:text-white transition"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="text-white text-sm font-medium">
            {user.jenjang} • Kelas {user.kelas}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
