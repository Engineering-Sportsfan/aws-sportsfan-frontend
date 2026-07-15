import svgPaths from "./svg-3uil9svw19";

function Heading() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="Heading 1">
      <p className="[word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[32px] left-0 not-italic text-[24px] text-white top-0 tracking-[-0.4097px] whitespace-nowrap">AFI Records Explorer</p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#99a1af] text-[14px] top-[0.5px] tracking-[-0.1504px] whitespace-nowrap">National vs Olympic vs World Records</p>
    </div>
  );
}

function Container() {
  return (
    <div className="h-[96px] relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col gap-[8px] items-start pt-[20px] px-[16px] relative size-full">
        <Heading />
        <Paragraph />
      </div>
    </div>
  );
}

function Text() {
  return (
    <div className="flex-[1_0_0] h-[20px] min-w-px relative" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[14.5px] not-italic text-[14px] text-center text-white top-[0.5px] tracking-[-0.1504px] whitespace-nowrap">Men</p>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M4 6L8 10L12 6" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function ButtonCategoryMen() {
  return (
    <div className="absolute bg-[#161616] content-stretch flex gap-[8px] h-[48px] items-center left-0 px-[18px] py-[14px] rounded-[16777200px] top-0 w-[88.445px]" data-name="Button - Category: Men">
      <div aria-hidden="true" className="absolute border-2 border-[#2a2a2a] border-solid inset-0 pointer-events-none rounded-[16777200px]" />
      <Text />
      <Icon />
    </div>
  );
}

function Text1() {
  return (
    <div className="flex-[1_0_0] h-[20px] min-w-px relative" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[24px] not-italic text-[14px] text-center text-white top-[0.5px] tracking-[-0.1504px] whitespace-nowrap">Throws</p>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M4 6L8 10L12 6" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function ButtonDisciplineThrows() {
  return (
    <div className="absolute bg-[#161616] content-stretch flex gap-[8px] h-[48px] items-center left-[96.45px] px-[18px] py-[14px] rounded-[16777200px] top-0 w-[108.563px]" data-name="Button - Discipline: Throws">
      <div aria-hidden="true" className="absolute border-2 border-[#2a2a2a] border-solid inset-0 pointer-events-none rounded-[16777200px]" />
      <Text1 />
      <Icon1 />
    </div>
  );
}

function Text2() {
  return (
    <div className="flex-[1_0_0] h-[20px] min-w-px relative" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[28.5px] not-italic text-[14px] text-center text-white top-[0.5px] tracking-[-0.1504px] whitespace-nowrap">Shot Put</p>
      </div>
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M4 6L8 10L12 6" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function ButtonEventShotPut() {
  return (
    <div className="absolute bg-[#161616] content-stretch flex gap-[8px] h-[48px] items-center left-[213.01px] px-[18px] py-[14px] rounded-[16777200px] top-0 w-[116.656px]" data-name="Button - Event: Shot Put">
      <div aria-hidden="true" className="absolute border-2 border-[#2a2a2a] border-solid inset-0 pointer-events-none rounded-[16777200px]" />
      <Text2 />
      <Icon2 />
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Container">
      <ButtonCategoryMen />
      <ButtonDisciplineThrows />
      <ButtonEventShotPut />
    </div>
  );
}

function FilterPanel() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="FilterPanel">
      <div className="content-stretch flex flex-col items-start px-[16px] relative size-full">
        <Container1 />
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="bg-black content-stretch flex flex-col h-[157px] items-start pb-px relative shrink-0 w-full" data-name="Header">
      <div aria-hidden="true" className="absolute border-[#222] border-b border-solid inset-0 pointer-events-none" />
      <Container />
      <FilterPanel />
    </div>
  );
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d="M2.5 10H2.50833" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M2.5 15H2.50833" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M2.5 5H2.50833" id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M6.66667 10H17.5" id="Vector_4" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M6.66667 15H17.5" id="Vector_5" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M6.66667 5H17.5" id="Vector_6" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function RecordsExplorer1() {
  return (
    <div className="h-[24px] relative shrink-0 w-[111.906px]" data-name="RecordsExplorer">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] left-0 not-italic text-[16px] text-white top-[-0.5px] tracking-[-0.3125px] whitespace-nowrap">View Overview</p>
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="bg-[#c9115f] h-[56px] relative rounded-[16px] shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[8px] items-center justify-center px-[109.047px] py-[16px] relative size-full">
          <Icon3 />
          <RecordsExplorer1 />
        </div>
      </div>
    </div>
  );
}

function Icon4() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_48_1060)" id="Icon">
          <path d={svgPaths.p30052a00} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p1b84be20} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M2.66667 14.6667H13.3333" id="Vector_3" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p3205b80} id="Vector_4" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p3222c80} id="Vector_5" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p2274e770} id="Vector_6" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
        <defs>
          <clipPath id="clip0_48_1060">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text3() {
  return (
    <div className="h-[20px] relative shrink-0 w-[52.797px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[26.5px] not-italic text-[#99a1af] text-[14px] text-center top-[0.5px] tracking-[-0.3604px] whitespace-nowrap">Records</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[8px] items-center justify-center pl-[17.266px] pr-[17.273px] relative size-full">
          <Icon4 />
          <Text3 />
        </div>
      </div>
    </div>
  );
}

