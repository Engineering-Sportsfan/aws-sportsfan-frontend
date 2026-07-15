import svgPaths from "./svg-02sf3itjmi";

function Heading() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="Heading 1">
      
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph">
      
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
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[24.5px] not-italic text-[14px] text-center text-white top-[0.5px] tracking-[-0.1504px] whitespace-nowrap">Sprints</p>
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

function ButtonDisciplineSprints() {
  return (
    <div className="absolute bg-[#161616] content-stretch flex gap-[8px] h-[48px] items-center left-[96.45px] px-[18px] py-[14px] rounded-[16777200px] top-0 w-[107.102px]" data-name="Button - Discipline: Sprints">
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
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[18.5px] not-italic text-[14px] text-center text-white top-[0.5px] tracking-[-0.1504px] whitespace-nowrap">100m</p>
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

function ButtonEvent100M() {
  return (
    <div className="absolute bg-[#161616] content-stretch flex gap-[8px] h-[48px] items-center left-[211.55px] px-[18px] py-[14px] rounded-[16777200px] top-0 w-[96.734px]" data-name="Button - Event: 100m">
      <div aria-hidden="true" className="absolute border-2 border-[#2a2a2a] border-solid inset-0 pointer-events-none rounded-[16777200px]" />
      <Text2 />
      <Icon2 />
    </div>
  );
}

function Container1() {
  return (
    null
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
    null
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
    null
  );
}

function Container3() {
  return <div className="absolute h-[44px] left-0 rounded-[14px] top-0 w-[111.336px]" style={{ backgroundImage: "linear-gradient(159.867deg, rgba(201, 17, 95, 0.2) 1.7413%, rgba(201, 17, 95, 0.05) 98.259%)" }} data-name="Container" />;
}

function Icon4() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_48_989)" id="Icon">
          <path d={svgPaths.p30052a00} id="Vector" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p1b84be20} id="Vector_2" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M2.66667 14.6667H13.3333" id="Vector_3" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p3205b80} id="Vector_4" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p3222c80} id="Vector_5" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p2274e770} id="Vector_6" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
        <defs>
          <clipPath id="clip0_48_989">
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
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[26.5px] not-italic text-[14px] text-center text-white top-[0.5px] tracking-[-0.3604px] whitespace-nowrap">Records</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute content-stretch flex gap-[8px] h-[20px] items-center justify-center left-0 pl-[17.266px] pr-[17.273px] top-[12px] w-[111.336px]" data-name="Container">
      <Icon4 />
      <Text3 />
    </div>
  );
}

function TabRecordsView() {
  return (
    <div className="absolute h-[44px] left-[8px] rounded-[14px] top-[8px] w-[111.336px]" data-name="Tab - Records view">
      <Container3 />
      <Container4 />
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

function Container5() {
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
      <Container5 />
    </div>
  );
}

function Icon6() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p90824c0} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M12 11.3333V6" id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M8.66667 11.3333V3.33333" id="Vector_3" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M5.33333 11.3333V9.33333" id="Vector_4" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Text5() {
  return (
    <div className="h-[20px] relative shrink-0 w-[57.133px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[29.5px] not-italic text-[#99a1af] text-[14px] text-center top-[0.5px] tracking-[-0.3604px] whitespace-nowrap">Progress</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[8px] items-center justify-center px-[15.102px] relative size-full">
          <Icon6 />
          <Text5 />
        </div>
      </div>
    </div>
  );
}

function TabProgressView() {
  return (
    <div className="absolute content-stretch flex flex-col h-[44px] items-start left-[238.67px] pt-[12px] rounded-[14px] top-[8px] w-[111.336px]" data-name="Tab - Progress view">
      <Container6 />
    </div>
  );
}

function ModeSwitch() {
  return (
    null
  );
}

function Heading1() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Heading 2">
      <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] left-[4px] not-italic text-[#99a1af] text-[14px] top-[0.5px] tracking-[0.1996px] uppercase whitespace-nowrap">Record Comparison</p>
    </div>
  );
}

function Container12() {
  return <div className="bg-[#c9115f] h-[12px] relative rounded-[16777200px] shrink-0 w-[2.695px]" data-name="Container" />;
}

