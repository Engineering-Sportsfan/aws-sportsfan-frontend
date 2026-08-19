'use client';


import { useRouter } from 'next/navigation';  
import HomeScreen from './figma/HomeScreen-20-282';
import { Bell, Star, User, Search, Sparkles } from 'lucide-react';
import StoreFeedSection from './figma/HomeStore';
import MaskGroup from '@/src/components/CommonComponent/MaskGroup/MaskGroup';

export default function HomeScreenWrapper() {
  const router = useRouter();

  const handleViewPlaybook = () => {
     router.push('/playbook');  
  };

  return (
    <div className="w-full h-full bg-[#0b0b0f] relative flex flex-col" style={{ height: '100%' }}>
      {/* Fixed top header */}
      <div className="bg-[#0b0b0f] border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between px-4 gap-2 w-full max-w-[390px] mx-auto">
        {/* Logo */}
        {/* <div className="flex items-center">
          <div className="relative w-[28px] h-[36px]">
            <MaskGroup />
          </div>
        </div> */}

        {/* Search Bar */}
        {/* <div className="flex-1 max-w-[180px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#99A1AF]" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-full pl-9 pr-9 py-1.5 text-white text-[13px] placeholder:text-[#99A1AF] focus:outline-none focus:border-[rgba(201,17,95,0.5)]"
            />
            <button
              onClick={() => router.push('/ask-ai')}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-[24px] h-[24px] rounded-full bg-gradient-to-r from-[#FF7A00] to-[#FF4DA6] flex items-center justify-center shadow-[0_0_12px_rgba(255,122,0,0.4)] hover:shadow-[0_0_16px_rgba(255,122,0,0.6)] transition-all"
            >
              <Sparkles className="w-[12px] h-[12px] text-white" />
            </button>
          </div>
        </div> */}

        {/* Points, Notification, Profile */}
        {/* <div className="flex items-center gap-[6px]">
          <div className="flex items-center gap-[4px] bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] rounded-full px-[8px] py-[4px]">
            <Star className="w-[12px] h-[12px] text-[#FFD700] fill-[#FFD700]" />
            <span className="text-white font-['Inter:Semi_Bold',sans-serif] font-semibold text-[11px] leading-none">250</span>
          </div>
          <button className="relative bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] rounded-full p-[6px] hover:bg-[rgba(255,255,255,0.1)] transition-colors">
            <Bell className="w-[14px] h-[14px] text-white" />
            <div className="absolute -top-[2px] -right-[2px] bg-[#ff0055] rounded-full w-[14px] h-[14px] flex items-center justify-center">
              <span className="text-white text-[8px] font-['Inter:Bold',sans-serif] font-bold leading-none">3</span>
            </div>
          </button>
          <button className="flex items-center justify-center w-[28px] h-[28px] bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] rounded-full p-[6px] hover:bg-[rgba(255,255,255,0.1)] transition-colors">
            <User className="w-[14px] h-[14px] text-white" />
          </button>
        </div> */}
      </div>

      {/* Scrollable content area — hides original bottom nav bar from Figma */}
      <div
        className="flex-1 overflow-y-auto no-scrollbar w-full max-w-[390px] mx-auto"
        style={{ paddingBottom: '8px' }}
        // onClick={(e) => {
        //   const target = e.target as HTMLElement;
        //   if (target.closest('[data-playbook-button]') || target.textContent?.includes('View Playbook')) {
        //     handleViewPlaybook();
        //   }
        //   if (target.closest('[data-records-button]') || target.textContent?.includes('Explore Records')) {
        //     navigate('/records-explorer');
        //   }
        //   // Neeraj Chopra card in Players 360 section
        //   if (target.textContent?.includes('Neeraj Chopra') && !target.closest('button')) {
        //     navigate('/athlete/neeraj-chopra');
        //   }
        //   if (target.closest('[data-match-centre-button]')) {
        //     navigate('/match-centre');
        //   }
        // }}
      >
        <style>{`
          /* Hide the original bottom nav from the Figma import */
          .home-scroll-wrap .top-\\[1721px\\] { display: none !important; }

          /* Hide duplicate search bar (Container2) */
          .home-scroll-wrap [data-name="Container"]:has(input) { display: none !important; }

          /* Hide duplicate elements at top */
          .home-scroll-wrap .left-\\[106px\\].top-\\[31px\\] { display: none !important; }
          .home-scroll-wrap .left-\\[19px\\].top-\\[16px\\] { display: none !important; }

          /* Hide Match Intelligence section */
          .home-scroll-wrap [data-name*="Match Intelligence"],
          .home-scroll-wrap .top-\\[900px\\] { display: none !important; }

          /* Remove top spacing from home screen */
          .home-scroll-wrap > div[data-name="Home screen"] {
            margin-top: -63px !important;
            height: 1800px !important;
          }
        `}</style>

        {/* Playbook button overlay */}
        {/* <div data-playbook-button className="absolute inset-0 pointer-events-none z-10">
          <div
            className="absolute w-[138.492px] h-[40px] pointer-events-auto cursor-pointer rounded-full"
            style={{ left: '37px', top: '543px' }}
          />
        </div> */}

        {/* Explore Records button overlay */}
        {/* <div data-records-button className="absolute inset-0 pointer-events-none z-10">
          <div
            className="absolute w-[300px] h-[40px] pointer-events-auto cursor-pointer rounded-full"
            style={{ left: '44px', top: '485px' }}
          />
        </div> */}

        <div className="home-scroll-wrap relative">
          <HomeScreen />
          {/* Match Centre button overlay */}
          <button
            onClick={() => router.push('/MainModules/AtheleteMatchCenter')}
            className="absolute z-20 flex items-center gap-1.5 rounded-full text-white font-semibold text-[12px] px-4 py-2 shadow-lg active:scale-95 transition-all"
            style={{
              top: '543px',
              left: '185px',
              background: 'linear-gradient(102deg, #ff5900 0%, #c9115f 100%)',
              boxShadow: '0 4px 18px rgba(201,17,95,0.45)',
              height: '40px',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1.16667L8.75417 5.14583L13.125 5.5425L9.9225 8.33083L10.8883 12.6133L7 10.2308L3.11167 12.6133L4.0775 8.33083L0.875 5.5425L5.24583 5.14583L7 1.16667Z" stroke="white" strokeWidth="1.2" strokeLinejoin="round"/>
            </svg>
            Match Centre
          </button>
        </div>
        <div
          style={{

            background:
              "linear-gradient(to bottom, transparent, #0b0b0f)",
          }}
        />
        <div
          className="mx-4 mb-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(201,17,95,0.5), transparent)",
          }}
        />

        {/* Store Highlights — at the end of the feed */}
        <StoreFeedSection /> 
      </div>
    </div>
  );
}
