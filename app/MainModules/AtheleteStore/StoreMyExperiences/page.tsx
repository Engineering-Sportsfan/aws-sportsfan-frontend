// 'use client';

// import { useRouter } from 'next/navigation';

// import { ArrowLeft, Calendar, Clock, Timer, QrCode, Video, Star, Gift, MapPin } from 'lucide-react';
// import { useState, useEffect } from 'react';
// import { storeService } from '@/services/store.service';

// type Filter = 'upcoming' | 'today' | 'live' | 'completed' | 'cancelled';

// interface Experience {
//   id: string;
//   title: string;
//   athlete: string;
//   type: 'online' | 'offline';
//   category: string;
//   date: string;
//   time: string;
//   status: Filter;
//   countdown?: string;
//   image: string;
//   price: string;
//   venue?: string;
// }

// const filterLabels: Record<Filter, string> = {
//   upcoming: 'Upcoming',
//   today: 'Today',
//   live: 'Live',
//   completed: 'Completed',
//   cancelled: 'Cancelled',
// };

// const filterColors: Record<Filter, string> = {
//   upcoming: '#c9115f',
//   today: '#cd620e',
//   live: '#00c864',
//   completed: '#6b7280',
//   cancelled: '#ff4444',
// };

// function ExperienceCard({ exp }: { exp: Experience }) {
//   const router = useRouter();
//   const color = filterColors[exp.status];
//   const isLive = exp.status === 'live';
//   const isCompleted = exp.status === 'completed';
//   const isCancelled = exp.status === 'cancelled';

//   return (
//     <div
//       className="bg-[#111116] rounded-[18px] border border-[rgba(255,255,255,0.07)] overflow-hidden active:scale-[0.98] transition-transform cursor-pointer"
//       onClick={() => router.push(`/store/experience/${exp.id}`)}
//     >
//       {/* Image */}
//       <div className="relative h-[130px]">
//         <img src={exp.image} alt={exp.title} className="w-full h-full object-cover" />
//         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />

//         {/* Status badge */}
//         <div
//           className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
//           style={{ background: `${color}22`, border: `1px solid ${color}44` }}
//         >
//           {isLive && <div className="w-[5px] h-[5px] rounded-full animate-pulse" style={{ background: color }} />}
//           <span className="text-[9px] font-black" style={{ color }}>{filterLabels[exp.status].toUpperCase()}</span>
//         </div>

//         {/* Countdown */}
//         {exp.countdown && (
//           <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
//             <Timer className="w-[8px] h-[8px] text-[#FFD700]" />
//             <span className="text-[#FFD700] text-[9px] font-bold">{exp.countdown}</span>
//           </div>
//         )}

//         {/* Type badge */}
//         <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
//           {exp.type === 'online'
//             ? <Video className="w-[8px] h-[8px] text-[#99A1AF]" />
//             : <MapPin className="w-[8px] h-[8px] text-[#99A1AF]" />
//           }
//           <span className="text-[#99A1AF] text-[9px] font-semibold">
//             {exp.type === 'online' ? 'Online' : 'In-Person'}
//           </span>
//         </div>
//       </div>

//       {/* Content */}
//       <div className="p-3.5">
//         <div className="mb-1">
//           <span className="text-[9px] font-bold text-[#cd620e] uppercase tracking-wider">{exp.category}</span>
//         </div>
//         <h3 className="text-white text-[13px] font-black leading-tight mb-1">{exp.title}</h3>
//         <p className="text-[#99A1AF] text-[11px] mb-2.5">{exp.athlete}</p>

//         <div className="flex items-center gap-3 mb-3">
//           <div className="flex items-center gap-1">
//             <Calendar className="w-[10px] h-[10px] text-[#99A1AF]" />
//             <span className="text-[#99A1AF] text-[10px]">{exp.date}</span>
//           </div>
//           <div className="flex items-center gap-1">
//             <Clock className="w-[10px] h-[10px] text-[#99A1AF]" />
//             <span className="text-[#99A1AF] text-[10px]">{exp.time}</span>
//           </div>
//         </div>

