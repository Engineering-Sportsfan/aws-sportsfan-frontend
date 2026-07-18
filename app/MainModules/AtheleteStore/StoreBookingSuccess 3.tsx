import { useNavigate, useParams } from 'react-router';
import { Check, Calendar, Share2, Bookmark, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { storeService } from '@/services/store.service';

export default function StoreBookingSuccess() {
  const navigate = useNavigate();
  const { id } = useParams(); // This is the orderId
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (id && id !== '1') {
      storeService.getUserOrders('abhishekrt959_gmail_com')
        .then((orders) => {
          const matched = orders.find(o => o.orderId === id || o.id === id);
          if (matched) setOrder(matched);
        })
        .catch((err) => console.error('Error fetching order details:', err));
    }
  }, [id]);

  const displayTitle = order ? order.title : 'Technique Analysis · 60 min';
  const displayId = id ? id.slice(0, 8).toUpperCase() : 'SF360-8471';

  return (
    <div className="bg-black w-full flex justify-center min-h-screen">
      <div className="w-full max-w-[390px] bg-[#0b0b0f] relative flex flex-col min-h-screen">
        {/* Glow background */}
        <div className="absolute top-0 left-0 right-0 h-[350px] overflow-hidden pointer-events-none">
          <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-[rgba(201,17,95,0.18)] blur-[80px]" />
          <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 w-[150px] h-[150px] rounded-full bg-[rgba(205,98,14,0.2)] blur-[60px]" />
        </div>

        {/* Back button */}
        <div className="absolute top-4 left-4 z-20">
          <button
            onClick={() => navigate('/')}
            className="w-[36px] h-[36px] rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center"
          >
            <ArrowLeft className="w-[18px] h-[18px] text-white" />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
          {/* Success ring animation */}
          <div className="relative mb-6">
            <div className="w-[100px] h-[100px] rounded-full bg-gradient-to-br from-[#c9115f] to-[#cd620e] flex items-center justify-center shadow-[0_0_40px_rgba(201,17,95,0.6)]">
              <Check className="w-[48px] h-[48px] text-white" strokeWidth={3} />
            </div>
            {/* Ripple rings */}
            <div className="absolute inset-0 rounded-full border-2 border-[rgba(201,17,95,0.4)] animate-ping" />
          </div>

          <h1 className="text-white text-[26px] font-bold text-center mb-2">Booking Confirmed!</h1>
          <p className="text-[#99A1AF] text-[14px] text-center mb-8">Your session has been successfully booked. Get ready to level up.</p>

          {/* Booking card */}
          <div className="w-full bg-[#111116] rounded-[20px] border border-[rgba(255,255,255,0.08)] p-5 mb-6">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[rgba(255,255,255,0.07)]">
              <div className="w-[48px] h-[48px] rounded-full bg-gradient-to-br from-[#c9115f] to-[#cd620e] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[18px] font-bold">★</span>
              </div>
              <div>
                <p className="text-white text-[15px] font-bold">{displayTitle}</p>
                <p className="text-[#99A1AF] text-[12px]">Confirmed booking</p>
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              {[
                { label: 'Date', value: 'June 17, 2026' },
                { label: 'Time', value: '4:00 PM IST' },
                { label: 'Mode', value: 'Video Call' },
                { label: 'Booking ID', value: displayId },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[#99A1AF] text-[13px]">{label}</span>
                  <span className="text-white text-[13px] font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="w-full flex gap-2 mb-4">
            <button className="flex-1 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-full py-3 flex items-center justify-center gap-1.5">
              <Calendar className="w-[15px] h-[15px] text-[#99A1AF]" />
              <span className="text-[#99A1AF] text-[13px] font-semibold">Add to Calendar</span>
            </button>
            <button className="flex-1 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-full py-3 flex items-center justify-center gap-1.5">
              <Share2 className="w-[15px] h-[15px] text-[#99A1AF]" />
              <span className="text-[#99A1AF] text-[13px] font-semibold">Share</span>
            </button>
            <button className="flex-1 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-full py-3 flex items-center justify-center gap-1.5">
              <Bookmark className="w-[15px] h-[15px] text-[#99A1AF]" />
              <span className="text-[#99A1AF] text-[13px] font-semibold">Save</span>
            </button>
          </div>
        </div>

        {/* CTA */}
        <div className="px-4 pb-8">
          <button
            onClick={() => navigate('/store/my-bookings')}
            className="w-full bg-gradient-to-r from-[#c9115f] to-[#cd620e] rounded-full py-3.5 text-white text-[15px] font-bold shadow-[0_0_20px_rgba(201,17,95,0.5)]"
          >
            Go to My Bookings
          </button>
        </div>
      </div>
    </div>
  );
}
