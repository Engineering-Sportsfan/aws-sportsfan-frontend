import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, ChevronRight, Check, X, Clock, DollarSign, MapPin, Wifi, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { storeService } from '@/services/store.service';

type RequestStatus = 'open' | 'offers' | 'confirmed' | 'expired';

const statusConfig: Record<RequestStatus, { label: string; color: string; bg: string }> = {
  open: { label: 'Open', color: '#00c864', bg: 'rgba(0,200,100,0.12)' },
  offers: { label: 'Offers Received', color: '#FFD700', bg: 'rgba(255,215,0,0.12)' },
  confirmed: { label: 'Confirmed', color: '#c9115f', bg: 'rgba(201,17,95,0.12)' },
  expired: { label: 'Expired', color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
};

const mockOffers = [
  {
    id: 1,
    name: 'Anubhav Karmakar',
    role: 'Founder, Athloft Multisport',
    price: '₹2,000/hr',
    image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=80&h=80&fit=crop&auto=format',
    note: "I've trained 10+ Berlin qualifiers. Happy to design a custom 16-week plan targeting your goal time.",
    rating: 4.9,
  },
  {
    id: 2,
    name: 'Kiran Badiger',
    role: 'Distance Running Coach',
    price: '₹1,600/hr',
    image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=80&h=80&fit=crop&auto=format',
    note: "Specialise in international qualifier standards. Counter-offer: ₹1,600/hr with free race-day strategy call.",
    rating: 4.7,
  },
];

function PostRequestForm({ onBack }: { onBack: () => void }) {
  const [sport, setSport] = useState('');
  const [skill, setSkill] = useState('');
  const [goal, setGoal] = useState('');
  const [budget, setBudget] = useState([1000, 3000]);
  const [mode, setMode] = useState<'online' | 'offline'>('online');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePostRequest = async () => {
    if (!sport || !skill || !goal) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await storeService.createSessionRequest({
        userId: 'mock-user-123',
        sport,
        skill,
        goal,
        budget: `₹${budget[0]}–${budget[1]}/hr`,
        mode,
        status: 'open',
      });
      setSubmitted(true);
    } catch (err: any) {
      alert(err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-[70px] h-[70px] rounded-full bg-gradient-to-br from-[#c9115f] to-[#cd620e] flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(201,17,95,0.4)]">
          <Check className="w-[32px] h-[32px] text-white" />
        </div>
        <h2 className="text-white text-[20px] font-bold mb-2">Request Posted!</h2>
        <p className="text-[#99A1AF] text-[13px] mb-6">Coaches will respond within 24 hours. You'll be notified when offers come in.</p>
        <button
          onClick={onBack}
          className="rounded-full px-8 py-3 text-white text-[14px] font-semibold bg-gradient-to-r from-[#c9115f] to-[#cd620e]"
        >
          View My Requests
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-[100px] no-scrollbar px-4 pt-4">
      <div className="flex flex-col gap-5">
        <div>
          <label className="text-white text-[13px] font-semibold mb-2 block">Sport / Discipline</label>
          <input
            value={sport}
            onChange={e => setSport(e.target.value)}
            placeholder="e.g. Distance Running, Javelin, Sprint"
            className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[12px] px-4 py-3 text-white text-[14px] placeholder:text-[#4a4a5a] focus:outline-none focus:border-[rgba(201,17,95,0.5)]"
          />
        </div>

        <div>
          <label className="text-white text-[13px] font-semibold mb-2 block">Skill Needed</label>
          <input
            value={skill}
            onChange={e => setSkill(e.target.value)}
            placeholder="e.g. Marathon pacing, Technique analysis"
            className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[12px] px-4 py-3 text-white text-[14px] placeholder:text-[#4a4a5a] focus:outline-none focus:border-[rgba(201,17,95,0.5)]"
          />
        </div>

        <div>
          <label className="text-white text-[13px] font-semibold mb-2 block">Your Goal</label>
          <textarea
            value={goal}
            onChange={e => setGoal(e.target.value)}
            placeholder="Describe what you're trying to achieve..."
            rows={3}
            className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[12px] px-4 py-3 text-white text-[14px] placeholder:text-[#4a4a5a] focus:outline-none focus:border-[rgba(201,17,95,0.5)] resize-none"
          />
        </div>

        <div>
          <label className="text-white text-[13px] font-semibold mb-2 block">Budget Range (per hour)</label>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#c9115f] text-[13px] font-bold">₹{budget[0].toLocaleString('en-IN')}</span>
            <span className="text-[#c9115f] text-[13px] font-bold">₹{budget[1].toLocaleString('en-IN')}</span>
          </div>
          <div className="flex gap-4">
            <input
              type="range"
              min="500"
              max="5000"
              value={budget[0]}
              onChange={(e) => setBudget([parseInt(e.target.value), budget[1]])}
              className="flex-1 accent-[#c9115f]"
            />
            <input
              type="range"
              min="5000"
              max="10000"
              value={budget[1]}
              onChange={(e) => setBudget([budget[0], parseInt(e.target.value)])}
              className="flex-1 accent-[#cd620e]"
            />
          </div>
        </div>

        <div>
          <label className="text-white text-[13px] font-semibold mb-3 block">Preferred Mode</label>
          <div className="flex gap-3">
            <button
              onClick={() => setMode('online')}
              className="flex-1 flex items-center justify-center gap-2 rounded-[12px] py-3 border transition-all"
              style={{
                background: mode === 'online' ? 'rgba(201,17,95,0.1)' : 'rgba(255,255,255,0.04)',
                border: mode === 'online' ? '1px solid rgba(201,17,95,0.4)' : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <Wifi className="w-[15px] h-[15px]" style={{ color: mode === 'online' ? '#c9115f' : '#99A1AF' }} />
              <span className="text-[13px] font-semibold" style={{ color: mode === 'online' ? '#c9115f' : '#99A1AF' }}>Online</span>
            </button>
            <button
              onClick={() => setMode('offline')}
              className="flex-1 flex items-center justify-center gap-2 rounded-[12px] py-3 border transition-all"
              style={{
                background: mode === 'offline' ? 'rgba(201,17,95,0.1)' : 'rgba(255,255,255,0.04)',
                border: mode === 'offline' ? '1px solid rgba(201,17,95,0.4)' : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <MapPin className="w-[15px] h-[15px]" style={{ color: mode === 'offline' ? '#c9115f' : '#99A1AF' }} />
              <span className="text-[13px] font-semibold" style={{ color: mode === 'offline' ? '#c9115f' : '#99A1AF' }}>In-Person</span>
            </button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-4 py-4 bg-[#0b0b0f] border-t border-[rgba(255,255,255,0.06)]">
        <button
          onClick={handlePostRequest}
          disabled={loading}
          className="w-full rounded-full py-3.5 text-white text-[15px] font-bold bg-gradient-to-r from-[#c9115f] to-[#cd620e] shadow-[0_0_20px_rgba(201,17,95,0.4)] flex items-center justify-center gap-2"
        >
          {loading ? 'Submitting...' : 'Post Request'}
        </button>
      </div>
    </div>
  );
}

function OffersView({ request, onBack }: { request: any; onBack: () => void }) {
  const navigate = useNavigate();
  const [decided, setDecided] = useState<Record<number, 'accept' | 'decline'>>({});

  return (
    <div className="flex-1 overflow-y-auto pb-[70px] no-scrollbar px-4 pt-4">
      <div className="bg-[#111116] rounded-[18px] border border-[rgba(255,255,255,0.07)] p-4 mb-5">
        <p className="text-white text-[14px] font-bold mb-1">{request.sport}</p>
        <p className="text-[#99A1AF] text-[12px] mb-2">{request.skill}</p>
        <p className="text-[#a8a8b8] text-[12px] leading-snug">"{request.goal}"</p>
      </div>

      <h3 className="text-white text-[13px] font-bold mb-3">Received Offers</h3>
      <div className="flex flex-col gap-3">
        {mockOffers.map((offer) => (
          <div key={offer.id} className="bg-[#111116] rounded-[18px] border border-[rgba(255,255,255,0.07)] p-4">
            <div className="flex items-center gap-3 mb-3">
              <img src={offer.image} alt={offer.name} className="w-[40px] h-[40px] rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-[13px] font-bold truncate">{offer.name}</p>
                <p className="text-[#5a5a6a] text-[10px] truncate">{offer.role}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[#c9115f] text-[13px] font-black">{offer.price}</p>
                <p className="text-[#99A1AF] text-[10px]">Rating: {offer.rating}</p>
              </div>
            </div>
            <p className="text-[#a8a8b8] text-[12px] leading-relaxed mb-3">"{offer.note}"</p>
            
            {decided[offer.id] ? (
              <div className="pt-2 border-t border-[rgba(255,255,255,0.05)] text-center">
                <span className={`text-[12px] font-bold ${decided[offer.id] === 'accept' ? 'text-[#00c864]' : 'text-[#ff4444]'}`}>
                  Offer {decided[offer.id] === 'accept' ? 'Accepted' : 'Declined'}
                </span>
                {decided[offer.id] === 'accept' && (
                  <button
                    onClick={() => navigate('/store/booking/1')}
                    className="mt-2 block w-full py-2 bg-gradient-to-r from-[#c9115f] to-[#cd620e] text-white text-[12px] font-bold rounded-full"
                  >
                    Proceed to Booking
                  </button>
                )}
              </div>
            ) : (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setDecided(d => ({ ...d, [offer.id]: 'decline' }))}
                  className="flex-1 py-2 rounded-full text-[12px] font-semibold border border-[rgba(255,255,255,0.1)] text-[#99A1AF] flex items-center justify-center gap-1"
                >
                  <X className="w-[12px] h-[12px]" /> Decline
                </button>
                <button
                  onClick={() => setDecided(d => ({ ...d, [offer.id]: 'accept' }))}
                  className="flex-1 py-2 rounded-full text-[12px] font-semibold text-white flex items-center justify-center gap-1"
                  style={{ background: 'linear-gradient(135deg,#c9115f,#cd620e)' }}
                >
                  <Check className="w-[12px] h-[12px]" /> Accept
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StoreSessionRequests() {
  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'post' | 'offers'>('list');
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await storeService.getSessionRequests('mock-user-123');
      setRequests(data);
    } catch (err) {
      console.error('Error fetching session requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'list') {
      loadRequests();
    }
  }, [view]);

  const handleRequestClick = (req: any) => {
    // Treat open request as offers-enabled for mock testing/reviewing offers
    setSelectedRequest(req);
    setView('offers');
  };

  return (
    <div className="bg-black w-full flex justify-center min-h-screen">
      <div className="w-full max-w-[390px] bg-[#0b0b0f] relative flex flex-col min-h-screen">
        <div className="sticky top-0 z-50 bg-[#0b0b0f] border-b border-[rgba(255,255,255,0.05)] h-[56px] flex items-center px-4 gap-3">
          <button
            onClick={() => view === 'list' ? navigate('/store') : setView('list')}
            className="w-[36px] h-[36px] rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center"
          >
            <ArrowLeft className="w-[18px] h-[18px] text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-bold text-[17px]">
              {view === 'post' ? 'Post a Request' : view === 'offers' ? 'Review Offers' : 'Session Requests'}
            </h1>
            {view === 'list' && <p className="text-[#99A1AF] text-[11px]">Find the right coach for your goal</p>}
          </div>
          {view === 'list' && (
            <button
              onClick={() => setView('post')}
              className="w-[36px] h-[36px] rounded-full flex items-center justify-center bg-gradient-to-br from-[#c9115f] to-[#cd620e]"
            >
              <Plus className="w-[18px] h-[18px] text-white" />
            </button>
          )}
        </div>

        {view === 'post' && <PostRequestForm onBack={() => setView('list')} />}
        {view === 'offers' && selectedRequest && <OffersView request={selectedRequest} onBack={() => setView('list')} />}

        {view === 'list' && (
          <div className="flex-1 overflow-y-auto pb-[70px] no-scrollbar">
            {/* Post Request CTA Card */}
            <div className="px-4 pt-4 mb-5">
              <button
                onClick={() => setView('post')}
                className="w-full rounded-[16px] p-4 border border-dashed border-[rgba(201,17,95,0.4)] flex items-center gap-3 bg-[rgba(201,17,95,0.06)]"
              >
                <div className="w-[42px] h-[42px] rounded-[12px] flex items-center justify-center bg-gradient-to-br from-[#c9115f] to-[#cd620e]">
                  <Plus className="w-[20px] h-[20px] text-white" />
                </div>
                <div className="text-left">
                  <p className="text-white text-[14px] font-semibold">Post a New Request</p>
                  <p className="text-[#99A1AF] text-[12px]">Let coaches come to you with offers</p>
                </div>
              </button>
            </div>

            {/* My Requests */}
            <div className="px-4">
              <p className="text-white text-[14px] font-bold mb-3">My Requests</p>
              {loading ? (
                <p className="text-center text-[#99A1AF] text-[12px] py-4">Loading requests...</p>
              ) : requests.length === 0 ? (
                <div className="bg-[#111116] rounded-[16px] border border-[rgba(255,255,255,0.07)] p-6 text-center mt-2">
                  <AlertCircle className="w-[24px] h-[24px] text-[#5a5a6a] mx-auto mb-2" />
                  <p className="text-[#5a5a6a] text-[11px]">No active requests posted yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {requests.map((req) => {
                    const sc = statusConfig[req.status as RequestStatus] || statusConfig.open;
                    return (
                      <button
                        key={req.id}
                        className="w-full bg-[#111116] rounded-[18px] border border-[rgba(255,255,255,0.07)] p-4 text-left active:scale-[0.98] transition-transform"
                        onClick={() => handleRequestClick(req)}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <p className="text-white text-[14px] font-bold">{req.sport}</p>
                            <p className="text-[#99A1AF] text-[12px]">{req.skill}</p>
                          </div>
                          <span
                            className="text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                            style={{ background: sc.bg, color: sc.color }}
                          >
                            {sc.label}
                          </span>
                        </div>
                        <p className="text-[#a8a8b8] text-[12px] leading-snug mb-3">"{req.goal}"</p>
                        <div className="flex items-center justify-between pt-2 border-t border-[rgba(255,255,255,0.05)]">
                          <div className="flex items-center gap-3 text-[11px] text-[#99A1AF]">
                            <span className="flex items-center gap-1"><DollarSign className="w-[10px] h-[10px]" />{req.budget}</span>
                            <span className="flex items-center gap-1"><Clock className="w-[10px] h-[10px]" />Recent</span>
                          </div>
                          <div className="flex items-center gap-1 text-[#FFD700] text-[11px] font-bold">
                            Review Offers <ChevronRight className="w-[12px] h-[12px]" />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