function TabRecordsView() {
  return (
    <div className="absolute content-stretch flex flex-col h-[44px] items-start left-[8px] pt-[12px] rounded-[14px] top-[8px] w-[111.336px]" data-name="Tab - Records view">
      <Container3 />
    </div>
  );
}

function Icon5() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.pea6a680} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p3155f180} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Text4() {
  return (
    <div className="h-[20px] relative shrink-0 w-[44.086px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[22.5px] not-italic text-[#99a1af] text-[14px] text-center top-[0.5px] tracking-[-0.3604px] whitespace-nowrap">Trends</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[8px] items-center justify-center px-[21.625px] relative size-full">
          <Icon5 />
          <Text4 />
        </div>
      </div>
    </div>
  );
}

function TabTrendsView() {
  return (
    <div className="absolute content-stretch flex flex-col h-[44px] items-start left-[123.34px] pt-[12px] rounded-[14px] top-[8px] w-[111.336px]" data-name="Tab - Trends view">
      <Container4 />
    </div>
  );
}

function Container5() {
  return <div className="absolute h-[44px] left-0 rounded-[14px] top-0 w-[111.336px]" style={{ backgroundImage: "linear-gradient(159.867deg, rgba(201, 17, 95, 0.2) 1.7413%, rgba(201, 17, 95, 0.05) 98.259%)" }} data-name="Container" />;
}

function Icon6() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p90824c0} id="Vector" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M12 11.3333V6" id="Vector_2" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M8.66667 11.3333V3.33333" id="Vector_3" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M5.33333 11.3333V9.33333" id="Vector_4" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Text5() {
  return (
    <div className="h-[20px] relative shrink-0 w-[57.133px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[29.5px] not-italic text-[14px] text-center text-white top-[0.5px] tracking-[-0.3604px] whitespace-nowrap">Progress</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute content-stretch flex gap-[8px] h-[20px] items-center justify-center left-0 px-[15.102px] top-[12px] w-[111.336px]" data-name="Container">
      <Icon6 />
      <Text5 />
    </div>
  );
}

function TabProgressView() {
  return (
    <div className="absolute h-[44px] left-[238.67px] rounded-[14px] top-[8px] w-[111.336px]" data-name="Tab - Progress view">
      <Container5 />
      <Container6 />
    </div>
  );
}

function ModeSwitch() {
  return (
    <div className="bg-[#161616] h-[60px] relative rounded-[16px] shrink-0 w-full" data-name="ModeSwitch">
      <div aria-hidden="true" className="absolute border-2 border-[#2a2a2a] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <TabRecordsView />
      <TabTrendsView />
      <TabProgressView />
    </div>
  );
}

