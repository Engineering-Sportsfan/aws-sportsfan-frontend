import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, MapPin, Clock, Calendar, QrCode, Video, Shield, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { storeService } from '@/services/store.service';

export default function StoreExperienceOrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams(); // orderId
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    storeService.getExperienceOrderById(id)
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching experience order:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="bg-black w-full flex justify-center min-h-screen text-white items-center">
        <p className="text-[#99A1AF] text-[13px]">Loading details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-black w-full flex justify-center min-h-screen text-white items-center">
        <p className="text-[#ff4444] text-[13px]">Order not found</p>
      </div>
    );
  }

  const p = order.productDetails || {};
  const formattedDate = order.eventDate
    ? new Date(order.eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Date TBA';

  const formattedTime = order.eventDate
    ? new Date(order.eventDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : 'Time TBA';

  return (
    <div className="bg-black w-full flex justify-center min-h-screen">
      <div className="w-full max-w-[390px] bg-[#0b0b0f] relative flex flex-col min-h-screen pb-[100px]">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-[#0b0b0f] border-b border-[rgba(255,255,255,0.05)] h-[56px] flex items-center px-4 gap-3">
          <button
            onClick={() => navigate('/store/my-experiences')}
            className="w-[36px] h-[36px] rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center"
          >
            <ArrowLeft className="w-[18px] h-[18px] text-white" />
          </button>
          <div>
            <h1 className="text-white font-bold text-[17px]">Experience Booking</h1>
            <p className="text-[#99A1AF] text-[11px]">ID: {order.orderId.substring(0, 8).toUpperCase()}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-4">
          {/* Card Image Banner */}
          <div className="relative h-[160px] rounded-[18px] overflow-hidden mb-5">
            <img src={p.image} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-3 left-3">
              <span className="text-white text-[10px] font-bold px-2.5 py-1 rounded-full mb-2 inline-block" style={{ backgroundColor: p.tagColor || '#c9115f' }}>
                {p.tag || 'VIP Experience'}
              </span>
              <h2 className="text-white text-[16px] font-black">{order.title}</h2>
              <p className="text-[#99A1AF] text-[11px]">{p.athlete}</p>
            </div>
          </div>

          {/* Quick info row */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-[#111116] rounded-[14px] p-3 border border-[rgba(255,255,255,0.07)]">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-[14px] h-[14px] text-[#c9115f]" />
                <span className="text-[#99A1AF] text-[10px] font-bold uppercase">Date</span>
              </div>
              <p className="text-white text-[12px] font-bold">{formattedDate}</p>
            </div>
            <div className="bg-[#111116] rounded-[14px] p-3 border border-[rgba(255,255,255,0.07)]">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-[14px] h-[14px] text-[#cd620e]" />
                <span className="text-[#99A1AF] text-[10px] font-bold uppercase">Time & Duration</span>
              </div>
              <p className="text-white text-[12px] font-bold">{formattedTime} ({p.duration || 'N/A'})</p>
            </div>
          </div>

          {/* Location details */}
          <div className="bg-[#111116] rounded-[14px] p-4 border border-[rgba(255,255,255,0.07)] mb-5">
            <h3 className="text-white text-[13px] font-bold mb-2 flex items-center gap-1.5">
              {p.type === 'online' ? <Video className="w-[14px] h-[14px] text-[#00c864]" /> : <MapPin className="w-[14px] h-[14px] text-[#00c864]" />}
              {p.type === 'online' ? 'Online Details' : 'Venue Details'}
            </h3>
            {p.type === 'online' ? (
              <div>
                <p className="text-[#99A1AF] text-[12px] mb-2">This is a virtual event. You can access the meeting link below or from the Event Pass.</p>
                <div className="bg-[rgba(0,200,100,0.08)] border border-[rgba(0,200,100,0.2)] rounded-[10px] px-3 py-2 font-mono text-[11px] text-[#00c864] break-all">
                  {p.onlineLink || 'Link will be generated soon'}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-white text-[13px] font-semibold">{p.venue}</p>
                <p className="text-[#99A1AF] text-[11px] mt-1">{p.venueAddress}</p>
                {p.parking && (
                  <p className="text-[#99A1AF] text-[11px] mt-2 border-t border-[rgba(255,255,255,0.05)] pt-2">
                    <span className="text-white font-semibold">Parking: </span>{p.parking}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Agenda section */}
          {p.agenda && p.agenda.length > 0 && (
            <div className="bg-[#111116] rounded-[14px] p-4 border border-[rgba(255,255,255,0.07)] mb-5">
              <h3 className="text-white text-[13px] font-bold mb-3 flex items-center gap-1.5">
                <Info className="w-[14px] h-[14px] text-[#c9115f]" /> Event Agenda
              </h3>
              <div className="flex flex-col gap-3">
                {p.agenda.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-3 text-[12px]">
                    <span className="text-[#cd620e] font-bold w-[70px] flex-shrink-0">{item.time}</span>
                    <span className="text-[#c8c8d0]">{item.item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rules section */}
          {p.rules && p.rules.length > 0 && (
            <div className="bg-[#111116] rounded-[14px] p-4 border border-[rgba(255,255,255,0.07)] mb-5">
              <h3 className="text-white text-[13px] font-bold mb-3 flex items-center gap-1.5">
                <Shield className="w-[14px] h-[14px] text-[#cd620e]" /> Dress Code & Rules
              </h3>
              <div className="flex flex-col gap-2">
                {p.dressCode && (
                  <p className="text-[12px] text-[#c8c8d0] mb-2">
                    <span className="text-white font-semibold">Dress Code: </span>{p.dressCode}
                  </p>
                )}
                {p.arrivalTime && (
                  <p className="text-[12px] text-[#c8c8d0] mb-2">
                    <span className="text-white font-semibold">Arrival Time: </span>{p.arrivalTime}
                  </p>
                )}
                {p.rules.map((rule: string, idx: number) => (
                  <div key={idx} className="flex gap-2 text-[12px] text-[#99A1AF]">
                    <span className="text-[#c9115f]">•</span>
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#0b0b0f] border-t border-[rgba(255,255,255,0.07)] px-4 py-3">
          <button
            onClick={() => navigate(`/store/event-pass/${order.orderId}`)}
            className="w-full bg-gradient-to-r from-[#c9115f] to-[#cd620e] rounded-full py-3.5 text-white text-[15px] font-bold shadow-[0_0_20px_rgba(201,17,95,0.5)] flex items-center justify-center gap-2"
          >
            <QrCode className="w-[16px] h-[16px]" /> Show Event Pass
          </button>
        </div>
      </div>
    </div>
  );
}