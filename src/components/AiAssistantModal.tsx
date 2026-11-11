import { useState, useRef, useEffect, useCallback } from 'react';
import type { FC } from 'react';
import type {
  MarsSite,
  MarsCoordinate,
  MapLayerConfig,
  MissionRoutePlan,
  AiChatMessage
} from '../types/mars';
import { queryAiScienceAssistant } from '../utils/aiAssistantEngine';
import { formatMarsCoordinate, formatElevation } from '../utils/marsMath';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  BookOpen,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from 'lucide-react';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSite: MarsSite | null;
  selectedCoordinate: MarsCoordinate | null;
  activeLayer: MapLayerConfig;
  missionRoute?: MissionRoutePlan;
}

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionInstanceLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
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
      content: `Greetings. I am the **GeoMars XR Planetary Science Assistant**.\n\nI can answer questions about Martian geology, atmospheric survival constraints, Perseverance and Curiosity discoveries, and explain your currently selected terrain or rover route.\n\nAll answers explicitly separate verified NASA/JPL/USGS/ESA facts from simulated telemetry.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: ['NASA Planetary Data System', 'USGS Astrogeology', 'MOLA Science Team'],
      mode: 'verified-corpus'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(false);
  const [voiceStatusNote, setVoiceStatusNote] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstanceLike | null>(null);

  const speechSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Sync native <dialog> showModal() / close() with React isOpen state
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Light-dismiss fallback for browsers lacking native closedby="any"
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return;

    const isOutside = (e: PointerEvent) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };

    let pressedOutside = false;
    const onDown = (e: PointerEvent) => {
      pressedOutside = isOutside(e);
    };
    const onUp = (e: PointerEvent) => {
      if (pressedOutside && isOutside(e)) dialog.close();
      pressedOutside = false;
    };

    dialog.addEventListener('pointerdown', onDown);
    dialog.addEventListener('pointerup', onUp);
    return () => {
      dialog.removeEventListener('pointerdown', onDown);
      dialog.removeEventListener('pointerup', onUp);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const speakResponse = useCallback(
    (text: string) => {
      if (!voiceOutputEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return;
      }
      try {
        window.speechSynthesis.cancel();
        const plain = text.replace(/[#*_`]/g, '').slice(0, 650);
        const utter = new SpeechSynthesisUtterance(plain);
        utter.rate = 1.02;
        window.speechSynthesis.speak(utter);
      } catch {
        // Ignore TTS failure gracefully
      }
    },
    [voiceOutputEnabled]
  );

  const handleSend = useCallback(
    async (queryText?: string) => {
      const text = (queryText ?? inputQuery).trim();
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
        speakResponse(response.content);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content:
              'Unable to query external AI service. Verified offline planetary science engine remains available.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [inputQuery, isLoading, selectedSite, selectedCoordinate, activeLayer, missionRoute, speakResponse]
  );

  const toggleVoiceInput = () => {
    if (!speechSupported) {
      setVoiceStatusNote('Web Speech input is not supported in this browser; use text input.');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const win = window as unknown as {
        SpeechRecognition?: new () => SpeechRecognitionInstanceLike;
        webkitSpeechRecognition?: new () => SpeechRecognitionInstanceLike;
      };
      const Ctor = win.SpeechRecognition || win.webkitSpeechRecognition;
      if (!Ctor) return;

      const recognition = new Ctor();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript?.trim();
        if (transcript) {
          setVoiceStatusNote(`Heard: "${transcript}"`);
          void handleSend(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setVoiceStatusNote('Voice capture cancelled or unavailable; type your question below.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      setVoiceStatusNote('Listening for Martian science inquiry...');
      setIsListening(true);
      recognition.start();
    } catch {
      setIsListening(false);
      setVoiceStatusNote('Microphone permission denied or unavailable.');
    }
  };

  const suggestedQuestions = [
    'Why is Mars red?',
    'Could humans survive on Mars?',
    'What did Perseverance discover?',
    'Where is the best location for scientific exploration?',
    'What makes Jezero Crater important?',
    selectedSite
      ? `Explain the selected Martian terrain (${selectedSite.name.split(' (')[0]})`
      : 'Explain the selected Martian terrain'
  ];

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="ai-assistant-dialog-title"
      onClose={() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        onClose();
      }}
      {...({ closedby: 'any' } as Record<string, string>)}
      className="m-auto w-full max-w-2xl h-[min(660px,90vh)] bg-[#111824] border border-[#273244] rounded-2xl shadow-2xl p-0 text-[#F5F7FA] overflow-hidden"
    >
      <div className="w-full h-full flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-[#273244] bg-[#0D121C] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF6B35] to-[#F5A65B] flex items-center justify-center shadow-[0_0_12px_rgba(255,107,53,0.4)]">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2
                id="ai-assistant-dialog-title"
                className="text-[15px] font-bold text-[#F5F7FA] font-['Outfit',sans-serif] leading-tight"
              >
                AI Mars Science Assistant
              </h2>
              <span className="text-[11px] text-[#94A3B8]">
                Context-aware • Grounded in NASA PDS / USGS / ESA sources
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setVoiceOutputEnabled((v) => !v)}
              aria-pressed={voiceOutputEnabled}
              title={voiceOutputEnabled ? 'Mute voice readout' : 'Enable voice readout'}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                voiceOutputEnabled
                  ? 'bg-[#338BFF]/20 border-[#338BFF]/50 text-[#338BFF]'
                  : 'border-[#273244] text-[#94A3B8] hover:text-white'
              }`}
            >
              {voiceOutputEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close AI Science Assistant"
              className="p-1.5 text-[#94A3B8] hover:text-[#F5F7FA] rounded-lg hover:bg-[#111824] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-5 py-2 bg-[#080B12] border-b border-[#273244] flex items-center gap-2 text-[11px] font-mono text-[#94A3B8] overflow-x-auto scrollbar-none">
          <span className="text-[#FF6B35] font-semibold shrink-0">CONTEXT:</span>
          <span className="px-2 py-0.5 rounded bg-[#0D121C] border border-[#273244] text-[#F5F7FA] truncate max-w-[150px]">
            {selectedSite ? selectedSite.name.split(' (')[0] : 'Surface Reticle'}
          </span>
          <span className="px-2 py-0.5 rounded bg-[#0D121C] border border-[#273244] text-[#F5F7FA] shrink-0">
            {selectedCoordinate
              ? formatMarsCoordinate(selectedCoordinate.lat, selectedCoordinate.lng)
              : '18.38° N, 77.58° E'}
          </span>
          <span className="px-2 py-0.5 rounded bg-[#0D121C] border border-[#273244] text-[#F5F7FA] shrink-0">
            {formatElevation(
              selectedCoordinate?.elevationMeters ?? (selectedSite ? selectedSite.elevationMeters : -2560)
            )}
          </span>
          <span className="px-2 py-0.5 rounded bg-[#0D121C] border border-[#273244] text-[#338BFF] shrink-0 truncate max-w-[130px]">
            {activeLayer.name}
          </span>
        </div>

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
                <div className="leading-relaxed whitespace-pre-line">{msg.content}</div>

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

                <div className="flex items-center justify-between text-[9px] text-[#94A3B8]">
                  {msg.role === 'assistant' && (
                    <span className="font-mono uppercase">
                      {msg.mode === 'server-ai' ? 'AI Proxy Synthesis' : 'NASA-Grounded Engine'}
                    </span>
                  )}
                  <span className="ml-auto">{msg.timestamp}</span>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="mr-auto flex gap-3 max-w-[85%] items-center text-xs text-[#94A3B8]">
              <div className="w-7 h-7 rounded-lg bg-[#0D121C] border border-[#273244] text-[#338BFF] flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 rounded-2xl bg-[#0D121C] border border-[#273244] flex items-center gap-2">
                <span>Analyzing planetary telemetry & NASA PDS corpus...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {voiceStatusNote && (
          <div className="px-5 py-1.5 bg-[#080B12] border-t border-[#273244] text-[11px] text-[#338BFF] font-mono">
            {voiceStatusNote}
          </div>
        )}

        <div className="px-5 py-2 border-t border-[#273244] bg-[#080B12]/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {suggestedQuestions.map((q, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => void handleSend(q)}
              className="text-[11px] text-[#94A3B8] hover:text-white bg-[#0D121C] hover:bg-[#111824] border border-[#273244] hover:border-[#FF6B35]/60 px-2.5 py-1 rounded-full shrink-0 transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSend();
          }}
          className="p-4 border-t border-[#273244] bg-[#0D121C] flex items-center gap-2"
        >
          <button
            type="button"
            onClick={toggleVoiceInput}
            aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
            title={speechSupported ? 'Voice input (Web Speech API)' : 'Voice input unsupported'}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              isListening
                ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                : 'bg-[#080B12] border-[#273244] text-[#94A3B8] hover:text-white'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            aria-label="Ask a Mars science question"
            autoFocus
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask about Martian geology, survival, Perseverance, or selected terrain..."
            className="flex-1 bg-[#080B12] border border-[#273244] focus:border-[#FF6B35] rounded-xl px-4 py-2.5 text-xs text-[#F5F7FA] placeholder-[#94A3B8] focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#F5A65B] disabled:opacity-40 disabled:hover:bg-[#FF6B35] text-white font-semibold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,107,53,0.3)] transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </form>
      </div>
    </dialog>
  );
};
