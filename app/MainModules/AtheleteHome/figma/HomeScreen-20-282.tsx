import svgPaths from "./svg-rm1mctb3t3";
// import imgContainer from "./c9bb0835df846cf9c11a109cbc9ce868a3ba4666.png";
import imgContainer from "./c9bb0835df846cf9c11a109cbc9ce868a3ba4666.png";
import imgContainer1 from "./b3401f1128e88b085412e5b5ecaeb96cf3d85993.png";
import imgContainer2 from "./df4d81cf96c4da08bfb5bb1f2bb5b2ddde9d10a4.png";
// import imgContainer3 from "./Gurindervir-Singh.webp";
import imgImageCwgBuildUp from "./dc69310e6de7c688834fc74a8bd50812e473c92d.png";
import imgImageAthleteJam from "./d5cef240583d6d486f7cf4478eab242c3ad64fd7.png";
import imgImageTrainingCamp from "./1a01ad838f85eac092c4c292ef07e0e2d80e39df.png";
import { imgGroup } from "./svg-8d4uk";
import { useState, useEffect } from "react";
import { athleteService } from "@/services/athlete.service";
import { useRouter } from "next/navigation";
import Image from 'next/image';

function Icon() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 16 16"
      >
        <g id="Icon">
          <path
            d={svgPaths.p107a080}
            id="Vector"
            stroke="var(--stroke-0, #99A1AF)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.33333"
          />
          <path
            d="M14 14L11.1333 11.1333"
            id="Vector_2"
            stroke="var(--stroke-0, #99A1AF)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.33333"
          />
        </g>
      </svg>
    </div>
  );
}

function TextInput() {
  return (
    <div
      className="flex-[205.359_0_0] h-[21px] min-w-px relative"
      data-name="Text Input"
    >
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center overflow-clip relative rounded-[inherit] size-full">
        <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#99a1af] text-[14px] tracking-[-0.1504px] whitespace-nowrap">
          Search players, teams, events...
        </p>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Icon">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 14 14"
      >
        <g clipPath="url(#clip0_20_348)" id="Icon">
          <path
            d={svgPaths.p115b3700}
            id="Vector"
            stroke="var(--stroke-0, #FF579E)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.16667"
          />
          <path
            d="M11.6667 1.75V4.08333"
            id="Vector_2"
            stroke="var(--stroke-0, #FF579E)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.16667"
          />
          <path
            d="M12.8333 2.91667H10.5"
            id="Vector_3"
            stroke="var(--stroke-0, #FF579E)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.16667"
          />
          <path
            d="M2.33333 9.91667V11.0833"
            id="Vector_4"
            stroke="var(--stroke-0, #FF579E)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.16667"
          />
          <path
            d="M2.91667 10.5H1.75"
            id="Vector_5"
            stroke="var(--stroke-0, #FF579E)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.16667"
          />
        </g>
        <defs>
          <clipPath id="clip0_20_348">
            <rect fill="white" height="14" width="14" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div
      className="bg-[rgba(255,255,255,0.02)] h-[29px] relative rounded-[16777200px] shrink-0 w-[37px]"
      data-name="Button"
    >
      <div
        aria-hidden="true"
        className="absolute border-[#4a4a55] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[16777200px]"
      />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center px-[12.5px] py-[6.5px] relative size-full">
        <Icon1 />
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div
      className="absolute bg-[#1a1a1a] content-stretch flex gap-[8px] h-[31px] items-center left-[106px] pl-[17px] pr-px py-[11px] rounded-[16777200px] top-[31px] w-[178px]"
      data-name="Container"
    >
      <div
        aria-hidden="true"
        className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[16777200px]"
      />
      <Icon />
      <TextInput />
      <Button />
    </div>
  );
}

function Icon2() {
  return (
    <div
      className="absolute h-[40.477px] left-[19px] top-[16px] w-[34px]"
      data-name="Icon"
    />
  );
}

function Group() {
  return (
    <div
      className="absolute inset-[40.41%_86.95%_9.28%_5.7%] mask-intersect mask-luminance mask-no-clip mask-no-repeat mask-position-[1.736px_1.647px] mask-size-[26.039px_31px]"
      style={{ maskImage: `url('${imgGroup}')` }}
      data-name="Group"
    ></div>
  );
}

function MaskGroup() {
  return (
    <div
      className="absolute contents inset-[42.69%_87.17%_14.25%_6.15%]"
      data-name="Mask group"
    >
      <Group />
    </div>
  );
}

function Container1() {
  return null;
}

function Button1() {
  return (
    <div
      className="absolute bg-[#17171b] h-[36px] left-0 rounded-[16777200px] top-0 w-[52px]"
      data-name="Button"
    >
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] left-[26px] not-italic text-[#99a1af] text-[14px] text-center top-[8.5px] tracking-[-0.1504px] whitespace-nowrap">
        All
      </p>
    </div>
  );
}

function Button2() {
  return (
    <div
      className="absolute border-[#ff5900] border-[0.5px] border-solid h-[36px] left-[60px] rounded-[16777200px] top-0 w-[99.82px]"
      style={{
        backgroundImage:
          "linear-gradient(112.362deg, rgba(255, 89, 0, 0.5) 10.852%, rgba(201, 17, 95, 0.5) 91.433%)",
      }}
      data-name="Button"
    >
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] left-[49.5px] not-italic text-[14px] text-center text-white top-[8px] tracking-[-0.1504px] whitespace-nowrap">
        Athletics
      </p>
    </div>
  );
}

function Button3() {
  return (
    <div
      className="absolute bg-[rgba(255,255,255,0.05)] h-[36px] left-[167.82px] rounded-[16777200px] top-0 w-[88.531px]"
      data-name="Button"
    >
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] left-[44.5px] not-italic text-[#99a1af] text-[14px] text-center top-[8.5px] tracking-[-0.1504px] whitespace-nowrap">
        Cricket
      </p>
    </div>
  );
}

function Button4() {
  return (
    <div
      className="absolute bg-[rgba(255,255,255,0.05)] h-[36px] left-[264.35px] rounded-[16777200px] top-0 w-[94.555px]"
      data-name="Button"
    >
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] left-[47px] not-italic text-[#99a1af] text-[14px] text-center top-[8.5px] tracking-[-0.1504px] whitespace-nowrap">
        Football
      </p>
    </div>
  );
}

function Button5() {
  return (
    <div
      className="absolute bg-[rgba(255,255,255,0.05)] h-[36px] left-[366.91px] rounded-[16777200px] top-0 w-[83.898px]"
      data-name="Button"
    >
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] left-[42.5px] not-italic text-[#99a1af] text-[14px] text-center top-[8.5px] tracking-[-0.1504px] whitespace-nowrap">
        Tennis
      </p>
    </div>
  );
}

function Button6() {
  return (
    <div
      className="absolute bg-[rgba(255,255,255,0.05)] h-[36px] left-[458.8px] rounded-[16777200px] top-0 w-[112.984px]"
      data-name="Button"
    >
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] left-[56px] not-italic text-[#99a1af] text-[14px] text-center top-[8.5px] tracking-[-0.1504px] whitespace-nowrap">
        Badminton
      </p>
    </div>
  );
}

function Container4() {
  return (
    <div
      className="absolute h-[36px] overflow-x-scroll no-scrollbar left-[20px] top-[25px] w-[350px]"
      data-name="Container"
    >
      <Button1 />
      <Button2 />
      <Button3 />
      <Button4 />
      <Button5 />
      <Button6 />
    </div>
  );
}

function Container3() {
  return (
    <div
      className="absolute h-[66px] left-0 overflow-clip top-[63px] w-[390px]"
      data-name="Container"
    >
      <Container4 />
    </div>
  );
}

function Container() {
  return (
    <div
      className="absolute bg-[rgba(11,11,15,0.95)] border-[rgba(255,255,255,0.05)] border-b border-solid h-[131px] left-0 top-0 w-[390px]"
      data-name="Container"
    >
      <Container1 />
      <Container3 />
    </div>
  );
}

