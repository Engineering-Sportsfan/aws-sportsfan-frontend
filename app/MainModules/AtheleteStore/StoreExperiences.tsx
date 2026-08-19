import { useNavigate } from 'react-router';
import {
  ArrowLeft, Clock, Users, Star, Timer, ChevronRight, CheckCircle2,
  Minus, Plus, QrCode, Zap, CreditCard, Shield, Calendar, MapPin, Video, Gift
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { storeService } from '@/services/store.service';
import QRCode from 'react-qr-code';
import { useAuth } from '@/context/AuthContext';

type BookingStep = 'detail' | 'payment' | 'confirmed';

function ExperienceDetail({ exp, onClose }: { exp: any; onClose: () => void }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.userId || user?.email || '';

  const [seats, setSeats] = useState(1);
  const [step, setStep] = useState<BookingStep>('detail');
  const [payMethod, setPayMethod] = useState<'card' | 'upi'>('upi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [realOrderId, setRealOrderId] = useState<string | null>(null);
  
  const rawPrice = exp.price || '';
  const parsedPrice = typeof rawPrice === 'string'
    ? (parseInt(rawPrice.replace(/[₹,]/g, ''), 10) || 0)
    : (typeof rawPrice === 'number' ? rawPrice : 0);
  const total = parsedPrice * seats;
  const bookingId = realOrderId || `SF360-${Math.floor(Math.random() * 9000) + 1000}`;

  const handlePay = async () => {
    setIsSubmitting(true);
    try {
      const pricePaise = exp.priceInPaise ? exp.priceInPaise * seats : total * 100;
      const payload = {
        productId: exp.id,
        userId: userId || 'anonymous',
        paymentMethod: payMethod === 'card' ? ('card' as const) : ('upi' as const),
        pricePaise,
        idempotencyKey: `idemp-exp-${exp.id}-${Date.now()}-${Math.random()}`,
      };
      const res = await storeService.checkout(payload);
      if (res.success && res.orderId) {
        setRealOrderId(res.orderId);
        setStep('confirmed');
      } else {
        alert('Payment failed, please try again.');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Payment failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [passData, setPassData] = useState<any>(null);

  useEffect(() => {
    if (step === 'confirmed' && realOrderId) {
      storeService.getEventPass(realOrderId)
        .then(data => setPassData(data))
        .catch(console.error);
    }
  }, [step, realOrderId]);

  if (step === 'payment') {
    return (
      <div className="flex-1 overflow-y-auto pb-[100px] no-scrollbar px-4 pt-4">
        {/* Summary card */}
        <div className="bg-[#111116] rounded-[18px] border border-[rgba(255,255,255,0.08)] overflow-hidden mb-4">
          <div className="relative h-[100px]">
            <img src={exp.image} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-3 left-3">
              <p className="text-white text-[14px] font-black">{exp.title}</p>
              <p className="text-[#99A1AF] text-[11px]">{exp.duration} · {seats} seat{seats > 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="text-[#99A1AF] text-[12px]">Total amount</span>
            <span className="text-[#c9115f] text-[18px] font-black">₹{total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Payment method */}
        <p className="text-white text-[13px] font-black mb-3 uppercase tracking-wide">Payment Method</p>
        <div className="flex flex-col gap-2 mb-5">
          {([
            { id: 'upi', label: 'UPI / GPay / PhonePe', sub: 'Instant transfer', icon: Zap },
            { id: 'card', label: 'Credit / Debit Card', sub: 'Visa, Mastercard, Rupay', icon: CreditCard },
          ] as { id: 'upi' | 'card'; label: string; sub: string; icon: React.ElementType }[]).map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => setPayMethod(m.id)}
                className="flex items-center gap-3 rounded-[14px] p-4 border transition-all active:scale-[0.98]"
                style={payMethod === m.id
                  ? { background: 'rgba(201,17,95,0.1)', borderColor: 'rgba(201,17,95,0.4)' }
                  : { background: '#111116', borderColor: 'rgba(255,255,255,0.08)' }
                }
              >
                <div
                  className="w-[36px] h-[36px] rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: payMethod === m.id ? 'rgba(201,17,95,0.2)' : 'rgba(255,255,255,0.06)' }}
                >
                  <Icon className="w-[15px] h-[15px]" style={{ color: payMethod === m.id ? '#c9115f' : '#99A1AF' }} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white text-[13px] font-semibold">{m.label}</p>
                  <p className="text-[#99A1AF] text-[11px]">{m.sub}</p>
                </div>
                <div
                  className="w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center"
                  style={{ borderColor: payMethod === m.id ? '#c9115f' : 'rgba(255,255,255,0.2)' }}
                >
                  {payMethod === m.id && <div className="w-[8px] h-[8px] rounded-full bg-[#c9115f]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Security note */}
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-[12px] h-[12px] text-[#00c864]" />
          <p className="text-[#6a6a7a] text-[11px]">256-bit encrypted · Cancel up to 24h before</p>
        </div>

        {/* Pay CTA */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-4 pb-4 pt-3 bg-gradient-to-t from-[#0b0b0f] z-50">
          <button
            onClick={handlePay}
            disabled={isSubmitting}
            className="w-full rounded-full py-4 text-white text-[16px] font-black flex items-center justify-center gap-2"
            style={{ 
              background: 'linear-gradient(135deg,#c9115f,#cd620e)', 
              boxShadow: '0 0 24px rgba(201,17,95,0.5)',
              opacity: isSubmitting ? 0.7 : 1
            }}
          >
            <Zap className={`w-[16px] h-[16px] ${isSubmitting ? 'animate-bounce' : ''}`} /> 
            {isSubmitting ? 'Processing Payment...' : `Pay ₹${total.toLocaleString('en-IN')}`}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'confirmed') {
    return (
      <div className="flex-1 overflow-y-auto pb-8 no-scrollbar">
        {/* Success hero */}
        <div className="flex flex-col items-center pt-10 pb-6 px-6 text-center">
          <div
            className="w-[88px] h-[88px] rounded-full flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg,#c9115f,#cd620e)', boxShadow: '0 0 40px rgba(201,17,95,0.6)' }}
          >
            <CheckCircle2 className="w-[40px] h-[40px] text-white" />
          </div>
          <h2 className="text-white text-[22px] font-black mb-1">Booking Confirmed!</h2>
          <p className="text-[#99A1AF] text-[13px]">Your experience pass has been generated</p>
        </div>

        {/* Digital Pass card */}
        <div className="mx-4 bg-[#111116] rounded-[22px] border border-[rgba(201,17,95,0.3)] overflow-hidden mb-4" style={{ boxShadow: '0 0 30px rgba(201,17,95,0.15)' }}>
          <div className="relative h-[120px]">
            <img src={exp.image} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111116] via-transparent to-transparent" />
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[8px] font-black text-white" style={{ background: 'rgba(201,17,95,0.9)' }}>EXPERIENCE PASS</div>
          </div>
          <div className="px-4 pt-3 pb-4">
            <p className="text-white text-[16px] font-black">{exp.title}</p>
            <p className="text-[#6a6a7a] text-[11px] mt-0.5">{exp.duration} · {seats} guest{seats > 1 ? 's' : ''}</p>
            {/* QR code placeholder */}
            <div className="flex justify-center my-4">
              <div className="w-[110px] h-[110px] rounded-[12px] bg-white flex items-center justify-center p-2">
                <QRCode 
                  value={passData?.joinToken 
                    ? `${window.location.origin}/store/events/join/${passData.joinToken}` 
                    : `${window.location.origin}/store/events/checkin/${realOrderId || bookingId}`
                  } 
                  size={94} 
                />
              </div>
            </div>
            <div className="bg-[rgba(255,255,255,0.04)] rounded-[10px] px-3 py-2 mb-3 text-center">
              <p className="text-[#99A1AF] text-[9px] uppercase tracking-wider">Booking ID</p>
              <p className="text-[#cd620e] text-[14px] font-black font-mono">{bookingId}</p>
            </div>
            <div className="flex flex-col gap-2">
              {[
                { icon: Calendar, label: 'Date', value: 'Check My Experiences' },
                { icon: exp.soldOut ? MapPin : Video, label: 'Type', value: 'Venue details in My Experiences' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <Icon className="w-[12px] h-[12px] text-[#4a4a5a] flex-shrink-0" />
                  <span className="text-[#4a4a5a] text-[10px]">{label}:</span>
                  <span className="text-[#99A1AF] text-[10px]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* What's next */}
        <div className="mx-4 mb-4">
          <p className="text-white text-[12px] font-black uppercase tracking-wide mb-2">What's next</p>
          <div className="flex flex-col gap-2">
            {[
              { color: '#00c864', label: 'Check email for full venue / link details' },
              { color: '#c9115f', label: 'View experience in My Experiences' },
              { color: '#cd620e', label: 'Prepare & arrive 15 min early' },
              { color: '#FFD700', label: 'Earn exclusive fan badge after event' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ background: item.color }} />
                <p className="text-[#99A1AF] text-[12px]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="px-4 flex flex-col gap-2.5 pb-6">
          <button
            onClick={() => navigate('/store/my-experiences')}
            className="w-full rounded-full py-3.5 text-white text-[15px] font-black flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#c9115f,#cd620e)', boxShadow: '0 0 20px rgba(201,17,95,0.4)' }}
          >
            <Gift className="w-[16px] h-[16px]" /> View in My Experiences
          </button>
          <button
            onClick={onClose}
            className="w-full rounded-full py-3.5 text-[#99A1AF] text-[14px] font-semibold border border-[rgba(255,255,255,0.12)]"
          >
            Browse More Experiences
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-[100px] no-scrollbar">
      <div className="relative h-[220px]">
        <img src={exp.image} alt={exp.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0f] to-transparent" />
        <div className="absolute top-4 left-4">
          <span className="text-white text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: exp.tagColor || '#c9115f' }}>
            {exp.tag || 'Exclusive'}
          </span>
        </div>
        {exp.countdown && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-[rgba(0,0,0,0.7)] backdrop-blur-sm rounded-full px-3 py-1.5 border border-[rgba(255,255,255,0.1)]">
            <Timer className="w-[11px] h-[11px] text-[#FFD700]" />
            <span className="text-[#FFD700] text-[11px] font-bold">{exp.countdown}</span>
          </div>
        )}
      </div>

      <div className="px-4 pt-4">
        <h2 className="text-white text-[20px] font-bold leading-tight">{exp.title}</h2>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1">
            <Clock className="w-[13px] h-[13px] text-[#99A1AF]" />
            <span className="text-[#99A1AF] text-[12px]">{exp.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-[13px] h-[13px]" style={{ color: exp.seatsLeft > 0 ? '#00c864' : '#6b7280' }} />
            <span className="text-[12px]" style={{ color: exp.seatsLeft > 0 ? '#00c864' : '#6b7280' }}>
              {exp.seatsLeft > 0 ? `${exp.seatsLeft} seats left` : 'Sold out'}
            </span>
          </div>
        </div>

        <p className="text-[#a8a8b8] text-[13px] leading-relaxed mt-3">{exp.description}</p>

        {exp.inclusions && exp.inclusions.length > 0 && (
          <div className="mt-5">
            <p className="text-white text-[14px] font-bold mb-3">What's included</p>
            <div className="flex flex-col gap-2">
              {exp.inclusions.map((inc: string, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-[14px] h-[14px] text-[#00c864] flex-shrink-0" />
                  <span className="text-[#c8c8d0] text-[13px]">{inc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!exp.soldOut && (
          <div className="mt-5 mb-[120px]">
            <p className="text-white text-[14px] font-bold mb-3">Number of seats</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSeats(s => Math.max(1, s - 1))}
                className="w-[38px] h-[38px] rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center"
              >
                <Minus className="w-[16px] h-[16px] text-white" />
              </button>
              <span className="text-white text-[20px] font-bold w-[32px] text-center">{seats}</span>
              <button
                onClick={() => setSeats(s => Math.min(exp.seatsLeft || 1, s + 1))}
                className="w-[38px] h-[38px] rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center"
              >
                <Plus className="w-[16px] h-[16px] text-white" />
              </button>
              <span className="text-[#99A1AF] text-[13px]">× {exp.price} each</span>
            </div>
          </div>
        )}
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 px-4 py-4 z-10"
        style={{ background: 'linear-gradient(to top, #0b0b0f 85%, transparent)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        {exp.soldOut ? (
          <button className="w-full rounded-full py-3.5 text-white text-[15px] font-semibold border border-[rgba(255,255,255,0.2)]">
            Join Waiting List
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div>
              <p className="text-[#99A1AF] text-[11px]">Total</p>
              <p className="text-[18px] font-bold" style={{ background: 'linear-gradient(135deg,#c9115f,#cd620e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                ₹{total.toLocaleString('en-IN')}
              </p>
            </div>
            <button
              onClick={() => setStep('payment')}
              className="flex-1 rounded-full py-3.5 text-white text-[15px] font-bold transition-all"
              style={{ background: 'linear-gradient(135deg,#c9115f,#cd620e)', boxShadow: '0 0 20px rgba(201,17,95,0.4)' }}
            >
              Book Experience
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StoreExperiences() {
  const navigate = useNavigate();
  const [selectedExp, setSelectedExp] = useState<any | null>(null);
  const [experiencesList, setExperiencesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storeService.getProducts('experiences')
      .then((res) => {
        const mapped = res.map((e: any) => {
          const price = e.price || (e.priceInPaise ? `₹${(e.priceInPaise / 100).toLocaleString('en-IN')}` : '₹0');
          const totalSeats = e.totalSeats || 0;
          const seatsBooked = e.seatsBooked || 0;
          const seatsLeft = Math.max(0, totalSeats - seatsBooked);
          const soldOut = seatsLeft <= 0;
          return {
            ...e,
            price,
            seatsLeft,
            soldOut,
          };
        });
        setExperiencesList(mapped);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching experiences:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-black w-full flex justify-center min-h-screen">
      <div className="w-full max-w-[390px] bg-[#0b0b0f] relative flex flex-col min-h-screen">
        <div className="sticky top-0 z-50 bg-[#0b0b0f] border-b border-[rgba(255,255,255,0.05)] h-[56px] flex items-center px-4 gap-3">
          <button
            onClick={() => selectedExp ? setSelectedExp(null) : navigate('/store')}
            className="w-[36px] h-[36px] rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center"
          >
            <ArrowLeft className="w-[18px] h-[18px] text-white" />
          </button>
          <div>
            <h1 className="text-white font-bold text-[17px]">{selectedExp ? selectedExp.title : 'Experiences'}</h1>
            {!selectedExp && <p className="text-[#99A1AF] text-[11px]">Exclusive access moments</p>}
          </div>
        </div>

        {selectedExp ? (
          <ExperienceDetail exp={selectedExp} onClose={() => setSelectedExp(null)} />
        ) : (
          <div className="flex-1 overflow-y-auto pb-[70px] no-scrollbar">
            {loading ? (
              <p className="text-center text-[#99A1AF] text-[12px] py-10">Loading experiences...</p>
            ) : experiencesList.length === 0 ? (
              <p className="text-center text-[#99A1AF] text-[12px] py-10">No experiences available.</p>
            ) : (
              <div className="flex flex-col gap-4 px-4 pt-4">
                {experiencesList.map((exp) => (
                  <button
                    key={exp.id}
                    className="w-full bg-[#111116] rounded-[18px] border border-[rgba(255,255,255,0.07)] overflow-hidden text-left active:scale-[0.98] transition-transform"
                    onClick={() => setSelectedExp(exp)}
                  >
                    <div className="relative h-[160px]">
                      <img src={exp.image} alt={exp.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111116] via-transparent to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="text-white text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: exp.tagColor || '#c9115f' }}>
                          {exp.tag || 'Exclusive'}
                        </span>
                      </div>
                      {exp.countdown && (
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[rgba(0,0,0,0.7)] rounded-full px-2 py-1">
                          <Timer className="w-[10px] h-[10px] text-[#FFD700]" />
                          <span className="text-[#FFD700] text-[10px] font-bold">{exp.countdown}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-white text-[15px] font-bold leading-snug">{exp.title}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-[11px] h-[11px] text-[#99A1AF]" />
                          <span className="text-[#99A1AF] text-[11px]">{exp.duration}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-[11px] h-[11px]" style={{ color: exp.seatsLeft > 0 ? '#00c864' : '#6b7280' }} />
                          <span className="text-[11px]" style={{ color: exp.seatsLeft > 0 ? '#00c864' : '#6b7280' }}>
                            {exp.seatsLeft > 0 ? `${exp.seatsLeft}/${exp.totalSeats} seats left` : 'Sold out'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c9115f] to-[#cd620e] text-[15px] font-bold">{exp.price}</span>
                        <div className="flex items-center gap-1 text-[#c9115f] text-[12px] font-semibold">
                          {exp.soldOut ? 'Join Waitlist' : 'Book now'} <ChevronRight className="w-[14px] h-[14px]" />
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}