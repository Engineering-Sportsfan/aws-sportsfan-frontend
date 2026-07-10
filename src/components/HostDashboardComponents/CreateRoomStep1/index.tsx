// "use client";

// import Link from "next/link";
// import { useState } from "react";

// // ─── Types 

// interface CreateRoomStep1Props {
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

// const SELECTED_EVENT = {
//   id: "bwf-2026-india-denmark",
//   name: "BWF World Tour Finals - India vs Denmark - Glasgow 2026",
//   status: "selected",
// };

// const ROOM_TYPES = [
//   {
//     id: "open",
//     label: "Open Room",
//     description: "Free for all fans",
//     badge: "FREE",
//     badgeColor: "bg-green-500",
//     badgeTextColor: "text-white",
//     borderSelected: "border-orange-500",
//     bgSelected: "bg-[#2a1a0a]",
//     radioAccent: "border-orange-500",
//     radioDot: "bg-orange-500",
//   },
//   {
//     id: "inner",
//     label: "Inner Room",
//     description: "Subscription required",
//     badge: "PREMIUM",
//     badgeColor: "bg-orange-500",
//     badgeTextColor: "text-white",
//     borderSelected: "border-orange-500",
//     bgSelected: "bg-[#2a1a0a]",
//     radioAccent: "border-orange-500",
//     radioDot: "bg-orange-500",
//   },
//   {
//     id: "moment",
//     label: "Moment Room",
//     description: "Time-bound exclusive",
//     badge: "LIMITED",
//     badgeColor: "bg-pink-500",
//     badgeTextColor: "text-white",
//     borderSelected: "border-orange-500",
//     bgSelected: "bg-[#2a1a0a]",
//     radioAccent: "border-orange-500",
//     radioDot: "bg-orange-500",
//   },
//   {
//     id: "reflection",
//     label: "Reflection Room",
//     description: "Post-event analysis",
//     badge: "ARCHIVE",
//     badgeColor: "bg-zinc-600",
//     badgeTextColor: "text-white",
//     borderSelected: "border-orange-500",
//     bgSelected: "bg-[#2a1a0a]",
//     radioAccent: "border-orange-500",
//     radioDot: "bg-orange-500",
//   },
// ];

// // ─── Step Indicator ────────────────────────────────────────────────────────────

// function StepIndicator({
//   steps,
//   currentStep,
// }: {
//   steps: typeof STEPS;
//   currentStep: number;
// }) {
//   return (
//     <div className="flex items-center w-full">
//       {steps.map((step, idx) => {
//         const isActive = step.id === currentStep;
//         const isCompleted = step.id < currentStep;
//         const isLast = idx === steps.length - 1;

//         return (
//           <div key={step.id} className="flex items-center flex-1 min-w-0">
//             <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
//               <div
//                 className={[
//                   "w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0",
//                   isActive
//                     ? "bg-orange-500 text-white"
//                     : isCompleted
//                     ? "bg-zinc-600 text-white"
//                     : "bg-zinc-700 text-zinc-400",
//                 ].join(" ")}
//               >
//                 {step.id}
//               </div>
//               <span
//                 className={[
//                   "text-[11px] sm:text-sm font-medium whitespace-nowrap",
//                   isActive ? "text-white" : "text-zinc-500",
//                   isActive ? "inline" : "hidden sm:inline",
//                 ].join(" ")}
//               >
//                 {step.label}
//               </span>
//             </div>

//             {!isLast && (
//               <div className="flex-1 mx-1.5 sm:mx-3">
//                 <div className="h-px bg-zinc-700 w-full" />
//               </div>
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// // ─── Room Type Card ────────────────────────────────────────────────────────────

// interface RoomTypeCardProps {
//   room: (typeof ROOM_TYPES)[number];
//   selected: boolean;
//   onSelect: () => void;
// }

// function RoomTypeCard({ room, selected, onSelect }: RoomTypeCardProps) {
//   return (
//     <button
//       type="button"
//       onClick={onSelect}
//       className={[
//         "flex items-start justify-between p-3 sm:p-4 rounded-xl border text-left transition-all duration-150 w-full cursor-pointer",
//         selected
//           ? `${room.borderSelected} ${room.bgSelected}`
//           : "border-zinc-700 bg-zinc-800/60 hover:border-zinc-500",
//       ].join(" ")}
//     >
//       <div className="flex items-start gap-2 sm:gap-3 min-w-0">
//         <div
//           className={[
//             "mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
//             selected ? room.radioAccent : "border-zinc-500",
//           ].join(" ")}
//         >
//           {selected && (
//             <div className={`w-2 h-2 rounded-full ${room.radioDot}`} />
//           )}
//         </div>