function Heading1() {
  return (
    <div
      className="absolute h-[24px] left-0 top-[-10px] w-[350px]"
      data-name="Heading 3"
    >
      <p className="[word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[24px] left-0 not-italic text-[16px] text-white top-[-0.5px] tracking-[-0.3125px] whitespace-nowrap">
        Stories
      </p>
    </div>
  );
}

function Container6() {
  return (
    <div
      className="absolute h-[176px] left-[20px] top-0 w-[350px]"
      data-name="Container"
    >
      <Heading1 />
    </div>
  );
}

function Container8() {
  return (
    <div
      className="absolute h-[254px] left-0 rounded-[24px] top-[-10px] w-[350px]"
      data-name="Container"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none rounded-[24px]"
      >
        <Image
          alt=""
          className="absolute max-w-none object-cover opacity-90 rounded-[24px] size-full"
          src={imgContainer}
        />
        <div className="absolute bg-gradient-to-t from-[rgba(0,0,0,0.8)] inset-0 rounded-[24px] to-[rgba(0,0,0,0)] via-1/2 via-[rgba(0,0,0,0.6)]" />
      </div>
    </div>
  );
}

function Heading2() {
  return (
    <div
      className="absolute h-[28px] left-0 top-0 w-[241.352px]"
      data-name="Heading 3"
    >
      <p className="[word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[28px] left-0 not-italic text-[18px] text-white top-0 tracking-[-0.4395px] whitespace-nowrap">
        Athletics Federation of India
      </p>
    </div>
  );
}

function Icon3() {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push("/athlete/afi")} className="absolute left-[280px] size-[20px] top-[4px]"
      data-name="Icon"
    >
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
      >
        <g id="Icon">
          <path
            d="M7.5 15L12.5 10L7.5 5"
            id="Vector"
            stroke="var(--stroke-0, #99A1AF)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.66667"
          />
        </g>
      </svg>
    </div>
  );
}

function Container10() {
  return (
    <div
      className="absolute h-[28px] left-[24px] top-[24px] w-[300px]"
      data-name="Container"
    >
      <Heading2 />
      <Icon3 />
    </div>
  );
}

function Paragraph() {
  return (
    <div
      className="absolute h-[32px] left-0 top-0 w-[89.328px]"
      data-name="Paragraph"
    >
      <p className="[word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[32px] left-0 not-italic text-[#ff006c] text-[24px] top-0 tracking-[0.0703px] whitespace-nowrap">
        240+
      </p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div
      className="absolute h-[16px] left-0 top-[32px] w-[89.328px]"
      data-name="Paragraph"
    >
      <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#99a1af] text-[12px] top-px whitespace-nowrap">
        Athletes
      </p>
    </div>
  );
}

function Container12() {
  return (
    <div
      className="absolute h-[48px] left-0 top-0 w-[89.328px]"
      data-name="Container"
    >
      <Paragraph />
      <Paragraph1 />
    </div>
  );
}

function Paragraph2() {
  return (
    <div
      className="absolute h-[32px] left-0 top-0 w-[89.336px]"
      data-name="Paragraph"
    >
      <p className="[word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[32px] left-0 not-italic text-[#ff6a00] text-[24px] top-0 tracking-[0.0703px] whitespace-nowrap">
        12
      </p>
    </div>
  );
}

function Paragraph3() {
  return (
    <div
      className="absolute h-[16px] left-0 top-[32px] w-[89.336px]"
      data-name="Paragraph"
    >
      <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#99a1af] text-[12px] top-px whitespace-nowrap">
        Medals 2024
      </p>
    </div>
  );
}

function Container13() {
  return (
    <div
      className="absolute h-[48px] left-[105.33px] top-0 w-[89.336px]"
      data-name="Container"
    >
      <Paragraph2 />
      <Paragraph3 />
    </div>
  );
}

function Paragraph4() {
  return (
    <div
      className="absolute h-[32px] left-0 top-0 w-[89.336px]"
      data-name="Paragraph"
    >
      <p className="[word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[32px] left-0 not-italic text-[#d2d2d2] text-[24px] top-0 tracking-[0.0703px] whitespace-nowrap">
        Top 5
      </p>
    </div>
  );
}

function Paragraph5() {
  return (
    <div
      className="absolute h-[16px] left-0 top-[32px] w-[89.336px]"
      data-name="Paragraph"
    >
      <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#99a1af] text-[12px] top-px whitespace-nowrap">
        Asia Rank
      </p>
    </div>
  );
}

function Container14() {
  return (
    <div
      className="absolute h-[48px] left-[210.66px] top-0 w-[89.336px]"
      data-name="Container"
    >
      <Paragraph4 />
      <Paragraph5 />
    </div>
  );
}

function Container11() {
  return (
    <div
      className="absolute h-[48px] left-[24px] top-[68px] w-[300px]"
      data-name="Container"
    >
      <Container12 />
      <Container13 />
      <Container14 />
    </div>
  );
}

function Button7() {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push('/MainModules/RecordsExplorer')}
      className="absolute bg-[rgba(255,255,255,0.05)] h-[40px] left-[24px] rounded-[16777200px] top-[132px] w-[300px]"
      data-name="Button"
    >
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] left-[150.38px] not-italic text-[14px] text-center text-white top-[10.5px] tracking-[-0.1504px] whitespace-nowrap">
        Explore Records
      </p>
    </div>
  );
}

function Container9() {
  return (
    <div
      className="absolute border border-[rgba(255,255,255,0.1)] border-solid h-[198px] left-0 rounded-[24px] top-[329px] w-[350px]"
      style={{
        backgroundImage:
          "linear-gradient(150.503deg, rgb(26, 26, 38) 0%, rgb(24, 24, 36) 20%, rgb(23, 23, 33) 40%, rgb(21, 21, 31) 60%, rgb(20, 20, 28) 80%, rgb(18, 18, 26) 100%)",
      }}
      data-name="Container"
    >
      <Container10 />
      <Container11 />
      <Button7 />
    </div>
  );
}

function Container7() {
  return (
    <div
      className="absolute h-[468px] left-[20px] top-[208px] w-[350px]"
      data-name="Container"
    >
      <Container8 />
      <Container9 />
    </div>
  );
}

function Heading3() {
  return (
    <div
      className="absolute h-[28px] left-0 top-0 w-[157.578px]"
      data-name="Heading 3"
    >
      <p className="[word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[28px] left-0 not-italic text-[18px] text-white top-0 tracking-[-0.4395px] whitespace-nowrap">
        Athlete 360 World
      </p>
    </div>
  );
}

function Container16() {
  return (
    <div
      className="absolute h-[28px] left-0 top-0 w-[350px]"
      data-name="Container"
    >
      <Heading3 />
    </div>
  );
}

function Button8() {
  return (
    <div
      className="absolute bg-[rgba(255,255,255,0.05)] h-[30px]  rounded-[16777200px]  w-[60.297px]"
      data-name="Button"
    >
      <p className="-translate-x-1/2 ml-1 [word-break:break-word] absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] left-[24.5px] not-italic text-[#99a1af] text-[12px] text-center top-[8px] whitespace-nowrap">
        Default
      </p>
    </div>
  );
}

function Button9() {
  return (
    <div
      className="absolute bg-[rgba(255,255,255,0.05)] h-[30px] left-[55.3px] rounded-[16777200px] top-0 w-[75.469px]"
      data-name="Button"
    >
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] left-[38px] not-italic text-[#99a1af] text-[12px] text-center top-[8px] whitespace-nowrap">
        Throws
      </p>
    </div>
  );
}

function Button10() {
  return (
    <div
      className="absolute bg-[rgba(255,255,255,0.05)] h-[30px] left-[138.77px] rounded-[16777200px] top-0 w-[67.969px]"
      data-name="Button"
    >
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] left-[34px] not-italic text-[#99a1af] text-[12px] text-center top-[8px] whitespace-nowrap">
        Sprint
      </p>
    </div>
  );
}

function Button11() {
  return (
    <div
      className="absolute bg-[rgba(255,255,255,0.05)] h-[30px] left-[214.73px] rounded-[16777200px] top-0 w-[71.5px]"
      data-name="Button"
    >
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] left-[36.5px] not-italic text-[#99a1af] text-[12px] text-center top-[8px] whitespace-nowrap">
        Jumps
      </p>
    </div>
  );
}

