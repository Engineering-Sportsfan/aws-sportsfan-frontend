import { Suspense } from "react";
import TriviaQuestion from "@/src/components/FanBattle-Component/Triviaquestion";

export default function TriviaQuestionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TriviaQuestion />
    </Suspense>
  );
}