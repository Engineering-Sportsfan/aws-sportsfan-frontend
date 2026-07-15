import { imgGroup } from "./svg-19wir";

function Group() {
  return (
    <div className="absolute inset-[-5.31%_-3.33%_-11.54%_-6.67%] mask-intersect mask-luminance mask-no-clip mask-no-repeat mask-position-[1.736px_1.647px] mask-size-[26.039px_31px]" style={{ maskImage: `url('${imgGroup}')` }} data-name="Group">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28.6431 36.2251">
        <g id="Group">
          <path d="M0 0H28.6431V36.2251H0V0Z" fill="url(#paint0_linear_48_83)" id="Vector" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_48_83" x1="7.99684" x2="21.4824" y1="13.1837" y2="25.2734">
            <stop stopColor="#FF1379" />
            <stop offset="1" stopColor="#FE7604" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default function MaskGroup() {
  return (
    <div className="relative size-full" data-name="Mask group">
      <Group />
    </div>
  );
}