import { useNavigate } from 'react-router';
import { ArrowLeft, Search, Star, Clock, Bookmark } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CoachBadge } from './Store';
import { storeService } from '@/services/store.service';
import { formatPrice } from '@/utils/formatters';

const filterChips = ['Availability', 'Price', 'Rating', 'Experience', 'Language'];
const serviceTypes = ['Marathon', 'Sprint', 'Strength', 'Recovery', 'IronMan', '5K to Ultra'];

export default function StoreCoachListing() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedServiceType, setSelectedServiceType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedCoaches, setSavedCoaches] = useState<string[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCoaches = async () => {
    setLoading(true);
    try {
      const allProducts = await storeService.getProducts('coaches');
      setCoaches(allProducts);
      
      const wishlist = await storeService.getWishlist('mock-user-123');
      setSavedCoaches(wishlist.map(item => item.productId || item.id));
    } catch (err) {
      console.error('Error loading coaches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoaches();
  }, []);

  const toggleSave = async (coachId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isWishlisted = savedCoaches.includes(coachId);
    const action = isWishlisted ? 'remove' : 'add';
    try {
      await storeService.toggleWishlist('mock-user-123', coachId, action);
      if (isWishlisted) {
        setSavedCoaches(prev => prev.filter(id => id !== coachId));
      } else {
        setSavedCoaches(prev => [...prev, coachId]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCoaches = coaches
    .filter(coach => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = coach.name?.toLowerCase().includes(query);
        const matchesTitle = coach.title?.toLowerCase().includes(query);
        const matchesRole = coach.role?.toLowerCase().includes(query);
        const matchesTagline = coach.tagline?.toLowerCase().includes(query);
        const matchesAbout = coach.about?.toLowerCase().includes(query);
        if (!matchesName && !matchesTitle && !matchesRole && !matchesTagline && !matchesAbout) {
          return false;
        }
      }

      // 2. Service Type
      if (selectedServiceType) {
        const query = selectedServiceType.toLowerCase();
        const specializations = coach.specializations || [];
        const hasSpec = specializations.some((s: string) => s.toLowerCase().includes(query));
        const inServices = coach.services?.some((svc: any) => svc.title?.toLowerCase().includes(query) || svc.desc?.toLowerCase().includes(query));
        const inTitle = coach.title?.toLowerCase().includes(query) || coach.role?.toLowerCase().includes(query);
        const inTagline = coach.tagline?.toLowerCase().includes(query);
        if (!hasSpec && !inServices && !inTitle && !inTagline) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      // 3. Active Filters (Sorting)
      if (activeFilter === 'Price') {
        return (a.pricePaise || 0) - (b.pricePaise || 0); // Price: Low to High
      }
      if (activeFilter === 'Rating') {
        return (b.rating || 0) - (a.rating || 0); // Rating: High to Low
      }
      if (activeFilter === 'Experience') {
        const expA = parseInt(a.experience) || 0;
        const expB = parseInt(b.experience) || 0;
        return expB - expA; // Experience: High to Low
      }
      if (activeFilter === 'Availability') {
        // Coaches with active slots show first
        const slotsA = a.slots?.length || 0;
        const slotsB = b.slots?.length || 0;
        return slotsB - slotsA;
      }
      return 0; // Default order
    });

  return (
    <div className="bg-black w-full flex justify-center min-h-screen">
      <div className="w-full max-w-[390px] bg-[#0b0b0f] relative flex flex-col min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-[#0b0b0f] border-b border-[rgba(255,255,255,0.05)]">
          <div className="h-[56px] flex items-center px-4 gap-3">
            <button
              onClick={() => navigate('/store')}
              className="w-[36px] h-[36px] rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center"
            >
              <ArrowLeft className="w-[18px] h-[18px] text-white" />
            </button>
            <div className="flex-1">
              <h1 className="text-white font-bold text-[17px]">Coaches</h1>
              <p className="text-[#99A1AF] text-[11px]">Qualified athletic instructors</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[13px] h-[13px] text-[#99A1AF]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, sport, specialty..."
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-full pl-9 pr-4 py-2 text-white text-[12px] placeholder:text-[#99A1AF] focus:outline-none focus:border-[rgba(201,17,95,0.5)]"
              />
            </div>
          </div>

          {/* Service Type chips */}
          <div className="flex gap-2 px-4 pb-2.5 overflow-x-auto no-scrollbar">
            {serviceTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedServiceType(selectedServiceType === type ? null : type)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all"
                style={{
                  background: selectedServiceType === type ? 'rgba(201,17,95,0.18)' : 'rgba(255,255,255,0.04)',
                  borderColor: selectedServiceType === type ? '#c9115f' : 'rgba(255,255,255,0.08)',
                  color: selectedServiceType === type ? '#c9115f' : '#99A1AF',
                }}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
            {filterChips.map((chip) => (
              <button
                key={chip}
                onClick={() => setActiveFilter(activeFilter === chip ? null : chip)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all"
                style={{
                  background: activeFilter === chip ? 'rgba(201,17,95,0.1)' : 'rgba(255,255,255,0.04)',
                  borderColor: activeFilter === chip ? '#c9115f' : 'rgba(255,255,255,0.08)',
                  color: activeFilter === chip ? '#c9115f' : '#99A1AF',
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Coach Cards */}
        <div className="flex-1 overflow-y-auto pb-[70px] no-scrollbar">
          {loading ? (
            <p className="text-center text-[#99A1AF] text-[12px] py-10">Loading coaches...</p>
          ) : filteredCoaches.length === 0 ? (
            <p className="text-center text-[#99A1AF] text-[12px] py-10">No coaches found.</p>
          ) : (
            <div className="flex flex-col gap-3 px-4 pt-4">
              {filteredCoaches.map((coach) => (
                <div
                  key={coach.id}
                  className="w-full bg-[#111116] rounded-[18px] border border-[rgba(255,255,255,0.07)] overflow-hidden text-left active:scale-[0.98] transition-transform cursor-pointer"
                  onClick={() => navigate(`/store/coach/${coach.coachId || '1'}${selectedServiceType ? `?serviceType=${selectedServiceType}` : ''}`)}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-[60px] h-[60px] rounded-[14px] overflow-hidden bg-[#1a1a1f]">
                          <img src={coach.image} alt={coach.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-[18px] h-[18px] rounded-full bg-[#c9115f] flex items-center justify-center border-2 border-[#111116]">
                          <span className="text-white text-[8px] font-bold">✓</span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-[15px] font-bold">{coach.name}</p>
                            <p className="text-[#99A1AF] text-[12px]">{coach.title || 'Distance Running'}</p>
                            <div className="mt-1">
                              <CoachBadge type={coach.sourcing_model || 'independent'} />
                            </div>
                          </div>
                          <button
                            onClick={(e) => toggleSave(coach.id, e)}
                            className="w-[32px] h-[32px] rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center flex-shrink-0 ml-2"
                          >
                            <Bookmark
                              className="w-[14px] h-[14px]"
                              style={{ color: savedCoaches.includes(coach.id) ? '#c9115f' : '#99A1AF', fill: savedCoaches.includes(coach.id) ? '#c9115f' : 'none' }}
                            />
                          </button>
                        </div>

                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="flex items-center gap-1">
                            <Star className="w-[11px] h-[11px] text-[#FFD700] fill-[#FFD700]" />
                            <span className="text-[#FFD700] text-[11px] font-semibold">{coach.rating || 4.8}</span>
                            <span className="text-[#4a4a5a] text-[10px]">({coach.reviews || 100})</span>
                          </div>
                          <span className="text-[#4a4a5a] text-[10px]">•</span>
                          <span className="text-[#99A1AF] text-[11px]">{coach.experience || '12 yrs exp'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom row */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-[12px] h-[12px] text-[#00c864]" />
                        <span className="text-[#00c864] text-[11px] font-semibold">Available {coach.nextSlot || 'Today'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c9115f] to-[#cd620e] text-[13px] font-bold">{formatPrice(coach.pricePaise)}</span>
                        <span className="bg-gradient-to-r from-[#c9115f] to-[#cd620e] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-[0_0_10px_rgba(201,17,95,0.35)]">
                          Book Now
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
