import { useNavigate } from 'react-router';
import {
  Bell,
  Star,
  User,
  Trophy,
  Search,
  Tv,
  Gamepad2,
  Store,
  Sparkles,
  ChevronRight,
  Timer,
  Cpu,
  ShoppingBag,
  Award,
  Users,
  BookOpen,
  Gem,
  Tag,
  Zap,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { useRouter } from 'next/navigation';

export default function StoreFeedSection() {
  const router = useRouter();
  return (
    <div
      className="bg-[#0b0b0f] pt-5 pb-6"
      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between px-4 mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-[30px] h-[30px] rounded-[10px] flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg,#c9115f,#cd620e)",
            }}
          >
            <ShoppingBag className="w-[14px] h-[14px] text-white" />
          </div>
          <div>
            <h2 className="text-white text-[17px] font-black leading-none">
              Sports Store
            </h2>
            <p className="text-[#4a4a5a] text-[10px] mt-0.5">
              1,200+ items for athletes & fans
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push("/MainModules/AtheleteStore")}
          className="flex items-center gap-1 text-[11px] font-black px-3 py-1.5 rounded-full text-white"
          style={{
            background:
              "linear-gradient(90deg,#c9115f,#cd620e)",
            boxShadow: "0 3px 10px rgba(201,17,95,0.4)",
          }}
        >
          Shop All{" "}
          <ChevronRight className="w-[11px] h-[11px]" />
        </button>
      </div>

      {/* Offer chips */}
      <div className="px-4 mb-3">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {[
            {
              label: "40% off Nike",
              color: "#c9115f",
              route: "/MainModules/AtheleteStore/StoreBrands",
            },
            {
              label: "Free coach trial",
              color: "#00c864",
              route: "/MainModules/AtheleteStore/StoreCoachListing",
            },
            {
              label: "3 Live auctions",
              color: "#ff4444",
              route: "/MainModules/AtheleteStore/StoreAuctions",
            },
            {
              label: "Elite ₹799/mo",
              color: "#ec4899",
              route: "/MainModules/AtheleteStore/StoreMemberships",
            },
          ].map((o) => (
            <button
              key={o.label}
              onClick={() => router.push(o.route)}
              className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold active:scale-95 transition-transform"
              style={{
                background: `${o.color}15`,
                border: `1px solid ${o.color}40`,
                color: o.color,
              }}
            >
              <Tag className="w-[8px] h-[8px]" /> {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Full-width hero card */}
      <div className="px-4 mb-3">
        <button
          onClick={() => router.push("/MainModules/AtheleteStore/StoreExperiences")}
          className="w-full rounded-[20px] overflow-hidden relative text-left active:scale-[0.98] transition-transform"
          style={{ height: 175 }}
        >
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=350&fit=crop&auto=format"
            alt="Breakfast with Neeraj Chopra"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(105deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.6) 100%)",
            }}
          />
          <div
            className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{ background: "rgba(201,17,95,0.9)" }}
          >
            <Zap className="w-[8px] h-[8px] text-white" />
            <span className="text-white text-[8px] font-black tracking-wider">
              EXCLUSIVE
            </span>
          </div>
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/70 rounded-full px-2 py-0.5">
            <Timer className="w-[8px] h-[8px] text-[#FFD700]" />
            <span className="text-[#FFD700] text-[9px] font-bold">
              2d 14h
            </span>
          </div>
          <div className="absolute bottom-0 left-0 p-3.5">
            <p className="text-[#cd620e] text-[9px] font-black uppercase tracking-widest mb-0.5">
              Experience
            </p>
            <p className="text-white text-[17px] font-black leading-tight">
              Breakfast with Neeraj Chopra
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-white text-[13px] font-black">
                ₹12,500
              </span>
              <span className="text-[#8a8a9a] text-[9px]">
                3 seats left
              </span>
              <div
                className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg,#c9115f,#cd620e)",
                }}
              >
                <span className="text-white text-[10px] font-black">
                  Book
                </span>
                <ArrowUpRight className="w-[9px] h-[9px] text-white" />
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Asian Games Events teaser */}
      <div className="px-4 mb-3">
        <button
          onClick={() => router.push("/MainModules/AtheleteStore/StoreTicketedEvents")}
          className="w-full rounded-[18px] overflow-hidden relative text-left active:scale-[0.98] transition-transform"
          style={{
            height: 88,
            background:
              "linear-gradient(115deg, #0a0a0e 0%, #1a1000 100%)",
            border: "1px solid rgba(255,215,0,0.25)",
          }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-[120px] opacity-20">
            <img
              src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=240&h=176&fit=crop&auto=format"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 flex items-center px-4 gap-3">
            <div
              className="w-[44px] h-[44px] rounded-[14px] flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(255,215,0,0.12)",
                border: "1px solid rgba(255,215,0,0.3)",
              }}
            >
              <Trophy className="w-[20px] h-[20px] text-[#FFD700]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span
                  className="text-[7px] font-black px-1.5 py-0.5 rounded-full text-black"
                  style={{ background: "#FFD700" }}
                >
                  LIVE BOOKINGS
                </span>
                <span className="text-[#4a4a5a] text-[7px]">
                  Asian Games · Nagoya
                </span>
              </div>
              <p className="text-white text-[13px] font-black leading-snug">
                Post-Medal Fan Experiences
              </p>
              <p className="text-[#6a6a5a] text-[9px]">
                Virtual breakfasts · AMA sessions · Neeraj
                breakfast
              </p>
            </div>
            <ChevronRight className="w-[14px] h-[14px] text-[#FFD700] flex-shrink-0" />
          </div>
        </button>
      </div>

      {/* 2-col: Live Auction + AI Dolly */}
      <div className="px-4 mb-3">
        <div className="grid grid-cols-2 gap-2.5">
          {/* Live Auction */}
          <button
            onClick={() => router.push("/MainModules/AtheleteStore/StoreAuctions")}
            className="rounded-[16px] overflow-hidden relative text-left active:scale-[0.97] transition-transform"
            style={{ height: 130 }}
          >
            <img
              src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300&h=260&fit=crop&auto=format"
              alt="Auction"
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.92) 50%, rgba(0,0,0,0.1) 100%)",
              }}
            />
            <div
              className="absolute top-2 left-2 flex items-center gap-1 rounded-full px-1.5 py-0.5"
              style={{ background: "rgba(255,68,68,0.9)" }}
            >
              <div className="w-[4px] h-[4px] rounded-full bg-white animate-pulse" />
              <span className="text-white text-[7px] font-black">
                LIVE
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2.5">
              <p className="text-[#ff6b6b] text-[7px] font-bold uppercase tracking-wider">
                Auction
              </p>
              <p className="text-white text-[10px] font-bold leading-tight">
                Olympic Javelin
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[#cd620e] text-[10px] font-black">
                  ₹2,40,000
                </span>
                <div className="flex items-center gap-0.5">
                  <Timer className="w-[7px] h-[7px] text-[#FFD700]" />
                  <span className="text-[#FFD700] text-[7px] font-bold">
                    6h 14m
                  </span>
                </div>
              </div>
            </div>
          </button>

          {/* AI Dolly */}
          <button
            onClick={() => router.push("/MainModules/AtheleteStore/StoreDolly")}
            className="rounded-[16px] overflow-hidden text-left active:scale-[0.97] transition-transform flex flex-col relative"
            style={{
              height: 130,
              background:
                "linear-gradient(145deg, #1a0d2e, #0f0518)",
              border: "1px solid rgba(124,58,237,0.4)",
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-15">
              <div
                className="w-[80px] h-[80px] rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, #7c3aed, transparent)",
                }}
              />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div
                className="w-[52px] h-[52px] rounded-full overflow-hidden"
                style={{
                  border: "2px solid rgba(124,58,237,0.6)",
                  boxShadow: "0 0 16px rgba(124,58,237,0.5)",
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1570481662006-a3a1374699e8?w=104&h=104&fit=crop&auto=format"
                  alt="Dolly AI"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.parentElement!.innerHTML =
                      '<div style="width:100%;height:100%;background:#7c3aed44;display:flex;align-items:center;justify-content:center;font-size:22px">🐬</div>';
                  }}
                />
              </div>
            </div>
            <div className="p-2.5 pt-0 relative">
              <span
                className="text-[7px] font-black px-1.5 py-0.5 rounded-full text-white"
                style={{
                  background:
                    "linear-gradient(90deg,#7c3aed,#c9115f)",
                }}
              >
                AI COACH
              </span>
              <p className="text-white text-[11px] font-black mt-1">
                Ask Dolly
              </p>
              <p className="text-[#7c6a9a] text-[8px]">
                Free analysis
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 5-icon quick links */}
      <div className="px-4">
        <div className="grid grid-cols-5 gap-1">
          {[
            {
              label: "Coaches",
              icon: Users,
              route: "/store/coaches",
              color: "#c9115f",
            },
            {
              label: "Merch",
              icon: Gem,
              route: "/store/memorabilia",
              color: "#d97706",
            },
            {
              label: "Brands",
              icon: ShoppingBag,
              route: "/store/brands",
              color: "#8b5cf6",
            },
            {
              label: "Digital",
              icon: BookOpen,
              route: "/store/digital",
              color: "#0ea5e9",
            },
            {
              label: "Members",
              icon: Award,
              route: "/store/memberships",
              color: "#00c864",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => router.push(item.route)}
                className="flex flex-col items-center gap-1.5 py-2 active:scale-95 transition-transform"
              >
                <div
                  className="w-[44px] h-[44px] rounded-[14px] flex items-center justify-center"
                  style={{
                    background: `${item.color}18`,
                    border: `1px solid ${item.color}35`,
                  }}
                >
                  <Icon
                    className="w-[18px] h-[18px]"
                    style={{ color: item.color }}
                  />
                </div>
                <span className="text-[#99A1AF] text-[9px] font-semibold text-center leading-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
