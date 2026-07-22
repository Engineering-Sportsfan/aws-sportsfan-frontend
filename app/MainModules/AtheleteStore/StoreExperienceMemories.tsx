import { useNavigate } from 'react-router';

import {
  ArrowLeft, CheckCircle2, Calendar, Clock, Bell, MapPin,
  Video, QrCode, Gift, Camera, Award, Star, ShoppingBag, AlertCircle,
} from 'lucide-react';

interface NotifItem {
  id: number;
  type: string;
  title: string;
  body: string;
  time: string;
  icon: React.ElementType;
  iconColor: string;
  read: boolean;
  action?: string;
  actionLabel?: string;
}

const notifications: NotifItem[] = [
  {
    id: 1,
    type: 'confirmation',
    title: 'Booking Confirmed ✓',
    body: 'Your booking for Breakfast with Neeraj Chopra is confirmed. Booking ID: SF360-8471',
    time: '2 weeks ago',
    icon: CheckCircle2,
    iconColor: '#00c864',
    read: true,
  },
  {
    id: 2,
    type: 'calendar',
    title: 'Calendar Reminder Added',
    body: 'We added "Breakfast with Neeraj Chopra" to your calendar for July 18, 2026.',
    time: '2 weeks ago',
    icon: Calendar,
    iconColor: '#cd620e',
    read: true,
  },
  {
    id: 3,
    type: 'reminder',
    title: '24 Hour Reminder',
    body: 'Your experience starts tomorrow at 8:00 AM. Don\'t forget: Smart Casual dress code. Arrive by 7:45 AM.',
    time: '1 day ago',
    icon: Bell,
    iconColor: '#c9115f',
    read: true,
    action: '/store/experience/1',
    actionLabel: 'View Details',
  },
  {
    id: 4,
    type: 'venue',
    title: 'Venue Confirmed',
    body: 'Your experience is at ITC Maurya, Sardar Patel Marg. Complimentary valet parking available.',
    time: '20h ago',
    icon: MapPin,
    iconColor: '#8b5cf6',
    read: true,
    action: '/store/event-pass/1',
    actionLabel: 'View Map',
  },
  {
    id: 5,
    type: 'reminder_1h',
    title: '1 Hour Reminder',
    body: 'Experience starts in 1 hour! Your event pass QR code is ready to show at the venue.',
    time: '6h ago',
    icon: Clock,
    iconColor: '#ff9900',
    read: false,
    action: '/store/event-pass/1',
    actionLabel: 'Show QR Pass',
  },
  {
    id: 6,
    type: 'qr_ready',
    title: 'QR Pass Ready',
    body: 'Your premium event pass for Breakfast with Neeraj Chopra is ready. Show this at the entrance.',
    time: '5h ago',
    icon: QrCode,
    iconColor: '#c9115f',
    read: false,
    action: '/store/event-pass/1',
    actionLabel: 'Open Pass',
  },
  {
    id: 7,
    type: 'starts_soon',
    title: 'Experience Starts Soon',
    body: 'Breakfast with Neeraj Chopra begins in 15 minutes. Enjoy every moment!',
    time: 'Just now',
    icon: AlertCircle,
    iconColor: '#00c864',
    read: false,
  },
  // Future notifications (greyed out / scheduled)
  {
    id: 8,
    type: 'rewards',
    title: 'Rewards Available',
    body: 'Your Experience Badge and 500 SportsFan360 Coins are ready to claim.',
    time: 'Scheduled',
    icon: Gift,
    iconColor: '#FFD700',
    read: false,
  },
  {
    id: 9,
    type: 'photos',
    title: 'Photos Uploaded',
    body: 'Your official event photos are ready in Memories. Download and share!',
    time: 'Scheduled',
    icon: Camera,
    iconColor: '#0ea5e9',
    read: false,
  },
  {
    id: 10,
    type: 'certificate',
    title: 'Certificate Ready',
    body: 'Your digital participation certificate is available to download.',
    time: 'Scheduled',
    icon: Award,
    iconColor: '#cd620e',
    read: false,
  },
  {
    id: 11,
    type: 'memento',
    title: 'Memento Available',
    body: 'Your exclusive signed merchandise is ready. Order within 48 hours.',
    time: 'Scheduled',
    icon: ShoppingBag,
    iconColor: '#8b5cf6',
    read: false,
  },
  {
    id: 12,
    type: 'review',
    title: 'Review Reminder',
    body: 'How was your Breakfast with Neeraj Chopra experience? Share your feedback.',
    time: 'Scheduled',
    icon: Star,
    iconColor: '#FFD700',
    read: false,
  },
];

