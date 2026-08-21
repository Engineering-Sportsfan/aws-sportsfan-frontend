"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { fliplineService } from "@/services/flipline.service";
import { useAuth } from "@/context/AuthContext";

export type FlipCard = {
  id: number;
  type: 'analyst' | 'fan' | 'official';
  sport: 'cricket' | 'football' | 'athletics';
  sportEmoji: string;
  sportLabel: string;
  day: string;
  time: string;
  timeMs: number;
  author: string;
  handle?: string;
  source: string;
  authorPhoto?: any;
  content: string;
  emoji?: string;
  mediaType?: 'audio' | 'video';
  image?: any;
  likes: number;
  isKey: boolean;
  tags?: string[];
  scoreChip?: {
    score: string;
    status: string;
    statusType: 'live' | 'final' | 'break' | 'upcoming' | 'delay' | 'info';
  };
  fomoMsg: string;
  fomoCount: number;
  ctaType: 'room' | 'watchalong' | 'drop';
  flipResponse: string;
  isUserPost?: boolean;
  hasAttachedImage?: boolean;
  hasAttachedVideo?: boolean;
  userId?: string;
  email?: string;
};

const POST_EMOJIS = [
  '🔥', '❤️', '😍', '👏', '🎉', '😮', '100', '🏏', 'IN',
  '⚡', '🙌', '😪', '💪', '👻', '😭', '👑', '🎯', '💥',
  '🐐', '⚽', '🏃', '🏆', '🎙️', '📊', '🌧️', '💎',
  '🥞', '😱', '👌'
];

function getAIPost(prompt: string, sport: FlipCard['sport']): string {
  const clean = prompt.trim();
  if (sport === 'cricket') {
    return `🔥 Flip Take: ${clean} | What a session! The pace, line and length are absolutely top-tier. Expecting more wickets soon! #INDvsSL 🏏`;
  } else if (sport === 'football') {
    return `⚽ Flip Pitchside: ${clean} | Solid defense and fast transitions. Manager's tactical plan is working perfectly! #Football ⚡`;
  } else {
    return `🏃 Flip Track: ${clean} | Incredible performance and pacing! The momentum is completely with the lead pack. #Athletics 🏆`;
  }
}

function spClr(sport: FlipCard['sport']): string {
  if (sport === 'cricket') return 'rgb(34,197,94)'; // green
  if (sport === 'football') return 'rgb(96,165,250)'; // blue
  return 'rgb(168,85,247)'; // purple
}

function spBg(sport: FlipCard['sport']): string {
  if (sport === 'cricket') return 'rgba(34,197,94,0.1)';
  if (sport === 'football') return 'rgba(96,165,250,0.1)';
  return 'rgba(168,85,247,0.1)';
}

const formatFileName = (name: string) => {
  if (name.length <= 15) return name;
  return name.slice(0, 12) + "...";
};