function Text6() {
  return (
    <div className="flex-[1_0_0] h-[12px] min-w-px relative" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[12px] left-0 not-italic text-[#99a1af] text-[12px] top-px tracking-[0.3px] uppercase whitespace-nowrap">National</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="absolute content-stretch flex gap-[8px] h-[12px] items-center left-0 top-0 w-[75.328px]" data-name="Container">
      <Container12 />
      <Text6 />
    </div>
  );
}

function Heading2() {
  return (
    <div className="absolute h-[25px] left-0 top-[20px] w-[75.328px]" data-name="Heading 3">
      <p className="[word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[25px] left-0 not-italic text-[20px] text-white top-[-0.5px] tracking-[-0.8492px] whitespace-nowrap">10.26s</p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="absolute h-[30px] left-0 overflow-clip top-[53px] w-[75.328px]" data-name="Paragraph">
      <p className="[word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[15px] left-0 not-italic text-[#99a1af] text-[12px] top-[0.5px] w-[76px]">Amiya Mallick</p>
    </div>
  );
}

function Icon7() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M4 6L8 10L12 6" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Text7() {
  return (
    <div className="h-[15px] relative shrink-0 w-[24.984px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[15px] left-0 not-italic text-[#99a1af] text-[10px] top-[0.5px] tracking-[0.1172px] whitespace-nowrap">More</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="absolute content-stretch flex gap-[4px] h-[16px] items-center left-0 top-[95px] w-[75.328px]" data-name="Container">
      <Icon7 />
      <Text7 />
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute h-[111px] left-[16px] top-[16px] w-[75.328px]" data-name="Container">
      <Container11 />
      <Heading2 />
      <Paragraph1 />
      <Container13 />
    </div>
  );
}

function ButtonNationalRecord1026SByAmiyaMallickExpandDetails() {
  return (
    <div className="h-[143px] relative shrink-0 w-full" data-name="Button - National record: 10.26s by Amiya Mallick. Expand details">
      <Container10 />
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute bg-[#161616] h-[147px] left-0 rounded-[16px] top-0 w-[111.328px]" data-name="Container">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[2px] relative rounded-[inherit] size-full">
        <ButtonNationalRecord1026SByAmiyaMallickExpandDetails />
      </div>
      <div aria-hidden="true" className="absolute border-2 border-[#2a2a2a] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </div>
  );
}

function Container17() {
  return <div className="bg-[#c0c0c0] h-[12px] relative rounded-[16777200px] shrink-0 w-[10.586px]" data-name="Container" />;
}

function Text8() {
  return (
    <div className="flex-[1_0_0] h-[12px] min-w-px relative" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[12px] left-0 not-italic text-[#99a1af] text-[12px] top-px tracking-[0.3px] uppercase whitespace-nowrap">Olympic</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="absolute content-stretch flex gap-[8px] h-[12px] items-center left-0 top-0 w-[75.336px]" data-name="Container">
      <Container17 />
      <Text8 />
    </div>
  );
}

function Heading3() {
  return (
    <div className="absolute h-[25px] left-0 top-[20px] w-[75.336px]" data-name="Heading 3">
      <p className="[word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[25px] left-0 not-italic text-[20px] text-white top-[-0.5px] tracking-[-0.8492px] whitespace-nowrap">9.63s</p>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="absolute h-[15px] left-0 overflow-clip top-[53px] w-[75.336px]" data-name="Paragraph">
      <p className="[word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[15px] left-0 not-italic text-[#99a1af] text-[12px] top-[0.5px] whitespace-nowrap">Usain Bolt</p>
    </div>
  );
}

function Icon8() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M4 6L8 10L12 6" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Text9() {
  return (
    <div className="h-[15px] relative shrink-0 w-[24.984px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[15px] left-0 not-italic text-[#99a1af] text-[10px] top-[0.5px] tracking-[0.1172px] whitespace-nowrap">More</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="absolute content-stretch flex gap-[4px] h-[16px] items-center left-0 top-[80px] w-[75.336px]" data-name="Container">
      <Icon8 />
      <Text9 />
    </div>
  );
}

function Container15() {
  return (
    <div className="absolute h-[96px] left-[16px] top-[16px] w-[75.336px]" data-name="Container">
      <Container16 />
      <Heading3 />
      <Paragraph2 />
      <Container18 />
    </div>
  );
}

function ButtonOlympicRecord963SByUsainBoltExpandDetails() {
  return (
    <div className="h-[128px] relative shrink-0 w-full" data-name="Button - Olympic record: 9.63s by Usain Bolt. Expand details">
      <Container15 />
    </div>
  );
}

function Container14() {
  return (
    <div className="absolute bg-[#161616] h-[147px] left-[123.33px] rounded-[16px] top-0 w-[111.336px]" data-name="Container">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[2px] relative rounded-[inherit] size-full">
        <ButtonOlympicRecord963SByUsainBoltExpandDetails />
      </div>
      <div aria-hidden="true" className="absolute border-2 border-[#2a2a2a] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </div>
  );
}

function Container22() {
  return <div className="bg-[#cd620e] relative rounded-[16777200px] shrink-0 size-[12px]" data-name="Container" />;
}

function Text10() {
  return (
    <div className="h-[12px] relative shrink-0 w-[46.594px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[12px] left-0 not-italic text-[#99a1af] text-[12px] top-px tracking-[0.3px] uppercase whitespace-nowrap">World</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="absolute content-stretch flex gap-[8px] h-[12px] items-center left-0 top-0 w-[75.336px]" data-name="Container">
      <Container22 />
      <Text10 />
    </div>
  );
}

function Heading4() {
  return (
    <div className="absolute h-[25px] left-0 top-[20px] w-[75.336px]" data-name="Heading 3">
      <p className="[word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[25px] left-0 not-italic text-[20px] text-white top-[-0.5px] tracking-[-0.8492px] whitespace-nowrap">9.58s</p>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="absolute h-[15px] left-0 overflow-clip top-[53px] w-[75.336px]" data-name="Paragraph">
      <p className="[word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[15px] left-0 not-italic text-[#99a1af] text-[12px] top-[0.5px] whitespace-nowrap">Usain Bolt</p>
    </div>
  );
}

function Icon9() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M4 6L8 10L12 6" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Text11() {
  return (
    <div className="h-[15px] relative shrink-0 w-[24.984px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[15px] left-0 not-italic text-[#99a1af] text-[10px] top-[0.5px] tracking-[0.1172px] whitespace-nowrap">More</p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="absolute content-stretch flex gap-[4px] h-[16px] items-center left-0 top-[80px] w-[75.336px]" data-name="Container">
      <Icon9 />
      <Text11 />
    </div>
  );
}

