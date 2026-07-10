// import { render, screen } from "@testing-library/react";
// import ContinueListening from "./index";

// // Mock data from the component
// const mockData = [
//   {
//     id: 1,
//     title: "Rohit Sharma",
//     subtitle: "Captaincy Masterclass",
//     image: "https://images.unsplash.com/photo-1505842465776-3a8c9c90b0f1",
//   },
//   {
//     id: 2,
//     title: "Virat Kohli",
//     subtitle: "Chasing Legends",
//     image: "https://images.unsplash.com/photo-1546519638-68e109498ffc",
//   },
//   {
//     id: 3,
//     title: "MS Dhoni",
//     subtitle: "Finisher Stories",
//     image: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d",
//   },
// ];

// describe("ContinueListening Component", () => {
//   beforeEach(() => {
//     // Clear any previous renders
//     jest.clearAllMocks();
//   });

//   describe("Rendering", () => {
//     it("should render the component without crashing", () => {
//       render(<ContinueListening />);
//       expect(screen.getByText("Continue Listening")).toBeInTheDocument();
//     });

//     it("should render the main title with correct styling", () => {
//       render(<ContinueListening />);
//       const title = screen.getByText("Continue Listening");
//       expect(title).toBeInTheDocument();
//       expect(title).toHaveClass("text-pink-500", "text-lg", "font-semibold");
//     });

//     it("should render all mock data items", () => {
//       render(<ContinueListening />);
//       mockData.forEach((item) => {
//         expect(screen.getByText(item.title)).toBeInTheDocument();
//         expect(screen.getByText(item.subtitle)).toBeInTheDocument();
//       });
//     });
//   });

//   describe("Content Structure", () => {
//     it("should render the correct number of cards", () => {
//       render(<ContinueListening />);
//       // Each card should have a title, so count the titles
//       const titles = screen.getAllByText(/^(Rohit Sharma|Virat Kohli|MS Dhoni)$/);
//       expect(titles).toHaveLength(mockData.length);
//     });

//     it("should render play buttons for each item", () => {
//       render(<ContinueListening />);
//       // Look for the play symbol (▶) in buttons
//       const playButtons = screen.getAllByText("▶");
//       expect(playButtons).toHaveLength(mockData.length);
//     });

//     it("should not render duration badges", () => {
//       render(<ContinueListening />);
//       // The current component doesn't have duration badges
//       const durationBadges = screen.queryAllByText("2d ago");
//       expect(durationBadges).toHaveLength(0);
//     });
//   });

//   describe("Card Content", () => {
//     it("should display correct titles for each player", () => {
//       render(<ContinueListening />);
//       expect(screen.getByText("Rohit Sharma")).toBeInTheDocument();
//       expect(screen.getByText("Virat Kohli")).toBeInTheDocument();
//       expect(screen.getByText("MS Dhoni")).toBeInTheDocument();
//     });

//     it("should display correct subtitles for each player", () => {
//       render(<ContinueListening />);
//       expect(screen.getByText("Captaincy Masterclass")).toBeInTheDocument();
//       expect(screen.getByText("Chasing Legends")).toBeInTheDocument();
//       expect(screen.getByText("Finisher Stories")).toBeInTheDocument();
//     });
//   });

//   describe("Accessibility", () => {
//     it("should have proper semantic structure", () => {
//       render(<ContinueListening />);
//       // Check for heading element
//       const heading = screen.getByRole("heading", { level: 2 });
//       expect(heading).toHaveTextContent("Continue Listening");
//     });
//   });

//   describe("Styling Classes", () => {
//     it("should apply correct container classes", () => {
//       const { container } = render(<ContinueListening />);
//       const mainContainer = container.firstChild;
//       expect(mainContainer).toHaveClass("w-full");
//     });

//     it("should apply correct scroll container classes", () => {
//       const { container } = render(<ContinueListening />);
//       const scrollContainer = container.querySelector(".flex.gap-3.overflow-x-auto");
//       expect(scrollContainer).toBeInTheDocument();
//       expect(scrollContainer).toHaveClass("[scrollbar-width:none]", "pb-1");
//     });

