// "use client";

// import axios from "axios";
// import { useEffect, useState } from "react";
// import { createPortal } from "react-dom";
// import { Plus, Trash2, GripVertical, X } from "lucide-react";

// type BadgeType = "FEATURE" | "ANALYSIS" | "OPINION" | "NEWS";

// type FormState = {
//   badge: BadgeType;
//   title: string;
//   author: string;
//   description: string[];
//   readTime: string;
//   views: string;
//   tags: string[];
// };

// const EMPTY_FORM: FormState = {
//   badge: "NEWS",
//   title: "",
//   author: "",
//   description: [""],
//   readTime: "5 min read",
//   views: "0 views",
//   tags: [],
// };

// interface Props {
//   isOpen: boolean;
//   onClose: () => void;
//   onCreated?: () => void;
// }

// export default function CreateArticleDialog({ isOpen, onClose, onCreated }: Props) {
//   const [form, setForm] = useState<FormState>(EMPTY_FORM);
//   const [tagInput, setTagInput] = useState("");
//   const [image, setImage] = useState<File | null>(null);
//   const [loading, setLoading] = useState(false);

//   const [mounted, setMounted] = useState(false);
//   useEffect(() => setMounted(true), []);

//   if (!isOpen || !mounted) return null;

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       const newTag = tagInput.trim();
//       if (newTag && !form.tags.includes(newTag)) {
//         setForm((prev) => ({ ...prev, tags: [...prev.tags, newTag] }));
//         setTagInput("");
//       }
//     }
//   };