//         {/* CTA row */}
//         {!isCancelled && (
//           <div className="flex gap-2 pt-2.5 border-t border-[rgba(255,255,255,0.06)]">
//             {isCompleted ? (
//               <>
//                 <button
//                   onClick={(e) => { e.stopPropagation(); router.push(`/store/experience-memories/${exp.id}`); }}
//                   className="flex-1 py-2 rounded-full text-[11px] font-bold flex items-center justify-center gap-1.5"
//                   style={{ background: 'rgba(201,17,95,0.15)', color: '#c9115f', border: '1px solid rgba(201,17,95,0.3)' }}
//                 >
//                   <Gift className="w-[11px] h-[11px]" /> Memories
//                 </button>
//                 <button className="flex-1 py-2 rounded-full text-[11px] font-bold flex items-center justify-center gap-1.5 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] text-[#99A1AF]">
//                   <Star className="w-[11px] h-[11px] text-[#FFD700]" /> Rate
//                 </button>
//               </>
//             ) : isLive && exp.type === 'online' ? (
//               <button
//                 onClick={(e) => e.stopPropagation()}
//                 className="flex-1 py-2 rounded-full text-[11px] font-black flex items-center justify-center gap-1.5"
//                 style={{ background: 'linear-gradient(90deg,#00c864,#00a050)', color: 'white', boxShadow: '0 0 12px rgba(0,200,100,0.35)' }}
//               >
//                 <div className="w-[6px] h-[6px] rounded-full bg-white animate-pulse" /> Join Session
//               </button>
//             ) : exp.type === 'offline' ? (
//               <button
//                 onClick={(e) => { e.stopPropagation(); router.push(`/MainModules/AtheleteStore/StoreEventPass/${exp.id}`); }}
//                 className="flex-1 py-2 rounded-full text-[11px] font-bold flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#c9115f] to-[#cd620e] text-white"
//               >
//                 <QrCode className="w-[11px] h-[11px]" /> Show Pass
//               </button>
//             ) : (
//               <button className="flex-1 py-2 rounded-full text-[11px] font-bold flex items-center justify-center gap-1.5 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] text-[#99A1AF]">
//                 <Video className="w-[11px] h-[11px]" /> Get Ready
//               </button>
//             )}
//           </div>
//         )}

