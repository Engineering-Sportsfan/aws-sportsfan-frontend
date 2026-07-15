import { useNavigate } from 'react-router';
import { ArrowLeft, Clock, Users, Star, Timer, ChevronRight, CheckCircle2, Minus, Plus, QrCode } from 'lucide-react';
import { useState, useEffect } from 'react';
import { storeService } from '@/services/store.service';


const experiences = [
  {
    id: 1,
    title: 'Breakfast with Neeraj Chopra',
    description: 'Start your morning with an intimate Q&A breakfast with Neeraj Chopra. Limited to 8 guests only — discuss training, mindset, and Olympic preparation over a curated meal.',
    duration: '2 hours',
    seatsLeft: 3,
    totalSeats: 8,
    price: '₹12,500',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=250&fit=crop&auto=format',
    tag: 'Exclusive',
    tagColor: '#c9115f',
    countdown: '2d 14h 30m',
    inclusions: ['Curated breakfast for two', 'Signed memorabilia', 'Group photo session', 'Q&A with the athlete', 'Digital certificate of attendance'],
    soldOut: false,
  },
  {
    id: 2,
    title: 'Track Day with Avinash Sable',
    description: 'Train alongside steeplechase champion Avinash Sable at the Kanteerava Stadium track. Includes warm-up drills, technique session, and a group debrief.',
    duration: '3 hours',
    seatsLeft: 0,
    totalSeats: 12,
    price: '₹8,999',
    image: 'https://images.unsplash.com/photo-1544899489-a083461b088c?w=400&h=250&fit=crop&auto=format',
    tag: 'Sold Out',
    tagColor: '#6b7280',
    countdown: '',
    inclusions: ['Guided track warm-up', 'Steeplechase technique drills', 'Group run with the athlete', 'Signed bib', 'Sports photography'],
    soldOut: true,
  },
  {
    id: 3,
    title: 'AFI Performance Lab Visit',
    description: 'Get exclusive access to the Athletics Federation of India performance lab. Includes a strength test, biomechanics analysis, and a meeting with AFI coaching staff.',
    duration: '4 hours',
    seatsLeft: 6,
    totalSeats: 10,
    price: '₹6,499',
    image: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=400&h=250&fit=crop&auto=format',
    tag: 'Featured',
    tagColor: '#cd620e',
    countdown: '5d 8h',
    inclusions: ['Performance biomechanics scan', 'VO2 max test', 'Meeting with AFI coaches', 'Personalized report', 'AFI facility tour'],
    soldOut: false,
  },
  {
    id: 4,
    title: 'Sprint Science Masterclass',
    description: 'A live masterclass on sprint science delivered by elite coaches and sports scientists. Covers biomechanics, starts, acceleration mechanics, and recovery protocols.',
    duration: '2.5 hours',
    seatsLeft: 18,
    totalSeats: 30,
    price: '₹3,299',
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=250&fit=crop&auto=format',
    tag: 'Popular',
    tagColor: '#c9115f',
    countdown: '',
    inclusions: ['Live presentation + demo', 'Video drills library access (30 days)', 'Q&A session', 'Digital handout', 'Certificate of completion'],
    soldOut: false,
  },
];

function ExperienceDetail({ exp, onClose }: { exp: typeof experiences[0]; onClose: () => void }) {
  const [seats, setSeats] = useState(1);
  const [booked, setBooked] = useState(false);

  if (booked) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="w-[80px] h-[80px] rounded-full bg-gradient-to-br from-[#c9115f] to-[#cd620e] flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(201,17,95,0.5)]">
          <QrCode className="w-[36px] h-[36px] text-white" />
        </div>
        <h2 className="text-white text-[20px] font-bold mb-2">You're In!</h2>
        <p className="text-[#99A1AF] text-[13px] mb-6">Your digital pass has been generated</p>
        <div className="w-full bg-[#111116] rounded-[20px] border border-[rgba(255,255,255,0.08)] p-5 mb-4">
          <div className="w-[120px] h-[120px] rounded-[12px] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-[60px] h-[60px] text-[#c9115f]" />
          </div>
          <p className="text-white text-[15px] font-bold">{exp.title}</p>
          <p className="text-[#99A1AF] text-[12px] mt-1">{exp.duration} · {seats} seat{seats > 1 ? 's' : ''}</p>
          <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between">
            <span className="text-[#99A1AF] text-[11px]">Meeting Point</span>
            <span className="text-white text-[11px] font-semibold">Venue TBC via email</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full rounded-full py-3.5 text-[#99A1AF] text-[14px] font-semibold border border-[rgba(255,255,255,0.12)]"
        >
          Back to Experiences
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-[100px] no-scrollbar">
      <div className="relative h-[220px]">
        <img src={exp.image} alt={exp.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0f] to-transparent" />
        <div className="absolute top-4 left-4">
          <span className="text-white text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: exp.tagColor }}>
            {exp.tag}
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

        <div className="mt-5">
          <p className="text-white text-[14px] font-bold mb-3">What's included</p>
          <div className="flex flex-col gap-2">
            {exp.inclusions.map((inc, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-[14px] h-[14px] text-[#00c864] flex-shrink-0" />
                <span className="text-[#c8c8d0] text-[13px]">{inc}</span>
              </div>
            ))}
          </div>
        </div>

        {!exp.soldOut && (
          <div className="mt-5">
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
                onClick={() => setSeats(s => Math.min(exp.seatsLeft, s + 1))}
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
        className="absolute bottom-0 left-0 right-0 px-4 py-4"
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
                ₹{(parseInt(exp.price.replace(/[₹,]/g, '')) * seats).toLocaleString('en-IN')}
              </p>
            </div>
            <button
              onClick={() => setBooked(true)}
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
        setExperiencesList(res);
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
                        <span className="text-white text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: exp.tagColor }}>
                          {exp.tag}
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