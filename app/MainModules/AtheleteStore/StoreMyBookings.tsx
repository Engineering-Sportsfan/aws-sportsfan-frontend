import { useNavigate } from 'react-router';
import { ArrowLeft, Calendar, Clock, ChevronRight, Star, Tag, AlertCircle, QrCode, X, Gift } from 'lucide-react';
import { useState, useEffect } from 'react';
import { storeService } from '@/services/store.service';
import { formatPrice } from '@/utils/formatters';
import QRCode from 'react-qr-code';

type Tab = 'upcoming' | 'completed' | 'cancelled';

export default function StoreMyBookings() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('upcoming');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedQR, setSelectedQR] = useState<any | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    storeService.getUserOrders('abhishekrt959_gmail_com')
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading user orders:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const res = await storeService.cancelBooking(bookingId, 'abhishekrt959_gmail_com');
      if (res.success) {
        alert('Booking cancelled successfully! Your refund has been credited to your Wallet.');
        fetchOrders();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking');
    }
  };

  const parseEventDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;

    // Handle ranges like "Oct 6–12, 2025" or "Oct 6-12, 2025"
    try {
      const cleanStr = dateStr.replace(/–|-/g, '-');
      if (cleanStr.includes('-')) {
        const parts = cleanStr.split('-');
        const secondPart = parts[1].trim(); // e.g. "12, 2025"
        const firstPart = parts[0].trim();  // e.g. "Oct 6"
        const monthMatch = firstPart.match(/^[A-Za-z]+/);
        if (monthMatch) {
          const month = monthMatch[0];
          const endDate = new Date(`${month} ${secondPart}`);
          if (!isNaN(endDate.getTime())) {
            endDate.setHours(23, 59, 59, 999);
            return endDate;
          }
        }
      }
    } catch (e) {
      console.error('Error parsing event date range:', e);
    }
    return null;
  };

  const filteredOrders = orders.filter((o) => {
    // 1. Cancelled always goes to cancelled tab
    if (o.status === 'cancelled') {
      return tab === 'cancelled';
    }
    
    if (tab === 'cancelled') return false;

    // 2. If it's a date-based product (Coaches, Experiences, Events)
    const isDateProduct = o.productType === 'coaches' || o.productType === 'experiences' || o.productType === 'events' || o.category === 'coaches' || o.category === 'experiences' || o.category === 'events';
    
    if (isDateProduct && o.eventDate) {
      const parsedDate = parseEventDate(o.eventDate);
      if (parsedDate) {
        const isFuture = parsedDate.getTime() > Date.now();
        if (isFuture) {
          return tab === 'upcoming';
        } else {
          return tab === 'completed';
        }
      }
    }

    // 3. Non-date products (Digital, Memberships, Merch, Auctions)
    if (o.status === 'upcoming') {
      return tab === 'upcoming';
    }
    return tab === 'completed';
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
            <h1 className="text-white font-bold text-[17px]">My Orders & Bookings</h1>
          </div>

          {/* Tabs */}
          <div className="flex px-4 pb-3 gap-2">
            {(['upcoming', 'completed', 'cancelled'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-full text-[12px] font-semibold capitalize transition-all ${
                  tab === t
                    ? 'bg-gradient-to-r from-[#c9115f] to-[#cd620e] text-white shadow-[0_0_10px_rgba(201,17,95,0.35)]'
                    : 'bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] text-[#99A1AF]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-[70px] no-scrollbar px-4 pt-4">
          {loading ? (
            <div className="text-center py-10 text-[#99A1AF]">Loading your orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-[#111116] rounded-[16px] border border-[rgba(255,255,255,0.07)] p-8 text-center mt-5">
              <AlertCircle className="w-[32px] h-[32px] text-[#5a5a6a] mx-auto mb-3" />
              <p className="text-white text-[14px] font-bold">No orders found</p>
              <p className="text-[#5a5a6a] text-[11px] mt-1">Browse the store to find coaching, experiences, and merch.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredOrders.map((o) => (
                <div key={o.orderId || o.id} className="bg-[#111116] rounded-[18px] border border-[rgba(255,255,255,0.07)] p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white text-[15px] font-bold">{o.title}</p>
                      <p className="text-[#99A1AF] text-[12px] capitalize">Category: {o.productType || o.category}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      o.status === 'cancelled'
                        ? 'bg-[rgba(255,68,68,0.08)] border-[rgba(255,68,68,0.2)] text-[#ff4444]'
                        : 'bg-[rgba(0,200,100,0.1)] border border-[rgba(0,200,100,0.25)] text-[#00c864]'
                    }`}>
                      {o.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-[12px] h-[12px] text-[#99A1AF]" />
                      <span className="text-[#99A1AF] text-[12px]">
                        {o.createdAt ? new Date(o.createdAt._seconds ? o.createdAt._seconds * 1000 : o.createdAt).toLocaleDateString() : 'Today'}
                      </span>
                    </div>
                    {o.slotId && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-[12px] h-[12px] text-[#99A1AF]" />
                        <span className="text-[#99A1AF] text-[12px]">Coach Session Scheduled</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[rgba(255,255,255,0.06)]">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c9115f] to-[#cd620e] text-[15px] font-bold">
                      {formatPrice(o.pricePaise || 180000)}
                    </span>
                    <div className="flex gap-2">
                      {o.status === 'upcoming' && o.productType === 'events' && (
                        <button 
                          onClick={() => setSelectedQR(o)}
                          className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#c9115f] to-[#cd620e] text-white text-[12px] font-bold shadow-[0_0_10px_rgba(201,17,95,0.3)] flex items-center gap-1.5 active:scale-[0.97] transition-transform"
                        >
                          <QrCode className="w-[14px] h-[14px]" />
                          View QR
                        </button>
                      )}
                      {o.status !== 'cancelled' && o.slotId && (
                        <>
                          <button 
                            onClick={() => navigate(`/store/booking/${o.productId?.replace('coach-', '') || '1'}`)}
                            className="px-3 py-1.5 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] text-[#99A1AF] text-[12px] font-semibold"
                          >
                            Reschedule
                          </button>
                          <button 
                            onClick={() => handleCancel(o.orderId || o.id)}
                            className="px-3 py-1.5 rounded-full bg-[rgba(255,0,0,0.08)] border border-[rgba(255,0,0,0.2)] text-[#ff4444] text-[12px] font-semibold"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {o.status === 'cancelled' && (
                        <button
                          onClick={() => navigate('/store')}
                          className="flex items-center gap-1 text-[#c9115f] text-[12px] font-semibold"
                        >
                          Shop More <ChevronRight className="w-[13px] h-[13px]" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedQR && (
          <div className="fixed inset-0 z-[300] flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.85)' }}>
            <div className="w-full max-w-[390px] rounded-t-[28px] overflow-hidden" style={{ background: '#0b0b0f', border: '1px solid rgba(255,215,0,0.3)' }}>
              <div className="p-6 flex flex-col items-center text-center">
                <div className="flex items-center justify-between w-full mb-4">
                  <h3 className="text-white text-[16px] font-black">
                    {selectedQR.eventMode === 'online' ? 'Join Event QR' : 'Check-in QR'}
                  </h3>
                  <button onClick={() => setSelectedQR(null)} className="text-[#4a4a5a]"><X className="w-[18px] h-[18px]" /></button>
                </div>
                
                <span className="text-[9px] font-black px-3 py-1 rounded-full text-black mb-3" style={{ background: '#FFD700' }}>
                  {selectedQR.eventMode === 'online' ? 'ONLINE EVENT' : 'IN-PERSON EVENT'}
                </span>

                <h3 className="text-white text-[18px] font-black mb-1">{selectedQR.title}</h3>
                <p className="text-[#5a5a6a] text-[11px] mb-5">{selectedQR.eventDate || 'Upcoming Event'}</p>

                {/* QR Code Container */}
                <div className="w-[200px] h-[200px] rounded-[16px] mb-5 flex items-center justify-center p-4 bg-white">
                  <QRCode
                    value={
                      selectedQR.eventMode === 'online'
                        ? `http://localhost:5173/store/events/join/${selectedQR.joinToken}`
                        : `http://localhost:3000/store/events/checkin/${selectedQR.qrToken}`
                    }
                    size={170}
                  />
                </div>

                <p className="text-[#5a5a6a] text-[10px] mb-1">
                  Booking ID: <span className="font-mono text-[#7a7a8a]">{selectedQR.orderId}</span>
                </p>
                
                <p className="text-[#3a3a4a] text-[9.5px] mb-6 leading-snug">
                  {selectedQR.eventMode === 'online' 
                    ? 'Scan QR or visit link to redirect to Zoom meeting room.' 
                    : 'Show this QR at the entrance gate for check-in.'}
                </p>

                <button
                  onClick={() => setSelectedQR(null)}
                  className="w-full py-3 rounded-[14px] text-white text-[13px] font-black bg-gradient-to-r from-[#c9115f] to-[#cd620e]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
