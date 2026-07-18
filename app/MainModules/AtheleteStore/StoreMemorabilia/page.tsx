'use client';

import { 
  ArrowLeft, Shield, ChevronDown, ChevronUp, ShoppingCart, 
  QrCode, ChevronRight, Lock, Timer, AlertTriangle 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { storeService } from '@/services/store.service';
import { formatPrice } from '@/utils/formatters';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

const memCategories = ['All', 'Signed Jerseys', 'Match Balls', 'Boots', 'Medals', 'Bibs', 'Equipment'];

function ItemDetail({ item, onBack, onStatusUpdate }: { item: any; onBack: () => void; onStatusUpdate?: (status: string, lockedBy: string | null) => void }) {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.userId || user?.email || 'mock-user-123';

  const [certExpanded, setCertExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBuyNow = async () => {
    setLoading(true);
    setError('');
    
    // Optimistic Update: instantly mark as reserved/locked by current user locally
    if (onStatusUpdate) {
      onStatusUpdate('reserved', userId);
    }

    try {
      const res: any = await api.post('/store/orders/memorabilia', {
        action: 'lock',
        productId: item.id,
        userId
      });
      if (res.success) {
        router.push(`/MainModules/AtheleteStore/StorePayment/${item.id}?price=${item.pricePaise}`);
      } else {
        setError(res.error || 'It is reserved. Try again after 2 minutes.');
        // Revert optimistic update
        if (onStatusUpdate) {
          onStatusUpdate('available', null);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'It is reserved. Try again after 2 minutes.');
      // Revert optimistic update
      if (onStatusUpdate) {
        onStatusUpdate('available', null);
      }
    } finally {
      setLoading(false);
    }
  };

  const isSold = item.status === 'sold';
  const isReserved = (item.status === 'reserved' || item.status === 'locked') && item.lockedBy !== userId;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Scrollable content with proper bottom padding */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-[90px]">
        <div className="relative h-[260px] bg-[#1a1a1f]">
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0f] to-transparent" />
        </div>

        <div className="px-4 py-6 pt-4">
          <div className="flex items-center gap-2 mb-2">
            {item.governance_state === 'approved' && (
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[rgba(0,200,100,0.12)] border border-[rgba(0,200,100,0.25)] text-[#00c864]">
                ✓ Certified Authentic
              </span>
            )}
            {(item.status === 'reserved' || item.status === 'locked') && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-950/50 border border-amber-500/30 text-amber-400 flex items-center gap-1">
                <Lock className="w-[10px] h-[10px]" /> Reserved
              </span>
            )}
          </div>
          <h2 className="text-white text-[19px] font-bold leading-tight mb-1">{item.title}</h2>
          <p className="text-[#99A1AF] text-[13px] mb-4">By {item.athlete || 'Athlete'}</p>

          {/* Certificate section */}
          <div className="bg-[#111116] rounded-[18px] border border-[rgba(255,255,255,0.06)] overflow-hidden mb-4">
            <button
              onClick={() => setCertExpanded(e => !e)}
              className="w-full flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-2.5">
                <QrCode className="w-[16px] h-[16px] text-[#c9115f]" />
                <span className="text-white text-[13px] font-bold">Certificate of Authenticity</span>
              </div>
              {certExpanded ? <ChevronUp className="w-[15px] h-[15px] text-[#99A1AF]" /> : <ChevronDown className="w-[15px] h-[15px] text-[#99A1AF]" />}
            </button>

            {certExpanded && (
              <div className="px-4 pb-4 pt-1 border-t border-[rgba(255,255,255,0.04)]">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="text-[#5a5a6a] text-[12px]">Serial Number</span>
                    <span className="text-white text-[12px] font-mono">{item.serialNo || 'AS-BIB-NTAC23'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5a5a6a] text-[12px]">Verified Owner</span>
                    <span className="text-white text-[12px]">SportsFan Official Vault</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-950/20 border border-red-500/30 rounded-xl p-3 flex items-start gap-2.5">
            <AlertTriangle className="w-[16px] h-[16px] text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-[12px] font-medium leading-normal">{error}</p>
          </div>
        )}
      </div>

      {/* Fixed bottom bar with proper positioning */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-6 pb-15 bg-[#0b0b0f] border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between z-10 safe-bottom">
        <div>
          <p className="text-[#5a5a6a] text-[10px] uppercase font-bold">Price</p>
          <p className="text-white text-[20px] font-black">{formatPrice(item.pricePaise)}</p>
        </div>
        
        <button
          onClick={handleBuyNow}
          disabled={loading || isSold || isReserved}
          className={`rounded-full px-8 py-3 text-white text-[14px] font-bold active:scale-[0.98] transition-transform ${
            isSold || isReserved
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700 shadow-none'
              : 'bg-gradient-to-r from-[#c9115f] to-[#cd620e] shadow-[0_0_20px_rgba(201,17,95,0.4)]'
          }`}
        >
          {loading ? 'Processing...' : isSold ? 'Sold Out' : isReserved ? 'Reserved' : 'Buy Now'}
        </button>
      </div>
    </div>
  );
}

export default function StoreMemorabilia() {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = (silent = false) => {
    if (!silent) setLoading(true);
    storeService.getProducts('memorabilia')
      .then((res) => {
        setItems(res);
        if (!silent) setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching memorabilia:', err);
        if (!silent) setLoading(false);
      });
  };

  useEffect(() => {
    fetchItems();

    const interval = setInterval(() => {
      fetchItems(true);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedItem) {
      const updated = items.find(i => i.id === selectedItem.id);
      if (updated) {
        if (updated.status !== selectedItem.status || updated.lockedBy !== selectedItem.lockedBy) {
          setSelectedItem(updated);
        }
      }
    }
  }, [items, selectedItem]);

  const handleBackToCatalog = () => {
    setSelectedItem(null);
    fetchItems(); // Refresh items to get updated status (sold/reserved)
  };

  const handleItemStatusUpdate = (itemId: string, status: string, lockedBy: string | null) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          status,
          lockedBy,
          lockExpiresAt: status === 'reserved' || status === 'locked' ? new Date(Date.now() + 2 * 60 * 1000).toISOString() : null
        };
      }
      return item;
    }));
    setSelectedItem(prev => {
      if (prev && prev.id === itemId) {
        return {
          ...prev,
          status,
          lockedBy,
          lockExpiresAt: status === 'reserved' || status === 'locked' ? new Date(Date.now() + 2 * 60 * 1000).toISOString() : null
        };
      }
      return prev;
    });
  };

  return (
    <div className="bg-black w-full flex justify-center min-h-screen">
      <div className="w-full max-w-[390px] bg-[#0b0b0f] relative flex flex-col min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-[#0b0b0f] border-b border-[rgba(255,255,255,0.05)] h-[56px] flex items-center px-4 gap-3">
          <button
            onClick={() => selectedItem ? handleBackToCatalog() : router.push('/MainModules/AtheleteStore')}
            className="w-[36px] h-[36px] rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center"
          >
            <ArrowLeft className="w-[18px] h-[18px] text-white" />
          </button>
          <div>
            <h1 className="text-white font-bold text-[17px]">Memorabilia</h1>
            {!selectedItem && <p className="text-[#99A1AF] text-[11px]">Own piece of track history</p>}
          </div>
        </div>

        {selectedItem ? (
          <ItemDetail 
            item={selectedItem} 
            onBack={handleBackToCatalog} 
            onStatusUpdate={(status, lockedBy) => handleItemStatusUpdate(selectedItem.id, status, lockedBy)}
          />
        ) : (
          <div className="flex-1 overflow-y-auto pb-[70px] no-scrollbar px-4 pt-4">
            {loading ? (
              <p className="text-center text-[#99A1AF] text-[12px] py-10">Loading items...</p>
            ) : items.length === 0 ? (
              <p className="text-center text-[#99A1AF] text-[12px] py-10">No items found.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {items.map((item) => {
                  const isSold = item.status === 'sold';
                  const isReserved = item.status === 'reserved' || item.status === 'locked';
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      disabled={isSold}
                      className="bg-[#111116] rounded-[16px] border border-[rgba(255,255,255,0.07)] overflow-hidden text-left active:scale-[0.98] transition-transform flex flex-col justify-between relative disabled:scale-100 disabled:opacity-85"
                    >
                      {/* Status Badges Overlay */}
                      {isSold && (
                        <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center backdrop-blur-[1px]">
                          <span className="bg-red-600/90 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-md border border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                            Sold Out
                          </span>
                        </div>
                      )}
                      {isReserved && !isSold && (
                        <div className="absolute inset-0 bg-black/45 z-10 flex items-center justify-center">
                          <span className="bg-amber-600/90 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1.2 rounded-md border border-amber-500">
                            Reserved
                          </span>
                        </div>
                      )}

                      <div>
                        <div className="h-[120px] bg-[#1a1a1f] relative">
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-3">
                          <p className="text-white text-[12px] font-bold leading-tight mb-1 truncate">{item.title}</p>
                          <p className="text-[#5a5a6a] text-[10px]">{item.athlete || 'Athlete'}</p>
                        </div>
                      </div>
                      <div className="p-3 pt-0 flex items-center justify-between">
                        <span className="text-[#c9115f] text-[12px] font-black">{formatPrice(item.pricePaise)}</span>
                        <span className="text-[#c9115f] text-[11px] font-bold">{isSold ? 'Sold' : 'Buy →'}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
