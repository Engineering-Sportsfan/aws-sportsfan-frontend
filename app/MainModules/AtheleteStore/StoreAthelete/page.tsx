'use client';

import { ArrowLeft, CheckCircle, Clock, Shield, ShoppingCart, ChevronRight, Video, FileText, Phone, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { storeService } from '@/services/store.service';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';


type GovernanceStatus = 'approved' | 'pending' | 'independent';

const governanceBadge: Record<GovernanceStatus, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  approved: {
    label: 'AFI Approved',
    color: '#00c864',
    bg: 'rgba(0,200,100,0.08)',
    border: 'rgba(0,200,100,0.25)',
    icon: <CheckCircle className="w-[10px] h-[10px]" />,
  },
  pending: {
    label: 'Pending AFI Review',
    color: '#cd620e',
    bg: 'rgba(205,98,14,0.08)',
    border: 'rgba(205,98,14,0.25)',
    icon: <Clock className="w-[10px] h-[10px]" />,
  },
  independent: {
    label: 'Independent Athlete',
    color: '#6b7280',
    bg: 'rgba(107,114,128,0.08)',
    border: 'rgba(107,114,128,0.2)',
    icon: <Shield className="w-[10px] h-[10px]" />,
  },
};

function GovernanceTag({ status }: { status: GovernanceStatus }) {
  if (status === 'pending') return null;
  const cfg = governanceBadge[status] || governanceBadge['approved'];
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <span style={{ color: cfg.color }}>{cfg.icon}</span>
      <span className="text-[10px] font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
    </div>
  );
}

const typeIcons: Record<string, React.ReactNode> = {
  'Training Program': <FileText className="w-[13px] h-[13px] text-[#c9115f]" />,
  'Video Course': <Video className="w-[13px] h-[13px] text-[#cd620e]" />,
  'Video Review': <Video className="w-[13px] h-[13px] text-[#c9115f]" />,
  'Private Call': <Phone className="w-[13px] h-[13px] text-[#00c864]" />,
  'Digital Download': <Download className="w-[13px] h-[13px] text-[#cd620e]" />,
  'Signed Item': <Shield className="w-[13px] h-[13px] text-[#FFD700]" />,
};

const athletes = [
  {
    id: 1,
    name: 'Neeraj Chopra',
    discipline: 'Javelin Throw',
    bio: "Olympic gold medallist and World champion. World record progression guide, training philosophy insights, and signed memorabilia.",
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop&auto=format',
    governance: 'approved' as GovernanceStatus,
    listings: [
      { id: 1, type: 'Training Program', title: 'Neeraj\'s 12-Week Javelin Power Block', price: '₹4,999', preview: true },
      { id: 2, type: 'Video Review', title: 'Technique Video Review (30 min)', price: '₹2,499', preview: false },
      { id: 3, type: 'Private Call', title: '20-min Private Q&A Call', price: '₹6,999', preview: false },
      { id: 4, type: 'Signed Item', title: 'Signed Training Tee (Authenticated)', price: '₹8,500', preview: false },
    ],
  },
  {
    id: 2,
    name: 'Avinash Sable',
    discipline: '3000m Steeplechase',
    bio: "Asian Games silver medallist and national record holder. Sharing steeplechase fundamentals, training breakdowns, and community events.",
    image: 'https://images.unsplash.com/photo-1544899489-a083461b088c?w=400&h=300&fit=crop&auto=format',
    governance: 'approved' as GovernanceStatus,
    listings: [
      { id: 1, type: 'Video Course', title: 'Steeplechase Barrier Technique Series', price: '₹3,299', preview: true },
      { id: 2, type: 'Training Program', title: '8-Week Aerobic Base Builder', price: '₹2,999', preview: true },
      { id: 3, type: 'Digital Download', title: 'National Record Training Week PDF', price: '₹499', preview: false },
    ],
  },
  {
    id: 3,
    name: 'Tejaswin Shankar',
    discipline: 'High Jump',
    bio: "Commonwealth Games medalist and NCAA high jump champion. Technical coaching programs and digital content for aspiring high jumpers.",
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=300&fit=crop&auto=format',
    governance: 'pending' as GovernanceStatus,
    listings: [
      { id: 1, type: 'Video Course', title: 'Fosbury Flop Mechanics — Full Series', price: '₹3,999', preview: true },
      { id: 2, type: 'Private Call', title: '30-min High Jump Consultation', price: '₹4,999', preview: false },
    ],
  },
];

