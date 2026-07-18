import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Star, Clock, Share2, Bookmark, Award, Shield, ChevronDown, ChevronUp, Zap, CheckCircle, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CoachBadge } from './Store';
import { storeService } from '@/services/store.service';
import { formatPrice } from '@/utils/formatters';

const defaultCoach = {
  id: 1, name: 'Anubhav Karmakar', role: 'Founder, Athloft Multisport', experience: '12 yrs',
  rating: 4.9, reviews: 218, sessionsCompleted: 870, pricePaise: 220000, nextSlot: 'Today 5PM',
  image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=800&h=900&fit=crop&auto=format&q=80',
  verified: true, badge: 'independent' as const,
  tagline: 'USATF-certified · Marathons & IronMan specialist',
  about: "Founder of Athloft Multisport, Anubhav is a USATF-certified coach who has guided athletes across global major marathons including Boston, Berlin, and Tokyo, as well as IronMan events worldwide.",
  achievements: ['USATF Level 2 Certified Coach', 'Coached 40+ Boston Marathon finishers', 'IronMan 70.3 Age Group Coach of the Year 2023'],
  certifications: ['USATF Level 2 Track & Field', 'IRONMAN Certified Coach', 'Sports Science Diploma – ISSA'],
  services: [
    { title: 'Marathon Training Plan', duration: '16 weeks', pricePaise: 850000, desc: 'Full periodised marathon plan with weekly check-ins.', price: '₹8,500' },
    { title: 'IronMan Prep Session', duration: '90 min', pricePaise: 320000, desc: 'Multi-discipline pacing and nutrition strategy.', price: '₹3,200' },
    { title: 'Monthly Online Coaching', duration: '4 sessions', pricePaise: 650000, desc: 'Remote coaching with video analysis.', price: '₹6,500' },
  ],
  reviewList: [
    { user: 'Rahul M.', rating: 5, comment: "Anubhav's marathon plan took me from 4:45 to 3:58. Incredibly structured.", date: '1 week ago' },
  ]
};

const groupSlotsByDate = (slotList: any[]) => {
  const grouped: Record<string, { date: string; day: string; num: number; times: any[] }> = {};
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get current date string in local YYYY-MM-DD format
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  slotList.forEach(slot => {
    const dStr = slot.date; // e.g. "2026-07-09"
    if (dStr < todayStr) return; // Only display current date or future dates

    if (!grouped[dStr]) {
      const dateObj = new Date(dStr);
      const day = dayNames[dateObj.getDay()];
      const num = dateObj.getDate();
      grouped[dStr] = {
        date: dStr,
        day,
        num,
        times: []
      };
    }
    grouped[dStr].times.push(slot);
  });

  // Sort by date ascending
  return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
};

