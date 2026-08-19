'use client';


import { ArrowLeft, Timer, Users, TrendingUp, Bookmark, CheckCircle, Clock, Shield, ChevronRight, ToggleLeft, ToggleRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { storeService } from '@/services/store.service';
import { formatPrice } from '@/utils/formatters';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type GovernanceStatus = 'approved' | 'pending';

function GovernanceTag({ status }: { status: GovernanceStatus }) {
  if (status === 'pending') return null;
  return status === 'approved' ? (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(0,200,100,0.08)] border border-[rgba(0,200,100,0.25)]">
      <CheckCircle className="w-[10px] h-[10px] text-[#00c864]" />
      <span className="text-[10px] font-semibold text-[#00c864]">AFI Approved</span>
    </div>
  ) : null;
}

function getTargetMs(endsAt: any): number {
  if (!endsAt) return 0;
  if (typeof endsAt === 'string') {
    return new Date(endsAt).getTime();
  } else if (typeof endsAt === 'number') {
    return endsAt;
  } else if (endsAt instanceof Date) {
    return endsAt.getTime();
  } else if (typeof endsAt === 'object') {
    const seconds = endsAt.seconds !== undefined ? endsAt.seconds : endsAt._seconds;
    const nanoseconds = endsAt.nanoseconds !== undefined ? endsAt.nanoseconds : endsAt._nanoseconds;
    if (seconds !== undefined) {
      const secsNum = typeof seconds === 'object' && seconds !== null ? (seconds.low || 0) : Number(seconds);
      const nanosNum = typeof nanoseconds === 'object' && nanoseconds !== null ? (nanoseconds.low || 0) : Number(nanoseconds || 0);
      return secsNum * 1000 + nanosNum / 1e6;
    } else if (typeof endsAt.toDate === 'function') {
      return endsAt.toDate().getTime();
    }
  }
  const parsed = new Date(endsAt).getTime();
  return isNaN(parsed) ? 0 : parsed;
}

function Countdown({ endsAt, onComplete }: { endsAt: any; onComplete?: () => void }) {
  const targetMs = getTargetMs(endsAt);
  const [secs, setSecs] = useState(() => Math.max(0, Math.round((targetMs - Date.now()) / 1000)));

  useEffect(() => {
    if (!targetMs) return;

    setSecs(Math.max(0, Math.round((targetMs - Date.now()) / 1000)));

    const t = setInterval(() => {
      const remaining = Math.max(0, Math.round((targetMs - Date.now()) / 1000));
      setSecs(remaining);
      if (remaining <= 0) {
        clearInterval(t);
        if (onComplete) onComplete();
      }
    }, 1000);
    return () => clearInterval(t);
  }, [targetMs]);

  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const fmt = (n: number) => n.toString().padStart(2, '0');

  return (
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c9115f] to-[#cd620e] font-bold tabular-nums">
      {h > 0 ? `${fmt(h)}:${fmt(m)}:${fmt(s)}` : `${fmt(m)}:${fmt(s)}`}
    </span>
  );
}


