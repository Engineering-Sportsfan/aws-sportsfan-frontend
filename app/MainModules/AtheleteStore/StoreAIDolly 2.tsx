import { useNavigate } from 'react-router';
 
import { ArrowLeft, Upload, MessageSquare, Send, Cpu, AlertTriangle, CheckCircle, Zap, BookOpen, Clock } from 'lucide-react';
import { useState } from 'react';

type Phase = {
  name: string;
  rating: number;
  ratingColor: string;
  note: string;
};

const sampleReport = {
  athlete: 'Rahul M.',
  event: 'Sprint — 100m',
  overallScore: 74,
  phases: [
    { name: 'Start / Reaction', rating: 8.2, ratingColor: '#00c864', note: 'Excellent drive-phase positioning; slight lean forward over blocks.' },
    { name: 'Drive Phase', rating: 7.1, ratingColor: '#00c864', note: 'Good push-off mechanics. Arm swing slightly crossing midline by 20m.' },
    { name: 'Acceleration', rating: 6.8, ratingColor: '#cd620e', note: 'Transition to upright happens too early (~25m). Can be delayed to ~30m for better speed.' },
    { name: 'Top Speed Mechanics', rating: 5.9, ratingColor: '#cd620e', note: 'Hip extension below optimal. Knee drive needs to reach hip height consistently.' },
    { name: 'Deceleration', rating: 7.4, ratingColor: '#00c864', note: 'Good maintenance through 70-90m. Minor braking force detected from overstriding.' },
  ] as Phase[],
  strengths: [
    'Strong reaction time (0.13s) — top quartile for your level',
    'Consistent arm drive cadence from 0-40m',
    'Good block push angle (~42°)',
  ],
  errors: [
    { flag: true, text: 'Early upright transition reducing stride length by est. 3-4%' },
    { flag: true, text: 'Overstriding at 70m+ creating braking force — injury risk if persistent' },
    { flag: false, text: 'Arm crossing midline at high speed — efficiency leak' },
  ],
  drills: [
    'Wicket runs (40-60m) — maintain low COM through acceleration zone',
    'A-skip variation — emphasize hip height at drive phase',
    'Wall drill series — improve push-off mechanics and dorsiflexion',
    'Overspeed treadmill (bungee) — develop feel for full hip extension at top speed',
  ],
};

const chatMessages = [
  { from: 'dolly', text: "Hi! I'm Dolly, your AI athletics coach. Upload a video of your technique or ask me anything about training, injury prevention, or event selection." },
  { from: 'user', text: "How should I structure a taper week before a 5K race?" },
  { from: 'dolly', text: "Great question! Here's a typical 5K taper structure:\n\n• Days 7-5: Reduce volume by 30-40%, maintain intensity\n• Day 4: Easy 20-min jog + strides\n• Day 3: Short race-pace segment (2×1km at goal pace)\n• Day 2: Complete rest or very light walk\n• Race Day: Dynamic warm-up 30 min before, 10-min easy jog\n\nThe key is to reduce miles but keep your legs sharp with short quality efforts." },
];

