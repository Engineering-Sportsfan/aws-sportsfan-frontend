// components/InlineSection.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Send, ChevronUp, ChevronDown } from "lucide-react";

function mentionMatchesAuthor(mentionToken: string, authorUsername: string): boolean {
  const mention = mentionToken.toLowerCase().trim();
  const uname = (authorUsername ?? "").toLowerCase().trim();
  if (uname === mention) return true;
  const segments = uname.split(/[\s_\.]+/).filter(Boolean);
  if (segments.some((seg) => seg === mention)) return true;
  if (segments.join("") === mention.replace(/\s+/g, "")) return true;
  return false;
}

function threadSort(flat: any[]): any[] {
  const result: any[] = [];
  for (const comment of flat) {
    const text: string = (comment.text ?? "").trimStart();
    const mentionMatch = text.match(/^@(\S+)/);
    if (mentionMatch) {
      const mentionToken = mentionMatch[1];
      let insertAfter = -1;
      for (let i = result.length - 1; i >= 0; i--) {
        if (mentionMatchesAuthor(mentionToken, result[i].authorUsername ?? "")) {
          insertAfter = i;
          break;
        }
      }
      if (insertAfter >= 0) {
        let insertAt = insertAfter + 1;
        while (
          insertAt < result.length &&
          (result[insertAt].text ?? "").trimStart().match(/^@/)
        ) {
          insertAt++;
        }
        result.splice(insertAt, 0, comment);
        continue;
      }
    }
    result.push(comment);
  }
  return result;
}

interface InlineSectionProps {
  postId: string;
  roomId: string;
  isOpen: boolean;
  onOpenFull: () => void;
  accentColor: string;
  currentAvatarUrl?: string;
  onCommentPosted: () => void;
}

export default function InlineSection({
  postId,
  roomId,
  isOpen,
  onOpenFull,
  accentColor,
  currentAvatarUrl,
  onCommentPosted,
}: InlineSectionProps) {
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<{
    commentId: string;
    authorUsername: string;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchReplies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/roar/rooms/${roomId}/messages/${postId}/comments`,
        { params: { limit: 50 } }
      );
      const list: any[] = res.data?.comments ?? [];
      const oldestFirst = [...list].reverse();
      const threaded = threadSort(oldestFirst);
      setReplies(threaded.slice(0, 4));
    } catch {
      setReplies([]);
    } finally {
      setLoading(false);
    }
  }, [postId, roomId]);

  useEffect(() => {
    if (isOpen) {
      fetchReplies();
      setTimeout(() => inputRef.current?.focus(), 180);
    }
  }, [isOpen, fetchReplies]);

  const handleSend = async () => {
    const fullText = replyTo
      ? `@${replyTo.authorUsername} ${commentText.trim()}`
      : commentText.trim();
    if (!fullText || sending) return;
    setSending(true);
    try {
      await axios.post(
        `/api/roar/rooms/${roomId}/messages/${postId}/comments`,
        { text: fullText }
      );
      setCommentText("");
      setReplyTo(null);
      onCommentPosted();
      fetchReplies();
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      style={{ overflow: "hidden" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 0 }}>
        {loading ? (
          <p
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.3)",
              fontStyle: "italic",
              marginBottom: 8,
              paddingLeft: 4,
            }}
          >
            Loading replies…
          </p>
        ) : replies.length === 0 ? (
          <p
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.3)",
              fontStyle: "italic",
              marginBottom: 8,
              paddingLeft: 4,
            }}
          >
            No replies yet — be the first!
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 10 }}>
            {replies.map((r, i) => {
              const isReply = /^@\S+/.test((r.text ?? "").trimStart());
              return (
                <div
                  key={r.id ?? r.commentId ?? i}
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-start",
                    paddingLeft: isReply ? 28 : 0,
                    minWidth: 0,
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: "linear-gradient(135deg,#e91e8c,#ff6b35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    {r.authorAvatarUrl ? (
                      <img
                        src={r.authorAvatarUrl}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <span style={{ fontSize: 8, fontWeight: 800, color: "#fff" }}>
                        {(r.authorUsername ?? "?")[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                    <span
                      style={{
                        fontWeight: 700,
                        color: "#fff",
                        fontSize: 13,
                        display: "block",
                        wordBreak: "break-word",
                      }}
                    >
                      {r.authorUsername ?? "Fan"}
                    </span>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        lineHeight: 1.5,
                        color: "rgba(255,255,255,0.75)",
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {isReply
                        ? (() => {
                            const spaceIdx = (r.text ?? "").indexOf(" ");
                            const mention =
                              spaceIdx > -1
                                ? (r.text ?? "").slice(0, spaceIdx)
                                : (r.text ?? "");
                            const rest =
                              spaceIdx > -1 ? (r.text ?? "").slice(spaceIdx) : "";
                            return (
                              <>
                                <span style={{ color: accentColor, fontWeight: 600 }}>
                                  {mention}
                                </span>
                                {rest}
                              </>
                            );
                          })()
                        : (r.text ?? "")}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReplyTo({
                          commentId: r.id ?? r.commentId,
                          authorUsername: r.authorUsername ?? "Fan",
                        });
                        setTimeout(() => inputRef.current?.focus(), 80);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.35)",
                        padding: 0,
                        marginTop: 3,
                      }}
                    >
                      Reply
                    </button>
                  </div>
                </div>
              );
            })}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenFull();
              }}
              style={{
                alignSelf: "flex-start",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 700,
                color: accentColor,
                padding: 0,
                marginTop: 2,
              }}
            >
              View all replies →
            </button>
          </div>
        )}

        <AnimatePresence>
          {replyTo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: "hidden", marginBottom: 4 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 2 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                  Replying to
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: accentColor,
                    background: `${accentColor}18`,
                    border: `1px solid ${accentColor}40`,
                    borderRadius: 999,
                    padding: "1px 8px",
                  }}
                >
                  @{replyTo.authorUsername}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setReplyTo(null);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.3)",
                    fontSize: 14,
                    lineHeight: 1,
                    padding: 0,
                  }}
                >
                  ×
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 10px",
            borderRadius: 16,
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${accentColor}40`,
          }}
        >
          {currentAvatarUrl ? (
            <img
              src={currentAvatarUrl}
              alt=""
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                flexShrink: 0,
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                flexShrink: 0,
                background: "linear-gradient(135deg,#e91e8c,#ff6b35)",
              }}
            />
          )}
          <input
            ref={inputRef}
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder={
              replyTo ? `Reply to @${replyTo.authorUsername}…` : "Add a comment…"
            }
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: "#fff",
              fontSize: 13,
              fontWeight: 500,
            }}
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenFull();
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "rgba(255,255,255,0.3)",
              fontSize: 11,
              fontWeight: 600,
              whiteSpace: "nowrap",
              padding: "0 2px",
            }}
          >
            All
          </button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSend();
            }}
            disabled={!commentText.trim() || sending}
            style={{
              background: commentText.trim()
                ? `linear-gradient(135deg,${accentColor},#ff6b35)`
                : "rgba(255,255,255,0.08)",
              border: "none",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: commentText.trim() ? "pointer" : "default",
              transition: "background 0.2s",
              flexShrink: 0,
            }}
          >
            <Send size={14} color={commentText.trim() ? "#fff" : "rgba(255,255,255,0.3)"} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}