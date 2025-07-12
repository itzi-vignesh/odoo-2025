# 🔗 Frontend Integration Guide

## Connecting React Frontend to Django Backend

This guide shows how to integrate the Talent Bridge React frontend with the Django backend API.

## 🏗️ Architecture Overview

```
Frontend (React + TypeScript)  ←→  Backend (Django REST API)
├── Authentication            ←→  ├── JWT Authentication
├── User Management           ←→  ├── User Profiles & Discovery
├── Skills Management         ←→  ├── Skills & User Skills
├── Swap Requests            ←→  ├── Swap System
└── Notifications            ←→  └── Notification System
```

## 🔧 Setup API Client

### 1. Create API Configuration

Create `src/api/config.ts`:
```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

export const getAuthHeaders = (token: string) => ({
  ...API_CONFIG.HEADERS,
  'Authorization': `Bearer ${token}`,
});
```

### 2. Create API Client

Create `src/api/client.ts`:
```typescript
import axios from 'axios';
import { API_CONFIG } from './config';

export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(
          `${API_CONFIG.BASE_URL}/auth/token/refresh/`,
          { refresh: refreshToken }
        );
        
        const newToken = response.data.access;
        localStorage.setItem('accessToken', newToken);
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

## 🔐 Authentication Service

Create `src/api/auth.ts`:
```typescript
import { apiClient } from './client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
  bio?: string;
  location?: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    bio: string;
    location: string;
    role: string;
    rating: number;
    total_swaps: number;
  };
  tokens: {
    access: string;
    refresh: string;
  };
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register/', data);
    const { tokens } = response.data;
    
    localStorage.setItem('accessToken', tokens.access);
    localStorage.setItem('refreshToken', tokens.refresh);
    
    return response.data;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login/', credentials);
    const { tokens } = response.data;
    
    localStorage.setItem('accessToken', tokens.access);
    localStorage.setItem('refreshToken', tokens.refresh);
    
    return response.data;
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    try {
      await apiClient.post('/auth/logout/', {
        refresh_token: refreshToken
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  async getProfile() {
    const response = await apiClient.get('/auth/profile/');
    return response.data;
  },

  async updateProfile(data: Partial<RegisterData>) {
    const response = await apiClient.put('/auth/profile/update/', data);
    return response.data;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  },

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }
};
```

## 🎯 Skills Service

Create `src/api/skills.ts`:
```typescript
import { apiClient } from './client';

export interface Skill {
  id: number;
  name: string;
  category: string;
  description: string;
}

export interface UserSkill {
  id: number;
  skill: Skill;
  skill_type: 'offered' | 'wanted';
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  description: string;
  created_at: string;
}

export interface AddSkillData {
  skill_name: string;
  skill_type: 'offered' | 'wanted';
  proficiency?: string;
  description?: string;
}

export const skillsService = {
  async getAllSkills(search?: string, category?: string): Promise<Skill[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    
    const response = await apiClient.get(`/skills/?${params}`);
    return response.data.results || response.data;
  },

  async getCategories(): Promise<string[]> {
    const response = await apiClient.get('/skills/categories/');
    return response.data.categories;
  },

  async getMySkills(): Promise<{ offered: UserSkill[], wanted: UserSkill[] }> {
    const response = await apiClient.get('/skills/my-skills/');
    return response.data;
  },

  async addSkill(data: AddSkillData): Promise<UserSkill> {
    const response = await apiClient.post('/skills/add/', data);
    return response.data.user_skill;
  },

  async removeSkill(skillId: number): Promise<void> {
    await apiClient.delete(`/skills/remove/${skillId}/`);
  }
};
```

## 🔄 Swaps Service

Create `src/api/swaps.ts`:
```typescript
import { apiClient } from './client';

export interface SwapRequest {
  id: number;
  from_user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    rating: number;
  };
  to_user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    rating: number;
  };
  offered_skill: string;
  wanted_skill: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  proposed_duration?: number;
  preferred_format: 'online' | 'in_person' | 'flexible';
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface CreateSwapData {
  to_user: number;
  offered_skill: string;
  wanted_skill: string;
  message: string;
  proposed_duration?: number;
  preferred_format: 'online' | 'in_person' | 'flexible';
}

export interface RatingData {
  rating: number;
  feedback?: string;
  teaching_quality?: number;
  communication?: number;
  reliability?: number;
}