const suggestedCoaches = [
  { name: 'Anubhav Karmakar', role: 'Marathon & Distance', img: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=80&h=80&fit=crop&auto=format' },
  { name: 'Vikas Srinivasan', role: '5K to Ultra', img: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&h=80&fit=crop&auto=format' },
];

function RatingBadge({ rating, color }: { rating: number; color: string }) {
  return (
    <span className="text-[12px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
      {rating}/10
    </span>
  );
}

function AIReport({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex-1 overflow-y-auto pb-[70px] no-scrollbar">
      {/* Score header */}
      <div
        className="mx-4 mt-4 rounded-[20px] p-5 mb-4"
        style={{ background: 'linear-gradient(135deg,rgba(201,17,95,0.15),rgba(205,98,14,0.1))', border: '1px solid rgba(201,17,95,0.2)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#99A1AF] text-[12px] mb-1">{sampleReport.athlete} · {sampleReport.event}</p>
            <p className="text-white text-[13px]">Biomechanical Analysis</p>
          </div>
          <div className="text-center">
            <div className="w-[64px] h-[64px] rounded-full border-4 border-[#c9115f] flex items-center justify-center">
              <p className="text-white text-[20px] font-bold">{sampleReport.overallScore}</p>
            </div>
            <p className="text-[#99A1AF] text-[10px] mt-1">Overall</p>
          </div>
        </div>
      </div>

      <div className="px-4">
        {/* Phase breakdown */}
        <p className="text-white text-[14px] font-bold mb-3">Phase Breakdown</p>
        <div className="flex flex-col gap-3 mb-5">
          {sampleReport.phases.map((phase, i) => (
            <div key={i} className="rounded-[14px] p-4" style={{ background: '#111116', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-white text-[13px] font-semibold">{phase.name}</p>
                <RatingBadge rating={phase.rating} color={phase.ratingColor} />
              </div>
              <p className="text-[#a8a8b8] text-[12px] leading-snug">{phase.note}</p>
            </div>
          ))}
        </div>

        {/* Strengths */}
        <p className="text-white text-[14px] font-bold mb-3">Strengths</p>
        <div className="flex flex-col gap-2 mb-5">
          {sampleReport.strengths.map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle className="w-[14px] h-[14px] text-[#00c864] flex-shrink-0 mt-0.5" />
              <span className="text-[#c8c8d0] text-[13px]">{s}</span>
            </div>
          ))}
        </div>

        {/* Errors / Risk Flags */}
        <p className="text-white text-[14px] font-bold mb-3">Errors & Risk Flags</p>
        <div className="flex flex-col gap-2 mb-5">
          {sampleReport.errors.map((e, i) => (
            <div key={i} className="flex items-start gap-3">
              <AlertTriangle className="w-[14px] h-[14px] flex-shrink-0 mt-0.5" style={{ color: e.flag ? '#cd620e' : '#6b7280' }} />
              <span className="text-[13px]" style={{ color: e.flag ? '#d0c8c8' : '#99A1AF' }}>{e.text}</span>
            </div>
          ))}
        </div>

        {/* Suggested Drills */}
        <p className="text-white text-[14px] font-bold mb-3">Suggested Drills</p>
        <div className="flex flex-col gap-2 mb-5">
          {sampleReport.drills.map((drill, i) => (
            <div key={i} className="flex items-start gap-3 rounded-[12px] p-3" style={{ background: '#111116', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-[12px] font-bold text-[#c9115f] w-[18px] flex-shrink-0">{i + 1}.</span>
              <span className="text-[#c8c8d0] text-[13px] leading-snug">{drill}</span>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex gap-3">
          <button className="flex-1 rounded-full py-3 text-[13px] font-semibold border border-[rgba(255,255,255,0.15)] text-[#99A1AF] flex items-center justify-center gap-1.5">
            <BookOpen className="w-[13px] h-[13px]" /> Share with Coach
          </button>
          <button
            onClick={() => onBack()}
            className="flex-1 rounded-full py-3 text-white text-[13px] font-bold flex items-center justify-center gap-1.5"
            style={{ background: 'linear-gradient(135deg,#c9115f,#cd620e)' }}
          >
            <Zap className="w-[13px] h-[13px]" /> Book Session
          </button>
        </div>
      </div>
    </div>
  );
}

function DollyChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(chatMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setTimeout(() => {
      const responses = [
        "Great question! For sprint training, I'd recommend 3 speed sessions per week with adequate recovery (48h+) between each. Focus on quality over quantity.",
        "That's a common concern. Injury prevention starts with progressive overload — never increase weekly mileage by more than 10%. Also add 2 strength sessions per week targeting glutes and hamstrings.",
        "Based on your training pattern, I'd suggest a 3-week base block followed by 2 weeks of threshold work. This should set you up well for race season.",
      ];
      setMessages(prev => [...prev, { from: 'dolly', text: responses[Math.floor(Math.random() * responses.length)] }]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto pb-4 no-scrollbar px-4 pt-4">
        <div className="flex flex-col gap-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex items-end gap-2 ${msg.from === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.from === 'dolly' && (
                <div className="w-[30px] h-[30px] rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#c9115f,#cd620e)' }}>
                  <Cpu className="w-[14px] h-[14px] text-white" />
                </div>
              )}
              <div
                className="max-w-[75%] rounded-[18px] px-4 py-3"
                style={msg.from === 'user' ? {
                  background: 'linear-gradient(135deg,#c9115f,#cd620e)',
                  borderBottomRightRadius: 4,
                } : {
                  background: '#111116',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderBottomLeftRadius: 4,
                }}
              >
                <p className="text-white text-[13px] leading-relaxed whitespace-pre-line">{msg.text}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-end gap-2">
              <div className="w-[30px] h-[30px] rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#c9115f,#cd620e)' }}>
                <Cpu className="w-[14px] h-[14px] text-white" />
              </div>
              <div className="rounded-[18px] px-4 py-3 flex gap-1" style={{ background: '#111116', border: '1px solid rgba(255,255,255,0.07)', borderBottomLeftRadius: 4 }}>
                {[0, 1, 2].map(j => (
                  <div key={j} className="w-[6px] h-[6px] rounded-full bg-[#99A1AF] animate-bounce" style={{ animationDelay: `${j * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}

          {/* Suggested coaches inline */}
          {messages.length >= 3 && (
            <div className="rounded-[16px] p-4" style={{ background: 'rgba(201,17,95,0.07)', border: '1px solid rgba(201,17,95,0.15)' }}>
              <p className="text-white text-[12px] font-semibold mb-2">Coaches who can help with this:</p>
              <div className="flex gap-3">
                {suggestedCoaches.map((c, i) => (
                  <button key={i} className="flex items-center gap-2 flex-1 bg-[rgba(0,0,0,0.3)] rounded-[10px] p-2" onClick={() => navigate(`/store/coach/${i + 1}`)}>
                    <img src={c.img} alt={c.name} className="w-[32px] h-[32px] rounded-full object-cover border border-[rgba(201,17,95,0.3)]" />
                    <div className="text-left">
                      <p className="text-white text-[11px] font-semibold">{c.name.split(' ')[0]}</p>
                      <p className="text-[#99A1AF] text-[10px]">{c.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-4 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ask Dolly anything..."
            className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-full px-4 py-2.5 text-white text-[13px] placeholder:text-[#4a4a5a] focus:outline-none focus:border-[rgba(201,17,95,0.5)]"
          />
          <button
            onClick={send}
            className="w-[40px] h-[40px] rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#c9115f,#cd620e)' }}
          >
            <Send className="w-[16px] h-[16px] text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StoreAIDolly() {
  const navigate = useNavigate();
  const [view, setView] = useState<'home' | 'upload' | 'report' | 'chat'>('home');
  const [uploading, setUploading] = useState(false);

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => { setUploading(false); setView('report'); }, 2500);
  };

  return (
    <div className="bg-black w-full flex justify-center min-h-screen">
      <div className="w-full max-w-[390px] bg-[#0b0b0f] relative flex flex-col min-h-screen">
        <div className="sticky top-0 z-50 bg-[#0b0b0f] border-b border-[rgba(255,255,255,0.05)] h-[56px] flex items-center px-4 gap-3">
          <button
            onClick={() => view === 'home' ? navigate('/store') : setView('home')}
            className="w-[36px] h-[36px] rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center"
          >
            <ArrowLeft className="w-[18px] h-[18px] text-white" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-[28px] h-[28px] rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#c9115f,#cd620e)' }}>
              <Cpu className="w-[14px] h-[14px] text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-[17px]">Dolly AI</h1>
              <p className="text-[#00c864] text-[10px] font-semibold">Online</p>
            </div>
          </div>
        </div>

        {view === 'report' && <AIReport onBack={() => setView('home')} />}
        {view === 'chat' && <DollyChat />}

        {view === 'home' && (
          <div className="flex-1 overflow-y-auto pb-[70px] no-scrollbar px-4 pt-4">
            <p className="text-[#a8a8b8] text-[13px] leading-relaxed mb-6">
              Dolly is SF360's AI athletics coach. Upload your training video for biomechanical analysis, or start a conversation to get personalised coaching advice.
            </p>

            {/* Two entry cards */}
            <div className="flex flex-col gap-4 mb-6">
              <button
                onClick={() => setView('upload')}
                className="w-full rounded-[20px] p-5 text-left"
                style={{ background: 'linear-gradient(135deg,rgba(201,17,95,0.15),rgba(205,98,14,0.1))', border: '1px solid rgba(201,17,95,0.25)' }}
              >
                <div className="w-[50px] h-[50px] rounded-[14px] flex items-center justify-center mb-3" style={{ background: 'linear-gradient(135deg,#c9115f,#cd620e)' }}>
                  <Upload className="w-[22px] h-[22px] text-white" />
                </div>
                <p className="text-white text-[16px] font-bold mb-1">Upload Video for Analysis</p>
                <p className="text-[#a8a8b8] text-[12px]">Get phase-by-phase biomechanical feedback on your sprint, jump, or throw technique.</p>
              </button>

              <button
                onClick={() => setView('chat')}
                className="w-full rounded-[20px] p-5 text-left"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="w-[50px] h-[50px] rounded-[14px] flex items-center justify-center mb-3" style={{ background: 'linear-gradient(135deg,#c9115f,#cd620e)' }}>
                  <MessageSquare className="w-[22px] h-[22px] text-white" />
                </div>
                <p className="text-white text-[16px] font-bold mb-1">Ask Dolly</p>
                <p className="text-[#a8a8b8] text-[12px]">Training questions, taper advice, injury prevention, event selection — ask anything.</p>
              </button>
            </div>

            {/* Coming Soon teaser */}
            <div className="rounded-[16px] p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-[13px] h-[13px] text-[#4a4a5a]" />
                <span className="text-[#4a4a5a] text-[11px] font-semibold uppercase tracking-wide">Coming Soon</span>
              </div>
              <p className="text-[#99A1AF] text-[13px] font-semibold">Video Dolly — Live Camera Mode</p>
              <p className="text-[#4a4a5a] text-[12px] mt-1">Real-time form feedback via your camera during training sessions. Currently in development.</p>
            </div>
          </div>
        )}

        {view === 'upload' && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            {uploading ? (
              <>
                <div className="w-[80px] h-[80px] rounded-full border-4 border-[#c9115f] border-t-transparent animate-spin mb-6" />
                <p className="text-white text-[16px] font-bold mb-2">Analysing your video…</p>
                <p className="text-[#99A1AF] text-[13px]">Dolly is processing biomechanical data. This takes about 15–20 seconds.</p>
              </>
            ) : (
              <>
                <button
                  onClick={handleUpload}
                  className="w-[120px] h-[120px] rounded-[28px] flex flex-col items-center justify-center gap-2 mb-6 transition-transform active:scale-95"
                  style={{ background: 'linear-gradient(135deg,rgba(201,17,95,0.2),rgba(205,98,14,0.15))', border: '2px dashed rgba(201,17,95,0.5)' }}
                >
                  <Upload className="w-[32px] h-[32px] text-[#c9115f]" />
                  <span className="text-[#c9115f] text-[12px] font-semibold">Upload</span>
                </button>
                <p className="text-white text-[16px] font-bold mb-2">Upload Your Video</p>
                <p className="text-[#99A1AF] text-[13px] mb-2">Tap above to upload from your gallery or camera roll.</p>
                <p className="text-[#4a4a5a] text-[11px]">Supported: MP4, MOV · Max 300MB · Min 5 seconds</p>
              </>
            )}
          </div>
        )}
      </div>
 
    </div>
  );
}
