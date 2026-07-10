// "use client";

// import { useState } from "react";
// import {
//   ChevronLeft,
//   ChevronRight,
//   X,
//   Upload,
//   Globe,
//   Users,
//   Clock,
//   Tag,
//   UserPlus,
// } from "lucide-react";

// // ─── Types 

// interface CreateRoomStep2Props {
//   currentStep?: number;
//   onNext?: () => void;
//   onPrev?: () => void;
// }

// // ─── Data ──────────────────────────────────────────────────────────────────────

// const STEPS = ["Event", "Details", "Content", "Pricing & Review"];

// // ─── Main Component ────────────────────────────────────────────────────────────

// export default function CreateRoomStep2({
//   currentStep = 2,
//   onNext,
//   onPrev,
// }: CreateRoomStep2Props) {
//   const [title, setTitle] = useState(
//     "Gopichand's Tactical Breakdown – India vs Denmark"
//   );
//   const [description, setDescription] = useState("");
//   const [tags, setTags] = useState<string[]>([
//     "Expert Analysis",
//     "Celebrity",
//     "Fan Energy",
//     "Tactical",
//     "Multilingual",
//   ]);
//   const [moderator, setModerator] = useState("");

//   const removeTag = (tag: string) =>
//     setTags((prev) => prev.filter((t) => t !== tag));

//   return (
//     <div className="min-h-screen bg-neutral-950 flex items-start justify-center px-4 py-6">
//       <div className="w-full max-w-6xl">

//         {/* Header */}
//         <div className="flex items-center justify-between mb-6">
//           <button
//             onClick={onPrev}
//             className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors text-sm font-medium"
//           >
//             <ChevronLeft className="w-4 h-4" />
//             Back
//           </button>
//           <h1 className="text-white text-base font-semibold tracking-tight">
//             Create New Room
//           </h1>
//           <div className="flex items-center gap-2">
//             <span className="text-neutral-400 text-sm">
//               Step {currentStep} of 4
//             </span>
//             <button className="text-neutral-400 hover:text-white transition-colors">
//               <X className="w-4 h-4" />
//             </button>
//           </div>
//         </div>

//         {/* Step Indicator */}
//         <div className="flex items-center mb-8 gap-0">
//           {STEPS.map((step, idx) => {
//             const stepNum = idx + 1;
//             const isCompleted = stepNum < currentStep;
//             const isActive = stepNum === currentStep;
//             const isLast = idx === STEPS.length - 1;

//             return (
//               <div key={step} className="flex items-center flex-1 last:flex-none">
//                 <div className="flex items-center gap-2 flex-shrink-0">
//                   <div
//                     className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all
//                       ${
//                         isActive
//                           ? "bg-orange-500 text-white"
//                           : isCompleted
//                           ? "bg-orange-500/30 text-orange-400"
//                           : "bg-neutral-800 text-neutral-500"
//                       }`}
//                   >
//                     {stepNum}
//                   </div>
//                   <span
//                     className={`text-xs font-medium whitespace-nowrap
//                       ${
//                         isActive
//                           ? "text-white"
//                           : isCompleted
//                           ? "text-orange-400"
//                           : "text-neutral-500"
//                       }`}
//                   >
//                     {step}
//                   </span>
//                 </div>
//                 {!isLast && (
//                   <div className="flex-1 h-px mx-3 bg-neutral-800" />
//                 )}
//               </div>
//             );
//           })}
//         </div>

//         {/* Card */}
//         <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 space-y-6">
//           <h2 className="text-white text-base font-semibold">Room Details</h2>

//           {/* Room Title */}
//           <div className="space-y-2">
//             <label className="text-white text-sm font-medium">
//               Room Title <span className="text-orange-500">*</span>
//             </label>
//             <input
//               type="text"
//               value={title}
//               onChange={(e) => setTitle(e.target.value.slice(0, 60))}
//               className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
//               placeholder="Enter room title..."
//               maxLength={60}
//             />
//             <p className="text-neutral-500 text-xs">{title.length} / 60 characters</p>
//           </div>

