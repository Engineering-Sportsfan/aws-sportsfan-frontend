

// "use client";
// import { signOut } from "next-auth/react";
// import axios from "axios";
// import { LogOut } from "lucide-react";

// export default function LogoutButton() {
//   const handleLogout = async () => {
//     try {
//       await axios.post("/api/auth/logout", {}, { withCredentials: true });
//     } catch (e) {
//       console.warn("Backend logout failed, continuing with client logout", e);
//     }

//     document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
//     localStorage.removeItem("watchalong_user_name");

//     // Uses current domain automatically — works on both localhost and production
//     await signOut({ callbackUrl: `${window.location.origin}/auth/login`, redirect: true });
//   };

//   return (
//     <button
//       onClick={handleLogout}
//       className="text-sm text-red-400 hover:text-red-300 cursor-pointer transition"
//     >
//       <LogOut size={16} />
//     </button>
//   );
// }





"use client";
import React from "react";
import { LogOut } from "lucide-react";

export default function LogoutButton({ className, children }: { className?: string; children?: React.ReactNode }) {
  const handleLogout = async () => {
    try {
      // 1. Get CSRF token
      const csrfRes = await fetch("/api/auth/csrf");
      const { csrfToken } = await csrfRes.json();

      // 2. NextAuth signout with CSRF
      await fetch("/api/auth/signout", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ csrfToken }),
      });
    } catch (e) {
      console.warn("NextAuth signout failed", e);
    }

    // 3. Clear HttpOnly cookies via our local server route
    await fetch("/api/logout", { method: "POST" }).catch(() => { });

    // 4. Clear localStorage
    localStorage.removeItem("watchalong_user_name");

    // 5. Hard redirect
    window.location.replace("/auth/login");
  };

  return (
    <button
      onClick={handleLogout}
      className={className || "text-sm text-red-400 hover:text-red-300 cursor-pointer transition flex items-center gap-1"}
    >
      {children || (
        <>
          <LogOut size={16} />
          Logout
        </>
      )}
    </button>
  );
}