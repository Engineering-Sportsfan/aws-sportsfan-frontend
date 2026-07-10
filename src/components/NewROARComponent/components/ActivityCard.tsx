import { useState , useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import html2canvas from "html2canvas";
import type { ActivityItem } from "@/context/ActivityContext";
import posthog from 'posthog-js';
// import { useState, useRef } from "react";
interface ActivityCardProps {
  activity: ActivityItem;
  postData?: Record<string, unknown>;
  onShare?: () => void;
  onDownload?: () => void;
}

const ACTIVITY_TYPE_CONFIG: Record<
  string,
  {
    icon: string;
    label: string;
    color: string;
    bgColor: string;
  }
> = {
  ROAR_HOT_TAKE: {
    icon: "🔥",
    label: "HOT TAKE",
    color: "#FF6B35",
    bgColor: "rgba(255, 107, 53, 0.1)",
  },
  ROAR_DEBATE: {
    icon: "💬",
    label: "DEBATE",
    color: "#00D9FF",
    bgColor: "rgba(0, 217, 255, 0.1)",
  },
  ROAR_MEMORY: {
    icon: "🎬",
    label: "MEMORY",
    color: "#FFB81C",
    bgColor: "rgba(255, 184, 28, 0.1)",
  },
  ROAR_RAW_REACTIONS: {
    icon: "⚡",
    label: "RAW REACTION",
    color: "#E91E8C",
    bgColor: "rgba(233, 30, 140, 0.1)",
  },
  ROAR_PREDICTION: {
    icon: "🎯",
    label: "PREDICTION",
    color: "#00FF88",
    bgColor: "rgba(0, 255, 136, 0.1)",
  },
  FLASH_QUIZ: {
    icon: "🧠",
    label: "FLASH QUIZ",
    color: "#7C3AED",
    bgColor: "rgba(124, 58, 237, 0.1)",
  },
};

const getActivityConfig = (type: string) => {
  return (
    ACTIVITY_TYPE_CONFIG[type] || {
      icon: "📝",
      label: type.replace(/_/g, " "),
      color: "#999",
      bgColor: "rgba(153, 153, 153, 0.1)",
    }
  );
};

const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  postData,
  onShare,
  onDownload,
}) => {
  const [loading, setLoading] = useState(false);
  const config = getActivityConfig(activity.type);
//   const cardRef = useState<HTMLDivElement | null>(null)[0];


const cardRef = useRef<HTMLDivElement>(null);
  const handleShare = async () => {
    posthog.capture("content_shared", {
      activity_id: activity.id,
      activity_type: activity.type
    });

    const shareText = `🏏 I posted a ROAR ${config.label} on Sportsfan360.\n⭐ Earned ${activity.points} points.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Sportsfan360",
          text: shareText,
        });
      } catch {
        // Handle cancellation
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
    }

    onShare?.();
  };

  const handleDownload = async () => {
    // if (!cardRef) return;
    if (!cardRef.current) return;

    try {
      setLoading(true);
     const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#16161f",
        scale: 2,
      });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `sportsfan-${activity.type}-${activity.id}.png`;
      link.click();
      onDownload?.();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
    //   ref={cardRef as any}
    ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background:
          "linear-gradient(135deg, rgba(255, 107, 53, 0.05), rgba(233, 30, 140, 0.05))",
        border: "1px solid rgba(255, 107, 53, 0.2)",
        borderRadius: 16,
        padding: "20px",
        marginBottom: "16px",
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Header with Type Badge */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <div
          style={{
            fontSize: "20px",
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: config.bgColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: config.color,
          }}
        >
          {config.icon}
        </div>
        <div>
          <div style={{ fontSize: "12px", fontWeight: 700, color: config.color, letterSpacing: "0.05em" }}>
            {config.label}
          </div>
          <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>
            {new Date(activity.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div style={{ marginLeft: "auto", padding: "4px 8px", background: "rgba(0,255,136,0.15)", borderRadius: "4px" }}>
          <span style={{ fontSize: "11px", color: "#00FF88", fontWeight: 700 }}>+{activity.points} XP</span>
        </div>
      </div>

      {/* Content - Activity Type Specific */}
      <ActivityContent activity={activity} postData={postData} />

      {/* Footer Actions */}
      <div style={{ display: "flex", gap: "12px", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleShare}
          style={{
            flex: 1,
            padding: "8px 12px",
            background: "rgba(0, 217, 255, 0.15)",
            border: "1px solid rgba(0, 217, 255, 0.3)",
            borderRadius: "8px",
            color: "#00D9FF",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          Share
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDownload}
          disabled={loading}
          style={{
            flex: 1,
            padding: "8px 12px",
            background: loading ? "rgba(255,255,255,0.05)" : "rgba(255, 184, 28, 0.15)",
            border: `1px solid ${loading ? "rgba(255,255,255,0.1)" : "rgba(255, 184, 28, 0.3)"}`,
            borderRadius: "8px",
            color: loading ? "var(--text-muted)" : "#FFB81C",
            fontSize: "12px",
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}
        >
          {loading ? "Downloading..." : "Download"}
        </motion.button>
      </div>
    </motion.div>
  );
};

// Activity Type Specific Content Renderers
function ActivityContent({
  activity,
  postData,
}: {
  activity: ActivityItem;
  postData?: Record<string, unknown>;
}) {
  const metadata = activity.metadata || {};

  switch (activity.type) {
    case "ROAR_HOT_TAKE":
      return (
        <div style={{ fontSize: "13px", lineHeight: "1.5", color: "var(--text-primary)" }}>
          <p style={{ marginBottom: "12px" }}>
            {/* {postData?.statement || metadata.statement || "Posted a hot take on ROAR"} */}
            {String(postData?.statement ?? metadata.statement ?? "Posted a hot take on ROAR")}
          </p>
          {postData?.agreeVotes !== undefined && postData?.disagreeVotes !== undefined && (
            <div style={{ display: "flex", gap: "16px", alignItems: "center", paddingTop: "12px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#00FF88" }}>
                  {/* {postData.agreeVotes || 0} */}
                  {Number(postData.agreeVotes ?? 0)}
                </div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Agree
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#FF6B35" }}>
                  {/* {postData.disagreeVotes || 0} */}
                  {Number(postData.disagreeVotes ?? 0)}
                </div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Disagree
                </div>
              </div>
            </div>
          )}
        </div>
      );

    case "ROAR_DEBATE":
      return (
        <div style={{ fontSize: "13px", lineHeight: "1.5", color: "var(--text-primary)" }}>
          <p style={{ marginBottom: "8px", fontWeight: 700 }}>
            {/* {postData?.title || metadata.title || "Started a debate"} */}
            {String(postData?.title ?? metadata.title ?? "Started a debate")}
          </p>
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            {/* {postData?.description || "Debate with other fans"} */}
            {String(postData?.description ?? "Debate with other fans")}
          </p>
        </div>
      );

    case "ROAR_MEMORY":
      return (
        <div style={{ fontSize: "13px", lineHeight: "1.5", color: "var(--text-primary)" }}>
          <p style={{ marginBottom: "8px" }}>
            {String(postData?.caption ?? metadata.caption ?? "Shared a memorable moment")}
          </p>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px" }}>
            Sport: <span style={{ color: "#fff", textTransform: "capitalize" }}>{String(metadata.sport ?? "General")}</span>
          </div>
        </div>
      );

    case "ROAR_RAW_REACTIONS":
      return (
        <div style={{ fontSize: "13px", lineHeight: "1.5", color: "var(--text-primary)" }}>
          <p>
            {String(postData?.reaction ?? metadata.reaction ?? "Shared a raw reaction")}
          </p>
        </div>
      );

    case "ROAR_PREDICTION":
      return (
        <div style={{ fontSize: "13px", lineHeight: "1.5", color: "var(--text-primary)" }}>
          <p style={{ marginBottom: "8px" }}>
            {String(postData?.statement ?? metadata.statement ?? "Made a prediction")}
          </p>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px" }}>
            Status: <span style={{ color: postData?.status === "correct" ? "#00FF88" : "#FF6B35" }}>
              {postData?.status === "pending" ? "Pending" : postData?.status === "correct" ? "✓ Correct" : "✗ Incorrect"}
            </span>
          </div>
        </div>
      );

    case "FLASH_QUIZ":
      return (
        <div style={{ fontSize: "13px", lineHeight: "1.5", color: "var(--text-primary)" }}>
          <p style={{ marginBottom: "8px", fontWeight: 700 }}>
            {String(postData?.title ?? metadata.title ?? "Took a Flash Quiz")}
          </p>
          <div style={{ display: "flex", gap: "16px", fontSize: "12px", marginTop: "8px" }}>
            <div>
              Score: <span style={{ color: "#00FF88", fontWeight: 700 }}>{Number(postData?.score ?? 0)}</span>
            </div>
            <div>
              Points: <span style={{ color: "#FFB81C", fontWeight: 700 }}>+{Number(postData?.points ?? activity.points)}</span>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          {activity.label}
        </div>
      );
  }
}

export default ActivityCard;