//           {/* Description */}
//           <div className="space-y-2">
//             <label className="text-white text-sm font-medium">Description</label>
//             <textarea
//               rows={4}
//               value={description}
//               onChange={(e) => setDescription(e.target.value.slice(0, 200))}
//               placeholder="Describe what fans can expect from this room..."
//               className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
//               maxLength={200}
//             />
//             <p className="text-neutral-500 text-xs">
//               {description.length} / 200 characters
//             </p>
//           </div>

//           {/* Thumbnail */}
//           <div className="space-y-2">
//             <label className="text-white text-sm font-medium">Thumbnail</label>
//             <div className="border-2 border-dashed border-neutral-700 rounded-xl flex flex-col items-center justify-center py-10 gap-3 cursor-pointer hover:border-orange-500 transition-colors group">
//               <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
//                 <Upload className="w-5 h-5 text-orange-500" />
//               </div>
//               <span className="text-white text-sm font-medium">Upload Image</span>
//               <span className="text-neutral-500 text-xs">
//                 PNG, JPG up to 5MB • Recommended: 1920×1080
//               </span>
//             </div>
//           </div>

//           {/* Capacity + Primary Language */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <label className="flex items-center gap-1.5 text-white text-sm font-medium">
//                 <Users className="w-4 h-4 text-neutral-400" />
//                 Capacity
//               </label>
//               <div className="relative">
//                 <select className="w-full appearance-none bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-neutral-400 text-sm focus:outline-none focus:border-orange-500 transition-colors cursor-pointer">
//                   <option value="">Select capacity</option>
//                   <option>50</option>
//                   <option>100</option>
//                   <option>500</option>
//                   <option>Unlimited</option>
//                 </select>
//                 <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
//                   <svg
//                     className="w-4 h-4 text-neutral-500"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M19 9l-7 7-7-7"
//                     />
//                   </svg>
//                 </div>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <label className="flex items-center gap-1.5 text-white text-sm font-medium">
//                 <Globe className="w-4 h-4 text-neutral-400" />
//                 Primary Language
//               </label>
//               <div className="relative">
//                 <select className="w-full appearance-none bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-neutral-400 text-sm focus:outline-none focus:border-orange-500 transition-colors cursor-pointer">
//                   <option value="">Select language</option>
//                   <option>English</option>
//                   <option>Hindi</option>
//                   <option>Tamil</option>
//                   <option>Telugu</option>
//                 </select>
//                 <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
//                   <svg
//                     className="w-4 h-4 text-neutral-500"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M19 9l-7 7-7-7"
//                     />
//                   </svg>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Category Tags */}
//           <div className="space-y-2">
//             <label className="flex items-center gap-1.5 text-white text-sm font-medium">
//               <Tag className="w-4 h-4 text-neutral-400" />
//               Category Tags
//             </label>
//             <div className="flex flex-wrap gap-2">
//               {tags.map((tag) => (
//                 <span
//                   key={tag}
//                   className="flex items-center gap-1.5 bg-neutral-800 border border-neutral-700 text-white text-xs font-medium px-3 py-1.5 rounded-full"
//                 >
//                   {tag}
//                   <button
//                     onClick={() => removeTag(tag)}
//                     className="text-neutral-400 hover:text-white transition-colors"
//                   >
//                     <X className="w-3 h-3" />
//                   </button>
//                 </span>
//               ))}
//               <button className="flex items-center gap-1 bg-transparent border border-dashed border-neutral-600 text-neutral-400 hover:text-white hover:border-neutral-400 text-xs font-medium px-3 py-1.5 rounded-full transition-colors">
//                 + Add Tag
//               </button>
//             </div>
//           </div>