export const swapsService = {
  async getMySwapRequests(): Promise<{ sent: SwapRequest[], received: SwapRequest[] }> {
    const response = await apiClient.get('/swaps/my-requests/');
    return response.data;
  },

  async createSwapRequest(data: CreateSwapData): Promise<SwapRequest> {
    const response = await apiClient.post('/swaps/', data);
    return response.data;
  },

  async acceptSwapRequest(requestId: number): Promise<SwapRequest> {
    const response = await apiClient.post(`/swaps/${requestId}/accept/`);
    return response.data.swap_request;
  },

  async rejectSwapRequest(requestId: number): Promise<SwapRequest> {
    const response = await apiClient.post(`/swaps/${requestId}/reject/`);
    return response.data.swap_request;
  },

  async completeSwapRequest(requestId: number): Promise<SwapRequest> {
    const response = await apiClient.post(`/swaps/${requestId}/complete/`);
    return response.data.swap_request;
  },

  async rateSwap(requestId: number, rating: RatingData): Promise<void> {
    await apiClient.post(`/swaps/${requestId}/rate/`, rating);
  },

  async getSwapStats() {
    const response = await apiClient.get('/swaps/stats/');
    return response.data;
  }
};
```

## 🔔 Notifications Service

Create `src/api/notifications.ts`:
```typescript
import { apiClient } from './client';

export interface Notification {
  id: number;
  sender?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  is_important: boolean;
  created_at: string;
  read_at?: string;
}

export const notificationsService = {
  async getNotifications(): Promise<Notification[]> {
    const response = await apiClient.get('/notifications/');
    return response.data.results || response.data;
  },

  async markAsRead(notificationId: number): Promise<Notification> {
    const response = await apiClient.post(`/notifications/${notificationId}/mark-read/`);
    return response.data.notification;
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.post('/notifications/mark-all-read/');
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get('/notifications/unread-count/');
    return response.data.unread_count;
  }
};
```

## 👥 Users Service

Create `src/api/users.ts`:
```typescript
import { apiClient } from './client';

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  bio: string;
  location: string;
  avatar?: string;
  role: string;
  rating: number;
  total_swaps: number;
  is_public: boolean;
  availability: string;
  created_at: string;
  last_active: string;
}

export const usersService = {
  async discoverUsers(search?: string, availability?: string): Promise<User[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (availability) params.append('availability', availability);
    
    const response = await apiClient.get(`/auth/discover/?${params}`);
    return response.data.results || response.data;
  },

  async getUserDetails(userId: number): Promise<User> {
    const response = await apiClient.get(`/auth/user/${userId}/`);
    return response.data;
  },

  async getUserStats() {
    const response = await apiClient.get('/auth/stats/');
    return response.data;
  }
};
```

## 🎣 React Hooks

Create `src/hooks/useAuth.ts`:
```typescript
import { useState, useEffect, createContext, useContext } from 'react';
import { authService, AuthResponse } from '../api/auth';

interface AuthContextType {
  user: AuthResponse['user'] | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.getProfile();
          setUser(userData);
        } catch (error) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    setUser(response.user);
  };

  const register = async (data: any) => {
    const response = await authService.register(data);
    setUser(response.user);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## 🔧 Usage Examples

### Login Component
```typescript
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Redirect to dashboard
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
    </form>
  );
};
```

### Skills Component
```typescript
import React, { useEffect, useState } from 'react';
import { skillsService, UserSkill } from '../api/skills';

export const MySkills: React.FC = () => {
  const [skills, setSkills] = useState<{ offered: UserSkill[], wanted: UserSkill[] }>({
    offered: [],
    wanted: []
  });

  useEffect(() => {
    const loadSkills = async () => {
      try {
        const userSkills = await skillsService.getMySkills();
        setSkills(userSkills);
      } catch (error) {
        console.error('Failed to load skills:', error);
      }
    };

    loadSkills();
  }, []);

  return (
    <div>
      <h2>My Skills</h2>
      <div>
        <h3>Offered Skills</h3>
        {skills.offered.map(skill => (
          <div key={skill.id}>
            {skill.skill.name} - {skill.proficiency}
          </div>
        ))}
      </div>
      <div>
        <h3>Wanted Skills</h3>
        {skills.wanted.map(skill => (
          <div key={skill.id}>
            {skill.skill.name}
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 🚀 Deployment Configuration

### Environment Variables
Create `.env.production`:
```env
REACT_APP_API_BASE_URL=https://your-backend-domain.com/api
REACT_APP_ENV=production
```

### Build Configuration
Update `package.json`:
```json
{
  "scripts": {
    "build:prod": "REACT_APP_ENV=production npm run build",
    "start:prod": "serve -s build -p 3000"
  }
}
```

## ✅ Integration Checklist

- [ ] API client configured with base URL and auth interceptors
- [ ] Authentication service integrated with React context
- [ ] All API services created (auth, skills, swaps, notifications, users)
- [ ] React hooks for state management
- [ ] Error handling and loading states
- [ ] Token refresh mechanism
- [ ] CORS configured on backend
- [ ] Environment variables set up
- [ ] Build process configured

## 🎯 Next Steps

1. **Replace Mock Data**: Replace all hardcoded data in components with API calls
2. **Add Loading States**: Implement loading spinners and skeletons
3. **Error Handling**: Add proper error boundaries and user feedback
4. **Real-time Updates**: Consider WebSocket integration for notifications
5. **Offline Support**: Add service workers for offline functionality

---

This integration guide provides everything needed to connect your React frontend to the Django backend. The API is fully functional and ready for production use!
