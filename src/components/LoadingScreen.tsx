import { useEffect, useState } from "react";
import { Progress } from "./ui/progress";
import { Loader2, Sparkles, Zap, Brain } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
  progress?: number;
  showProgress?: boolean;
  variant?: 'default' | 'ocr' | 'matching';
}

export function LoadingScreen({ 
  message = "처리 중입니다...",
  subMessage = "잠시만 기다려주세요.",
  progress,
  showProgress = true,
  variant = 'default'
}: LoadingScreenProps) {
  const [currentProgress, setCurrentProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);

  // 자동 프로그레스 애니메이션
  useEffect(() => {
    if (progress !== undefined) {
      setCurrentProgress(progress);
    } else {
      const interval = setInterval(() => {
        setCurrentProgress(prev => {
          if (prev >= 90) return 90;
          return prev + Math.random() * 15;
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [progress]);

  // 로딩 스텝 애니메이션
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = () => {
    switch (variant) {
      case 'ocr':
        return <Brain className="w-8 h-8 text-white" strokeWidth={1.5} />;
      case 'matching':
        return <Zap className="w-8 h-8 text-white" strokeWidth={1.5} />;
      default:
        return <Loader2 className="w-8 h-8 text-white animate-spin" strokeWidth={1.5} />;
    }
  };

  const getLoadingSteps = () => {
    switch (variant) {
      case 'ocr':
        return ['이미지 분석 중...', '텍스트 추출 중...', '결과 정리 중...'];
      case 'matching':
        return ['강의 데이터 검색 중...', '유사도 계산 중...', '최적 매칭 찾는 중...'];
      default:
        return ['데이터 처리 중...', '분석 진행 중...', '마무리 작업 중...'];
    }
  };

  const steps = getLoadingSteps();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 animate-in fade-in duration-500">
      {/* 메인 로더 컨테이너 */}
      <div className="relative mb-8">
        {/* 외부 링 애니메이션 */}
        <div className="absolute inset-0 rounded-full animate-pulse">
          <div className="w-24 h-24 rounded-full border-4 border-blue-200 opacity-30"></div>
        </div>
        <div className="absolute inset-0 rounded-full animate-ping">
          <div className="w-24 h-24 rounded-full border-2 border-blue-400 opacity-20"></div>
        </div>
        
        {/* 메인 아이콘 */}
        <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-xl animate-pulse">
          {getIcon()}
          
          {/* 플로팅 파티클 */}
          <div className="absolute -top-1 -right-1">
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* 메시지 섹션 */}
      <div className="text-center space-y-2 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 animate-in fade-in slide-in-from-bottom-1 duration-500">
          {message}
        </h3>
        <p className="text-sm text-gray-600 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
          {subMessage}
        </p>
      </div>

      {/* Progress bar */}
      {showProgress && (
        <div className="w-full max-w-md mb-6 space-y-2 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-200">
          <Progress 
            value={currentProgress} 
            className="h-2 bg-gray-200 shadow-inner"
          />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{Math.round(currentProgress)}%</span>
            <span>{steps[loadingStep]}</span>
          </div>
        </div>
      )}

      {/* 로딩 단계 인디케이터 */}
      <div className="flex items-center gap-2 mb-6">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 transition-all duration-500 ${
              index === loadingStep ? 'opacity-100' : 'opacity-30'
            }`}
          >
            <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
              index === loadingStep 
                ? 'bg-blue-500 scale-125' 
                : index < loadingStep 
                  ? 'bg-green-500' 
                  : 'bg-gray-300'
            }`} />
            {index < steps.length - 1 && (
              <div className={`w-8 h-0.5 transition-all duration-500 ${
                index < loadingStep ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* 점 bouncing 애니메이션 */}
      <div className="flex gap-2">
        {[0, 150, 300].map((delay, index) => (
          <div 
            key={index}
            className="relative"
          >
            <div 
              className="w-3 h-3 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full animate-bounce shadow-lg"
              style={{ animationDelay: `${delay}ms` }}
            />
            <div 
              className="absolute inset-0 w-3 h-3 bg-blue-400 rounded-full animate-ping opacity-30"
              style={{ animationDelay: `${delay}ms` }}
            />
          </div>
        ))}
      </div>

      {/* 팁 메시지 (선택적) */}
      {variant === 'ocr' && (
        <div className="mt-8 p-3 bg-blue-50 rounded-xl max-w-sm animate-in fade-in duration-500 delay-500">
          <p className="text-xs text-blue-700 text-center">
            💡 고화질 이미지일수록 OCR 정확도가 향상됩니다
          </p>
        </div>
      )}

      {variant === 'matching' && (
        <div className="mt-8 p-3 bg-indigo-50 rounded-xl max-w-sm animate-in fade-in duration-500 delay-500">
          <p className="text-xs text-indigo-700 text-center">
            🎯 AI가 가장 관련성 높은 강의 구간을 찾고 있습니다
          </p>
        </div>
      )}
    </div>
  );
}