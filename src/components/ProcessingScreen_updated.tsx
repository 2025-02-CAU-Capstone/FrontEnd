import { Sparkles, Loader2, Zap, Brain } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Progress } from "./ui/progress";

interface ProcessingScreenProps {
  onNavigate: (screen: string) => void;
}

export function ProcessingScreen({ onNavigate }: ProcessingScreenProps) {
  const [currentProgress, setCurrentProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);
  
  const steps = ['텍스트 추출 중...', '핵심 개념 파악 중...', '강의 데이터베이스 검색 중...', '최적의 강의 찾는 중...'];

  // 자동 프로그레스 애니메이션
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProgress(prev => {
        if (prev >= 90) return 90;
        return prev + Math.random() * 15;
      });
    }, 500);
    
    const timer = setTimeout(() => {
      setCurrentProgress(100);
      setTimeout(() => onNavigate("results"), 300);
    }, 3000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onNavigate]);

  // 로딩 스텝 애니메이션
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % steps.length);
    }, 1000);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 items-center justify-center p-6 relative overflow-hidden">
      {/* 배경 애니메이션 */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      {/* 플로팅 장식 요소 */}
      <motion.div
        className="absolute top-20 left-20 w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full opacity-10 blur-xl"
        animate={{ y: [-10, 10, -10], x: [-5, 5, -5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-10 blur-xl"
        animate={{ y: [10, -10, 10], x: [5, -5, 5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

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
          <Brain className="w-10 w-10 text-white" strokeWidth={1.5} />
          
          {/* 플로팅 파티클 */}
          <motion.div 
            className="absolute -top-1 -right-1"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </motion.div>
        </div>
      </div>

      {/* 메시지 섹션 */}
      <div className="text-center space-y-2 mb-8">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-1 duration-500">
          AI로 문제를 분석하는 중...
        </h3>
        <p className="text-sm text-gray-600 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
          최적의 강의 구간을 찾고 있습니다
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md mb-6 space-y-2 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-200">
        <Progress 
          value={currentProgress}
          variant="gradient"
          color="blue"
          size="lg"
          animated
          className="shadow-inner"
        />
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="font-semibold">{Math.round(currentProgress)}%</span>
          <span className="text-blue-600 font-medium">{steps[loadingStep]}</span>
        </div>
      </div>

      {/* 로딩 단계 인디케이터 */}
      <div className="flex items-center gap-3 mb-6">
        {steps.map((_, index) => (
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

      {/* 팁 메시지 */}
      <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl max-w-sm animate-in fade-in duration-500 delay-500 border border-blue-200">
        <p className="text-xs text-blue-700 text-center">
          💡 AI가 가장 관련성 높은 강의 구간을 찾고 있습니다
        </p>
      </div>

      {/* 추가 정보 카드들 */}
      <div className="absolute bottom-6 left-6 right-6 flex flex-wrap gap-2 justify-center">
        <motion.div 
          className="px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 flex items-center gap-1.5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Zap className="w-3 h-3 text-blue-600" />
          <span className="text-xs text-gray-700">실시간 처리</span>
        </motion.div>
        <motion.div 
          className="px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 flex items-center gap-1.5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Brain className="w-3 h-3 text-indigo-600" />
          <span className="text-xs text-gray-700">스마트 매칭</span>
        </motion.div>
        <motion.div 
          className="px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 flex items-center gap-1.5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-700">정상 작동 중</span>
        </motion.div>
      </div>
    </div>
  );
}