
// "use client";

// import CreateRoomStep1 from "@/src/components/HostDashboardComponents/CreateRoomStep1";
// import CreateRoomStep2 from "@/src/components/HostDashboardComponents/CreateRoomStep2";
// import CreateRoomStep3 from "@/src/components/HostDashboardComponents/CreateRoomStep3";
// import CreateRoomStep4 from "@/src/components/HostDashboardComponents/CreateRoomStep4";
// import { useState } from "react";


// const TOTAL_STEPS = 4;

// export default function HostDashboardPage() {
//   const [step, setStep] = useState(1);

//   const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
//   const goPrev = () => setStep((s) => Math.max(s - 1, 1));

//   return (
//     <div>
//       {step === 1 && (
//         <CreateRoomStep1
//           currentStep={step}
//           onNext={goNext}
//           onPrev={goPrev}
//         />
//       )}
//       {step === 2 && (
//         <CreateRoomStep2
//           currentStep={step}
//           onNext={goNext}
//           onPrev={goPrev}
//         />
//       )}
//       {step === 3 && (
//         <CreateRoomStep3
//           currentStep={step}
//           onNext={goNext}
//           onPrev={goPrev}
//         />
//       )}
//       {step === 4 && (
//         <CreateRoomStep4
//           currentStep={step}
//           onNext={goNext}
//           onPrev={goPrev}
//         />
//       )}
//     </div>
//   );
// }



"use client";

import CreateRoomStep1 from "@/src/components/HostDashboardComponents/CreateRoomStep1";
import CreateRoomStep2 from "@/src/components/HostDashboardComponents/CreateRoomStep2";
import CreateRoomStep3 from "@/src/components/HostDashboardComponents/CreateRoomStep3";
import CreateRoomStep4 from "@/src/components/HostDashboardComponents/CreateRoomStep4";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const TOTAL_STEPS = 4;

interface Step1Data {
  eventId?: string;
  eventName: string;
  roomType: string;
}

export default function HostDashboardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Store data from each step
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [step2Data, setStep2Data] = useState<FormData | null>(null);
  const [step3Data, setStep3Data] = useState<FormData | null>(null);
  const [step4Data, setStep4Data] = useState<FormData | null>(null);

  const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const goPrev = () => setStep((s) => Math.max(s - 1, 1));

  // Handle Step 1 completion
  const handleStep1Next = (data: Step1Data) => {
    setStep1Data(data);
    goNext();
  };

  // Handle Step 2 completion
  const handleStep2Next = (formData: FormData) => {
    setStep2Data(formData);
    goNext();
  };

  // Handle Step 3 completion
  const handleStep3Next = (formData: FormData) => {
    setStep3Data(formData);
    goNext();
  };

  // Handle Step 4 completion and final submission
  const handleStep4Next = async (formData: FormData) => {
    setStep4Data(formData);
    
    try {
      setLoading(true);
      
      // Combine all form data
      const finalFormData = new FormData();
      
      // Add Step 1 data
      if (step1Data) {
        if (step1Data.eventId) {
          finalFormData.append("eventId", step1Data.eventId);
        }
        finalFormData.append("eventName", step1Data.eventName);
        finalFormData.append("roomType", step1Data.roomType);
      }
      
      // Add Step 2 data (Room Details)
      if (step2Data) {
        for (const [key, value] of step2Data.entries()) {
          finalFormData.append(key, value);
        }
      }
      
      // Add Step 3 data (Content Assets)
      if (step3Data) {
        for (const [key, value] of step3Data.entries()) {
          finalFormData.append(key, value);
        }
      }
      
      // Add Step 4 data (Pricing)
      for (const [key, value] of formData.entries()) {
        finalFormData.append(key, value);
      }
      
      // Submit to API - the cookie will be sent automatically with withCredentials
      const response = await axios.post("/api/hostrooms", finalFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true, // This sends the HTTP-only cookie
      });
      
      console.log("host response :", response);
      
      if (response.data.success) {
        router.push(`/host/rooms/${response.data.roomId}/success`);
      } else {
        alert("Failed to create room: " + (response.data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error creating room:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          alert("Session expired. Please login again.");
          router.push("/auth/login");
        } else {
          alert(error.response?.data?.error || "Failed to create room. Please try again.");
        }
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading overlay
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-neutral-900 rounded-2xl p-8 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white font-medium">Creating your room...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {step === 1 && (
        <CreateRoomStep1
          currentStep={step}
          onNext={handleStep1Next}
          onPrev={goPrev}
        />
      )}
      {step === 2 && (
        <CreateRoomStep2
          currentStep={step}
          onNext={handleStep2Next}
          onPrev={goPrev}
        />
      )}
      {step === 3 && (
        <CreateRoomStep3
          currentStep={step}
          onNext={handleStep3Next}
          onPrev={goPrev}
        />
      )}
      {step === 4 && (
        <CreateRoomStep4
          currentStep={step}
          onNext={handleStep4Next}
          onPrev={goPrev}
        />
      )}
    </div>
  );
}