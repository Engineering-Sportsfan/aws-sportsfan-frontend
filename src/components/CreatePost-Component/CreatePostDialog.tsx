"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Image as ImageIcon, BarChart2, Trash2, Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface CreatePostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    formData: FormData,
    userId: string,
    userName: string,
    userEmail?: string
  ) => Promise<void>;
}

export default function CreatePostDialog({
  isOpen,
  onClose,
  onSubmit,
}: CreatePostDialogProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resetForm = () => {
    setContent("");
    setSelectedMedia([]);
    mediaPreviews.forEach((url) => URL.revokeObjectURL(url));
    setMediaPreviews([]);
    setShowPoll(false);
    setPollOptions(["", ""]);
    setSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setSelectedMedia((prev) => [...prev, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setMediaPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeMedia = (index: number) => {
    URL.revokeObjectURL(mediaPreviews[index]);
    setSelectedMedia((prev) => prev.filter((_, i) => i !== index));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePollOptionChange = (index: number, val: string) => {
    setPollOptions((prev) => {
      const updated = [...prev];
      updated[index] = val;
      return updated;
    });
  };

  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions((prev) => [...prev, ""]);
    }
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && selectedMedia.length === 0 && !showPoll) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      const userId = user?.userId || (user as any)?.uid || (user as any)?.id || "anon";
      const userName = user?.name || (user as any)?.username || "SportsFan";
      const userEmail = user?.email || (user as any)?.emailAddress;

      formData.append("userId", userId);
      formData.append("author", userName);
      formData.append("userName", userName);
      formData.append("handle", `@${userName.replace(/\s+/g, "").toLowerCase()}`);
      formData.append("userHandle", `@${userName.replace(/\s+/g, "").toLowerCase()}`);
      formData.append("content", content.trim());
      formData.append("sport", "cricket");
      formData.append("type", "post");
      formData.append("source", "FlipLine");
      formData.append("likes", "0");
      formData.append("isKey", "false");
      if (userEmail) {
        formData.append("email", userEmail);
        formData.append("userEmail", userEmail);
      }
      const adminPhoto = (user as any)?.addfliplineAdminPhoto || user?.avatar || (user as any)?.avatarUrl;
      if (adminPhoto) {
        formData.append("adminPhoto", adminPhoto);
        formData.append("authorPhoto", adminPhoto);
      }

      selectedMedia.forEach((file) => {
        formData.append("media", file);
      });

      if (showPoll) {
        const validOptions = pollOptions.filter((opt) => opt.trim() !== "");
        if (validOptions.length >= 2) {
          const pollData = {
            options: validOptions.map((text, i) => ({
              id: `opt_${i + 1}`,
              text: text.trim(),
              votes: 0,
            })),
            totalVotes: 0,
            endsAt: Date.now() + 24 * 60 * 60 * 1000,
            createdAt: Date.now(),
          };
          formData.append("poll", JSON.stringify(pollData));
        }
      }

      await onSubmit(formData, userId, userName, userEmail);
      handleClose();
    } catch (err) {
      console.error("Failed to create post:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#141417] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-gradient-to-r from-[#C9115F] to-[#e85d04] flex items-center justify-center text-white text-xs font-bold">
              ✍️
            </span>
            <h3 className="text-base font-black text-white tracking-wide">
              Create Flipline Post
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto p-5 gap-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening in the sports world?"
            rows={4}
            className="w-full bg-[#0c0c0e] border border-white/10 focus:border-pink-500 rounded-xl p-3.5 text-sm text-white placeholder:text-gray-500 outline-none resize-none transition-all"
            autoFocus
          />

          {/* Media Previews */}
          {mediaPreviews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {mediaPreviews.map((url, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-white/10 aspect-video bg-black/40">
                  <img src={url} alt="Media preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeMedia(idx)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/80 hover:bg-red-600 text-white flex items-center justify-center transition-all"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Poll Builder */}
          {showPoll && (
            <div className="flex flex-col gap-2.5 bg-[#0e0e11] border border-pink-500/20 rounded-xl p-3.5">
              <div className="flex items-center justify-between text-xs font-bold text-pink-400 uppercase tracking-wider">
                <span>Poll Options (24 Hours)</span>
                <button
                  type="button"
                  onClick={() => setShowPoll(false)}
                  className="text-gray-400 hover:text-red-400 text-xs"
                >
                  Remove Poll
                </button>
              </div>
              {pollOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handlePollOptionChange(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1 bg-[#18181b] border border-white/10 focus:border-pink-500 rounded-lg px-3 py-2 text-xs text-white outline-none placeholder:text-gray-600"
                    maxLength={50}
                  />
                  {pollOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removePollOption(idx)}
                      className="text-gray-500 hover:text-red-400 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              {pollOptions.length < 4 && (
                <button
                  type="button"
                  onClick={addPollOption}
                  className="flex items-center gap-1.5 text-xs text-pink-400 hover:text-pink-300 font-bold py-1 mt-1 cursor-pointer w-fit"
                >
                  <Plus size={14} />
                  <span>Add Option</span>
                </button>
              )}
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleMediaChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold border border-white/10 transition-all cursor-pointer"
              >
                <ImageIcon size={14} className="text-pink-400" />
                <span>Media</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPoll((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  showPoll
                    ? "bg-pink-500/20 border-pink-500/40 text-pink-300"
                    : "bg-white/5 hover:bg-white/10 text-gray-300 border-white/10"
                }`}
              >
                <BarChart2 size={14} className="text-blue-400" />
                <span>Poll</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting || (!content.trim() && selectedMedia.length === 0 && !showPoll)}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#C9115F] to-[#e85d04] hover:from-[#db1b6e] hover:to-[#f06e18] text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-500/20 active:scale-95 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Posting...</span>
                </>
              ) : (
                <span>Post</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}