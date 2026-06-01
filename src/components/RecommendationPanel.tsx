import React from 'react';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { FormData } from './ConsultationForm';
import { ChatMessage } from '../types';

interface Props {
  formData: FormData;
  chatHistory: ChatMessage[];
  recommendations: string;
  transcript: string;
}

export default function RecommendationPanel({ formData, chatHistory, recommendations, transcript }: Props) {
  const [expanded, setExpanded] = React.useState(true);
  const hasData = Object.values(formData).some((v) => v.trim()) || recommendations || chatHistory.length > 0;

  if (!hasData) return null;

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 mt-4">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between text-left"
      >
        <h3 className="font-semibold text-lg text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-300" /> Consultation Summary
        </h3>
        {expanded ? <ChevronUp className="w-4 h-4 text-purple-300" /> : <ChevronDown className="w-4 h-4 text-purple-300" />}
      </button>

      {expanded && (
        <div className="mt-4 space-y-4">
          {transcript && (
            <SummaryCard title="Voice Query">
              <p className="text-sm text-white/90 leading-relaxed italic">"{transcript}"</p>
            </SummaryCard>
          )}

          {Object.values(formData).some((v) => v.trim()) && (
            <SummaryCard title="Collected Information">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {[
                  { label: 'Days', value: formData.days },
                  { label: 'Persons', value: formData.persons },
                  { label: 'Budget', value: formData.budget },
                  { label: 'Package', value: formData.packagePreference },
                  { label: 'Food', value: formData.foodPreference },
                ].filter(({ value }) => value).map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-xs text-purple-300">{label}</dt>
                    <dd className="text-sm text-white font-medium">{value}</dd>
                  </div>
                ))}
                {formData.additionalPreferences && (
                  <div className="col-span-2">
                    <dt className="text-xs text-purple-300">Additional</dt>
                    <dd className="text-sm text-white">{formData.additionalPreferences}</dd>
                  </div>
                )}
              </dl>
            </SummaryCard>
          )}

          {chatHistory.length > 0 && (
            <SummaryCard title={`Q&A (${chatHistory.filter((m) => m.role === 'user').length} question${chatHistory.filter((m) => m.role === 'user').length !== 1 ? 's' : ''})`}>
              <div className="space-y-2">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`text-xs px-3 py-2 rounded-xl ${msg.role === 'user' ? 'bg-purple-500/30 text-purple-100' : 'bg-white/10 text-white/80'}`}>
                    <span className="font-semibold">{msg.role === 'user' ? 'Q: ' : 'A: '}</span>
                    {msg.content}
                  </div>
                ))}
              </div>
            </SummaryCard>
          )}

          {recommendations && (
            <SummaryCard title="AI Recommendations">
              <pre className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap font-sans">
                {recommendations}
              </pre>
            </SummaryCard>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <h4 className="text-xs uppercase tracking-widest text-purple-300 mb-3">{title}</h4>
      {children}
    </div>
  );
}
