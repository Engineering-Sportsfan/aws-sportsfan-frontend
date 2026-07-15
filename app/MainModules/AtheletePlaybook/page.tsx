'use client';

import { useEffect, useState } from 'react';
import type { PlaybookWeek } from "@/types/playbook";

import TimelineView from '@/src/components/charts/TimelineView';
import CalendarView from '@/src/components/charts/CalendarView';
import AgendaView from '@/src/components/charts/AgendaView';

import { playbookService } from '@/services/playbook.service';
import { useRouter } from 'next/navigation';

type TabType = 'timeline' | 'calendar' | 'agenda';

export default function Playbook() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>('timeline');
  const [playbook, setPlaybook] = useState<PlaybookWeek[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await playbookService.getAll();
        console.log("Playbook API:", data);
        setPlaybook(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    // <div className="bg-black h-screen w-full flex justify-center">
    //   <div className="bg-[#0b0b0f] relative w-full max-w-[390px] h-full">
     <div className="bg-black w-full flex justify-center min-h-screen">
            <div className="w-full max-w-6xl bg-[#0b0b0f] relative flex flex-col min-h-screen">
        {/*  Fixed Header - same max-w-[390px] as container */}
        {/* <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[rgba(11,11,15,0.97)] border-[rgba(255,255,255,0.1)] border-b border-solid h-[132px] w-full max-w-6xl"> */}
        <div className="fixed top-24 lg:top-14 left-1/2 -translate-x-1/2 z-50 bg-[rgba(11,11,15,0.97)] border-[rgba(255,255,255,0.1)] border-b border-solid h-[132px] w-full max-w-6xl ml-0 md:ml-20 lg:ml-15">
          <div className="absolute h-[54px] left-[16px] top-[17px] w-full max-w-[358px]">
            <div className="absolute h-[54px] left-[74px] top-0 w-[180px]">
              <div className="absolute h-[36px] left-0 top-[3px]">
                <p className="font-['Inter:Medium',sans-serif] font-medium leading-[36px] not-italic text-[#f5f5f7] text-[16px] tracking-[0.0703px] whitespace-nowrap">Playbook</p>
                <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic text-[#a8a8b0] text-[12px] whitespace-nowrap mt-0.5">Commonwealth Games 2026</p>
              </div>
            </div>

            {/* Back Button */}
            <button
              onClick={() => router.push('/MainModules/AtheleteHome')}
              className="absolute bg-[rgba(74,74,85,0.2)] border border-[rgba(255,255,255,0.2)] border-solid left-0 rounded-full size-[44px] top-0 cursor-pointer hover:bg-[rgba(74,74,85,0.3)] transition-colors flex items-center justify-center"
            >
              <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
              </svg>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="absolute h-[40px] left-[16px] top-[86px] w-[358px] flex gap-[8px]">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`h-[30px] rounded-[14px] px-4 flex items-center gap-2 transition-all ${activeTab === 'timeline' ? 'border border-[#ff5900] border-solid' : 'bg-[#2a2a32]'}`}
              style={activeTab === 'timeline' ? { backgroundImage: 'linear-gradient(102.077deg, rgba(255, 77, 0, 0.5) 4.054%, rgba(201, 17, 95, 0.5) 95.887%)' } : {}}
            >
              <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="6" stroke="#A8A8B0" strokeWidth="1.33333" />
                <path d="M8 4V8L10.6667 9.33333" stroke="#A8A8B0" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
              </svg>
              <p className="font-['Inter:Medium',sans-serif] font-medium text-[14px] whitespace-nowrap" style={{ color: activeTab === 'timeline' ? 'white' : '#a8a8b0' }}>Timeline</p>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`h-[30px] rounded-[14px] px-4 flex items-center gap-2 transition-all ${activeTab === 'calendar' ? 'border border-[#ff5900] border-solid' : 'bg-[#2a2a32]'}`}
              style={activeTab === 'calendar' ? { backgroundImage: 'linear-gradient(102.077deg, rgba(255, 77, 0, 0.5) 4.054%, rgba(201, 17, 95, 0.5) 95.887%)' } : {}}
            >
              <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
                <path d="M5.33333 1.33333V4M10.6667 1.33333V4M2.66667 6.66667H13.3333M2 5.33333C2 4.59695 2.59695 4 3.33333 4H12.6667C13.403 4 14 4.59695 14 5.33333V12.6667C14 13.403 13.403 14 12.6667 14H3.33333C2.59695 14 2 13.403 2 12.6667V5.33333Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
              </svg>
              <p className="font-['Inter:Medium',sans-serif] font-medium text-[14px] whitespace-nowrap text-white">Calendar</p>
            </button>

            <button
              onClick={() => setActiveTab('agenda')}
              className={`h-[30px] rounded-[14px] px-4 flex items-center gap-2 transition-all ${activeTab === 'agenda' ? 'border border-[#ff5900] border-solid' : 'bg-[#2a2a32]'}`}
              style={activeTab === 'agenda' ? { backgroundImage: 'linear-gradient(102.077deg, rgba(255, 77, 0, 0.5) 4.054%, rgba(201, 17, 95, 0.5) 95.887%)' } : {}}
            >
              <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
                <path d="M2 8H2.00667M2 12H2.00667M2 4H2.00667M5.33333 8H14M5.33333 12H14M5.33333 4H14" stroke="#A8A8B0" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
              </svg>
              <p className="font-['Inter:Medium',sans-serif] font-medium text-[14px] whitespace-nowrap" style={{ color: activeTab === 'agenda' ? 'white' : '#a8a8b0' }}>Agenda</p>
            </button>
          </div>
        </div>

        {/* Scrollable Content - now max-w-[390px] to match header */}
        <div
          className="overflow-y-auto w-full max-w-[390px] mx-auto"
          style={{ paddingTop: '132px', height: '100vh' }}
        >
          {activeTab === 'timeline' && (
            <TimelineView
              playbook={playbook}
              onNavigate={router.push}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              playbook={playbook}
              onNavigate={router.push}
            />
          )}

          {activeTab === 'agenda' && (
            <AgendaView
              playbook={playbook}
              onNavigate={router.push}
            />
          )}
        </div>
      </div>
    </div>
  );
}