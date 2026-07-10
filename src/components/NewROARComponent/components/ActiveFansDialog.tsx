// import { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import axios from "axios";
// import AvatarWithBadge from "./AvatarWithBadge";

// interface ActiveFan {
//   uid: string;
//   username: string;
//   avatarUrl?: string | null;
//   badge?: string | null;
// }

// interface Props {
//   roomId?: string;
//   isOpen: boolean;
//   onClose: () => void;
//   onFanProfile?: (fan: any) => void;
// }

// export default function ActiveFansDialog({ roomId, isOpen, onClose, onFanProfile }: Props) {
//   const [fans, setFans] = useState<ActiveFan[]>([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!isOpen || !roomId) return;
//     let cancelled = false;
//     setLoading(true);
//     axios
//       .get(`/api/roar/rooms/${roomId}/presence`)
//       .then((res) => {
//         if (cancelled) return;
//         if (res.data?.success) setFans(res.data.fans ?? []);
//       })
//       .catch(() => { })
//       .finally(() => { if (!cancelled) setLoading(false); });
//     return () => { cancelled = true; };
//   }, [isOpen, roomId]);

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <>
//           <motion.button
//             type="button"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-40 bg-black/70"
//             onClick={onClose}
//           />
//           <motion.div
//             initial={{ opacity: 0, y: 24 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: 24 }}
//             transition={{ duration: 0.2 }}
//             className="fixed bottom-0 inset-x-0 z-50 mx-auto w-full max-w-[420px] rounded-t-2xl border border-white/10 bg-[#1a1a1e] p-4 shadow-2xl sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-2xl"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex items-center justify-between mb-3">
//               <p className="text-white text-sm font-semibold">In this room</p>
//               <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
//                 <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
//                   <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//                 </svg>
//               </button>
//             </div>

//             <div className="max-h-[60vh] overflow-y-auto flex flex-col gap-1">
//               {loading ? (
//                 <p className="text-white/40 text-xs py-6 text-center">Loading...</p>
//               ) : fans.length === 0 ? (
//                 <p className="text-white/40 text-xs py-6 text-center">No one active right now.</p>
//               ) : (
//                 fans.map((fan) => (
//                   <button
//                     key={fan.uid}
//                     type="button"
//                     onClick={() => { onClose(); onFanProfile?.(fan); }}
//                     className="flex items-center gap-3 px-1 py-2 rounded-xl hover:bg-white/5 transition-colors text-left"
//                   >
//                     <AvatarWithBadge username={fan.username} badge={fan.badge ?? undefined} size="sm" avatarUrl={fan.avatarUrl ?? undefined} />
//                     <span className="text-white text-[13px] font-semibold truncate">{fan.username}</span>
//                   </button>
//                 ))
//               )}
//             </div>
//           </motion.div>
//         </>
//       )}
//     </AnimatePresence>
//   );
// }


import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import AvatarWithBadge from "./AvatarWithBadge";

interface ActiveFan {
    uid: string;
    username: string;
    avatarUrl?: string | null;
    badge?: string | null;
}

// interface Props {
//     roomId?: string;
//     isOpen: boolean;
//     onClose: () => void;
//     onFanProfile?: (fan: any) => void;
// }

interface Props {
    roomId?: string;
    isOpen: boolean;
    onClose: () => void;
    onFanProfile?: (fan: any) => void;
    prefetchedFans?: ActiveFan[];
    prefetchedCount?: number;
}

// export default function ActiveFansDialog({ roomId, isOpen, onClose, onFanProfile }: Props) {
export default function ActiveFansDialog({ roomId, isOpen, onClose, onFanProfile, prefetchedFans, prefetchedCount }: Props) {
    const [fans, setFans] = useState<ActiveFan[]>([]);
    const [loading, setLoading] = useState(false);

    // useEffect(() => {
    //     if (!isOpen || !roomId) return;
    //     let cancelled = false;
    //     setLoading(true);
    //     axios
    //         .get(`/api/roar/rooms/${roomId}/presence`)
    //         .then((res) => {
    //             if (cancelled) return;
    //             if (res.data?.success) setFans(res.data.fans ?? []);
    //         })
    //         .catch(() => { })
    //         .finally(() => { if (!cancelled) setLoading(false); });
    //     return () => { cancelled = true; };
    // }, [isOpen, roomId]);

    // BEFORE
    useEffect(() => {
        if (!isOpen || !roomId) return;
        let cancelled = false;
        setLoading(true);
        axios
            .get(`/api/roar/rooms/${roomId}/presence`)
            .then((res) => {
                if (cancelled) return;
                if (res.data?.success) setFans(res.data.fans ?? []);
            })
            .catch(() => { })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [isOpen, roomId]);

    // AFTER
    useEffect(() => {
        if (prefetchedFans !== undefined) {
            setFans(prefetchedFans);
            return;
        }
        if (!isOpen || !roomId) return;
        let cancelled = false;
        setLoading(true);
        axios
            .get(`/api/roar/rooms/${roomId}/presence`)
            .then((res) => {
                if (cancelled) return;
                if (res.data?.success) setFans(res.data.fans ?? []);
            })
            .catch(() => { })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [isOpen, roomId, prefetchedFans]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.button
                        type="button"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-black/70"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 24 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-0 inset-x-0 z-50 mx-auto w-full max-w-[420px] rounded-t-2xl border border-white/10 bg-[#1a1a1e] p-4 shadow-2xl sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-3">
                            {/* <p className="text-white text-sm font-semibold">In this room</p> */}
                            <p className="text-white text-sm font-semibold">
                                In this room · <span className="text-white/50 font-normal">{prefetchedCount ?? fans.length} active</span>
                            </p>
                            <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                                    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto">
                            {loading ? (
                                <p className="text-white/40 text-xs py-6 text-center">Loading...</p>
                            ) : fans.length === 0 ? (
                                <p className="text-white/40 text-xs py-6 text-center">No one active right now.</p>
                            ) : (
                                <div className="grid grid-cols-3 gap-x-2 gap-y-4">
                                    {fans.map((fan) => (
                                        <button
                                            key={fan.uid}
                                            type="button"
                                            // onClick={() => { onClose(); onFanProfile?.(fan); }}
                                            onClick={() => {
                                                onClose();
                                                onFanProfile?.({
                                                    ...fan,
                                                    authorUid: fan.uid,
                                                });
                                            }}
                                            className="flex flex-col items-center gap-1.5 px-1 py-1 rounded-xl hover:bg-white/5 transition-colors text-center"
                                        >
                                            <AvatarWithBadge username={fan.username} badge={fan.badge ?? undefined} size="md" avatarUrl={fan.avatarUrl ?? undefined} />
                                            <span className="text-white text-[9px] font-semibold w-full break-words whitespace-normal">
                                                {fan.username}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}