export function CreateFlipPostOverlay({ onClose, onPost, sport: initialSport }: {
  onClose: () => void;
  onPost: (card: FlipCard, imageFile: File | null, videoFile: File | null) => Promise<void>;
  sport: FlipCard['sport'];
}) {
  const { user, getUserDisplayName, getUserName } = useAuth();
  const [tab, setTab] = useState<'write' | 'askflip'>('write');
  const [text, setText] = useState('');
  const [sport, setSport] = useState<FlipCard['sport']>(initialSport);
  const [showEmojis, setShowEmojis] = useState(false);
  const [askPrompt, setAskPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Local storage upload states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const imgInputRef = useRef<HTMLInputElement>(null);
  const vidInputRef = useRef<HTMLInputElement>(null);

  const MAX = 280;
  const activeText = tab === 'askflip' ? generated : text;
  const remaining = MAX - activeText.length;
  const canPost = activeText.trim().length > 0 && !submitting;

  const MAX_FILE_SIZE_MB = 5.5;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  async function handleGenerate() {
    if (!askPrompt.trim()) return;
    setGenerating(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `Write a short, engaging fan post under 150 characters based on this description: "${askPrompt}". Use appropriate sports emojis.`
        }),
      });
      if (!res.ok) throw new Error("Failed to generate AI post");
      const data = await res.json();
      setGenerated(data.answer || "");
    } catch (e) {
      console.error("AI Generation failed, falling back to local model:", e);
      setGenerated(getAIPost(askPrompt, sport));
    } finally {
      setGenerating(false);
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setErrorMsg(`Image exceeds maximum allowed size of ${MAX_FILE_SIZE_MB}MB.`);
        setImageFile(null);
      } else {
        setErrorMsg(null);
        setImageFile(file);
      }
    }
    e.target.value = "";
  }

  function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setErrorMsg(`Video exceeds maximum allowed size of ${MAX_FILE_SIZE_MB}MB.`);
        setVideoFile(null);
      } else {
        setErrorMsg(null);
        setVideoFile(file);
      }
    }
    e.target.value = "";
  }

  async function handlePost() {
    setErrorMsg(null);
    if (imageFile && imageFile.size > MAX_FILE_SIZE_BYTES) {
      setErrorMsg(`Image exceeds maximum allowed size of ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    if (videoFile && videoFile.size > MAX_FILE_SIZE_BYTES) {
      setErrorMsg(`Video exceeds maximum allowed size of ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setSubmitting(true);
    try {
      const now = new Date();
      const h = now.getHours(), mn = now.getMinutes();
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      const timeStr = `${h12}:${mn.toString().padStart(2, '0')} ${ampm}`;
      const sportMeta: Record<FlipCard['sport'], { emoji: string; label: string }> = {
        cricket: { emoji: '🏏', label: 'IND vs SL' },
        football: { emoji: '⚽', label: 'IND vs JPN' },
        athletics: { emoji: '🏃', label: 'Asian Athletics' },
      };

      const activeUsername = getUserDisplayName();
      const activeHandle = `@${getUserName()}`;
      const currentUserId = user?.actualUserId || user?.userId || getUserName();
      const currentUserEmail = user?.email || "";

      await onPost({
        id: Date.now(),
        type: 'fan',
        sport,
        sportEmoji: sportMeta[sport].emoji,
        sportLabel: sportMeta[sport].label,
        day: 'Just Now',
        time: timeStr,
        timeMs: 9000 + Date.now() % 1000,
        author: activeUsername,
        handle: activeHandle,
        source: tab === 'askflip' ? 'Ask Flip' : 'ROAR Room',
        content: activeText.trim(),
        likes: 0,
        isKey: false,
        tags: [],
        fomoMsg: '',
        fomoCount: 0,
        ctaType: 'room',
        flipResponse: '',
        isUserPost: true,
        hasAttachedImage: !!imageFile,
        hasAttachedVideo: !!videoFile,
        userId: currentUserId,
        email: currentUserEmail,
      }, imageFile, videoFile);

      onClose();
    } catch (e: any) {
      console.error("Failed to post to FlipLine:", e);
      const msg = e.response?.data?.error || e.message || "Failed to upload/post. File size may exceed AWS Lambda limit (6MB).";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const portalTarget = document.getElementById('sf360-app-root') ?? document.body;
  return createPortal(
    <div style={{ position: 'absolute', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(4px)' }} />

      {/* Sheet */}
      <div style={{ position: 'relative', zIndex: 1, borderRadius: '20px 20px 0 0', background: 'rgb(12,14,24)', border: '1px solid rgba(255,255,255,0.1)', borderBottom: 'none', maxHeight: '92dvh', display: 'flex', flexDirection: 'column' }}>

        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0' }}>
          <div style={{ width: 38, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.18)' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px 10px', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 16, fontWeight: 900, color: 'white', letterSpacing: -0.4 }}>New FlipLine Moment</span>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* Sport selector */}
        <div style={{ display: 'flex', gap: 6, padding: '0 16px 12px' }}>
          {(['cricket', 'football', 'athletics'] as const).map(s => {
            const map = { cricket: { e: '🏏', l: 'Cricket' }, football: { e: '⚽', l: 'Football' }, athletics: { e: '🏃', l: 'Athletics' } };
            const sc = spClr(s), sbk = spBg(s);
            return (
              <button key={s} onClick={() => setSport(s)}
                style={{ flex: 1, padding: '6px 4px', borderRadius: 10, border: `1.5px solid ${sport === s ? sc : 'rgba(255,255,255,0.1)'}`, background: sport === s ? sbk : 'rgba(255,255,255,0.04)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <span style={{ fontSize: 16 }}>{map[s].e}</span>
                <span style={{ fontSize: 8.5, fontWeight: 800, color: sport === s ? sc : 'rgba(255,255,255,0.38)' }}>{map[s].l}</span>
              </button>
            );
          })}
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', margin: '0 16px 12px', borderRadius: 12, padding: 3, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {([['write', '✍️ Write'], ['askflip', '🐬 Ask Flip']] as const).map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '7px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 11.5, fontWeight: 800,
                background: tab === t ? (t === 'askflip' ? 'linear-gradient(90deg,rgb(168,85,247),rgb(233,30,140))' : 'rgba(255,255,255,0.1)') : 'transparent',
                color: tab === t ? 'white' : 'rgba(255,255,255,0.4)'
              }}>
              {l}
            </button>
          ))}
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px', minHeight: 0 }}>
          {tab === 'write' ? (
            <div>
              {/* Textarea */}
              <div style={{ position: 'relative', background: 'rgba(255,255,255,0.04)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', padding: 12 }}>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value.slice(0, MAX))}
                  placeholder="Share your take on this moment... 🔥"
                  style={{ width: '100%', minHeight: 100, background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontSize: 14, color: 'rgba(255,255,255,0.9)', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box' }}
                  autoFocus
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: remaining < 40 ? 'rgb(255,80,80)' : 'rgba(255,255,255,0.3)' }}>{remaining}</span>
                </div>
              </div>

              {/* Attached media indicators */}
              {(imageFile || videoFile) && (
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  {imageFile && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 9, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                      <span style={{ fontSize: 13 }}>📷</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'rgb(34,197,94)' }}>{formatFileName(imageFile.name)}</span>
                      <button onClick={() => { setImageFile(null); setErrorMsg(null); }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>✕</button>
                    </div>
                  )}
                  {videoFile && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 9, background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)' }}>
                      <span style={{ fontSize: 13 }}>🎬</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'rgb(96,165,250)' }}>{formatFileName(videoFile.name)}</span>
                      <button onClick={() => { setVideoFile(null); setErrorMsg(null); }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>✕</button>
                    </div>
                  )}
                </div>
              )}

              {/* Emoji picker */}
              {showEmojis && (
                <div style={{ marginTop: 10, padding: '10px 8px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {POST_EMOJIS.map(em => (
                    <button key={em} onClick={() => { if (text.length < MAX) setText(t => t + em); }}
                      style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', padding: '2px 4px', borderRadius: 6, lineHeight: 1 }}>
                      {em}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Ask Flip tab */
            <div>
                <div style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                    <span style={{ fontSize: 18 }}>🐬</span>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 800, color: 'rgb(192,132,252)', margin: 0 }}>Ask Flip to write your post</p>
                      <p style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.38)', margin: 0, marginTop: 1 }}>Describe your thoughts — Flip drafts the perfect FlipLine moment</p>
                    </div>
                  </div>
                  <textarea
                    value={askPrompt}
                    onChange={e => setAskPrompt(e.target.value)}
                    placeholder="e.g. Bumrah is bowling unreal today, that wicket was insane..."
                    style={{ width: '100%', minHeight: 72, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 10, padding: '8px 10px', fontSize: 13, color: 'rgba(255,255,255,0.85)', fontFamily: 'inherit', resize: 'none', outline: 'none', boxSizing: 'border-box', lineHeight: 1.5 }}
                  />
                  <button onClick={handleGenerate} disabled={!askPrompt.trim() || generating}
                    style={{ marginTop: 10, width: '100%', padding: '9px 0', borderRadius: 10, background: generating ? 'rgba(168,85,247,0.3)' : 'linear-gradient(90deg,rgb(168,85,247),rgb(233,30,140))', border: 'none', cursor: askPrompt.trim() && !generating ? 'pointer' : 'not-allowed', fontSize: 11.5, fontWeight: 900, color: 'white' }}>
                    {generating ? '✨ Generating...' : '✨ Generate with Flip'}
                  </button>
                </div>

                {generated && (
                  <div style={{ padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ fontSize: 9, fontWeight: 800, color: 'rgb(192,132,252)', letterSpacing: 0.5, marginBottom: 8 }}>✨ FLIP DRAFT — Edit before posting</p>
                    <textarea
                      value={generated}
                      onChange={e => setGenerated(e.target.value.slice(0, MAX))}
                      style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontSize: 13.5, color: 'rgba(255,255,255,0.9)', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box', minHeight: 80 }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>{MAX - generated.length}</span>
                    </div>
                  </div>
                )}
            </div>
          )}
          <div style={{ height: 12 }} />
        </div>

        {/* Error Message Indicator */}
        {errorMsg && (
          <div style={{ margin: '0 16px 12px', padding: '10px 12px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', fontSize: 11.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>⚠️</span>
            <span style={{ flex: 1 }}>{errorMsg}</span>
          </div>
        )}

        {/* Action bar */}
        <div style={{ flexShrink: 0, padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgb(12,14,24)' }}>
          {tab === 'write' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <button onClick={() => setShowEmojis(e => !e)}
                style={{ width: 36, height: 36, borderRadius: '50%', background: showEmojis ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.07)', border: `1px solid ${showEmojis ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.1)'}`, cursor: 'pointer', fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                😊
              </button>

              {/* Hidden file input for Photo */}
              <input 
                ref={imgInputRef}
                type="file" 
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
              <button onClick={() => imgInputRef.current?.click()}
                disabled={submitting}
                style={{ width: 36, height: 36, borderRadius: '50%', background: imageFile ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.07)', border: `1px solid ${imageFile ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)'}`, cursor: submitting ? 'not-allowed' : 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                📷
              </button>

              {/* Hidden file input for Video */}
              <input
                ref={vidInputRef}
                type="file"
                accept="video/*"
                style={{ display: "none" }}
                onChange={handleVideoChange}
              />
              <button onClick={() => vidInputRef.current?.click()}
                disabled={submitting}
                style={{ width: 36, height: 36, borderRadius: '50%', background: videoFile ? 'rgba(96,165,250,0.12)' : 'rgba(255,255,255,0.07)', border: `1px solid ${videoFile ? 'rgba(96,165,250,0.4)' : 'rgba(255,255,255,0.1)'}`, cursor: submitting ? 'not-allowed' : 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                🎬
              </button>

              <div style={{ flex: 1 }} />
              <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, position: 'relative' }}>
                <svg viewBox="0 0 36 36" style={{ width: 28, height: 28, transform: 'rotate(-90deg)' }}>
                  <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15" fill="none"
                    stroke={remaining < 40 ? 'rgb(255,80,80)' : remaining < 100 ? 'rgb(251,191,36)' : 'rgb(168,85,247)'}
                    strokeWidth="3" strokeDasharray={`${(1 - remaining / MAX) * 94.2} 94.2`} strokeLinecap="round" />
                </svg>
              </div>
            </div>
          )}
          <button onClick={handlePost} disabled={!canPost}
            style={{ width: '100%', padding: '13px 0', borderRadius: 14, background: canPost ? 'linear-gradient(90deg,rgb(233,30,140),rgb(255,107,53))' : 'rgba(255,255,255,0.08)', border: 'none', cursor: canPost ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 900, color: canPost ? 'white' : 'rgba(255,255,255,0.28)', letterSpacing: 0.2 }}>
            {submitting ? 'Uploading & Posting... ⚡' : canPost ? 'Post to FlipLine ⚡' : 'Write something first...'}
          </button>
        </div>
      </div>
    </div>,
    portalTarget
  );
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    formData: FormData,
    userId: string,
    userName: string,
    userEmail?: string
  ) => Promise<void>;
}

export default function CreatePostDialog({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <CreateFlipPostOverlay
      onClose={onClose}
      sport="cricket"
      onPost={async (card, imageFile, videoFile) => {
        try {
          await fliplineService.createFlipCard(card, imageFile, videoFile);
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("flipline-post-created"));
          }
        } catch (e) {
          console.error("Failed to post to FlipLine:", e);
          throw e; // rethrow so that CreateFlipPostOverlay can display the error to the user
        }
      }}
    />
  );
}