export default function StoreExperienceNotifications() {
  const navigate = useNavigate();

  const current = notifications.filter((n) => n.time !== 'Scheduled');
  const scheduled = notifications.filter((n) => n.time === 'Scheduled');

  return (
    <div className="bg-black w-full flex justify-center" style={{ height: '100dvh', overflow: 'hidden' }}>
      <div className="w-full max-w-[390px] bg-[#0b0b0f] flex flex-col" style={{ height: '100dvh' }}>
        {/* Header */}
        <div className="sticky top-0 z-50 bg-[#0b0b0f] border-b border-[rgba(255,255,255,0.05)]">
          <div className="h-[56px] flex items-center px-4 gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-[36px] h-[36px] rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center"
            >
              <ArrowLeft className="w-[18px] h-[18px] text-white" />
            </button>
            <h1 className="text-white font-black text-[17px]">Experience Notifications</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-[70px] no-scrollbar">
          {/* Journey context banner */}
          <div className="mx-4 mt-4 p-3.5 rounded-[14px] bg-gradient-to-r from-[rgba(201,17,95,0.15)] to-[rgba(205,98,14,0.15)] border border-[rgba(201,17,95,0.25)]">
            <p className="text-[#c9115f] text-[9px] font-black uppercase tracking-wide mb-1">Active Journey</p>
            <p className="text-white text-[13px] font-bold">Breakfast with Neeraj Chopra</p>
            <p className="text-[#99A1AF] text-[10px]">July 18, 2026 · ITC Maurya, New Delhi</p>
          </div>

          {/* Active notifications */}
          <div className="px-4 mt-4">
            <p className="text-[#6b7280] text-[10px] font-black uppercase tracking-widest mb-3">Recent</p>
            <div className="flex flex-col gap-2">
              {current.map((n) => {
                const Icon = n.icon;
                const isUnread = !n.read;
                return (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 p-3.5 rounded-[16px] border"
                    style={{
                      background: isUnread ? 'rgba(201,17,95,0.06)' : '#111116',
                      borderColor: isUnread ? 'rgba(201,17,95,0.2)' : 'rgba(255,255,255,0.07)',
                    }}
                  >
                    <div
                      className="w-[36px] h-[36px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `${n.iconColor}18`, border: `1px solid ${n.iconColor}30` }}
                    >
                      <Icon className="w-[15px] h-[15px]" style={{ color: n.iconColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-white text-[12px] font-bold leading-tight">{n.title}</p>
                        {isUnread && (
                          <div className="w-[6px] h-[6px] rounded-full bg-[#c9115f] flex-shrink-0 ml-2" />
                        )}
                      </div>
                      <p className="text-[#99A1AF] text-[11px] leading-relaxed mb-1.5">{n.body}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[#4a4a5a] text-[10px]">{n.time}</span>
                        {n.action && (
                          <button
                            onClick={() => navigate(n.action!)}
                            className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                            style={{ background: `${n.iconColor}18`, color: n.iconColor, border: `1px solid ${n.iconColor}30` }}
                          >
                            {n.actionLabel}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scheduled / upcoming notifications */}
          <div className="px-4 mt-5 mb-4">
            <p className="text-[#6b7280] text-[10px] font-black uppercase tracking-widest mb-3">After Experience</p>
            <div className="flex flex-col gap-2">
              {scheduled.map((n) => {
                const Icon = n.icon;
                return (
                  <div
                    key={n.id}
                    className="flex items-center gap-3 p-3 rounded-[14px] border border-[rgba(255,255,255,0.05)] opacity-50"
                    style={{ background: '#111116' }}
                  >
                    <div
                      className="w-[32px] h-[32px] rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: `${n.iconColor}10` }}
                    >
                      <Icon className="w-[13px] h-[13px]" style={{ color: n.iconColor }} />
                    </div>
                    <div>
                      <p className="text-white text-[11px] font-semibold">{n.title}</p>
                      <p className="text-[#4a4a5a] text-[10px]">Scheduled · After completion</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* <BottomNav active="store" /> */}
      </div>
    </div>
  );
}