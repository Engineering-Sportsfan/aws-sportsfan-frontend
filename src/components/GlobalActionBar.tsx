// // "use client";

// // import { Pencil } from "lucide-react";
// // import Link from "next/link";

// // export default function GlobalActionBar() {
// //   return (
// //     <>
// //       {/* Feedback Button - Bottom Right */}
// //       <div className="fixed bottom-42 right-4 md:bottom-20 md:right-6 lg:bottom-6 lg:right-6 z-50">
// //         <Link href="/MainModules/Feedback">
// //           <button
// //             className="group relative flex items-center justify-center w-7 h-7 lg:w-14 lg:h-14 rounded-full bg-gradient-to-r from-[#C9115F] to-[#e85d04] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
// //             aria-label="Give Feedback"
// //             title="Give Feedback"
// //           >
// //             {/* Tooltip */}
// //             <span className="absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
// //               Give Feedback
// //             </span>

// //             {/* Icon */}
// //             <Pencil className="text-white w-3 h-3 md:w-6 md:h-6" /> 

// //             {/* Pulse animation */}
// //             <span className="absolute inset-0 rounded-full animate-ping bg-[#C9115F] opacity-40"></span>
// //           </button>
// //         </Link>
// //       </div>
// //     </>
// //   );
// // }






// "use client";

// import { useState } from "react";
// import { Pencil, Plus } from "lucide-react";
// import Link from "next/link";
// import type { CreatePostPayload } from "@/types/PostPolls";
// import CreatePostDialog from "./CreatePost-Component/CreatePostDialog";
// import { usePosts } from "../../hooks/Useposts";

// export default function GlobalActionBar() {
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const { createPost } = usePosts();

//   // const handleSubmit = async (
//   //   payload: CreatePostPayload,
//   //   userId: string,
//   //   userName: string,
//   //   userEmail?: string
//   // ) => {
//   //   await createPost(payload, userId, userName, userEmail);
//   // };

//   const handleCreatePost = async (
//     formData: FormData,
//     userId: string,
//     userName: string,
//     userEmail?: string
//   ) => {
//     await createPost(formData, userId, userName, userEmail);
//   };

//   return (
//     <>
//       {/* Feedback Button - Bottom Right */}
//       {/* <div className="fixed bottom-42 right-4 md:bottom-20 md:right-6 lg:bottom-6 lg:right-6 z-50">
//         <Link href="/MainModules/Feedback">
//           <button
//             className="group relative flex items-center justify-center w-7 h-7 md:w-7 md:h-7 lg:w-14 lg:h-14 rounded-full bg-gradient-to-r from-[#C9115F] to-[#e85d04] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
//             aria-label="Give Feedback"
//             title="Give Feedback"
//           >
//             <span className="absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#C9115F] to-[#e85d04]  text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
//               Give Feedback
//             </span>
//             <Pencil className="text-white w-3 h-3 md:w-4 md:h-4 lg:w-6 lg:h-6" />
//             <span className="absolute inset-0 rounded-full animate-ping bg-[#C9115F] opacity-40" />
//           </button>
//         </Link>
//       </div> */}

//       {/* Create Post Button — above feedback button */}
//       <div className="fixed bottom-15 right-4 md:bottom-15 md:right-6 lg:bottom-15 lg:right-6 z-50">
//         <button
//           onClick={() => setDialogOpen(true)}
//           className="group relative flex items-center justify-center w-7 h-7 md:w-12 md:h-12 lg:w-12 lg:h-12 rounded-full bg-gradient-to-r from-[#C9115F] to-[#e85d04]  border border-white/15 shadow-lg hover:shadow-xl hover:border-[#C9115F]/60 hover:bg-[#C9115F]/10 transition-all duration-300 hover:scale-110 active:scale-95"
//           aria-label="Create Post"
//           title="Create Post"
//         >
//           <span className="absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#C9115F] to-[#e85d04]  text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
//             Create Post
//           </span>
//            <Plus className="text-white/70 group-hover:text-[#C9115F] w-3 h-3 md:w-6 md:h-6 lg:w-6 lg:h-6 transition-colors duration-200" /> 
//           <img src="/images/posticon.png" className="text-white/70 group-hover:text-[#C9115F] w-5 h-5 md:w-6 md:h-6 lg:w-6 lg:h-6 transition-colors duration-200" />
//         </button>
//       </div>

//       {/* Create Post Dialog */}
//       <CreatePostDialog
//         isOpen={dialogOpen}
//         onClose={() => setDialogOpen(false)}
//         onSubmit={handleCreatePost}
//       />
//     </>
//   );
// }



"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { CreatePostPayload } from "@/types/PostPolls";
import CreatePostDialog from "./CreatePost-Component/CreatePostDialog";
import { usePosts } from "../../hooks/Useposts";
import { useAuth } from "@/context/AuthContext";

// Add emails here to grant access to the floating Create Post button.
const CREATE_POST_ALLOWED_EMAILS: string[] = [
  // "someone@sportsfan360.com",
  // "rahul.yadav@sportsfan360.com",
  // "chandu.srikakulam@sportsfan360.com"
];

export default function GlobalActionBar() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { createPost } = usePosts();
  const { user } = useAuth();

  const userEmail = user?.email?.toLowerCase();
  const isAllowed =
    !!user &&
    (user.role === "FlipLineAdmin" ||
      (!!userEmail && CREATE_POST_ALLOWED_EMAILS.map((e) => e.toLowerCase()).includes(userEmail)));

  const handleCreatePost = async (
    formData: FormData,
    userId: string,
    userName: string,
    userEmail?: string
  ) => {
    await createPost(formData, userId, userName, userEmail);
  };

  if (!isAllowed) return null;

  return (
    <>
      <div className="fixed bottom-24 right-4 md:bottom-28 md:right-6 lg:bottom-28 lg:right-6 z-50">
        <button
          onClick={() => setDialogOpen(true)}
          className="group relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 lg:w-14 lg:h-14 rounded-full bg-gradient-to-r from-[#C9115F] to-[#e85d04] border border-white/15 shadow-lg hover:shadow-xl hover:border-[#C9115F]/60 hover:bg-[#C9115F]/10 transition-all duration-300 hover:scale-110 active:scale-95"
          aria-label="Create Post"
          title="Create Post"
        >
          <span className="absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#C9115F] to-[#e85d04] text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Create Post
          </span>
          {/* <Plus className="text-white/70 group-hover:text-[#C9115F] w-3 h-3 md:w-6 md:h-6 lg:w-6 lg:h-6 transition-colors duration-200" /> */}
          <img
            src="/images/posticon.png"
            className="text-white/70 group-hover:text-[#C9115F] w-6 h-6 md:w-7 md:h-7 lg:w-7 lg:h-7 transition-colors duration-200"
          />
        </button>
      </div>

      <CreatePostDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCreatePost}
      />
    </>
  );
}