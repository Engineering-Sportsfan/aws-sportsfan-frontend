'use client';

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Shield, ChevronRight, Check } from 'lucide-react';
import { useState, useEffect, useRef, Suspense } from 'react';
import { storeService } from '@/services/store.service';
import { useIdempotencyKey } from '@/hooks/useIdempotencyKey';
import { formatPrice } from '@/utils/formatters';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

function StorePaymentContent() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const searchParams = useSearchParams();
  const slotId = searchParams?.get('slotId') || undefined;
  const variantId = searchParams?.get('variantId') || undefined;
  const priceParam = searchParams?.get('price');
  const pricePaise = priceParam ? parseInt(priceParam, 10) : 189900; // fallback to ₹1,899

  const { user } = useAuth();
  const userId = user?.userId || user?.email || '';

  const { key: idempotencyKey } = useIdempotencyKey();
  const [selected, setSelected] = useState('gpay');
  const [processing, setProcessing] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const isMemorabilia = typeof id === 'string' && id.startsWith('merch-');
  const isCoachSlot = typeof id === 'string' && id.startsWith('coach-') && !!slotId;
  const hasTimer = isMemorabilia || isCoachSlot;

  // Track mount state to avoid React 18 strict mode double-mount cleanup trigger
  const isMounted = useRef(false);

  // Fetch wallet balance
  useEffect(() => {
    if (!userId) return;
    storeService.getWalletBalance(userId)
      .then((res) => setWalletBalance(res.balancePaise))
      .catch((err) => console.error('Error fetching wallet balance:', err));
  }, [userId]);

  // Lock timer
  useEffect(() => {
    if (!hasTimer) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [hasTimer]);

  // Unmount lock cleanup (Strict Mode safe)
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      setTimeout(() => {
        // If the component is still unmounted (meaning it was a real unmount, not strict mode double-effect)
        if (!isMounted.current && hasTimer && !checkoutSuccess) {
          if (isMemorabilia) {
            api.post('/store/orders/memorabilia', {
              action: 'unlock',
              productId: id,
              userId
            }).catch((err) => console.error("Unlock cleanup failed:", err));
          } else if (isCoachSlot) {
            storeService.unlockSlot(id as string, slotId as string, userId)
              .catch((err) => console.error("Unlock cleanup failed:", err));
          }
        }
      }, 800);
    };
  }, [hasTimer, checkoutSuccess, id, slotId, userId]);

  const handleTimeout = async () => {
    try {
      if (isMemorabilia) {
        await api.post('/store/orders/memorabilia', {
          action: 'unlock',
          productId: id,
          userId
        });
        alert('Your 2-minute reservation hold has expired. Redirecting you back.');
        router.push('/MainModules/AtheleteStore/StoreMemorabilia');
      } else if (isCoachSlot) {
        await storeService.unlockSlot(id as string, slotId as string, userId);
        alert('Your 2-minute reservation hold has expired. Redirecting you back.');
        router.push(`/MainModules/AtheleteStore/StoreCoachProfile/${id.replace('coach-', '')}`);
      }
    } catch (err) {
      console.error(err);
      if (isMemorabilia) {
        router.push('/MainModules/AtheleteStore/StoreMemorabilia');
      } else {
        router.push(`/MainModules/AtheleteStore/StoreCoachProfile/${id.replace('coach-', '')}`);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handlePay = async () => {
    setProcessing(true);
    try {
      const res = await storeService.checkout({
        productId: (id as string) || 'coach-1',
        slotId: slotId,
        variantId: variantId,
        userId: userId,
        paymentMethod: selected as any,
        pricePaise,
        idempotencyKey,
      });

      if (res.success) {
        setCheckoutSuccess(true);
        router.push(`/MainModules/AtheleteStore/StoreBookingSuccess/${res.orderId}`);
      } else {
        alert('Payment failed');
        setProcessing(false);
      }
    } catch (err: any) {
      alert(err.message || 'Payment execution failed');
      setProcessing(false);
    }
  };

  const paymentMethods = [
    { id: 'upi', label: 'UPI', subtitle: 'Pay via any UPI app', icon: '⚡' },
    { id: 'gpay', label: 'Google Pay', subtitle: 'Fast & secure', icon: '🟢' },
    { id: 'phonepe', label: 'PhonePe', subtitle: 'Instant transfer', icon: '💜' },
    { id: 'paytm', label: 'Paytm', subtitle: 'Paytm wallet / UPI', icon: '🔵' },
    { id: 'card', label: 'Credit / Debit Card', subtitle: 'Visa, Mastercard, RuPay', icon: '💳' },
    { 
      id: 'wallet', 
      label: 'SportsFan Wallet', 
      subtitle: `Balance: ${formatPrice(walletBalance)}`, 
      icon: '👛',
      disabled: walletBalance < pricePaise
    },
  ];

  return (
    <div className="bg-black w-full flex justify-center min-h-screen">
      <div className="w-full max-w-[390px] bg-[#0b0b0f] relative flex flex-col h-[100dvh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-[#0b0b0f] border-b border-[rgba(255,255,255,0.05)] h-[56px] flex items-center px-4 gap-3">
          <button
            onClick={() => router.back()}
            className="w-[36px] h-[36px] rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center"
          >
            <ArrowLeft className="w-[18px] h-[18px] text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-bold text-[17px]">Payment</h1>
            <p className="text-[#99A1AF] text-[11px]">Secure checkout</p>
          </div>
          <div className="flex items-center gap-1 bg-[rgba(0,200,100,0.1)] border border-[rgba(0,200,100,0.25)] rounded-full px-2.5 py-1">
            <Shield className="w-[11px] h-[11px] text-[#00c864]" />
            <span className="text-[#00c864] text-[10px] font-semibold">256-bit SSL</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-[150px] lg:pb-[88px] no-scrollbar px-4 pt-5">
          {/* Reservation Countdown Banner */}
          {hasTimer && timeLeft > 0 && (
            <div className="bg-red-950/20 border border-red-500/25 rounded-2xl px-4 py-3 text-[12px] text-red-400 font-bold mb-4 flex items-center justify-between animate-pulse">
              <span className="flex items-center gap-1.5">
                ⏳ Held Reservation
              </span>
              <span>Expires in {formatTime(timeLeft)}</span>
            </div>
          )}

          {/* Order summary pill */}
          <div className="bg-[rgba(201,17,95,0.08)] border border-[rgba(201,17,95,0.2)] rounded-[16px] p-4 mb-5 flex items-center justify-between">
            <div>
              <p className="text-white text-[13px] font-semibold">
                {isMemorabilia ? 'Memorabilia Purchase' : 'Coaching Session Booking'}
              </p>
              <p className="text-[#99A1AF] text-[12px]">Complete secure payment</p>
            </div>
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-[#c9115f] to-[#cd620e] text-[18px] font-bold">
              {formatPrice(pricePaise)}
            </p>
          </div>

          {/* Payment methods */}
          <h2 className="text-white text-[14px] font-bold mb-3">Choose Payment Method</h2>
          <div className="flex flex-col gap-2">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => !method.disabled && setSelected(method.id)}
                className={`w-full rounded-[14px] border p-3.5 flex items-center gap-3 text-left transition-all ${
                  method.disabled
                    ? 'opacity-40 cursor-not-allowed bg-[#0d0d11] border-[rgba(255,255,255,0.02)]'
                    : selected === method.id
                    ? 'bg-[rgba(201,17,95,0.08)] border-[rgba(201,17,95,0.4)]'
                    : 'bg-[#111116] border-[rgba(255,255,255,0.07)]'
                }`}
                disabled={method.disabled}
              >
                <span className="text-[22px]">{method.icon}</span>
                <div className="flex-1">
                  <p className="text-white text-[14px] font-semibold">{method.label}</p>
                  <p className="text-[#99A1AF] text-[11px]">{method.subtitle}</p>
                </div>
                <div
                  className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center transition-all ${
                    selected === method.id ? 'border-[#c9115f] bg-[#c9115f]' : 'border-[rgba(255,255,255,0.2)]'
                  }`}
                >
                  {selected === method.id && <Check className="w-[11px] h-[11px] text-white" />}
                </div>
              </button>
            ))}
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 mt-5">
            {['No hidden fees', '100% refund policy', 'Verified coaches'].map((t) => (
              <div key={t} className="flex items-center gap-1">
                <Check className="w-[10px] h-[10px] text-[#00c864]" />
                <span className="text-[#99A1AF] text-[10px]">{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="absolute bottom-[60px] lg:bottom-0 left-0 right-0 bg-[#0b0b0f] border-t border-[rgba(255,255,255,0.07)] px-4 py-3">
          <button
            onClick={handlePay}
            disabled={processing}
            className="w-full bg-gradient-to-r from-[#c9115f] to-[#cd620e] rounded-full py-3.5 text-white text-[15px] font-bold shadow-[0_0_20px_rgba(201,17,95,0.5)] flex items-center justify-center gap-2 disabled:opacity-80"
          >
            {processing ? (
              <>
                <div className="w-[16px] h-[16px] rounded-full border-2 border-white border-t-transparent animate-spin" />
                Processing...
              </>
            ) : (
              <>Pay {formatPrice(pricePaise)} <ChevronRight className="w-[16px] h-[16px]" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StorePayment() {
  return (
    <Suspense fallback={
      <div className="bg-black w-full flex justify-center min-h-screen items-center">
        <span className="text-white text-[14px]">Loading...</span>
      </div>
    }>
      <StorePaymentContent />
    </Suspense>
  );
}
