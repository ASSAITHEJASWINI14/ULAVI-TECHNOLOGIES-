import React, { useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User } from 'lucide-react';
import { ChatMessage } from '../types';

interface Props {
  chatHistory: ChatMessage[];
  input: string;
  loading: boolean;
  onInputChange: (val: string) => void;
  onSend: () => void;
}

export default function ConsultationChat({ chatHistory, input, loading, onInputChange, onSend }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 flex flex-col h-full">
      <h3 className="font-semibold text-lg mb-4 text-white flex items-center gap-2">
        <Bot className="w-5 h-5 text-purple-300" /> AI Assistant
      </h3>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-[220px] max-h-[380px] pr-1">
        {chatHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <Bot className="w-10 h-10 text-purple-400 mb-3" />
            <p className="text-purple-300 text-sm font-medium">Ask me anything!</p>
            <p className="text-purple-400 text-xs mt-1">Try: "What's the best plan?" or "Suggest food options"</p>
          </div>
        )}

        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-purple-500/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div
              className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-purple-500 text-white rounded-br-md'
                  : 'bg-white/20 text-white rounded-bl-md'
              }`}
            >
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-pink-500/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2 justify-start">
            <div className="w-7 h-7 rounded-full bg-purple-500/50 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white/20 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1 items-center">
                <span className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 mt-auto">
        <input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask a question…"
          disabled={loading}
          className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50"
        />
        <button
          onClick={onSend}
          disabled={loading || !input.trim()}
          className="bg-purple-500 hover:bg-purple-400 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-4 py-2.5 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