//     it("should apply correct card styling classes", () => {
//       const { container } = render(<ContinueListening />);
//       const cards = container.querySelectorAll('[class*="bg-gradient-to-r"]');
//       expect(cards).toHaveLength(mockData.length);

//       cards.forEach((card) => {
//         expect(card).toHaveClass("rounded-xl", "flex-shrink-0", "hover:brightness-110");
//       });
//     });

//     it("should apply correct play button classes", () => {
//       const { container } = render(<ContinueListening />);
//       const playButtons = container.querySelectorAll('[class*="bg-pink-500"]');
//       expect(playButtons).toHaveLength(mockData.length);

//       playButtons.forEach((button) => {
//         expect(button).toHaveClass("rounded-full", "flex", "items-center", "justify-center");
//       });
//     });
//   });

//   describe("Data Integrity", () => {
//     it("should render items in correct order", () => {
//       render(<ContinueListening />);
//       const titles = screen.getAllByText(/^(Rohit Sharma|Virat Kohli|MS Dhoni)$/);

//       // Verify the order matches mockData
//       expect(titles[0]).toHaveTextContent("Rohit Sharma");
//       expect(titles[1]).toHaveTextContent("Virat Kohli");
//       expect(titles[2]).toHaveTextContent("MS Dhoni");
//     });

//     it("should have unique keys for each item", () => {
//       const { container } = render(<ContinueListening />);
//       const cards = container.querySelectorAll('[class*="bg-gradient-to-r"]');

//       // Check that each card has a unique key (though we can't directly test key prop)
//       // We can verify the number of cards matches data length
//       expect(cards).toHaveLength(mockData.length);
//     });
//   });
// });













// src/components/HomeComponents/ContinueListening.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

interface VideoProgress {
    videoId: string;
    title: string;
    subtitle: string;
    elapsed: number;
    durationSeconds: number;
    pct: number;
    url: string;
    pausedAt: number;
}

export default function ContinueListening() {
    const { user } = useAuth();
    const [inProgress, setInProgress] = useState<VideoProgress[]>([]);

    useEffect(() => {
        if (!user?.userId) return;

        axios
            .get(`/api/cloudinary/video-progress?userId=${user.userId}`)
            .then((res) => {
                if (res.data.success) {
                    setInProgress(res.data.progress || []);
                }
            })
            .catch((err) => console.error("[ContinueListening]", err));
    }, [user?.userId]);

    if (inProgress.length === 0) return null;

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    return (
        <div className="w-full">
            <h2 className="text-pink-500 text-lg sm:text-xl font-semibold mb-3">
                Continue Watching
            </h2>

            <div className="flex gap-3 overflow-x-auto [scrollbar-width:none] pb-1">
                {inProgress.map((item) => (
                    <Link
                        key={item.videoId}
                        href={`/MainModules/MatchesDropContent/VideoDropScreen?id=${encodeURIComponent(item.videoId)}&resume=${item.elapsed}`}
                    >
                        <div className="min-w-[280px] sm:min-w-[320px] bg-gradient-to-r from-[#1A2B3A] to-[#0f1a24] rounded-xl flex-shrink-0 hover:brightness-110 transition-all cursor-pointer overflow-hidden">

                            {/* Progress bar at top */}
                            <div className="h-[3px] bg-[#1e1e22] w-full">
                                <div
                                    className="h-full bg-[#e0185a] transition-all"
                                    style={{ width: `${item.pct}%` }}
                                />
                            </div>

                            <div className="h-[80px] sm:h-[88px] flex items-center gap-4 px-5">
                                <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center shrink-0">
                                    <span className="text-white text-xs ml-0.5">▶</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[#C9115F] font-semibold text-sm sm:text-base truncate">
                                        {item.title}
                                    </p>
                                    <p className="text-gray-400 text-xs sm:text-sm truncate">
                                        {item.subtitle}
                                    </p>
                                    <p className="text-[#555] text-[10px] mt-0.5">
                                        Resume from {formatTime(item.elapsed)} · {item.pct}% watched
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}