function Button12() {
  return (
    <div
      className="absolute bg-[rgba(201,17,95,0.2)] border border-[rgba(251,44,54,0.3)] border-solid h-[30px] left-[294.23px] rounded-[16777200px] top-0 w-[85.82px]"
      data-name="Button"
    >
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] left-[42px] not-italic text-[#ff006c] text-[12px] text-center top-[7px] whitespace-nowrap">
        Distance
      </p>
    </div>
  );
}

function Container17() {
  return (
    <div
      className="absolute h-[30px] left-0 overflow-clip top-[44px] w-[350px]"
      data-name="Container"
    >
      <Button8 />
      {/* <Button9 />
      <Button10 />
      <Button11 />
      <Button12 /> */}
    </div>
  );
}

function Paragraph6() {
  return (
    <div
      className="absolute h-[20px] left-0 top-0 w-[149px]"
      data-name="Paragraph"
    >
      <p className="[word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[20px] left-0 not-italic text-[14px] text-white top-[0.5px] tracking-[-0.1504px] whitespace-nowrap">
        Neeraj Chopra
      </p>
    </div>
  );
}

function Paragraph7() {
  return (
    <div
      className="absolute h-[16px] left-0 top-[22px] w-[149px]"
      data-name="Paragraph"
    >
      <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#d1d5dc] text-[12px] top-px whitespace-nowrap">
        Javelin Throw
      </p>
    </div>
  );
}

function Container21() {
  return (
    <div
      className="absolute h-[38px] left-[8px] top-[146px] w-[149px]"
      data-name="Container"
    >
      <Paragraph6 />
      <Paragraph7 />
    </div>
  );
}

function Icon4() {
  return (
    <div
      className="absolute left-[4.32px] size-[14.41px] top-[4.32px]"
      data-name="Icon"
    >
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 14.4096 14.4096"
      >
        <g id="Icon">
          <path
            d={svgPaths.p259d4600}
            id="Vector"
            stroke="var(--stroke-0, #ECECEC)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.2008"
          />
          <path
            d={svgPaths.p24726e00}
            id="Vector_2"
            stroke="var(--stroke-0, #ECECEC)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.2008"
          />
          <path
            d={svgPaths.p27563480}
            id="Vector_3"
            stroke="var(--stroke-0, #ECECEC)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.2008"
          />
          <path
            d={svgPaths.p1d1c2564}
            id="Vector_4"
            stroke="var(--stroke-0, #ECECEC)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.2008"
          />
        </g>
      </svg>
    </div>
  );
}

function Paragraph8() {
  return (
    <div
      className="absolute h-[8.646px] left-[21.61px] top-[7.2px] w-[20.776px]"
      data-name="Paragraph"
    >
      <p className="[word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[8.646px] left-0 not-italic text-[#ececec] text-[10px] top-[0.36px] whitespace-nowrap">
        2.5M
      </p>
    </div>
  );
}

function Vu() {
  return (
    <div
      className="absolute bg-[rgba(34,34,34,0.5)] h-[23px] left-0 rounded-[7204.07px] top-0 w-[50px]"
      data-name="vu"
    >
      <Icon4 />
      <Paragraph8 />
    </div>
  );
}

function Container22() {
  return (
    <div
      className="absolute h-[23px] left-[111px] top-[6px] w-[50px]"
      data-name="Container"
    >
      <Vu />
    </div>
  );
}

function Container20() {
  return (
    <div
      className="absolute h-[192px] left-0 top-0 w-[165px]"
      data-name="Container"
    >
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <Image
          alt=""
          className="absolute max-w-none object-cover size-full"
          src={imgContainer1}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(0.149207deg, rgba(0, 0, 0, 0.5) 0.11165%, rgba(0, 0, 0, 0) 99.889%)",
          }}
        />
      </div>
      <Container21 />
      <Container22 />
    </div>
  );
}