function Heading1() {
  return (
    <div className="absolute h-[28px] left-[26px] top-[26px] w-[306px]" data-name="Heading 2">
      <p className="[word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[28px] left-0 not-italic text-[18px] text-white top-0 tracking-[-0.7095px] whitespace-nowrap">Gap to World Record</p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="absolute h-[40px] left-[26px] top-[66px] w-[306px]" data-name="Paragraph">
      <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#99a1af] text-[14px] top-[0.5px] tracking-[-0.1504px] w-[306px]">{`Showing how India's national record is closing the gap`}</p>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute inset-[1.95%_1.63%_13.67%_21.24%]" data-name="Group">
      <div className="absolute inset-[-0.23%_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 236 217">
          <g id="Group">
            <path d="M0 216.5H236" id="Vector" stroke="var(--stroke-0, #1A1A1A)" strokeDasharray="3 3" />
            <path d="M0 162.5H236" id="Vector_2" stroke="var(--stroke-0, #1A1A1A)" strokeDasharray="3 3" />
            <path d="M0 108.5H236" id="Vector_3" stroke="var(--stroke-0, #1A1A1A)" strokeDasharray="3 3" />
            <path d="M0 54.5H236" id="Vector_4" stroke="var(--stroke-0, #1A1A1A)" strokeDasharray="3 3" />
            <path d="M0 0.5H236" id="Vector_5" stroke="var(--stroke-0, #1A1A1A)" strokeDasharray="3 3" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute inset-[1.95%_1.63%_13.67%_21.24%]" data-name="Group">
      <div className="absolute inset-[0_-0.21%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 237 216">
          <g id="Group">
            <path d="M44.75 0V216" id="Vector" stroke="var(--stroke-0, #1A1A1A)" strokeDasharray="3 3" />
            <path d="M103.75 0V216" id="Vector_2" stroke="var(--stroke-0, #1A1A1A)" strokeDasharray="3 3" />
            <path d="M162.75 0V216" id="Vector_3" stroke="var(--stroke-0, #1A1A1A)" strokeDasharray="3 3" />
            <path d="M221.75 0V216" id="Vector_4" stroke="var(--stroke-0, #1A1A1A)" strokeDasharray="3 3" />
            <path d="M0.5 0V216" id="Vector_5" stroke="var(--stroke-0, #1A1A1A)" strokeDasharray="3 3" />
            <path d="M236.5 0V216" id="Vector_6" stroke="var(--stroke-0, #1A1A1A)" strokeDasharray="3 3" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents inset-[1.95%_1.63%_13.67%_21.24%]" data-name="Group">
      <Group1 />
      <Group2 />
    </div>
  );
}

