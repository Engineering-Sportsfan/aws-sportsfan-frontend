'use client';

import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, MapPin, Clock, Calendar, Users, Wifi, QrCode, Video,
  ChevronRight, CheckCircle2, Circle, Star, MessageSquare, Phone,
  Shield, FileText, AlertCircle, Timer, Zap, Award, Gift,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { storeService } from '@/services/store.service';
import { formatPrice } from '@/utils/formatters';

type ExperienceType = 'online' | 'offline';
type ExperienceStatus = 'upcoming' | 'today' | 'live' | 'completed';

interface Experience {
  id: string;
  title: string;
  athlete: string;
  athleteImg: string;
  type: ExperienceType;
  category: string;
  bookingId: string;
  status: ExperienceStatus;
  date: string;
  time: string;
  duration: string;
  countdown: string;
  venue?: string;
  venueAddress?: string;
  onlineLink?: string;
  image: string;
  host: string;
  hostRole: string;
  participants: number;
  maxParticipants: number;
  description: string;
  agenda: { time: string; item: string }[];
  rules: string[];
  arrivalTime?: string;
  dressCode?: string;
  parking?: string;
  priceInPaise?: number;
}

type Tab = 'overview' | 'timeline' | 'info' | 'support';

const timelineSteps = [
  { label: 'Booking Confirmed', done: true },
  { label: 'Calendar Added', done: true },
  { label: 'Reminder Sent', done: true },
  { label: 'Preparation', done: false },
  { label: 'Ready', done: false },
  { label: 'Experience', done: false },
  { label: 'Completed', done: false },
  { label: 'Rewards', done: false },
  { label: 'Memories', done: false },
];