//         <div className="min-w-0">
//           <p className="text-white font-semibold text-xs sm:text-sm leading-tight">
//             {room.label}
//           </p>
//           <p className="text-zinc-400 text-[10px] sm:text-xs mt-0.5 leading-tight">
//             {room.description}
//           </p>
//         </div>
//       </div>

//       <span
//         className={[
//           "text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 ml-1.5 sm:ml-2 mt-0.5",
//           room.badgeColor,
//           room.badgeTextColor,
//         ].join(" ")}
//       >
//         {room.badge}
//       </span>
//     </button>
//   );
// }

// // ─── Main Component ────────────────────────────────────────────────────────────

// export default function CreateRoomStep1({
//   currentStep = 1,
//   onNext,
//   onPrev,
// }: CreateRoomStep1Props) {
//   const totalSteps = STEPS.length;
//   const [selectedRoomType, setSelectedRoomType] = useState<string>("open");

//   return (
//     <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-3 sm:p-6">
//       <div className="w-full max-w-6xl bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800">

//         {/* ── Header ── */}
//         <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-800 gap-2">
//           <div className="flex items-center gap-2 sm:gap-3 min-w-0">
//             <Link
//               href="/MainModules/HostDashboard"
//               className="flex items-center gap-1 sm:gap-1.5 text-zinc-400 hover:text-white text-xs sm:text-sm transition-colors shrink-0"
//             >
//               <span>←</span>
//               <span>Back</span>
//             </Link>
//             <div className="w-px h-4 sm:h-5 bg-zinc-700 shrink-0" />
//             <h2 className="text-white font-semibold text-sm sm:text-base truncate">
//               Create New Room
//             </h2>
//           </div>

//           <div className="flex items-center gap-2 sm:gap-3 shrink-0">
//             <span className="text-zinc-400 text-xs sm:text-sm whitespace-nowrap">
//               Step {currentStep} of {totalSteps}
//             </span>
//             <button
//               type="button"
//               className="text-zinc-400 hover:text-white text-base sm:text-lg leading-none transition-colors"
//             >
//               ✕
//             </button>
//           </div>
//         </div>

//         {/* ── Step Indicator ── */}
//         <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-zinc-800">
//           <StepIndicator steps={STEPS} currentStep={currentStep} />
//         </div>

//         {/* ── Body ── */}
//         <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6">

//           {/* Select Event */}
//           <div>
//             <h3 className="text-white font-semibold text-sm sm:text-base mb-1">
//               Select Event
//             </h3>
//             <p className="text-zinc-400 text-xs sm:text-sm mb-3">
//               Choose the sporting event this room will be about
//             </p>

//             <div className="flex items-center justify-between bg-zinc-800 border border-zinc-700 rounded-xl px-3 sm:px-4 py-3 gap-3">
//               <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
//                 <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-500 shrink-0" />
//                 <div className="min-w-0">
//                   <p className="text-white text-xs sm:text-sm font-medium leading-snug line-clamp-2 sm:line-clamp-none">
//                     {SELECTED_EVENT.name}
//                   </p>
//                   <p className="text-green-500 text-[10px] sm:text-xs mt-0.5 flex items-center gap-1">
//                     <span>✓</span>
//                     <span>Event Selected</span>
//                   </p>
//                 </div>
//               </div>
//               <button
//                 type="button"
//                 className="text-orange-400 hover:text-orange-300 text-xs sm:text-sm font-medium transition-colors shrink-0"
//               >
//                 Change
//               </button>
//             </div>
//           </div>

//           {/* Room Type */}
//           <div>
//             <h3 className="text-white font-semibold text-xs sm:text-sm mb-3">
//               Room Type
//             </h3>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
//               {ROOM_TYPES.map((room) => (
//                 <RoomTypeCard
//                   key={room.id}
//                   room={room}
//                   selected={selectedRoomType === room.id}
//                   onSelect={() => setSelectedRoomType(room.id)}
//                 />
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* ── Footer ── */}
//         <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-t border-zinc-800 gap-2">
//           <button
//             type="button"
//             onClick={onPrev}
//             className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white text-xs sm:text-sm font-medium hover:bg-zinc-700 transition-colors"
//           >
//             <span>←</span>
//             <span>Previous</span>
//           </button>

//           <button
//             type="button"
//             className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white text-xs sm:text-sm font-medium hover:bg-zinc-700 transition-colors"
//           >
//             Save Draft
//           </button>

