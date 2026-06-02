import axios from 'axios';

// Use relative URLs so requests go through Vite's proxy to the backend.
// Never use localhost:8000 directly — the browser cannot reach it on Replit.
const API_URL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 300000, // 5 minutes — Whisper model download + first-run load can take time
});

export async function transcribeAudio(audioBlob: Blob, language: string): Promise<{ transcript: string; english_translation: string }> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');
  formData.append('language', language);
  const response = await api.post('/transcribe', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function sendEmail(payload: {
  from_email: string;
  subject: string;
  query: string;
  phone_number: string;
  timestamp: string;
  consultation?: object;
}): Promise<{ success: boolean; message: string; token?: string }> {
  const response = await api.post('/send-email', payload);
  return response.data;
}

export async function getHistory(): Promise<any[]> {
  const response = await api.get('/history');
  return response.data;
}

export async function getEmailOutbox(): Promise<any[]> {
  const response = await api.get('/email-outbox');
  return response.data;
}

export async function checkSmtpConfig(): Promise<{ configured: boolean }> {
  const response = await api.get('/smtp-config');
  return response.data;
}

export async function getSmtpSettings(): Promise<{
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password_set: boolean;
  receiver_email: string;
}> {
  const response = await api.get('/api/settings/smtp');
  return response.data;
}

export async function saveSmtpSettings(payload: {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  receiver_email: string;
}): Promise<{ success: boolean; message: string }> {
  const response = await api.post('/api/settings/smtp', payload);
  return response.data;
}

export async function consultChat(query: string, context: object): Promise<{ answer: string }> {
  const response = await api.post('/api/consultation/chat', { query, context });
  return response.data;
}

export async function consultRecommend(collectedData: object): Promise<{ recommendations: string }> {
  const response = await api.post('/api/consultation/recommend', collectedData);
  return response.data;
}
