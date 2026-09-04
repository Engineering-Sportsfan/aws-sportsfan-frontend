



// "use client";

// import { useState } from "react";
// import { Plus } from "lucide-react";
// import type { CreatePostPayload } from "@/types/PostPolls";
// import CreatePostDialog from "./CreatePost-Component/CreatePostDialog";
// import { usePosts } from "../../hooks/Useposts";
// import { useAuth } from "@/context/AuthContext";

// // Add emails here to grant access to the floating Create Post button.
// const CREATE_POST_ALLOWED_EMAILS: string[] = [
//   // "someone@sportsfan360.com",
//   // "rahul.yadav@sportsfan360.com",
//   // "chandu.srikakulam@sportsfan360.com"
// ];

// export default function GlobalActionBar() {
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const { createPost } = usePosts();
//   const { user } = useAuth();

//   const userEmail = user?.email?.toLowerCase();
//   const isAllowed =
//     !!user &&
//     (user.role === "FlipLineAdmin" ||
//       (!!userEmail && CREATE_POST_ALLOWED_EMAILS.map((e) => e.toLowerCase()).includes(userEmail)));

//   const handleCreatePost = async (
//     formData: FormData,
//     userId: string,
//     userName: string,
//     userEmail?: string
//   ) => {
//     await createPost(formData, userId, userName, userEmail);
//   };

//   if (!isAllowed) return null;

//   return (
//     <>
//       <div className="fixed bottom-24 right-4 md:bottom-28 md:right-6 lg:bottom-28 lg:right-6 z-50">
//         <button
//           onClick={() => setDialogOpen(true)}
//           className="group relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 lg:w-14 lg:h-14 rounded-full bg-gradient-to-r from-[#C9115F] to-[#e85d04] border border-white/15 shadow-lg hover:shadow-xl hover:border-[#C9115F]/60 hover:bg-[#C9115F]/10 transition-all duration-300 hover:scale-110 active:scale-95"
//           aria-label="Create Post"
//           title="Create Post"
//         >
//           <span className="absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#C9115F] to-[#e85d04] text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
//             Create Post
//           </span>
//           {/* <Plus className="text-white/70 group-hover:text-[#C9115F] w-3 h-3 md:w-6 md:h-6 lg:w-6 lg:h-6 transition-colors duration-200" /> */}
//           <img
//             src="/images/posticon.png"
//             className="text-white/70 group-hover:text-[#C9115F] w-6 h-6 md:w-7 md:h-7 lg:w-7 lg:h-7 transition-colors duration-200"
//           />
//         </button>
//       </div>

//       <CreatePostDialog
//         isOpen={dialogOpen}
//         onClose={() => setDialogOpen(false)}
//         onSubmit={handleCreatePost}
//       />
//     </>
//   );
// }



"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Newspaper } from "lucide-react";
import type { CreatePostPayload } from "@/types/PostPolls";
import CreatePostDialog from "./CreatePost-Component/CreatePostDialog";
import CreateArticles from "./CreatePost-Component/CreateArticles";
import { usePosts } from "../../hooks/Useposts";
import { useAuth } from "@/context/AuthContext";

// Add emails here to grant access to the floating Create Post button.
const CREATE_POST_ALLOWED_EMAILS: string[] = [
  // "someone@sportsfan360.com",
  "rahul.yadav@sportsfan360.com",
  "chandu.srikakulam@sportsfan360.com",
  "jignesh@sportsfan360.com",
  "anandvasu@gmail.com",
  "tushar.deshmukh@sportsfan360.com",
  "prisha.dureja@sportsfan360.com",
  "dinod.withanawasam@sportsfan360.com"
];

export default function GlobalActionBar() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [articleDialogOpen, setArticleDialogOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { createPost } = usePosts();
  const { user } = useAuth();

  const userEmail = (user?.email || (user as any)?.emailAddress || (user as any)?.username || "").trim().toLowerCase();
  const normalizedAllowedEmails = CREATE_POST_ALLOWED_EMAILS.map((e) => e.trim().toLowerCase()).filter(Boolean);

  const isAllowed =
    !!user &&
    (user.role === "FlipLineAdmin" ||
      user.role === "Admin" ||
      user.role === "SuperAdmin" ||
      (!!userEmail && normalizedAllowedEmails.includes(userEmail)));

  const handleCreatePost = async (
    formData: FormData,
    userId: string,
    userName: string,
    userEmail?: string
  ) => {
    await createPost(formData, userId, userName, userEmail);
  };

  // Close the menu when clicking outside of it.
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  if (!isAllowed) return null;

  const handleFliplineClick = () => {
    setMenuOpen(false);
    setDialogOpen(true);
  };

  const handleArticlesClick = () => {
    setMenuOpen(false);
    setArticleDialogOpen(true);
  };

  return (
    <>
      <div
        ref={menuRef}
        className="fixed bottom-24 right-4 md:bottom-28 md:right-6 lg:bottom-28 lg:right-6 z-50 flex flex-col items-end gap-3"
      >
        {/* Option menu */}
        {menuOpen && (
          <div className="flex flex-col gap-2 mb-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <button
              onClick={handleFliplineClick}
              className="flex items-center gap-2 pl-4 pr-5 py-1 rounded-full bg-[#161b22] border border-white/15 shadow-lg text-white text-sm font-medium hover:border-[#C9115F]/60 hover:bg-[#C9115F]/10 transition-all"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-[#C9115F] to-[#e85d04]">
                <Newspaper size={16} className="text-white" />
              </span>
              Flipline
            </button>

            <button
              onClick={handleArticlesClick}
              className="flex items-center gap-2 pl-4 pr-5 py-1 rounded-full bg-[#161b22] border border-white/15 shadow-lg text-white text-sm font-medium hover:border-[#C9115F]/60 hover:bg-[#C9115F]/10 transition-all"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-[#C9115F] to-[#e85d04]">
                <FileText size={16} className="text-white" />
              </span>
              Articles
            </button>
          </div>
        )}

        {/* Main FAB */}
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="group relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 lg:w-14 lg:h-14 rounded-full bg-gradient-to-r from-[#C9115F] to-[#e85d04] border border-white/15 shadow-lg hover:shadow-xl hover:border-[#C9115F]/60 hover:bg-[#C9115F]/10 transition-all duration-300 hover:scale-110 active:scale-95"
          aria-label="Create"
          title="Create"
        >
          <span className="absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#C9115F] to-[#e85d04] text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Create
          </span>
          <img
            src="/images/posticon.png"
            className={`text-white/70 group-hover:text-[#C9115F] w-6 h-6 md:w-7 md:h-7 lg:w-7 lg:h-7 transition-transform duration-200 ${
              menuOpen ? "rotate-45" : ""
            }`}
          />
        </button>
      </div>

      <CreatePostDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCreatePost}
      />

      <CreateArticles
        isOpen={articleDialogOpen}
        onClose={() => setArticleDialogOpen(false)}
      />
    </>
  );
}