//           <button
//             type="button"
//             onClick={onNext}
//             className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap"
//           >
//             <span>Next: Continue</span>
//             <span>→</span>
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// }









"use client";

import Link from "next/link";
import { useState } from "react";
import axios from "axios";

// ─── Types 
interface CreateRoomStep1Props {
  currentStep?: number;
  onNext?: (data: { eventId?: string; eventName: string; roomType: string }) => void;
  onPrev?: () => void;
}

const STEPS = [
  { id: 1, label: "Event" },
  { id: 2, label: "Details" },
  { id: 3, label: "Content" },
  { id: 4, label: "Pricing & Review" },
];

const ROOM_TYPES = [
  {
    id: "open",
    label: "Open Room",
    description: "Free for all fans",
    badge: "FREE",
    badgeColor: "bg-green-500",
    badgeTextColor: "text-white",
    borderSelected: "border-orange-500",
    bgSelected: "bg-[#2a1a0a]",
    radioAccent: "border-orange-500",
    radioDot: "bg-orange-500",
  },
  {
    id: "inner",
    label: "Inner Room",
    description: "Subscription required",
    badge: "PREMIUM",
    badgeColor: "bg-orange-500",
    badgeTextColor: "text-white",
    borderSelected: "border-orange-500",
    bgSelected: "bg-[#2a1a0a]",
    radioAccent: "border-orange-500",
    radioDot: "bg-orange-500",
  },
  {
    id: "moment",
    label: "Moment Room",
    description: "Time-bound exclusive",
    badge: "LIMITED",
    badgeColor: "bg-pink-500",
    badgeTextColor: "text-white",
    borderSelected: "border-orange-500",
    bgSelected: "bg-[#2a1a0a]",
    radioAccent: "border-orange-500",
    radioDot: "bg-orange-500",
  },
  {
    id: "reflection",
    label: "Reflection Room",
    description: "Post-event analysis",
    badge: "ARCHIVE",
    badgeColor: "bg-zinc-600",
    badgeTextColor: "text-white",
    borderSelected: "border-orange-500",
    bgSelected: "bg-[#2a1a0a]",
    radioAccent: "border-orange-500",
    radioDot: "bg-orange-500",
  },
];

function StepIndicator({ steps, currentStep }: { steps: typeof STEPS; currentStep: number }) {
  return (
    <div className="flex items-center w-full">
      {steps.map((step, idx) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;
        const isLast = idx === steps.length - 1;

        return (
          <div key={step.id} className="flex items-center flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <div
                className={[
                  "w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0",
                  isActive ? "bg-orange-500 text-white" : isCompleted ? "bg-zinc-600 text-white" : "bg-zinc-700 text-zinc-400",
                ].join(" ")}
              >
                {step.id}
              </div>
              <span
                className={[
                  "text-[11px] sm:text-sm font-medium whitespace-nowrap",
                  isActive ? "text-white" : "text-zinc-500",
                  isActive ? "inline" : "hidden sm:inline",
                ].join(" ")}
              >
                {step.label}
              </span>
            </div>
            {!isLast && <div className="flex-1 mx-1.5 sm:mx-3"><div className="h-px bg-zinc-700 w-full" /></div>}
          </div>
        );
      })}
    </div>
  );
}

interface RoomTypeCardProps {
  room: typeof ROOM_TYPES[number];
  selected: boolean;
  onSelect: () => void;
}

function RoomTypeCard({ room, selected, onSelect }: RoomTypeCardProps) {
  return (
    <button type="button" onClick={onSelect}
      className={[
        "flex items-start justify-between p-3 sm:p-4 rounded-xl border text-left transition-all duration-150 w-full cursor-pointer",
        selected ? `${room.borderSelected} ${room.bgSelected}` : "border-zinc-700 bg-zinc-800/60 hover:border-zinc-500",
      ].join(" ")}
    >
      <div className="flex items-start gap-2 sm:gap-3 min-w-0">
        <div className={["mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0", selected ? room.radioAccent : "border-zinc-500"].join(" ")}>
          {selected && <div className={`w-2 h-2 rounded-full ${room.radioDot}`} />}
        </div>
        <div className="min-w-0">
          <p className="text-white font-semibold text-xs sm:text-sm leading-tight">{room.label}</p>
          <p className="text-zinc-400 text-[10px] sm:text-xs mt-0.5 leading-tight">{room.description}</p>
        </div>
      </div>
      <span className={["text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 ml-1.5 sm:ml-2 mt-0.5", room.badgeColor, room.badgeTextColor].join(" ")}>
        {room.badge}
      </span>
    </button>
  );
}