function Container20() {
  return (
    <div className="absolute h-[96px] left-[16px] top-[16px] w-[75.336px]" data-name="Container">
      <Container21 />
      <Heading4 />
      <Paragraph3 />
      <Container23 />
    </div>
  );
}

function ButtonWorldRecord958SByUsainBoltExpandDetails() {
  return (
    <div className="h-[128px] relative shrink-0 w-full" data-name="Button - World record: 9.58s by Usain Bolt. Expand details">
      <Container20 />
    </div>
  );
}

function Container19() {
  return (
    <div className="absolute bg-[#161616] h-[147px] left-[246.66px] rounded-[16px] top-0 w-[111.336px]" data-name="Container">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[2px] relative rounded-[inherit] size-full">
        <ButtonWorldRecord958SByUsainBoltExpandDetails />
      </div>
      <div aria-hidden="true" className="absolute border-2 border-[#2a2a2a] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </div>
  );
}

function Container8() {
  return (
    <div className="h-[147px] relative shrink-0 w-full" data-name="Container">
      <Container9 />
      <Container14 />
      <Container19 />
    </div>
  );
}

function RecordCards() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] h-[183px] items-start relative shrink-0 w-full" data-name="RecordCards">
      <Heading1 />
      <Container8 />
    </div>
  );
}

function Icon10() {
  return (
    <div className="absolute left-0 size-[20px] top-[2px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p3c797180} id="Vector" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p3ac0b600} id="Vector_2" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Heading5() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Heading 2">
      <Icon10 />
      <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] left-[28px] not-italic text-[16px] text-white top-[-0.5px] tracking-[-0.5525px] whitespace-nowrap">Performance Comparison</p>
    </div>
  );
}

function Text13() {
  return <div className="absolute bg-[#c9115f] left-0 rounded-[16777200px] size-[12px] top-[4px]" data-name="Text" />;
}

function Text12() {
  return (
    <div className="h-[20px] relative shrink-0 w-[74.602px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Text13 />
        <p className="[word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[20px] not-italic text-[#99a1af] text-[14px] top-[0.5px] tracking-[-0.1504px] whitespace-nowrap">National</p>
      </div>
    </div>
  );
}