//           {/* Schedule */}
//           <div className="space-y-2">
//             <label className="flex items-center gap-1.5 text-white text-sm font-medium">
//               <Clock className="w-4 h-4 text-neutral-400" />
//               Schedule
//             </label>
//             <input
//               type="text"
//               defaultValue="Today – 6:30 PM IST"
//               className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
//             />
//             <p className="text-orange-500 text-xs">
//               Fans are notified 15 min before start
//             </p>
//           </div>

//           {/* Moderators */}
//           <div className="space-y-2">
//             <label className="flex items-center gap-1.5 text-white text-sm font-medium">
//               <UserPlus className="w-4 h-4 text-neutral-400" />
//               Moderators (opt-in)
//             </label>
//             <input
//               type="text"
//               value={moderator}
//               onChange={(e) => setModerator(e.target.value)}
//               placeholder="Search fan by username..."
//               className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
//             />
//           </div>
//         </div>

//         {/* Footer Buttons */}
//         <div className="flex items-center justify-between mt-6 gap-3">
//           <button
//             onClick={onPrev}
//             className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors text-sm font-medium px-4 py-2.5 rounded-xl border border-neutral-800 hover:border-neutral-600"
//           >
//             <ChevronLeft className="w-4 h-4" />
//             Previous
//           </button>

//           <div className="flex items-center gap-3">
//             <button className="px-5 py-2.5 rounded-xl border border-neutral-700 text-white text-sm font-medium hover:bg-neutral-800 transition-colors">
//               Save Draft
//             </button>
//             <button
//               onClick={onNext}
//               className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors"
//             >
//               Next: Continue
//               <ChevronRight className="w-4 h-4" />
//             </button>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }







"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X, Upload, Globe, Users, Clock, Tag, UserPlus } from "lucide-react";

interface CreateRoomStep2Props {
  currentStep?: number;
  onNext?: (formData: FormData) => void;
  onPrev?: () => void;
}

const STEPS = ["Event", "Details", "Content", "Pricing & Review"];

