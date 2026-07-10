// import { Suspense } from "react";
// import AudioDropCard from "@/src/components/MatchesDropComponent/AudioDrop";

// export default function AudioDropScreen() {
//     return (
//         <Suspense fallback={
//             <div className="flex justify-center items-center bg-[#0d0d10] min-h-screen">
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4" />
//                     <p className="text-gray-400">Loading audio...</p>
//                 </div>
//             </div>
//         }>
//             <section id="audio-drop-section">
//                 <AudioDropCard />
//             </section>
//         </Suspense>
//     );
// }




import { Suspense } from "react";
import AudioDropCard from "@/src/components/MatchesDropComponent/AudioDrop";

export default function AudioDropScreen() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center bg-[#0d0d10] min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4" />
                    <p className="text-gray-400">Loading audio...</p>
                </div>
            </div>
        }>
            <section id="audio-drop-section" className="w-full min-h-screen">
                <AudioDropCard />
            </section>
        </Suspense>
    );
}