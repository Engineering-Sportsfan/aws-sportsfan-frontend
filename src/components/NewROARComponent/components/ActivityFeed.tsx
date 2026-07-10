import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ActivityCard from "./ActivityCard";
import { resolvePostContent } from "@/context/ActivityContext";
import type { ActivityItem, ProfileStats } from "@/context/ActivityContext";

interface ActivityFeedProps {
  activities: ActivityItem[];
  loading: boolean;
  onActivityAction?: (action: "share" | "download", activity: ActivityItem) => void;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  loading,
  onActivityAction,
}) => {
  const [postDataMap, setPostDataMap] = useState<Map<string, any>>(new Map());
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Sort activities by createdAt DESC (latest first)
  const sortedActivities = [...activities].sort(
    (a, b) => b.createdAt - a.createdAt
  );

  // Preload post content for activities with postId
  useEffect(() => {
    const loadPostContent = async () => {
      const postIds = sortedActivities
        .map((a) => a.metadata?.postId)
        .filter((id) => id && typeof id === "string") as string[];

      if (postIds.length === 0) return;

      setLoadingPosts(true);
      try {
        for (const postId of postIds) {
          if (!postDataMap.has(postId)) {
            const data = await resolvePostContent(postId, "");
            setPostDataMap((prev) => new Map(prev).set(postId, data));
          }
        }
      } catch (error) {
        console.error("Error loading post content:", error);
      } finally {
        setLoadingPosts(false);
      }
    };

    loadPostContent();
  }, [sortedActivities, postDataMap]);

  // Empty State
  if (!loading && sortedActivities.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          textAlign: "center",
          padding: "40px 20px",
          background: "rgba(22, 22, 31, 0.4)",
          borderRadius: "16px",
          border: "1px dashed rgba(255, 107, 53, 0.3)",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🌟</div>
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>
          No activity yet
        </h3>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px", maxWidth: "300px" }}>
          Start creating Hot Takes, Debates, Memories, Predictions and Quizzes to build your fan
          profile.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            // Navigate to ROAR main section
            window.location.href = "/MainModules/ROAR";
          }}
          style={{
            padding: "10px 24px",
            background: "linear-gradient(135deg, #FF6B35, #E91E8C)",
            border: "none",
            borderRadius: "24px",
            color: "#fff",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          Explore ROAR
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Loading indicator */}
      {loadingPosts && (
        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
          Loading activity details...
        </div>
      )}

      {/* Activity Cards */}
      {sortedActivities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          postData={postDataMap.get(activity.metadata?.postId as string)}
          onShare={() => onActivityAction?.("share", activity)}
          onDownload={() => onActivityAction?.("download", activity)}
        />
      ))}

      {/* Loading skeleton state */}
      {loading && sortedActivities.length === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: "200px",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "16px",
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
