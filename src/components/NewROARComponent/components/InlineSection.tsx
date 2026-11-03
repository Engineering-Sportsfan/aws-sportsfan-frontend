// components/InlineSection.tsx
import { motion } from "framer-motion";
import EngagementCommentsThread from "@/components/Engagements/EngagementCommentsThread";

interface InlineSectionProps {
  postId: string;
  roomId: string;
  isOpen: boolean;
  onOpenFull?: () => void;
  accentColor?: string;
  currentAvatarUrl?: string;
  currentUserId?: string;
  currentUsername?: string;
  onFanProfile?: (fan: any) => void;
  onCommentPosted?: () => void;
  onCommentDeleted?: () => void;
  onToast?: (m: string) => void;
  onCountChange?: (count: number) => void;
}

export default function InlineSection({
  postId,
  roomId,
  isOpen,
  onOpenFull,
  accentColor = "#e91e8c",
  currentAvatarUrl,
  currentUserId,
  currentUsername,
  onFanProfile,
  onCommentPosted,
  onCountChange,
}: InlineSectionProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      onClick={(e) => e.stopPropagation()}
    >
      <EngagementCommentsThread
        roomId={roomId}
        postId={postId}
        accentColor={accentColor}
        currentAvatarUrl={currentAvatarUrl}
        currentUserId={currentUserId}
        currentUsername={currentUsername}
        onFanProfile={onFanProfile}
        onCommentCountChange={(count) => {
          onCountChange?.(count);
        }}
      />
    </motion.div>
  );
}