export default function CreateRoomStep2({ currentStep = 2, onNext, onPrev }: CreateRoomStep2Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState("");
  const [primaryLanguage, setPrimaryLanguage] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [moderators, setModerators] = useState<string[]>([]);
  const [newModerator, setNewModerator] = useState("");
  const [schedule, setSchedule] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const addModerator = () => {
    if (newModerator && !moderators.includes(newModerator)) {
      setModerators([...moderators, newModerator]);
      setNewModerator("");
    }
  };

  const removeModerator = (mod: string) => setModerators(moderators.filter((m) => m !== mod));

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleNext = () => {
    if (!title) {
      alert("Please enter a room title");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("capacity", capacity);
    formData.append("primaryLanguage", primaryLanguage);
    formData.append("tags", JSON.stringify(tags));
    formData.append("moderators", JSON.stringify(moderators));
    formData.append("schedule", schedule);
    if (thumbnail) formData.append("thumbnail", thumbnail);

    onNext?.(formData);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-start justify-center px-4 py-6">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={onPrev} className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors text-sm font-medium">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-white text-base font-semibold tracking-tight">Create New Room</h1>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 text-sm">Step {currentStep} of 4</span>
            <button className="text-neutral-400 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center mb-8 gap-0">
          {STEPS.map((step, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isActive = stepNum === currentStep;
            const isLast = idx === STEPS.length - 1;
            return (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isActive ? "bg-orange-500 text-white" : isCompleted ? "bg-orange-500/30 text-orange-400" : "bg-neutral-800 text-neutral-500"}`}>
                    {stepNum}
                  </div>
                  <span className={`text-xs font-medium whitespace-nowrap ${isActive ? "text-white" : isCompleted ? "text-orange-400" : "text-neutral-500"}`}>{step}</span>
                </div>
                {!isLast && <div className="flex-1 h-px mx-3 bg-neutral-800" />}
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 space-y-6">
          <h2 className="text-white text-base font-semibold">Room Details</h2>

          {/* Room Title */}
          <div className="space-y-2">
            <label className="text-white text-sm font-medium">Room Title <span className="text-orange-500">*</span></label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value.slice(0, 60))} className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-orange-500" placeholder="Enter room title..." maxLength={60} />
            <p className="text-neutral-500 text-xs">{title.length} / 60 characters</p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-white text-sm font-medium">Description</label>
            <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value.slice(0, 200))} placeholder="Describe what fans can expect from this room..." className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 resize-none" maxLength={200} />
            <p className="text-neutral-500 text-xs">{description.length} / 200 characters</p>
          </div>

          {/* Thumbnail */}
          <div className="space-y-2">
            <label className="text-white text-sm font-medium">Thumbnail</label>
            {thumbnailPreview && <img src={thumbnailPreview} alt="Preview" className="w-32 h-32 rounded-lg object-cover mb-2" />}
            <input type="file" accept="image/*" onChange={handleThumbnailChange} className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white text-sm file:mr-2 file:py-1 file:px-3 file:rounded file:bg-orange-500 file:text-white file:border-0" />
            <p className="text-neutral-500 text-xs">PNG, JPG up to 5MB • Recommended: 1920×1080</p>
          </div>

          {/* Capacity + Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-white text-sm font-medium"><Users className="w-4 h-4 text-neutral-400" /> Capacity</label>
              <select value={capacity} onChange={(e) => setCapacity(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500">
                <option value="">Select capacity</option>
                <option value="50">50</option><option value="100">100</option><option value="500">500</option><option value="1000">1000</option><option value="5000">5000</option><option value="unlimited">Unlimited</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-white text-sm font-medium"><Globe className="w-4 h-4 text-neutral-400" /> Primary Language</label>
              <select value={primaryLanguage} onChange={(e) => setPrimaryLanguage(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500">
                <option value="">Select language</option>
                <option value="English">English</option><option value="Hindi">Hindi</option><option value="Tamil">Tamil</option><option value="Telugu">Telugu</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-white text-sm font-medium"><Tag className="w-4 h-4 text-neutral-400" /> Category Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1.5 bg-neutral-800 border border-neutral-700 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                  {tag}<button onClick={() => removeTag(tag)} className="text-neutral-400 hover:text-white"><X className="w-3 h-3" /></button>
                </span>
              ))}
              <div className="flex gap-2">
                <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyPress={(e) => e.key === "Enter" && addTag()} placeholder="Add tag..." className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-1.5 text-white text-sm" />
                <button onClick={addTag} className="px-3 py-1.5 bg-neutral-700 rounded-lg text-white text-sm">Add</button>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-white text-sm font-medium"><Clock className="w-4 h-4 text-neutral-400" /> Schedule</label>
            <input type="datetime-local" value={schedule} onChange={(e) => setSchedule(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500" />
            <p className="text-orange-500 text-xs">Fans are notified 15 min before start</p>
          </div>

          {/* Moderators */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-white text-sm font-medium"><UserPlus className="w-4 h-4 text-neutral-400" /> Moderators (opt-in)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {moderators.map((mod) => (
                <span key={mod} className="flex items-center gap-1.5 bg-neutral-800 border border-neutral-700 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                  {mod}<button onClick={() => removeModerator(mod)} className="text-neutral-400 hover:text-white"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={newModerator} onChange={(e) => setNewModerator(e.target.value)} onKeyPress={(e) => e.key === "Enter" && addModerator()} placeholder="Search fan by username..." className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm" />
              <button onClick={addModerator} className="px-4 py-2 bg-neutral-700 rounded-lg text-white text-sm">Add</button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-6 gap-3">
          <button onClick={onPrev} className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors text-sm font-medium px-4 py-2.5 rounded-xl border border-neutral-800 hover:border-neutral-600">
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 rounded-xl border border-neutral-700 text-white text-sm font-medium hover:bg-neutral-800 transition-colors">Save Draft</button>
            <button onClick={handleNext} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors">
              Next: Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}