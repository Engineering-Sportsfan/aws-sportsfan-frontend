


import { Suspense } from 'react';
import FanBattlePage from './fantasycontent';

const Loading = () => (
    <div className="container mx-auto px-4 py-8 text-center">
        {/* <h1 className="text-3xl font-bold mb-6">Loading Form...</h1> */}
    </div>
);

export default function HomePage() {
    return (
        <Suspense fallback={<Loading />}>
            <div id="audio-drop-section" className="min-h-screen bg-black text-white flex flex-col lg:flex-row overflow-x-hidden">
                <div className="w-full overflow-x-hidden">
                    <FanBattlePage />
                </div>

            </div>
        </Suspense>
    );
}


