import axios, { AxiosInstance } from 'axios';

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Interceptor untuk menambahkan token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Auth APIs
  async login(email: string, password: string) {
    return this.client.post('/api/auth/login', { email, password });
  }

  async register(
    email: string,
    password: string,
    confirmPassword: string,
    displayName: string,
    jenjang: string,
    kelas: string
  ) {
    return this.client.post('/api/auth/register', {
      email,
      password,
      confirmPassword,
      displayName,
      jenjang,
      kelas,
    });
  }

  async loginWithGoogle(googleId: string, email: string, displayName: string, avatar?: string) {
    return this.client.post('/api/auth/google-login', {
      googleId,
      email,
      displayName,
      avatar,
    });
  }

  async linkGoogle(
    userId: string,
    googleId: string,
    googleEmail: string,
    googleDisplayName: string,
    googleAvatar?: string
  ) {
    return this.client.post('/api/auth/link-google', {
      userId,
      googleId,
      googleEmail,
      googleDisplayName,
      googleAvatar,
    });
  }

  // KB APIs
  async getKBMaterials(
    jenjang?: string,
    kelas?: string,
    mapel?: string,
    search?: string
  ) {
    return this.client.get('/api/kb', {
      params: { jenjang, kelas, mata_pelajaran: mapel, q: search },
    });
  }

  async getKBMaterialById(id: string) {
    return this.client.get(`/api/kb?id=${id}`);
  }

  // Chat APIs
  async getChats(userId: string) {
    return this.client.get('/api/chats', { params: { user_id: userId } });
  }

  async createChat(userId: string, title?: string, mode?: string) {
    return this.client.post('/api/chats', { user_id: userId, title, mode });
  }

  async updateChat(id: string, title?: string, mode?: string) {
    return this.client.put('/api/chats', { id, title, mode });
  }

  async deleteChat(id: string) {
    return this.client.delete('/api/chats', { data: { id } });
  }

  // Message APIs
  async getMessages(chatId: string, limit?: number) {
    return this.client.get('/api/messages', { params: { chat_id: chatId, limit } });
  }

  async sendMessage(
    chatId: string,
    role: 'user' | 'assistant',
    content: string,
    userId?: string,
    mode?: string,
    sources?: any[],
    kbIds?: string[]
  ) {
    return this.client.post('/api/messages', {
      chat_id: chatId,
      user_id: userId,
      role,
      content,
      mode,
      sources,
      kb_ids: kbIds,
    });
  }

  async deleteMessage(id: string) {
    return this.client.delete('/api/messages', { data: { id } });
  }

  // RAG API (untuk AI jawab)
  async askRAG(query: string, userId: string, mode: string = 'belajar') {
    return this.client.post('/api/rag', { query, user_id: userId, mode });
  }

  // Quiz APIs
  async getQuizResults(userId: string, materialId?: string) {
    return this.client.get('/api/quiz', { params: { user_id: userId, material_id: materialId } });
  }

  async submitQuiz(
    userId: string,
    score: number,
    total: number,
    title?: string,
    materialId?: string,
    answers?: any[],
    difficulty?: string
  ) {
    return this.client.post('/api/quiz', {
      user_id: userId,
      material_id: materialId,
      title,
      score,
      total,
      answers,
      difficulty,
    });
  }

  // Bookmark APIs
  async getBookmarks(userId: string) {
    return this.client.get('/api/bookmarks', { params: { user_id: userId } });
  }

  async addBookmark(userId: string, materialId: string, title?: string, note?: string) {
    return this.client.post('/api/bookmarks', {
      user_id: userId,
      material_id: materialId,
      title,
      note,
    });
  }

  async deleteBookmark(id: string) {
    return this.client.delete('/api/bookmarks', { data: { id } });
  }

  // Profile APIs
  async getProfile(userId: string) {
    return this.client.get('/api/profile', { params: { user_id: userId } });
  }

  async updateProfile(
    userId: string,
    name?: string,
    email?: string,
    jenjang?: string,
    kelas?: string,
    avatar?: string
  ) {
    return this.client.post('/api/profile', {
      user_id: userId,
      name,
      email,
      jenjang,
      kelas,
      avatar,
    });
  }

  // Dashboard APIs
  async getDashboard(userId: string) {
    return this.client.get('/api/dashboard', { params: { user_id: userId } });
  }

  // Search History APIs
  async getSearchHistory(userId: string, limit?: number) {
    return this.client.get('/api/search-history', { params: { user_id: userId, limit } });
  }
}

export const apiClient = new ApiClient();
