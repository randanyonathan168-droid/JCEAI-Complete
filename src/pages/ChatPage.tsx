import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Send, AlertCircle, Loader, ExternalLink } from 'lucide-react';
import { apiClient } from '../lib/api-client';
import type { User } from '../types/auth';

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ title: string; url: string; confidence?: number }>;
  timestamp?: string;
}

interface RAGResponse {
  success: boolean;
  answer: string;
  sources: Array<{ title: string; url: string; confidence: number }>;
  isFromWebSearch: boolean;
  needsValidation: boolean;
  validationMessage?: string;
}

export function ChatPage() {
  const { user } = useAuth() as { user: User | null };
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'belajar' | 'riset'>('belajar');

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    setError(null);

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call RAG API
      const response = await apiClient.askRAG(input, user.id, mode);
      const ragData = response.data as RAGResponse;

      if (!ragData.success) {
        throw new Error(ragData.validationMessage || 'Gagal mendapatkan jawaban');
      }

      // Buat assistant message dengan sources
      const assistantMessage: Message = {
        role: 'assistant',
        content: ragData.answer,
        sources: ragData.sources,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Jika perlu validasi, tampilkan pesan tambahan
      if (ragData.needsValidation) {
        const validationMessage: Message = {
          role: 'assistant',
          content: `⚠️ ${ragData.validationMessage || 'Jawaban ini memerlukan validasi lebih lanjut dari sumber terpercaya.'}`,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, validationMessage]);
      }

      // Jika dari web search, tampilkan notifikasi
      if (ragData.isFromWebSearch) {
        const webSearchMessage: Message = {
          role: 'assistant',
          content: 'ℹ️ Jawaban ini diambil dari web search karena Knowledge Base tidak menemukan materi yang relevan.',
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, webSearchMessage]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengirim pesan';
      setError(errorMessage);

      const errorMsg: Message = {
        role: 'assistant',
        content: `❌ Error: ${errorMessage}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-red-500" />
            <h1 className="text-xl font-bold text-white">Chat AI JCEAI</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('belajar')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                mode === 'belajar'
                  ? 'bg-red-500 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Belajar
            </button>
            <button
              onClick={() => setMode('riset')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                mode === 'riset'
                  ? 'bg-red-500 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Riset
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Mulai percakapan</p>
              <p className="text-sm">Tanyakan materi, konsep, atau latihan soal kepada AI</p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-md lg:max-w-2xl rounded-lg p-4 ${
                msg.role === 'user'
                  ? 'bg-red-500 text-white'
                  : 'bg-slate-800 text-gray-100 border border-slate-700'
              }`}
            >
              {/* Message Content */}
              <p className="mb-2">{msg.content}</p>

              {/* Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-600 space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase">Sumber:</p>
                  {msg.sources.map((source, sourceIdx) => (
                    <a
                      key={sourceIdx}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span className="truncate">{source.title}</span>
                      {source.confidence && (
                        <span className="text-gray-500">({Math.round(source.confidence * 100)}%)</span>
                      )}
                    </a>
                  ))}
                </div>
              )}

              {/* Timestamp */}
              {msg.timestamp && (
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(msg.timestamp).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 text-gray-100 rounded-lg p-4 border border-slate-700 flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin" />
              <span className="text-sm">AI sedang menjawab...</span>
            </div>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-500/10 border-t border-red-500/50 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm flex-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-300 text-sm font-medium"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="border-t border-slate-700 bg-slate-800 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanyakan sesuatu..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-amber-400 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {!isLoading && 'Kirim'}
          </button>
        </div>
      </form>
    </div>
  );
}
