// import FullPlaylist from "@/src/components/MatchesDropComponent/DropScreen";
// import { Suspense } from "react";


// export default function MatchesDropContent() {


//     return (
//         <>
//             <Suspense fallback={<div className="min-h-screen bg-[#0d0d10]" />}>
//                 <FullPlaylist />
//             </Suspense>
//         </>
//     )
// }



import { Suspense, lazy } from "react";

// Lazy load the component
const LazyFullPlaylist = lazy(() => import("@/src/components/MatchesDropComponent/DropScreen"));

export default function MatchesDropContent() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0d0d10] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
            </div>
        }>
            <LazyFullPlaylist />
        </Suspense>
    );
}