function Text14() {
  return (
    <div className="h-[24px] relative shrink-0 w-[50.227px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[24px] left-0 not-italic text-[16px] text-white top-[-0.5px] tracking-[-0.6325px] whitespace-nowrap">10.26s</p>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Text12 />
      <Text14 />
    </div>
  );
}

function Container26() {
  return <div className="bg-[#c9115f] h-[12px] relative rounded-[16777200px] shrink-0 w-full" data-name="Container" />;
}

function ProgressBarNationalPerformance1026S() {
  return (
    <div className="bg-[#0d0d0d] content-stretch flex flex-col h-[12px] items-start overflow-clip relative rounded-[16777200px] shrink-0 w-full" data-name="Progress Bar - National performance: 10.26s">
      <Container26 />
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[44px] items-start relative shrink-0 w-full" data-name="Container">
      <Container25 />
      <ProgressBarNationalPerformance1026S />
    </div>
  );
}

function Text16() {
  return <div className="absolute bg-[#c0c0c0] left-0 rounded-[16777200px] size-[12px] top-[4px]" data-name="Text" />;
}

function Text15() {
  return (
    <div className="h-[20px] relative shrink-0 w-[74.203px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Text16 />
        <p className="[word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[20px] not-italic text-[#99a1af] text-[14px] top-[0.5px] tracking-[-0.1504px] whitespace-nowrap">Olympic</p>
      </div>
    </div>
  );
}

function Text17() {
  return (
    <div className="h-[24px] relative shrink-0 w-[42.367px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[24px] left-0 not-italic text-[16px] text-white top-[-0.5px] tracking-[-0.6325px] whitespace-nowrap">9.63s</p>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Text15 />
      <Text17 />
    </div>
  );
}

function Container29() {
  return <div className="bg-[#c0c0c0] h-[12px] relative rounded-[16777200px] shrink-0 w-full" data-name="Container" />;
}

function ProgressBarOlympicPerformance963S() {
  return (
    <div className="bg-[#0d0d0d] h-[12px] relative rounded-[16777200px] shrink-0 w-full" data-name="Progress Bar - Olympic performance: 9.63s">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start pr-[283.5px] relative size-full">
          <Container29 />
        </div>
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[44px] items-start relative shrink-0 w-full" data-name="Container">
      <Container28 />
      <ProgressBarOlympicPerformance963S />
    </div>
  );
}

function Text19() {
  return <div className="absolute bg-[#cd620e] left-0 rounded-[16777200px] size-[12px] top-[4px]" data-name="Text" />;
}

function Text18() {
  return (
    <div className="h-[20px] relative shrink-0 w-[58.766px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Text19 />
        <p className="[word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[20px] not-italic text-[#99a1af] text-[14px] top-[0.5px] tracking-[-0.1504px] whitespace-nowrap">World</p>
      </div>
    </div>
  );
}

function Text20() {
  return (
    <div className="h-[24px] relative shrink-0 w-[42.813px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[24px] left-0 not-italic text-[16px] text-white top-[-0.5px] tracking-[-0.6325px] whitespace-nowrap">9.58s</p>
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Text18 />
      <Text20 />
    </div>
  );
}

function Container32() {
  return <div className="bg-[#cd620e] h-[12px] relative rounded-[16777200px] shrink-0 w-full" data-name="Container" />;
}

function ProgressBarWorldPerformance958S() {
  return (
    <div className="bg-[#0d0d0d] h-[12px] relative rounded-[16777200px] shrink-0 w-full" data-name="Progress Bar - World performance: 9.58s">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start pr-[306px] relative size-full">
          <Container32 />
        </div>
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[44px] items-start relative shrink-0 w-full" data-name="Container">
      <Container31 />
      <ProgressBarWorldPerformance958S />
    </div>
  );
}

function PerformanceComparisonBars() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] h-[172px] items-start relative shrink-0 w-full" data-name="Performance comparison bars">
      <Container24 />
      <Container27 />
      <Container30 />
    </div>
  );
}

function VisualComparison() {
  return (
    <div className="bg-[#161616] h-[268px] relative rounded-[16px] shrink-0 w-full" data-name="VisualComparison">
      <div aria-hidden="true" className="absolute border-2 border-[#2a2a2a] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col gap-[20px] items-start pb-[2px] pt-[26px] px-[26px] relative size-full">
        <Heading5 />
        <PerformanceComparisonBars />
      </div>
    </div>
  );
}

