
export enum AppState {
  IDLE = 'IDLE',
  PROCESSING_IMAGE = 'PROCESSING_IMAGE',
  PREPARING_AUDIO = 'PREPARING_AUDIO',
  DISPLAYING_QUESTION = 'DISPLAYING_QUESTION',
  READING_ALOUD = 'READING_ALOUD',
  COUNTDOWN = 'COUNTDOWN',
  REVEALING_ANSWER = 'REVEALING_ANSWER',
}

export interface Option {
  letter: string;
  text: string;
}

export interface QuestionData {
  question: string;
  options: Option[];
  correctOption: string;
  questionAudio?: string;
  answerAudio?: string;
}

export type UserRole = 'ADMIN' | 'USER';

export interface UserPermissions {
  mcq: boolean;
  reader: boolean;
  video: boolean; // Animation Sketch
  proVideo: boolean; // Veo Cinematic Video
  poster: boolean;
  bulkEditor: boolean; // Image Editor
  mathReplicator: boolean; // Docu-Replica
  aiVideoGenerator: boolean; // AI Animated Video
}

export interface User {
  email: string;
  name: string;
  role: UserRole;
  permissions: UserPermissions;
}

export interface UserStats {
  mcqGenerations: number;
  ttsGenerations: number;
  lastActive: string;
}

export interface UserAccount extends User {
  password: string;
  stats: UserStats;
}

export interface ThemeColors {
  '--color-background': string;
  '--color-surface': string;
  '--color-primary': string;
  '--color-primary-hover': string;
  '--color-secondary': string;
  '--color-accent': string;
  '--color-border': string;
  '--color-text-main': string;
  '--color-text-sub': string;
  '--color-text-muted': string;
}

export type ThemeCategory = 'Basic' | 'Chemistry' | 'Biology' | 'Physics' | 'Social Studies' | 'English';

export interface AppTheme {
  id: string;
  name: string;
  category: ThemeCategory;
  colors: ThemeColors;
}

export type LogoVariant = 'DEFAULT' | 'ATOM' | 'BRAIN' | 'BOOK' | 'ROBOT' | 'SPARK';

// Math Replicator Types
export type ReplicaElementType = 'text' | 'math' | 'shape';

export interface ReplicaElement {
  id: string;
  type: ReplicaElementType;
  content: string; // Text or LaTeX
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  width: number; // Percentage
  height: number; // Percentage
  fontSize?: number;
  color?: string;
  bgColor?: string;
}

export interface ReplicaData {
  elements: ReplicaElement[];
  aspectRatio: number; // width / height
}

// AI Video Generator – saved (incomplete) project
export interface SavedProject {
  id: string;          // uuid
  userEmail: string;
  title: string;
  description: string;
  videoType: 'SHORT' | 'LONG';
  script: any;         // VideoScript shape
  sceneImages: Record<string, string>;  // sceneId -> base64
  savedAt: string;     // ISO date string
}