export default function CreateRoomStep1({ currentStep = 1, onNext, onPrev }: CreateRoomStep1Props) {
  const totalSteps = STEPS.length;
  const [selectedRoomType, setSelectedRoomType] = useState<string>("open");
  const [eventName, setEventName] = useState<string>("");
  const [eventSport, setEventSport] = useState<string>("");
  const [eventDate, setEventDate] = useState<string>("");
  const [isCreatingEvent, setIsCreatingEvent] = useState<boolean>(false);

  const handleNext = async () => {
    if (!eventName.trim()) {
      alert("Please enter an event name");
      return;
    }

    let eventId = undefined;
    
    // If user wants to create a new event in the system
    if (isCreatingEvent) {
      try {
        const response = await axios.post("/api/events", {
          name: eventName,
          sport: eventSport || "General",
          scheduledAt: eventDate || new Date().toISOString(),
          status: "upcoming",
        });
        
        if (response.data?.success) {
          eventId = response.data.id;
        }
      } catch (error) {
        console.error("Failed to create event:", error);
        // Continue even if event creation fails - we still have the name
      }
    }
    
    onNext?.({
       eventId: `event_${Date.now()}`,// Will be undefined if not created or creation failed
      eventName: eventName.trim(),
      roomType: selectedRoomType,
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-6xl bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-800 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link href="/MainModules/HostDashboard" className="flex items-center gap-1 sm:gap-1.5 text-zinc-400 hover:text-white text-xs sm:text-sm transition-colors shrink-0">
              <span>←</span><span>Back</span>
            </Link>
            <div className="w-px h-4 sm:h-5 bg-zinc-700 shrink-0" />
            <h2 className="text-white font-semibold text-sm sm:text-base truncate">Create New Room</h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="text-zinc-400 text-xs sm:text-sm whitespace-nowrap">Step {currentStep} of {totalSteps}</span>
            <button type="button" className="text-zinc-400 hover:text-white text-base sm:text-lg leading-none transition-colors">✕</button>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-zinc-800">
          <StepIndicator steps={STEPS} currentStep={currentStep} />
        </div>

        {/* Body */}
        <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6">
          {/* Create Event - Simple Input */}
          <div>
            <h3 className="text-white font-semibold text-sm sm:text-base mb-1">Event Name</h3>
            <p className="text-zinc-400 text-xs sm:text-sm mb-3">Enter the name of the sporting event for this room</p>

            <input
              type="text"
              placeholder="e.g., BWF World Tour Finals 2026, IPL Final, FIFA World Cup..."
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500"
            />
            
            {eventName && (
              <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                <p className="text-orange-400 text-sm font-medium">✓ Event: {eventName}</p>
              </div>
            )}
          </div>

          {/* Optional: Advanced Event Creation (Collapsible) */}
          <div>
            <button
              type="button"
              onClick={() => setIsCreatingEvent(!isCreatingEvent)}
              className="text-orange-400 text-sm font-medium hover:text-orange-300 transition-colors flex items-center gap-1"
            >
              {isCreatingEvent ? "▼" : "▶"} {isCreatingEvent ? "Hide" : "Show"} Advanced Options
            </button>
            
            {isCreatingEvent && (
              <div className="mt-3 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700 space-y-3">
                <p className="text-zinc-400 text-xs mb-2">Create this event in the system for future use</p>
                
                <div>
                  <label className="text-white text-xs font-medium mb-1 block">Sport Category</label>
                  <select
                    value={eventSport}
                    onChange={(e) => setEventSport(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                  >
                    <option value="">Select sport</option>
                    <option value="Badminton">Badminton</option>
                    <option value="Cricket">Cricket</option>
                    <option value="Football">Football</option>
                    <option value="Tennis">Tennis</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-white text-xs font-medium mb-1 block">Event Date (Optional)</label>
                  <input
                    type="datetime-local"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Room Type */}
          <div>
            <h3 className="text-white font-semibold text-xs sm:text-sm mb-3">Room Type</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {ROOM_TYPES.map((room) => (
                <RoomTypeCard key={room.id} room={room} selected={selectedRoomType === room.id} onSelect={() => setSelectedRoomType(room.id)} />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-t border-zinc-800 gap-2">
          <button type="button" onClick={onPrev} className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white text-xs sm:text-sm font-medium hover:bg-zinc-700 transition-colors">
            <span>←</span><span>Previous</span>
          </button>
          <button type="button" className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white text-xs sm:text-sm font-medium hover:bg-zinc-700 transition-colors">
            Save Draft
          </button>
          <button type="button" onClick={handleNext} className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap">
            <span>Next: Continue</span><span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}