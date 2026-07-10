import { Metadata } from "next";
import BookCricket from "@/src/components/fantasy/BookCricket";

export const metadata: Metadata = {
  title: "Book Cricket Fantasy Game",
  description: "Play the classic page-flip Cricket game. Tap pages to score runs based on the last digit.",
};

export default function BookCricketPage() {
  return <BookCricket />;
}
