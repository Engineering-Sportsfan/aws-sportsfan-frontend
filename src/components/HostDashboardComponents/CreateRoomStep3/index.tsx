// "use client";

// import { useState } from "react";
// import { ArrowLeft, ArrowRight, X, Image } from "lucide-react";

// // ─── Types 

// interface CreateRoomStep3Props {
//   currentStep?: number;
//   onNext?: () => void;
//   onPrev?: () => void;
// }

// // ─── Data 

// const steps = [
//   { id: 1, label: "Event" },
//   { id: 2, label: "Details" },
//   { id: 3, label: "Content" },
//   { id: 4, label: "Pricing & Review" },
// ];

// // ─── Main Component ────────────────────────────────────────────────────────────

// export default function CreateRoomStep3({
//   currentStep = 3,
//   onNext,
//   onPrev,
// }: CreateRoomStep3Props) {
//   const [dragging, setDragging] = useState(false);

//   return (
//     <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-sans">
//       <div className="w-full max-w-6xl bg-[#111111] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">

//         {/* Title Bar */}
//         <div className="px-5 py-3 border-b border-white/10 bg-[#0d0d0d]">
//           <span className="text-white/40 text-xs font-medium tracking-widest uppercase">
//             CreateNewRoom
//           </span>
//         </div>

//         {/* Header */}
//         <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
//           <div className="flex items-center gap-3">
//             <button
//               onClick={onPrev}
//               className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors"
//             >
//               <ArrowLeft size={14} />
//               <span>Back</span>
//             </button>
//             <div className="w-px h-4 bg-white/20" />
//             <h1 className="text-white font-semibold text-lg">Create New Room</h1>
//           </div>
//           <div className="flex items-center gap-3">
//             <span className="text-white/40 text-sm">Step {currentStep} of 4</span>
//             <button className="text-white/40 hover:text-white transition-colors">
//               <X size={18} />
//             </button>
//           </div>
//         </div>

//         {/* Step Progress */}
//         <div className="px-6 py-5 border-b border-white/10">
//           <div className="flex items-center justify-between">
//             {steps.map((step, index) => {
//               const isCompleted = step.id < currentStep;
//               const isCurrent = step.id === currentStep;

//               return (
//                 <div key={step.id} className="flex items-center flex-1 last:flex-none">
//                   <div className="flex items-center gap-2 shrink-0">
//                     <div
//                       className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
//                         ${
//                           isCurrent
//                             ? "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30"
//                             : isCompleted
//                             ? "bg-white/20 text-white/70"
//                             : "bg-white/5 text-white/30 border border-white/10"
//                         }`}
//                     >
//                       {step.id}
//                     </div>
//                     <span
//                       className={`text-sm font-medium hidden sm:block
//                         ${
//                           isCurrent
//                             ? "text-white"
//                             : isCompleted
//                             ? "text-white/50"
//                             : "text-white/30"
//                         }`}
//                     >
//                       {step.label}
//                     </span>
//                   </div>

//                   {index < steps.length - 1 && (
//                     <div className="flex-1 mx-3 h-px bg-white/10 relative overflow-hidden">
//                       {isCompleted && (
//                         <div className="absolute inset-0 bg-white/30" />
//                       )}
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {/* Content Body */}
//         <div className="px-6 py-8">
//           <h2 className="text-white font-semibold text-base mb-5">
//             Content & Media
//           </h2>

//           {/* Upload Zone */}
//           <div
//             onDragOver={(e) => {
//               e.preventDefault();
//               setDragging(true);
//             }}
//             onDragLeave={() => setDragging(false)}
//             onDrop={(e) => {
//               e.preventDefault();
//               setDragging(false);
//             }}
//             className={`w-full rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center py-16 px-6 cursor-pointer
//               ${
//                 dragging
//                   ? "border-orange-500/60 bg-orange-500/5"
//                   : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
//               }`}
//           >
//             <div className="w-14 h-14 rounded-full bg-[#2a1510] flex items-center justify-center mb-5 shadow-lg">
//               <Image size={24} className="text-orange-500" />
//             </div>

//             <p className="text-white font-semibold text-base mb-2">
//               Add Content Assets
//             </p>
//             <p className="text-white/40 text-sm text-center max-w-xs mb-6 leading-relaxed">
//               Upload videos, slides, or other materials you&apos;ll share during
//               the room
//             </p>

//             <button className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors border border-white/10">
//               Browse Files
//             </button>
//           </div>
//         </div>

//         {/* Footer Actions */}
//         <div className="flex items-center justify-between px-6 py-5 border-t border-white/10 bg-[#0d0d0d]">
//           <button
//             onClick={onPrev}
//             className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/8 hover:bg-white/12 text-white text-sm font-medium transition-colors border border-white/10"
//           >
//             <ArrowLeft size={14} />
//             Previous
//           </button>

//           <button className="px-5 py-2.5 rounded-full bg-white/8 hover:bg-white/12 text-white text-sm font-medium transition-colors border border-white/10">
//             Save Draft
//           </button>

//           <button
//             onClick={onNext}
//             className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white text-sm font-semibold transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40"
//           >
//             Next: Continue
//             <ArrowRight size={14} />
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// }







