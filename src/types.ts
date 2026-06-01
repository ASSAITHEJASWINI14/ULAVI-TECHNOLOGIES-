export type AppScreen =
  | 'landing'
  | 'recording'
  | 'processing'
  | 'transcript'
  | 'consultation'
  | 'contact'
  | 'email-preview'
  | 'success'
  | 'dashboard'
  | 'settings';

export interface TranscriptData {
  original: string;
  english: string;
  language: string;
}

export interface ContactData {
  countryCode: string;
  phone: string;
  fromEmail: string;
  toEmail: string;
}

export interface ConsultationData {
  days: string;
  persons: string;
  budget: string;
  packagePreference: string;
  foodPreference: string;
  additionalPreferences: string;
  chatHistory: ChatMessage[];
  recommendations: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AppState {
  screen: AppScreen;
  transcript: TranscriptData | null;
  contact: ContactData | null;
  consultation: ConsultationData | null;
  referenceToken: string | null;
}
