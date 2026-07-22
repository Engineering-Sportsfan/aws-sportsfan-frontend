'use client';

import { useRouter, useParams } from 'next/navigation';

import {
  ArrowLeft, Download, Share2, Award, Coins, Star, Gift,
  ShoppingBag, CheckCircle2, ChevronRight, Camera, Play,
} from 'lucide-react';
import { useState } from 'react';

type Tab = 'memories' | 'rewards' | 'mementos';

const photos = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=300&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1544899489-a083461b088c?w=300&h=300&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300&h=300&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=300&h=300&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=300&h=300&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&auto=format',
];

const rewards = [
  {
    id: 1,
    label: 'Experience Badge',
    sub: '"Breakfast Champion" unlocked',
    icon: Award,
    color: '#FFD700',
    claimed: true,
    type: 'badge',
  },
  {
    id: 2,
    label: '500 SF360 Coins',
    sub: 'Added to your wallet',
    icon: Coins,
    color: '#cd620e',
    claimed: true,
    type: 'coins',
  },
  {
    id: 3,
    label: '₹250 Wallet Credit',
    sub: 'Use on your next booking',
    icon: Gift,
    color: '#c9115f',
    claimed: false,
    type: 'credit',
  },
  {
    id: 4,
    label: 'Elite Membership — 7 Days',
    sub: 'Complimentary trial activated',
    icon: Star,
    color: '#8b5cf6',
    claimed: false,
    type: 'subscription',
  },
  {
    id: 5,
    label: '15% Coupon Unlocked',
    sub: 'On next experience booking',
    icon: Gift,
    color: '#00c864',
    claimed: false,
    type: 'coupon',
  },
];

const mementos = [
  {
    id: 1,
    title: 'Signed Training Jersey',
    sub: 'Neeraj Chopra · Authenticated',
    image: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=300&h=200&fit=crop&auto=format',
    price: '₹8,999',
    available: true,
    tracking: null,
  },
  {
    id: 2,
    title: 'Signed Competition Bib',
    sub: 'Neeraj Chopra · Limited Edition',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=300&h=200&fit=crop&auto=format',
    price: '₹4,499',
    available: true,
    tracking: null,
  },
  {
    id: 3,
    title: 'Signed Cap',
    sub: 'Limited to 8 participants',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=300&h=200&fit=crop&auto=format',
    price: '₹2,999',
    available: false,
    tracking: 'IN TRANSIT · ETA July 22',
  },
];

