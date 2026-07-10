// "use client";
// import ROARApp from "@/src/components/NewROARComponent";
// import { Suspense } from "react";

// export default function ROARPage() {
//   return (
//     <div style={{
//       display: "flex",
//       flexDirection: "column",
//       flex: 1,
//       minHeight: 0,
//       height: "100%",
//       width: "100%",
//       overflow: "hidden",
//       position: "relative",
//     }}>
//       <Suspense fallback={null}>
//         <ROARApp />
//       </Suspense>
//     </div>
//   );
// }


//MainModules/ROAR/page.tsx
"use client";
import ROARApp from "@/src/components/NewROARComponent";
import { Suspense } from "react";

export default function ROARPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        // Use dvh so mobile Safari's collapsing toolbar is accounted for.
        // On desktop this resolves the same as 100%.
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Suspense fallback={null}>
        <ROARApp />
      </Suspense>
    </div>
  );
}