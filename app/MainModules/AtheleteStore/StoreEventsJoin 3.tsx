import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Video, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { storeService } from '@/services/store.service';

export default function StoreEventsJoin() {
  const { joinToken } = useParams<{ joinToken: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meetingData, setMeetingData] = useState<{ meetingUrl: string; event: { title: string; eventDate: string } } | null>(null);

  useEffect(() => {
    if (!joinToken) {
      setError('Missing join token');
      setLoading(false);
      return;
    }

    storeService.validateJoinToken(joinToken)
      .then((res) => {
        setMeetingData(res);
        setLoading(false);
      })
      .catch((err: any) => {
        setError(err.response?.data?.message || err.message || 'Verification failed');
        setLoading(false);
      });
  }, [joinToken]);

  return (
    <div className="bg-black w-full flex justify-center min-h-screen">
      <div className="w-full max-w-[390px] bg-[#0b0b0f] relative flex flex-col min-h-screen px-4 pt-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate('/store/my-bookings')}
            className="w-[36px] h-[36px] rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center"
          >
            <ArrowLeft className="w-[18px] h-[18px] text-white" />
          </button>
          <h1 className="text-white font-bold text-[17px]">Online Event Access</h1>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center pb-20">
          {loading && (
            <div className="flex flex-col items-center">
              <div className="w-[44px] h-[44px] rounded-full border-4 border-t-[#c9115f] border-r-transparent border-b-transparent border-l-transparent animate-spin mb-4" />
              <p className="text-[#99A1AF] text-[14px]">Verifying your join token...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center max-w-[300px]">
              <div className="w-[60px] h-[60px] rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                <AlertTriangle className="w-[28px] h-[28px] text-red-500" />
              </div>
              <h2 className="text-white text-[16px] font-bold mb-2">Access Denied</h2>
              <p className="text-[#99A1AF] text-[12px] leading-relaxed mb-6">{error}</p>
              <button
                onClick={() => navigate('/store/my-bookings')}
                className="px-6 py-2 rounded-full bg-[rgba(255,255,255,0.06)] text-white text-[12px] font-semibold"
              >
                Go to My Bookings
              </button>
            </div>
          )}

          {meetingData && (
            <div className="flex flex-col items-center w-full">
              <div className="w-[72px] h-[72px] rounded-full bg-[#00c864]/10 border border-[#00c864]/20 flex items-center justify-center mb-6">
                <Video className="w-[32px] h-[32px] text-[#00c864]" />
              </div>
              
              <span className="text-[10px] font-black px-3 py-1 rounded-full text-black bg-[#00c864] mb-3">
                ACCESS VERIFIED
              </span>
              
              <h2 className="text-white text-[20px] font-black leading-tight mb-2">
                {meetingData.event.title}
              </h2>
              
              <p className="text-[#99A1AF] text-[12px] mb-8">
                {meetingData.event.eventDate || 'Upcoming Online Event'}
              </p>

              <a
                href={meetingData.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 rounded-[16px] text-white text-[14px] font-black flex items-center justify-center gap-2 bg-gradient-to-r from-[#c9115f] to-[#cd620e] shadow-[0_6px_20px_rgba(201,17,95,0.45)] active:scale-[0.98] transition-transform"
              >
                Join Meeting Room
                <ExternalLink className="w-[15px] h-[15px]" />
              </a>

              <p className="text-[#4a4a5a] text-[10px] mt-4">
                Clicking the button will open Zoom / meeting link in a new window.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
