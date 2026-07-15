import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft, Timer, Trophy, Users, Video, Mic, ChevronRight, Star,
  CheckCircle2, QrCode, Gift, Shield, Bell,
  X, CreditCard, Ticket, Award, ArrowUpRight, Info, Zap, Package,
  UtensilsCrossed, Flame, Play,
} from 'lucide-react';
import { storeService } from '@/services/store.service';
import { asianGamesEvents } from './Store';

const ICON_MAP: Record<string, React.ElementType> = {
  Video,
  Users,
  Mic,
  Trophy,
  Play,
  UtensilsCrossed,
  Flame,
  Award,
};

type WorkflowStep = 'book' | 'waitlist' | 'confirmed' | 'participated' | 'memento';

const WORKFLOW: { step: WorkflowStep; label: string; desc: string; icon: React.ElementType; color: string }[] = [
  { step: 'book', label: 'Book & Pay', desc: 'Reserve your seat', icon: CreditCard, color: '#c9115f' },
  { step: 'waitlist', label: 'On Waitlist', desc: 'We notify you when live', icon: Bell, color: '#cd620e' },
  { step: 'confirmed', label: 'Confirmed', desc: 'Participation locked in', icon: CheckCircle2, color: '#0ea5e9' },
  { step: 'participated', label: 'QR Issued', desc: 'Show at venue / event', icon: QrCode, color: '#00c864' },
  { step: 'memento', label: 'Badge + Perks', desc: 'Digital badge + credits', icon: Gift, color: '#FFD700' },
];

