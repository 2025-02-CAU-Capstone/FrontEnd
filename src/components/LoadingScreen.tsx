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

  // Auto progress animation
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

  // Loading step animation
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
    <div className="flex flex-col items-center justify-center py-12 px-4 animate-spring-in">
      {/* Main loader container */}
      <div className="relative mb-8">
        {/* Outer ring animation */}
        <div className="absolute inset-0 rounded-full animate-pulse-soft">
          <div className="w-24 h-24 rounded-full border-4 border-blue-200 opacity-30"></div>
        </div>
        <div className="absolute inset-0 rounded-full animate-ping">
          <div className="w-24 h-24 rounded-full border-2 border-blue-400 opacity-20"></div>
        </div>
        
        {/* Main icon */}
        <div className="relative w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-soft-lg animate-pulse-soft">
          {getIcon()}
          
          {/* Floating particle */}
          <div className="absolute -top-1 -right-1">
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse-soft" />
          </div>
        </div>
      </div>

      {/* Message section */}
      <div className="text-center space-y-2 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 animate-slide-up">
          {message}
        </h3>
        <p className="text-sm text-gray-600 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {subMessage}
        </p>
      </div>

      {/* Progress bar */}
      {showProgress && (
        <div className="w-full max-w-md mb-6 space-y-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Progress 
            value={currentProgress} 
            className="h-2 bg-gray-200 shadow-inner"
            variant="gradient"
            color="blue"
            animated={true}
          />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{Math.round(currentProgress)}%</span>
            <span>{steps[loadingStep]}</span>
          </div>
        </div>
      )}

      {/* Loading step indicators */}
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
                ? 'bg-primary scale-125' 
                : index < loadingStep 
                  ? 'bg-success' 
                  : 'bg-gray-300'
            }`} />
            {index < steps.length - 1 && (
              <div className={`w-8 h-0.5 transition-all duration-500 ${
                index < loadingStep ? 'bg-success' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Bouncing dots animation */}
      <div className="flex gap-2">
        {[0, 150, 300].map((delay, index) => (
          <div 
            key={index}
            className="relative"
          >
            <div 
              className="w-3 h-3 bg-gradient-to-br from-primary to-secondary rounded-full animate-bounce-soft shadow-soft"
              style={{ animationDelay: `${delay}ms` }}
            />
            <div 
              className="absolute inset-0 w-3 h-3 bg-blue-400 rounded-full animate-ping opacity-30"
              style={{ animationDelay: `${delay}ms` }}
            />
          </div>
        ))}
      </div>

      {/* Tip message (optional) */}
      {variant === 'ocr' && (
        <div className="mt-8 p-3 bg-gradient-pastel-blue rounded-toss max-w-sm animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <p className="text-xs text-blue-700 text-center">
            고화질 이미지일수록 OCR 정확도가 향상됩니다
          </p>
        </div>
      )}

      {variant === 'matching' && (
        <div className="mt-8 p-3 bg-gradient-pastel-purple rounded-toss max-w-sm animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <p className="text-xs text-purple-700 text-center">
            AI가 가장 관련성 높은 강의 구간을 찾고 있습니다
          </p>
        </div>
      )}
    </div>
  );
}
