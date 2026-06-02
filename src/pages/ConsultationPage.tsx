import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { ConsultationData, TranscriptData } from '../types';
import { consultChat } from '../lib/api';
import ConsultationForm, { FormData } from '../components/ConsultationForm';
import ConsultationChat from '../components/ConsultationChat';
import RecommendationPanel from '../components/RecommendationPanel';

interface Props {
  transcript: TranscriptData;
  onBack: () => void;
  onNext: (data: ConsultationData) => void;
}

const defaultForm: FormData = {
  days: '',
  persons: '',
  budget: '',
  packagePreference: '',
  foodPreference: '',
  additionalPreferences: '',
};

export default function ConsultationPage({ transcript, onBack, onNext }: Props) {
  const [form, setForm] = useState<FormData>(defaultForm);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const handleFormChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user' as const, content: chatInput };
    const updated = [...chatHistory, userMsg];
    setChatHistory(updated);
    setChatInput('');
    setChatLoading(true);
    try {
      const res = await consultChat(chatInput, {
        ...form,
        transcript: transcript.english,
      });
      setChatHistory([...updated, { role: 'assistant', content: res.answer }]);
    } catch {
      setChatHistory([...updated, {
        role: 'assistant',
        content: 'Sorry, I could not connect to the backend. Please ensure it is running on port 8000.',
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleNext = () => {
    onNext({
      ...form,
      chatHistory,
      recommendations: '',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4 text-white">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6 pt-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-purple-200 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-300" /> AI Consultation
            </h2>
            <p className="text-xs text-purple-300 mt-0.5">
              Fill in your requirements and chat with the AI — or skip to continue
            </p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 mb-5 text-sm text-purple-200">
          <span className="text-xs text-purple-400 uppercase tracking-widest mr-2">Your query:</span>
          <span className="italic">"{transcript.english}"</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ConsultationForm
            data={form}
            onChange={handleFormChange}
          />
          <ConsultationChat
            chatHistory={chatHistory}
            input={chatInput}
            loading={chatLoading}
            onInputChange={setChatInput}
            onSend={handleSendChat}
          />
        </div>

        <RecommendationPanel
          formData={form}
          chatHistory={chatHistory}
          recommendations=""
          transcript={transcript.english}
        />

        <div className="flex justify-between items-center mt-6 pb-6">
          <p className="text-xs text-purple-400">
            All fields are optional — you can skip straight to contact details
          </p>
          <button
            onClick={handleNext}
            className="bg-white text-purple-900 font-bold py-4 px-10 rounded-2xl text-base hover:bg-purple-100 transition-all flex items-center gap-2 shadow-lg"
          >
            Continue to Contact <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