function Text() {
  return (
    <div className="absolute h-[16px] left-0 top-0 w-[65px]" data-name="Text">
      <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-[4px] not-italic text-[#99a1af] text-[12px] top-0 whitespace-nowrap">
        #Tokyo Gold
      </p>
    </div>
  );
}

function Container24() {
  return (
    <div
      className="absolute h-[16px] left-[12px] top-[12px] w-[77px]"
      data-name="Container"
    >
      <Text />
    </div>
  );
}

function Frame() {
  return (
    <div
      className="absolute inset-[12.5%_8.33%_10.48%_8.34%]"
      data-name="Frame"
    >
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 12.0082 11.0984"
      >
        <g id="Frame">
          <path
            d={svgPaths.p1a5bea00}
            fill="var(--fill-0, #ECECEC)"
            id="Vector"
          />
        </g>
      </svg>
    </div>
  );
}

function Icon5() {
  return (
    <div
      className="absolute left-0 overflow-clip size-[14.41px] top-0"
      data-name="Icon"
    >
      <Frame />
    </div>
  );
}

function Container27() {
  return (
    <div
      className="absolute left-[4.32px] size-[14.41px] top-[4.32px]"
      data-name="Container"
    >
      <Icon5 />
    </div>
  );
}

function Paragraph9() {
  return (
    <div
      className="absolute h-[8.646px] left-[21.61px] top-[7.2px] w-[24.254px]"
      data-name="Paragraph"
    >
      <p className="[word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[8.646px] left-0 not-italic text-[#ececec] text-[10px] top-[0.36px] whitespace-nowrap">
        45.6K
      </p>
    </div>
  );
}

function Vu1() {
  return (
    <div
      className="absolute bg-[#222] h-[23px] left-[-0.36px] rounded-[7204.07px] top-0 w-[54px]"
      data-name="vu"
    >
      <Container27 />
      <Paragraph9 />
    </div>
  );
}

function Container26() {
  return (
    <div
      className="absolute h-[23.055px] left-px top-[-4px] w-[51.632px]"
      data-name="Container"
    >
      <Vu1 />
    </div>
  );
}

function Icon6() {
  return (
    <div
      className="absolute left-[4.32px] size-[14.41px] top-[4.32px]"
      data-name="Icon"
    >
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 14.4096 14.4096"
      >
        <g id="Icon">
          <path
            d={svgPaths.p1b831380}
            id="Vector"
            stroke="var(--stroke-0, #ECECEC)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.2008"
          />
          <path
            d={svgPaths.p3fc53c40}
            id="Vector_2"
            stroke="var(--stroke-0, #ECECEC)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.2008"
          />
          <path
            d={svgPaths.p26387000}
            id="Vector_3"
            stroke="var(--stroke-0, #ECECEC)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.2008"
          />
          <path
            d={svgPaths.p27cd7000}
            id="Vector_4"
            stroke="var(--stroke-0, #ECECEC)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.2008"
          />
          <path
            d={svgPaths.p25d64960}
            id="Vector_5"
            stroke="var(--stroke-0, #ECECEC)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.2008"
          />
        </g>
      </svg>
    </div>
  );
}

function Paragraph10() {
  return (
    <div
      className="absolute h-[8.646px] left-[21.61px] top-[7.2px] w-[16.166px]"
      data-name="Paragraph"
    >
      <p className="[word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[8.646px] left-0 not-italic text-[#ececec] text-[10px] top-[0.36px] whitespace-nowrap">
        256
      </p>
    </div>
  );
}

function Vu2() {
  return (
    <div
      className="absolute bg-[#222] h-[23px] left-[-0.2px] rounded-[7204.07px] top-0 w-[46px]"
      data-name="vu"
    >
      <Icon6 />
      <Paragraph10 />
    </div>
  );
}

function Container28() {
  return (
    <div
      className="absolute h-[23.055px] left-[62.63px] top-[-4px] w-[43.544px]"
      data-name="Container"
    >
      <Vu2 />
    </div>
  );
}

function Frame1() {
  return (
    <div
      className="absolute inset-[10.78%_12.5%_12.49%_12.5%]"
      data-name="Frame"
    >
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 10.8072 11.0559"
      >
        <g id="Frame">
          <path
            d={svgPaths.p307dbb00}
            fill="var(--fill-0, #ECECEC)"
            id="Vector"
          />
        </g>
      </svg>
    </div>
  );
}

function Icon7() {
  return (
    <div
      className="absolute left-0 overflow-clip size-[14.41px] top-0"
      data-name="Icon"
    >
      <Frame1 />
    </div>
  );
}

function Container31() {
  return (
    <div
      className="absolute left-[4.32px] size-[14.41px] top-[4.32px]"
      data-name="Container"
    >
      <Icon7 />
    </div>
  );
}

function Container30() {
  return (
    <div
      className="absolute bg-[#222] left-0 rounded-[719.759px] size-[23.055px] top-0"
      data-name="Container"
    >
      <Container31 />
    </div>
  );
}

function Container29() {
  return (
    <div
      className="absolute left-[116.18px] size-[23.055px] top-[-4px]"
      data-name="Container"
    >
      <Container30 />
    </div>
  );
}

function Container25() {
  return (
    <div
      className="absolute h-[30px] left-[12px] top-[40px] w-[147px]"
      data-name="Container"
    >
      <Container26 />
      <Container28 />
      <Container29 />
    </div>
  );
}

function Container23() {
  return (
    <div
      className="absolute h-[82px] left-0 top-[192px] w-[165px]"
      data-name="Container"
    >
      <Container24 />
      <Container25 />
    </div>
  );
}

// ─── Athlete Cards Data ───────────────────────────────────────────────────────
// (data is now fetched dynamically from Firebase via athleteService.getAll)

interface AthleteCardProps {
  image: string;
  tag: string;
  views: string;
  name: string;
  sport: string;
  likes: string;
  comments: string;
  route: string;
}

function AthleteCard({ image, tag, views, name, sport, likes, comments, route }: AthleteCardProps) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(route)}
      className="relative border border-[rgba(255,255,255,0.1)] border-solid h-[276px] overflow-clip rounded-[16px] w-[167px] cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform shrink-0"
      style={{
        backgroundImage:
          'linear-gradient(121.177deg, rgb(26, 26, 38) 0%, rgb(24, 24, 36) 20%, rgb(23, 23, 33) 40%, rgb(21, 21, 31) 60%, rgb(20, 20, 28) 80%, rgb(18, 18, 26) 100%)',
      }}
    >
      {/* Image section */}
      <div className="absolute h-[192px] left-0 top-0 w-full">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <img
            alt=""
            className="absolute max-w-none object-cover size-full"
            src={image}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(0.149207deg, rgba(0,0,0,0.5) 0.11165%, rgba(0,0,0,0) 99.889%)',
            }}
          />
        </div>
        {/* Athlete name + sport overlay on image */}
        <div className="absolute h-[38px] left-[8px] top-[146px] w-[149px]">
          <p className="[word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[20px] left-0 not-italic text-[14px] text-white top-[0.5px] tracking-[-0.1504px] whitespace-nowrap">
            {name}
          </p>
          <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#d1d5dc] text-[12px] top-[22px] whitespace-nowrap">
            {sport}
          </p>
        </div>
        {/* Views badge */}
        <div className="absolute h-[23px] left-[111px] top-[6px] w-[50px]">
          <div className="absolute bg-[rgba(34,34,34,0.5)] h-[23px] left-0 rounded-[7204.07px] top-0 w-[50px] flex items-center gap-1 px-2">
            <svg className="w-[10px] h-[10px] shrink-0" fill="none" viewBox="0 0 14.4096 14.4096">
              <path d={svgPaths.p259d4600} stroke="#ECECEC" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2008" />
              <path d={svgPaths.p24726e00} stroke="#ECECEC" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2008" />
              <path d={svgPaths.p27563480} stroke="#ECECEC" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2008" />
              <path d={svgPaths.p1d1c2564} stroke="#ECECEC" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2008" />
            </svg>
            <p className="font-['Inter:Medium',sans-serif] font-medium text-[#ececec] text-[10px] whitespace-nowrap">{views}</p>
          </div>
        </div>
      </div>

      {/* Card details section */}
      <div className="absolute h-[82px] left-0 top-[192px] w-full">
        {/* Tag */}
        <div className="absolute h-[16px] left-[12px] top-[12px] w-[141px]">
          <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#99a1af] text-[12px] top-0 whitespace-nowrap">
            {tag}
          </p>
        </div>
        {/* Likes */}
        <div className="absolute h-[23.055px] left-[12px] top-[35px] w-[51.632px]">
          <div className="absolute bg-[#222] h-[23px] left-0 rounded-[7204.07px] top-0 w-[54px] flex items-center gap-1 px-2">
            <svg className="w-[10px] h-[10px] shrink-0" fill="none" viewBox="0 0 12.0082 11.0984">
              <path d={svgPaths.p1a5bea00} fill="#ECECEC" />
            </svg>
            <p className="font-['Inter:Medium',sans-serif] font-medium text-[#ececec] text-[10px] whitespace-nowrap">{likes}</p>
          </div>
        </div>
        {/* Comments */}
        <div className="absolute h-[23.055px] left-[73.63px] top-[35px] w-[43.544px]">
          <div className="absolute bg-[#222] h-[23px] left-0 rounded-[7204.07px] top-0 w-[46px] flex items-center gap-1 px-2">
            <svg className="w-[10px] h-[10px] shrink-0" fill="none" viewBox="0 0 14.4096 14.4096">
              <path d={svgPaths.p1b831380} stroke="#ECECEC" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2008" />
              <path d={svgPaths.p3fc53c40} stroke="#ECECEC" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2008" />
              <path d={svgPaths.p26387000} stroke="#ECECEC" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2008" />
              <path d={svgPaths.p27cd7000} stroke="#ECECEC" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2008" />
              <path d={svgPaths.p25d64960} stroke="#ECECEC" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2008" />
            </svg>
            <p className="font-['Inter:Medium',sans-serif] font-medium text-[#ececec] text-[10px] whitespace-nowrap">{comments}</p>
          </div>
        </div>
        {/* Share */}
        <div className="absolute left-[127.18px] size-[23.055px] top-[35px]">
          <div className="absolute bg-[#222] left-0 rounded-[719.759px] size-[23.055px] top-0 flex items-center justify-center">
            <svg className="w-[10px] h-[10px]" fill="none" viewBox="0 0 10.8072 11.0559">
              <path d={svgPaths.p307dbb00} fill="#ECECEC" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Paragraph11() {
  return (
    <div
      className="absolute h-[20px] left-0 top-0 w-[149px]"
      data-name="Paragraph"
    >
      <p className="[word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[20px] left-0 not-italic text-[14px] text-white top-[0.5px] tracking-[-0.1504px] whitespace-nowrap">
        Avinash Sable
      </p>
    </div>
  );
}

function Paragraph12() {
  return (
    <div
      className="absolute h-[16px] left-0 top-[22px] w-[149px]"
      data-name="Paragraph"
    >
      <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#d1d5dc] text-[12px] top-px whitespace-nowrap">
        3000m Steeplechase
      </p>
    </div>
  );
}

function Container34() {
  return (
    <div
      className="absolute h-[38px] left-[8px] top-[146px] w-[149px]"
      data-name="Container"
    >
      <Paragraph11 />
      <Paragraph12 />
    </div>
  );
}

function Icon8() {
  return (
    <div
      className="absolute left-[4.32px] size-[14.41px] top-[4.32px]"
      data-name="Icon"
    >
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 14.4096 14.4096"
      >
        <g id="Icon">
          <path
            d={svgPaths.p259d4600}
            id="Vector"
            stroke="var(--stroke-0, #ECECEC)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.2008"
          />
          <path
            d={svgPaths.p24726e00}
            id="Vector_2"
            stroke="var(--stroke-0, #ECECEC)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.2008"
          />
          <path
            d={svgPaths.p27563480}
            id="Vector_3"
            stroke="var(--stroke-0, #ECECEC)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.2008"
          />
          <path
            d={svgPaths.p1d1c2564}
            id="Vector_4"
            stroke="var(--stroke-0, #ECECEC)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.2008"
          />
        </g>
      </svg>
    </div>
  );
}

