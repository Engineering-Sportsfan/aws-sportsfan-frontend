import VideoDropCard from "@/src/components/MatchesDropComponent/VideoDrop";
import { Suspense } from "react";


export default function VideoDropScreen() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center bg-[#0d0d10] min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4" />
                    <p className="text-gray-400">Loading video...</p>
                </div>
            </div>
        }>
            <section id="video-drop-section">
                <VideoDropCard />
            </section>
        </Suspense>
    );
}