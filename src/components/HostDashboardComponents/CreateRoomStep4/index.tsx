// "use client";

// import { useState } from "react";

// // ─── Types 

// interface CreateRoomStep4Props {
//   currentStep?: number;
//   onNext?: () => void;
//   onPrev?: () => void;
// }

// // ─── Mockup Data 

// const STEPS = [
//   { id: 1, label: "Event" },
//   { id: 2, label: "Details" },
//   { id: 3, label: "Content" },
//   { id: 4, label: "Pricing & Review" },
// ];

// const TOTAL_STEPS = 4;

// const ROOM_MOCKUP = {
//   title: "Gopichand's Tactical Breakdown - India vs Denmark",
//   tags: ["BWF World Tour Finals", "Expert Analysis", "Hindi"],
//   maxCapacity: 1000,
//   scheduledTime: "Today · 6:30 PM IST",
//   status: "LIVE" as const,
//   roomType: "Open Room",
//   discoveryNote: "This is how fans will see your room card on the discovery screen.",
// };

// const PRICING_MOCKUP = {
//   defaultPrice: 49,
//   minPrice: 29,
//   maxPrice: 99,
//   currency: "₹",
//   attendanceRange: { low: 0.6, high: 0.8 },
// };

// // ─── Helpers 

// const formatINR = (val: number) => `₹${val.toLocaleString("en-IN")}`;

// // ─── Main Component 

// export default function CreateRoomStep4({
//   currentStep = 4,
//   onNext,
//   onPrev,
// }: CreateRoomStep4Props) {
//   const [price, setPrice] = useState(PRICING_MOCKUP.defaultPrice);

//   const { maxCapacity } = ROOM_MOCKUP;
//   const { minPrice, maxPrice, currency, attendanceRange } = PRICING_MOCKUP;

//   const attendanceLow = Math.round(maxCapacity * attendanceRange.low);
//   const attendanceHigh = Math.round(maxCapacity * attendanceRange.high);
//   const earningsLow = attendanceLow * price;
//   const earningsHigh = attendanceHigh * price;

//   const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const val = Number(e.target.value);
//     if (!isNaN(val)) setPrice(Math.min(maxPrice, Math.max(minPrice, val)));
//   };

//   return (
//     <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
//       <div className="w-full max-w-6xl bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl">

//         {/* ── Top Bar ── */}
//         <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
//           <button
//             onClick={onPrev}
//             className="flex items-center gap-2 text-neutral-400 text-sm hover:text-white transition-colors"
//           >
//             <span>←</span>
//             <span>Back</span>
//           </button>
//           <h1 className="text-white font-semibold text-base">Create New Room</h1>
//           <div className="flex items-center gap-3 text-neutral-400 text-sm">
//             <span>Step {currentStep} of {TOTAL_STEPS}</span>
//             <button className="hover:text-white transition-colors text-lg leading-none">
//               ✕
//             </button>
//           </div>
//         </div>

//         {/* ── Stepper ── */}
//         <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 overflow-x-auto">
//           {STEPS.map((step, idx) => (
//             <div key={step.id} className="flex items-center flex-1 min-w-0">
//               <div className="flex items-center gap-2 shrink-0">
//                 <div
//                   className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
//                     step.id === currentStep
//                       ? "bg-orange-500 text-white"
//                       : step.id < currentStep
//                       ? "bg-orange-500/30 text-orange-400"
//                       : "bg-neutral-700 text-neutral-400"
//                   }`}
//                 >
//                   {step.id}
//                 </div>
//                 <span
//                   className={`text-xs font-medium whitespace-nowrap ${
//                     step.id === currentStep
//                       ? "text-white"
//                       : step.id < currentStep
//                       ? "text-orange-400"
//                       : "text-neutral-500"
//                   }`}
//                 >
//                   {step.label}
//                 </span>
//               </div>
//               {idx < STEPS.length - 1 && (
//                 <div className="flex-1 mx-3 h-px bg-neutral-700 min-w-4" />
//               )}
//             </div>
//           ))}
//         </div>

//         {/* ── Body ── */}
//         <div className="p-6">
//           <h2 className="text-white font-bold text-xl mb-6">
//             {STEPS[currentStep - 1].label}
//           </h2>

//           <div className="flex flex-col lg:flex-row gap-6">

//             {/* ── Left: Pricing ── */}
//             <div className="flex-1 space-y-4">
//               <p className="text-neutral-300 text-sm font-medium">Price per Fan</p>

//               {/* Price Input */}
//               <div className="bg-neutral-800 rounded-xl px-4 py-3 flex items-center gap-2 border border-neutral-700">
//                 <span className="text-neutral-300 text-lg">{currency}</span>
//                 <input
//                   type="number"
//                   value={price}
//                   min={minPrice}
//                   max={maxPrice}
//                   onChange={handlePriceChange}
//                   className="bg-transparent text-white text-xl font-semibold w-full outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
//                 />
//               </div>