function Paragraph13() {
  return (
    <div
      className="absolute h-[8.646px] left-[21.61px] top-[7.2px] w-[20.776px]"
      data-name="Paragraph"
    >
      <p className="[word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[8.646px] left-0 not-italic text-[#ececec] text-[10px] top-[0.36px] whitespace-nowrap">
        2.5M
      </p>
    </div>
  );
}

function Vu3() {
  return (
    <div
      className="absolute bg-[rgba(34,34,34,0.5)] h-[23px] left-0 rounded-[7204.07px] top-0 w-[50px]"
      data-name="vu"
    >
      <Icon8 />
      <Paragraph13 />
    </div>
  );
}

function Container35() {
  return (
    <div
      className="absolute h-[23px] left-[109px] top-[9px] w-[50px]"
      data-name="Container"
    >
      <Vu3 />
    </div>
  );
}

function Container33() {
  return (
    <div
      className="absolute h-[192px] left-0 top-0 w-[165px]"
      data-name="Container"
    >
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <Image
          alt=""
          className="absolute max-w-none object-cover size-full"
          src={imgContainer2}
        />
        <div className="absolute bg-gradient-to-t from-1/2 from-[rgba(0,0,0,0.5)] inset-0 to-[rgba(0,0,0,0)]" />
      </div>
      <Container34 />
      <Container35 />
    </div>
  );
}

function Text1() {
  return (
    <div
      className="absolute h-[16px] left-0 top-0 w-[90.07px]"
      data-name="Text"
    >
      <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#99a1af] text-[12px] top-px whitespace-nowrap">
        #National Record
      </p>
    </div>
  );
}

function Container37() {
  return (
    <div
      className="absolute h-[16px] left-[12px] top-[12px] w-[141px]"
      data-name="Container"
    >
      <Text1 />
    </div>
  );
}

function Frame2() {
  return (
    <div
      className="absolute inset-[12.5%_8.33%_10.48%_8.34%]"
      data-name="Frame"
    >
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 12.0082 11.0984"
      >
        <g id="Frame">
          <path
            d={svgPaths.p1a5bea00}
            fill="var(--fill-0, #ECECEC)"
            id="Vector"
          />
        </g>
      </svg>
    </div>
  );
}

function Icon9() {
  return (
    <div
      className="absolute left-0 overflow-clip size-[14.41px] top-0"
      data-name="Icon"
    >
      <Frame2 />
    </div>
  );
}

function Container39() {
  return (
    <div
      className="absolute left-[4.32px] size-[14.41px] top-[4.32px]"
      data-name="Container"
    >
      <Icon9 />
    </div>
  );
}

function Paragraph14() {
  return (
    <div
      className="absolute h-[8.646px] left-[21.61px] top-[7.2px] w-[24.254px]"
      data-name="Paragraph"
    >
      <p className="[word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[8.646px] left-0 not-italic text-[#ececec] text-[10px] top-[0.36px] whitespace-nowrap">
        45.6K
      </p>
    </div>
  );
}

function Vu4() {
  return (
    <div
      className="absolute bg-[#222] h-[23px] left-[-0.36px] rounded-[7204.07px] top-0 w-[54px]"
      data-name="vu"
    >
      <Container39 />
      <Paragraph14 />
    </div>
  );
}

function Container38() {
  return (
    <div
      className="absolute h-[23.055px] left-[12px] top-[35px] w-[51.632px]"
      data-name="Container"
    >
      <Vu4 />
    </div>
  );
}

function Icon10() {
  return (
    <div
      className="absolute left-[4.32px] size-[14.41px] top-[4.32px]"
      data-name="Icon"
    >
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 14.4096 14.4096"
      >
        <g id="Icon">
          <path
            d={svgPaths.p1b831380}
            id="Vector"
            stroke="var(--stroke-0, #ECECEC)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.2008"
          />
          <path
            d={svgPaths.p3fc53c40}
            id="Vector_2"
            stroke="var(--stroke-0, #ECECEC)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.2008"
          />
          <path
            d={svgPaths.p26387000}
            id="Vector_3"
            stroke="var(--stroke-0, #ECECEC)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.2008"
          />
          <path
            d={svgPaths.p27cd7000}
            id="Vector_4"
            stroke="var(--stroke-0, #ECECEC)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.2008"
          />
          <path
            d={svgPaths.p25d64960}
            id="Vector_5"
            stroke="var(--stroke-0, #ECECEC)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.2008"
          />
        </g>
      </svg>
    </div>
  );
}

function Paragraph15() {
  return (
    <div
      className="absolute h-[8.646px] left-[21.61px] top-[7.2px] w-[16.166px]"
      data-name="Paragraph"
    >
      <p className="[word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[8.646px] left-0 not-italic text-[#ececec] text-[10px] top-[0.36px] whitespace-nowrap">
        256
      </p>
    </div>
  );
}

function Vu5() {
  return (
    <div
      className="absolute bg-[#222] h-[23px] left-[-0.2px] rounded-[7204.07px] top-0 w-[46px]"
      data-name="vu"
    >
      <Icon10 />
      <Paragraph15 />
    </div>
  );
}

function Container40() {
  return (
    <div
      className="absolute h-[23.055px] left-[73.63px] top-[35px] w-[43.544px]"
      data-name="Container"
    >
      <Vu5 />
    </div>
  );
}

function Frame3() {
  return (
    <div
      className="absolute inset-[10.78%_12.5%_12.49%_12.5%]"
      data-name="Frame"
    >
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 10.8072 11.0559"
      >
        <g id="Frame">
          <path
            d={svgPaths.p307dbb00}
            fill="var(--fill-0, #ECECEC)"
            id="Vector"
          />
        </g>
      </svg>
    </div>
  );
}

function Icon11() {
  return (
    <div
      className="absolute left-0 overflow-clip size-[14.41px] top-0"
      data-name="Icon"
    >
      <Frame3 />
    </div>
  );
}

function Container43() {
  return (
    <div
      className="absolute left-[4.32px] size-[14.41px] top-[4.32px]"
      data-name="Container"
    >
      <Icon11 />
    </div>
  );
}

function Container42() {
  return (
    <div
      className="absolute bg-[#222] left-0 rounded-[719.759px] size-[23.055px] top-0"
      data-name="Container"
    >
      <Container43 />
    </div>
  );
}

function Container41() {
  return (
    <div
      className="absolute left-[127.18px] size-[23.055px] top-[35px]"
      data-name="Container"
    >
      <Container42 />
    </div>
  );
}

function Container36() {
  return (
    <div
      className="absolute h-[82px] left-0 top-[192px] w-[167px]"
      data-name="Container"
    >
      <Container37 />
      <Container38 />
      <Container40 />
      <Container41 />
    </div>
  );
}


function Container18() {
  const [athletes, setAthletes] = useState<AthleteCardProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    athleteService
      .getAll()
      .then((data: any[]) => {
        const mapped: AthleteCardProps[] = data.map((a) => ({
          image: a.image || '',
          tag: a.achievementLabel ? `#${a.achievementLabel.replace(/\s+/g, '')}` : `#${(a.sport || '').replace(/\s+/g, '')}`,
          views: a.stats?.worldRank || '—',
          name: a.name || '',
          sport: a.sport || '',
          likes: String(a.stats?.totalGold ?? 0) + ' Golds',
          comments: String(a.stats?.totalSilver ?? 0),
          // route: `/athlete/${a.slug}`,
          route: `/MainModules/AtheleteProfile/${a.slug}`,
        }));
        setAthletes(mapped);
      })
      .catch((err) => {
        console.error('Failed to load athletes for home cards:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      className="absolute left-0 top-[98px] w-[350px] overflow-x-auto overflow-y-hidden scrollbar-hide"
      data-name="Container"
    >
      <div className="flex gap-3 w-max pb-2">
        {loading
          ? // Skeleton placeholders while fetching
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="relative border border-[rgba(255,255,255,0.08)] h-[276px] rounded-[16px] w-[167px] shrink-0 animate-pulse"
                style={{
                  backgroundImage:
                    'linear-gradient(121.177deg, rgb(22,22,32) 0%, rgb(18,18,26) 100%)',
                }}
              >
                <div className="absolute h-[192px] left-0 top-0 w-full bg-[rgba(255,255,255,0.05)] rounded-t-[16px]" />
                <div className="absolute left-[10px] top-[204px] w-[120px] h-[12px] rounded bg-[rgba(255,255,255,0.08)]" />
                <div className="absolute left-[10px] top-[222px] w-[80px] h-[10px] rounded bg-[rgba(255,255,255,0.05)]" />
              </div>
            ))
          : athletes.map((athlete) => (
              <AthleteCard key={athlete.route} {...athlete} />
            ))}
      </div>
    </div>
  );
}

