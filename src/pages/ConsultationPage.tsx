import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Send, Loader2, Sparkles } from 'lucide-react';
import { ConsultationData, ChatMessage, TranscriptData } from '../types';
import { consultChat, consultRecommend } from '../lib/api';

interface Props {
  transcript: TranscriptData;
  onBack: () => void;
  onNext: (data: ConsultationData) => void;
}

const defaultForm = {
  days: '',
  persons: '',
  budget: '',
  packagePreference: '',
  foodPreference: '',
  additionalPreferences: '',
};

export default function ConsultationPage({ transcript, onBack, onNext }: Props) {
  const [form, setForm] = useState(defaultForm);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [recommendations, setRecommendations] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [recLoading, setRecLoading] = useState(false);

  const handleFormChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = { role: 'user', content: chatInput };
    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    setChatInput('');
    setChatLoading(true);
    try {
      const res = await consultChat(chatInput, { ...form, transcript: transcript.english });
      setChatHistory([...newHistory, { role: 'assistant', content: res.answer }]);
    } catch {
      setChatHistory([...newHistory, { role: 'assistant', content: 'Sorry, I could not process your request. Please ensure the backend is running.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const generateRecommendations = async () => {
    setRecLoading(true);
    try {
      const res = await consultRecommend({ ...form, transcript: transcript.english });
      setRecommendations(res.recommendations);
    } catch {
      setRecommendations('Could not generate recommendations. Please ensure the backend is running and try again.');
    } finally {
      setRecLoading(false);
    }
  };

  const handleNext = () => {
    onNext({
      ...form,
      chatHistory,
      recommendations,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6 pt-4">
          <button onClick={onBack} className="flex items-center gap-2 text-purple-200 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-300" /> AI Consultation
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6">
            <h3 className="font-semibold text-lg mb-4">Your Requirements</h3>
            <div className="space-y-3">
              {[
                { key: 'days', label: 'Number of Days', placeholder: 'e.g. 5' },
                { key: 'persons', label: 'Number of Persons', placeholder: 'e.g. 2' },
                { key: 'budget', label: 'Budget', placeholder: 'e.g. $1000' },
                { key: 'packagePreference', label: 'Package Preference', placeholder: 'e.g. Luxury, Budget, Standard' },
                { key: 'foodPreference', label: 'Food Preference', placeholder: 'e.g. Vegetarian, Vegan, Non-veg' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs text-purple-200 mb-1">{label}</label>
                  <input
                    value={(form as any)[key]}
                    onChange={(e) => handleFormChange(key, e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-purple-200 mb-1">Additional Preferences</label>
                <textarea
                  value={form.additionalPreferences}
                  onChange={(e) => handleFormChange('additionalPreferences', e.target.value)}
                  placeholder="Any other requirements..."
                  rows={3}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                />
              </div>
            </div>

            <button
              onClick={generateRecommendations}
              disabled={recLoading}
              className="w-full mt-4 bg-yellow-400 text-gray-900 font-bold py-3 rounded-2xl hover:bg-yellow-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {recLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate Recommendations
            </button>

            {recommendations && (
              <div className="mt-4 bg-yellow-400/10 border border-yellow-400/30 rounded-2xl p-4">
                <h4 className="text-xs uppercase tracking-widest text-yellow-300 mb-2">Recommendations</h4>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{recommendations}</p>
              </div>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 flex flex-col">
            <h3 className="font-semibold text-lg mb-4">AI Assistant</h3>

            <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-[200px] max-h-[400px]">
              {chatHistory.length === 0 && (
                <div className="text-center text-purple-300 text-sm py-8">
                  Ask me anything about your query, plans, or requirements!
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-purple-500 text-white' : 'bg-white/20 text-white'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/20 rounded-2xl px-4 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendChat()}
                placeholder="Ask a question..."
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                onClick={sendChat}
                disabled={chatLoading || !chatInput.trim()}
                className="bg-purple-500 hover:bg-purple-400 text-white rounded-xl px-4 py-2 disabled:opacity-50 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleNext}
            className="bg-white text-purple-900 font-bold py-4 px-10 rounded-2xl text-lg hover:bg-purple-100 transition-all flex items-center gap-2"
          >
            Continue to Contact <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
