'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Calendar, MapPin, Video, QrCode } from 'lucide-react';
import { useState, useEffect } from 'react';
import { storeService } from '@/services/store.service';
import QRCode from 'react-qr-code';
import { useAuth } from '@/context/AuthContext';

export default function StoreEventPass() {
  const router = useRouter();
  const params = useParams(); // orderId
  const { user } = useAuth();
  const userId = user?.userId || user?.email || '';
  const [pass, setPass] = useState<any>(null);
  const [loading, setLoading] = useState(true);

   const id = Array.isArray(params.id) ? params.id[0] : params.id; 

  useEffect(() => {
    if (!id || !userId) return;
    setLoading(true);
      storeService.getEventPass(id as string, userId)
      .then((data) => {
        setPass(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching event pass:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="bg-black w-full flex justify-center min-h-screen text-white items-center">
        <p className="text-[#99A1AF] text-[13px]">Loading event pass...</p>
      </div>
    );
  }

  if (!pass) {
    return (
      <div className="bg-black w-full flex justify-center min-h-screen text-white items-center">
        <p className="text-[#ff4444] text-[13px]">Pass details not found</p>
      </div>
    );
  }

  const formattedDate = pass.date
    ? new Date(pass.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Date TBA';

  const formattedTime = pass.date
    ? new Date(pass.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : 'Time TBA';

  return (
    <div className="bg-black w-full flex justify-center min-h-screen">
      <div className="w-full max-w-[390px] bg-[#0b0b0f] relative flex flex-col min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-[#0b0b0f] border-b border-[rgba(255,255,255,0.05)] h-[56px] flex items-center px-4 gap-3">
          <button
            onClick={() => router.back()}
            className="w-[36px] h-[36px] rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center"
          >
            <ArrowLeft className="w-[18px] h-[18px] text-white" />
          </button>
          <div>
            <h1 className="text-white font-bold text-[17px]">Event Pass</h1>
            <p className="text-[#99A1AF] text-[11px]">Show this pass at entry</p>
          </div>
        </div>

        {/* Pass Card Container */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 pb-20">
          <div className="w-full bg-[#111116] rounded-[24px] border border-[rgba(201,17,95,0.3)] overflow-hidden shadow-[0_0_30px_rgba(201,17,95,0.15)] flex flex-col">
            
            {/* Header section with gradient */}
            <div className="bg-gradient-to-r from-[#c9115f] to-[#cd620e] p-4 text-center">
              <span className="text-white font-black tracking-wider text-[11px] uppercase">Official Entry Pass</span>
            </div>

            <div className="p-6 flex-1 flex flex-col items-center">
              {/* Event details */}
              <h2 className="text-white font-black text-[18px] text-center mb-1 leading-tight">{pass.title}</h2>
              <p className="text-[#99A1AF] text-[12px] mb-6">{pass.athlete}</p>

              {/* QR Code */}
              <div className="bg-white p-4 rounded-[16px] mb-6 shadow-inner flex justify-center items-center">
                <QRCode 
                  value={pass.joinToken 
                    ? `${window.location.origin}/store/events/join/${pass.joinToken}` 
                    : `${window.location.origin}/store/events/checkin/${pass.eventPassToken || pass.bookingId || id}`
                  } 
                  size={150} 
                />
              </div>

              {/* Participant & Booking ID */}
              <div className="w-full bg-[rgba(255,255,255,0.03)] rounded-[12px] p-3 mb-5 border border-[rgba(255,255,255,0.05)] text-center">
                <p className="text-[#6a6a7a] text-[9px] uppercase tracking-wider font-bold mb-0.5">Attendee</p>
                <p className="text-white text-[13px] font-bold mb-2.5">{pass.participantName}</p>
                
                <p className="text-[#6a6a7a] text-[9px] uppercase tracking-wider font-bold mb-0.5">Booking ID</p>
                <p className="text-[#cd620e] text-[13px] font-mono font-bold">{pass.bookingId.substring(0, 8).toUpperCase()}</p>
              </div>

              {/* Location/Time specs */}
              <div className="w-full flex flex-col gap-2.5 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-2.5 text-[11px]">
                  <Calendar className="w-[14px] h-[14px] text-[#99A1AF]" />
                  <span className="text-[#99A1AF] font-medium">Date/Time:</span>
                  <span className="text-white font-semibold">{formattedDate} · {formattedTime}</span>
                </div>
                {pass.onlineLink ? (
                  <div className="flex items-center gap-2.5 text-[11px]">
                    <Video className="w-[14px] h-[14px] text-[#99A1AF]" />
                    <span className="text-[#99A1AF] font-medium">Virtual Room:</span>
                    <a href={pass.onlineLink} target="_blank" rel="noreferrer" className="text-[#00c864] font-semibold underline break-all">
                      {pass.onlineLink}
                    </a>
                  </div>
                ) : (
                  <div className="flex gap-2.5 text-[11px]">
                    <MapPin className="w-[14px] h-[14px] text-[#99A1AF] mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-[#99A1AF] font-medium">Venue: </span>
                      <span className="text-white font-semibold">{pass.venue || 'TBA'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}