function Icon11() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <path d={svgPaths.pace200} id="Vector" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M12 16V12" id="Vector_2" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M12 8H12.01" id="Vector_3" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Container34() {
  return (
    <div className="relative rounded-[16777200px] shrink-0 size-[48px]" style={{ backgroundImage: "linear-gradient(137.15deg, rgba(201, 17, 95, 0.3) 1.7413%, rgba(201, 17, 95, 0.1) 98.259%)" }} data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[12px] relative size-full">
        <Icon11 />
      </div>
    </div>
  );
}

function Heading6() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="[word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[24px] left-0 not-italic text-[16px] text-white top-[-0.5px] tracking-[-0.5525px] whitespace-nowrap">Performance Gap</p>
    </div>
  );
}

function Container35() {
  return (
    <div className="flex-[1_0_0] h-[79px] min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[8px] items-start relative size-full">
        <Heading6 />
        <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[0px] text-[rgba(255,255,255,0.9)] tracking-[-0.1504px] w-full">
          <span className="leading-[22.75px] text-[14px]">{`India is `}</span>
          <span className="font-['Inter:Bold',sans-serif] font-bold leading-[24px] text-[#c9115f] text-[16px] tracking-[-0.3125px]">0.68s</span>
          <span className="leading-[22.75px] text-[14px]">{` `}</span>
          <span className="leading-[22.75px] text-[14px] text-[rgba(255,255,255,0.7)]">(7.1%)</span>
          <span className="leading-[22.75px] text-[14px]">{` behind the world record.`}</span>
        </p>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="content-stretch flex gap-[16px] h-[79px] items-start relative shrink-0 w-full" data-name="Container">
      <Container34 />
      <Container35 />
    </div>
  );
}

function InsightSection() {
  return (
    <div className="h-[131px] relative rounded-[16px] shrink-0 w-full" style={{ backgroundImage: "linear-gradient(161.251deg, rgba(201, 17, 95, 0.2) 1.7413%, rgba(201, 17, 95, 0.05) 98.259%)" }} data-name="InsightSection">
      <div aria-hidden="true" className="absolute border-2 border-[#2a2a2a] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col items-start pb-[2px] pt-[26px] px-[26px] relative size-full">
        <Container33 />
      </div>
    </div>
  );
}

function Icon12() {
  return (
    <div className="h-[20px] relative shrink-0 w-[19.133px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.1328 20">
        <g id="Icon">
          <path d={svgPaths.p1175a00} id="Vector" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5944" />
          <path d={svgPaths.pe94900} id="Vector_2" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5944" />
        </g>
      </svg>
    </div>
  );
}

function Text21() {
  return (
    <div className="flex-[1_0_0] h-[32px] min-w-px relative" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] left-0 not-italic text-[#99a1af] text-[12px] top-px tracking-[0.3px] uppercase w-[100px]">Gap Reduction</p>
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="absolute content-stretch flex gap-[8px] h-[32px] items-center left-[20px] top-[20px] w-[127px]" data-name="Container">
      <Icon12 />
      <Text21 />
    </div>
  );
}

function Paragraph12Percent() {
  return (
    <div className="absolute h-[32px] left-[20px] top-[64px] w-[127px]" data-name="Paragraph - 12 percent">
      <p className="[word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[32px] left-0 not-italic text-[24px] text-white top-0 tracking-[-0.4097px] whitespace-nowrap">12%</p>
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="absolute h-[16px] left-[20px] top-[104px] w-[127px]" data-name="Paragraph">
      <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#99a1af] text-[12px] top-px whitespace-nowrap">Since 2015</p>
    </div>
  );
}

function Container36() {
  return (
    <div className="absolute bg-[#161616] border-2 border-[#2a2a2a] border-solid h-[144px] left-0 rounded-[16px] top-0 w-[171px]" data-name="Container">
      <Container37 />
      <Paragraph12Percent />
      <Paragraph4 />
    </div>
  );
}

function Icon13() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p164f7540} id="Vector" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p809b580} id="Vector_2" stroke="var(--stroke-0, #C9115F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Text22() {
  return (
    <div className="h-[16px] relative shrink-0 w-[89.594px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] left-0 not-italic text-[#99a1af] text-[12px] top-px tracking-[0.3px] uppercase whitespace-nowrap">Global Rank</p>
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="absolute content-stretch flex gap-[8px] h-[20px] items-center left-[20px] top-[20px] w-[127px]" data-name="Container">
      <Icon13 />
      <Text22 />
    </div>
  );
}