//               {/* Hints */}
//               <div className="flex items-center justify-between text-xs">
//                 <span className="text-neutral-500">
//                   Recommended: {currency}{minPrice} – {currency}{maxPrice}
//                 </span>
//                 <span className="text-orange-400 font-medium">
//                   {maxCapacity.toLocaleString("en-IN")} max capacity
//                 </span>
//               </div>

//               {/* Revenue Projection */}
//               <div className="bg-neutral-800 rounded-xl p-4 border border-green-900/40">
//                 <p className="text-green-400 font-semibold text-sm mb-1">
//                   Revenue Projection
//                 </p>
//                 <p className="text-neutral-400 text-xs mb-3">
//                   Based on your current audience reach
//                 </p>
//                 <div className="flex justify-between items-center text-sm mb-2">
//                   <span className="text-neutral-400">
//                     Expected Attendance: {attendanceRange.low * 100}–
//                     {attendanceRange.high * 100}%
//                   </span>
//                   <span className="text-neutral-200 font-medium">
//                     {attendanceLow}–{attendanceHigh} fans
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center text-sm">
//                   <span className="text-neutral-400">Estimated Earnings:</span>
//                   <span className="text-green-400 font-bold">
//                     {formatINR(earningsLow)} – {formatINR(earningsHigh)}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* ── Right: Room Preview ── */}
//             <div className="flex-1 space-y-2">
//               <p className="text-neutral-300 text-sm font-medium">Room Preview</p>

//               <div className="bg-neutral-800 rounded-2xl p-4 border border-neutral-700">
//                 {/* Status Badge */}
//                 <div className="flex items-center gap-2 mb-3">
//                   <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
//                     {ROOM_MOCKUP.status}
//                   </span>
//                   <span className="text-neutral-300 text-sm">
//                     {ROOM_MOCKUP.roomType}
//                   </span>
//                 </div>

//                 {/* Title */}
//                 <h3 className="text-white font-bold text-base leading-snug mb-1">
//                   {ROOM_MOCKUP.title}
//                 </h3>

//                 {/* Tags */}
//                 <p className="text-neutral-400 text-xs mb-3">
//                   {ROOM_MOCKUP.tags.join(" • ")}
//                 </p>

//                 {/* Meta */}
//                 <div className="flex items-center gap-4 text-xs text-neutral-400 mb-4">
//                   <span className="flex items-center gap-1">
//                     <span>👥</span>
//                     <span>{maxCapacity.toLocaleString("en-IN")} max</span>
//                   </span>
//                   <span className="flex items-center gap-1">
//                     <span>🕐</span>
//                     <span>{ROOM_MOCKUP.scheduledTime}</span>
//                   </span>
//                 </div>

//                 {/* Price + CTA */}
//                 <div className="bg-neutral-900 rounded-xl p-3 space-y-3">
//                   <div className="flex justify-between items-center">
//                     <span className="text-neutral-400 text-sm">Price per Fan</span>
//                     <span className="text-white font-bold text-base">
//                       {currency}{price}
//                     </span>
//                   </div>
//                   <button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 transition-all text-white font-semibold text-sm py-2.5 rounded-xl">
//                     Subscribe &amp; Enter
//                   </button>
//                 </div>

//                 <p className="text-neutral-600 text-[10px] text-center mt-3">
//                   {ROOM_MOCKUP.discoveryNote}
//                 </p>
//               </div>
//             </div>

//           </div>
//         </div>

//         {/* ── Footer ── */}
//         <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800">
//           <button
//             onClick={onPrev}
//             className="flex items-center gap-2 text-neutral-300 text-sm border border-neutral-700 rounded-full px-4 py-2 hover:border-neutral-500 hover:text-white transition-all"
//           >
//             <span>←</span>
//             <span>Previous</span>
//           </button>
//           <button className="text-neutral-300 text-sm border border-neutral-700 rounded-full px-5 py-2 hover:border-neutral-500 hover:text-white transition-all">
//             Save Draft
//           </button>
//           <button
//             onClick={onNext}
//             className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 transition-all text-white text-sm font-semibold rounded-full px-5 py-2.5"
//           >
//             <span>Publish Room</span>
//             <span>→</span>
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// }














"use client";

import { useState } from "react";

interface CreateRoomStep4Props {
  currentStep?: number;
  onNext?: (formData: FormData) => void;
  onPrev?: () => void;
}

const STEPS = [{ id: 1, label: "Event" }, { id: 2, label: "Details" }, { id: 3, label: "Content" }, { id: 4, label: "Pricing & Review" }];
const TOTAL_STEPS = 4;