function TextInput1() {
  return (
    <div
      className="absolute bg-[#14141d] border border-[#343434] border-solid h-[30px] left-0 overflow-clip rounded-[13981000px] top-0 w-[150px]"
      data-name="Text Input"
    >
      <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[32.33px] not-italic text-[11.667px] text-[rgba(255,255,255,0.5)] top-[6.92px] tracking-[-0.1253px] whitespace-nowrap">
        Search player...
      </p>
    </div>
  );
}

function Icon12() {
  return (
    <div
      className="absolute left-[10px] size-[13.333px] top-[8.33px]"
      data-name="Icon"
    >
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 13.3333 13.3333"
      >
        <g id="Icon">
          <path
            d={svgPaths.p24188e80}
            id="Vector"
            stroke="var(--stroke-0, #99A1AF)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.11111"
          />
          <path
            d={svgPaths.p38836b00}
            id="Vector_2"
            stroke="var(--stroke-0, #99A1AF)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.11111"
          />
        </g>
      </svg>
    </div>
  );
}

function Container44() {
  return (
    <div
      className="absolute h-[30px] left-[201px] top-[-2px] w-[150px]"
      data-name="Container"
    >
      <TextInput1 />
      <Icon12 />
    </div>
  );
}

function Container15() {
  return (
    <div
      className="absolute h-[395px]  left-[20px] top-[767px] w-[350px]"
      data-name="Container"
    >
      <Container16 />
      <Container17 />
      <Container18 />
      <Container44 />
    </div>
  );
}

function Heading4() {
  return (
    <div
      className="absolute h-[24px] left-0 top-0 w-[139.992px]"
      data-name="Heading 3"
    >
      <p className="[word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[24px] left-0 not-italic text-[16px] text-white top-[-0.5px] tracking-[-0.3125px] whitespace-nowrap">{`News & Stories`}</p>
    </div>
  );
}

function Button13() {
  return (
    <div
      className="absolute h-[16px] left-[309.38px] top-[4px] w-[40.617px]"
      data-name="Button"
    >
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] left-[20px] not-italic text-[#fb2c36] text-[12px] text-center top-px whitespace-nowrap">
        See All
      </p>
    </div>
  );
}

function Container46() {
  return (
    <div
      className="absolute h-[24px] left-0 top-0 w-[350px]"
      data-name="Container"
    >
      <Heading4 />
      {/* <Button13 /> */}
    </div>
  );
}

function Container49() {
  return (
    <div
      className="absolute bg-[#c9115f] h-[24px] left-[16px] rounded-[16777200px] top-[100px] w-[68.797px]"
      data-name="Container"
    >
      <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] left-[8px] not-italic text-[12px] text-white top-[5px] whitespace-nowrap">
        Featured
      </p>
    </div>
  );
}

function Heading5() {
  return (
    <div
      className="absolute h-[24px] left-[16px] top-[132px] w-[318px]"
      data-name="Heading 4"
    >
      <p className="[word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[24px] left-0 not-italic text-[16px] text-white top-[-0.5px] tracking-[-0.3125px] whitespace-nowrap">
        Indian athletics squad for CWG 2026
      </p>
    </div>
  );
}

function Paragraph16() {
  return (
    <div
      className="absolute h-[16px] left-[16px] top-[160px] w-[318px]"
      data-name="Paragraph"
    >
      <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#d1d5dc] text-[12px] top-px whitespace-nowrap">
        5 min read
      </p>
    </div>
  );
}

function Container48() {
  const router = useRouter();
  return (
    <div
      // onClick={() => router.push("/articles/1")}
       onClick={() => router.push("/MainModules/AtheleteArticles/india-commonwealth-games-2026-athletics-squad")} 
      className="absolute h-[192px] left-0 overflow-clip rounded-[16px] top-0 w-[350px]"
      data-name="Container"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none rounded-[16px]"
      >
        <div className="relative w-full" style={{ height: '220px' }}>
          <img
            src="/cwg-2026-india-squad-banner.png"
            alt=""
            className="w-full h-full object-fill"
          />
        </div>
        <div className="absolute bg-gradient-to-t from-black inset-0 rounded-[16px] to-[rgba(0,0,0,0)] via-1/2 via-[rgba(0,0,0,0.6)]" />
      </div>
      <Container49 />
      <Heading5 />
      <Paragraph16 />
    </div>
  );
}

function Container52() {
  return (
    <div
      className="absolute bg-[rgba(245,73,0,0.2)] h-[24px] left-[16px] rounded-[16777200px] top-[17.5px] w-[61.883px]"
      data-name="Container"
    >
      <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] left-[8px] not-italic text-[#ff5900] text-[12px] top-[5px] whitespace-nowrap">
        Article
      </p>
    </div>
  );
}

function Heading6() {
  return (
    <div
      className="absolute h-[40px] left-[16px] top-[49.5px] w-[133px]"
      data-name="Heading 4"
    >
      <p className="[word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[20px] left-0 not-italic text-[14px] text-white top-[0.5px] tracking-[-0.1504px] w-[133px]">
        2 days, 2 national records
      </p>
    </div>
  );
}

function Paragraph17() {
  return (
    <div
      className="absolute h-[16px] left-[16px] top-[97.5px] w-[133px]"
      data-name="Paragraph"
    >
      <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#99a1af] text-[12px] top-px whitespace-nowrap">
        3 min read
      </p>
    </div>
  );
}

function Container51() {
  const router = useRouter();
  return (
    <div
      // onClick={() => router.push("/MainModules/AtheleteArticles")}
       onClick={() => router.push("/MainModules/AtheleteArticles/federation-cup-2026-gurindervir-tejaswin-national-records")}
      className="absolute border border-[rgba(255,255,255,0.1)] border-solid h-[131.5px] left-0 rounded-[16px] top-0 w-[167px]"
      style={{
        backgroundImage:
          "linear-gradient(141.782deg, rgb(26, 26, 38) 0%, rgb(24, 24, 36) 20%, rgb(23, 23, 33) 40%, rgb(21, 21, 31) 60%, rgb(20, 20, 28) 80%, rgb(18, 18, 26) 100%)",
      }}
      data-name="Container"
    >
      <Container52 />
      <Heading6 />
      <Paragraph17 />
    </div>
  );
}

function Container54() {
  return (
    <div
      className="absolute bg-[rgba(255,0,132,0.21)] h-[24px] left-[16px] rounded-[16777200px] top-[17.5px] w-[49.836px]"
      data-name="Container"
    >
      <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] left-[8px] not-italic text-[#c9115f] text-[12px] top-[5px] whitespace-nowrap">
        Article
      </p>
    </div>
  );
}

function Heading7() {
  return (
    <div
      className="absolute h-[40px] left-[16px] top-[49.5px] w-[133px]"
      data-name="Heading 4"
    >
      <p className="[word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[20px] left-0 not-italic text-[14px] text-white top-[0.5px] tracking-[-0.1504px] w-[133px]">
        Javelin Duo Book CWG Spots
      </p>
    </div>
  );
}

function Paragraph18() {
  return (
    <div
      className="absolute h-[16px] left-[16px] top-[97.5px] w-[133px]"
      data-name="Paragraph"
    >
      <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#99a1af] text-[12px] top-px whitespace-nowrap">
        8 min watch
      </p>
    </div>
  );
}