function WorkflowStepper({ active }: { active: number }) {
  return (
    <div className="px-4 py-4">
      <div className="relative">
        <div className="absolute top-[20px] left-[20px] right-[20px] h-[2px]" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div
          className="absolute top-[20px] left-[20px] h-[2px] transition-all duration-700"
          style={{ width: `calc(${(active / (WORKFLOW.length - 1)) * 100}% - 0px)`, background: 'linear-gradient(90deg,#c9115f,#FFD700)' }}
        />
        <div className="flex justify-between relative">
          {WORKFLOW.map((w, i) => {
            const Icon = w.icon;
            const done = i <= active;
            return (
              <div key={w.step} className="flex flex-col items-center gap-1" style={{ width: 56 }}>
                <div
                  className="w-[40px] h-[40px] rounded-full flex items-center justify-center border-2 transition-all duration-500"
                  style={done
                    ? { background: w.color, borderColor: w.color, boxShadow: `0 0 12px ${w.color}60` }
                    : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }
                  }
                >
                  <Icon className="w-[16px] h-[16px]" style={{ color: done ? '#fff' : '#4a4a5a' }} />
                </div>
                <p className="text-[7px] font-bold text-center leading-tight" style={{ color: done ? '#fff' : '#4a4a5a' }}>{w.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EventCard({
  event,
  onBook,
  isBooked,
}: {
  event: any;
  onBook: (id: string) => void;
  isBooked: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  
  // Safe Icon mapping
  const Icon = typeof event.icon === 'string' ? (ICON_MAP[event.icon] || Trophy) : (event.icon || Trophy);
  const pct = Math.round(((event.seats - event.seatsLeft) / event.seats) * 100) || 0;
  
  const imageUrl = event.image || event.img || "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=240&fit=crop&auto=format";
  const price = event.price !== undefined ? event.price : (event.pricePaise ? event.pricePaise / 100 : 0);
  const perks = event.perks || [];

  return (
    <div
      className="rounded-[20px] overflow-hidden mx-4 mb-4"
      style={{ background: '#0f0f17', border: `1px solid ${event.color || '#0ea5e9'}25` }}
    >
      {/* Hero image */}
      <div className="relative h-[150px]">
        <img src={imageUrl} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(15,15,23,1) 5%, rgba(0,0,0,0.35) 100%)' }} />
        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[8px] font-black text-white" style={{ background: event.badgeColor || '#ff4444' }}>
          {event.badge || 'SELLING FAST'}
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/65 backdrop-blur-sm rounded-full px-2 py-0.5">
          <Timer className="w-[8px] h-[8px] text-[#FFD700]" />
          <span className="text-[#FFD700] text-[8px] font-bold">{event.dates}</span>
        </div>
        {/* seats bar */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
          <div className="flex-1 h-[4px] rounded-full bg-white/10">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${event.color || '#0ea5e9'}, #FFD700)` }} />
          </div>
          <span className="text-[8px] font-bold text-white">{event.seatsLeft}/{event.seats} left</span>
        </div>
      </div>

      <div className="p-4">
        {/* type pill + format */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: event.bg || 'rgba(14,165,233,0.1)', border: `1px solid ${event.color || '#0ea5e9'}30` }}>
            <Icon className="w-[9px] h-[9px]" style={{ color: event.color || '#0ea5e9' }} />
            <span className="text-[8px] font-bold" style={{ color: event.color || '#0ea5e9' }}>
              {event.type === 'virtual' ? 'Virtual Event' : 'In-Person Event'}
            </span>
          </div>
          <span className="text-[8px] text-[#4a4a5a]">·</span>
          <span className="text-[8px] text-[#5a5a6a]">{event.dates}</span>
        </div>

        <h3 className="text-white text-[17px] font-black leading-tight mb-0.5">{event.title}</h3>
        <p className="text-[#6a6a7a] text-[11px] mb-3">{event.subtitle}</p>

        {/* What to expect toggle */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1 text-[10px] font-bold mb-2"
          style={{ color: event.color || '#0ea5e9' }}
        >
          <Info className="w-[10px] h-[10px]" />
          {expanded ? 'Hide details' : 'What to expect'}
          <ChevronRight className={`w-[10px] h-[10px] transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>

        {expanded && (
          <div className="mb-3">
            <p className="text-[#7a7a8a] text-[11px] leading-relaxed mb-2 pl-3" style={{ borderLeft: `2px solid ${event.color || '#0ea5e9'}40` }}>
              {event.description}
            </p>
            {/* Highlights */}
            {'highlights' in event && event.highlights && (
              <div className="space-y-1.5 mb-2">
                {(event.highlights as string[]).map((h, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Flame className="w-[10px] h-[10px] mt-px flex-shrink-0" style={{ color: event.color || '#0ea5e9' }} />
                    <span className="text-[10px] text-[#a0a0b0]">{h}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Perks */}
        <div className="space-y-1.5 mb-3">
          {perks.map((p: string, i: number) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 className="w-[12px] h-[12px] mt-px flex-shrink-0" style={{ color: '#00c864' }} />
              <span className="text-[10px] text-[#a0a0b0]">{p}</span>
            </div>
          ))}
          {event.memento && (
            <div className="flex items-start gap-2">
              <Gift className="w-[12px] h-[12px] mt-px flex-shrink-0 text-[#FFD700]" />
              <span className="text-[10px] text-[#a0a0b0]">
                Paid memento: {event.memento.label}
                {event.memento.price > 0 && <span className="text-[#FFD700] font-bold"> +₹{event.memento.price.toLocaleString('en-IN')} + shipping & tax</span>}
                {event.memento.price === 0 && <span className="text-[#00c864] font-bold"> (included)</span>}
              </span>
            </div>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center gap-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <p className="text-[#4a4a5a] text-[8px]">per person</p>
            <p className="text-white text-[20px] font-black leading-none">₹{price.toLocaleString('en-IN')}</p>
          </div>
          {isBooked ? (
            <button
              disabled
              className="flex-1 py-3 rounded-[14px] text-[#5a5a6a] text-[13px] font-black flex items-center justify-center gap-2 border border-white/10 bg-white/5 cursor-not-allowed"
            >
              <CheckCircle2 className="w-[14px] h-[14px] text-[#00c864]" />
              Booked
            </button>
          ) : (
            <button
              onClick={() => onBook(event.id)}
              className="flex-1 py-3 rounded-[14px] text-white text-[13px] font-black flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
              style={{ background: `linear-gradient(135deg, ${event.color || '#0ea5e9'}, #cd620e)`, boxShadow: `0 6px 20px ${event.color || '#0ea5e9'}40` }}
            >
              <Ticket className="w-[14px] h-[14px]" />
              Book Now
              <ArrowUpRight className="w-[13px] h-[13px]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingModal({ event, onClose, onSuccess }: { event: any; onClose: () => void; onSuccess?: () => void }) {
  if (!event) return null;

  const navigate = useNavigate();

  // steps: 0=details, 1=payment, 2=waitlist, 3=confirmed, 4=qr+participated, 5=badge+memento
  const [step, setStep] = useState(0);
  const [qty, setQty] = useState(1);
  const [mementoOrdered, setMementoOrdered] = useState(false);
  const [creditChoice, setCreditChoice] = useState<'credit' | 'sub'>('credit');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'wallet'>('upi');

  const handlePayment = async () => {
    setLoading(true);
    try {
      const payload = {
        productId: event.id,
        userId: 'abhishekrt959_gmail_com',
        paymentMethod,
        pricePaise: Math.round(totalAmount * 100),
        idempotencyKey: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      };
      const res = await storeService.checkout(payload);
      if (res && res.success) {
        setStep(2);
        if (onSuccess) onSuccess();
      } else {
        alert('Booking failed');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || err.message || 'Failed to complete booking');
    } finally {
      setLoading(false);
    }
  };

  const Icon = typeof event.icon === 'string' ? (ICON_MAP[event.icon] || Trophy) : (event.icon || Trophy);
  const price = event.price !== undefined ? event.price : (event.pricePaise ? event.pricePaise / 100 : 0);
  const totalAmount = price * qty;
  const isVirtualBreakfast = event.id === 'virtual-breakfast';
  const hasMemento = !!event.memento;
  const perks = event.perks || [];

  // Step 5 — Badge + Perks + optional memento purchase
  if (step === 5) {
    const creditAmt = event.id === 'virtual-ama' || event.id === 'virtual-recovery-masterclass' ? '₹199' : '₹499';
    const subDur = event.id === 'virtual-ama' || event.id === 'virtual-recovery-masterclass' ? '1 month' : '3 months';
    return (
      <div className="fixed inset-0 z-[300] flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.9)' }}>
        <div className="w-full max-w-[390px] max-h-[90vh] overflow-y-auto no-scrollbar rounded-t-[28px]" style={{ background: '#0b0b0f', border: '1px solid rgba(255,215,0,0.3)' }}>
          <div className="p-6">
            {/* Badge award */}
            <div className="flex flex-col items-center text-center mb-5">
              <div className="relative mb-3">
                <div className="w-[90px] h-[90px] rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#c9115f22,#FFD70022)', border: '2px solid #FFD700' }}>
                  <Award className="w-[40px] h-[40px] text-[#FFD700]" />
                </div>
                <div className="absolute -top-1 -right-1 w-[28px] h-[28px] rounded-full flex items-center justify-center" style={{ background: '#00c864' }}>
                  <CheckCircle2 className="w-[14px] h-[14px] text-white" />
                </div>
              </div>
              <div className="px-3 py-1 rounded-full text-[9px] font-black text-black mb-2" style={{ background: '#FFD700' }}>
                🏅 BADGE EARNED
              </div>
              <h3 className="text-white text-[20px] font-black mb-1">{event.title}</h3>
              <p className="text-[#5a5a6a] text-[11px]">Digital badge added to your Fan Zone profile</p>
            </div>

            {/* Activate perks */}
            <div className="rounded-[16px] p-4 mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-white text-[12px] font-black mb-3">Activate Your Reward</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  onClick={() => setCreditChoice('credit')}
                  className="p-3 rounded-[12px] border-2 text-left transition-all"
                  style={creditChoice === 'credit'
                    ? { background: 'rgba(201,17,95,0.15)', borderColor: '#c9115f' }
                    : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)' }
                  }
                >
                  <Zap className="w-[14px] h-[14px] text-[#c9115f] mb-1" />
                  <p className="text-white text-[11px] font-black">{creditAmt} Credit</p>
                  <p className="text-[#6a6a7a] text-[9px]">Use in-app on any purchase</p>
                </button>
                <button
                  onClick={() => setCreditChoice('sub')}
                  className="p-3 rounded-[12px] border-2 text-left transition-all"
                  style={creditChoice === 'sub'
                    ? { background: 'rgba(0,200,100,0.15)', borderColor: '#00c864' }
                    : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)' }
                  }
                >
                  <Star className="w-[14px] h-[14px] text-[#00c864] mb-1 fill-[#00c864]" />
                  <p className="text-white text-[11px] font-black">{subDur} Free</p>
                  <p className="text-[#6a6a7a] text-[9px]">SportsFan360 subscription</p>
                </button>
              </div>
              <button
                className="w-full py-3 rounded-[12px] text-white text-[12px] font-black"
                style={{ background: creditChoice === 'credit' ? 'linear-gradient(135deg,#c9115f,#cd620e)' : 'linear-gradient(135deg,#00c864,#0ea5e9)' }}
              >
                ✓ Activate {creditChoice === 'credit' ? `${creditAmt} Credit` : `${subDur} Subscription`}
              </button>
            </div>

            {/* Memento purchase */}
            {hasMemento && event.memento && event.memento.price > 0 && !mementoOrdered && (
              <div className="rounded-[16px] p-4 mb-4" style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.2)' }}>
                <div className="flex items-start gap-3">
                  <div className="w-[40px] h-[40px] rounded-[12px] flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,215,0,0.15)' }}>
                    <Package className="w-[18px] h-[18px] text-[#FFD700]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[#FFD700] text-[11px] font-black mb-0.5">Optional Paid Memento</p>
                    <p className="text-[#9a8a30] text-[10px] leading-snug mb-2">{event.memento.label}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-white text-[14px] font-black">₹{event.memento.price.toLocaleString('en-IN')} <span className="text-[#6a6a6a] text-[9px] font-normal">+ shipping & tax</span></span>
                      <button
                        onClick={() => setMementoOrdered(true)}
                        className="px-3 py-1.5 rounded-[10px] text-black text-[10px] font-black"
                        style={{ background: '#FFD700' }}
                      >
                        Order Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Memento included (price 0) */}
            {hasMemento && event.memento && event.memento.price === 0 && (
              <div className="rounded-[16px] p-4 mb-4 flex items-center gap-3" style={{ background: 'rgba(0,200,100,0.06)', border: '1px solid rgba(0,200,100,0.2)' }}>
                <Package className="w-[18px] h-[18px] text-[#00c864] flex-shrink-0" />
                <div>
                  <p className="text-[#00c864] text-[11px] font-black">Memento Included</p>
                  <p className="text-[#5a6a5a] text-[10px]">{event.memento.label}</p>
                </div>
                <CheckCircle2 className="w-[16px] h-[16px] text-[#00c864] ml-auto flex-shrink-0" />
              </div>
            )}

            {mementoOrdered && event.memento && event.memento.price > 0 && (
              <div className="rounded-[16px] p-4 mb-4 flex items-center gap-3" style={{ background: 'rgba(0,200,100,0.06)', border: '1px solid rgba(0,200,100,0.2)' }}>
                <CheckCircle2 className="w-[18px] h-[18px] text-[#00c864] flex-shrink-0" />
                <div>
                  <p className="text-[#00c864] text-[11px] font-black">Memento Ordered!</p>
                  <p className="text-[#5a5a6a] text-[10px]">Ships within 14 days of event completion</p>
                </div>
              </div>
            )}

            <button onClick={onClose} className="w-full py-3 rounded-[14px] text-white text-[13px] font-black" style={{ background: 'linear-gradient(135deg,#c9115f,#cd620e)' }}>
              Done — Go to Fan Zone
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 4 — QR code (participated)
  if (step === 4) {
    return (
      <div className="fixed inset-0 z-[300] flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.85)' }}>
        <div className="w-full max-w-[390px] rounded-t-[28px] overflow-hidden" style={{ background: '#0b0b0f', border: '1px solid rgba(0,200,100,0.3)' }}>
          <div className="p-6 flex flex-col items-center text-center">
            <div className="w-[80px] h-[80px] rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(0,200,100,0.15)', border: '2px solid #00c864' }}>
              <QrCode className="w-[36px] h-[36px] text-[#00c864]" />
            </div>
            <span className="text-[9px] font-black px-3 py-1 rounded-full text-black mb-3" style={{ background: '#00c864' }}>PARTICIPATION CONFIRMED</span>
            <h3 className="text-white text-[20px] font-black mb-1">{event.title}</h3>
            <p className="text-[#5a5a6a] text-[11px] mb-4">{event.dates}</p>
            {/* Fake QR */}
            <div className="w-[140px] h-[140px] rounded-[16px] mb-4 flex items-center justify-center" style={{ background: '#fff' }}>
              <div className="grid grid-cols-7 gap-[3px] p-2">
                {Array.from({ length: 49 }).map((_, i) => (
                  <div key={i} className="w-[14px] h-[14px] rounded-[2px]" style={{ background: (i + Math.floor(i / 7)) % 3 === 0 ? '#0b0b0f' : 'transparent' }} />
                ))}
              </div>
            </div>
            <p className="text-[#5a5a6a] text-[10px] mb-1">{event.type === 'virtual' ? 'Join link will be sent to your email' : 'Show this code at the venue entrance'}</p>
            <p className="text-[#3a3a4a] text-[9px] mb-6">After the event, your badge & credits will be activated in-app</p>
            <div className="w-full rounded-[16px] p-3 mb-4 flex items-center gap-3" style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)' }}>
              <Gift className="w-[16px] h-[16px] text-[#FFD700] flex-shrink-0" />
              <p className="text-[10px] text-[#b0b020] leading-snug text-left">
                {perks.join(' • ')}
              </p>
            </div>
            <button onClick={() => setStep(5)} className="w-full py-3 rounded-[14px] text-white text-[13px] font-black mb-2" style={{ background: 'linear-gradient(135deg,#00c864,#0ea5e9)' }}>
              Simulate: Event Completed → Claim Badge
            </button>
            <button onClick={onClose} className="text-[#4a4a5a] text-[11px]">Close for now</button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3 — date confirmed
  if (step === 3) {
    return (
      <div className="fixed inset-0 z-[300] flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.85)' }}>
        <div className="w-full max-w-[390px] rounded-t-[28px] overflow-hidden" style={{ background: '#0b0b0f', border: '1px solid rgba(14,165,233,0.3)' }}>
          <div className="p-6 flex flex-col items-center text-center">
            <div className="w-[64px] h-[64px] rounded-full flex items-center justify-center mb-3" style={{ background: 'rgba(14,165,233,0.15)' }}>
              <CheckCircle2 className="w-[28px] h-[28px] text-[#0ea5e9]" />
            </div>
            <span className="text-[9px] font-black px-3 py-1 rounded-full text-white mb-3" style={{ background: '#0ea5e9' }}>DATE CONFIRMED</span>
            <h3 className="text-white text-[18px] font-black mb-1">{event.title}</h3>
            <p className="text-[#5a5a6a] text-[11px] mb-5">{event.dates} · {qty} seat{qty > 1 ? 's' : ''}</p>
            <p className="text-[#7a7a8a] text-[12px] mb-6 leading-relaxed">
              Your participation is confirmed! We will send your {event.type === 'virtual' ? 'join link' : 'QR entry code'} closer to the date.
            </p>
            <button onClick={() => navigate('/store/my-bookings')} className="w-full py-3 rounded-[14px] text-white text-[13px] font-black" style={{ background: 'linear-gradient(135deg,#0ea5e9,#c9115f)' }}>
              Get My {event.type === 'virtual' ? 'Join Code' : 'QR Code'} →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2 — waitlist
  if (step === 2) {
    return (
      <div className="fixed inset-0 z-[300] flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.85)' }}>
        <div className="w-full max-w-[390px] rounded-t-[28px] overflow-hidden" style={{ background: '#0b0b0f', border: '1px solid rgba(205,98,14,0.3)' }}>
          <div className="p-6 flex flex-col items-center text-center">
            <div className="w-[64px] h-[64px] rounded-full flex items-center justify-center mb-3" style={{ background: 'rgba(205,98,14,0.15)' }}>
              <Bell className="w-[28px] h-[28px] text-[#cd620e]" />
            </div>
            <span className="text-[9px] font-black px-3 py-1 rounded-full text-white mb-3" style={{ background: '#cd620e' }}>ON WAITLIST</span>
            <h3 className="text-white text-[18px] font-black mb-1">You are on the list!</h3>
            <p className="text-[#5a5a6a] text-[11px] mb-5">Payment held · Seat secured once athlete wins medal at Nagoya</p>
            <div className="w-full space-y-2 mb-5">
              {[
                'Athlete wins medal in Nagoya Asian Games',
                'You receive push notification + email',
                'Final date & venue / join link released',
                'QR code or join link issued',
                'Post-event: badge + credits activated',
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-[12px]" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="w-[22px] h-[22px] rounded-full border flex items-center justify-center flex-shrink-0 text-[10px] font-black" style={{ borderColor: 'rgba(205,98,14,0.4)', color: '#cd620e' }}>{i + 1}</div>
                  <span className="text-[#7a7a8a] text-[11px] text-left">{s}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(3)} className="w-full py-3 rounded-[14px] text-white text-[13px] font-black mb-2" style={{ background: 'linear-gradient(135deg,#cd620e,#c9115f)' }}>
              Fast-forward: Date Confirmed →
            </button>
            <button onClick={onClose} className="text-[#4a4a5a] text-[11px]">Close</button>
          </div>
        </div>
      </div>
    );
  }

  // Step 1 — payment
  if (step === 1) {
    return (
      <div className="fixed inset-0 z-[300] flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.85)' }}>
        <div className="w-full max-w-[390px] max-h-[85vh] rounded-t-[28px] overflow-y-auto no-scrollbar" style={{ background: '#0b0b0f', border: '1px solid rgba(201,17,95,0.3)' }}>
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-[17px] font-black">Confirm Booking</h3>
              <button onClick={onClose} className="text-[#4a4a5a]"><X className="w-[18px] h-[18px]" /></button>
            </div>
            {/* Summary */}
            <div className="rounded-[16px] p-3.5 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-[#5a5a6a] text-[9px] font-bold uppercase tracking-wider mb-1">Booking Summary</p>
              <p className="text-white text-[14px] font-black mb-0.5">{event.title}</p>
              <p className="text-[#6a6a7a] text-[10px] mb-2">{event.dates} · {event.type === 'virtual' ? 'Online' : 'In-Person'}</p>
              <div className="flex items-center justify-between">
                <span className="text-[#5a5a6a] text-[11px]">₹{price.toLocaleString('en-IN')} × {qty}</span>
                <span className="text-white text-[14px] font-black">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
            {/* Payment methods */}
            <p className="text-[#4a4a5a] text-[9px] font-bold uppercase tracking-wider mb-2">Pay With</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { name: 'UPI', value: 'upi' },
                { name: 'Card', value: 'card' },
                { name: 'Wallet', value: 'wallet' }
              ].map((m) => (
                <button
                  key={m.value}
                  onClick={() => setPaymentMethod(m.value as any)}
                  className={`py-2.5 rounded-[12px] text-[10px] font-bold transition-all ${
                    paymentMethod === m.value 
                      ? 'text-white border-2 border-[#c9115f]' 
                      : 'text-[#9a9aab] bg-white/5 border border-white/10'
                  }`}
                  disabled={loading}
                >
                  {m.name}
                </button>
              ))}
            </div>
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full py-3.5 rounded-[16px] text-white text-[14px] font-black flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-55"
              style={{ background: `linear-gradient(135deg, ${event.color || '#0ea5e9'}, #cd620e)`, boxShadow: `0 6px 20px ${event.color || '#0ea5e9'}45` }}
            >
              <Shield className="w-[14px] h-[14px]" />
              {loading ? 'Processing Payment...' : `Pay ₹${totalAmount.toLocaleString('en-IN')} Securely`}
            </button>
            <p className="text-[#3a3a4a] text-[9px] text-center mt-2">Payment held in escrow until event date is confirmed</p>
          </div>
        </div>
      </div>
    );
  }

  // Step 0 — booking details
  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="w-full max-w-[390px] max-h-[88vh] rounded-t-[28px] overflow-y-auto no-scrollbar" style={{ background: '#0b0b0f', border: `1px solid ${event.color || '#0ea5e9'}30` }}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-[17px] font-black">Book Experience</h3>
            <button onClick={onClose} className="text-[#4a4a5a]"><X className="w-[18px] h-[18px]" /></button>
          </div>

          {/* Event header */}
          <div className="flex items-center gap-3 p-3.5 rounded-[16px] mb-4" style={{ background: event.bg || 'rgba(14,165,233,0.1)', border: `1px solid ${event.color || '#0ea5e9'}30` }}>
            <div className="w-[44px] h-[44px] rounded-[14px] flex items-center justify-center flex-shrink-0" style={{ background: `${event.color || '#0ea5e9'}20` }}>
              <Icon className="w-[20px] h-[20px]" style={{ color: event.color || '#0ea5e9' }} />
            </div>
            <div>
              <p className="text-white text-[13px] font-black">{event.title}</p>
              <p className="text-[#5a5a6a] text-[10px]">{event.subtitle}</p>
              <p className="text-[#5a5a6a] text-[9px]">{event.dates}</p>
            </div>
          </div>

          {/* VIRTUAL BREAKFAST: cooking on camera callout */}
          {isVirtualBreakfast && (
            <div className="rounded-[14px] p-3.5 mb-4" style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)' }}>
              <div className="flex items-center gap-2 mb-2">
                <UtensilsCrossed className="w-[13px] h-[13px] text-[#0ea5e9]" />
                <p className="text-[#0ea5e9] text-[10px] font-black uppercase tracking-wider">Live Cook-Along Format</p>
              </div>
              <div className="space-y-1.5">
                {[
                  { icon: UtensilsCrossed, text: 'Athlete cooks their actual morning meal live on camera', color: '#0ea5e9' },
                  { icon: Play, text: 'Live run session streamed — 30 to 40 minutes', color: '#cd620e' },
                  { icon: Mic, text: '20 fan questions answered live', color: '#c9115f' },
                ].map((s, i) => {
                  const SIcon = s.icon;
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <SIcon className="w-[10px] h-[10px] flex-shrink-0" style={{ color: s.color }} />
                      <span className="text-[#7a9aaa] text-[10px]">{s.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center justify-between mb-4 p-3.5 rounded-[16px]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <span className="text-white text-[12px] font-semibold">Seats</span>
            <div className="flex items-center gap-3">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-white font-black text-[16px]" style={{ background: 'rgba(255,255,255,0.08)' }}>−</button>
              <span className="text-white text-[15px] font-black w-[16px] text-center">{qty}</span>
              <button onClick={() => setQty(q => Math.min(event.seatsLeft || 1, q + 1))} className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-white font-black text-[16px]" style={{ background: 'rgba(255,255,255,0.08)' }}>+</button>
            </div>
          </div>

          {/* How it works */}
          <p className="text-[#4a4a5a] text-[9px] font-bold uppercase tracking-wider mb-2">How it works</p>
          <div className="space-y-2 mb-5">
            {[
              { icon: CreditCard, text: 'Book & Pay — seat held immediately in escrow', color: '#c9115f' },
              { icon: Bell, text: "Confirmed once athlete wins medal at Nagoya", color: '#cd620e' },
              { icon: QrCode, text: `${event.type === 'virtual' ? 'Join link' : 'QR code'} issued before event date`, color: '#0ea5e9' },
              { icon: Award, text: 'Post-event: digital badge + credits activated in-app', color: '#FFD700' },
            ].map((s, i) => {
              const SIcon = s.icon;
              return (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-[28px] h-[28px] rounded-[9px] flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}18` }}>
                    <SIcon className="w-[12px] h-[12px]" style={{ color: s.color }} />
                  </div>
                  <span className="text-[#8a8a9a] text-[11px]">{s.text}</span>
                </div>
              );
            })}
          </div>

          {/* Perks */}
          <div className="rounded-[14px] p-3 mb-4" style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.15)' }}>
            <p className="text-[#FFD700] text-[9px] font-black uppercase tracking-wider mb-1.5">Post-Event Perks</p>
            {perks.map((p: string, i: number) => (
              <div key={i} className="flex items-center gap-1.5 mb-1">
                <Star className="w-[9px] h-[9px] text-[#FFD700] fill-[#FFD700]" />
                <span className="text-[#b0b040] text-[10px]">{p}</span>
              </div>
            ))}
            {event.memento && (
              <div className="flex items-center gap-1.5 mt-1">
                <Package className="w-[9px] h-[9px] text-[#FFD700]" />
                <span className="text-[#b0b040] text-[10px]">
                  Memento: {event.memento.label}
                  {event.memento.price > 0 && ` (+₹${event.memento.price.toLocaleString('en-IN')} + shipping)`}
                  {event.memento.price === 0 && ' (included)'}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setStep(1)}
            className="w-full py-3.5 rounded-[16px] text-white text-[14px] font-black flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            style={{ background: `linear-gradient(135deg, ${event.color || '#0ea5e9'}, #cd620e)`, boxShadow: `0 6px 20px ${event.color || '#0ea5e9'}45` }}
          >
            <Ticket className="w-[14px] h-[14px]" />
            Reserve {qty} Seat{qty > 1 ? 's' : ''} · ₹{totalAmount.toLocaleString('en-IN')}
          </button>
          <p className="text-[#3a3a4a] text-[9px] text-center mt-2">Full refund if event does not proceed</p>
        </div>
      </div>
    </div>
  );
}

export default function StoreTicketedEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookedEventIds, setBookedEventIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      storeService.getProducts('events'),
      storeService.getUserOrders('abhishekrt959_gmail_com').catch(() => [])
    ])
      .then(([res, orders]) => {
        // Fallback to local mock data if Firestore has 0 event products
        if (res && res.length > 0) {
          setEvents(res);
        } else {
          setEvents(asianGamesEvents);
        }
        
        const booked = new Set<string>();
        if (orders && Array.isArray(orders)) {
          orders.forEach((o: any) => {
            if (o.productId && o.status !== 'cancelled') {
              booked.add(o.productId);
            }
          });
        }
        setBookedEventIds(booked);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading ticketed events:', err);
        setEvents(asianGamesEvents);
        setLoading(false);
      });
  }, []);

  const selectedEvent = events.find(e => e.id === bookingId);

  return (
    <div className="bg-black w-full flex justify-center min-h-screen">
      <div className="w-full max-w-[390px] bg-[#0b0b0f] relative flex flex-col min-h-screen">

        {/* Header */}
        <div className="sticky top-0 z-50 bg-[#0b0b0f]/95 backdrop-blur-md border-b border-[rgba(255,255,255,0.05)] h-[56px] flex items-center px-4 gap-3">
          <button onClick={() => navigate('/store')} className="w-[34px] h-[34px] rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <ArrowLeft className="w-[16px] h-[16px] text-white" />
          </button>
          <div className="flex-1">
            <p className="text-white text-[15px] font-black leading-none">Asian Games · Nagoya</p>
            <p className="text-[#4a4a5a] text-[10px]">Post-Medal Fan Experiences</p>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.25)' }}>
            <Trophy className="w-[9px] h-[9px] text-[#FFD700]" />
            <span className="text-[#FFD700] text-[8px] font-black">LIVE BOOKINGS</span>
          </div>
        </div>

        {/* Scrollable */}
        <div className="flex-1 overflow-y-auto pb-10 no-scrollbar">

          {/* Hero banner */}
          <div className="relative h-[160px] overflow-hidden mb-1">
            <img
              src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=320&fit=crop&auto=format"
              alt="Asian Games Nagoya"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.7) 100%)' }} />
            <div className="absolute inset-0 flex flex-col justify-center px-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[8px] font-black px-2 py-0.5 rounded-full text-black" style={{ background: '#FFD700' }}>🥇 POST-MEDAL EVENTS</span>
              </div>
              <h1 className="text-white text-[22px] font-black leading-tight">Fan Experiences<br />After the Win</h1>
              <p className="text-[#a0a0b0] text-[11px] mt-1">Book now · Seats confirmed after athletes win medals in Nagoya</p>
            </div>
          </div>

          {/* Workflow stepper */}
          <div className="mx-4 mb-4 mt-3 rounded-[16px] p-1" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[#4a4a5a] text-[8px] font-black uppercase tracking-wider px-3 pt-2">Your Journey</p>
            <WorkflowStepper active={0} />
          </div>

          {/* Events */}
          {loading ? (
            <p className="text-center text-[#99A1AF] text-[12px] py-10">Loading events...</p>
          ) : events.length === 0 ? (
            <p className="text-center text-[#99A1AF] text-[12px] py-10">No events found.</p>
          ) : (
            events.map((ev) => (
              <EventCard key={ev.id} event={ev} onBook={setBookingId} isBooked={bookedEventIds.has(ev.id)} />
            ))
          )}

          {/* Info footer */}
          <div className="mx-4 mb-2 p-3.5 rounded-[16px]" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-start gap-2">
              <Shield className="w-[13px] h-[13px] text-[#00c864] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[#00c864] text-[10px] font-bold mb-0.5">AFI Verified & Escrow Protected</p>
                <p className="text-[#4a4a5a] text-[10px] leading-relaxed">Payment is held in escrow. Full refund issued automatically if the event does not proceed or athlete does not participate.</p>
              </div>
            </div>
          </div>
        </div>

        {bookingId && selectedEvent && (
          <BookingModal 
            event={selectedEvent} 
            onClose={() => setBookingId(null)} 
            onSuccess={() => {
              setBookedEventIds(prev => {
                const next = new Set(prev);
                next.add(selectedEvent.id);
                return next;
              });
            }}
          />
        )}
      </div>
    </div>
  );
}