//   const removeTag = (indexToRemove: number) => {
//     setForm((prev) => ({
//       ...prev,
//       tags: prev.tags.filter((_, index) => index !== indexToRemove),
//     }));
//   };

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => {
//     setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleDescriptionChange = (index: number, value: string) => {
//     const updated = [...form.description];
//     updated[index] = value;
//     setForm((prev) => ({ ...prev, description: updated }));
//   };

//   const addDescriptionParagraph = () => {
//     setForm((prev) => ({ ...prev, description: [...prev.description, ""] }));
//   };

//   const removeDescriptionParagraph = (index: number) => {
//     if (form.description.length === 1) {
//       alert("At least one paragraph is required");
//       return;
//     }
//     setForm((prev) => ({
//       ...prev,
//       description: prev.description.filter((_, i) => i !== index),
//     }));
//   };

//   const moveParagraphUp = (index: number) => {
//     if (index === 0) return;
//     const updated = [...form.description];
//     [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
//     setForm((prev) => ({ ...prev, description: updated }));
//   };

//   const moveParagraphDown = (index: number) => {
//     if (index === form.description.length - 1) return;
//     const updated = [...form.description];
//     [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
//     setForm((prev) => ({ ...prev, description: updated }));
//   };

//   const uploadFile = async (file: File) => {
//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("folder", "Images");
//     const res = await axios.post("/api/upload", formData);
//     return res.data.url;
//   };

//   const resetAndClose = () => {
//     setForm(EMPTY_FORM);
//     setImage(null);
//     setTagInput("");
//     onClose();
//   };

//   const handleSubmit = async () => {
//     if (!form.title) {
//       alert("Title is required");
//       return;
//     }

//     const nonEmptyDescriptions = form.description.filter((p) => p.trim() !== "");
//     if (nonEmptyDescriptions.length === 0) {
//       alert("At least one description paragraph is required");
//       return;
//     }

//     setLoading(true);
//     try {
//       let imageUrl = "";
//       if (image) imageUrl = await uploadFile(image);

//       const payload = { ...form, description: nonEmptyDescriptions, image: imageUrl };
//       const res = await axios.post("/api/cricket-articles", payload);

//       if (res.data.success) {
//         onCreated?.();
//         resetAndClose();
//       }
//     } catch (error) {
//       console.error("Save failed", error);
//       alert("Error saving article");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const preview = image ? URL.createObjectURL(image) : "";
//   const nonEmptyCount = form.description.filter((p) => p.trim() !== "").length;

//   const portalTarget = document.getElementById("sf360-app-root") ?? document.body;

//   return createPortal(
//     <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
//       {/* Backdrop */}
//       <div
//         onClick={resetAndClose}
//         style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.88)", backdropFilter: "blur(4px)" }}
//       />

//       {/* Sheet */}
//       <div
//         style={{
//           position: "relative",
//           zIndex: 1,
//           borderRadius: "20px 20px 0 0",
//           background: "rgb(12,14,24)",
//           border: "1px solid rgba(255,255,255,0.1)",
//           borderBottom: "none",
//           maxHeight: "92dvh",
//           display: "flex",
//           flexDirection: "column",
//         }}
//       >
//         {/* Drag handle */}
//         <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 0" }}>
//           <div style={{ width: 38, height: 4, borderRadius: 99, background: "rgba(255,255,255,0.18)" }} />
//         </div>

//         {/* Header */}
//         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px 10px" }}>
//           <span style={{ fontSize: 16, fontWeight: 900, color: "white", letterSpacing: -0.4 }}>
//             New Cricket Article
//           </span>
//           <button
//             onClick={resetAndClose}
//             style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
//           >
//             <X size={14} color="rgba(255,255,255,0.6)" strokeWidth={2.5} />
//           </button>
//         </div>

//         {/* Scrollable body */}
//         <div style={{ flex: 1, overflowY: "auto", padding: "0 16px", minHeight: 0 }}>
//           {/* Badge + Title + Author + Read time + Views */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
//             <div>
//               <label className="text-xs text-gray-400 block mb-1">Badge</label>
//               <select
//                 name="badge"
//                 value={form.badge}
//                 onChange={handleChange}
//                 className="w-full bg-[#0d1117] border border-gray-700 rounded px-3 py-2 text-white text-sm"
//               >
//                 <option value="FEATURE">FEATURE</option>
//                 <option value="ANALYSIS">ANALYSIS</option>
//                 <option value="OPINION">OPINION</option>
//                 <option value="NEWS">NEWS</option>
//               </select>
//             </div>

//             <FormInput
//               label="Title"
//               name="title"
//               value={form.title}
//               onChange={handleChange}
//               placeholder="Enter article title"
//             />
//             <FormInput
//               label="Author"
//               name="author"
//               value={form.author}
//               onChange={handleChange}
//               placeholder="Enter author"
//             />
//             <FormInput
//               label="Read Time"
//               name="readTime"
//               value={form.readTime}
//               onChange={handleChange}
//               placeholder="e.g., 5 min read"
//             />
//           </div>

//           {/* Tags */}
//           <div className="mb-4">
//             <label className="text-xs text-gray-400 block mb-1">Article Tags</label>
//             <div className="w-full bg-[#0d1117] border border-gray-700 rounded px-3 py-2 focus-within:border-blue-500 focus-within:outline-none">
//               <div className="flex flex-wrap gap-2 mb-2">
//                 {form.tags.map((tag, index) => (
//                   <span
//                     key={index}
//                     className="flex items-center gap-1 bg-blue-500/20 text-blue-500 px-2 py-1 rounded text-xs"
//                   >
//                     {tag}
//                     <button
//                       type="button"
//                       onClick={() => removeTag(index)}
//                       className="hover:text-white transition"
//                     >
//                       &times;
//                     </button>
//                   </span>
//                 ))}
//               </div>
//               <input
//                 type="text"
//                 value={tagInput}
//                 onChange={(e) => setTagInput(e.target.value)}
//                 onKeyDown={handleKeyDown}
//                 placeholder="Type tag and press Enter..."
//                 className="w-full bg-transparent border-none text-white text-sm focus:outline-none"
//               />
//             </div>
//           </div>

//           {/* Description paragraphs */}
//           <div className="mb-4">
//             <div className="flex items-center justify-between mb-3">
//               <label className="text-xs text-gray-400">Description Paragraphs</label>
//               <button
//                 type="button"
//                 onClick={addDescriptionParagraph}
//                 className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition"
//               >
//                 <Plus size={14} />
//                 Add Paragraph
//               </button>
//             </div>

//             <div className="space-y-3">
//               {form.description.map((paragraph, index) => (
//                 <div key={index} className="border border-gray-700 rounded-lg p-3 bg-[#0d1117]/50">
//                   <div className="flex items-center justify-between mb-2">
//                     <div className="flex items-center gap-2">
//                       <GripVertical size={16} className="text-gray-500 cursor-move" />
//                       <span className="text-xs text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">
//                         Paragraph {index + 1}
//                       </span>
//                     </div>
//                     <div className="flex gap-2">
//                       {index > 0 && (
//                         <button
//                           type="button"
//                           onClick={() => moveParagraphUp(index)}
//                           className="text-gray-400 hover:text-white transition"
//                           title="Move Up"
//                         >
//                           ↑
//                         </button>
//                       )}
//                       {index < form.description.length - 1 && (
//                         <button
//                           type="button"
//                           onClick={() => moveParagraphDown(index)}
//                           className="text-gray-400 hover:text-white transition"
//                           title="Move Down"
//                         >
//                           ↓
//                         </button>
//                       )}
//                       <button
//                         type="button"
//                         onClick={() => removeDescriptionParagraph(index)}
//                         className="text-red-500 hover:text-red-400 transition"
//                         title="Remove Paragraph"
//                       >
//                         <Trash2 size={16} />
//                       </button>
//                     </div>
//                   </div>

//                   <textarea
//                     value={paragraph}
//                     onChange={(e) => handleDescriptionChange(index, e.target.value)}
//                     placeholder={`Write paragraph ${index + 1}...`}
//                     rows={4}
//                     className="w-full bg-[#0d1117] border border-gray-700 rounded px-3 py-2 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-blue-500 resize-y"
//                   />
//                 </div>
//               ))}
//             </div>

//             <p className="text-xs text-gray-500 mt-2">{nonEmptyCount} non-empty paragraph(s)</p>
//           </div>

//           {/* Image */}
//           <div className="mb-4">
//             <label className="text-xs text-gray-400 mb-1 block">Article Image</label>
//             <input
//               type="file"
//               accept="image/*"
//               onChange={(e) => setImage(e.target.files?.[0] ?? null)}
//               className="w-full bg-[#0d1117] border border-gray-700 rounded px-3 py-2 text-white file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-500 file:text-white hover:file:bg-blue-600 text-sm"
//             />
//             {preview && (
//               <img
//                 src={preview}
//                 alt="preview"
//                 className="w-28 h-28 object-cover rounded mt-3 border border-gray-700"
//               />
//             )}
//           </div>

//           <div style={{ height: 12 }} />
//         </div>

//         {/* Action bar */}
//         <div style={{ flexShrink: 0, padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgb(12,14,24)" }}>
//           <div className="flex gap-3">
//             <button
//               onClick={handleSubmit}
//               disabled={loading}
//               className="flex-1 py-3 rounded-xl font-bold text-sm disabled:cursor-not-allowed transition"
//               style={{
//                 background: loading
//                   ? "rgba(255,255,255,0.08)"
//                   : "linear-gradient(90deg,rgb(233,30,140),rgb(255,107,53))",
//                 color: loading ? "rgba(255,255,255,0.28)" : "white",
//               }}
//             >
//               {loading ? "Creating..." : "Create Article"}
//             </button>
//             <button
//               onClick={resetAndClose}
//               type="button"
//               className="flex-1 py-3 rounded-xl font-bold text-sm bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>,
//     portalTarget
//   );
// }

// function FormInput({
//   label,
//   ...props
// }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
//   return (
//     <div>
//       <label className="text-xs text-gray-400 mb-1 block">{label}</label>
//       <input
//         {...props}
//         className="w-full bg-[#0d1117] border border-gray-700 rounded px-3 py-2 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-blue-500"
//       />
//     </div>
//   );
// }






"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Trash2, GripVertical, X } from "lucide-react";

type BadgeType = "FEATURE" | "ANALYSIS" | "OPINION" | "NEWS";

type FormState = {
  badge: BadgeType;
  title: string;
  author: string;
  description: string[];
  readTime: string;
  views: string;
  tags: string[];
};

const EMPTY_FORM: FormState = {
  badge: "NEWS",
  title: "",
  author: "",
  description: [""],
  readTime: "5 min read",
  views: "0 views",
  tags: [],
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export default function CreateArticleDialog({ isOpen, onClose, onCreated }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [tagInput, setTagInput] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!isOpen || !mounted) return null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !form.tags.includes(newTag)) {
        setForm((prev) => ({ ...prev, tags: [...prev.tags, newTag] }));
        setTagInput("");
      }
    }
  };

  const removeTag = (indexToRemove: number) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDescriptionChange = (index: number, value: string) => {
    const updated = [...form.description];
    updated[index] = value;
    setForm((prev) => ({ ...prev, description: updated }));
  };

  const addDescriptionParagraph = () => {
    setForm((prev) => ({ ...prev, description: [...prev.description, ""] }));
  };

  const removeDescriptionParagraph = (index: number) => {
    if (form.description.length === 1) {
      alert("At least one paragraph is required");
      return;
    }
    setForm((prev) => ({
      ...prev,
      description: prev.description.filter((_, i) => i !== index),
    }));
  };

  const moveParagraphUp = (index: number) => {
    if (index === 0) return;
    const updated = [...form.description];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setForm((prev) => ({ ...prev, description: updated }));
  };

  const moveParagraphDown = (index: number) => {
    if (index === form.description.length - 1) return;
    const updated = [...form.description];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setForm((prev) => ({ ...prev, description: updated }));
  };

  const resetAndClose = () => {
    setForm(EMPTY_FORM);
    setImage(null);
    setTagInput("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.title) {
      alert("Title is required");
      return;
    }

    const nonEmptyDescriptions = form.description.filter((p) => p.trim() !== "");
    if (nonEmptyDescriptions.length === 0) {
      alert("At least one description paragraph is required");
      return;
    }
    if (!image) {
      alert("An image or video is required");
      return;
    }

    setLoading(true);
    try {
      // Send everything (including the raw file) to the article route —
      // it uploads the file to Cloudinary itself.
      const formData = new FormData();
      formData.append("badge", form.badge);
      formData.append("title", form.title);
      formData.append("author", form.author);
      formData.append("readTime", form.readTime);
      formData.append("views", form.views);
      formData.append("description", JSON.stringify(nonEmptyDescriptions));
      formData.append("tags", JSON.stringify(form.tags));
      formData.append("file", image);

      const res = await axios.post("/api/cricket-articles", formData);

      if (res.data.success) {
        onCreated?.();
        resetAndClose();
      }
    } catch (error) {
      console.error("Save failed", error);
      alert("Error saving article");
    } finally {
      setLoading(false);
    }
  };

  const preview = image ? URL.createObjectURL(image) : "";
  const nonEmptyCount = form.description.filter((p) => p.trim() !== "").length;

  const portalTarget = document.getElementById("sf360-app-root") ?? document.body;

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      {/* Backdrop */}
      <div
        onClick={resetAndClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.88)", backdropFilter: "blur(4px)" }}
      />

      {/* Sheet */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          borderRadius: "20px 20px 0 0",
          background: "rgb(12,14,24)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderBottom: "none",
          maxHeight: "92dvh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 0" }}>
          <div style={{ width: 38, height: 4, borderRadius: 99, background: "rgba(255,255,255,0.18)" }} />
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px 10px" }}>
          <span style={{ fontSize: 16, fontWeight: 900, color: "white", letterSpacing: -0.4 }}>
            New Cricket Article
          </span>
          <button
            onClick={resetAndClose}
            style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X size={14} color="rgba(255,255,255,0.6)" strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 16px", minHeight: 0 }}>
          {/* Badge + Title + Author + Read time + Views */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Badge</label>
              <select
                name="badge"
                value={form.badge}
                onChange={handleChange}
                className="w-full bg-[#0d1117] border border-gray-700 rounded px-3 py-2 text-white text-sm"
              >
                <option value="FEATURE">FEATURE</option>
                <option value="ANALYSIS">ANALYSIS</option>
                <option value="OPINION">OPINION</option>
                <option value="NEWS">NEWS</option>
              </select>
            </div>

            <FormInput
              label="Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter article title"
            />
            <FormInput
              label="Author"
              name="author"
              value={form.author}
              onChange={handleChange}
              placeholder="Enter author"
            />
            <FormInput
              label="Read Time"
              name="readTime"
              value={form.readTime}
              onChange={handleChange}
              placeholder="e.g., 5 min read"
            />
          </div>

          {/* Tags */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 block mb-1">Article Tags</label>
            <div className="w-full bg-[#0d1117] border border-gray-700 rounded px-3 py-2 focus-within:border-blue-500 focus-within:outline-none">
              <div className="flex flex-wrap gap-2 mb-2">
                {form.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-1 bg-blue-500/20 text-blue-500 px-2 py-1 rounded text-xs"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="hover:text-white transition"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type tag and press Enter..."
                className="w-full bg-transparent border-none text-white text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Description paragraphs */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs text-gray-400">Description Paragraphs</label>
              <button
                type="button"
                onClick={addDescriptionParagraph}
                className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition"
              >
                <Plus size={14} />
                Add Paragraph
              </button>
            </div>

            <div className="space-y-3">
              {form.description.map((paragraph, index) => (
                <div key={index} className="border border-gray-700 rounded-lg p-3 bg-[#0d1117]/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <GripVertical size={16} className="text-gray-500 cursor-move" />
                      <span className="text-xs text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">
                        Paragraph {index + 1}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => moveParagraphUp(index)}
                          className="text-gray-400 hover:text-white transition"
                          title="Move Up"
                        >
                          ↑
                        </button>
                      )}
                      {index < form.description.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveParagraphDown(index)}
                          className="text-gray-400 hover:text-white transition"
                          title="Move Down"
                        >
                          ↓
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeDescriptionParagraph(index)}
                        className="text-red-500 hover:text-red-400 transition"
                        title="Remove Paragraph"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={paragraph}
                    onChange={(e) => handleDescriptionChange(index, e.target.value)}
                    placeholder={`Write paragraph ${index + 1}...`}
                    rows={4}
                    className="w-full bg-[#0d1117] border border-gray-700 rounded px-3 py-2 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-blue-500 resize-y"
                  />
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500 mt-2">{nonEmptyCount} non-empty paragraph(s)</p>
          </div>

          {/* Image / Video */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-1 block">Article Image / Video</label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              className="w-full bg-[#0d1117] border border-gray-700 rounded px-3 py-2 text-white file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-500 file:text-white hover:file:bg-blue-600 text-sm"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              Videos are uploaded to the cricket media (Cloudinary) folder.
            </p>
            {preview && (
              image?.type.startsWith("video/") ? (
                <video
                  src={preview}
                  controls
                  className="w-40 h-28 object-cover rounded mt-3 border border-gray-700"
                />
              ) : (
                <img
                  src={preview}
                  alt="preview"
                  className="w-28 h-28 object-cover rounded mt-3 border border-gray-700"
                />
              )
            )}
          </div>

          <div style={{ height: 12 }} />
        </div>

        {/* Action bar */}
        <div style={{ flexShrink: 0, padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgb(12,14,24)" }}>
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-bold text-sm disabled:cursor-not-allowed transition"
              style={{
                background: loading
                  ? "rgba(255,255,255,0.08)"
                  : "linear-gradient(90deg,rgb(233,30,140),rgb(255,107,53))",
                color: loading ? "rgba(255,255,255,0.28)" : "white",
              }}
            >
              {loading ? "Creating..." : "Create Article"}
            </button>
            <button
              onClick={resetAndClose}
              type="button"
              className="flex-1 py-3 rounded-xl font-bold text-sm bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>,
    portalTarget
  );
}

function FormInput({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="text-xs text-gray-400 mb-1 block">{label}</label>
      <input
        {...props}
        className="w-full bg-[#0d1117] border border-gray-700 rounded px-3 py-2 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-blue-500"
      />
    </div>
  );
}