export default function CreateRoomStep4({ currentStep = 4, onNext, onPrev }: CreateRoomStep4Props) {
  const [price, setPrice] = useState(49);
  const [currency, setCurrency] = useState("₹");
  const [maxCapacity, setMaxCapacity] = useState(1000);
  const [roomTitle, setRoomTitle] = useState("");
  const [roomTags, setRoomTags] = useState<string[]>([]);
  const [scheduledTime, setScheduledTime] = useState("");

  const minPrice = 29;
  const maxPrice = 999;
  const attendanceRange = { low: 0.6, high: 0.8 };
  const attendanceLow = Math.round(maxCapacity * attendanceRange.low);
  const attendanceHigh = Math.round(maxCapacity * attendanceRange.high);
  const earningsLow = attendanceLow * price;
  const earningsHigh = attendanceHigh * price;

  const formatCurrency = (val: number) => `${currency}${val.toLocaleString("en-IN")}`;

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val)) setPrice(Math.min(maxPrice, Math.max(minPrice, val)));
  };

  const handleNext = () => {
    const formData = new FormData();
    formData.append("pricePerFan", price.toString());
    formData.append("currency", currency);
    formData.append("status", "published");
    onNext?.(formData);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
          <button onClick={onPrev} className="flex items-center gap-2 text-neutral-400 text-sm hover:text-white transition-colors"><span>←</span><span>Back</span></button>
          <h1 className="text-white font-semibold text-base">Create New Room</h1>
          <div className="flex items-center gap-3 text-neutral-400 text-sm"><span>Step {currentStep} of {TOTAL_STEPS}</span><button className="hover:text-white transition-colors text-lg leading-none">✕</button></div>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 overflow-x-auto">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex items-center flex-1 min-w-0">
              <div className="flex items-center gap-2 shrink-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step.id === currentStep ? "bg-orange-500 text-white" : step.id < currentStep ? "bg-orange-500/30 text-orange-400" : "bg-neutral-700 text-neutral-400"}`}>
                  {step.id}
                </div>
                <span className={`text-xs font-medium whitespace-nowrap ${step.id === currentStep ? "text-white" : step.id < currentStep ? "text-orange-400" : "text-neutral-500"}`}>{step.label}</span>
              </div>
              {idx < STEPS.length - 1 && <div className="flex-1 mx-3 h-px bg-neutral-700 min-w-4" />}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="p-6">
          <h2 className="text-white font-bold text-xl mb-6">{STEPS[currentStep - 1].label}</h2>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left: Pricing */}
            <div className="flex-1 space-y-4">
              <p className="text-neutral-300 text-sm font-medium">Price per Fan</p>
              <div className="bg-neutral-800 rounded-xl px-4 py-3 flex items-center gap-2 border border-neutral-700">
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="bg-transparent text-white text-xl font-semibold outline-none">
                  <option value="₹">₹ INR</option><option value="$">$ USD</option><option value="€">€ EUR</option><option value="£">£ GBP</option>
                </select>
                <input type="number" value={price} min={minPrice} max={maxPrice} onChange={handlePriceChange} className="bg-transparent text-white text-xl font-semibold w-full outline-none [appearance:textfield]" />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Recommended: {currency}{minPrice} – {currency}{maxPrice}</span>
                <span className="text-orange-400 font-medium">{maxCapacity.toLocaleString("en-IN")} max capacity</span>
              </div>
              <div className="bg-neutral-800 rounded-xl p-4 border border-green-900/40">
                <p className="text-green-400 font-semibold text-sm mb-1">Revenue Projection</p>
                <p className="text-neutral-400 text-xs mb-3">Based on your current audience reach</p>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-neutral-400">Expected Attendance: {attendanceRange.low * 100}–{attendanceRange.high * 100}%</span>
                  <span className="text-neutral-200 font-medium">{attendanceLow}–{attendanceHigh} fans</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-400">Estimated Earnings:</span>
                  <span className="text-green-400 font-bold">{formatCurrency(earningsLow)} – {formatCurrency(earningsHigh)}</span>
                </div>
              </div>
            </div>

            {/* Right: Room Preview */}
            <div className="flex-1 space-y-2">
              <p className="text-neutral-300 text-sm font-medium">Room Preview</p>
              <div className="bg-neutral-800 rounded-2xl p-4 border border-neutral-700">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">DRAFT</span>
                  <span className="text-neutral-300 text-sm">Room</span>
                </div>
                <h3 className="text-white font-bold text-base leading-snug mb-1">{roomTitle || "Room Title"}</h3>
                <p className="text-neutral-400 text-xs mb-3">{roomTags.join(" • ") || "Tags will appear here"}</p>
                <div className="flex items-center gap-4 text-xs text-neutral-400 mb-4">
                  <span>👥 {maxCapacity.toLocaleString("en-IN")} max</span>
                  <span>🕐 {scheduledTime || "Schedule TBD"}</span>
                </div>
                <div className="bg-neutral-900 rounded-xl p-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400 text-sm">Price per Fan</span>
                    <span className="text-white font-bold text-base">{currency}{price + 30}</span>
                  </div>
                  <button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold text-sm py-2.5 rounded-xl">Subscribe & Enter</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800">
          <button onClick={onPrev} className="flex items-center gap-2 text-neutral-300 text-sm border border-neutral-700 rounded-full px-4 py-2 hover:border-neutral-500 hover:text-white transition-all"><span>←</span><span>Previous</span></button>
          <button className="text-neutral-300 text-sm border border-neutral-700 rounded-full px-5 py-2 hover:border-neutral-500 hover:text-white transition-all">Save Draft</button>
          <button onClick={handleNext} className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 transition-all text-white text-sm font-semibold rounded-full px-5 py-2.5">
            <span>Publish Room</span><span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}