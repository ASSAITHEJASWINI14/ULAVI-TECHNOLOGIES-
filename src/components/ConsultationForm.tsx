import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export interface FormData {
  days: string;
  persons: string;
  budget: string;
  packagePreference: string;
  foodPreference: string;
  additionalPreferences: string;
}

interface Props {
  data: FormData;
  onChange: (field: keyof FormData, value: string) => void;
  onGenerateRecommendations: () => void;
  loading: boolean;
  recommendations: string;
}

const FIELDS: { key: keyof FormData; label: string; placeholder: string }[] = [
  { key: 'days', label: 'Number of Days', placeholder: 'e.g. 5' },
  { key: 'persons', label: 'Number of Persons', placeholder: 'e.g. 2' },
  { key: 'budget', label: 'Budget', placeholder: 'e.g. $1000' },
  { key: 'packagePreference', label: 'Package Preference', placeholder: 'e.g. Luxury, Budget, Standard' },
  { key: 'foodPreference', label: 'Food Preference', placeholder: 'e.g. Vegetarian, Vegan, Non-veg' },
];

export default function ConsultationForm({ data, onChange, onGenerateRecommendations, loading, recommendations }: Props) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 flex flex-col h-full">
      <h3 className="font-semibold text-lg mb-4 text-white">Your Requirements</h3>

      <div className="space-y-3 flex-1">
        {FIELDS.map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="block text-xs text-purple-200 mb-1">{label}</label>
            <input
              value={data[key]}
              onChange={(e) => onChange(key, e.target.value)}
              placeholder={placeholder}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
        ))}

        <div>
          <label className="block text-xs text-purple-200 mb-1">Additional Preferences</label>
          <textarea
            value={data.additionalPreferences}
            onChange={(e) => onChange('additionalPreferences', e.target.value)}
            placeholder="Any other requirements or details..."
            rows={3}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
          />
        </div>
      </div>

      <button
        onClick={onGenerateRecommendations}
        disabled={loading}
        className="w-full mt-4 bg-yellow-400 text-gray-900 font-bold py-3 rounded-2xl hover:bg-yellow-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
        ) : (
          <><Sparkles className="w-4 h-4" /> Generate Recommendations</>
        )}
      </button>
    </div>
  );
}
