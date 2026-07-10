import { Metadata } from "next";
import CircleCricketGame from "@/src/components/fantasy/CircleCricketGame";

export const metadata: Metadata = {
  title: "Circle Cricket Fantasy Game",
  description: "Play Circle Cricket - bat, chase, and experience the fast-paced cricket game.",
};

export default function CircleCricketPage() {
  return (
    <div className="rounded-[22px] border border-[rgba(42,26,10,0.95)] bg-[#05080f] p-2 sm:p-3">
      <CircleCricketGame />
    </div>
  );
}
