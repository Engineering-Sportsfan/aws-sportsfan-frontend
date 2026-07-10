"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function BackButton() {
    const router = useRouter();

    return (
        <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => {
                if (
                    typeof window !== "undefined" &&
                    window.history.length > 1
                ) {
                    // window.history.back();
                    router.push("/MainModules/ROAR")
                } else {
                    router.push("/");
                }
            }}
            aria-label="Go back"
            style={{
                position: "fixed",
                marginTop: 5,
                marginLeft: 5,
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.09)",
                border: "1px solid rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 90,
                backdropFilter: "blur(8px)",
                transition: "background 0.18s",
            }}
            onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.16)")
            }
            onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.09)")
            }
        >
            <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M15 19L8 12L15 5"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </motion.button>
    );
}