"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, X, Image, Upload } from "lucide-react";

interface CreateRoomStep3Props {
  currentStep?: number;
  onNext?: (formData: FormData) => void;
  onPrev?: () => void;
}

interface Asset {
  id: string;
  type: "video" | "image" | "slide";
  file: File;
  preview: string;
  name: string;
}

const steps = [{ id: 1, label: "Event" }, { id: 2, label: "Details" }, { id: 3, label: "Content" }, { id: 4, label: "Pricing & Review" }];

export default function CreateRoomStep3({ currentStep = 3, onNext, onPrev }: CreateRoomStep3Props) {
  const [dragging, setDragging] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const newAssets: Asset[] = Array.from(files).map((file, idx) => ({
      id: `${Date.now()}-${idx}`,
      type: file.type.startsWith("video/") ? "video" : file.type.includes("pdf") ? "slide" : "image",
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));
    setAssets([...assets, ...newAssets]);
  };

  const removeAsset = (id: string) => setAssets(assets.filter((a) => a.id !== id));

  const handleNext = () => {
    const formData = new FormData();
    assets.forEach((asset) => formData.append("assets", asset.file));
    onNext?.(formData);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-6xl bg-[#111111] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="px-5 py-3 border-b border-white/10 bg-[#0d0d0d]"><span className="text-white/40 text-xs font-medium tracking-widest uppercase">CreateNewRoom</span></div>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <button onClick={onPrev} className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors"><ArrowLeft size={14} /><span>Back</span></button>
            <div className="w-px h-4 bg-white/20" /><h1 className="text-white font-semibold text-lg">Create New Room</h1>
          </div>
          <div className="flex items-center gap-3"><span className="text-white/40 text-sm">Step {currentStep} of 4</span><button className="text-white/40 hover:text-white"><X size={18} /></button></div>
        </div>

        {/* Step Progress */}
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isCompleted = step.id < currentStep;
              const isCurrent = step.id === currentStep;
              return (
                <div key={step.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex items-center gap-2 shrink-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isCurrent ? "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30" : isCompleted ? "bg-white/20 text-white/70" : "bg-white/5 text-white/30 border border-white/10"}`}>
                      {step.id}
                    </div>
                    <span className={`text-sm font-medium hidden sm:block ${isCurrent ? "text-white" : isCompleted ? "text-white/50" : "text-white/30"}`}>{step.label}</span>
                  </div>
                  {index < steps.length - 1 && <div className="flex-1 mx-3 h-px bg-white/10 relative overflow-hidden">{isCompleted && <div className="absolute inset-0 bg-white/30" />}</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        <div className="px-6 py-8">
          <h2 className="text-white font-semibold text-base mb-5">Content & Media</h2>

          {/* Upload Zone */}
          <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); handleFileSelect(e.dataTransfer.files); }} onClick={() => document.getElementById("file-input")?.click()} className={`w-full rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center py-16 px-6 cursor-pointer ${dragging ? "border-orange-500/60 bg-orange-500/5" : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"}`}>
            <div className="w-14 h-14 rounded-full bg-[#2a1510] flex items-center justify-center mb-5 shadow-lg"><Image size={24} className="text-orange-500" /></div>
            <p className="text-white font-semibold text-base mb-2">Add Content Assets</p>
            <p className="text-white/40 text-sm text-center max-w-xs mb-6 leading-relaxed">Upload videos, slides, or other materials you&apos;ll share during the room</p>
            <input id="file-input" type="file" multiple accept="video/*,image/*,.pdf,.ppt,.pptx" className="hidden" onChange={(e) => handleFileSelect(e.target.files)} />
            <button className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors border border-white/10">Browse Files</button>
          </div>

          {/* Assets List */}
          {assets.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="text-white font-semibold">Uploaded Assets ({assets.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {assets.map((asset) => (
                  <div key={asset.id} className="bg-white/5 rounded-lg p-3 relative group border border-white/10">
                    <button onClick={() => removeAsset(asset.id)} className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4 text-white" /></button>
                    {asset.type === "image" && <img src={asset.preview} alt={asset.name} className="w-full h-32 object-cover rounded-lg" />}
                    {asset.type === "video" && <video src={asset.preview} className="w-full h-32 object-cover rounded-lg" controls />}
                    {asset.type === "slide" && <div className="w-full h-32 bg-neutral-800 rounded-lg flex items-center justify-center"><Upload className="w-12 h-12 text-neutral-500" /></div>}
                    <p className="text-white text-sm mt-2 truncate">{asset.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-5 border-t border-white/10 bg-[#0d0d0d]">
          <button onClick={onPrev} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/8 hover:bg-white/12 text-white text-sm font-medium transition-colors border border-white/10"><ArrowLeft size={14} /> Previous</button>
          <button className="px-5 py-2.5 rounded-full bg-white/8 hover:bg-white/12 text-white text-sm font-medium transition-colors border border-white/10">Save Draft</button>
          <button onClick={handleNext} className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white text-sm font-semibold transition-all shadow-lg shadow-orange-500/25">
            Next: Continue <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}