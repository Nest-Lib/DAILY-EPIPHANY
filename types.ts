
export interface EpiphanyContent {
  title: string;
  concept: string;
  explanation: string;
  fact: string;
  visualPrompt: string;
}

export type Category = 'Nature' | 'People' | 'Objects' | 'Feelings' | 'Urban' | 'Dreams' | 'Memories' | 'Other';

export interface EpiphanyResult {
  id: string;
  date: string;
  originalInput: string;
  category: Category;
  content: EpiphanyContent;
  imageUrl?: string;
  isFavorite?: boolean;
  isChallenge?: boolean;
}

export type EpiphanyStyle = 'poetic' | 'scientific' | 'philosophical' | 'spiritual' | 'humorous';
export type AppTheme = 'cosmic' | 'dark' | 'light';
export type FontSize = 'small' | 'medium' | 'large';
export type EmailFrequency = 'daily' | 'weekly' | 'none';
export type EmailContent = 'favorites' | 'random' | 'community';

export interface UserSettings {
  style: EpiphanyStyle;
  theme: AppTheme;
  fontSize: FontSize;
  language: string;
  isPublic: boolean;
  // Notification & Email
  browserNotifications: boolean;
  notificationTime: string; // HH:mm format
  emailFrequency: EmailFrequency;
  emailContent: EmailContent;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  streak: number;
  lastChallengeDate?: string; // ISO date string YYYY-MM-DD
  badges: string[]; // Array of badge IDs
  settings: UserSettings;
}

export interface DailyChallenge {
  date: string; // YYYY-MM-DD
  theme: string;
  prompt: string;
  id: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface Comment {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  timestamp: string;
}

export interface CommunityPost {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  epiphany: EpiphanyContent;
  originalInput: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  comments: Comment[];
  category: Category;
}

export type LoadingState = 'idle' | 'generating-text' | 'generating-image' | 'complete' | 'error';
export type ViewState = 'input' | 'result' | 'dashboard' | 'community' | 'settings';
