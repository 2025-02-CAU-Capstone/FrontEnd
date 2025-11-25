import { Progress } from "./ui/progress";
import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  message?: string; // App.tsx에서 원하는 텍스트 전달 가능
}

export function LoadingScreen({ message = "처리 중입니다..." }: LoadingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      
      {/* 애니메이션 로더 */}
      <div className="w-16 h-16 bg-[#0A84FF] rounded-full flex items-center justify-center mb-6 animate-pulse">
        <Loader2 className="w-8 h-8 text-white animate-spin" strokeWidth={2} />
      </div>

      {/* 메시지 */}
      <h3 className="text-gray-900 mb-2">{message}</h3>
      <p className="text-sm text-gray-600 mb-6">
        잠시만 기다려주세요.
      </p>

      {/* Progress bar */}
      <div className="w-full max-w-md">
        <Progress value={66} className="h-2" />
      </div>

      {/* 점 bouncing 애니메이션 */}
      <div className="flex gap-2 mt-8">
        <div className="w-2 h-2 bg-[#0A84FF] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-2 h-2 bg-[#0A84FF] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-2 h-2 bg-[#0A84FF] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}