export default function StoreExperienceMemories() {
  const router = useRouter();
  const { id } = useParams();
  const [tab, setTab] = useState<Tab>('memories');
  const [claimedRewards, setClaimedRewards] = useState<Set<number>>(new Set([1, 2]));

  return (
    <div className="bg-black w-full flex justify-center" style={{ height: '100dvh', overflow: 'hidden' }}>
      <div className="w-full max-w-[390px] bg-[#0b0b0f] flex flex-col" style={{ height: '100dvh' }}>
        {/* Header */}
        <div className="sticky top-0 z-50 bg-[#0b0b0f] border-b border-[rgba(255,255,255,0.05)]">
          <div className="h-[56px] flex items-center px-4 gap-3">
            <button
              onClick={() => router.back()}
              className="w-[36px] h-[36px] rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center"
            >
              <ArrowLeft className="w-[18px] h-[18px] text-white" />
            </button>
            <h1 className="text-white font-black text-[17px]">Memories & Rewards</h1>
          </div>

          {/* Tabs */}
          <div className="flex px-4 pb-3 gap-2">
            {(['memories', 'rewards', 'mementos'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-full text-[11px] font-bold capitalize transition-all ${
                  tab === t
                    ? 'bg-gradient-to-r from-[#c9115f] to-[#cd620e] text-white'
                    : 'bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] text-[#99A1AF]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-[70px] no-scrollbar">
          {/* Experience header */}
          <div className="px-4 py-4 border-b border-[rgba(255,255,255,0.05)]">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-[14px] h-[14px] text-[#00c864]" />
              <span className="text-[#00c864] text-[10px] font-black">EXPERIENCE COMPLETED</span>
            </div>
            <p className="text-white text-[15px] font-black">Breakfast with Neeraj Chopra</p>
            <p className="text-[#99A1AF] text-[11px]">July 18, 2026 · ITC Maurya, New Delhi</p>
          </div>

          {tab === 'memories' && (
            <div>
              {/* Photo grid */}
              <div className="px-4 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Camera className="w-[13px] h-[13px] text-[#c9115f]" />
                    <p className="text-white text-[13px] font-black">Event Photos</p>
                  </div>
                  <button className="flex items-center gap-1 text-[#c9115f] text-[11px] font-bold">
                    <Download className="w-[11px] h-[11px]" /> All
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1.5 mb-5">
                  {photos.map((src, i) => (
                    <div key={i} className="relative rounded-[10px] overflow-hidden aspect-square">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      {i === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <Play className="w-[18px] h-[18px] text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Certificate */}
                <div
                  className="rounded-[16px] overflow-hidden mb-4"
                  style={{
                    background: 'linear-gradient(145deg, #1a0d08, #0d0a18)',
                    border: '1px solid rgba(201,17,95,0.3)',
                  }}
                >
                  <div className="h-[3px]" style={{ background: 'linear-gradient(90deg,#c9115f,#cd620e)' }} />
                  <div className="p-4 text-center">
                    <div className="text-[20px] mb-1">🏆</div>
                    <p className="text-[#c9115f] text-[9px] font-black tracking-widest uppercase mb-1">Certificate of Participation</p>
                    <p className="text-white text-[14px] font-black">Breakfast with Neeraj Chopra</p>
                    <p className="text-[#99A1AF] text-[10px] mb-3">July 18, 2026 · Authenticated by SportsFan360</p>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 rounded-full bg-gradient-to-r from-[#c9115f] to-[#cd620e] text-white text-[11px] font-bold flex items-center justify-center gap-1">
                        <Download className="w-[11px] h-[11px]" /> Download
                      </button>
                      <button className="flex-1 py-2 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] text-[#99A1AF] text-[11px] font-bold flex items-center justify-center gap-1">
                        <Share2 className="w-[11px] h-[11px]" /> Share
                      </button>
                    </div>
                  </div>
                  <div className="h-[3px]" style={{ background: 'linear-gradient(90deg,#cd620e,#c9115f)' }} />
                </div>

                {/* Highlights */}
                <div className="mb-4">
                  <p className="text-white text-[13px] font-black mb-2">Highlights</p>
                  <div className="relative rounded-[14px] overflow-hidden h-[180px]">
                    <img
                      src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=360&fit=crop&auto=format"
                      alt="Highlight"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-[56px] h-[56px] rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Play className="w-[22px] h-[22px] text-white ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <p className="text-white text-[11px] font-bold">Experience Highlights Reel</p>
                      <p className="text-[#99A1AF] text-[9px]">3 min · Official Edit</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'rewards' && (
            <div className="px-4 pt-4 flex flex-col gap-3">
              {/* XP bar */}
              <div className="bg-[#111116] rounded-[16px] border border-[rgba(255,255,255,0.07)] p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white text-[13px] font-black">Experience XP</p>
                  <span className="text-[#cd620e] text-[13px] font-black">+350 XP</span>
                </div>
                <div className="h-[6px] rounded-full bg-[rgba(255,255,255,0.08)] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: '68%', background: 'linear-gradient(90deg,#c9115f,#cd620e)' }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[#99A1AF] text-[9px]">Level 4</span>
                  <span className="text-[#99A1AF] text-[9px]">680 / 1000 XP to Level 5</span>
                </div>
              </div>

              {/* Rewards list */}
              {rewards.map((r) => {
                const Icon = r.icon;
                const isClaimed = claimedRewards.has(r.id);
                return (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 bg-[#111116] rounded-[16px] border p-4"
                    style={{ borderColor: isClaimed ? 'rgba(0,200,100,0.2)' : 'rgba(255,255,255,0.07)' }}
                  >
                    <div
                      className="w-[44px] h-[44px] rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: `${r.color}18`, border: `1px solid ${r.color}35` }}
                    >
                      <Icon className="w-[20px] h-[20px]" style={{ color: r.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-[13px] font-bold">{r.label}</p>
                      <p className="text-[#99A1AF] text-[10px]">{r.sub}</p>
                    </div>
                    {isClaimed ? (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-[14px] h-[14px] text-[#00c864]" />
                        <span className="text-[#00c864] text-[10px] font-bold">Claimed</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setClaimedRewards((prev) => new Set([...prev, r.id]))}
                        className="px-3 py-1.5 rounded-full text-[10px] font-black text-white"
                        style={{
                          background: `linear-gradient(90deg,${r.color},${r.color}cc)`,
                          boxShadow: `0 0 8px ${r.color}40`,
                        }}
                      >
                        Claim
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'mementos' && (
            <div className="px-4 pt-4 flex flex-col gap-4">
              <p className="text-[#99A1AF] text-[12px] leading-relaxed">
                Exclusive memorabilia from your experience — signed and authenticated by SportsFan360.
              </p>
              {mementos.map((m) => (
                <div
                  key={m.id}
                  className="bg-[#111116] rounded-[18px] border border-[rgba(255,255,255,0.07)] overflow-hidden"
                >
                  <div className="relative h-[140px]">
                    <img src={m.image} alt={m.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent" />
                    {m.tracking && (
                      <div className="absolute top-3 right-3 bg-[rgba(0,200,100,0.2)] border border-[rgba(0,200,100,0.4)] rounded-full px-2 py-1">
                        <span className="text-[#00c864] text-[8px] font-black">{m.tracking}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3.5">
                    <p className="text-white text-[13px] font-bold mb-0.5">{m.title}</p>
                    <p className="text-[#99A1AF] text-[11px] mb-3">{m.sub}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c9115f] to-[#cd620e] text-[15px] font-black">{m.price}</span>
                      {m.tracking ? (
                        <button className="flex items-center gap-1 text-[#00c864] text-[11px] font-semibold">
                          Track Shipment <ChevronRight className="w-[12px] h-[12px]" />
                        </button>
                      ) : m.available ? (
                        <button className="px-4 py-2 rounded-full bg-gradient-to-r from-[#c9115f] to-[#cd620e] text-white text-[11px] font-bold flex items-center gap-1.5">
                          <ShoppingBag className="w-[11px] h-[11px]" /> Order Now
                        </button>
                      ) : (
                        <span className="text-[#6b7280] text-[11px]">Sold Out</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <p className="text-[#4a4a5a] text-[10px] text-center pb-2">
                Certificate of Authenticity included with every signed item.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}