function AuctionDetail({ auctionId, dbId, title, description, image, reservePrice, onBack }: {
  auctionId: number;
  dbId: string;
  title: string;
  description: string;
  image: string;
  reservePrice: number;
  onBack: () => void;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.userId || user?.email || 'mock-user-123';

  const [currentBidPaise, setCurrentBidPaise] = useState<number>(0);
  const [bids, setBids] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(172800);
  const [endsAtField, setEndsAtField] = useState<any>(null);
  const [minIncrementPaise, setMinIncrementPaise] = useState<number>(50000);
  const [status, setStatus] = useState<string>('active');
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [winnerPaymentStatus, setWinnerPaymentStatus] = useState<string | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState<boolean>(false);
  const [isPaying, setIsPaying] = useState<boolean>(false);
  const [showWonModal, setShowWonModal] = useState<boolean>(false);
  const [hasShownCongratulations, setHasShownCongratulations] = useState<boolean>(false);

  const [bidAmountInput, setBidAmountInput] = useState('');
  const [autoBid, setAutoBid] = useState(false);
  const [autoBidCeiling, setAutoBidCeiling] = useState('');
  const [bookmarked, setBookmarked] = useState(false);
  const [bidPlaced, setBidPlaced] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const loadAuctionData = async () => {
    try {
      const product = await storeService.getProductById(dbId);
      setCurrentBidPaise(product.currentBidPaise || product.pricePaise || 0);
      setMinIncrementPaise(product.minIncrementPaise || 50000);
      setStatus(product.status || 'active');
      setEndsAtField(product.endsAt);
      setWinnerId(product.winnerId || null);
      setWinnerPaymentStatus(product.winnerPaymentStatus || null);

      if (product.status === 'closed' && product.winnerId === userId && !hasShownCongratulations && product.winnerPaymentStatus === 'pending') {
        setShowWonModal(true);
        setHasShownCongratulations(true);
      }

      const bidList = await storeService.getBids(dbId);
      // Backend returns bids desc by amountPaise
      setBids(bidList);

      if (product.endsAt) {
        const diff = Math.max(0, Math.round((new Date(product.endsAt).getTime() - Date.now()) / 1000));
        setTimeLeft(diff);
      }
    } catch (err) {
      console.error('Error loading auction:', err);
    }
  };

  const handleCompletePayment = async () => {
    setInlineError(null);
    setIsPaying(true);
    try {
      const res = await storeService.checkout({
        productId: dbId,
        userId,
        paymentMethod: 'wallet',
        pricePaise: currentBidPaise,
        idempotencyKey: `complete-payment-${dbId}`,
      });
      if (res.success) {
        setPaymentCompleted(true);
        loadAuctionData();
      }
    } catch (err: any) {
      setInlineError(err.message || 'Failed to complete payment.');
    } finally {
      setIsPaying(false);
    }
  };

  useEffect(() => {
    loadAuctionData();
    const interval = setInterval(loadAuctionData, 5000); // Poll every 5s for real-time bid updates
    return () => clearInterval(interval);
  }, [dbId]);

  const [autoBidStatusMessage, setAutoBidStatusMessage] = useState<string | null>(null);

  const handlePlaceBid = async () => {
    setInlineError(null);
    setAutoBidStatusMessage(null);

    if (autoBid) {
      // Validate Auto-Bid Ceiling
      const parsedCeiling = parseFloat(autoBidCeiling);
      if (isNaN(parsedCeiling) || parsedCeiling <= 0) {
        setInlineError('Please enter a valid max ceiling amount.');
        return;
      }
      const ceilingPaise = Math.round(parsedCeiling * 100);
      if (ceilingPaise <= currentBidPaise) {
        setInlineError(`Max ceiling must be greater than the current bid of ${formatPrice(currentBidPaise)}`);
        return;
      }

      try {
        const res = await storeService.toggleAutoBid(dbId, ceilingPaise, true, userId);
        if (res.success) {
          setAutoBidStatusMessage(`Auto-bid active up to ${formatPrice(ceilingPaise)}`);
          loadAuctionData();
        }
      } catch (err: any) {
        setInlineError(err.message || 'Failed to update auto-bid setting.');
      }
      return;
    }

    // Validate Manual Bid
    const inputVal = parseFloat(bidAmountInput);
    if (isNaN(inputVal) || inputVal <= 0) {
      setInlineError('Please enter a valid bid amount.');
      return;
    }

    const bidPaise = Math.round(inputVal * 100);
    const minRequired = currentBidPaise + minIncrementPaise;

    if (bidPaise <= currentBidPaise) {
      setInlineError(`Bid must be greater than current bid of ${formatPrice(currentBidPaise)}`);
      return;
    }

    if (bidPaise < minRequired) {
      setInlineError(`Bid must satisfy the minimum increment. Minimum allowed bid is ${formatPrice(minRequired)}`);
      return;
    }

    try {
      const res = await storeService.placeBid(dbId, bidPaise, userId);
      if (res.success) {
        setBidPlaced(true);
        loadAuctionData();
      }
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('BID_TOO_LOW')) {
        setInlineError('Bid rejected: Your bid is lower than or equal to the current bid.');
      } else if (msg.includes('BELOW_MIN_INCREMENT')) {
        setInlineError('Bid rejected: Your bid is below the minimum increment threshold.');
      } else if (msg.includes('AUCTION_CLOSED')) {
        setInlineError('Bid rejected: This auction has closed.');
      } else {
        setInlineError(err.message || 'Failed to place bid. Please try again.');
      }
    }
  };

  const handleToggleAutoBid = async () => {
    setInlineError(null);
    setAutoBidStatusMessage(null);
    const nextState = !autoBid;

    // Toggle state locally.
    setAutoBid(nextState);
    if (nextState) {
      setBidAmountInput('');   // clear manual field when switching to auto-bid
    } else {
      setAutoBidCeiling('');   // clear ceiling field when switching back to manual
    }
  };

  if (paymentCompleted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="w-[70px] h-[70px] rounded-full bg-gradient-to-br from-[#00c864] to-[#0b9c55] flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(0,200,100,0.4)]">
          <CheckCircle className="w-[28px] h-[28px] text-white" />
        </div>
        <h2 className="text-white text-[20px] font-bold mb-2">Payment Completed!</h2>
        <p className="text-[#99A1AF] text-[15px] font-bold mb-2">₹{(currentBidPaise / 100).toLocaleString('en-IN')}</p>
        <p className="text-[#99A1AF] text-[13px] mb-6">Your order is created. You can check your pass in My Bookings.</p>
        <button onClick={onBack} className="rounded-full px-8 py-3 text-[#99A1AF] text-[14px] border border-[rgba(255,255,255,0.12)]">
          Back to Auctions
        </button>
      </div>
    );
  }

  if (bidPlaced) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="w-[70px] h-[70px] rounded-full bg-gradient-to-br from-[#c9115f] to-[#cd620e] flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(201,17,95,0.4)]">
          <TrendingUp className="w-[28px] h-[28px] text-white" />
        </div>
        <h2 className="text-white text-[20px] font-bold mb-2">Bid Placed!</h2>
        <p className="text-[#99A1AF] text-[15px] font-bold mb-2">₹{parseFloat(bidAmountInput).toLocaleString('en-IN')}</p>
        <p className="text-[#99A1AF] text-[13px] mb-6">You'll be notified if you're outbid. Complete payment within 24h if you win.</p>
        <button
          onClick={() => {
            setBidPlaced(false);
            onBack();
          }}
          className="rounded-full px-8 py-3 text-[#99A1AF] text-[14px] border border-[rgba(255,255,255,0.12)]"
        >
          Back to Auctions
        </button>
      </div>
    );
  }

  const nextMinBidPaise = currentBidPaise + minIncrementPaise;

  return (
    <div className="flex-1 overflow-y-auto pb-[130px] no-scrollbar">
      <div className="relative h-[220px]">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0f] to-transparent" />
        <button
          onClick={() => setBookmarked(b => !b)}
          className="absolute top-4 right-4 w-[38px] h-[38px] rounded-full backdrop-blur-md flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <Bookmark className="w-[16px] h-[16px]" style={{ color: bookmarked ? '#c9115f' : 'white', fill: bookmarked ? '#c9115f' : 'none' }} />
        </button>
      </div>

      <div className="px-4 pt-4">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <GovernanceTag status="approved" />
          <div className="px-2.5 py-1 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)]">
            <span className="text-[10px] font-semibold text-white capitalize">{status}</span>
          </div>
        </div>
        <h2 className="text-white text-[18px] font-bold leading-tight mb-3">{title}</h2>
        <p className="text-[#a8a8b8] text-[13px] leading-relaxed mb-5">{description}</p>

        {/* Current bid + timer */}
        <div className="rounded-[16px] p-4 mb-4" style={{ background: 'rgba(201,17,95,0.08)', border: '1px solid rgba(201,17,95,0.2)' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[#99A1AF] text-[11px] mb-0.5">Current Bid</p>
              <p className="text-white text-[24px] font-black">{formatPrice(currentBidPaise)}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5 mb-1">
                <Timer className="w-[12px] h-[12px] text-[#99A1AF]" />
                <span className="text-[#99A1AF] text-[11px]">Ends in</span>
              </div>
              <div className="text-[20px]">
                <Countdown endsAt={endsAtField} onComplete={loadAuctionData} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 pt-3 border-t border-[rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-1.5">
              <Users className="w-[12px] h-[12px] text-[#99A1AF]" />
              <span className="text-[#99A1AF] text-[11px]">{bids.length} bids</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-[12px] h-[12px] text-[#99A1AF]" />
              <span className="text-[#99A1AF] text-[11px]">Reserve: {formatPrice(reservePrice)}</span>
              <span className="text-[#00c864] text-[10px] font-semibold ml-1">{currentBidPaise >= reservePrice ? '✓ Met' : 'Not met'}</span>
            </div>
          </div>
        </div>

        {/* Bid input */}
        <div className="mb-4">
          <p className="text-white text-[14px] font-bold mb-3">Place Your Bid</p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#99A1AF] text-[15px]">₹</span>
            <input
              type="number"
              value={bidAmountInput}
              onChange={e => setBidAmountInput(e.target.value)}
              placeholder={`Min ₹${(nextMinBidPaise / 100).toLocaleString('en-IN')}`}
              disabled={status !== 'active' || autoBid}
              className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[14px] pl-8 pr-4 py-3.5 text-white text-[16px] focus:outline-none focus:border-[rgba(201,17,95,0.5)] disabled:opacity-50"
            />
          </div>
          {inlineError && (
            <p className="text-red-500 text-[12px] mt-2 font-semibold">{inlineError}</p>
          )}
        </div>

        {/* Auto-bid toggle + Ceiling */}
        <div className="rounded-[14px] p-4 mb-5 flex flex-col gap-3" style={{ background: '#111116', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-[13px] font-semibold">Auto-Bid</p>
              <p className="text-[#99A1AF] text-[11px]">Automatically outbid up to your max</p>
            </div>
            <button onClick={handleToggleAutoBid} disabled={status !== 'active'}>
              {autoBid
                ? <ToggleRight className="w-[28px] h-[28px] text-[#c9115f]" />
                : <ToggleLeft className="w-[28px] h-[28px] text-[#4a4a5a]" />
              }
            </button>
          </div>

          {autoBid && (
            <div className="relative mt-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#99A1AF] text-[13px]">Max Ceiling: ₹</span>
              <input
                type="number"
                value={autoBidCeiling}
                onChange={e => setAutoBidCeiling(e.target.value)}
                placeholder="e.g. 50,000"
                disabled={status !== 'active'}
                className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-[10px] pl-[110px] pr-4 py-2 text-white text-[13px] focus:outline-none focus:border-[rgba(201,17,95,0.3)] disabled:opacity-50"
              />
            </div>
          )}
          {autoBidStatusMessage && (
            <p className="text-[#00c864] text-[12px] font-semibold mt-1">{autoBidStatusMessage}</p>
          )}
        </div>

        {/* Bid history */}
        <div>
          <p className="text-white text-[14px] font-bold mb-3">Bid History</p>
          <div className="flex flex-col gap-2">
            {bids.length === 0 ? (
              <p className="text-[#5a5a6a] text-[12px]">No bids placed yet. Be the first!</p>
            ) : (
                bids.slice(0, 20).map((bid, i) => (
                <div key={bid.id || i} className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.05)]">
                    <span className="text-[#99A1AF] text-[13px]">{bid.userId === userId ? 'You' : (bid.displayName || 'Anonymous')}</span>
                  <span className="text-white text-[13px] font-semibold">{formatPrice(bid.amountPaise)}</span>
                    <div className="flex items-center gap-1.5">
                      {bid.type === 'auto' && (
                        <span className="text-[9px] bg-purple-900/40 text-purple-300 border border-purple-800/55 px-1.5 py-0.5 rounded">Auto</span>
                      )}
                      <span className={`text-[11px] font-medium capitalize ${bid.status === 'winning' ? 'text-[#00c864]' : 'text-[#4a4a5a]'}`}>
                        {bid.status || 'outbid'}
                      </span>
                    </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 px-4 py-4 z-10"
        style={{ background: 'linear-gradient(to top, #0b0b0f 85%, transparent)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <button
          onClick={
            status === 'closed' && winnerId === userId
              ? handleCompletePayment
              : handlePlaceBid
          }
          disabled={status !== 'active' && !(status === 'closed' && winnerId === userId && winnerPaymentStatus === 'pending')}
          className="w-full rounded-full py-3.5 text-white text-[15px] font-bold transition-all bg-gradient-to-r from-[#c9115f] to-[#cd620e] disabled:opacity-50 disabled:from-gray-700 disabled:to-gray-800"
          style={{
            boxShadow: (status === 'active' || (status === 'closed' && winnerId === userId && winnerPaymentStatus === 'pending')) ? '0 0 20px rgba(201,17,95,0.4)' : 'none',
          }}
        >
          {status === 'active'
            ? autoBid
              ? autoBidCeiling
                ? `Set Auto-Bid — ₹${parseFloat(autoBidCeiling).toLocaleString('en-IN')}`
                : 'Enter Auto-Bid Ceiling'
              : bidAmountInput
                ? `Place Bid — ₹${parseFloat(bidAmountInput).toLocaleString('en-IN')}`
                : 'Enter Bid Amount'
            : status === 'closed'
              ? winnerId === userId
                ? winnerPaymentStatus === 'pending'
                  ? isPaying ? 'Processing Payment...' : 'You Won! Complete Payment'
                  : 'You Won! (Paid)'
                : 'Auction Ended — Sold'
              : status === 'reserve_not_met' || status === 'unsold'
                ? 'Reserve Not Met — Item Unsold'
                : status === 'unclaimed_reserve_met'
                  ? 'Auction Ended — Unclaimed'
                  : 'Auction Closed'
          }
        </button>
      </div>
      {showWonModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-[340px] bg-[#111116] border border-[rgba(255,255,255,0.1)] rounded-[20px] p-6 text-center shadow-[0_0_50px_rgba(201,17,95,0.4)]">
            <div className="w-[70px] h-[70px] rounded-full bg-gradient-to-br from-[#c9115f] to-[#cd620e] flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(201,17,95,0.5)]">
              <span className="text-[32px]">🎉</span>
            </div>
            <h3 className="text-white text-[20px] font-bold mb-2">Congratulations!</h3>
            <p className="text-[#a8a8b8] text-[13px] mb-4">You Won {title}</p>
            <p className="text-white text-[24px] font-black mb-6">{formatPrice(currentBidPaise)}</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowWonModal(false);
                  router.push(`/MainModules/AtheleteStore/StorePayment/${dbId}?price=${currentBidPaise}&orderType=auction`);
                }}
                className="w-full rounded-full py-3 text-white text-[14px] font-bold bg-gradient-to-r from-[#c9115f] to-[#cd620e]"
              >
                Pay Now
              </button>
              <button
                onClick={() => setShowWonModal(false)}
                className="w-full rounded-full py-3 text-[#99A1AF] text-[13px] border border-[rgba(255,255,255,0.1)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StoreAuctions() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.userId || user?.email || 'mock-user-123';

  const [selectedAuction, setSelectedAuction] = useState<any | null>(null);
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [myFilter, setMyFilter] = useState<'current' | 'won'>('current');

  useEffect(() => {
    setLoading(true);
    if (activeTab === 'all') {
      storeService.getProducts('auctions')
        .then((data) => {
          const approvedAuctions = data.filter((a: any) => a.governance_state === 'approved' && a.status === 'active');
          setAuctions(approvedAuctions);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    } else {
      storeService.getUserAuctions(userId, myFilter)
        .then((data) => {
          setAuctions(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [activeTab, myFilter, userId]);

  return (
    <div className="bg-black w-full flex justify-center min-h-screen">
      <div className="w-full max-w-[390px] bg-[#0b0b0f] relative flex flex-col min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-[#0b0b0f] border-b border-[rgba(255,255,255,0.05)] h-[56px] flex items-center px-4 gap-3">
          <button
            onClick={() => selectedAuction ? setSelectedAuction(null) : router.push('/MainModules/AtheleteStore')}
            className="w-[36px] h-[36px] rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center"
          >
            <ArrowLeft className="w-[18px] h-[18px] text-white" />
          </button>
          <div>
            <h1 className="text-white font-bold text-[17px]">Live Auctions</h1>
            {!selectedAuction && <p className="text-[#99A1AF] text-[11px]">Bid on authenticated sports items</p>}
          </div>
        </div>

        {/* Tabs */}
        {!selectedAuction && (
          <div className="flex px-4 border-b border-[rgba(255,255,255,0.06)] bg-[#0b0b0f] z-20">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 text-center py-3 text-[14px] font-bold border-b-2 transition-all ${activeTab === 'all'
                ? 'border-[#c9115f] text-white'
                : 'border-transparent text-[#99A1AF]'
                }`}
            >
              All Auctions
            </button>
            <button
              onClick={() => setActiveTab('my')}
              className={`flex-1 text-center py-3 text-[14px] font-bold border-b-2 transition-all ${activeTab === 'my'
                ? 'border-[#c9115f] text-white'
                : 'border-transparent text-[#99A1AF]'
                }`}
            >
              My Auctions
            </button>
          </div>
        )}

        {/* Chips for My Auctions */}
        {!selectedAuction && activeTab === 'my' && (
          <div className="flex gap-2 px-4 py-3 bg-[#0b0b0f] z-20 overflow-x-auto no-scrollbar">
            {(['current', 'won'] as const).map(chip => (
              <button
                key={chip}
                onClick={() => setMyFilter(chip)}
                className={`px-4 py-1.5 rounded-full text-[12px] font-bold capitalize transition-all border ${myFilter === chip
                  ? 'bg-[#c9115f] border-[#c9115f] text-white shadow-[0_0_10px_rgba(201,17,95,0.3)]'
                  : 'bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] text-[#99A1AF]'
                  }`}
              >
                {chip === 'current' ? 'Current Bids' : 'Won'}
              </button>
            ))}
          </div>
        )}

        {selectedAuction ? (
          <AuctionDetail
            auctionId={selectedAuction.id || 1}
            dbId={selectedAuction.id}
            title={selectedAuction.title}
            description={selectedAuction.description || ''}
            image={selectedAuction.image || ''}
            reservePrice={selectedAuction.reservePrice || selectedAuction.pricePaise}
            onBack={() => setSelectedAuction(null)}
          />
        ) : (
          <div className="flex-1 overflow-y-auto pb-[70px] no-scrollbar px-4 pt-4">
            {loading ? (
              <p className="text-center text-[#99A1AF] text-[12px] py-10">Loading auctions...</p>
            ) : auctions.length === 0 ? (
                  <p className="text-center text-[#99A1AF] text-[12px] py-10">No matching auctions found.</p>
            ) : (
              <div className="flex flex-col gap-4">
                      {auctions.map(auction => {
                        const isWonTab = activeTab === 'my' && myFilter === 'won';
                        return (
                          <div
                            key={auction.id}
                            className="w-full bg-[#111116] rounded-[18px] border border-[rgba(255,255,255,0.07)] overflow-hidden text-left"
                          >
                            <button
                              onClick={() => setSelectedAuction(auction)}
                              className="w-full text-left"
                            >
                              <div className="relative h-[150px]">
                                <img src={auction.image} alt={auction.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#111116] to-transparent" />
                                <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                                  <GovernanceTag status="approved" />
                                  {isWonTab && auction.winnerPaymentStatus === 'pending' && (
                                    <span className="bg-[#cd620e] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">🎉 Winning Bid</span>
                                  )}
                                  {isWonTab && auction.winnerPaymentStatus === 'paid' && (
                                    <span className="bg-[#00c864] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">Purchased</span>
                                  )}
                                  {isWonTab && auction.winnerPaymentStatus === 'forfeited' && (
                                    <span className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">Payment Window Expired</span>
                                  )}
                                </div>
                              </div>
                              <div className="p-4">
                                <p className="text-white text-[14px] font-bold leading-tight mb-2">{auction.title}</p>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[#99A1AF] text-[10px]">{isWonTab ? 'Winning Bid' : 'Current Bid'}</p>
                                    <p className="text-transparent bg-clip-text bg-gradient-to-r from-[#c9115f] to-[#cd620e] text-[18px] font-bold">
                                      {formatPrice(auction.currentBidPaise || auction.pricePaise)}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    {isWonTab && auction.winnerPaymentStatus === 'pending' ? (
                                      <>
                                        <p className="text-[#99A1AF] text-[10px] mb-0.5">Pay within</p>
                                        <div className="text-[14px]">
                                          <Countdown endsAt={auction.paymentDeadline} />
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                          <p className="text-[#99A1AF] text-[10px] mb-0.5">Ends in</p>
                                          <div className="text-[16px]">
                                            <Countdown endsAt={auction.endsAt} />
                                          </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mt-3 pt-2 border-t border-[rgba(255,255,255,0.06)]">
                                  <div className="flex items-center gap-1">
                                    <Users className="w-[11px] h-[11px] text-[#99A1AF]" />
                                    <span className="text-[#99A1AF] text-[11px]">{auction.biddersCount || 0} bidders</span>
                                  </div>
                                  {!isWonTab && (
                                    <div className="flex items-center gap-1 text-[#c9115f] text-[12px] font-semibold">
                                      Bid now <ChevronRight className="w-[13px] h-[13px]" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>

                            {isWonTab && auction.winnerPaymentStatus === 'pending' && (
                              <div className="px-4 pb-4">
                                <button
                                  onClick={() => router.push(`/MainModules/AtheleteStore/StorePayment/${auction.id}?price=${auction.currentBidPaise || auction.pricePaise}&orderType=auction`)}
                                  className="w-full rounded-full py-2.5 text-center text-white text-[13px] font-bold bg-gradient-to-r from-[#c9115f] to-[#cd620e] shadow-[0_0_15px_rgba(201,17,95,0.3)] active:scale-[0.98] transition-all"
                                >
                                  Pay Now
                                </button>
                              </div>
                            )}
                            {isWonTab && auction.winnerPaymentStatus === 'paid' && (
                              <div className="px-4 pb-4">
                                <button
                                  onClick={() => router.push('/MainModules/AtheleteStore/StoreLibrary')}
                                  className="w-full rounded-full py-2.5 text-center text-[#99A1AF] text-[13px] font-bold border border-[rgba(255,255,255,0.12)] active:scale-[0.98] transition-all"
                                >
                                  View Order Details
                                </button>
                              </div>
                            )}
                          </div>
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
