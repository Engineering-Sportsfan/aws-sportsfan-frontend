"use client";
import { Suspense } from "react";
import AddPlaylistsForm from "./AddPlaylistsForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PlaylistsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0d0d10]">
                <div className="max-w-3xl mx-auto px-4 py-6 pb-20">
                    <Link href="/MainModules/HomePage" className="inline-flex items-center gap-2 text-[#666] hover:text-white mb-6 transition text-sm">
                        <ArrowLeft size={16} />
                        Back
                    </Link>
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-[72px] bg-[#1a1a1e] rounded-2xl animate-pulse" />)}
                    </div>
                </div>
            </div>
        }>
            <AddPlaylistsForm />
        </Suspense>
    );
}