export default function StoreExperienceDetail() {
  const router = useRouter();
  const { id } = useParams();
  const [exp, setExp] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    storeService.getExperienceOrderById(id)
      .then((data: any) => {
        const prod = data.productDetails || {};
        const eventStartsAt = data.eventDate || prod.eventStartsAt;

        const formattedDate = eventStartsAt 
          ? new Date(eventStartsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
          : 'July 18, 2026';

        const formattedTime = eventStartsAt
          ? new Date(eventStartsAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })
          : '8:00 AM IST';

        // Map order status/date to local experience statuses ('upcoming', 'today', 'live', 'completed')
        let computedStatus: ExperienceStatus = 'upcoming';
        if (data.status === 'cancelled') {
          // If cancelled, show upcoming or format as completed
          computedStatus = 'completed';
        } else if (eventStartsAt) {
          const eventTime = new Date(eventStartsAt).getTime();
          const now = Date.now();
          if (eventTime < now) {
            computedStatus = 'completed';
          } else if (eventTime - now < 3 * 3600 * 1000 && eventTime - now > -3 * 3600 * 1000) {
            computedStatus = 'live';
          } else {
            const eventDateObj = new Date(eventStartsAt);
            const today = new Date();
            if (eventDateObj.toDateString() === today.toDateString()) {
              computedStatus = 'today';
            }
          }
        }

        const expObj: Experience = {
          id: data.orderId || data.id,
          title: data.title || prod.title || '',
          athlete: prod.athlete || '',
          athleteImg: prod.athleteImg || '',
          type: (prod.type || 'offline') as ExperienceType,
          category: prod.category || 'experiences',
          bookingId: data.orderId || data.bookingId || `SF360-${Math.floor(1000 + Math.random() * 9000)}`,
          status: computedStatus,
          date: formattedDate,
          time: formattedTime,
          duration: prod.duration || '',
          countdown: prod.countdown || (computedStatus === 'live' ? 'LIVE NOW' : ''),
          venue: prod.venue || '',
          venueAddress: prod.venueAddress || '',
          onlineLink: prod.onlineLink || '',
          image: prod.image || '',
          host: prod.host || '',
          hostRole: prod.hostRole || '',
          participants: prod.seatsBooked || 0,
          maxParticipants: prod.totalSeats || 8,
          description: prod.description || '',
          agenda: prod.agenda || [],
          rules: prod.rules || [],
          arrivalTime: prod.arrivalTime || '',
          dressCode: prod.dressCode || '',
          parking: prod.parking || '',
          priceInPaise: data.pricePaise || prod.priceInPaise
        };
        setExp(expObj);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching experience detail:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="bg-black w-full flex justify-center items-center min-h-screen">
        <p className="text-[#99A1AF] text-[13px] animate-pulse">Loading experience detail...</p>
      </div>
    );
  }

  if (!exp) {
    return (
      <div className="bg-black w-full flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-[#99A1AF] text-[13px] mb-4">Experience not found.</p>
          <button 
            onClick={() => router.push('/MainModules/AtheleteStore')} 
            className="px-4 py-2 bg-gradient-to-r from-[#c9115f] to-[#cd620e] rounded-full text-white text-[12px] font-bold"
          >
            Back to Store
          </button>
        </div>
      </div>
    );
  }

  const isLive = exp.status === 'live';
  const isOffline = exp.type === 'offline';
  const isCompleted = exp.status === 'completed';

  const statusColor = isLive ? '#00c864' : isCompleted ? '#6b7280' : '#c9115f';
  const statusLabel = isLive ? 'LIVE' : isCompleted ? 'Completed' : exp.status === 'today' ? 'Today' : 'Upcoming';

  return (
    <div className="bg-black w-full flex justify-center" style={{ height: '100dvh', overflow: 'hidden' }}>
      <div className="w-full max-w-[390px] bg-[#0b0b0f] flex flex-col" style={{ height: '100dvh' }}>
        {/* Hero */}
        <div className="relative h-[155px] flex-shrink-0">
          <img src={exp.image} alt={exp.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90" />
          <button
            onClick={() => router.back()}
            className="absolute top-4 left-4 w-[36px] h-[36px] rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center font-bold z-10"
          >
            <ArrowLeft className="w-[18px] h-[18px] text-white" />
          </button>
          {/* Status badge */}
          <div
            className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ background: `${statusColor}22`, border: `1px solid ${statusColor}55` }}
          >
            {isLive && <div className="w-[6px] h-[6px] rounded-full animate-pulse" style={{ background: statusColor }} />}
            <span className="text-[10px] font-black" style={{ color: statusColor }}>{statusLabel}</span>
          </div>
          {/* Countdown */}
          {exp.countdown && (
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1">
              <Timer className="w-[10px] h-[10px] text-[#FFD700]" />
              <span className="text-[#FFD700] text-[11px] font-bold">{exp.countdown}</span>
            </div>
          )}
        </div>

        {/* Meta block */}
        <div className="px-4 pt-4 pb-3 border-b border-[rgba(255,255,255,0.07)]">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[9px] font-black px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(201,17,95,0.18)', color: '#c9115f', border: '1px solid rgba(201,17,95,0.35)' }}
            >
              {exp.category.toUpperCase()}
            </span>
            <span className="text-[9px] font-semibold text-[#6b7280] uppercase tracking-wide">
              {exp.type === 'online' ? 'Online' : 'In-Person'}
            </span>
          </div>
          <h1 className="text-white text-[20px] font-black leading-tight mb-2">{exp.title}</h1>

          {/* Athlete row */}
          <div className="flex items-center gap-2.5 mb-3">
            <img
              src={exp.athleteImg}
              alt={exp.athlete}
              className="w-[32px] h-[32px] rounded-full object-cover border-2 border-[rgba(201,17,95,0.4)]"
            />
            <div>
              <p className="text-white text-[13px] font-bold">{exp.athlete}</p>
              <p className="text-[#99A1AF] text-[10px]">Athlete</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[#99A1AF] text-[10px]">Booking ID</p>
              <p className="text-[#cd620e] text-[12px] font-bold">{exp.bookingId}</p>
            </div>
          </div>

          {/* Quick facts row */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-[12px] h-[12px] text-[#99A1AF]" />
              <span className="text-[#99A1AF] text-[11px]">{exp.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-[12px] h-[12px] text-[#99A1AF]" />
              <span className="text-[#99A1AF] text-[11px]">{exp.time}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-[12px] h-[12px] text-[#99A1AF]" />
              <span className="text-[#99A1AF] text-[11px]">{exp.participants}/{exp.maxParticipants}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-4 pt-3 pb-0 gap-1 overflow-x-auto no-scrollbar flex-shrink-0">
          {(['overview', 'timeline', 'info', 'support'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold capitalize transition-all ${
                tab === t
                  ? 'bg-gradient-to-r from-[#c9115f] to-[#cd620e] text-white'
                  : 'bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] text-[#99A1AF]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto pb-4 px-4 pt-4 no-scrollbar">
          {tab === 'overview' && (
            <div className="flex flex-col gap-5">
              {/* Description */}
              <div>
                <p className="text-[#99A1AF] text-[13px] leading-relaxed">{exp.description}</p>
              </div>

              {/* Host */}
              {exp.host && (
                <div>
                  <h3 className="text-white text-[13px] font-black mb-2 uppercase tracking-wide">Host</h3>
                  <div className="flex items-center gap-3 bg-[#111116] rounded-[14px] p-3 border border-[rgba(255,255,255,0.07)]">
                    <div className="w-[40px] h-[40px] rounded-full bg-gradient-to-br from-[#c9115f] to-[#cd620e] flex items-center justify-center flex-shrink-0 font-bold text-white">
                      {exp.host[0]}
                    </div>
                    <div>
                      <p className="text-white text-[13px] font-bold">{exp.host}</p>
                      <p className="text-[#99A1AF] text-[11px]">{exp.hostRole}</p>
                    </div>
                    <button className="ml-auto w-[30px] h-[30px] rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                      <MessageSquare className="w-[13px] h-[13px] text-[#99A1AF]" />
                    </button>
                  </div>
                </div>
              )}

              {/* Agenda */}
              {exp.agenda && exp.agenda.length > 0 && (
                <div>
                  <h3 className="text-white text-[13px] font-black mb-3 uppercase tracking-wide">Agenda</h3>
                  <div className="flex flex-col gap-0">
                    {exp.agenda.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="flex flex-col items-center pt-1">
                          <div className="w-[8px] h-[8px] rounded-full bg-gradient-to-br from-[#c9115f] to-[#cd620e] flex-shrink-0" />
                          {i < exp.agenda.length - 1 && (
                            <div className="w-[1px] h-[28px] bg-[rgba(255,255,255,0.1)]" />
                          )}
                        </div>
                        <div className="pb-3 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-white text-[12px] font-semibold">{item.item}</p>
                            <span className="text-[#99A1AF] text-[10px]">{item.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rules */}
              {exp.rules && exp.rules.length > 0 && (
                <div>
                  <h3 className="text-white text-[13px] font-black mb-2 uppercase tracking-wide">Rules & Guidelines</h3>
                  <div className="bg-[#111116] rounded-[14px] p-3 border border-[rgba(255,255,255,0.07)] flex flex-col gap-2.5">
                    {exp.rules.map((r, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <AlertCircle className="w-[12px] h-[12px] text-[#cd620e] mt-0.5 flex-shrink-0" />
                        <p className="text-[#99A1AF] text-[12px] leading-relaxed">{r}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'timeline' && (
            <div className="flex flex-col gap-0 pt-2">
              {timelineSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    {step.done ? (
                      <div className="w-[24px] h-[24px] rounded-full bg-gradient-to-br from-[#c9115f] to-[#cd620e] flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-[13px] h-[13px] text-white" />
                      </div>
                    ) : (
                      <div className="w-[24px] h-[24px] rounded-full border-2 border-[rgba(255,255,255,0.15)] flex items-center justify-center flex-shrink-0">
                        <Circle className="w-[10px] h-[10px] text-[rgba(255,255,255,0.15)]" />
                      </div>
                    )}
                    {i < timelineSteps.length - 1 && (
                      <div
                        className="w-[2px] flex-1 my-1"
                        style={{
                          background: step.done
                            ? 'linear-gradient(to bottom, #c9115f, rgba(205,98,14,0.4))'
                            : 'rgba(255,255,255,0.08)',
                          minHeight: 32,
                        }}
                      />
                    )}
                  </div>
                  <div className="pb-6 flex-1">
                    <p className={`text-[13px] font-bold ${step.done ? 'text-white' : 'text-[#4a4a5a]'}`}>
                      {step.label}
                    </p>
                    {step.done && (
                      <p className="text-[#99A1AF] text-[10px] mt-0.5">Completed</p>
                    )}
                  </div>
                  {step.done && (
                    <span className="text-[#00c864] text-[10px] font-bold mt-1">✓ Done</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === 'info' && (
            <div className="flex flex-col gap-4">
              {isOffline ? (
                <>
                  <div>
                    <h3 className="text-white text-[13px] font-black mb-2 uppercase tracking-wide">Venue</h3>
                    <div className="bg-[#111116] rounded-[14px] p-3 border border-[rgba(255,255,255,0.07)]">
                      <div className="flex items-start gap-2.5 mb-3">
                        <MapPin className="w-[13px] h-[13px] text-[#c9115f] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-white text-[13px] font-bold">{exp.venue}</p>
                          <p className="text-[#99A1AF] text-[11px] mt-0.5">{exp.venueAddress}</p>
                        </div>
                      </div>
                      {/* Map placeholder */}
                      <div
                        className="w-full h-[120px] rounded-[10px] overflow-hidden relative"
                        style={{ background: '#1a1a22', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
                          <MapPin className="w-[24px] h-[24px] text-[#c9115f]" />
                          <span className="text-[#99A1AF] text-[11px]">Tap to open in Maps</span>
                        </div>
                      </div>
                      <button className="mt-2 w-full py-2 rounded-full bg-gradient-to-r from-[#c9115f] to-[#cd620e] text-white text-[12px] font-bold">
                        Navigate
                      </button>
                    </div>
                  </div>

                  {[
                    { label: 'Arrival Time', value: exp.arrivalTime || '—', icon: Clock },
                    { label: 'Dress Code', value: exp.dressCode || '—', icon: Shield },
                    { label: 'Parking', value: exp.parking || '—', icon: MapPin },
                    { label: 'Duration', value: exp.duration, icon: Timer },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-[#111116] rounded-[14px] p-3 border border-[rgba(255,255,255,0.07)] flex items-center gap-3">
                      <div className="w-[32px] h-[32px] rounded-full bg-[rgba(201,17,95,0.12)] flex items-center justify-center flex-shrink-0">
                        <Icon className="w-[14px] h-[14px] text-[#c9115f]" />
                      </div>
                      <div>
                        <p className="text-[#99A1AF] text-[10px]">{label}</p>
                        <p className="text-white text-[12px] font-semibold">{value}</p>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <div className="bg-[#111116] rounded-[14px] p-4 border border-[rgba(255,255,255,0.07)]">
                    <div className="flex items-center gap-2.5 mb-3">
                      <Wifi className="w-[16px] h-[16px] text-[#00c864]" />
                      <p className="text-white text-[13px] font-bold">Online Experience</p>
                    </div>
                    <p className="text-[#99A1AF] text-[12px] mb-3">Join from any device via the SportsFan360 app or the link below.</p>
                    <div className="bg-[rgba(0,200,100,0.08)] border border-[rgba(0,200,100,0.2)] rounded-[10px] px-3 py-2 mb-3">
                      <p className="text-[#00c864] text-[10px] font-bold">Session Link</p>
                      <p className="text-white text-[11px] mt-0.5 font-mono break-all">{exp.onlineLink}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] text-[#99A1AF] text-[11px] font-bold flex items-center justify-center gap-1">
                        <Wifi className="w-[11px] h-[11px]" /> Test Connection
                      </button>
                      <button 
                        onClick={() => { if (exp.onlineLink) window.open(exp.onlineLink, '_blank'); }}
                        className="flex-1 py-2 rounded-full bg-gradient-to-r from-[#c9115f] to-[#cd620e] text-white text-[11px] font-bold flex items-center justify-center gap-1"
                      >
                        <Video className="w-[11px] h-[11px]" /> Join Now
                      </button>
                    </div>
                  </div>

                  {[
                    { label: 'Duration', value: exp.duration },
                    { label: 'Participants', value: `${exp.participants} of ${exp.maxParticipants} joined` },
                    { label: 'Recording', value: 'Available 48h after session' },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-[#111116] rounded-[14px] p-3 border border-[rgba(255,255,255,0.07)] flex items-center justify-between">
                      <span className="text-[#99A1AF] text-[12px]">{label}</span>
                      <span className="text-white text-[12px] font-semibold">{value}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {tab === 'support' && (
            <div className="flex flex-col gap-3">
              {[
                { label: 'Organizer Contact', sub: 'events@sportsfan360.app', icon: Phone, color: '#c9115f' },
                { label: 'Help Center', sub: 'Browse FAQs & guides', icon: MessageSquare, color: '#cd620e' },
                { label: 'Emergency Contact', sub: '+91 98765 43210', icon: AlertCircle, color: '#ff4444' },
                { label: 'Refund Policy', sub: 'Cancel up to 24h before', icon: Shield, color: '#00c864' },
                { label: 'Terms & Conditions', sub: 'Experience terms', icon: FileText, color: '#6b7280' },
                { label: 'Report Issue', sub: 'Something wrong? Let us know', icon: AlertCircle, color: '#ff9900' },
              ].map(({ label, sub, icon: Icon, color }) => (
                <button
                  key={label}
                  className="flex items-center gap-3 bg-[#111116] rounded-[14px] p-4 border border-[rgba(255,255,255,0.07)] active:scale-[0.98] transition-transform"
                >
                  <div
                    className="w-[36px] h-[36px] rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                  >
                    <Icon className="w-[15px] h-[15px]" style={{ color }} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-white text-[13px] font-semibold">{label}</p>
                    <p className="text-[#99A1AF] text-[11px]">{sub}</p>
                  </div>
                  <ChevronRight className="w-[14px] h-[14px] text-[#4a4a5a]" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action bar above nav */}
        <div className="flex-shrink-0 px-4 pb-3 pt-2 bg-gradient-to-t from-[#0b0b0f] to-transparent border-t border-[rgba(255,255,255,0.05)]">
          {isCompleted ? (
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/MainModules/AtheleteStore/StoreExperienceMemories/${exp.id}`)}
                className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#c9115f] to-[#cd620e] text-white text-[14px] font-black flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(201,17,95,0.4)]"
              >
                <Gift className="w-[16px] h-[16px]" /> View Memories
              </button>
              <button className="flex-1 py-3 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] text-white text-[14px] font-black flex items-center justify-center gap-2">
                <Star className="w-[16px] h-[16px] text-[#FFD700]" /> Rate
              </button>
            </div>
          ) : isLive && !isOffline ? (
            <button 
              onClick={() => { if (exp.onlineLink) window.open(exp.onlineLink, '_blank'); }}
              className="w-full py-3 rounded-full bg-gradient-to-r from-[#00c864] to-[#00a050] text-white text-[14px] font-black flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,200,100,0.4)]"
            >
              <div className="w-[8px] h-[8px] rounded-full bg-white animate-pulse" />
              Join Session Now
            </button>
          ) : isOffline ? (
            <button
              onClick={() => router.push(`/MainModules/AtheleteStore/StoreEventPass/${exp.id}`)}
              className="w-full py-3 rounded-full bg-gradient-to-r from-[#c9115f] to-[#cd620e] text-white text-[14px] font-black flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(201,17,95,0.4)]"
            >
              <QrCode className="w-[16px] h-[16px]" /> Show Event Pass
            </button>
          ) : (
            <div className="flex gap-2">
              <button className="flex-1 py-3 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] text-white text-[13px] font-bold flex items-center justify-center gap-1.5">
                <Calendar className="w-[14px] h-[14px] text-[#99A1AF]" /> Add Reminder
              </button>
              <button
                onClick={() => router.push(`/store/experience-notifications`)}
                className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#c9115f] to-[#cd620e] text-white text-[13px] font-bold flex items-center justify-center gap-1.5"
              >
                <Award className="w-[14px] h-[14px]" /> Prepare
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}