function Container53() {
  const router = useRouter();
  return (
    <div
      // onClick={() => router.push("/MainModules/AtheleteArticles")}
       onClick={() => router.push("/MainModules/AtheleteArticles/javelin-duo-cwg-spots")} 
      className="absolute border border-[rgba(255,255,255,0.1)] border-solid h-[131.5px] left-[183px] rounded-[16px] top-0 w-[167px]"
      style={{
        backgroundImage:
          "linear-gradient(141.782deg, rgb(26, 26, 38) 0%, rgb(24, 24, 36) 20%, rgb(23, 23, 33) 40%, rgb(21, 21, 31) 60%, rgb(20, 20, 28) 80%, rgb(18, 18, 26) 100%)",
      }}
      data-name="Container"
    >
      <Container54 />
      <Heading7 />
      <Paragraph18 />
    </div>
  );
}

function Container50() {
  return (
    <div
      className="absolute h-[131.5px] left-0 top-[208px] w-[350px]"
      data-name="Container"
    >
      <Container51 />
      <Container53 />
    </div>
  );
}

function Container47() {
  return (
    <div
      className="absolute h-[339.5px] left-0 top-[40px] w-[350px]"
      data-name="Container"
    >
      <Container48 />
      <Container50 />
    </div>
  );
}

function Container45() {
  return (
    <div
      className="absolute h-[379.5px] left-[20px] top-[1167px] w-[350px]"
      data-name="Container"
    >
      <Container46 />
      <Container47 />
    </div>
  );
}

function ActionButton() {
  return (
    <div
      className="bg-[rgba(255,89,0,0.3)] h-[42px] relative rounded-[16px] shrink-0 w-[80px]"
      data-name="ActionButton"
    >
      <div
        aria-hidden="true"
        className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[16px]"
      />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[19.5px] left-[40px] not-italic text-[13px] text-center text-white top-[11px] tracking-[-0.0762px] whitespace-nowrap">
          Records
        </p>
      </div>
    </div>
  );
}

function Text2() {
  return (
    <div
      className="absolute h-[39px] left-[61px] top-[7px] w-[44.501px]"
      data-name="Text"
    />
  );
}

function ActionButton1() {
  return null;
}

function Text3() {
  return (
    <div
      className="absolute h-[19.5px] left-[61px] top-[16.75px] w-[31px]"
      data-name="Text"
    />
  );
}

function ActionButton2() {
  return (
    <div
      className="bg-[rgba(255,89,0,0.3)] h-[42px] relative rounded-[16px] shrink-0 w-[85px]"
      data-name="ActionButton"
    >
      <div
        aria-hidden="true"
        className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[16px]"
      />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Text3 />
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[19.5px] left-[42.5px] not-italic text-[13px] text-center text-white top-[11px] tracking-[-0.0762px] whitespace-nowrap">
          Calendar
        </p>
      </div>
    </div>
  );
}

function Container55() {
  return (
    <div
      className="absolute content-stretch flex gap-[14px] items-start left-[20px] top-[472px] w-[350px]"
      data-name="Container"
    >
      <ActionButton />
      <ActionButton2 />
    </div>
  );
}

function Icon13() {
  return (
    <div
      className="absolute left-[12px] size-[14px] top-[5px]"
      data-name="Icon"
    >
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 14 14"
      >
        <g id="Icon">
          <path
            d="M4.66667 1.16667V3.5"
            id="Vector"
            stroke="var(--stroke-0, white)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.16667"
          />
          <path
            d="M9.33333 1.16667V3.5"
            id="Vector_2"
            stroke="var(--stroke-0, white)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.16667"
          />
          <path
            d={svgPaths.p24a2b500}
            id="Vector_3"
            stroke="var(--stroke-0, white)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.16667"
          />
          <path
            d="M1.75 5.83333H12.25"
            id="Vector_4"
            stroke="var(--stroke-0, white)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.16667"
          />
        </g>
      </svg>
    </div>
  );
}

function Text4() {
  return (
    <div
      className="absolute h-[16px] left-[34px] top-[4px] w-[54.789px]"
      data-name="Text"
    >
      <p className="[word-break:break-word] absolute font-['Inter:Extra_Bold',sans-serif] font-extrabold leading-[16px] left-0 not-italic text-[12px] text-white top-px whitespace-nowrap">
        247 Days
      </p>
    </div>
  );
}

function Container57() {
  return (
    <div
      className="absolute bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] border-solid h-[26px] left-[24px] rounded-[16777200px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[24px] w-[102.789px]"
      data-name="Container"
    >
      <Icon13 />
      <Text4 />
    </div>
  );
}

function Heading() {
  return (
    <div
      className="absolute h-[64px] left-[24px] top-[62px] w-[302px]"
      data-name="Heading 2"
    >
      <p className="[word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[32px] left-0 not-italic text-[24px] text-white top-0 tracking-[0.0703px] w-[302px]">
        Commonwealth Games 2026
      </p>
    </div>
  );
}

function Paragraph19() {
  return (
    <div
      className="absolute h-[20px] left-[24px] top-[134px] w-[302px]"
      data-name="Paragraph"
    >
      <p className="[word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#d1d5dc] text-[14px] top-[0.5px] tracking-[-0.1504px] w-[122px]">
        Glasgow, Scotland
      </p>
    </div>
  );
}

function Paragraph20() {
  return (
    <div
      className="absolute h-[16px] left-[24px] top-[158px] w-[302px]"
      data-name="Paragraph"
    >
      <p className="[word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-0 not-italic text-[12px] text-white top-px w-[105px]">
        Medal Target: 70+
      </p>
    </div>
  );
}

function Button14() {
  const router = useRouter();
  return (
    <div
      onClick={() => { router.push('/MainModules/AtheletePlaybook'); }}
      className="absolute bg-[#c9115f] h-[40px] left-[24px] rounded-[16777200px] top-[190px] w-[138.492px]"
      data-name="Button"
    >
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] left-[69px] not-italic text-[14px] text-center text-white top-[10.5px] tracking-[-0.1504px] whitespace-nowrap">
        View Playbook
      </p>
    </div>
  );
}

function Container56() {
  return (
    <div
      className="absolute h-[254px] left-[13px] top-[197px] w-[350px]"
      data-name="Container"
    >
      <Container57 />
      <Heading />
      <Paragraph19 />
      <Paragraph20 />
      <Button14 />
    </div>
  );
}

function Container5() {
  return (
    <div
      className="absolute left-0 top-[156px] w-full h-auto"
      data-name="Container"
    >
      <Container6 />
      <Container7 />
      <Container15 />
      <Container45 />
      <Container55 />
      <Container56 />
    </div>
  );
}

function Icon14() {
  return (
    <div className="absolute left-[4.46px] size-[20px] top-0" data-name="Icon">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
      >
        <g id="Icon">
          <path
            d={svgPaths.p275d2400}
            id="Vector"
            stroke="var(--stroke-0, #FF006C)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.66667"
          />
          <path
            d={svgPaths.p21a7e80}
            id="Vector_2"
            stroke="var(--stroke-0, #FF006C)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.66667"
          />
        </g>
      </svg>
    </div>
  );
}

function Text5() {
  return (
    <div
      className="absolute h-[16px] left-0 top-[24px] w-[28.922px]"
      data-name="Text"
    >
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] left-[14.5px] not-italic text-[#ff006c] text-[12px] text-center top-px whitespace-nowrap">
        Feed
      </p>
    </div>
  );
}

function Button15() {
  return (
    <div
      className="absolute h-[40px] left-[18.44px] top-[11px] w-[28.922px]"
      data-name="Button"
    >
      <Icon14 />
      <Text5 />
    </div>
  );
}

