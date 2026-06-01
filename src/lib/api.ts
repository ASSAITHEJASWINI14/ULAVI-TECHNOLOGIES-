import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
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
  to_email: string;
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

export async function consultChat(query: string, context: object): Promise<{ answer: string }> {
  const response = await api.post('/api/consultation/chat', { query, context });
  return response.data;
}

export async function consultRecommend(collectedData: object): Promise<{ recommendations: string }> {
  const response = await api.post('/api/consultation/recommend', collectedData);
  return response.data;
}
