import { useNavigate } from 'react-router';
import { ArrowLeft, Timer, Users, TrendingUp, Bookmark, CheckCircle, Clock, Shield, ChevronRight, ToggleLeft, ToggleRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { storeService } from '@/services/store.service';
import { formatPrice } from '@/utils/formatters';

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

function Countdown({ seconds: initialSeconds }: { seconds: number }) {
  const [secs, setSecs] = useState(initialSeconds);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [initialSeconds]);

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
  const [currentBidPaise, setCurrentBidPaise] = useState<number>(0);
  const [bids, setBids] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(172800);

  const [bidAmountInput, setBidAmountInput] = useState('');
  const [autoBid, setAutoBid] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [bidPlaced, setBidPlaced] = useState(false);

  const loadAuctionData = async () => {
    try {
      const product = await storeService.getProductById(dbId);
      setCurrentBidPaise(product.pricePaise || product.currentBidPaise || 24000000);

      const bidList = await storeService.getBids(dbId);
      setBids(bidList);

      if (product.endsAt) {
        const diff = Math.max(0, Math.round((new Date(product.endsAt).getTime() - Date.now()) / 1000));
        setTimeLeft(diff);
      }
    } catch (err) {
      console.error('Error loading auction:', err);
    }
  };

  useEffect(() => {
    loadAuctionData();
    const interval = setInterval(loadAuctionData, 5000); // Poll every 5s for real-time bid updates
    return () => clearInterval(interval);
  }, [dbId]);

  const handlePlaceBid = async () => {
    const inputVal = parseFloat(bidAmountInput);
    if (isNaN(inputVal)) return;

    const bidPaise = Math.round(inputVal * 100);
    if (bidPaise <= currentBidPaise) {
      alert(`Bid must be greater than current bid: ${formatPrice(currentBidPaise)}`);
      return;
    }

    try {
      const res = await storeService.placeBid(dbId, bidPaise, 'mock-user-123');
      if (res.success) {
        setBidPlaced(true);
        loadAuctionData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to place bid');
    }
  };

  if (bidPlaced) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="w-[70px] h-[70px] rounded-full bg-gradient-to-br from-[#c9115f] to-[#cd620e] flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(201,17,95,0.4)]">
          <TrendingUp className="w-[28px] h-[28px] text-white" />
        </div>
        <h2 className="text-white text-[20px] font-bold mb-2">Bid Placed!</h2>
        <p className="text-[#99A1AF] text-[15px] font-bold mb-2">₹{parseFloat(bidAmountInput).toLocaleString('en-IN')}</p>
        <p className="text-[#99A1AF] text-[13px] mb-6">You'll be notified if you're outbid. Complete payment within 24h if you win.</p>
        <button onClick={onBack} className="rounded-full px-8 py-3 text-[#99A1AF] text-[14px] border border-[rgba(255,255,255,0.12)]">
          Back to Auctions
        </button>
      </div>
    );
  }

  const minIncrementPaise = currentBidPaise + 50000; // + ₹500

  return (
    <div className="flex-1 overflow-y-auto pb-[110px] no-scrollbar">
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
                <Countdown seconds={timeLeft} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 pt-3 border-t border-[rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-1.5">
              <Users className="w-[12px] h-[12px] text-[#99A1AF]" />
              <span className="text-[#99A1AF] text-[11px]">{bids.length || 34} bids</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-[12px] h-[12px] text-[#99A1AF]" />
              <span className="text-[#99A1AF] text-[11px]">Reserve: {formatPrice(reservePrice)}</span>
              <span className="text-[#00c864] text-[10px] font-semibold">{currentBidPaise >= reservePrice ? '✓ Met' : 'Not met'}</span>
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
              placeholder={`Min ₹${(minIncrementPaise / 100).toLocaleString('en-IN')}`}
              className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[14px] pl-8 pr-4 py-3.5 text-white text-[16px] focus:outline-none focus:border-[rgba(201,17,95,0.5)]"
            />
          </div>
        </div>

        {/* Auto-bid toggle */}
        <div className="flex items-center justify-between rounded-[14px] p-4 mb-5" style={{ background: '#111116', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <p className="text-white text-[13px] font-semibold">Auto-Bid</p>
            <p className="text-[#99A1AF] text-[11px]">Automatically outbid up to your max</p>
          </div>
          <button onClick={() => setAutoBid(a => !a)}>
            {autoBid
              ? <ToggleRight className="w-[28px] h-[28px] text-[#c9115f]" />
              : <ToggleLeft className="w-[28px] h-[28px] text-[#4a4a5a]" />
            }
          </button>
        </div>

        {/* Bid history */}
        <div>
          <p className="text-white text-[14px] font-bold mb-3">Bid History</p>
          <div className="flex flex-col gap-2">
            {bids.length === 0 ? (
              <p className="text-[#5a5a6a] text-[12px]">No bids placed yet. Be the first!</p>
            ) : (
              bids.map((bid, i) => (
                <div key={bid.id || i} className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.05)]">
                  <span className="text-[#99A1AF] text-[13px]">{bid.userId === 'mock-user-123' ? 'You' : 'Anonymous'}</span>
                  <span className="text-white text-[13px] font-semibold">{formatPrice(bid.amountPaise)}</span>
                  <span className="text-[#4a4a5a] text-[11px]">Recent</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 px-4 py-4"
        style={{ background: 'linear-gradient(to top, #0b0b0f 85%, transparent)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <button
          onClick={handlePlaceBid}
          className="w-full rounded-full py-3.5 text-white text-[15px] font-bold transition-all bg-gradient-to-r from-[#c9115f] to-[#cd620e]"
          style={{
            boxShadow: '0 0 20px rgba(201,17,95,0.4)',
          }}
        >
          {bidAmountInput ? `Place Bid — ₹${parseFloat(bidAmountInput).toLocaleString('en-IN')}` : 'Enter Bid Amount'}
        </button>
      </div>
    </div>
  );
}

export default function StoreAuctions() {
  const navigate = useNavigate();
  const [selectedAuction, setSelectedAuction] = useState<any | null>(null);
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storeService.getProducts('auctions')
      .then((data) => {
        setAuctions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-black w-full flex justify-center min-h-screen">
      <div className="w-full max-w-[390px] bg-[#0b0b0f] relative flex flex-col min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-[#0b0b0f] border-b border-[rgba(255,255,255,0.05)] h-[56px] flex items-center px-4 gap-3">
          <button
            onClick={() => selectedAuction ? setSelectedAuction(null) : navigate('/store')}
            className="w-[36px] h-[36px] rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center"
          >
            <ArrowLeft className="w-[18px] h-[18px] text-white" />
          </button>
          <div>
            <h1 className="text-white font-bold text-[17px]">Live Auctions</h1>
            {!selectedAuction && <p className="text-[#99A1AF] text-[11px]">Bid on authenticated sports items</p>}
          </div>
        </div>

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
              <p className="text-center text-[#99A1AF] text-[12px] py-10">No live auctions found.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {auctions.map(auction => (
                  <button
                    key={auction.id}
                    onClick={() => setSelectedAuction(auction)}
                    className="w-full bg-[#111116] rounded-[18px] border border-[rgba(255,255,255,0.07)] overflow-hidden text-left active:scale-[0.98] transition-transform"
                  >
                    <div className="relative h-[150px]">
                      <img src={auction.image} alt={auction.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111116] to-transparent" />
                      <div className="absolute top-3 left-3">
                        <GovernanceTag status="approved" />
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-white text-[14px] font-bold leading-tight mb-2">{auction.title}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[#99A1AF] text-[10px]">Current Bid</p>
                          <p className="text-transparent bg-clip-text bg-gradient-to-r from-[#c9115f] to-[#cd620e] text-[18px] font-bold">
                            {formatPrice(auction.pricePaise)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[#99A1AF] text-[10px] mb-0.5">Ends in</p>
                          <div className="text-[16px]">
                            <Countdown seconds={auction.endsInSeconds || 86400} />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-[rgba(255,255,255,0.06)]">
                        <div className="flex items-center gap-1">
                          <Users className="w-[11px] h-[11px] text-[#99A1AF]" />
                          <span className="text-[#99A1AF] text-[11px]">{auction.biddersCount || 0} bidders</span>
                        </div>
                        <div className="flex items-center gap-1 text-[#c9115f] text-[12px] font-semibold">
                          Bid now <ChevronRight className="w-[13px] h-[13px]" />
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