function Icon15() {
  return (
    <div className="absolute left-[11.77px] size-[20px] top-0" data-name="Icon">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
      >
        <g clipPath="url(#clip0_20_312)" id="Icon">
          <path
            d={svgPaths.p3d62b480}
            id="Vector"
            stroke="var(--stroke-0, #99A1AF)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.66667"
          />
          <path
            d={svgPaths.p14d24500}
            id="Vector_2"
            stroke="var(--stroke-0, #99A1AF)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.66667"
          />
        </g>
        <defs>
          <clipPath id="clip0_20_312">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button16() {
  return (
    <div
      className="absolute h-[40px] left-[86.23px] top-[11px] w-[43.25px]"
      data-name="Button"
    >
      <Icon15 />
    </div>
  );
}

function Icon16() {
  return (
    <div className="absolute left-[11.66px] size-[20px] top-0" data-name="Icon">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
      >
        <g id="Icon">
          <path
            d={svgPaths.pfa37fa0}
            id="Vector"
            stroke="var(--stroke-0, #99A1AF)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.66667"
          />
        </g>
      </svg>
    </div>
  );
}

function Button17() {
  return (
    <div
      className="absolute h-[40px] left-[168.36px] top-[11px] w-[33.039px]"
      data-name="Button"
    >
      <Icon16 />
    </div>
  );
}

function Icon17() {
  return (
    <div className="absolute left-[16.62px] size-[20px] top-0" data-name="Icon">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
      >
        <g id="Icon">
          <path
            d="M10 5.83333V17.5"
            id="Vector"
            stroke="var(--stroke-0, #99A1AF)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.66667"
          />
          <path
            d={svgPaths.p25713000}
            id="Vector_2"
            stroke="var(--stroke-0, #99A1AF)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.66667"
          />
        </g>
      </svg>
    </div>
  );
}

function Button18() {
  return (
    <div
      className="absolute h-[40px] left-[240.27px] top-[11px] w-[52.953px]"
      data-name="Button"
    >
      <Icon17 />
    </div>
  );
}

function Icon18() {
  return (
    <div className="absolute left-[8.86px] size-[20px] top-0" data-name="Icon">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
      >
        <g clipPath="url(#clip0_20_307)" id="Icon">
          <path
            d={svgPaths.p14d24500}
            id="Vector"
            stroke="var(--stroke-0, #99A1AF)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.66667"
          />
          <path
            d={svgPaths.p35ba4680}
            id="Vector_2"
            stroke="var(--stroke-0, #99A1AF)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.66667"
          />
          <path
            d={svgPaths.p3dfd2600}
            id="Vector_3"
            stroke="var(--stroke-0, #99A1AF)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.66667"
          />
        </g>
        <defs>
          <clipPath id="clip0_20_307">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button19() {
  return (
    <div
      className="absolute h-[40px] left-[332.1px] top-[11px] w-[37.438px]"
      data-name="Button"
    >
      <Icon18 />
    </div>
  );
}

function Container58() {
  return (
    <div
      className="absolute bg-[#0b0b0f] border border-[#353535] border-solid h-[57px] left-0 rounded-[10px] top-[1721px] w-[390px]"
      data-name="Container"
    >
      <Button15 />
      <Button16 />
      <Button17 />
      <Button18 />
      <Button19 />
    </div>
  );
}

function ImageNeerajJourney() {
  return (
    <div
      className="absolute left-0 size-[96px] top-0"
      data-name="Image (Neeraj Journey)"
    >
      <Image
        alt=""
        className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
        src={imgContainer1}
      />
    </div>
  );
}

function Container60() {
  return (
    <div
      className="absolute bg-[rgba(255,255,255,0)] left-[10px] overflow-clip rounded-[16777200px] shadow-[0px_0px_0px_2px_#0b0b0f,0px_0px_0px_4px_#fb2c36] size-[96px] top-[10px]"
      data-name="Container"
    >
      <ImageNeerajJourney />
    </div>
  );
}

function Paragraph21() {
  return (
    <div
      className="absolute h-[16px] left-[10px] top-[114px] w-[96px]"
      data-name="Paragraph"
    >
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[48.22px] not-italic text-[12px] text-center text-white top-px whitespace-nowrap">
        Neeraj Journey
      </p>
    </div>
  );
}

function Button20() {
  return (
    <div
      className="relative h-[140px] w-[96px] flex-shrink-0"
      data-name="Button"
    >
      <Container60 />
      <Paragraph21 />
    </div>
  );
}

function ImageCwgBuildUp() {
  return (
    <div
      className="absolute left-0 size-[96px] top-0"
      data-name="Image (CWG Build-Up)"
    >
      <Image
        alt=""
        className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
        src={imgImageCwgBuildUp}
      />
    </div>
  );
}

function Container61() {
  return (
    <div
      className="absolute bg-[rgba(255,255,255,0)] left-[10px] overflow-clip rounded-[16777200px] shadow-[0px_0px_0px_2px_#0b0b0f,0px_0px_0px_4px_#fb2c36] size-[96px] top-[10px]"
      data-name="Container"
    >
      <ImageCwgBuildUp />
    </div>
  );
}

function Paragraph22() {
  return (
    <div
      className="absolute h-[16px] left-[10px] top-[114px] w-[96px]"
      data-name="Paragraph"
    >
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[48.7px] not-italic text-[12px] text-center text-white top-px whitespace-nowrap">
        CWG Build-Up
      </p>
    </div>
  );
}

function Button21() {
  return (
    <div
      className="relative h-[140px] w-[96px] flex-shrink-0"
      data-name="Button"
    >
      <Container61 />
      <Paragraph22 />
    </div>
  );
}

function ImageAthleteJam() {
  return (
    <div
      className="absolute left-0 size-[96px] top-0"
      data-name="Image (Athlete Jam)"
    >
      <Image
        alt=""
        className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
        src={imgImageAthleteJam}
      />
    </div>
  );
}

function Container62() {
  return (
    <div
      className="absolute bg-[rgba(255,255,255,0)] left-[10px] overflow-clip rounded-[16777200px] shadow-[0px_0px_0px_2px_#0b0b0f,0px_0px_0px_4px_#fb2c36] size-[96px] top-[10px]"
      data-name="Container"
    >
      <ImageAthleteJam />
    </div>
  );
}

function Paragraph23() {
  return (
    <div
      className="absolute h-[16px] left-[10px] top-[114px] w-[96px]"
      data-name="Paragraph"
    >
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[48.09px] not-italic text-[12px] text-center text-white top-px whitespace-nowrap">
        Athlete Jam
      </p>
    </div>
  );
}

function Button22() {
  return (
 <div
      className="relative h-[140px] w-[96px] flex-shrink-0"
      data-name="Button"
    >
      <Container62 />
      <Paragraph23 />
    </div>
  );
}

function ImageTrainingCamp() {
  return (
    <div
      className="absolute left-0 size-[96px] top-0"
      data-name="Image (Training Camp)"
    >
      <Image
        alt=""
        className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
        src={imgImageTrainingCamp}
      />
    </div>
  );
}

function Container63() {
  return (
    <div
      className="absolute bg-[rgba(255,255,255,0)] left-[10px] overflow-clip rounded-[16777200px] shadow-[0px_0px_0px_2px_#0b0b0f,0px_0px_0px_4px_#fb2c36] size-[96px] top-[10px]"
      data-name="Container"
    >
      <ImageTrainingCamp />
    </div>
  );
}

function Paragraph24() {
  return (
    <div
      className="absolute h-[16px] left-[10px] top-[114px] w-[96px]"
      data-name="Paragraph"
    >
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[48.3px] not-italic text-[12px] text-center text-white top-px whitespace-nowrap">
        Training Camp
      </p>
    </div>
  );
}

function Button23() {
  return (
    <div
      className="relative h-[140px] w-[96px] flex-shrink-0"
      data-name="Button"
    >
      <Container63 />
      <Paragraph24 />
    </div>
  );
}

function Container59() {
  return (
    
    <div
  className="absolute left-[12px] right-[12px] top-[178px] overflow-x-auto overflow-y-hidden scrollbar-hide"
      data-name="Container"
    >
      <div className="flex gap-2 w-max">
        <Button20 />
        <Button21 />
        <Button22 />
        <Button23 />
      </div>
    </div>
  );
}

export default function HomeScreen() {

  return (
    <div className="bg-[#0b0b0f] relative size-full" data-name="Home screen">
      <Container />
      <Container5 />
      <Container58 />
      
      <Container59 />

    </div>
  );
}
