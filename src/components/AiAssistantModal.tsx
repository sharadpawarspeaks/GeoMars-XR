import { useState, useRef, useEffect } from 'react';
import type { FC } from 'react';
import type { MarsSite, MarsCoordinate, MapLayerConfig, MissionRoutePlan, AiChatMessage } from '../types/mars';
import { queryAiScienceAssistant } from '../utils/aiAssistantEngine';
import { formatMarsCoordinate, formatElevation } from '../utils/marsMath';
import { Sparkles, X, Send, Bot, User, BookOpen, Loader2 } from 'lucide-react';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSite: MarsSite | null;
  selectedCoordinate: MarsCoordinate | null;
  activeLayer: MapLayerConfig;
  missionRoute?: MissionRoutePlan;
}

export const AiAssistantModal: FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  selectedSite,
  selectedCoordinate,
  activeLayer,
  missionRoute
}) => {
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Greetings. I am the **GeoMars AI Planetary Science Specialist**.\n\nI can explain Martian geology, analyze terrain altimetry from MOLA, interpret active remote sensing layers (such as THEMIS thermal inertia), or evaluate rover transit feasibility across the Martian areoid.\n\nSelect a suggested topic below or enter a planetary science inquiry.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: ['NASA Planetary Data System', 'USGS Astrogeology', 'MOLA Science Team']
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const text = (queryText || inputQuery).trim();
    if (!text || isLoading) return;

    const userMsg: AiChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await queryAiScienceAssistant(text, {
        selectedSite,
        selectedCoordinate,
        activeLayer,
        missionRoute
      });
      setMessages((prev) => [...prev, response]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Unable to query planetary telemetry at this time. Telemetry stream will retry automatically.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    selectedSite
      ? `Explain the geological significance of ${selectedSite.name.split(' (')[0]}`
      : 'Explain geological significance of Jezero Crater',
    `Explain the active map layer (${activeLayer.name})`,
    'Summarize rover traverse transit feasibility',
    'Compare Jezero Crater vs Olympus Mons'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="w-full max-w-2xl h-[620px] bg-[#111824] border border-[#273244] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#273244] bg-[#0D121C] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF6B35] to-[#F5A65B] flex items-center justify-center shadow-[0_0_12px_rgba(255,107,53,0.4)]">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#F5F7FA] font-['Outfit',sans-serif] leading-tight">
                AI Planetary Science Assistant
              </h2>
              <span className="text-[11px] text-[#94A3B8]">
                Grounded in NASA PDS archives & MOLA areoid altimetry
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#94A3B8] hover:text-[#F5F7FA] rounded-lg hover:bg-[#0D121C] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Context Telemetry Bar */}
        <div className="px-5 py-2 bg-[#080B12] border-b border-[#273244] flex items-center gap-2 text-[11px] font-mono text-[#94A3B8] overflow-x-auto scrollbar-none">
          <span className="text-[#FF6B35] font-semibold shrink-0">CONTEXT:</span>
          <span className="px-2 py-0.5 rounded bg-[#0D121C] border border-[#273244] text-[#F5F7FA] truncate max-w-[150px]">
            {selectedSite ? selectedSite.name.split(' (')[0] : 'Free Reticle'}
          </span>
          <span className="px-2 py-0.5 rounded bg-[#0D121C] border border-[#273244] text-[#F5F7FA] shrink-0">
            {selectedCoordinate ? formatMarsCoordinate(selectedCoordinate.lat, selectedCoordinate.lng) : '18.38° N, 77.58° E'}
          </span>
          <span className="px-2 py-0.5 rounded bg-[#0D121C] border border-[#273244] text-[#F5F7FA] shrink-0">
            {formatElevation(selectedCoordinate?.elevationMeters || (selectedSite ? selectedSite.elevationMeters : -2560))}
          </span>
          <span className="px-2 py-0.5 rounded bg-[#0D121C] border border-[#273244] text-[#338BFF] shrink-0 truncate max-w-[130px]">
            {activeLayer.name}
          </span>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 scrollbar-thin text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[88%] ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs ${
                  msg.role === 'user'
                    ? 'bg-[#FF6B35] text-white shadow-md'
                    : 'bg-[#0D121C] border border-[#273244] text-[#338BFF]'
                }`}
              >
                {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-3.5 rounded-2xl flex flex-col gap-2 ${
                  msg.role === 'user'
                    ? 'bg-[#FF6B35] text-white rounded-tr-none'
                    : 'bg-[#0D121C] border border-[#273244] text-[#F5F7FA] rounded-tl-none shadow-sm'
                }`}
              >
                <div className="prose prose-invert prose-xs max-w-none leading-relaxed whitespace-pre-line">
                  {msg.content}
                </div>

                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/10 flex flex-wrap gap-1.5 items-center text-[10px] text-[#94A3B8]">
                    <BookOpen className="w-3 h-3 text-[#FF6B35]" />
                    <span className="font-semibold text-[#94A3B8]">Sources:</span>
                    {msg.citations.map((cite, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-white/80 font-mono"
                      >
                        {cite}
                      </span>
                    ))}
                  </div>
                )}

                <span className="text-[9px] text-[#94A3B8] self-end">{msg.timestamp}</span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="mr-auto flex gap-3 max-w-[85%] items-center text-xs text-[#94A3B8]">
              <div className="w-7 h-7 rounded-lg bg-[#0D121C] border border-[#273244] text-[#338BFF] flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 rounded-2xl bg-[#0D121C] border border-[#273244] flex items-center gap-2">
                <span>Analyzing planetary telemetry & orbital data...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Pills */}
        <div className="px-5 py-2 border-t border-[#273244] bg-[#080B12]/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] text-[#94A3B8] hover:text-white bg-[#0D121C] hover:bg-[#111824] border border-[#273244] hover:border-[#FF6B35]/60 px-2.5 py-1 rounded-full shrink-0 transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[#273244] bg-[#0D121C] flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about Martian geology, MOLA altimetry, or rover routes..."
            className="flex-1 bg-[#080B12] border border-[#273244] focus:border-[#FF6B35] rounded-xl px-4 py-2.5 text-xs text-[#F5F7FA] placeholder-[#94A3B8] focus:outline-none transition-colors"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#F5A65B] disabled:opacity-40 disabled:hover:bg-[#FF6B35] text-white font-semibold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,107,53,0.3)] transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </div>
      </div>
    </div>
  );
};

