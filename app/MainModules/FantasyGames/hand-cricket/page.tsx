import { Metadata } from "next";
import HandCricket from "@/src/components/fantasy/HandCricket";

export const metadata: Metadata = {
  title: "Hand Cricket Fantasy Game",
  description: "Play Hand Cricket - the traditional hand-gesture cricket game with odd/even mechanics.",
};

export default function HandCricketPage() {
  return <HandCricket />;
}
