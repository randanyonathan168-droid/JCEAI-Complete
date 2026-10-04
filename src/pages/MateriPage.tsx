import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Search, Bookmark, BookmarkCheck, Loader, AlertCircle } from 'lucide-react';
import { apiClient } from '../lib/api-client';
import { getMapelByJenjangKelas } from '../data/mapel';
import type { User } from '../types/auth';

interface Material {
  id: string;
  title: string;
  slug: string;
  mata_pelajaran: string;
  jenjang: string;
  kelas: string;
  summary: string;
  icon?: string;
  tujuan_pembelajaran?: string[];
  keywords?: string[];
}

export function MateriPage() {
  const { user } = useAuth() as { user: User | null };
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  const mapelList = user ? getMapelByJenjangKelas(user.jenjang, user.kelas) : [];

  // Load materials
  useEffect(() => {
    if (!user) return;

    const loadMaterials = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.getKBMaterials(
          user.jenjang,
          user.kelas,
          selectedMapel || undefined,
          searchQuery || undefined
        );
        setMaterials(response.data || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Gagal memuat materi';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(loadMaterials, 300);
    return () => clearTimeout(timer);
  }, [user, selectedMapel, searchQuery]);

  // Load bookmarks
  useEffect(() => {
    if (!user) return;

    const loadBookmarks = async () => {
      try {
        const response = await apiClient.getBookmarks(user.id);
        const bookmarkIds = new Set(
          (response.data || []).map((b: any) => b.material_id)
        );
        setBookmarks(bookmarkIds);
      } catch (err) {
        console.error('Gagal memuat bookmarks:', err);
      }
    };

    loadBookmarks();
  }, [user]);

  // Filter materials
  useEffect(() => {
    let filtered = materials;

    if (searchQuery) {
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (m.keywords || []).some((k) =>
            k.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    if (selectedMapel) {
      filtered = filtered.filter((m) => m.mata_pelajaran === selectedMapel);
    }

    setFilteredMaterials(filtered);
  }, [materials, searchQuery, selectedMapel]);

  const handleBookmark = async (materialId: string) => {
    if (!user) return;

    try {
      if (bookmarks.has(materialId)) {
        // Remove bookmark
        const bookmarkToDelete = materials.find((m) => m.id === materialId);
        if (bookmarkToDelete) {
          await apiClient.deleteBookmark(materialId);
          setBookmarks((prev) => {
            const next = new Set(prev);
            next.delete(materialId);
            return next;
          });
        }
      } else {
        // Add bookmark
        const material = materials.find((m) => m.id === materialId);
        if (material) {
          await apiClient.addBookmark(user.id, materialId, material.title);
          setBookmarks((prev) => new Set([...prev, materialId]));
        }
      }
    } catch (err) {
      console.error('Gagal mengubah bookmark:', err);
    }
  };

  if (!user) return null;

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl font-bold text-white">Knowledge Base</h1>
        </div>
        <p className="text-gray-400">Jelajahi materi pembelajaran lengkap untuk {user.jenjang} Kelas {user.kelas}</p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari materi..."
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
          />
        </div>

        {/* Mapel Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Filter Mata Pelajaran</label>
          <select
            value={selectedMapel}
            onChange={(e) => setSelectedMapel(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
          >
            <option value="">Semua Mata Pelajaran</option>
            {mapelList.map((mapel) => (
              <option key={mapel} value={mapel}>
                {mapel}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-red-500" />
        </div>
      )}

      {/* Materials Grid */}
      {!isLoading && filteredMaterials.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <div
              key={material.id}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-red-500/50 transition group"
            >
              {/* Icon */}
              {material.icon && (
                <div className="text-4xl mb-3">{material.icon}</div>
              )}

              {/* Title */}
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-red-400 transition">
                {material.title}
              </h3>

              {/* Subject */}
              <div className="mb-3 flex items-center gap-2">
                <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                  {material.mata_pelajaran}
                </span>
              </div>

              {/* Summary */}
              <p className="text-sm text-gray-400 mb-4 line-clamp-3">{material.summary}</p>

              {/* Learning Objectives */}
              {material.tujuan_pembelajaran && material.tujuan_pembelajaran.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-300 mb-2">Tujuan Pembelajaran:</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    {material.tujuan_pembelajaran.slice(0, 2).map((tujuan, idx) => (
                      <li key={idx}>• {tujuan}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-slate-700">
                <button className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-amber-400 text-white font-semibold rounded-lg hover:shadow-lg transition">
                  Baca
                </button>
                <button
                  onClick={() => handleBookmark(material.id)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    bookmarks.has(material.id)
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }}`}
                >
                  {bookmarks.has(material.id) ? (
                    <BookmarkCheck className="w-5 h-5" />
                  ) : (
                    <Bookmark className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredMaterials.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-500 mx-auto mb-4 opacity-50" />
          <p className="text-gray-400 mb-2">Tidak ada materi ditemukan</p>
          <p className="text-sm text-gray-500">Coba ubah filter atau pencarian Anda</p>
        </div>
      )}
    </div>
  );
}
