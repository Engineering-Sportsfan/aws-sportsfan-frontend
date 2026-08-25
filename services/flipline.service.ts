import axios from "axios";
import type { FlipCard } from "@/src/components/CreatePost-Component/CreatePostDialog";

export const fliplineService = {
  /** Fetch all FlipLine cards */
  fetchFlipCards: async (): Promise<FlipCard[]> => {
    const res = await axios.get<{ success: boolean; data: FlipCard[] }>("/api/flipline");
    return res.data.data;
  },

  /** Create a new FlipLine card (includes file upload support) */
  createFlipCard: async (
    card: Omit<FlipCard, "id" | "timeMs">,
    imageFile: File | null,
    videoFile: File | null
  ): Promise<FlipCard> => {
    const formData = new FormData();
    formData.append("content", card.content);
    formData.append("sport", card.sport);
    formData.append("type", card.type);
    formData.append("author", card.author);
    if (card.handle) formData.append("handle", card.handle);
    formData.append("source", card.source);
    formData.append("likes", String(card.likes || 0));
    formData.append("isKey", String(card.isKey || false));
    if (card.emoji) formData.append("emoji", card.emoji);
    if (card.fomoMsg) formData.append("fomoMsg", card.fomoMsg);
    formData.append("fomoCount", String(card.fomoCount || 0));
    formData.append("ctaType", card.ctaType || "room");
    if (card.flipResponse) formData.append("flipResponse", card.flipResponse);
    if (card.userId) formData.append("userId", card.userId);
    if (card.email) formData.append("email", card.email);
    if (card.day) formData.append("day", card.day);
    if (card.time) formData.append("time", card.time);
    if (card.isVerified !== undefined) formData.append("isVerified", String(card.isVerified));
    if (card.adminPhoto) formData.append("adminPhoto", card.adminPhoto);
    if (card.authorPhoto) formData.append("authorPhoto", card.authorPhoto);

    if (imageFile) {
      formData.append("media", imageFile);
    }
    if (videoFile) {
      formData.append("media", videoFile);
    }

    const res = await axios.post<{ success: boolean; data: FlipCard }>("/api/flipline", formData);
    return res.data.data;
  },

  /** Like or unlike a FlipLine card in the backend */
  likeFlipCard: async (sk: string, action: 'like' | 'unlike'): Promise<void> => {
    await axios.patch("/api/flipline", { sk, action });
  },
};
