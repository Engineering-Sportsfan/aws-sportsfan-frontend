'use client';

import { ArrowLeft, CheckCircle, Star, Zap, Crown, ChevronRight, PauseCircle, PlayCircle, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { storeService } from '@/services/store.service';
import { formatPrice } from '@/utils/formatters';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
export default function StoreMemberships() {
  const router = useRouter();
  const { user } = useAuth();

  // Resolve userId safely: first check AuthContext, then local storage, then fallback to sanitized rahul
  const getResolvedUserId = () => {
    if (user?.userId) return user.userId;
    if (user?.email) return user.email.toLowerCase().replace(/[@.]/g, '_');
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('auth_user');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed?.userId) return parsed.userId;
          if (parsed?.email) return parsed.email.toLowerCase().replace(/[@.]/g, '_');
        } catch (_) { }
      }
    }
    return null; // Fixed hardcoded fallback user
  };

  const activeUserId = getResolvedUserId();

  const [view, setView] = useState<'plans' | 'active'>('active');
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [upgraded, setUpgraded] = useState(false);
  const [tiers, setTiers] = useState<any[]>([]);
  const [membershipData, setMembershipData] = useState<{
    hasMembership: boolean;
    membership: any;
    plan: any;
  }>({
    hasMembership: false,
    membership: null,
    plan: null,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadMembership = async () => {
    try {
      setLoading(true);

      console.log("Active User ID:", activeUserId);

      // Load plans
      const plansData = await storeService.getMembershipPlans();
      console.log("Plans:", plansData);
      setTiers(plansData || []);

      // Load membership
      console.log("Fetching membership...");
      const myData = await storeService.getMyMembership(activeUserId);
      console.log("Membership:", myData);

      setMembershipData(
        myData || {
          hasMembership: false,
          membership: null,
          plan: null,
        }
      );
    } catch (err) {
      console.error("Failed to load membership:", err);

      setMembershipData({
        hasMembership: false,
        membership: null,
        plan: null,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembership();
  }, [activeUserId]);

  const handleSubscribe = (tier: any) => {
    const planId = tier.id;
    const pricePaise = tier.pricePaise || 49900;
    router.push(`/MainModules/AtheleteStore/StorePayment/${planId}?price=${pricePaise}`);
  };

  const handlePause = async () => {
    setActionLoading(true);
    try {
      await storeService.pauseMembership(activeUserId);
      await loadMembership();
    } catch (err) {
      console.error('Pause error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    setActionLoading(true);
    try {
      await storeService.resumeMembership(activeUserId);
      await loadMembership();
    } catch (err) {
      console.error('Resume error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await storeService.cancelMembership(activeUserId);
      await loadMembership();
    } catch (err) {
      console.error('Cancel error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const activePlan = membershipData.plan || tiers[0] || {
    name: 'Monthly Plan',
    pricePaise: 49900,
    gradientFrom: 'rgba(201,17,95,0.2)',
    gradientTo: 'rgba(205,98,14,0.1)',
    color: '#c9115f',
    benefits: ['Exclusive athlete updates', 'Store discounts', 'Priority event access'],
  };

  const userMembership = membershipData.membership;
  const status = userMembership?.status || 'none';

  // Compute live days left from renewalDate
  const computeDaysLeft = (renewalIso?: string) => {
    if (!renewalIso) return 0;
    const renewal = new Date(renewalIso).getTime();
    const now = Date.now();
    const diffDays = Math.ceil((renewal - now) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const formattedRenewalDate = userMembership?.renewalDate
    ? new Date(userMembership.renewalDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    : 'N/A';

  if (upgraded) {
    return (
      <div className="bg-black w-full flex justify-center min-h-screen">
        <div className="w-full max-w-[390px] bg-[#0b0b0f] flex flex-col items-center justify-center px-6 py-12 text-center">
          <div className="w-[80px] h-[80px] rounded-full bg-gradient-to-br from-[#FFD700] to-[#cd620e] flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(255,215,0,0.4)]">
            <Crown className="w-[36px] h-[36px] text-white" />
          </div>
          <h2 className="text-white text-[22px] font-bold mb-2">You're Subscribed!</h2>
          <p className="text-[#99A1AF] text-[13px] mb-6">Your membership plan is active. Enjoy all premium perks.</p>
          <button
            onClick={() => { setUpgraded(false); setView('active'); }}
            className="rounded-full px-8 py-3 text-white text-[14px] font-semibold"
            style={{ background: 'linear-gradient(135deg,#c9115f,#cd620e)' }}
          >
            View My Membership
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black w-full flex justify-center min-h-screen">
      <div className="w-full max-w-[390px] bg-[#0b0b0f] relative flex flex-col min-h-screen">
        <div className="sticky top-0 z-50 bg-[#0b0b0f] border-b border-[rgba(255,255,255,0.05)]">
          <div className="h-[56px] flex items-center px-4 gap-3">
            <button
              onClick={() => router.push('/MainModules/AtheleteStore')}
              className="w-[36px] h-[36px] rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center"
            >
              <ArrowLeft className="w-[18px] h-[18px] text-white" />
            </button>
            <div>
              <h1 className="text-white font-bold text-[17px]">Memberships</h1>
              <p className="text-[#99A1AF] text-[11px]">Unlock the full SF360 experience</p>
            </div>
          </div>

          <div className="flex px-4 pb-3 gap-3">
            {(['active', 'plans'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setView(tab)}
                className="flex-1 py-2 rounded-full text-[13px] font-semibold capitalize border transition-all"
                style={view === tab ? {
                  background: 'linear-gradient(135deg,#c9115f,#cd620e)',
                  border: '1px solid transparent',
                  color: 'white',
                } : {
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#99A1AF',
                }}
              >
                {tab === 'active' ? 'My Membership' : 'All Plans'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-[70px] no-scrollbar px-4 pt-4">
          {loading ? (
            <p className="text-center text-[#99A1AF] text-[12px] py-10">Loading memberships...</p>
          ) : view === 'active' ? (
              (!membershipData.hasMembership || !userMembership || (status !== 'active' && status !== 'paused' && status !== 'cancelled')) ? (
                <div className="rounded-[20px] p-6 text-center bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]">
                  <Crown className="w-[48px] h-[48px] mx-auto text-[#FFD700] mb-3" />
                  <h3 className="text-white text-[18px] font-bold mb-1">No Active Membership</h3>
                  <p className="text-[#99A1AF] text-[13px] mb-5">Subscribe to an athlete membership plan to unlock exclusive perks, discounts, and live experiences.</p>
                  <button
                    onClick={() => setView('plans')}
                    className="rounded-full px-6 py-3 text-white text-[14px] font-bold"
                    style={{ background: 'linear-gradient(135deg,#c9115f,#cd620e)' }}
                  >
                    Browse All Plans
                  </button>
                </div>
              ) : (
                  <>
                    {/* Status Card */}
                    <div
                      className="rounded-[20px] p-5 mb-5 relative overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${activePlan.gradientFrom || 'rgba(201,17,95,0.2)'}, ${activePlan.gradientTo || 'rgba(205,98,14,0.1)'})`,
                        border: `1px solid ${activePlan.color || '#c9115f'}30`,
                      }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-[#99A1AF] text-[11px] mb-1">Current Plan</p>
                          <p className="text-white text-[24px] font-bold">{userMembership.currentPlanName || activePlan.name || activePlan.title}</p>
                          <p className="text-[13px] font-semibold" style={{ color: activePlan.color || '#c9115f' }}>
                            {formatPrice(activePlan.pricePaise || 0)}
                            {activePlan.durationDays ? ` / ${activePlan.durationDays} days` : ''}
                          </p>
                        </div>
                        <div className="w-[56px] h-[56px] rounded-[16px] flex items-center justify-center" style={{ background: activePlan.color || '#c9115f' }}>
                          <Star className="w-[24px] h-[24px] text-white fill-white" />
                        </div>
                      </div>

                      {status === 'paused' ? (
                        <div className="rounded-[12px] p-3 mb-4 text-center bg-[rgba(255,165,0,0.15)] border border-[rgba(255,165,0,0.3)]">
                          <p className="text-[#FFA500] text-[14px] font-bold">Membership Paused</p>
                          <p className="text-[#99A1AF] text-[11px] mt-0.5">Your plan benefits are temporarily on hold.</p>
                        </div>
                      ) : status === 'cancelled' ? (
                        <div className="rounded-[12px] p-3 mb-4 text-center bg-[rgba(255,0,80,0.15)] border border-[rgba(255,0,80,0.3)]">
                          <p className="text-[#FF0050] text-[13px] font-bold">Cancelled — access until {formattedRenewalDate}</p>
                        </div>
                      ) : (
                            <div className="flex items-center justify-between rounded-[12px] p-3 mb-4" style={{ background: 'rgba(0,0,0,0.25)' }}>
                              <div>
                                <p className="text-[#99A1AF] text-[10px]">Renewal Date</p>
                                <p className="text-white text-[13px] font-semibold">{formattedRenewalDate}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[#99A1AF] text-[10px]">Days Left</p>
                                <p className="text-white text-[13px] font-semibold">{computeDaysLeft(userMembership.renewalDate)} days</p>
                              </div>
                            </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        {status === 'paused' ? (
                          <button
                            onClick={handleResume}
                            disabled={actionLoading}
                            className="flex-1 rounded-full py-2.5 text-[13px] font-semibold flex items-center justify-center gap-1.5 text-white"
                            style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}
                          >
                            <PlayCircle className="w-[14px] h-[14px]" /> Resume
                          </button>
                        ) : status === 'cancelled' ? (
                          <button
                            onClick={() => setView('plans')}
                            className="flex-1 rounded-full py-2.5 text-[13px] font-semibold flex items-center justify-center gap-1.5 text-white"
                            style={{ background: 'linear-gradient(135deg,#c9115f,#cd620e)' }}
                          >
                            Resubscribe
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={handlePause}
                              disabled={actionLoading}
                                  className="flex-1 rounded-full py-2.5 text-[13px] font-semibold flex items-center justify-center gap-1.5 border border-[rgba(255,255,255,0.15)] text-[#99A1AF]"
                                >
                                  <PauseCircle className="w-[13px] h-[13px]" /> Pause
                                </button>
                                <button
                                  onClick={() => setView('plans')}
                                  className="flex-1 rounded-full py-2.5 text-[13px] font-semibold flex items-center justify-center gap-1.5 text-white"
                                  style={{ background: 'linear-gradient(135deg,#c9115f,#cd620e)' }}
                                >
                                  <TrendingUp className="w-[13px] h-[13px]" /> Upgrade
                                </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Benefits list */}
                    <p className="text-white text-[14px] font-bold mb-3">Your Benefits</p>
                    <div className="flex flex-col gap-2">
                      {((activePlan.benefits && activePlan.benefits.length > 0) ? activePlan.benefits : [
                        'Exclusive athlete updates',
                        'Store discounts',
                        'Priority event access'
                      ]).map((benefit: string, i: number) => (
                        <div key={i} className="flex items-center gap-3 py-2 border-b border-[rgba(255,255,255,0.05)]">
                          <CheckCircle className="w-[14px] h-[14px] flex-shrink-0" style={{ color: activePlan.color || '#c9115f' }} />
                          <span className="text-[#c8c8d0] text-[13px]">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    {status === 'active' && (
                      <button
                        onClick={handleCancel}
                        disabled={actionLoading}
                        className="w-full mt-5 rounded-full py-3 text-[13px] font-semibold border border-[rgba(255,0,80,0.2)] text-[rgba(255,0,80,0.6)]"
                      >
                        Cancel Membership
                      </button>
                    )}
                  </>
                )
          ) : (
            <>
              <p className="text-[#99A1AF] text-[13px] mb-4">Choose a plan that works for you</p>
              <div className="flex flex-col gap-4">
                    {tiers.map(tier => {
                      const isCurrent = userMembership?.currentPlanId === tier.id && status === 'active';
                      const tierColor = tier.color || '#c9115f';

                      return (
                        <div
                          key={tier.id}
                          className="rounded-[20px] p-5 relative overflow-hidden"
                          style={{
                            background: `linear-gradient(135deg, ${tier.gradientFrom || 'rgba(201,17,95,0.2)'}, ${tier.gradientTo || 'rgba(205,98,14,0.1)'})`,
                            border: `1px solid ${tierColor}30`,
                          }}
                        >
                          {tier.popular && (
                            <div
                              className="absolute top-0 right-5 px-3 py-1 rounded-b-full text-[10px] font-bold text-white"
                              style={{ background: 'linear-gradient(135deg,#c9115f,#cd620e)' }}
                            >
                              Most Popular
                            </div>
                          )}
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <p className="text-white text-[20px] font-bold">{tier.name || tier.title}</p>
                              <p className="text-[22px] font-bold" style={{ color: tierColor }}>
                                {formatPrice(tier.pricePaise || 0)}
                                <span className="text-[13px] font-normal text-[#99A1AF]">
                                  {tier.period || (tier.durationDays ? ` / ${tier.durationDays} days` : '')}
                                </span>
                              </p>
                            </div>
                            <div className="w-[44px] h-[44px] rounded-[12px] flex items-center justify-center" style={{ background: tierColor }}>
                              {tier.id === 'elite' || (tier.name && tier.name.toLowerCase().includes('elite')) ? <Crown className="w-[20px] h-[20px] text-white" /> :
                                tier.id === 'quarterly' || (tier.name && tier.name.toLowerCase().includes('quarterly')) ? <Zap className="w-[20px] h-[20px] text-white" /> :
                                  <Star className="w-[20px] h-[20px] text-white" />}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 mb-4">
                            {(tier.benefits || []).slice(0, 4).map((benefit: string, i: number) => (
                              <div key={i} className="flex items-center gap-2">
                                <CheckCircle className="w-[12px] h-[12px] flex-shrink-0" style={{ color: tierColor }} />
                                <span className="text-[#c8c8d0] text-[12px]">{benefit}</span>
                              </div>
                            ))}
                            {(tier.benefits || []).length > 4 && (
                              <button onClick={() => setSelectedTier(selectedTier === tier.id ? null : tier.id)} className="flex items-center gap-1 text-[11px]" style={{ color: tierColor }}>
                                +{(tier.benefits || []).length - 4} more <ChevronRight className="w-[11px] h-[11px]" />
                              </button>
                            )}
                            {selectedTier === tier.id && (tier.benefits || []).slice(4).map((benefit: string, i: number) => (
                              <div key={i} className="flex items-center gap-2">
                                <CheckCircle className="w-[12px] h-[12px] flex-shrink-0" style={{ color: tierColor }} />
                                <span className="text-[#c8c8d0] text-[12px]">{benefit}</span>
                              </div>
                            ))}
                          </div>

                          {isCurrent ? (
                            <div className="w-full rounded-full py-3 text-center text-[13px] font-semibold border border-[rgba(255,255,255,0.15)] text-[#99A1AF]">
                              Current Plan
                            </div>
                          ) : (
                            <button
                                onClick={() => handleSubscribe(tier)}
                                disabled={actionLoading}
                                className="w-full rounded-full py-3 text-white text-[14px] font-bold cursor-pointer"
                                style={{ background: `linear-gradient(135deg, ${tierColor === '#FFD700' ? '#cd620e' : tierColor}, ${tierColor})`, boxShadow: `0 0 16px ${tierColor}30` }}
                              >
                              {userMembership ? 'Upgrade / Change Plan' : 'Get Started'}
                            </button>
                          )}
                        </div>
                      );
                    })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}