function EarningsSplit() {
  return (
    <div className="mt-4 mb-2">
      <p className="text-[#99A1AF] text-[11px] mb-2">Revenue split per sale</p>
      <div className="flex h-[8px] rounded-full overflow-hidden">
        <div className="bg-[#c9115f]" style={{ width: '15%' }} title="Platform 15%" />
        <div className="bg-[#cd620e]" style={{ width: '10%' }} title="AFI 10%" />
        <div className="bg-[#00c864]" style={{ width: '75%' }} title="Athlete 75%" />
      </div>
      <div className="flex items-center gap-4 mt-2">
        {[
          { color: '#c9115f', label: 'Platform', pct: '15%' },
          { color: '#cd620e', label: 'AFI', pct: '10%' },
          { color: '#00c864', label: 'Athlete', pct: '75%' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-1.5">
            <div className="w-[8px] h-[8px] rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span className="text-[10px] text-[#99A1AF]">{s.label} <span className="text-white font-semibold">{s.pct}</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AthleteStorefront({ athlete, onBack }: { athlete: any; onBack: () => void }) {
  const router = useRouter();
  const [added, setAdded] = useState<string[]>([]);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<any | null>(null);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const handleBuyListing = async (listing: any) => {
    setPurchasingId(listing.id);
    try {
      const res = await storeService.purchaseAthleteListing(athlete.id, listing.id);
      if (res.success) {
        // Route to payment page with amountPaise
        router.push(`/MainModules/AtheleteStore/StorePayment/${athlete.id}?variantId=${listing.id}&price=${res.pricePaise}`);
      } else {
        alert(res.error || 'Failed to initiate purchase');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to initiate purchase');
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-[70px] no-scrollbar">
      {/* Hero */}
      <div className="relative h-[200px]">
        <img src={athlete.image} alt={athlete.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0f] to-transparent" />
      </div>

      <div className="px-4 -mt-4">
        {/* Governance strip */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <GovernanceTag status={athlete.governance_state || athlete.governance || 'approved'} />
          {(athlete.governance_state === 'approved' || athlete.governance === 'approved') && (
            <span className="text-[10px] text-[#4a4a5a]">Content reviewed & cleared by AFI</span>
          )}
        </div>

        <h2 className="text-white text-[22px] font-bold">{athlete.name}</h2>
        <p className="text-[#99A1AF] text-[13px]">{athlete.discipline}</p>
        <p className="text-[#a8a8b8] text-[12px] leading-relaxed mt-2">{athlete.bio}</p>

        {/* Earnings split */}
        {(athlete.governance_state === 'approved' || athlete.governance === 'approved') && <EarningsSplit />}

        <p className="text-white text-[14px] font-bold mt-5 mb-3">Available from {(athlete.name || '').split(' ')[0]}</p>
        <div className="flex flex-col gap-3">
          {(athlete.listings || []).map((listing: any) => (
            <div key={listing.id} className="bg-[#111116] rounded-[16px] border border-[rgba(255,255,255,0.07)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {typeIcons[listing.type] || <FileText className="w-[13px] h-[13px] text-[#c9115f]" />}
                    <span className="text-[10px] font-semibold text-[#99A1AF]">{listing.type}</span>
                    {listing.preview && (
                      <button
                        onClick={() => setPreviewItem(listing)}
                        className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[rgba(0,200,100,0.12)] text-[#00c864] border border-[rgba(0,200,100,0.25)] flex items-center gap-1"
                      >
                        PREVIEW
                      </button>
                    )}
                  </div>
                  <p className="text-white text-[14px] font-semibold leading-snug">{listing.title}</p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c9115f] to-[#cd620e] text-[14px] font-bold">{listing.price}</span>
                  <button
                    onClick={() => handleBuyListing(listing)}
                    disabled={purchasingId === listing.id}
                    className="text-[11px] font-bold px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1 text-white cursor-pointer"
                    style={{ background: 'linear-gradient(135deg,#c9115f,#cd620e)' }}
                  >
                    <ShoppingCart className="w-[10px] h-[10px]" /> Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Seller dashboard teaser */}
        <button
          onClick={() => setDashboardOpen(!dashboardOpen)}
          className="w-full mt-4 rounded-[12px] p-3 border border-[rgba(255,255,255,0.06)] flex items-center justify-between"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <span className="text-[#99A1AF] text-[12px]">Seller Dashboard</span>
          <ChevronRight className="w-[14px] h-[14px] text-[#4a4a5a]" />
        </button>

        {dashboardOpen && (athlete.governance_state === 'approved' || athlete.governance === 'approved') && (
          <div className="mt-3 rounded-[14px] p-4 border border-[rgba(255,255,255,0.06)]" style={{ background: '#111116' }}>
            <p className="text-white text-[13px] font-bold mb-3">Pending Listings</p>
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-[#99A1AF] text-[12px]">Private Call (30 min variant)</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(205,98,14,0.12)] text-[#cd620e]">Pending AFI</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#99A1AF] text-[12px]">Monthly Training Plan PDF</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(0,200,100,0.12)] text-[#00c864]">AFI Approved</span>
              </div>
            </div>
            <p className="text-white text-[13px] font-bold mb-2">This Month's Earnings</p>
            <EarningsSplit />
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#111116] rounded-[20px] border border-[rgba(255,255,255,0.1)] p-5 w-full max-w-[340px] text-left">
            <h3 className="text-white font-bold text-[16px] mb-1">Preview: {previewItem.title}</h3>
            <p className="text-[#99A1AF] text-[12px] mb-4">Type: {previewItem.type}</p>
            <div className="bg-[rgba(255,255,255,0.04)] rounded-[12px] p-4 mb-4 text-[#c8c8d0] text-[12px] leading-relaxed">
              This is a sample preview snippet of "{previewItem.title}". Gain full access to all athlete materials and features upon purchase.
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPreviewItem(null)}
                className="flex-1 py-2.5 rounded-full border border-[rgba(255,255,255,0.15)] text-[#99A1AF] text-[12px] font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const item = previewItem;
                  setPreviewItem(null);
                  handleBuyListing(item);
                }}
                className="flex-1 py-2.5 rounded-full text-white text-[12px] font-semibold"
                style={{ background: 'linear-gradient(135deg,#c9115f,#cd620e)' }}
              >
                Buy {previewItem.price}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StoreAthleteMarketplace() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.userId || user?.email || 'mock-user-123';

  const [activeTab, setActiveTab] = useState<'all' | 'purchases'>('all');
  const [purchaseSection, setPurchaseSection] = useState<'library' | 'bookings' | 'orders'>('library');

  const [selectedAthlete, setSelectedAthlete] = useState<any | null>(null);
  const [athletesList, setAthletesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Purchased items states
  const [libraryItems, setLibraryItems] = useState<any[]>([]);
  const [bookingItems, setBookingItems] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [purchasesLoading, setPurchasesLoading] = useState(false);

  useEffect(() => {
    storeService.getProducts('athletes')
      .then((res) => {
        setAthletesList(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching athletes:', err);
        setLoading(false);
      });
  }, []);

  const loadMyPurchases = async () => {
    if (!userId) return;
    setPurchasesLoading(true);
    try {
      const [lib, bks, ords] = await Promise.all([
        storeService.getLibrary(userId).catch(() => []),
        storeService.getAthleteBookings(userId).catch(() => []),
        storeService.getUserOrders(userId, 'athletes').catch(() => []),
      ]);
      setLibraryItems(lib || []);
      setBookingItems(bks || []);
      setOrderItems(ords || []);
    } catch (err) {
      console.error('Error loading my purchases:', err);
    } finally {
      setPurchasesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'purchases') {
      loadMyPurchases();
    }
  }, [activeTab, userId]);

  const isJoinWindow = (scheduledIso?: string) => {
    if (!scheduledIso) return false;
    const schedTime = new Date(scheduledIso).getTime();
    const now = Date.now();
    const diff = (schedTime - now) / (1000 * 60);
    return diff <= 15 && diff >= -60; // 15 mins before up to 60 mins after
  };

  return (
    <div className="bg-black w-full flex justify-center min-h-screen">
      <div className="w-full max-w-[390px] bg-[#0b0b0f] relative flex flex-col min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-[#0b0b0f] border-b border-[rgba(255,255,255,0.05)]">
          <div className="h-[56px] flex items-center px-4 gap-3">
            <button
              onClick={() => selectedAthlete ? setSelectedAthlete(null) : router.push('/MainModules/AtheleteStore')}
              className="w-[36px] h-[36px] rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center"
            >
              <ArrowLeft className="w-[18px] h-[18px] text-white" />
            </button>
            <div>
              <h1 className="text-white font-bold text-[17px]">{selectedAthlete ? selectedAthlete.name : 'Athlete Store'}</h1>
              {!selectedAthlete && <p className="text-[#99A1AF] text-[11px]">Directly from the athletes you follow</p>}
            </div>
          </div>

          {!selectedAthlete && (
            <div className="flex px-4 pb-3 gap-2">
              {(['all', 'purchases'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-1 py-2 rounded-full text-[12px] font-semibold capitalize border transition-all"
                  style={activeTab === tab ? {
                    background: 'linear-gradient(135deg,#c9115f,#cd620e)',
                    border: '1px solid transparent',
                    color: 'white',
                  } : {
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#99A1AF',
                  }}
                >
                  {tab === 'all' ? 'All Athletes' : 'My Purchases'}
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedAthlete ? (
          <AthleteStorefront athlete={selectedAthlete} onBack={() => setSelectedAthlete(null)} />
        ) : activeTab === 'all' ? (
            <div className="flex-1 overflow-y-auto pb-[70px] no-scrollbar px-4 pt-4">
            <div className="bg-[rgba(201,17,95,0.06)] border border-[rgba(201,17,95,0.15)] rounded-[12px] px-3.5 py-3 mb-4">
              <p className="text-white text-[13px] font-semibold mb-1">AFI-Governed Marketplace</p>
              <p className="text-[#a8a8b8] text-[12px] leading-snug">All athlete listings require AFI approval. Revenue is split between the Platform, AFI, and the Athlete.</p>
            </div>

            {loading ? (
              <p className="text-center text-[#99A1AF] text-[12px] py-10">Loading athletes...</p>
            ) : athletesList.length === 0 ? (
              <p className="text-center text-[#99A1AF] text-[12px] py-10">No athletes found.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {athletesList.map((athlete) => (
                  <button
                    key={athlete.id}
                    onClick={() => setSelectedAthlete(athlete)}
                    className="w-full bg-[#111116] rounded-[18px] border border-[rgba(255,255,255,0.07)] overflow-hidden text-left active:scale-[0.98] transition-transform"
                  >
                    <div className="relative h-[150px]">
                      <img src={athlete.image} alt={athlete.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111116] to-transparent" />
                      <div className="absolute bottom-3 left-4">
                        <GovernanceTag status={athlete.governance_state || athlete.governance || 'approved'} />
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-white text-[16px] font-bold">{athlete.name}</p>
                      <p className="text-[#99A1AF] text-[12px]">{athlete.discipline}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-[#99A1AF] text-[11px]">{(athlete.listings || []).length} items available</span>
                        <span className="text-[#c9115f] text-[12px] font-semibold flex items-center gap-1">
                          View store <ChevronRight className="w-[13px] h-[13px]" />
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          ) : (
            /* My Purchases Tab */
            <div className="flex-1 overflow-y-auto pb-[70px] no-scrollbar px-4 pt-4">
              {/* Sub-section tabs */}
              <div className="flex gap-2 mb-4 bg-[rgba(255,255,255,0.03)] p-1 rounded-full border border-[rgba(255,255,255,0.06)]">
                {(['library', 'bookings', 'orders'] as const).map(sec => (
                  <button
                    key={sec}
                    onClick={() => setPurchaseSection(sec)}
                    className="flex-1 py-1.5 rounded-full text-[11px] font-semibold capitalize transition-all"
                    style={purchaseSection === sec ? {
                      background: '#111116',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.12)',
                    } : {
                      color: '#99A1AF',
                    }}
                  >
                    {sec === 'library' ? 'Digital Library' : sec === 'bookings' ? 'Bookings' : 'Physical Orders'}
                  </button>
                ))}
              </div>

              {purchasesLoading ? (
                <p className="text-center text-[#99A1AF] text-[12px] py-10">Loading your purchases...</p>
              ) : purchaseSection === 'library' ? (
                /* Library sub-section */
                libraryItems.length === 0 ? (
                  <p className="text-center text-[#99A1AF] text-[12px] py-10">No digital items in your library yet.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {libraryItems.map((item, idx) => (
                      <div key={item.id || idx} className="bg-[#111116] rounded-[16px] border border-[rgba(255,255,255,0.07)] p-4 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-semibold text-[#99A1AF] block mb-0.5">{item.type || 'Digital Content'}</span>
                          <p className="text-white text-[14px] font-semibold">{item.title || item.name || 'Library Item'}</p>
                        </div>
                        <button className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-[rgba(201,17,95,0.15)] text-[#c9115f] border border-[rgba(201,17,95,0.3)]">
                          Access
                        </button>
                      </div>
                    ))}
                  </div>
                )
              ) : purchaseSection === 'bookings' ? (
                /* Bookings sub-section */
                bookingItems.length === 0 ? (
                  <p className="text-center text-[#99A1AF] text-[12px] py-10">No scheduled bookings found.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {bookingItems.map((item, idx) => {
                      const canJoin = isJoinWindow(item.scheduledAt);
                      return (
                        <div key={item.id || idx} className="bg-[#111116] rounded-[16px] border border-[rgba(255,255,255,0.07)] p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(205,98,14,0.15)] text-[#cd620e] uppercase">
                              {item.status || 'pending_scheduling'}
                            </span>
                            <span className="text-[#99A1AF] text-[11px]">{item.listingType}</span>
                          </div>
                          <p className="text-white text-[14px] font-semibold mb-1">{item.listingTitle}</p>
                          <p className="text-[#99A1AF] text-[12px]">
                            {item.scheduledAt ? new Date(item.scheduledAt).toLocaleString() : 'Scheduling pending with athlete'}
                          </p>
                          {item.meetingLink && (
                            <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                              {canJoin ? (
                                <a
                                  href={item.meetingLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-block w-full py-2 rounded-full text-center text-white text-[12px] font-bold"
                                  style={{ background: 'linear-gradient(135deg,#00c864,#16a34a)' }}
                                >
                                  Join Meeting Now
                                </a>
                              ) : (
                                <p className="text-[#4a4a5a] text-[11px] text-center">Join link available 15 min before scheduled time</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                /* Orders sub-section */
                orderItems.length === 0 ? (
                  <p className="text-center text-[#99A1AF] text-[12px] py-10">No physical orders found.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {orderItems.map((item, idx) => (
                      <div key={item.id || idx} className="bg-[#111116] rounded-[16px] border border-[rgba(255,255,255,0.07)] p-4">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-white text-[14px] font-semibold">{item.title}</p>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(0,200,100,0.12)] text-[#00c864]">
                            {item.deliveryStatus || item.status || 'processing'}
                          </span>
                        </div>
                        <p className="text-[#99A1AF] text-[12px]">{formatPrice(item.pricePaise || 0)}</p>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
        )}
      </div>
    </div>
  );
}