function Group5() {
  return (
    <div className="absolute contents inset-[86.33%_59.72%_6.05%_31.13%]" data-name="Group">
      <div className="absolute inset-[86.33%_64.3%_11.33%_35.7%]" data-name="Vector">
        <div className="absolute inset-[0_-0.5px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1 6">
            <path d="M0.5 6V0" id="Vector" stroke="var(--stroke-0, #99A1AF)" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal inset-[88.09%_59.72%_6.05%_31.13%] leading-[normal] not-italic text-[#99a1af] text-[12px] text-center whitespace-nowrap">2016</p>
    </div>
  );
}

function Group6() {
  return (
    <div className="absolute contents inset-[86.33%_40.44%_6.05%_50.41%]" data-name="Group">
      <div className="absolute inset-[86.33%_45.02%_11.33%_54.98%]" data-name="Vector">
        <div className="absolute inset-[0_-0.5px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1 6">
            <path d="M0.5 6V0" id="Vector" stroke="var(--stroke-0, #99A1AF)" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal inset-[88.09%_40.44%_6.05%_50.41%] leading-[normal] not-italic text-[#99a1af] text-[12px] text-center whitespace-nowrap">2018</p>
    </div>
  );
}

function Group7() {
  return (
    <div className="absolute contents inset-[86.33%_20.83%_6.05%_69.36%]" data-name="Group">
      <div className="absolute inset-[86.33%_25.74%_11.33%_74.26%]" data-name="Vector">
        <div className="absolute inset-[0_-0.5px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1 6">
            <path d="M0.5 6V0" id="Vector" stroke="var(--stroke-0, #99A1AF)" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal inset-[88.09%_20.83%_6.05%_69.36%] leading-[normal] not-italic text-[#99a1af] text-[12px] text-center whitespace-nowrap">2020</p>
    </div>
  );
}

function Group8() {
  return (
    <div className="absolute contents inset-[86.33%_1.55%_6.05%_88.64%]" data-name="Group">
      <div className="absolute inset-[86.33%_6.45%_11.33%_93.55%]" data-name="Vector">
        <div className="absolute inset-[0_-0.5px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1 6">
            <path d="M0.5 6V0" id="Vector" stroke="var(--stroke-0, #99A1AF)" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal inset-[88.09%_1.55%_6.05%_88.64%] leading-[normal] not-italic text-[#99a1af] text-[12px] text-center whitespace-nowrap">2022</p>
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute contents inset-[86.33%_1.55%_6.05%_31.13%]" data-name="Group">
      <Group5 />
      <Group6 />
      <Group7 />
      <Group8 />
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute contents inset-[86.33%_1.55%_-1.17%_21.24%]" data-name="Group">
      <div className="absolute inset-[86.33%_1.63%_13.67%_21.24%]" data-name="Vector">
        <div className="absolute inset-[-0.5px_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 236 1">
            <path d="M0 0.5H236" id="Vector" stroke="var(--stroke-0, #99A1AF)" />
          </svg>
        </div>
      </div>
      <Group4 />
      <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal inset-[95.31%_35.95%_-1.17%_55.56%] leading-[normal] not-italic text-[#99a1af] text-[12px] text-center whitespace-nowrap">Year</p>
    </div>
  );
}

function Group11() {
  return (
    <div className="absolute contents inset-[83.3%_78.76%_10.84%_16.01%]" data-name="Group">
      <div className="absolute inset-[86.33%_78.76%_13.67%_19.28%]" data-name="Vector">
        <div className="absolute inset-[-0.5px_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 1">
            <path d="M0 0.5H6" id="Vector" stroke="var(--stroke-0, #99A1AF)" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal inset-[83.3%_81.37%_10.84%_16.01%] leading-[normal] not-italic text-[#99a1af] text-[12px] text-right whitespace-nowrap">0</p>
    </div>
  );
}

function Group12() {
  return (
    <div className="absolute contents inset-[62.21%_78.76%_31.93%_10.13%]" data-name="Group">
      <div className="absolute inset-[65.23%_78.76%_34.77%_19.28%]" data-name="Vector">
        <div className="absolute inset-[-0.5px_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 1">
            <path d="M0 0.5H6" id="Vector" stroke="var(--stroke-0, #99A1AF)" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal inset-[62.21%_81.37%_31.93%_10.13%] leading-[normal] not-italic text-[#99a1af] text-[12px] text-right whitespace-nowrap">0.25</p>
    </div>
  );
}

function Group13() {
  return (
    <div className="absolute contents inset-[41.12%_78.76%_53.02%_12.75%]" data-name="Group">
      <div className="absolute inset-[44.14%_78.76%_55.86%_19.28%]" data-name="Vector">
        <div className="absolute inset-[-0.5px_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 1">
            <path d="M0 0.5H6" id="Vector" stroke="var(--stroke-0, #99A1AF)" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal inset-[41.12%_81.37%_53.02%_12.75%] leading-[normal] not-italic text-[#99a1af] text-[12px] text-right whitespace-nowrap">0.5</p>
    </div>
  );
}

function Group14() {
  return (
    <div className="absolute contents inset-[20.02%_78.76%_74.12%_10.46%]" data-name="Group">
      <div className="absolute inset-[23.05%_78.76%_76.95%_19.28%]" data-name="Vector">
        <div className="absolute inset-[-0.5px_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 1">
            <path d="M0 0.5H6" id="Vector" stroke="var(--stroke-0, #99A1AF)" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal inset-[20.02%_81.37%_74.12%_10.46%] leading-[normal] not-italic text-[#99a1af] text-[12px] text-right whitespace-nowrap">0.75</p>
    </div>
  );
}

function Group15() {
  return (
    <div className="absolute contents inset-[0.49%_78.76%_93.65%_16.67%]" data-name="Group">
      <div className="absolute inset-[1.95%_78.76%_98.05%_19.28%]" data-name="Vector">
        <div className="absolute inset-[-0.5px_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 1">
            <path d="M0 0.5H6" id="Vector" stroke="var(--stroke-0, #99A1AF)" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal inset-[0.49%_81.37%_93.65%_16.67%] leading-[normal] not-italic text-[#99a1af] text-[12px] text-right whitespace-nowrap">1</p>
    </div>
  );
}

function Group10() {
  return (
    <div className="absolute contents inset-[0.49%_78.76%_10.84%_10.13%]" data-name="Group">
      <Group11 />
      <Group12 />
      <Group13 />
      <Group14 />
      <Group15 />
    </div>
  );
}

function Group9() {
  return (
    <div className="absolute contents inset-[0.49%_78.76%_10.84%_0.74%]" data-name="Group">
      <div className="absolute inset-[1.95%_78.76%_13.67%_21.24%]" data-name="Vector">
        <div className="absolute inset-[0_-0.5px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1 216">
            <path d="M0.5 0V216" id="Vector" stroke="var(--stroke-0, #99A1AF)" />
          </svg>
        </div>
      </div>
      <Group10 />
      <div className="absolute flex inset-[11.72%_94.36%_55.86%_0.74%] items-center justify-center" style={{ containerType: "size" }}>
        <div className="-rotate-90 flex-none h-[100cqw] w-[100cqh]">
          <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative text-[#99a1af] text-[12px] whitespace-nowrap">Gap (seconds)</p>
        </div>
      </div>
    </div>
  );
}

function Group19() {
  return (
    <div className="absolute inset-[12.92%_70.28%_13.67%_22.21%]" data-name="Group">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23 187.92">
        <g id="Group">
          <path d={svgPaths.p2942ff80} fill="var(--fill-0, #CD620E)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group20() {
  return (
    <div className="absolute inset-[28.95%_60.64%_13.67%_31.85%]" data-name="Group">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23 146.88">
        <g id="Group">
          <path d={svgPaths.p103a4a00} fill="var(--fill-0, #C9115F)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group21() {
  return (
    <div className="absolute inset-[25.58%_51%_13.67%_41.49%]" data-name="Group">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23 155.52">
        <g id="Group">
          <path d={svgPaths.p330f6540} fill="var(--fill-0, #CD620E)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group22() {
  return (
    <div className="absolute inset-[27.27%_41.36%_13.67%_51.13%]" data-name="Group">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23 151.2">
        <g id="Group">
          <path d={svgPaths.p211fe880} fill="var(--fill-0, #C9115F)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group23() {
  return (
    <div className="absolute inset-[29.8%_31.72%_13.67%_60.77%]" data-name="Group">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23 144.72">
        <g id="Group">
          <path d={svgPaths.p2d634d80} fill="var(--fill-0, #C9115F)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group24() {
  return (
    <div className="absolute inset-[28.95%_22.08%_13.67%_70.41%]" data-name="Group">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23 146.88">
        <g id="Group">
          <path d={svgPaths.pb714640} fill="var(--fill-0, #C0C0C0)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group25() {
  return (
    <div className="absolute inset-[30.64%_12.43%_13.67%_80.05%]" data-name="Group">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23 142.56">
        <g id="Group">
          <path d={svgPaths.p237c8af0} fill="var(--fill-0, #C9115F)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group26() {
  return (
    <div className="absolute inset-[28.95%_2.79%_13.67%_89.69%]" data-name="Group">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23 146.88">
        <g id="Group">
          <path d={svgPaths.p17acedb0} fill="var(--fill-0, #C9115F)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group18() {
  return (
    <div className="absolute contents inset-[12.92%_2.79%_13.67%_22.21%]" data-name="Group">
      <Group19 />
      <Group20 />
      <Group21 />
      <Group22 />
      <Group23 />
      <Group24 />
      <Group25 />
      <Group26 />
    </div>
  );
}

function Group17() {
  return (
    <div className="absolute contents inset-[12.92%_2.79%_13.67%_22.21%]" data-name="Group">
      <Group18 />
    </div>
  );
}

function Group16() {
  return (
    <div className="absolute contents inset-[12.92%_2.79%_13.67%_22.21%]" data-name="Group">
      <Group17 />
    </div>
  );
}

function Surface() {
  return (
    <div className="absolute h-[256px] left-0 overflow-clip top-0 w-[306px]" data-name="Surface">
      <Group />
      <Group3 />
      <Group9 />
      <Group16 />
    </div>
  );
}

function ImageBarChartShowingTheGapToWorldRecordFrom2015To2022DemonstratingProgressOverTime() {
  return (
    <div className="absolute h-[256px] left-[26px] top-[126px] w-[306px]" data-name="Image - Bar chart showing the gap to world record from 2015 to 2022, demonstrating progress over time">
      <Surface />
    </div>
  );
}

function ProgressView() {
  return (
    <div className="bg-[#161616] h-[408px] relative rounded-[16px] shrink-0 w-full" data-name="ProgressView">
      <div aria-hidden="true" className="absolute border-2 border-[#2a2a2a] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <Heading1 />
      <Paragraph1 />
      <ImageBarChartShowingTheGapToWorldRecordFrom2015To2022DemonstratingProgressOverTime />
    </div>
  );
}

function Icon7() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <path d={svgPaths.pace200} id="Vector" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p3c6311f0} id="Vector_2" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p3d728000} id="Vector_3" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Container9() {
  return (
    <div className="relative rounded-[16777200px] shrink-0 size-[48px]" style={{ backgroundImage: "linear-gradient(137.15deg, rgba(201, 17, 95, 0.3) 1.7413%, rgba(201, 17, 95, 0.1) 98.259%)" }} data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[12px] relative size-full">
        <Icon7 />
      </div>
    </div>
  );
}

function Heading2() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="[word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[24px] left-0 not-italic text-[16px] text-white top-[-0.5px] tracking-[-0.5525px] whitespace-nowrap">Progress Insight</p>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[69.75px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal leading-[0] left-0 not-italic text-[0px] text-[rgba(255,255,255,0.9)] top-[0.5px] tracking-[-0.1504px] w-[242px]">
        <span className="leading-[22.75px] text-[14px]">{`Gap reduced by `}</span>
        <span className="font-['Inter:Bold',sans-serif] font-bold leading-[24px] text-[#c9115f] text-[16px] tracking-[-0.3125px]">21.8%</span>
        <span className="leading-[22.75px] text-[14px]">{` since 2015. India is making steady progress in Shot Put.`}</span>
      </p>
    </div>
  );
}

function Container10() {
  return (
    <div className="flex-[242_0_0] h-[101.75px] min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[8px] items-start relative size-full">
        <Heading2 />
        <Paragraph2 />
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex gap-[16px] h-[101.75px] items-start relative shrink-0 w-full" data-name="Container">
      <Container9 />
      <Container10 />
    </div>
  );
}

function ProgressView1() {
  return (
    <div className="h-[153.75px] relative rounded-[16px] shrink-0 w-full" style={{ backgroundImage: "linear-gradient(158.278deg, rgba(201, 17, 95, 0.2) 1.7413%, rgba(201, 17, 95, 0.05) 98.259%)" }} data-name="ProgressView">
      <div aria-hidden="true" className="absolute border-2 border-[#2a2a2a] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col items-start pb-[2px] pt-[26px] px-[26px] relative size-full">
        <Container8 />
      </div>
    </div>
  );
}

function Icon8() {
  return (
    <div className="absolute left-0 size-[20px] top-[2px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d="M6.66667 1.66667V5" id="Vector" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M13.3333 1.66667V5" id="Vector_2" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p1da67b80} id="Vector_3" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M2.5 8.33333H17.5" id="Vector_4" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Heading3() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Heading 3">
      <Icon8 />
      <p className="[word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[24px] left-[28px] not-italic text-[16px] text-white top-[-0.5px] tracking-[-0.5525px] whitespace-nowrap">Key Milestones</p>
    </div>
  );
}

function Container13() {
  return <div className="absolute bg-[#c9115f] left-0 rounded-[16777200px] size-[12px] top-[6px]" data-name="Container" />;
}

function Paragraph3() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] left-0 not-italic text-[14px] text-[rgba(255,255,255,0.9)] top-[0.5px] tracking-[-0.1504px] whitespace-nowrap">2016 - Best Performance</p>
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="h-[19.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal leading-[19.5px] left-0 not-italic text-[#99a1af] text-[12px] top-[0.5px] whitespace-nowrap">Smallest gap to world record at 0.68s</p>
    </div>
  );
}

function Container14() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[6px] h-[45.5px] items-start left-[24px] top-0 w-[282px]" data-name="Container">
      <Paragraph3 />
      <Paragraph4 />
    </div>
  );
}

function Container12() {
  return (
    <div className="h-[45.5px] relative shrink-0 w-full" data-name="Container">
      <Container13 />
      <Container14 />
    </div>
  );
}

function Container16() {
  return <div className="absolute bg-[#c0c0c0] left-0 rounded-[16777200px] size-[12px] top-[6px]" data-name="Container" />;
}

function Paragraph5() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] left-0 not-italic text-[14px] text-[rgba(255,255,255,0.9)] top-[0.5px] tracking-[-0.1504px] whitespace-nowrap">2021 - Consistent Improvement</p>
    </div>
  );
}

function Container17() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[6px] h-[65px] items-start left-[24px] top-0 w-[282px]" data-name="Container">
      <Paragraph5 />
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[19.5px] not-italic relative shrink-0 text-[#99a1af] text-[12px] w-full">Maintained sub-0.70s gap for 4 consecutive years</p>
    </div>
  );
}

function Container15() {
  return (
    <div className="h-[65px] relative shrink-0 w-full" data-name="Container">
      <Container16 />
      <Container17 />
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] h-[126.5px] items-start relative shrink-0 w-full" data-name="Container">
      <Container12 />
      <Container15 />
    </div>
  );
}

function ProgressView2() {
  return (
    <div className="bg-[#161616] h-[218.5px] relative rounded-[16px] shrink-0 w-full" data-name="ProgressView">
      <div aria-hidden="true" className="absolute border-2 border-[#2a2a2a] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col gap-[16px] items-start pb-[2px] pt-[26px] px-[26px] relative size-full">
        <Heading3 />
        <Container11 />
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] h-[812.25px] items-start relative shrink-0 w-full" data-name="Container">
      <ProgressView />
      <ProgressView1 />
      <ProgressView2 />
    </div>
  );
}

function Heading4() {
  return (
    <div className="absolute h-[20px] left-0 top-[16px] w-[358px]" data-name="Heading 2">
      <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] left-[4px] not-italic text-[#99a1af] text-[14px] top-[0.5px] tracking-[0.1996px] uppercase whitespace-nowrap">Featured Stories</p>
    </div>
  );
}

function Icon9() {
  return (
    <div className="absolute left-[26px] size-[28px] top-[26px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
        <g id="Icon">
          <path d={svgPaths.p3c56a600} id="Vector" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33333" />
          <path d={svgPaths.p4334a48} id="Vector_2" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33333" />
          <path d="M4.66667 25.6667H23.3333" id="Vector_3" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33333" />
          <path d={svgPaths.p1c650200} id="Vector_4" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33333" />
          <path d={svgPaths.p248a3980} id="Vector_5" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33333" />
          <path d={svgPaths.p1490c980} id="Vector_6" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33333" />
        </g>
      </svg>
    </div>
  );
}

function Heading5() {
  return (
    <div className="absolute h-[24px] left-[26px] top-[70px] w-[208px]" data-name="Heading 3">
      <p className="[word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[24px] left-0 not-italic text-[16px] text-white top-[-0.5px] tracking-[-0.6325px] whitespace-nowrap">{`India's Fastest Shot Put`}</p>
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="absolute h-[45.5px] left-[26px] top-[102px] w-[208px]" data-name="Paragraph">
      <p className="[word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[22.75px] left-0 not-italic text-[#99a1af] text-[14px] top-px tracking-[-0.1504px] w-[208px]">Journey behind the national record</p>
    </div>
  );
}

function ButtonReadStoryIndiasFastestShotPutJourneyBehindTheNationalRecord() {
  return (
    <div className="h-[173.5px] relative rounded-[16px] shrink-0 w-[260px]" style={{ backgroundImage: "linear-gradient(148.242deg, rgba(201, 17, 95, 0.2) 1.7413%, rgba(201, 17, 95, 0.05) 98.259%)" }} data-name="Button - Read story: India's Fastest Shot Put. Journey behind the national record">
      <div aria-hidden="true" className="absolute border-2 border-[#2a2a2a] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon9 />
        <Heading5 />
        <Paragraph6 />
      </div>
    </div>
  );
}

function Icon10() {
  return (
    <div className="absolute left-[26px] size-[28px] top-[26px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
        <g id="Icon">
          <path d={svgPaths.p3997a780} id="Vector" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33333" />
          <path d={svgPaths.p275e0300} id="Vector_2" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33333" />
        </g>
      </svg>
    </div>
  );
}

function Heading6() {
  return (
    <div className="absolute h-[24px] left-[26px] top-[70px] w-[208px]" data-name="Heading 3">
      <p className="[word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[24px] left-0 not-italic text-[16px] text-white top-[-0.5px] tracking-[-0.6325px] whitespace-nowrap">Evolution of Records</p>
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="absolute h-[45.5px] left-[26px] top-[102px] w-[208px]" data-name="Paragraph">
      <p className="[word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[22.75px] left-0 not-italic text-[#99a1af] text-[14px] top-px tracking-[-0.1504px] w-[208px]">How sprint records have evolved</p>
    </div>
  );
}

function ButtonReadStoryEvolutionOfRecordsHowSprintRecordsHaveEvolved() {
  return (
    <div className="h-[173.5px] relative rounded-[16px] shrink-0 w-[260px]" style={{ backgroundImage: "linear-gradient(148.242deg, rgba(192, 192, 192, 0.2) 1.7413%, rgba(192, 192, 192, 0.05) 98.259%)" }} data-name="Button - Read story: Evolution of Records. How sprint records have evolved">
      <div aria-hidden="true" className="absolute border-2 border-[#2a2a2a] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon10 />
        <Heading6 />
        <Paragraph7 />
      </div>
    </div>
  );
}

function Icon11() {
  return (
    <div className="absolute left-[26px] size-[28px] top-[37.38px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
        <g id="Icon">
          <path d={svgPaths.p2ada2820} id="Vector" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33333" />
          <path d={svgPaths.p4cb2400} id="Vector_2" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33333" />
        </g>
      </svg>
    </div>
  );
}

function Heading7() {
  return (
    <div className="absolute h-[24px] left-[26px] top-[81.38px] w-[208px]" data-name="Heading 3">
      <p className="[word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[24px] left-0 not-italic text-[16px] text-white top-[-0.5px] tracking-[-0.6325px] whitespace-nowrap">World Record Milestones</p>
    </div>
  );
}

function Paragraph8() {
  return (
    <div className="absolute h-[22.75px] left-[26px] top-[113.38px] w-[208px]" data-name="Paragraph">
      <p className="[word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[22.75px] left-0 not-italic text-[#99a1af] text-[14px] top-px tracking-[-0.1504px] whitespace-nowrap">Historic moments in athletics</p>
    </div>
  );
}

function ButtonReadStoryWorldRecordMilestonesHistoricMomentsInAthletics() {
  return (
    <div className="h-[173.5px] relative rounded-[16px] shrink-0 w-[260px]" style={{ backgroundImage: "linear-gradient(148.242deg, rgba(205, 98, 14, 0.2) 1.7413%, rgba(205, 98, 14, 0.05) 98.259%)" }} data-name="Button - Read story: World Record Milestones. Historic moments in athletics">
      <div aria-hidden="true" className="absolute border-2 border-[#2a2a2a] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon11 />
        <Heading7 />
        <Paragraph8 />
      </div>
    </div>
  );
}

function Icon12() {
  return (
    <div className="absolute left-[26px] size-[28px] top-[26px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
        <g id="Icon">
          <path d={svgPaths.p221c4a00} id="Vector" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33333" />
        </g>
      </svg>
    </div>
  );
}

function Heading8() {
  return (
    <div className="absolute h-[24px] left-[26px] top-[70px] w-[208px]" data-name="Heading 3">
      <p className="[word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[24px] left-0 not-italic text-[16px] text-white top-[-0.5px] tracking-[-0.6325px] whitespace-nowrap">Rising Stars</p>
    </div>
  );
}

function Paragraph9() {
  return (
    <div className="absolute h-[45.5px] left-[26px] top-[102px] w-[208px]" data-name="Paragraph">
      <p className="[word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[22.75px] left-0 not-italic text-[#99a1af] text-[14px] top-px tracking-[-0.1504px] w-[208px]">Young athletes breaking barriers</p>
    </div>
  );
}

function ButtonReadStoryRisingStarsYoungAthletesBreakingBarriers() {
  return (
    <div className="h-[173.5px] relative rounded-[16px] shrink-0 w-[260px]" style={{ backgroundImage: "linear-gradient(148.242deg, rgba(201, 17, 95, 0.2) 1.7413%, rgba(201, 17, 95, 0.05) 98.259%)" }} data-name="Button - Read story: Rising Stars. Young athletes breaking barriers">
      <div aria-hidden="true" className="absolute border-2 border-[#2a2a2a] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon12 />
        <Heading8 />
        <Paragraph9 />
      </div>
    </div>
  );
}

function StoryCards() {
  return (
    <div className="absolute content-stretch flex gap-[16px] h-[185.5px] items-start left-[-16px] overflow-clip pb-[12px] pr-[16px] top-[52px] w-[390px]" data-name="Story cards">
      <ButtonReadStoryIndiasFastestShotPutJourneyBehindTheNationalRecord />
      <ButtonReadStoryEvolutionOfRecordsHowSprintRecordsHaveEvolved />
      <ButtonReadStoryWorldRecordMilestonesHistoricMomentsInAthletics />
      <ButtonReadStoryRisingStarsYoungAthletesBreakingBarriers />
    </div>
  );
}

function StorySection() {
  return (
    <div className="h-[237.5px] relative shrink-0 w-full" data-name="StorySection">
      <Heading4 />
      <StoryCards />
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[1325.75px] relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col gap-[16px] items-start pt-[16px] px-[16px] relative size-full">
        <Link />
        <ModeSwitch />
        <Container7 />
        <StorySection />
      </div>
    </div>
  );
}

function RecordDataContent() {
  return (
    <div className="content-stretch flex flex-col h-[1239px] items-start overflow-clip relative shrink-0 w-full" data-name="Record data content">
      <Container2 />
    </div>
  );
}

export default function RecordsExplorer() {
  return (
    <div className="bg-black content-stretch flex flex-col items-start relative size-full" data-name="RecordsExplorer">
      <Header />
      <RecordDataContent />
    </div>
  );
}