function ParagraphNumber() {
  return (
    <div className="absolute h-[32px] left-[20px] top-[52px] w-[127px]" data-name="Paragraph - Number 42">
      <p className="[word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[32px] left-0 not-italic text-[24px] text-white top-0 tracking-[-0.4097px] whitespace-nowrap">#42</p>
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="absolute h-[16px] left-[20px] top-[92px] w-[127px]" data-name="Paragraph">
      <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#99a1af] text-[12px] top-px whitespace-nowrap">In 100m</p>
    </div>
  );
}

function Container38() {
  return (
    <div className="absolute bg-[#161616] border-2 border-[#2a2a2a] border-solid h-[144px] left-[187px] rounded-[16px] top-0 w-[171px]" data-name="Container">
      <Container39 />
      <ParagraphNumber />
      <Paragraph5 />
    </div>
  );
}

function InsightSection1() {
  return (
    <div className="h-[144px] relative shrink-0 w-full" data-name="InsightSection">
      <Container36 />
      <Container38 />
    </div>
  );
}

function Section() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] h-[291px] items-start relative shrink-0 w-full" data-name="Section">
      <InsightSection />
      <InsightSection1 />
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] h-[774px] items-start relative shrink-0 w-full" data-name="Container">
      <RecordCards />
      <VisualComparison />
      <Section />
    </div>
  );
}

function Heading7() {
  return (
    <div className="absolute h-[20px] left-0 top-[16px] w-[358px]" data-name="Heading 2">
      <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] left-[4px] not-italic text-[#99a1af] text-[14px] top-[0.5px] tracking-[0.1996px] uppercase whitespace-nowrap">Featured Stories</p>
    </div>
  );
}

function Icon14() {
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

function Heading8() {
  return (
    <div className="absolute h-[24px] left-[26px] top-[70px] w-[208px]" data-name="Heading 3">
      <p className="[word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[24px] left-0 not-italic text-[16px] text-white top-[-0.5px] tracking-[-0.6325px] whitespace-nowrap">{`India's Fastest 100m`}</p>
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

function ButtonReadStoryIndiasFastest100MJourneyBehindTheNationalRecord() {
  return (
    <div className="h-[173.5px] relative rounded-[16px] shrink-0 w-[260px]" style={{ backgroundImage: "linear-gradient(148.242deg, rgba(201, 17, 95, 0.2) 1.7413%, rgba(201, 17, 95, 0.05) 98.259%)" }} data-name="Button - Read story: India's Fastest 100m. Journey behind the national record">
      <div aria-hidden="true" className="absolute border-2 border-[#2a2a2a] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon14 />
        <Heading8 />
        <Paragraph6 />
      </div>
    </div>
  );
}

function Icon15() {
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

function Heading9() {
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
        <Icon15 />
        <Heading9 />
        <Paragraph7 />
      </div>
    </div>
  );
}

function Icon16() {
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

function Heading10() {
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
        <Icon16 />
        <Heading10 />
        <Paragraph8 />
      </div>
    </div>
  );
}

function Icon17() {
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

function Heading11() {
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
        <Icon17 />
        <Heading11 />
        <Paragraph9 />
      </div>
    </div>
  );
}

function StoryCards() {
  return (
    <div className="absolute overflow-x-scroll overlay-x-content-stretch no-scrollbar flex gap-[16px] h-[185.5px] items-start left-[-16px] overflow-clip pb-[12px] pr-[16px] top-[52px] w-[390px]" data-name="Story cards">
      <ButtonReadStoryIndiasFastest100MJourneyBehindTheNationalRecord />
      <ButtonReadStoryEvolutionOfRecordsHowSprintRecordsHaveEvolved />
      <ButtonReadStoryWorldRecordMilestonesHistoricMomentsInAthletics />
      <ButtonReadStoryRisingStarsYoungAthletesBreakingBarriers />
    </div>
  );
}

function StorySection() {
  return (
    <div className="h-[237.5px] relative shrink-0 w-full" data-name="StorySection">
      <Heading7 />
      <StoryCards />
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[1287.5px] relative shrink-0 w-full" data-name="Container">
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
    <div className="content-stretch flex flex-col h-[1211px] items-start overflow-clip relative shrink-0 w-full" data-name="Record data content">
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