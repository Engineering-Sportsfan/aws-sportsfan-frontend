// \MainModules\AtheleteStore\page.tsx

'use client';


import {
    Bell, Star, User, Search, Store, Trophy, Tv, Gamepad2,
    ChevronRight, MapPin, Loader2, CheckCircle2, Sparkles,
    Ticket, Gavel, Users, Gem, ShoppingBag, BookOpen, Award, Cpu,
    MessageSquare, Timer, Zap, ArrowUpRight, Flame, Tag, TrendingUp,
    Shield, Clock, ChevronDown, Video, Mic, Heart,
    Package
} from 'lucide-react';
import { useState, useEffect } from 'react';
import MaskGroup from '@/src/components/CommonComponent/MaskGroup/MaskGroup';
import { storeService } from '@/services/store.service';
import { formatPrice } from '@/utils/formatters';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function SourcingModelBadge({ type }: { type: 'afi' | 'afi_affiliated' | 'independent' }) {
    if (type === 'afi' || type === 'afi_affiliated') {
        return (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border border-[#c9115f] text-[#c9115f]">
                AFI-Affiliated
            </span>
        );
    }
    return (
        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border border-[#6b7280] text-[#6b7280]">
            Independent Coach
        </span>
    );
}

export const CoachBadge = SourcingModelBadge;

const categories = [
    { key: 'coaches', label: 'Coaches', icon: Users, route: '/MainModules/AtheleteStore/StoreCoachListing', color: '#c9115f', bg: 'rgba(201,17,95,0.12)' },
    { key: 'experiences', label: 'Experiences', icon: Ticket, route: '/MainModules/AtheleteStore/StoreExperiences', color: '#cd620e', bg: 'rgba(205,98,14,0.12)' },
    { key: 'events', label: 'Events', icon: Trophy, route: '/MainModules/AtheleteStore/StoreTicketedEvents', color: '#FFD700', bg: 'rgba(255,215,0,0.10)' },
    { key: 'auctions', label: 'Auctions', icon: Gavel, route: '/MainModules/AtheleteStore/StoreAuctions', color: '#ff4444', bg: 'rgba(255,68,68,0.12)' },
    { key: 'athletes', label: 'Athletes', icon: Zap, route: '/MainModules/AtheleteStore/StoreAthelete', color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)' },
    { key: 'memorabilia', label: 'Merch', icon: Gem, route: '/MainModules/AtheleteStore/StoreMemorabilia', color: '#d97706', bg: 'rgba(217,119,6,0.12)' },
    { key: 'brands', label: 'Brands', icon: ShoppingBag, route: '/MainModules/AtheleteStore/StoreBrands', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
    { key: 'digital', label: 'Digital', icon: BookOpen, route: '/MainModules/AtheleteStore/StoreDigital', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    { key: 'memberships', label: 'Members', icon: Award, route: '/MainModules/AtheleteStore/StoreMemberships', color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
    { key: 'dolly', label: 'AI Dolly', icon: Cpu, route: '/MainModules/AtheleteStore/StoreDolly', color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
];

const flashDeals = [
    { label: '40% off Nike', color: '#c9115f', bg: 'rgba(201,17,95,0.12)', route: '/MainModules/AtheleteStore/StoreBrands' },
    { label: 'Free Coach Session', color: '#00c864', bg: 'rgba(0,200,100,0.12)', route: '/MainModules/AtheleteStore/StoreCoachListing' },
    { label: 'New Digital Programs', color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)', route: '/MainModules/AtheleteStore/StoreDigital' },
    { label: '3 Live Auctions', color: '#ff4444', bg: 'rgba(255,68,68,0.12)', route: '/MainModules/AtheleteStore/StoreAuctions' },
    { label: 'Elite ₹799/mo', color: '#ec4899', bg: 'rgba(236,72,153,0.12)', route: '/MainModules/AtheleteStore/StoreMemberships' },
];

export const asianGamesEvents = [
    {
        id: 'virtual-breakfast',
        title: 'Virtual Breakfast',
        subtitle: 'Parul Chaudhary & Avinash Sable',
        type: 'virtual',
        dates: 'Oct 6–12, 2025',
        price: 1599,
        seats: 60,
        seatsLeft: 28,
        badge: 'SELLING FAST',
        badgeColor: '#ff4444',
        description: 'Well-produced online video session.',
        icon: Video,
        color: '#0ea5e9',
        bg: 'rgba(14,165,233,0.1)',
        img: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=240&fit=crop&auto=format',
    },
];

const brands = [
    { name: 'Nike', discount: '40% off', color: '#ff6b35', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=60&fit=crop&auto=format' },
    { name: 'Puma', discount: '30% off', color: '#00c864', img: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=80&h=60&fit=crop&auto=format' },
];

function SectionHeader({ title, icon: Icon, color, onSeeAll }: { title: string; icon: React.ElementType; color: string; onSeeAll?: () => void }) {
    return (
        <div className="flex items-center justify-between px-4 mb-3">
            <div className="flex items-center gap-2">
                <Icon className="w-[14px] h-[14px]" style={{ color }} />
                <span className="text-white text-[15px] font-black">{title}</span>
            </div>
            {onSeeAll && (
                <button onClick={onSeeAll} className="flex items-center gap-0.5 text-[11px] font-bold" style={{ color }}>
                    See all <ChevronRight className="w-[12px] h-[12px]" />
                </button>
            )}
        </div>
    );
}

export default function StoreScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const userId = user?.userId || user?.email || '';

    const resolveRoute = (category: string, productId?: string) => {
        if (category === 'coaches') {
            return `/MainModules/AtheleteStore/StoreCoachProfile/${productId?.replace('coach-', '') || '1'}`;
        }
        const routes: Record<string, string> = {
            experiences: '/MainModules/AtheleteStore/StoreExperiences',
            events: '/MainModules/AtheleteStore/StoreTicketedEvents',
            auctions: '/MainModules/AtheleteStore/StoreAuctions',
            athletes: '/MainModules/AtheleteStore/StoreAthelete',
            memorabilia: '/MainModules/AtheleteStore/StoreMemorabilia',
            brands: '/MainModules/AtheleteStore/StoreBrands',
            digital: '/MainModules/AtheleteStore/StoreDigital',
            memberships: '/MainModules/AtheleteStore/StoreMemberships',
            dolly: '/MainModules/AtheleteStore/StoreDolly',
            wallet: '/MainModules/AtheleteStore/StoreWallet',
            'session-requests': '/MainModules/AtheleteStore/StoreSessionRequests',
            coaches_listing: '/MainModules/AtheleteStore/StoreCoachListing',
            ticketed_events: '/MainModules/AtheleteStore/StoreTicketedEvents',
        };
        return routes[category] || '/MainModules/AtheleteStore';
    };
    const [locationState, setLocationState] = useState<'fetching' | 'saved'>('fetching');
    const [coins, setCoins] = useState<number>(250);

    // Live collections
    const [coaches, setCoaches] = useState<any[]>([]);
    const [auctions, setAuctions] = useState<any[]>([]);
    const [trending, setTrending] = useState<any[]>([]);
    const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
    const [wishlist, setWishlist] = useState<any[]>([]);

    const loadData = async () => {
        try {
            const allProducts = await storeService.getProducts();

            // Filter coaches
            const coachList = allProducts.filter(p => p.category === 'coaches');
            setCoaches(coachList);

            // Filter memorabilia
            const memorabiliaList = allProducts.filter(p => p.category === 'memorabilia');
            setAuctions(memorabiliaList);

            // Filter other trending items
            const trendingList = allProducts.filter(p => p.category !== 'coaches');
            setTrending(trendingList);

            // Fetch user coins, wishlist, recently viewed
            if (userId) {
                const [coinsRes, wishlistRes, recentRes] = await Promise.all([
                    storeService.getCoinsBalance(userId),
                    storeService.getWishlist(userId),
                    storeService.getRecentlyViewed(userId),
                ]);

                setCoins(coinsRes.balance);
                setWishlist(wishlistRes);
                setRecentlyViewed(recentRes);
            }
        } catch (err) {
            console.error('Error loading store data:', err);
        }
    };

    useEffect(() => {
        const t = setTimeout(() => setLocationState('saved'), 1600);
        loadData();
        return () => clearTimeout(t);
    }, [userId]);

    const handleProductClick = async (productId: string, route: string) => {
        try {
            if (userId) {
                await storeService.addRecentlyViewed(userId, productId);
            }
        } catch (e) {
            console.error(e);
        }
        router.push(route);
    };

    const handleWishlistToggle = async (productId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!userId) return;
        const isWishlisted = wishlist.some(item => item.productId === productId || item.id === productId);
        const action = isWishlisted ? 'remove' : 'add';
        try {
            await storeService.toggleWishlist(userId, productId, action);
            const updated = await storeService.getWishlist(userId);
            setWishlist(updated);
        } catch (err) {
            console.error(err);
        }
    };

    const isProductWishlisted = (productId: string) => {
        return wishlist.some(item => item.productId === productId || item.id === productId);
    };

    return (
        <div className="bg-black w-full flex justify-center min-h-screen">
            <div className="w-full max-w-6xl bg-[#0b0b0f] relative flex flex-col min-h-screen">

                {/* Header */}
                {/* <div className="sticky top-0 left-0 right-0 z-50 bg-[#0b0b0f] border-b border-[rgba(255,255,255,0.05)] h-[56px] flex items-center justify-between px-4 gap-2">
                        <div className="flex items-center flex-shrink-0">
                        <div className="relative w-[28px] h-[36px]">
                        <MaskGroup />
                        </div>
                    </div>
                    <div className="flex-1 max-w-[190px]">
                        <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#99A1AF]" />
                        <input
                            type="text"
                            placeholder="Search store..."
                            className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-full pl-9 pr-9 py-1.5 text-white text-[13px] placeholder:text-[#99A1AF] focus:outline-none focus:border-[rgba(201,17,95,0.5)]"
                        />
                        <button
                            onClick={() => router.push('/ask-ai')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-[24px] h-[24px] rounded-full bg-gradient-to-r from-[#FF7A00] to-[#FF4DA6] flex items-center justify-center shadow-[0_0_12px_rgba(255,122,0,0.4)]"
                        >
                            <Sparkles className="w-[12px] h-[12px] text-white" />
                        </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-[6px]">
                        <button
                        onClick={() => router.push(resolveRoute('wallet'))}
                        className="flex items-center gap-[4px] bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] rounded-full px-[8px] py-[4px]"
                        >
                        <Star className="w-[12px] h-[12px] text-[#FFD700] fill-[#FFD700]" />
                        <span className="text-white font-semibold text-[11px] leading-none">{coins}</span>
                        </button>
                        <button className="relative bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] rounded-full p-[6px]">
                        <Bell className="w-[14px] h-[14px] text-white" />
                        <div className="absolute -top-[2px] -right-[2px] bg-[#ff0055] rounded-full w-[14px] h-[14px] flex items-center justify-center">
                            <span className="text-white text-[8px] font-bold">3</span>
                        </div>
                        </button>
                        <button className="flex items-center justify-center w-[28px] h-[28px] bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] rounded-full">
                        <User className="w-[14px] h-[14px] text-white" />
                        </button>
                    </div>
                    </div> */}

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto pb-[70px] no-scrollbar">

                    {/* Title + Location + My Orders */}
                    <div className="px-4 pt-4 pb-3 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <h1 className="text-white text-[22px] font-black tracking-tight">Sports Store</h1>
                                {locationState === 'saved' && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-[10px] h-[10px] text-[#00c864]" />
                                        <span className="text-[#00c864] text-[10px] font-semibold">Bengaluru</span>
                                    </div>
                                )}
                                {locationState === 'fetching' && (
                                    <Loader2 className="w-[10px] h-[10px] text-[#4a4a5a] animate-spin" />
                                )}
                            </div>
                            <p className="text-[#4a4a5a] text-[11px]">Marketplace · Firestore Active</p>
                        </div>
                        <button
                            onClick={() => router.push('/MainModules/AtheleteStore/StoreMyBookings')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold text-[#c9115f]"
                            style={{ background: 'rgba(201,17,95,0.1)', border: '1px solid rgba(201,17,95,0.25)' }}
                        >
                            <Clock className="w-[11px] h-[11px]" /> My Orders
                        </button>
                    </div>

                    {/* Offer strip */}
                    <div className="px-4 mb-4">
                        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                            {flashDeals.map((d, i) => (
                                <button
                                    key={d.label}
                                    onClick={() => router.push(d.route)}
                                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold active:scale-95 transition-transform"
                                    style={{ background: d.bg, border: `1px solid ${d.color}40`, color: d.color }}
                                >
                                    <Tag className="w-[9px] h-[9px]" />
                                    {d.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Hero Banner — Featured Experience */}
                    <div className="px-4 mb-4">
                        <button
                            onClick={() => handleProductClick('experience-1', '/MainModules/AtheleteStore/StoreExperiences')}
                            className="w-full rounded-[20px] overflow-hidden relative text-left active:scale-[0.98] transition-transform"
                            style={{ height: 200 }}
                        >
                            <img
                                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=400&fit=crop&auto=format"
                                alt="Breakfast with Neeraj Chopra"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.7) 100%)' }} />
                            {/* AFI badge */}
                            <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'rgba(201,17,95,0.85)' }}>
                                <Shield className="w-[8px] h-[8px] text-white" />
                                <span className="text-white text-[8px] font-black tracking-wider">AFI VERIFIED</span>
                            </div>
                            <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
                                <Timer className="w-[8px] h-[8px] text-[#FFD700]" />
                                <span className="text-[#FFD700] text-[9px] font-bold">2d 14h left</span>
                            </div>
                            <div className="absolute bottom-0 left-0 p-4">
                                <p className="text-[#cd620e] text-[10px] font-black uppercase tracking-widest mb-1">✦ Exclusive Experience</p>
                                <p className="text-white text-[20px] font-black leading-tight">Breakfast with<br />Neeraj Chopra</p>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="text-white text-[14px] font-black" style={{ textShadow: '0 0 12px rgba(201,17,95,0.8)' }}>₹50,000</span>
                                    <span className="text-[#8a8a9a] text-[10px]">4 seats · Bengaluru</span>
                                    <div className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-full" style={{ background: 'linear-gradient(90deg,#c9115f,#cd620e)' }}>
                                        <span className="text-white text-[11px] font-black">Book Now</span>
                                        <ArrowUpRight className="w-[10px] h-[10px] text-white" />
                                    </div>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Categories grid — 2 rows × 5 */}
                    <div className="mb-4">
                        <SectionHeader title="Shop by Category" icon={ShoppingBag} color="#c9115f" />
                        <div className="px-4 grid grid-cols-5 gap-x-2 gap-y-3">
                            {categories.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.key}
                                        onClick={() => router.push(item.route)}
                                        className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform"
                                    >
                                        <div
                                            className="w-[52px] h-[52px] rounded-[16px] flex items-center justify-center flex-shrink-0"
                                            style={{ background: item.bg, border: `1.5px solid ${item.color}35` }}
                                        >
                                            <Icon className="w-[22px] h-[22px]" style={{ color: item.color }} />
                                        </div>
                                        <span className="text-[#99A1AF] text-[9px] font-semibold text-center leading-tight">{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="mx-4 mb-4 h-px bg-[rgba(255,255,255,0.05)]" />

                    {/* Recently Viewed (Phase 10) */}
                    {recentlyViewed.length > 0 && (
                        <div className="mb-4">
                            <SectionHeader title="Recently Viewed" icon={Clock} color="#00c864" />
                            <div className="flex gap-2.5 overflow-x-auto no-scrollbar px-4 pb-1">
                                {recentlyViewed.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleProductClick(item.productId, resolveRoute(item.category, item.productId))}
                                        className="flex-shrink-0 w-[120px] rounded-[16px] p-2 text-left bg-[#111116] border border-[rgba(255,255,255,0.06)]"
                                    >
                                        <div className="h-[70px] rounded-[10px] overflow-hidden mb-2 relative">
                                            <img src={item.image || 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=200&h=150&fit=crop'} alt={item.title} className="w-full h-full object-cover" />
                                        </div>
                                        <p className="text-white text-[10px] font-bold truncate">{item.title}</p>
                                        <p className="text-[#c9115f] text-[10px] font-black mt-0.5">{formatPrice(item.pricePaise)}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Asian Games — Ticketed Events */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between px-4 mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-[22px] h-[22px] rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#FFD700,#cd620e)' }}>
                                    <Trophy className="w-[11px] h-[11px] text-black" />
                                </div>
                                <div>
                                    <span className="text-white text-[15px] font-black">Asian Games · Nagoya</span>
                                    <span className="ml-2 text-[8px] font-black px-1.5 py-0.5 rounded-full text-black" style={{ background: '#FFD700' }}>LIVE BOOKINGS</span>
                                </div>
                            </div>
                            <button onClick={() => router.push(resolveRoute('ticketed_events'))} className="flex items-center gap-0.5 text-[11px] font-bold text-[#FFD700]">
                                All <ChevronRight className="w-[12px] h-[12px]" />
                            </button>
                        </div>
                        <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar pb-1">
                            {asianGamesEvents.map((ev) => {
                                const Icon = ev.icon;
                                const pct = Math.round(((ev.seats - ev.seatsLeft) / ev.seats) * 100);
                                return (
                                    <button
                                        key={ev.id}
                                        onClick={() => handleProductClick('experience-2', resolveRoute('ticketed_events'))}
                                        className="flex-shrink-0 w-[220px] rounded-[18px] overflow-hidden text-left active:scale-[0.97] transition-transform"
                                        style={{ background: '#0f0f17', border: `1px solid ${ev.color}30` }}
                                    >
                                        <div className="relative h-[110px]">
                                            <img src={ev.img} alt={ev.title} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(15,15,23,1) 0%, rgba(0,0,0,0.3) 100%)' }} />
                                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[7px] font-black text-white" style={{ background: ev.badgeColor }}>
                                                {ev.badge}
                                            </div>
                                            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 rounded-full px-1.5 py-0.5">
                                                <Timer className="w-[7px] h-[7px] text-[#FFD700]" />
                                                <span className="text-[#FFD700] text-[7px] font-bold">{ev.dates}</span>
                                            </div>
                                            <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1.5">
                                                <div className="flex-1 h-[3px] rounded-full bg-white/10">
                                                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${ev.color}, #FFD700)` }} />
                                                </div>
                                                <span className="text-[7px] font-bold" style={{ color: ev.color }}>{ev.seatsLeft} left</span>
                                            </div>
                                        </div>
                                        <div className="p-3 pt-2">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <div className="w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: ev.bg }}>
                                                    <Icon className="w-[10px] h-[10px]" style={{ color: ev.color }} />
                                                </div>
                                                <span className="text-[9px] font-bold" style={{ color: ev.color }}>{ev.type === 'virtual' ? 'Virtual' : 'In-Person'}</span>
                                            </div>
                                            <p className="text-white text-[12px] font-black leading-tight mb-0.5">{ev.title}</p>
                                            <p className="text-[#5a5a6a] text-[9px] leading-snug mb-2">{ev.subtitle}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-white text-[13px] font-black">₹{ev.price.toLocaleString('en-IN')}</span>
                                                <span className="text-[8px] font-black px-2 py-1 rounded-full text-white" style={{ background: `linear-gradient(90deg, ${ev.color}, #cd620e)` }}>Book →</span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="mx-4 mb-4 h-px bg-[rgba(255,255,255,0.05)]" />

                    {/* My Upcoming Experience */}
                    <div className="px-4 mb-4">
                        <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center gap-2">
                                <div className="w-[5px] h-[22px] rounded-full" style={{ background: 'linear-gradient(180deg,#c9115f,#cd620e)' }} />
                                <span className="text-white text-[15px] font-black">My Experience</span>
                                <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full text-white" style={{ background: 'rgba(201,17,95,0.25)', border: '1px solid rgba(201,17,95,0.4)', color: '#c9115f' }}>UPCOMING</span>
                            </div>
                            <button onClick={() => router.push('/MainModules/AtheleteStore/StoreMyExperiences')} className="flex items-center gap-0.5 text-[11px] font-bold text-[#c9115f]">
                                All <ChevronRight className="w-[12px] h-[12px]" />
                            </button>
                        </div>
                        <button
                            onClick={() => router.push('/MainModules/AtheleteStore/StoreExperienceDetail/1')}
                            className="w-full rounded-[18px] overflow-hidden text-left active:scale-[0.98] transition-transform"
                            style={{ background: 'linear-gradient(130deg, #100a18 0%, #0a0e14 100%)', border: '1px solid rgba(201,17,95,0.25)', boxShadow: '0 0 20px rgba(201,17,95,0.08)' }}
                        >
                            <div className="flex items-stretch">
                                <div className="relative w-[100px] flex-shrink-0">
                                    <img
                                        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=220&fit=crop&auto=format"
                                        alt="Breakfast with Neeraj"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent 50%, #100a18)' }} />
                                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-black/70 rounded-full px-1.5 py-0.5">
                                        <Timer className="w-[7px] h-[7px] text-[#FFD700]" />
                                        <span className="text-[#FFD700] text-[7px] font-black">11d 6h</span>
                                    </div>
                                </div>
                                <div className="flex-1 p-4 flex flex-col justify-between">
                                    <div>
                                        <span className="text-[#cd620e] text-[9px] font-black uppercase tracking-wider">VIP Experience</span>
                                        <p className="text-white text-[14px] font-black leading-tight mt-1">Breakfast with Neeraj Chopra</p>
                                        <p className="text-[#99A1AF] text-[11px] mt-0.5">Neeraj Chopra</p>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5 mb-2.5">
                                            <MapPin className="w-[10px] h-[10px] text-[#4a4a5a]" />
                                            <span className="text-[#4a4a5a] text-[10px]">ITC Maurya · New Delhi</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(201,17,95,0.12)', border: '1px solid rgba(201,17,95,0.25)' }}>
                                                <span className="text-[#c9115f] text-[9px] font-black">July 18, 2026 · 8:00 AM</span>
                                            </div>
                                            <ChevronRight className="w-[14px] h-[14px] text-[#c9115f]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="mx-4 mb-4 h-px bg-[rgba(255,255,255,0.05)]" />

                    {/* Completed Events — Badges & Memorabilia Earned */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between px-4 mb-3">
                            <div className="flex items-center gap-2">
                                <Award className="w-[14px] h-[14px] text-[#FFD700]" />
                                <span className="text-white text-[15px] font-black">Badges & Mementos Earned</span>
                            </div>
                            <button onClick={() => router.push('/MainModules/AtheleteStore/StoreMyExperiences')} className="flex items-center gap-0.5 text-[11px] font-bold text-[#FFD700]">
                                All <ChevronRight className="w-[12px] h-[12px]" />
                            </button>
                        </div>
                        <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar pb-1">
                            {[
                                {
                                    badge: '🏅',
                                    title: 'Virtual AMA — Medal Winners',
                                    event: 'Oct 1–15 · Completed',
                                    credit: '₹199 credit activated',
                                    memento: null,
                                    color: '#00c864',
                                    bg: 'rgba(0,200,100,0.1)',
                                },
                                {
                                    badge: '🥇',
                                    title: 'Virtual Breakfast',
                                    event: 'Oct 6–12 · Completed',
                                    credit: '3 months sub activated',
                                    memento: 'Autographed bib ordered',
                                    color: '#0ea5e9',
                                    bg: 'rgba(14,165,233,0.1)',
                                },
                                {
                                    badge: '✦',
                                    title: 'Breakfast with Neeraj',
                                    event: 'Oct 15–20 · Completed',
                                    credit: '₹499 credit activated',
                                    memento: 'Autographed jersey (included)',
                                    color: '#c9115f',
                                    bg: 'rgba(201,17,95,0.1)',
                                },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="flex-shrink-0 w-[200px] rounded-[18px] p-3.5 flex flex-col gap-2.5"
                                    style={{ background: '#0f0f17', border: `1px solid ${item.color}30` }}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-[44px] h-[44px] rounded-full flex items-center justify-center text-[20px]" style={{ background: item.bg, border: `2px solid ${item.color}50` }}>
                                            {item.badge}
                                        </div>
                                        <div>
                                            <p className="text-white text-[11px] font-black leading-tight">{item.title}</p>
                                            <p className="text-[#4a4a5a] text-[8px]">{item.event}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5">
                                            <Zap className="w-[9px] h-[9px] flex-shrink-0" style={{ color: item.color }} />
                                            <span className="text-[9px] font-bold" style={{ color: item.color }}>{item.credit}</span>
                                        </div>
                                        {item.memento && (
                                            <div className="flex items-center gap-1.5">
                                                <Package className="w-[9px] h-[9px] text-[#FFD700] flex-shrink-0" />
                                                <span className="text-[#8a8040] text-[9px]">{item.memento}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between pt-1" style={{ borderTop: `1px solid ${item.color}20` }}>
                                        <div className="flex items-center gap-1">
                                            <CheckCircle2 className="w-[10px] h-[10px]" style={{ color: '#00c864' }} />
                                            <span className="text-[#00c864] text-[9px] font-bold">CLAIMED</span>
                                        </div>
                                        <button onClick={() => router.push('/MainModules/AtheleteStore/StoreMemorabilia')} className="text-[9px] font-bold" style={{ color: item.color }}>
                                            View →
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="mx-4 mb-4 h-px bg-[rgba(255,255,255,0.05)]" />

                    {/* Live Auctions */}
                    {auctions.length > 0 && (
                        <div className="mb-4">
                            <SectionHeader title="Live Auctions" icon={Gavel} color="#ff4444" onSeeAll={() => router.push(resolveRoute('auctions'))} />
                            <div className="px-4 grid grid-cols-2 gap-2.5">
                                {auctions.map((a) => (
                                    <button
                                        key={a.id}
                                        onClick={() => handleProductClick(a.id, resolveRoute('auctions'))}
                                        className="rounded-[16px] overflow-hidden text-left active:scale-[0.97] transition-transform relative"
                                        style={{ background: '#0f0f14', border: '1px solid rgba(255,68,68,0.2)' }}
                                    >
                                        <button
                                            onClick={(e) => handleWishlistToggle(a.id, e)}
                                            className="absolute top-2 right-2 z-10 w-[24px] h-[24px] rounded-full bg-black/60 flex items-center justify-center"
                                        >
                                            <Heart className="w-[11px] h-[11px]" style={{ color: isProductWishlisted(a.id) ? '#c9115f' : 'white', fill: isProductWishlisted(a.id) ? '#c9115f' : 'none' }} />
                                        </button>
                                        <div className="relative h-[110px]">
                                            <img src={a.image || 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200&h=160&fit=crop'} alt={a.title} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent 60%)' }} />
                                            <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full px-1.5 py-0.5" style={{ background: 'rgba(255,68,68,0.9)' }}>
                                                <div className="w-[4px] h-[4px] rounded-full bg-white animate-pulse" />
                                                <span className="text-white text-[7px] font-black">LIVE</span>
                                            </div>
                                        </div>
                                        <div className="p-2.5">
                                            <p className="text-white text-[11px] font-bold leading-tight truncate">{a.title}</p>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-[#99A1AF] text-[10px] font-semibold">{formatPrice(a.pricePaise)}</span>
                                                <span className="text-[#ff6b6b] text-[9px] font-bold">Bid →</span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Divider */}
                    <div className="mx-4 mb-4 h-px bg-[rgba(255,255,255,0.05)]" />

                    {/* Top Coaches */}
                    {coaches.length > 0 && (
                        <div className="mb-4">
                            <SectionHeader title="Top Coaches" icon={Users} color="#c9115f" onSeeAll={() => router.push(resolveRoute('coaches_listing'))} />
                            <div className="flex gap-2.5 overflow-x-auto no-scrollbar px-4 pb-1">
                                {coaches.map((c) => (
                                    <button
                                        key={c.id}
                                        onClick={() => handleProductClick(c.id, resolveRoute('coaches', c.coachId))}
                                        className="flex-shrink-0 w-[140px] rounded-[16px] p-3 text-left active:scale-[0.97] transition-transform relative"
                                        style={{ background: '#0f0f14', border: '1px solid rgba(255,255,255,0.06)' }}
                                    >
                                        <button
                                            onClick={(e) => handleWishlistToggle(c.id, e)}
                                            className="absolute top-2 right-2 z-10 w-[24px] h-[24px] rounded-full bg-black/60 flex items-center justify-center"
                                        >
                                            <Heart className="w-[11px] h-[11px]" style={{ color: isProductWishlisted(c.id) ? '#c9115f' : 'white', fill: isProductWishlisted(c.id) ? '#c9115f' : 'none' }} />
                                        </button>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-[40px] h-[40px] rounded-full overflow-hidden flex-shrink-0" style={{ border: '1.5px solid rgba(201,17,95,0.4)' }}>
                                                <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-white text-[11px] font-bold leading-tight truncate">{c.name}</p>
                                                <p className="text-[#5a5a6a] text-[9px] truncate">{c.role || 'Distance Running'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 mb-1.5">
                                            <Star className="w-[9px] h-[9px] text-[#FFD700] fill-[#FFD700]" />
                                            <span className="text-[#FFD700] text-[9px] font-bold">{c.rating || 4.8}</span>
                                            <span className="text-[#4a4a5a] text-[9px]">({c.reviews || 100})</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[#c9115f] text-[11px] font-black">{formatPrice(c.pricePaise)}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Divider */}
                    <div className="mx-4 mb-4 h-px bg-[rgba(255,255,255,0.05)]" />

                    {/* Trending Now */}
                    {trending.length > 0 && (
                        <div className="mb-4">
                            <SectionHeader title="Trending Now" icon={TrendingUp} color="#cd620e" onSeeAll={() => router.push(resolveRoute('athletes'))} />
                            <div className="flex gap-2.5 overflow-x-auto no-scrollbar px-4 pb-1">
                                {trending.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleProductClick(item.id, resolveRoute(item.category, item.id))}
                                        className="flex-shrink-0 w-[130px] rounded-[16px] overflow-hidden text-left active:scale-[0.97] transition-transform relative"
                                        style={{ background: '#0f0f14', border: '1px solid rgba(255,255,255,0.06)' }}
                                    >
                                        <button
                                            onClick={(e) => handleWishlistToggle(item.id, e)}
                                            className="absolute top-2 right-2 z-10 w-[24px] h-[24px] rounded-full bg-black/60 flex items-center justify-center"
                                        >
                                            <Heart className="w-[11px] h-[11px]" style={{ color: isProductWishlisted(item.id) ? '#c9115f' : 'white', fill: isProductWishlisted(item.id) ? '#c9115f' : 'none' }} />
                                        </button>
                                        <div className="relative h-[100px]">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0f0f14, transparent 60%)' }} />
                                            <span className="absolute top-2 left-2 text-[8px] font-black px-1.5 py-0.5 rounded-full text-white" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>⚡ Hot</span>
                                        </div>
                                        <div className="p-2.5">
                                            <p className="text-[#5a5a6a] text-[8px] font-bold uppercase tracking-wider">{item.category}</p>
                                            <p className="text-white text-[11px] font-bold leading-snug mt-0.5 truncate">{item.title}</p>
                                            <p className="text-transparent bg-clip-text bg-gradient-to-r from-[#c9115f] to-[#cd620e] text-[12px] font-black mt-1">{formatPrice(item.pricePaise)}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Divider */}
                    <div className="mx-4 mb-4 h-px bg-[rgba(255,255,255,0.05)]" />

                    {/* Brand Deals */}
                    <div className="mb-4">
                        <SectionHeader title="Brand Deals" icon={Tag} color="#8b5cf6" onSeeAll={() => router.push(resolveRoute('brands'))} />
                        <div className="px-4 grid grid-cols-2 gap-2">
                            {brands.map((b) => (
                                <button
                                    key={b.name}
                                    onClick={() => router.push(resolveRoute('brands'))}
                                    className="rounded-[14px] overflow-hidden text-left active:scale-[0.97] transition-transform"
                                    style={{ background: '#0f0f14', border: '1px solid rgba(255,255,255,0.06)' }}
                                >
                                    <div className="h-[60px] overflow-hidden">
                                        <img src={b.img} alt={b.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-1.5">
                                        <p className="text-white text-[9px] font-bold">{b.name}</p>
                                        <p className="text-[10px] font-black" style={{ color: b.color }}>{b.discount}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="mx-4 mb-4 h-px bg-[rgba(255,255,255,0.05)]" />

                    {/* AI Dolly + Digital row */}
                    <div className="px-4 mb-4">
                        <div className="grid grid-cols-2 gap-2.5">
                            {/* AI Dolly */}
                            <button
                                onClick={() => router.push(resolveRoute('dolly'))}
                                className="rounded-[18px] overflow-hidden text-left active:scale-[0.97] transition-transform flex flex-col relative"
                                style={{ height: 170, background: 'linear-gradient(145deg, #1a0d2e, #0f0518)', border: '1px solid rgba(124,58,237,0.4)' }}
                            >
                                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                    <div className="w-[100px] h-[100px] rounded-full" style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
                                </div>
                                <div className="flex-1 flex items-center justify-center p-3 relative">
                                    <div className="w-[64px] h-[64px] rounded-full overflow-hidden" style={{ border: '2px solid rgba(124,58,237,0.6)', boxShadow: '0 0 20px rgba(124,58,237,0.5)' }}>
                                        <img src="https://images.unsplash.com/photo-1570481662006-a3a1374699e8?w=128&h=128&fit=crop&auto=format" alt="Dolly AI coach" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.parentElement!.innerHTML = '<div style="width:100%;height:100%;background:#7c3aed44;display:flex;align-items:center;justify-content:center;font-size:28px">🐬</div>'; }} />
                                    </div>
                                </div>
                                <div className="p-2.5 pt-0 relative">
                                    <div className="flex items-center gap-1 mb-1">
                                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full text-white" style={{ background: 'linear-gradient(90deg,#7c3aed,#c9115f)' }}>AI COACH</span>
                                        <span className="text-[#6b5a8a] text-[8px]">Free analysis</span>
                                    </div>
                                    <p className="text-white text-[13px] font-black">Ask Dolly</p>
                                    <p className="text-[#7c6a9a] text-[9px] mt-0.5">Upload video · Get coached</p>
                                </div>
                            </button>

                            {/* Digital Products */}
                            <button
                                onClick={() => router.push(resolveRoute('digital'))}
                                className="rounded-[18px] text-left active:scale-[0.97] transition-transform flex flex-col overflow-hidden"
                                style={{ height: 170, background: 'linear-gradient(145deg, #061a12, #0b0b0f)', border: '1px solid rgba(16,185,129,0.3)' }}
                            >
                                <div className="relative h-[90px] overflow-hidden">
                                    <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=240&h=180&fit=crop&auto=format" alt="Digital products" className="w-full h-full object-cover opacity-60" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-[11px] font-black px-2.5 py-1 rounded-full text-white" style={{ background: 'rgba(16,185,129,0.8)' }}>✦ Instant Access</span>
                                    </div>
                                </div>
                                <div className="p-2.5 flex-1">
                                    <p className="text-[#10b981] text-[9px] font-black uppercase tracking-wider mb-0.5">Digital Products</p>
                                    <p className="text-white text-[12px] font-bold leading-tight">Training Programs & Guides</p>
                                    <p className="text-[#4a4a5a] text-[9px] mt-1">From ₹299</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Elite Membership Banner */}
                    <div className="px-4 mb-4">
                        <button
                            onClick={() => router.push(resolveRoute('memberships'))}
                            className="w-full rounded-[20px] overflow-hidden text-left active:scale-[0.98] transition-transform relative"
                            style={{ height: 110 }}
                        >
                            <img src="https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&h=220&fit=crop&auto=format" alt="Elite Membership" className="w-full h-full object-cover" />
                            <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(12,2,30,0.95) 0%, rgba(12,2,30,0.6) 60%, rgba(12,2,30,0.85) 100%)' }} />
                            <div className="absolute inset-0 flex items-center px-4 gap-4">
                                <div className="w-[44px] h-[44px] rounded-[14px] flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #c9115f, #7c3aed)', boxShadow: '0 0 18px rgba(201,17,95,0.5)' }}>
                                    <Award className="w-[20px] h-[20px] text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-[8px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: 'linear-gradient(90deg,#c9115f,#7c3aed)' }}>ELITE</span>
                                        <span className="text-[#4a4a5a] text-[9px]">Cancel anytime</span>
                                    </div>
                                    <p className="text-white text-[15px] font-black">Elite Membership</p>
                                    <p className="text-[#7a6a8a] text-[10px]">Exclusive access to all features</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-transparent bg-clip-text bg-gradient-to-b from-[#c9115f] to-[#ec4899] text-[18px] font-black">₹799</p>
                                    <p className="text-[#4a4a5a] text-[9px]">/month</p>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Session Requests CTA */}
                    <div className="px-4 mb-5">
                        <button
                            onClick={() => router.push(resolveRoute('session-requests'))}
                            className="w-full rounded-[16px] p-3.5 flex items-center gap-3 active:scale-[0.98] transition-transform"
                            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
                        >
                            <div className="w-[42px] h-[42px] rounded-[13px] flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(245,158,11,0.15)' }}>
                                <MessageSquare className="w-[18px] h-[18px] text-[#f59e0b]" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-[8px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: '#00c864' }}>12 Active</span>
                                    <span className="text-[#4a4a5a] text-[9px]">Coaches responding</span>
                                </div>
                                <p className="text-white text-[13px] font-bold">Session Requests</p>
                                <p className="text-[#6a6a7a] text-[10px]">Post a request · Coaches respond</p>
                            </div>
                            <ArrowUpRight className="w-[15px] h-[15px] text-[#f59e0b] flex-shrink-0" />
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
}