//         {isCancelled && (
//           <div className="pt-2.5 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between">
//             <span className="text-[#ff4444] text-[11px]">Cancelled</span>
//             <button
//               onClick={(e) => { e.stopPropagation(); router.push('/store/experiences'); }}
//               className="text-[#c9115f] text-[11px] font-semibold"
//             >
//               Rebook →
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default function StoreMyExperiences() {
//   const router = useRouter();
//   const [filter, setFilter] = useState<Filter>('upcoming');
//   const [orders, setOrders] = useState<Experience[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     Promise.all([
//       storeService.getProducts('experiences'),
//       storeService.getUserOrders(userId, 'experiences')
//     ]).then(([products, userOrders]) => {
//       const productMap = new Map(products.map((p: any) => [p.id, p]));
      
//       const mappedOrders = userOrders.map((o: any) => {
//         const product = productMap.get(o.productId) || {};
        
//         const formattedDate = o.eventDate 
//           ? new Date(o.eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
//           : (product.eventStartsAt ? new Date(product.eventStartsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Date TBA');

//         const formattedTime = o.eventDate
//           ? new Date(o.eventDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
//           : (product.eventStartsAt ? new Date(product.eventStartsAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'Time TBA');

//         let computedStatus: Filter = o.status as Filter;
        
//         if (computedStatus === 'upcoming' && o.eventDate) {
//           const eventTime = new Date(o.eventDate).getTime();
//           const now = Date.now();
//           if (eventTime < now) {
//             computedStatus = 'completed';
//           } else if (eventTime - now < 3 * 3600 * 1000 && eventTime - now > -3 * 3600 * 1000) {
//             computedStatus = 'live';
//           } else {
//             const eventDateObj = new Date(o.eventDate);
//             const today = new Date();
//             if (eventDateObj.toDateString() === today.toDateString()) {
//               computedStatus = 'today';
//             }
//           }
//         }

//         return {
//           id: o.orderId,
//           title: o.title || product.title || 'Experience',
//           athlete: product.athlete || 'Athlete',
//           type: product.type || 'offline',
//           category: product.tag || 'Exclusive',
//           date: formattedDate,
//           time: formattedTime,
//           status: computedStatus,
//           countdown: product.countdown || (computedStatus === 'live' ? 'LIVE NOW' : undefined),
//           image: product.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
//           price: o.pricePaise ? `₹${(o.pricePaise / 100).toLocaleString('en-IN')}` : (product.price || '₹0'),
//           venue: product.venue || 'Venue details in details',
//         };
//       });
      
//       setOrders(mappedOrders);
//       setLoading(false);
//     }).catch(err => {
//       console.error('Error loading my experiences:', err);
//       setLoading(false);
//     });
//   }, []);

//   const filtered = orders.filter((e) => e.status === filter);
//   const liveBadgeCount = orders.filter((e) => e.status === 'live').length;
//   const todayBadgeCount = orders.filter((e) => e.status === 'today').length;

//   return (
//     <div className="bg-black w-full flex justify-center" style={{ height: '100dvh', overflow: 'hidden' }}>
//       <div className="w-full max-w-[390px] bg-[#0b0b0f] flex flex-col" style={{ height: '100dvh' }}>
//         {/* Header */}
//         <div className="sticky top-0 z-50 bg-[#0b0b0f] border-b border-[rgba(255,255,255,0.05)]">
//           <div className="h-[56px] flex items-center px-4 gap-3">
//             <button
//               onClick={() => router.push('/MainModules/AtheleteStore')}
//               className="w-[36px] h-[36px] rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center"
//             >
//               <ArrowLeft className="w-[18px] h-[18px] text-white" />
//             </button>
//             <h1 className="text-white font-black text-[17px]">My Experiences</h1>
//           </div>

//           {/* Filter pills */}
//           <div className="flex px-4 pb-3 gap-1.5 overflow-x-auto no-scrollbar">
//             {(Object.keys(filterLabels) as Filter[]).map((f) => {
//               const isActive = filter === f;
//               const color = filterColors[f];
//               const badge = f === 'live' ? liveBadgeCount : f === 'today' ? todayBadgeCount : 0;
//               return (
//                 <button
//                   key={f}
//                   onClick={() => setFilter(f)}
//                   className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold capitalize transition-all`}
//                   style={isActive
//                     ? { background: `linear-gradient(90deg,${color},${color}cc)`, color: 'white', boxShadow: `0 0 10px ${color}40` }
//                     : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#99A1AF' }
//                   }
//                 >
//                   {filterLabels[f]}
//                   {badge > 0 && (
//                     <span
//                       className="w-[14px] h-[14px] rounded-full flex items-center justify-center text-[8px] font-black text-white"
//                       style={{ background: color }}
//                     >
//                       {badge}
//                     </span>
//                   )}
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         {/* Content */}
//         <div className="flex-1 overflow-y-auto pb-[70px] no-scrollbar px-4 pt-4">
//           {loading ? (
//             <p className="text-center text-[#99A1AF] text-[12px] py-10">Loading experiences...</p>
//           ) : filtered.length === 0 ? (
//             <div className="flex flex-col items-center justify-center py-16 text-center">
//               <div className="w-[64px] h-[64px] rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center mb-4">
//                 <Calendar className="w-[28px] h-[28px] text-[#4a4a5a]" />
//               </div>
//               <p className="text-white text-[15px] font-bold mb-1">No {filterLabels[filter]} Experiences</p>
//               <p className="text-[#99A1AF] text-[12px] mb-6">Discover and book premium athlete experiences</p>
//               <button
//                 onClick={() => router.push('/store/experiences')}
//                 className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#c9115f] to-[#cd620e] text-white text-[13px] font-bold"
//               >
//                 Explore Experiences
//               </button>
//             </div>
//           ) : (
//             <div className="flex flex-col gap-3">
//               {filtered.map((exp) => <ExperienceCard key={exp.id} exp={exp} />)}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }




'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Timer, QrCode, Video, Star, Gift, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { storeService } from '@/services/store.service';
import { useAuth } from '@/context/AuthContext';

type Filter = 'upcoming' | 'today' | 'live' | 'completed' | 'cancelled';

interface Experience {
  id: string;
  title: string;
  athlete: string;
  type: 'online' | 'offline';
  category: string;
  date: string;
  time: string;
  status: Filter;
  countdown?: string;
  image: string;
  price: string;
  venue?: string;
}

const filterLabels: Record<Filter, string> = {
  upcoming: 'Upcoming',
  today: 'Today',
  live: 'Live',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const filterColors: Record<Filter, string> = {
  upcoming: '#c9115f',
  today: '#cd620e',
  live: '#00c864',
  completed: '#6b7280',
  cancelled: '#ff4444',
};

function ExperienceCard({ exp }: { exp: Experience }) {
  const router = useRouter();
  const color = filterColors[exp.status];
  const isLive = exp.status === 'live';
  const isCompleted = exp.status === 'completed';
  const isCancelled = exp.status === 'cancelled';

  return (
    <div
      className="bg-[#111116] rounded-[18px] border border-[rgba(255,255,255,0.07)] overflow-hidden active:scale-[0.98] transition-transform cursor-pointer"
      onClick={() => router.push(`/MainModules/AtheleteStore/StoreExperience/${exp.id}`)}
    >
      {/* Image */}
      <div className="relative h-[130px]">
        <img src={exp.image} alt={exp.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />

        {/* Status badge */}
        <div
          className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{ background: `${color}22`, border: `1px solid ${color}44` }}
        >
          {isLive && <div className="w-[5px] h-[5px] rounded-full animate-pulse" style={{ background: color }} />}
          <span className="text-[9px] font-black" style={{ color }}>{filterLabels[exp.status].toUpperCase()}</span>
        </div>

        {/* Countdown */}
        {exp.countdown && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
            <Timer className="w-[8px] h-[8px] text-[#FFD700]" />
            <span className="text-[#FFD700] text-[9px] font-bold">{exp.countdown}</span>
          </div>
        )}

        {/* Type badge */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
          {exp.type === 'online'
            ? <Video className="w-[8px] h-[8px] text-[#99A1AF]" />
            : <MapPin className="w-[8px] h-[8px] text-[#99A1AF]" />
          }
          <span className="text-[#99A1AF] text-[9px] font-semibold">
            {exp.type === 'online' ? 'Online' : 'In-Person'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5">
        <div className="mb-1">
          <span className="text-[9px] font-bold text-[#cd620e] uppercase tracking-wider">{exp.category}</span>
        </div>
        <h3 className="text-white text-[13px] font-black leading-tight mb-1">{exp.title}</h3>
        <p className="text-[#99A1AF] text-[11px] mb-2.5">{exp.athlete}</p>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="w-[10px] h-[10px] text-[#99A1AF]" />
            <span className="text-[#99A1AF] text-[10px]">{exp.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-[10px] h-[10px] text-[#99A1AF]" />
            <span className="text-[#99A1AF] text-[10px]">{exp.time}</span>
          </div>
        </div>

        {/* CTA row */}
        {!isCancelled && (
          <div className="flex gap-2 pt-2.5 border-t border-[rgba(255,255,255,0.06)]">
            {isCompleted ? (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); router.push(`/store/experience-memories/${exp.id}`); }}
                  className="flex-1 py-2 rounded-full text-[11px] font-bold flex items-center justify-center gap-1.5"
                  style={{ background: 'rgba(201,17,95,0.15)', color: '#c9115f', border: '1px solid rgba(201,17,95,0.3)' }}
                >
                  <Gift className="w-[11px] h-[11px]" /> Memories
                </button>
                <button className="flex-1 py-2 rounded-full text-[11px] font-bold flex items-center justify-center gap-1.5 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] text-[#99A1AF]">
                  <Star className="w-[11px] h-[11px] text-[#FFD700]" /> Rate
                </button>
              </>
            ) : isLive && exp.type === 'online' ? (
              <button
                onClick={(e) => e.stopPropagation()}
                className="flex-1 py-2 rounded-full text-[11px] font-black flex items-center justify-center gap-1.5"
                style={{ background: 'linear-gradient(90deg,#00c864,#00a050)', color: 'white', boxShadow: '0 0 12px rgba(0,200,100,0.35)' }}
              >
                <div className="w-[6px] h-[6px] rounded-full bg-white animate-pulse" /> Join Session
              </button>
            ) : exp.type === 'offline' ? (
              <button
                onClick={(e) => { e.stopPropagation(); router.push(`/MainModules/AtheleteStore/StoreEventPass/${exp.id}`); }}
                className="flex-1 py-2 rounded-full text-[11px] font-bold flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#c9115f] to-[#cd620e] text-white"
              >
                <QrCode className="w-[11px] h-[11px]" /> Show Pass
              </button>
            ) : (
              <button className="flex-1 py-2 rounded-full text-[11px] font-bold flex items-center justify-center gap-1.5 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] text-[#99A1AF]">
                <Video className="w-[11px] h-[11px]" /> Get Ready
              </button>
            )}
          </div>
        )}

        {isCancelled && (
          <div className="pt-2.5 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between">
            <span className="text-[#ff4444] text-[11px]">Cancelled</span>
            <button
              onClick={(e) => { e.stopPropagation(); router.push('/store/experiences'); }}
              className="text-[#c9115f] text-[11px] font-semibold"
            >
              Rebook →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StoreMyExperiences() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.userId || user?.email || '';
  const [filter, setFilter] = useState<Filter>('upcoming');
  const [orders, setOrders] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setLoading(true);
        const products = await storeService.getProducts('experiences');
        const userOrders = userId ? await storeService.getUserOrders(userId) : []; // ✅ Only pass userId
        
        const productMap = new Map(products.map((p: any) => [p.id, p]));
        
        const mappedOrders = userOrders.map((o: any) => {
          const product = productMap.get(o.productId) || {};
          
          const formattedDate = o.eventDate 
            ? new Date(o.eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            : (product.eventStartsAt ? new Date(product.eventStartsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Date TBA');

          const formattedTime = o.eventDate
            ? new Date(o.eventDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
            : (product.eventStartsAt ? new Date(product.eventStartsAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'Time TBA');

          let computedStatus: Filter = o.status as Filter;
          
          if (computedStatus === 'upcoming' && o.eventDate) {
            const eventTime = new Date(o.eventDate).getTime();
            const now = Date.now();
            if (eventTime < now) {
              computedStatus = 'completed';
            } else if (eventTime - now < 3 * 3600 * 1000 && eventTime - now > -3 * 3600 * 1000) {
              computedStatus = 'live';
            } else {
              const eventDateObj = new Date(o.eventDate);
              const today = new Date();
              if (eventDateObj.toDateString() === today.toDateString()) {
                computedStatus = 'today';
              }
            }
          }

          return {
            id: o.orderId || o.id,
            title: o.title || product.title || 'Experience',
            athlete: product.athlete || 'Athlete',
            type: product.type || 'offline',
            category: product.tag || 'Exclusive',
            date: formattedDate,
            time: formattedTime,
            status: computedStatus,
            countdown: product.countdown || (computedStatus === 'live' ? 'LIVE NOW' : undefined),
            image: product.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
            price: o.pricePaise ? `₹${(o.pricePaise / 100).toLocaleString('en-IN')}` : (product.price || '₹0'),
            venue: product.venue || 'Venue details in details',
          };
        });
        
        setOrders(mappedOrders);
      } catch (err) {
        console.error('Error loading my experiences:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, [userId]);

  const filtered = orders.filter((e) => e.status === filter);
  const liveBadgeCount = orders.filter((e) => e.status === 'live').length;
  const todayBadgeCount = orders.filter((e) => e.status === 'today').length;

  return (
    <div className="bg-black w-full flex justify-center" style={{ height: '100dvh', overflow: 'hidden' }}>
      <div className="w-full max-w-[390px] bg-[#0b0b0f] flex flex-col" style={{ height: '100dvh' }}>
        {/* Header */}
        <div className="sticky top-0 z-50 bg-[#0b0b0f] border-b border-[rgba(255,255,255,0.05)]">
          <div className="h-[56px] flex items-center px-4 gap-3">
            <button
              onClick={() => router.push('/MainModules/AtheleteStore')}
              className="w-[36px] h-[36px] rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center"
            >
              <ArrowLeft className="w-[18px] h-[18px] text-white" />
            </button>
            <h1 className="text-white font-black text-[17px]">My Experiences</h1>
          </div>

          {/* Filter pills */}
          <div className="flex px-4 pb-3 gap-1.5 overflow-x-auto no-scrollbar">
            {(Object.keys(filterLabels) as Filter[]).map((f) => {
              const isActive = filter === f;
              const color = filterColors[f];
              const badge = f === 'live' ? liveBadgeCount : f === 'today' ? todayBadgeCount : 0;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold capitalize transition-all`}
                  style={isActive
                    ? { background: `linear-gradient(90deg,${color},${color}cc)`, color: 'white', boxShadow: `0 0 10px ${color}40` }
                    : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#99A1AF' }
                  }
                >
                  {filterLabels[f]}
                  {badge > 0 && (
                    <span
                      className="w-[14px] h-[14px] rounded-full flex items-center justify-center text-[8px] font-black text-white"
                      style={{ background: color }}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-[70px] no-scrollbar px-4 pt-4">
          {loading ? (
            <p className="text-center text-[#99A1AF] text-[12px] py-10">Loading experiences...</p>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-[64px] h-[64px] rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center mb-4">
                <Calendar className="w-[28px] h-[28px] text-[#4a4a5a]" />
              </div>
              <p className="text-white text-[15px] font-bold mb-1">No {filterLabels[filter]} Experiences</p>
              <p className="text-[#99A1AF] text-[12px] mb-6">Discover and book premium athlete experiences</p>
              <button
                onClick={() => router.push('/MainModules/AtheleteStore/StoreExperiences')}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#c9115f] to-[#cd620e] text-white text-[13px] font-bold"
              >
                Explore Experiences
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((exp) => <ExperienceCard key={exp.id} exp={exp} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}