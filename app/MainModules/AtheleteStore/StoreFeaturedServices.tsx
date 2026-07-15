import { useNavigate } from 'react-router';
import { ArrowLeft, ChevronRight } from 'lucide-react';

const featuredServices = [
  {
    id: 1,
    title: 'Long Jump Coaching',
    subtitle: 'Master your technique',
    price: '₹2,499',
    image: 'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=400&h=240&fit=crop&auto=format',
    tag: 'Popular',
    tagColor: '#c9115f',
    description: 'Work with world-class long jump specialists to perfect your approach, takeoff, and landing. Suitable for all levels from school athletes to national competitors.',
    duration: '60–90 min sessions',
    coaches: 4,
  },
  {
    id: 2,
    title: 'Javelin Coaching',
    subtitle: 'Olympic-level training',
    price: '₹3,299',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=240&fit=crop&auto=format',
    tag: 'Featured',
    tagColor: '#cd620e',
    description: 'Learn the biomechanics of elite javelin throwing from certified coaches with national and international competition experience.',
    duration: '75 min sessions',
    coaches: 3,
  },
  {
    id: 3,
    title: 'Sprint Coaching',
    subtitle: 'Speed & explosiveness',
    price: '₹1,999',
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=240&fit=crop&auto=format',
    tag: 'New',
    tagColor: '#00c864',
    description: 'Improve your acceleration, top-end speed, and race mechanics with proven sprint drills and personalized feedback.',
    duration: '60 min sessions',
    coaches: 5,
  },
  {
    id: 4,
    title: 'Sports Nutrition',
    subtitle: 'Fuel your performance',
    price: '₹1,499',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=240&fit=crop&auto=format',
    tag: 'Trending',
    tagColor: '#c9115f',
    description: 'Get a personalized nutrition plan from certified sports dietitians. Covers pre-training, competition fueling, and recovery nutrition.',
    duration: '45–60 min sessions',
    coaches: 3,
  },
  {
    id: 5,
    title: 'Strength & Conditioning',
    subtitle: 'Build athletic power',
    price: '₹2,199',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=240&fit=crop&auto=format',
    tag: 'Popular',
    tagColor: '#c9115f',
    description: 'Structured strength and conditioning programs designed specifically for track and field athletes. Focus on power, explosiveness, and injury prevention.',
    duration: '60–75 min sessions',
    coaches: 4,
  },
  {
    id: 6,
    title: 'Recovery & Mobility',
    subtitle: 'Stay at peak performance',
    price: '₹999',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=240&fit=crop&auto=format',
    tag: 'New',
    tagColor: '#00c864',
    description: 'Expert-guided recovery sessions combining yoga, foam rolling, and mobility work to keep you training harder and recovering faster.',
    duration: '45 min sessions',
    coaches: 3,
  },
];

export default function StoreFeaturedServices() {
  const navigate = useNavigate();

  return (
    <div className="bg-black w-full flex justify-center min-h-screen">
      <div className="w-full max-w-[390px] bg-[#0b0b0f] relative flex flex-col min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-[#0b0b0f] border-b border-[rgba(255,255,255,0.05)] h-[56px] flex items-center px-4 gap-3">
          <button
            onClick={() => navigate('/store')}
            className="w-[36px] h-[36px] rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center"
          >
            <ArrowLeft className="w-[18px] h-[18px] text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-bold text-[17px]">Featured Services</h1>
            <p className="text-[#99A1AF] text-[11px]">{featuredServices.length} services available</p>
          </div>
        </div>

        {/* Cards */}
        <div className="flex-1 overflow-y-auto pb-6 no-scrollbar">
          <div className="flex flex-col gap-4 px-4 pt-4">
            {featuredServices.map((service) => (
              <button
                key={service.id}
                className="w-full bg-[#111116] rounded-[18px] overflow-hidden border border-[rgba(255,255,255,0.08)] text-left active:scale-[0.98] transition-transform"
                onClick={() => navigate(`/store/service/${service.id}`)}
              >
                <div className="relative h-[140px]">
                  <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111116] via-[rgba(17,17,22,0.3)] to-transparent" />
                  <div
                    className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-white text-[10px] font-bold"
                    style={{ backgroundColor: service.tagColor }}
                  >
                    {service.tag}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-white text-[15px] font-bold">{service.title}</p>
                      <p className="text-[#99A1AF] text-[12px] mt-0.5">{service.subtitle}</p>
                    </div>
                    <p className="text-transparent bg-clip-text bg-gradient-to-r from-[#c9115f] to-[#cd620e] text-[15px] font-bold flex-shrink-0">From {service.price}</p>
                  </div>
                  <p className="text-[#99A1AF] text-[12px] mt-2 leading-relaxed line-clamp-2">{service.description}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                    <div className="flex items-center gap-3">
                      <span className="text-[#99A1AF] text-[11px]">⏱ {service.duration}</span>
                      <span className="text-[#99A1AF] text-[11px]">👤 {service.coaches} coaches</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-[#c9115f] text-[12px] font-semibold">
                      View <ChevronRight className="w-[13px] h-[13px]" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
