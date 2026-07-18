import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Check, User, Tag, MapPin, Pencil, X, Clock, AlertCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { storeService, Slot } from '@/services/store.service';
import { formatPrice } from '@/utils/formatters';

const services = [
  { id: 1, title: 'Technique Analysis', duration: '60 min', pricePaise: 180000, desc: 'Video-based biomechanical breakdown with actionable fixes.' },
  { id: 2, title: 'Competition Preparation', duration: '90 min', pricePaise: 250000, desc: 'Peak performance strategy session with mental prep and race-day plan.' },
  { id: 3, title: 'Monthly Mentorship', duration: '4 sessions', pricePaise: 650000, desc: 'Structured monthly coaching with progress tracking and personalized plan.' },
];

const coachNames: Record<string, string> = {
  '1': 'Anubhav Karmakar',
  '2': 'Vikas Srinivasan',
  '3': 'Kiran Badiger',
  '4': 'Pramod Deshpande',
};

const stepLabels = ['Service & Slot', 'Review'];

export default function StoreBooking() {
  const navigate = useNavigate();
  const { id } = useParams();
  const coachIdStr = id || '1';
  const coachName = coachNames[coachIdStr] || 'Anubhav Karmakar';

  const queryParams = new URLSearchParams(window.location.search);
  const serviceIndexParam = queryParams.get('serviceIndex');
  const initialService = serviceIndexParam !== null ? Number(serviceIndexParam) + 1 : null;

  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState<number | null>(initialService);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [coach, setCoach] = useState<any>(null);

  // Timer state
  const [lockExpiresAt, setLockExpiresAt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [location, setLocation] = useState('Bengaluru, Karnataka');
  const [editingLocation, setEditingLocation] = useState(false);
  const [locationDraft, setLocationDraft] = useState('');

  const passedDate = queryParams.get('date');
  const passedTime = queryParams.get('time');
  const passedDay = queryParams.get('day');
  const passedNum = queryParams.get('num');

  const coachServices = coach?.services 
    ? coach.services.map((s: any, idx: number) => ({
        id: idx + 1,
        title: s.title,
        duration: s.duration,
        pricePaise: s.pricePaise || 0,
        desc: s.desc
      }))
    : services;

  const selectedServiceData = coachServices.find((s) => s.id === selectedService);
  const selectedSlotData = slots.find((s) => s.id === selectedSlotId);

  const displaySlotTime = passedDate && passedTime 
    ? (passedDate === 'Today' ? `Today · ${passedTime}` : `${passedDay || ''} ${passedNum || ''} Jul · ${passedTime}`)
    : (selectedSlotData?.time || '');

  // Fetch slots and coach details on load
  useEffect(() => {
    storeService.getSlots(`coach-${coachIdStr}`)
      .then((data) => {
        // filter out booked slots
        setSlots(data.filter(s => s.status !== 'booked'));
      })
      .catch((err) => console.error('Error fetching slots:', err));

    storeService.getProductById(`coach-${coachIdStr}`)
      .then((data) => {
        setCoach(data);
      })
      .catch((err) => console.error('Error fetching coach details:', err));
  }, [coachIdStr]);

  // Auto-select and lock the passed slot
  useEffect(() => {
    if (slots.length > 0 && passedDate && passedTime && !selectedSlotId) {
      const match = slots.find(s => {
        const timeNormalized = s.time.toLowerCase().replace(/[:\s]/g, '');
        const targetNormalized = `${passedDate}${passedTime}`.toLowerCase().replace(/[:\s]/g, '');
        return timeNormalized === targetNormalized || s.time.toLowerCase().includes(passedTime.toLowerCase());
      });
      if (match) {
        handleSelectSlot(match.id);
      } else {
        // Fallback: create mock ID
        const fallbackId = `slot-${passedDate}-${passedTime.replace(/[:\s]/g, '-')}`;
        setSelectedSlotId(fallbackId);
      }
    }
  }, [slots, passedDate, passedTime]);

  // Lock expiry timer count down
  useEffect(() => {
    if (lockExpiresAt) {
      const updateTimer = () => {
        const remaining = Math.max(0, Math.round((lockExpiresAt - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (selectedSlotId) {
            storeService.unlockSlot(`coach-${coachIdStr}`, selectedSlotId, 'abhishekrt959_gmail_com').catch(console.error);
          }
          setSelectedSlotId(null);
          setLockExpiresAt(null);
          alert('Your booking lock has expired. Redirecting you back to select the slot again.');
          navigate(`/store/coach/${coachIdStr}`);
        }
      };

      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [lockExpiresAt, selectedSlotId, coachIdStr]);

  const handleSelectSlot = async (slotId: string) => {
    try {
      const res = await storeService.lockSlot(`coach-${coachIdStr}`, slotId, 'abhishekrt959_gmail_com');
      setSelectedSlotId(slotId);
      setLockExpiresAt(new Date(res.lockExpiresAt).getTime());
    } catch (err: any) {
      alert(err.message || 'Failed to lock slot');
    }
  };

  const formatTimeLeft = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const canProceed =
    (step === 0 && selectedService !== null && (selectedSlotId !== null || (passedDate && passedTime))) ||
    step === 1;

  const handleNext = () => {
    if (step < 1) {
      setStep((s) => s + 1);
    } else {
      // Navigate to checkout payment screen
      navigate(`/store/payment/coach-${coachIdStr}?slotId=${selectedSlotId || `slot-${passedDate}-${passedTime?.replace(/[:\s]/g, '-')}`}&price=${getTotalPrice()}`);
    }
  };

  const startEditLocation = () => {
    setLocationDraft(location);
    setEditingLocation(true);
  };

  const saveLocation = () => {
    if (locationDraft.trim()) setLocation(locationDraft.trim());
    setEditingLocation(false);
  };

  const getServicePrice = () => {
    return selectedServiceData ? selectedServiceData.pricePaise : 0;
  };

  const getPlatformFee = () => {
    return 9900; // ₹99 in paise
  };

  const getCouponDiscount = () => {
    if (!couponApplied) return 0;
    // 20% discount on service fee
    return Math.round(getServicePrice() * 0.20);
  };

  const getTotalPrice = () => {
    return getServicePrice() + getPlatformFee() - getCouponDiscount();
  };

  return (
    <div className="bg-black w-full flex justify-center min-h-screen">
      <div className="w-full max-w-[390px] bg-[#0b0b0f] relative flex flex-col min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-[#0b0b0f] border-b border-[rgba(255,255,255,0.05)]">
          <div className="h-[56px] flex items-center px-4 gap-3">
            <button
              onClick={() => (step > 0 ? setStep((s) => s - 1) : navigate(-1))}
              className="w-[36px] h-[36px] rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center"
            >
              <ArrowLeft className="w-[18px] h-[18px] text-white" />
            </button>
            <div className="flex-1">
              <h1 className="text-white font-bold text-[17px]">Book a Session</h1>
              <p className="text-[#99A1AF] text-[11px]">{coachName}</p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center px-4 pb-3 gap-0">
            {stepLabels.map((label, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-[24px] h-[24px] rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                      i < step
                        ? 'bg-gradient-to-br from-[#c9115f] to-[#cd620e] text-white'
                        : i === step
                        ? 'bg-gradient-to-br from-[#c9115f] to-[#cd620e] text-white shadow-[0_0_10px_rgba(201,17,95,0.5)]'
                        : 'bg-[rgba(255,255,255,0.08)] text-[#99A1AF]'
                    }`}
                  >
                    {i < step ? <Check className="w-[12px] h-[12px]" /> : i + 1}
                  </div>
                  <span className={`text-[9px] font-semibold ${i <= step ? 'text-white' : 'text-[#99A1AF]'}`}>{label}</span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div className={`flex-1 h-[2px] mx-1 mb-4 rounded-full transition-all ${i < step ? 'bg-gradient-to-r from-[#c9115f] to-[#cd620e]' : 'bg-[rgba(255,255,255,0.08)]'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-[88px] no-scrollbar">
          {/* Lock Countdown Banner */}
          {lockExpiresAt && timeLeft > 0 && (
            <div className="mx-4 mt-4 bg-[rgba(201,17,95,0.15)] border border-[rgba(201,17,95,0.3)] rounded-[12px] p-3 flex items-center gap-2 animate-pulse">
              <Clock className="w-[16px] h-[16px] text-[#c9115f]" />
              <span className="text-white text-[12px] font-semibold flex-1">
                Your slot is held for: <span className="text-[#c9115f] font-black">{formatTimeLeft(timeLeft)}</span>
              </span>
            </div>
          )}

          {/* Step 0: Select Service & Slot */}
          {step === 0 && (
            <div className="px-4 pt-4">
              <p className="text-[#99A1AF] text-[13px] mb-3">1. Choose a Coaching Service</p>
              <div className="flex flex-col gap-3 mb-5">
                {coachServices.map((svc) => (
                  <button
                    key={svc.id}
                    onClick={() => setSelectedService(svc.id)}
                    className={`w-full rounded-[16px] border p-4 text-left transition-all ${
                      selectedService === svc.id
                        ? 'bg-[rgba(201,17,95,0.1)] border-[rgba(201,17,95,0.5)] shadow-[0_0_12px_rgba(201,17,95,0.2)]'
                        : 'bg-[#111116] border-[rgba(255,255,255,0.07)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-white text-[14px] font-semibold">{svc.title}</p>
                        <p className="text-[#99A1AF] text-[11px] mt-0.5">{svc.duration}</p>
                        <p className="text-[#99A1AF] text-[12px] mt-2 leading-snug">{svc.desc}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className="text-transparent bg-clip-text bg-gradient-to-r from-[#c9115f] to-[#cd620e] text-[15px] font-bold">
                          {formatPrice(svc.pricePaise)}
                        </p>
                        {selectedService === svc.id && (
                          <div className="w-[20px] h-[20px] rounded-full bg-gradient-to-br from-[#c9115f] to-[#cd620e] flex items-center justify-center">
                            <Check className="w-[11px] h-[11px] text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>


            </div>
          )}

          {/* Step 1: Review */}
          {step === 1 && selectedServiceData && (selectedSlotData || (passedDate && passedTime)) && (
            <div className="px-4 pt-5">
              <p className="text-[#99A1AF] text-[13px] mb-4">Review your booking details before payment</p>

              {/* Summary card */}
              <div className="bg-[#111116] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-4 mb-4">
                <div className="flex flex-col gap-3">
                  {[
                    { icon: User, label: 'Coach', value: coachName },
                    { icon: Tag, label: 'Service', value: selectedServiceData.title },
                    { icon: Clock, label: 'Scheduled Time', value: displaySlotTime },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-[28px] h-[28px] rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                          <Icon className="w-[13px] h-[13px] text-[#99A1AF]" />
                        </div>
                        <span className="text-[#99A1AF] text-[13px]">{label}</span>
                      </div>
                      <span className="text-white text-[13px] font-semibold">{value}</span>
                    </div>
                  ))}

                  {/* Location row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-[28px] h-[28px] rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                        <MapPin className="w-[13px] h-[13px] text-[#99A1AF]" />
                      </div>
                      <span className="text-[#99A1AF] text-[13px]">Location</span>
                    </div>
                    {editingLocation ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          autoFocus
                          value={locationDraft}
                          onChange={(e) => setLocationDraft(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveLocation()}
                          className="bg-[rgba(255,255,255,0.07)] border border-[rgba(201,17,95,0.4)] rounded-[8px] px-2 py-1 text-white text-[12px] w-[140px] focus:outline-none"
                        />
                        <button onClick={saveLocation} className="w-[24px] h-[24px] rounded-full bg-gradient-to-br from-[#c9115f] to-[#cd620e] flex items-center justify-center">
                          <Check className="w-[11px] h-[11px] text-white" />
                        </button>
                        <button onClick={() => setEditingLocation(false)} className="w-[24px] h-[24px] rounded-full bg-[rgba(255,255,255,0.08)] flex items-center justify-center">
                          <X className="w-[11px] h-[11px] text-[#99A1AF]" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-white text-[13px] font-semibold">{location}</span>
                        <button
                          onClick={startEditLocation}
                          className="w-[24px] h-[24px] rounded-full bg-[rgba(255,255,255,0.07)] flex items-center justify-center hover:bg-[rgba(201,17,95,0.2)] transition-colors"
                        >
                          <Pencil className="w-[11px] h-[11px] text-[#99A1AF]" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="bg-[#111116] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-4 mb-4">
                <h3 className="text-white text-[14px] font-bold mb-3">Price Breakdown</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="text-[#99A1AF] text-[13px]">Session Fee</span>
                    <span className="text-white text-[13px]">{formatPrice(getServicePrice())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#99A1AF] text-[13px]">Platform Fee</span>
                    <span className="text-white text-[13px]">{formatPrice(getPlatformFee())}</span>
                  </div>
                  {couponApplied && (
                    <div className="flex justify-between">
                      <span className="text-[#00c864] text-[13px]">Coupon (SPORT20)</span>
                      <span className="text-[#00c864] text-[13px]">-{formatPrice(getCouponDiscount())}</span>
                    </div>
                  )}
                  <div className="h-[1px] bg-[rgba(255,255,255,0.07)] my-1" />
                  <div className="flex justify-between">
                    <span className="text-white text-[14px] font-bold">Total</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c9115f] to-[#cd620e] text-[16px] font-bold">
                      {formatPrice(getTotalPrice())}
                    </span>
                  </div>
                </div>
              </div>

              {/* Coupon */}
              <div className="flex gap-2">
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="Enter coupon code"
                  className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[12px] px-4 py-2.5 text-white text-[13px] placeholder:text-[#99A1AF] focus:outline-none focus:border-[rgba(201,17,95,0.5)]"
                />
                <button
                  onClick={() => { if (coupon.trim().toUpperCase() === 'SPORT20') setCouponApplied(true); }}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#c9115f] to-[#cd620e] rounded-[12px] text-white text-[13px] font-semibold"
                >
                  Apply
                </button>
              </div>
              {couponApplied && <p className="text-[#00c864] text-[12px] mt-2">✓ Coupon applied! You saved 20%</p>}
            </div>
          )}
        </div>

        {/* Sticky CTA */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#0b0b0f] border-t border-[rgba(255,255,255,0.07)] px-4 py-3">
          <button
            disabled={!canProceed}
            onClick={handleNext}
            className={`w-full rounded-full py-3.5 text-white text-[15px] font-bold transition-all ${
              canProceed
                ? 'bg-gradient-to-r from-[#c9115f] to-[#cd620e] shadow-[0_0_20px_rgba(201,17,95,0.5)]'
                : 'bg-[rgba(255,255,255,0.1)] opacity-50'
            }`}
          >
            {step === 1 ? 'Proceed to Payment' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
