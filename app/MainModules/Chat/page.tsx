import type { Metadata } from "next";
import ChatComponent from "../../../src/components/ChatComponent";

export const metadata: Metadata = {
  title: "Chat | SportsFan360",
  description: "Connect with players and groups",
};

export default function ChatPage() {
  return (
    <main className="min-h-screen">
      <ChatComponent />
    </main>
  );
}