export default function StoreCoachProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [coach, setCoach] = useState<any>(defaultCoach);
  const [groupedSlots, setGroupedSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [saved, setSaved] = useState(false);
  const [expandedAbout, setExpandedAbout] = useState(false);
  const [selectedDateIdx, setSelectedDateIdx] = useState<number>(0);

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [lockErrorMessage, setLockErrorMessage] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<number>(0);
  const [lockingSlot, setLockingSlot] = useState(false);

  const queryParams = new URLSearchParams(window.location.search);
  const serviceType = queryParams.get('serviceType');

  useEffect(() => {
    if (coach.services && serviceType) {
      const idx = coach.services.findIndex((svc: any) =>
        svc.title.toLowerCase().includes(serviceType.toLowerCase()) ||
        svc.desc.toLowerCase().includes(serviceType.toLowerCase())
      );
      if (idx !== -1) {
        setSelectedService(idx);
      }
    }
  }, [coach, serviceType]);

  const fetchCoach = async () => {
    try {
      const product = await storeService.getProductById(`coach-${id || '1'}`);
      const slotList = await storeService.getSlots(`coach-${id || '1'}`);

      setCoach({
        ...defaultCoach,
        ...product,
        id: product.id,
        name: product.name,
        role: product.title || product.role || defaultCoach.role,
        pricePaise: product.pricePaise,
        image: product.image || defaultCoach.image,
        rating: product.rating || defaultCoach.rating,
        reviews: product.reviews || defaultCoach.reviews,
        badge: product.sourcing_model || 'independent',
      });
      setGroupedSlots(groupSlotsByDate(slotList));
    } catch (err) {
      console.error('Error fetching coach details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchCoach();
  }, [id]);

  const handleSlotSelect = (slot: any) => {
    setSelectedSlotId(slot.id);
    setSelectedTime(slot.time);
    setLockErrorMessage(null);
  };

  const handleBookSession = async () => {
    if (!selectedSlotId || !selectedTime || lockingSlot) return;
    setLockErrorMessage(null);
    setLockingSlot(true);

    try {
      const res = await storeService.lockSlot(`coach-${id || '1'}`, selectedSlotId, 'abhishekrt959_gmail_com');
      if (res.status === 'locked' || res.lockExpiresAt) {
        // Success: navigate to booking screen carrying parameters
        navigate(`/store/booking/${id || '1'}?date=${currentSlot.date}&time=${selectedTime}&day=${currentSlot.day}&num=${currentSlot.num}&serviceIndex=${selectedService}`);
      } else {
        alert('Slot not available');
      }
    } catch (err: any) {
      setLockErrorMessage('Slot not available - locked by another user');
      setSelectedSlotId(null);
      setSelectedTime(null);
      // Re-fetch slots to update layout instantly
      const slotList = await storeService.getSlots(`coach-${id || '1'}`);
      setGroupedSlots(groupSlotsByDate(slotList));
    } finally {
      setLockingSlot(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-black w-full flex justify-center min-h-screen items-center">
        <span className="text-white text-[14px]">Loading coach profile...</span>
      </div>
    );
  }

  const currentSlot = groupedSlots[selectedDateIdx] || { date: '', day: '', num: 0, times: [] };

  return (
    <div className="bg-black w-full flex justify-center min-h-screen">
      <div className="w-full max-w-[390px] bg-[#0b0b0f] relative flex flex-col min-h-screen">

        {/* HERO */}
        <div className="relative flex-shrink-0" style={{ height: 320 }}>
          <img src={coach.image} alt={coach.name} className="w-full h-full object-cover object-top" />
          <div className="absolute inset-0" style={{ background: 'gradient-to-b', backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 35%, rgba(11,11,15,0.7) 70%, #0b0b0f 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)' }} />

          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-12">
            <button
              onClick={() => navigate(-1)}
              className="w-[38px] h-[38px] rounded-full backdrop-blur-md flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.14)' }}
            >
              <ArrowLeft className="w-[18px] h-[18px] text-white" />
            </button>
            <div className="flex gap-2">
              <button
                className="w-[38px] h-[38px] rounded-full backdrop-blur-md flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.14)' }}
              >
                <Share2 className="w-[15px] h-[15px] text-white" />
              </button>
              <button
                onClick={() => setSaved(s => !s)}
                className="w-[38px] h-[38px] rounded-full backdrop-blur-md flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.14)' }}
              >
                <Bookmark className="w-[15px] h-[15px]" style={{ color: saved ? '#c9115f' : 'white', fill: saved ? '#c9115f' : 'none' }} />
              </button>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 px-4 pb-5">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-white text-[26px] font-bold leading-none">{coach.name}</h1>
              {coach.verified && (
                <div className="w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#c9115f,#cd620e)' }}>
                  <span className="text-white text-[10px] font-bold">✓</span>
                </div>
              )}
              <CoachBadge type={coach.badge} />
            </div>
            <p className="text-[rgba(255,255,255,0.65)] text-[13px]">{coach.role}</p>
            <p className="text-[rgba(255,255,255,0.45)] text-[11px] mt-0.5">{coach.tagline}</p>
          </div>
        </div>

        {/* STATS STRIP */}
        <div className="mx-4 -mt-1 mb-4 rounded-[18px] overflow-hidden" style={{ background: 'linear-gradient(135deg,rgba(201,17,95,0.18),rgba(205,98,14,0.18))', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex divide-x divide-[rgba(255,255,255,0.08)]">
            {[
              { label: 'Rating', value: `${coach.rating}★`, sub: `${coach.reviews} reviews` },
              { label: 'Experience', value: coach.experience, sub: 'field expertise' },
              { label: 'Sessions', value: `${((coach.sessionsCompleted || 870) / 1000).toFixed(1)}k`, sub: 'completed' },
            ].map((stat) => (
              <div key={stat.label} className="flex-1 py-3 flex flex-col items-center gap-0.5">
                <p className="text-white text-[16px] font-bold leading-none">{stat.value}</p>
                <p className="text-[rgba(255,255,255,0.5)] text-[10px]">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto pb-[96px] no-scrollbar">

          {/* Date Picker */}
          <div className="mb-5">
            <div className="flex items-center justify-between px-4 mb-3">
              <p className="text-white text-[14px] font-bold">Select Date</p>
              <div className="flex items-center gap-1">
                <div className="w-[6px] h-[6px] rounded-full bg-[#00c864]" />
                <span className="text-[#00c864] text-[11px] font-medium">{groupedSlots.length} days available</span>
              </div>
            </div>
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar px-4 pb-1">
              {groupedSlots.map((slot: any, i: number) => {
                const active = selectedDateIdx === i;
                return (
                  <button
                    key={i}
                    onClick={() => { setSelectedDateIdx(i); setSelectedSlotId(null); setSelectedTime(null); setLockErrorMessage(null); }}
                    className="flex-shrink-0 flex flex-col items-center rounded-[14px] py-3 px-3.5 transition-all"
                    style={{
                      minWidth: 60,
                      background: active ? 'linear-gradient(135deg,#c9115f,#cd620e)' : 'rgba(255,255,255,0.05)',
                      border: active ? '1px solid rgba(201,17,95,0.6)' : '1px solid rgba(255,255,255,0.08)',
                      boxShadow: active ? '0 0 14px rgba(201,17,95,0.35)' : 'none',
                    }}
                  >
                    <span className="text-[10px] font-semibold" style={{ color: active ? 'rgba(255,255,255,0.8)' : '#99A1AF' }}>{slot.day}</span>
                    <span className="text-[20px] font-bold leading-none mt-0.5" style={{ color: 'white' }}>{slot.num}</span>
                    <span className="text-[9px] mt-1 font-semibold rounded-full px-1.5 py-0.5" style={{ background: active ? 'rgba(255,255,255,0.2)' : 'rgba(0,200,100,0.15)', color: active ? 'white' : '#00c864' }}>
                      {slot.times.length} slots
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Picker */}
          <div className="mb-6 px-4">
            <p className="text-white text-[14px] font-bold mb-3">Select Time</p>
            {lockErrorMessage && (
              <p className="text-[#ff4444] text-[12px] font-semibold mb-3 bg-[rgba(255,68,68,0.1)] px-3 py-2 rounded-lg border border-[rgba(255,68,68,0.2)]">{lockErrorMessage}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {currentSlot.times?.map((t: any) => {
                const active = selectedSlotId === t.id;
                const isBooked = t.status === 'booked';
                const isLocked = t.status === 'locked' && t.lockExpiresAt && new Date(t.lockExpiresAt.toDate ? t.lockExpiresAt.toDate() : t.lockExpiresAt) > new Date();

                let btnBg = 'rgba(255,255,255,0.06)';
                let btnBorder = '1px solid rgba(255,255,255,0.1)';
                let btnColor = '#c8c8d0';

                if (active) {
                  btnBg = 'linear-gradient(135deg,#c9115f,#cd620e)';
                  btnBorder = '1px solid rgba(201,17,95,0.6)';
                  btnColor = 'white';
                } else if (isBooked) {
                  btnBg = 'rgba(255,255,255,0.02)';
                  btnBorder = '1px solid rgba(255,255,255,0.04)';
                  btnColor = '#4a4a5a';
                } else if (isLocked && t.lockedBy !== 'abhishekrt959_gmail_com') {
                  btnBg = 'rgba(255,255,255,0.02)';
                  btnBorder = '1px solid rgba(255,255,255,0.04)';
                  btnColor = '#4a4a5a';
                }

                return (
                  <button
                    key={t.id}
                    disabled={isBooked || (isLocked && t.lockedBy !== 'abhishekrt959_gmail_com')}
                    onClick={() => handleSlotSelect(t)}
                    className="rounded-full px-4 py-2 text-[13px] font-semibold transition-all relative"
                    style={{
                      background: btnBg,
                      border: btnBorder,
                      color: btnColor,
                    }}
                  >
                    {t.time}
                    {isBooked && (
                      <span className="absolute -top-1 -right-1 text-[8px] font-bold px-1 py-0.2 bg-[rgba(255,68,68,0.15)] text-[#ff4444] border border-[rgba(255,68,68,0.3)] rounded-full">
                        Booked
                      </span>
                    )}
                    {!isBooked && isLocked && t.lockedBy !== 'abhishekrt959_gmail_com' && (
                      <span className="absolute -top-1 -right-1 text-[8px] font-bold px-1 py-0.2 bg-[rgba(255,215,0,0.15)] text-[#FFD700] border border-[rgba(255,215,0,0.3)] rounded-full">
                        Locked
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* About */}
          <div className="mb-6 px-4">
            <p className="text-white text-[14px] font-bold mb-2">About</p>
            <p className={`text-[#a8a8b8] text-[13px] leading-relaxed ${!expandedAbout ? 'line-clamp-3' : ''}`}>
              {coach.about}
            </p>
            <button
              onClick={() => setExpandedAbout(e => !e)}
              className="flex items-center gap-1 text-[12px] font-semibold mt-2"
              style={{ color: '#c9115f' }}
            >
              {expandedAbout ? <><ChevronUp className="w-[12px] h-[12px]" />Show less</> : <><ChevronDown className="w-[12px] h-[12px]" />Read more</>}
            </button>
          </div>

          {/* Achievements */}
          <div className="mb-6 px-4">
            <p className="text-white text-[14px] font-bold mb-3">Achievements</p>
            <div className="grid grid-cols-2 gap-2">
              {coach.achievements?.map((a: string, i: number) => (
                <div key={i} className="rounded-[12px] p-3 flex items-start gap-2" style={{ background: 'rgba(201,17,95,0.07)', border: '1px solid rgba(201,17,95,0.16)' }}>
                  <Award className="w-[13px] h-[13px] flex-shrink-0 mt-0.5" style={{ color: '#c9115f' }} />
                  <p className="text-[#d8d8e8] text-[11px] leading-snug">{a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="mb-6 px-4">
            <p className="text-white text-[14px] font-bold mb-3">Certifications</p>
            <div className="flex flex-col gap-2">
              {coach.certifications?.map((cert: string, i: number) => (
                <div key={i} className="flex items-center gap-3 rounded-[12px] p-3" style={{ background: '#111116', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <Shield className="w-[14px] h-[14px] flex-shrink-0" style={{ color: '#cd620e' }} />
                  <span className="text-[#d0d0e0] text-[13px]">{cert}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="mb-6 px-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white text-[14px] font-bold">Reviews</p>
              <div className="flex items-center gap-1">
                <Star className="w-[13px] h-[13px] text-[#FFD700] fill-[#FFD700]" />
                <span className="text-[#FFD700] text-[13px] font-bold">{coach.rating}</span>
                <span className="text-[#99A1AF] text-[11px]"> / 5</span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {coach.reviewList?.map((rev: any, i: number) => (
                <div key={i} className="rounded-[14px] p-4" style={{ background: '#111116', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-[32px] h-[32px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#c9115f,#cd620e)' }}>
                        <span className="text-white text-[13px] font-bold">{rev.user[0]}</span>
                      </div>
                      <div>
                        <p className="text-white text-[13px] font-semibold leading-none">{rev.user}</p>
                        <p className="text-[#4a4a5a] text-[10px] mt-0.5">{rev.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: rev.rating }).map((_, j) => (
                        <Star key={j} className="w-[10px] h-[10px] text-[#FFD700] fill-[#FFD700]" />
                      ))}
                    </div>
                  </div>
                  <p className="text-[#a8a8b8] text-[12px] leading-relaxed">"{rev.comment}"</p>
                </div>
              ))}
            </div>
            <button className="flex items-center gap-1.5 text-[12px] font-semibold mt-3" style={{ color: '#c9115f' }}>
              <MessageCircle className="w-[13px] h-[13px]" />
              View all {coach.reviews} reviews
            </button>
          </div>
        </div>

        {/* STICKY BOOK SESSION */}
        <div
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] z-50 px-4 py-3"
          style={{ background: 'linear-gradient(to top, #0b0b0f 80%, transparent)', borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          {selectedTime && (
            <div className="flex items-center gap-2 mb-2.5 px-1">
              <Clock className="w-[12px] h-[12px]" style={{ color: '#00c864' }} />
              <span className="text-[12px] text-[#00c864] font-medium">
                {currentSlot.day} {currentSlot.num} Jul · {selectedTime}
              </span>
              <span className="text-[#4a4a5a] text-[11px]">·</span>
              <span className="text-[#99A1AF] text-[11px]">{coach.services?.[selectedService]?.title}</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div>
              <p className="text-[#99A1AF] text-[11px]">From</p>
              <p className="text-[18px] font-bold leading-none" style={{ background: 'linear-gradient(135deg,#c9115f,#cd620e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {coach.services?.[selectedService]?.price}
              </p>
            </div>
            <button
              disabled={!selectedTime || lockingSlot}
              className="flex-1 rounded-full py-3.5 text-white text-[15px] font-bold flex items-center justify-center gap-2 transition-all"
              style={{
                background: selectedTime ? 'linear-gradient(135deg,#c9115f,#cd620e)' : 'rgba(255,255,255,0.1)',
                boxShadow: selectedTime ? '0 0 22px rgba(201,17,95,0.5)' : 'none',
                opacity: selectedTime ? 1 : 0.6,
              }}
              onClick={handleBookSession}
            >
              <Zap className="w-[15px] h-[15px] fill-white" />
              {lockingSlot ? 'Locking slot...' : selectedTime ? 'Book Session' : 'Select a time slot'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}