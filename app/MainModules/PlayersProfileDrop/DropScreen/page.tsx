
import { Suspense } from 'react';
import DropScreenPageComponent from "@/src/components/PlayersDropScreenComponent/index";

const Loading = () => (
    <div className="container mx-auto px-4 py-8 text-center">
        {/* <h1 className="text-3xl font-bold mb-6">Loading Form...</h1> */}
    </div>
);

export default function DropScreenPage() {
    return (
        <Suspense fallback={<Loading />}>
            <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row overflow-x-hidden">
                <div className="w-full overflow-x-hidden">
                 <DropScreenPageComponent />

                </div>

            </div>
        </Suspense>
    );
}


