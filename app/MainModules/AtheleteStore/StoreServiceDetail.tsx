import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Star, Clock, ChevronRight, CheckCircle } from 'lucide-react';

const serviceData: Record<string, {
  id: number; title: string; subtitle: string; price: string; image: string;
  tag: string; tagColor: string; description: string; whatYouGet: string[];
  coaches: { id: number; name: string; role: string; rating: number; reviews: number; price: string; nextSlot: string; image: string }[];
  packages: { title: string; duration: string; price: string; desc: string }[];
}> = {
  '1': {
    id: 1, title: 'Long Jump Coaching', subtitle: 'Master your technique',
    price: '₹2,499', tag: 'Popular', tagColor: '#c9115f',
    image: 'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=800&h=400&fit=crop&auto=format',
    description: 'Work with world-class long jump specialists to perfect your approach run, takeoff mechanics, flight technique, and landing. Trusted by national athletes and beginners alike.',
    whatYouGet: ['Video analysis of your jump with frame-by-frame feedback', 'Personalized approach run calibration', 'Takeoff board technique drills', 'Competition phase strategy & mental prep', 'Post-session written report with action plan'],
    coaches: [
      { id: 5, name: 'Vikram Singh', role: 'Long Jump Specialist', rating: 4.8, reviews: 521, price: '₹3,000/hr', nextSlot: 'Fri 11AM', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&auto=format' },
      { id: 1, name: 'Ravi Shastri', role: 'Head Athletics Coach', rating: 4.9, reviews: 312, price: '₹1,800/hr', nextSlot: 'Today 4PM', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&auto=format' },
    ],
    packages: [
      { title: 'Single Session', duration: '60 min', price: '₹2,499', desc: 'One-on-one technique analysis and drills with video breakdown.' },
      { title: 'Intensive Pack', duration: '4 sessions', price: '₹8,499', desc: 'Progressive 4-session program with weekly goals and tracking.' },
      { title: 'Elite Mentorship', duration: '8 sessions', price: '₹14,999', desc: 'Full coaching cycle with competition preparation and peak-performance planning.' },
    ],
  },
  '2': {
    id: 2, title: 'Javelin Coaching', subtitle: 'Olympic-level training',
    price: '₹3,299', tag: 'Featured', tagColor: '#cd620e',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=400&fit=crop&auto=format',
    description: 'Learn the biomechanics of elite javelin throwing from coaches with national and international competition experience. From grip to release — every degree matters.',
    whatYouGet: ['Biomechanical throw analysis (slow-motion video)', 'Grip and wrist action correction', 'Run-up rhythm and crossover drills', 'Release angle optimization for max distance', 'Training plan for the next 4–6 weeks'],
    coaches: [
      { id: 1, name: 'Ravi Shastri', role: 'Head Athletics Coach', rating: 4.9, reviews: 312, price: '₹1,800/hr', nextSlot: 'Today 4PM', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&auto=format' },
      { id: 3, name: 'Arun Kumar', role: 'Sprint & Speed Coach', rating: 4.7, reviews: 194, price: '₹2,100/hr', nextSlot: 'Today 6PM', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&auto=format' },
    ],
    packages: [
      { title: 'Technique Session', duration: '75 min', price: '₹3,299', desc: 'Complete throw analysis with immediate corrections and drill prescription.' },
      { title: 'Competition Prep', duration: '3 sessions', price: '₹8,999', desc: 'Pre-competition focused sessions covering mental prep and peak form.' },
      { title: 'Season Package', duration: '10 sessions', price: '₹24,999', desc: 'Full season coaching with periodized training and competition strategy.' },
    ],
  },
  '3': {
    id: 3, title: 'Sprint Coaching', subtitle: 'Speed & explosiveness',
    price: '₹1,999', tag: 'New', tagColor: '#00c864',
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=400&fit=crop&auto=format',
    description: 'Improve your acceleration, maximum velocity, and race mechanics with proven drills and personalized coaching from former national-level sprinters.',
    whatYouGet: ['Block start and reaction time drills', 'Acceleration phase mechanics', 'Top-speed running form analysis', 'Race tactics for 100m, 200m, and 400m', 'Speed endurance programming'],
    coaches: [
      { id: 3, name: 'Arun Kumar', role: 'Sprint & Speed Coach', rating: 4.7, reviews: 194, price: '₹2,100/hr', nextSlot: 'Today 6PM', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&auto=format' },
      { id: 4, name: 'Sneha Patel', role: 'Strength & Conditioning', rating: 4.9, reviews: 445, price: '₹2,500/hr', nextSlot: 'Thu 2PM', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&auto=format' },
    ],
    packages: [
      { title: 'Speed Session', duration: '60 min', price: '₹1,999', desc: 'Focused sprint mechanics session with video feedback and drill set.' },
      { title: 'Speed Development Pack', duration: '5 sessions', price: '₹8,499', desc: 'Progressive speed development across all phases of the 100m.' },
      { title: 'Sprint Season Plan', duration: '12 sessions', price: '₹19,999', desc: 'Full competitive season plan with periodization and race-day strategy.' },
    ],
  },
  '4': {
    id: 4, title: 'Sports Nutrition', subtitle: 'Fuel your performance',
    price: '₹1,499', tag: 'Trending', tagColor: '#c9115f',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=400&fit=crop&auto=format',
    description: 'Get a personalized nutrition plan from certified sports dietitians. Covers pre-training fueling, competition day nutrition, and recovery protocols.',
    whatYouGet: ['Full dietary intake assessment', 'Personalized macro & micro-nutrient targets', 'Pre/during/post-competition meal plans', 'Supplement protocol review', 'Weekly check-in & plan adjustments'],
    coaches: [
      { id: 2, name: 'Priya Sharma', role: 'Sports Nutritionist', rating: 4.8, reviews: 278, price: '₹1,200/hr', nextSlot: 'Tomorrow 10AM', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&auto=format' },
    ],
    packages: [
      { title: 'Nutrition Assessment', duration: '60 min', price: '₹1,499', desc: 'One-time comprehensive nutrition assessment with personalized plan.' },
      { title: 'Competition Fueling Plan', duration: '45 min', price: '₹1,800', desc: 'Event-specific fueling strategy for your upcoming competition.' },
      { title: 'Monthly Nutrition', duration: '4 check-ins', price: '₹4,999', desc: 'Ongoing monthly nutrition coaching with weekly adjustments.' },
    ],
  },
};

const defaultService = serviceData['1'];

export default function StoreServiceDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const service = serviceData[id || '1'] || defaultService;

  return (
    <div className="bg-black w-full flex justify-center min-h-screen">
      <div className="w-full max-w-[390px] bg-[#0b0b0f] relative flex flex-col min-h-screen">
        {/* Hero Image */}
        <div className="relative h-[220px] flex-shrink-0">
          <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0f] via-[rgba(11,11,15,0.3)] to-transparent" />
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-12">
            <button
              onClick={() => navigate(-1)}
              className="w-[36px] h-[36px] rounded-full bg-[rgba(0,0,0,0.5)] backdrop-blur-sm flex items-center justify-center border border-[rgba(255,255,255,0.15)]"
            >
              <ArrowLeft className="w-[18px] h-[18px] text-white" />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
            <div
              className="inline-block px-2.5 py-0.5 rounded-full text-white text-[10px] font-bold mb-2"
              style={{ backgroundColor: service.tagColor }}
            >
              {service.tag}
            </div>
            <h1 className="text-white text-[22px] font-bold leading-tight">{service.title}</h1>
            <p className="text-[#99A1AF] text-[13px]">{service.subtitle}</p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-[88px] no-scrollbar">
          {/* About */}
          <div className="px-4 pt-5 mb-5">
            <p className="text-[#c8c8d0] text-[13px] leading-relaxed">{service.description}</p>
          </div>

          {/* What you get */}
          <div className="px-4 mb-6">
            <h2 className="text-white text-[15px] font-bold mb-3">What you get</h2>
            <div className="flex flex-col gap-2.5">
              {service.whatYouGet.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle className="w-[16px] h-[16px] text-[#00c864] flex-shrink-0 mt-0.5" />
                  <p className="text-[#c8c8d0] text-[13px] leading-snug">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Packages */}
          <div className="px-4 mb-6">
            
            <div className="flex flex-col gap-3">
              {service.packages.map((pkg, i) => (
                null
              ))}
            </div>
          </div>

          {/* Coaches for this service */}
          <div className="px-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white text-[15px] font-bold">Available Coaches</h2>
              <button
                className="flex items-center gap-0.5 text-[#c9115f] text-[12px] font-semibold"
                onClick={() => navigate('/store/coaches')}
              >
                See all <ChevronRight className="w-[13px] h-[13px]" />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {service.coaches.map((coach) => (
                <button
                  key={coach.id}
                  className="w-full bg-[#111116] rounded-[16px] border border-[rgba(255,255,255,0.08)] p-3 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
                  onClick={() => navigate(`/store/coach/${coach.id}`)}
                >
                  <div className="w-[52px] h-[52px] rounded-full overflow-hidden bg-[#1a1a1f] border-2 border-[rgba(201,17,95,0.3)] flex-shrink-0">
                    <img src={coach.image} alt={coach.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-[14px] font-semibold">{coach.name}</p>
                    <p className="text-[#99A1AF] text-[11px]">{coach.role}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-0.5">
                        <Star className="w-[11px] h-[11px] text-[#FFD700] fill-[#FFD700]" />
                        <span className="text-[#FFD700] text-[11px] font-semibold">{coach.rating}</span>
                        <span className="text-[#4a4a5a] text-[10px]"> ({coach.reviews})</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Clock className="w-[10px] h-[10px] text-[#00c864]" />
                        <span className="text-[#00c864] text-[10px]">{coach.nextSlot}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c9115f] to-[#cd620e] text-[12px] font-bold">{coach.price}</span>
                    <span className="text-[#c9115f] text-[11px] border border-[rgba(201,17,95,0.4)] rounded-full px-2 py-0.5">View</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky CTA */}
        
      </div>
    </div>
  );
}
