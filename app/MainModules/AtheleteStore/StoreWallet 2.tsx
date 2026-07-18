import { useNavigate } from 'react-router';
import { ArrowLeft, Star, Wallet, Tag, Award, RefreshCw, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { storeService } from '@/services/store.service';
import { formatPrice } from '@/utils/formatters';

export default function StoreWallet() {
  const navigate = useNavigate();
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [coinsBalance, setCoinsBalance] = useState<number>(0);
  const [walletTx, setWalletTx] = useState<any[]>([]);
  const [coinsTx, setCoinsTx] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [walletRes, coinsRes, walletTxRes, coinsTxRes] = await Promise.all([
        storeService.getWalletBalance('abhishekrt959_gmail_com'),
        storeService.getCoinsBalance('abhishekrt959_gmail_com'),
        storeService.getWalletTransactions('abhishekrt959_gmail_com'),
        storeService.getCoinsTransactions('abhishekrt959_gmail_com'),
      ]);

      setWalletBalance(walletRes.balancePaise);
      setCoinsBalance(coinsRes.balance);
      setWalletTx(walletTxRes);
      setCoinsTx(coinsTxRes);
    } catch (err) {
      console.error('Error loading wallet details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getTier = (coins: number) => {
    if (coins >= 1000) return { name: 'Elite', color: '#c9115f', bg: 'rgba(201,17,95,0.15)' };
    if (coins >= 500) return { name: 'Gold', color: '#FFD700', bg: 'rgba(255,215,0,0.15)' };
    if (coins >= 100) return { name: 'Silver', color: '#c0c0c0', bg: 'rgba(192,192,192,0.15)' };
    return { name: 'Bronze', color: '#cd620e', bg: 'rgba(205,98,14,0.15)' };
  };

  const tier = getTier(coinsBalance);

  const activeCoupons = [
    { code: 'SPORT20', discount: '20% off', desc: 'Valid on all coaching packages' },
    { code: 'NEERAJ50', discount: '₹500 off', desc: 'Valid on Olympic memorabilia auctions' },
  ];

  return (
    <div className="bg-black w-full flex justify-center min-h-screen">
      <div className="w-full max-w-[390px] bg-[#0b0b0f] relative flex flex-col min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-[#0b0b0f] border-b border-[rgba(255,255,255,0.05)] h-[56px] flex items-center px-4 gap-3">
          <button
            onClick={() => navigate('/store')}
            className="w-[36px] h-[36px] rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center"
          >
            <ArrowLeft className="w-[18px] h-[18px] text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-bold text-[17px]">Wallet & Rewards</h1>
            <p className="text-[#99A1AF] text-[11px]">Manage balance & rewards</p>
          </div>
          <button onClick={fetchData} className="w-[32px] h-[32px] rounded-full flex items-center justify-center bg-[rgba(255,255,255,0.05)]">
            <RefreshCw className={`w-[14px] h-[14px] text-[#99A1AF] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-[40px] no-scrollbar px-4 pt-4">
          
          {/* Wallet Balance Card */}
          <div className="rounded-[20px] p-5 mb-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #111116 0%, #07070b 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="absolute right-4 top-4 opacity-10">
              <Wallet className="w-[80px] h-[80px] text-white" />
            </div>
            <p className="text-[#99A1AF] text-[11px] font-bold uppercase tracking-wider mb-1">Total Wallet Balance</p>
            <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-[#c9115f] to-[#cd620e] text-[28px] font-black leading-none mb-3">
              {formatPrice(walletBalance)}
            </h2>
            <div className="flex items-center gap-1 bg-[rgba(0,200,100,0.1)] border border-[rgba(0,200,100,0.2)] rounded-full px-2.5 py-1 w-fit">
              <div className="w-[5px] h-[5px] rounded-full bg-[#00c864]" />
              <span className="text-[#00c864] text-[9px] font-bold">100% Secure Wallet</span>
            </div>
          </div>

          {/* Coins & Loyalty Card */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-[18px] bg-[#111116] border border-[rgba(255,255,255,0.06)] p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Star className="w-[14px] h-[14px] text-[#FFD700] fill-[#FFD700]" />
                  <span className="text-[#99A1AF] text-[10px] font-bold uppercase tracking-wider">Rewards Coins</span>
                </div>
                <h3 className="text-white text-[22px] font-black">{coinsBalance}</h3>
              </div>
              <p className="text-[#5a5a6a] text-[9px] mt-2">Earned from bookings</p>
            </div>

            <div className="rounded-[18px] bg-[#111116] border border-[rgba(255,255,255,0.06)] p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Award className="w-[14px] h-[14px]" style={{ color: tier.color }} />
                  <span className="text-[#99A1AF] text-[10px] font-bold uppercase tracking-wider">Loyalty Tier</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black w-fit block" style={{ color: tier.color, background: tier.bg }}>
                  {tier.name}
                </span>
              </div>
              <p className="text-[#5a5a6a] text-[9px] mt-2">Level up at 100 coins</p>
            </div>
          </div>

          {/* Active Coupons */}
          <h3 className="text-white text-[13px] font-bold mb-3 flex items-center gap-1.5">
            <Tag className="w-[14px] h-[14px] text-[#c9115f]" /> Available Coupons
          </h3>
          <div className="flex flex-col gap-2 mb-5">
            {activeCoupons.map((coupon) => (
              <div key={coupon.code} className="bg-[#111116] border border-[rgba(255,255,255,0.05)] rounded-[14px] p-3 flex justify-between items-center">
                <div>
                  <span className="text-white text-[12px] font-bold px-2 py-0.5 bg-[rgba(201,17,95,0.12)] border border-[rgba(201,17,95,0.3)] rounded-full mr-2">
                    {coupon.code}
                  </span>
                  <span className="text-white text-[12px] font-semibold">{coupon.discount}</span>
                  <p className="text-[#5a5a6a] text-[10px] mt-1">{coupon.desc}</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(coupon.code);
                    alert(`Coupon ${coupon.code} copied!`);
                  }}
                  className="text-[10px] font-black text-[#c9115f] border border-[rgba(201,17,95,0.3)] rounded-full px-2.5 py-1"
                >
                  Copy
                </button>
              </div>
            ))}
          </div>

          {/* Transaction History Tabs */}
          <h3 className="text-white text-[13px] font-bold mb-3">Transaction Ledger</h3>
          
          <div className="bg-[#111116] border border-[rgba(255,255,255,0.05)] rounded-[18px] p-4">
            {loading ? (
              <p className="text-center text-[#99A1AF] text-[12px] py-4">Loading ledger...</p>
            ) : walletTx.length === 0 ? (
              <div className="text-center py-4">
                <AlertCircle className="w-[20px] h-[20px] text-[#5a5a6a] mx-auto mb-1.5" />
                <p className="text-[#5a5a6a] text-[11px]">No transaction history found</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {walletTx.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2.5 last:border-b-0 last:pb-0">
                    <div>
                      <p className="text-white text-[12px] font-semibold">{tx.description}</p>
                      <p className="text-[#5a5a6a] text-[9px]">
                        {tx.createdAt ? new Date(tx.createdAt._seconds ? tx.createdAt._seconds * 1000 : tx.createdAt).toLocaleDateString() : 'Today'}
                      </p>
                    </div>
                    <span className={`text-[12px] font-black ${tx.type === 'credit' ? 'text-[#00c864]' : 'text-[#ff4444]'}`}>
                      {tx.type === 'credit' ? '+' : '-'}{formatPrice(tx.amountPaise)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
