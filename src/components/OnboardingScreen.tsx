import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { X, ChevronRight, ChevronLeft, Check, Upload, Search as SearchIcon, History, Sparkles } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export function OnboardingScreen({ onComplete, onSkip }: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps: TutorialStep[] = [
    {
      id: 1,
      title: '문제 이미지 업로드',
      description: '해결하고 싶은 문제의 이미지를 업로드하세요. 드래그 앤 드롭 또는 클릭하여 선택할 수 있습니다.',
      icon: <Upload className="w-12 h-12" />,
      color: 'from-blue-400 to-indigo-500',
    },
    {
      id: 2,
      title: '텍스트 영역 선택',
      description: '이미지에서 OCR로 추출된 텍스트 영역을 확인하고, 원하는 텍스트를 클릭하여 선택하세요.',
      icon: <SearchIcon className="w-12 h-12" />,
      color: 'from-purple-400 to-pink-500',
    },
    {
      id: 3,
      title: '강의 매칭',
      description: '선택한 문제 내용과 가장 관련성 높은 강의 구간을 AI가 자동으로 찾아드립니다. YouTube 링크를 통해 바로 학습할 수 있습니다.',
      icon: <Sparkles className="w-12 h-12" />,
      color: 'from-green-400 to-teal-500',
    },
    {
      id: 4,
      title: '학습 기록',
      description: '검색한 모든 문제와 매칭된 강의는 기록에 자동 저장됩니다. 언제든지 다시 확인하고 복습할 수 있습니다.',
      icon: <History className="w-12 h-12" />,
      color: 'from-amber-400 to-orange-500',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 150);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('p2l_onboarding_completed', 'true');
    onComplete();
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="flex items-center justify-center animate-fade-in py-4">
      <div className="relative w-full max-w-2xl">
        {/* Main card */}
        <div className="bg-white rounded-toss-lg shadow-soft-lg p-8 md:p-12 animate-spring-in">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-600">
                {currentStep + 1} / {steps.length}
              </span>
              <span className="text-sm font-medium text-primary">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
            {/* Icon */}
            <div className={`w-24 h-24 mx-auto mb-6 bg-gradient-to-br ${currentStepData.color} rounded-toss flex items-center justify-center text-white shadow-soft-md animate-bounce-soft`}>
              {currentStepData.icon}
            </div>

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-4">
              {currentStepData.title}
            </h2>

            {/* Description */}
            <p className="text-gray-600 text-center leading-relaxed mb-8 max-w-md mx-auto">
              {currentStepData.description}
            </p>

            {/* Step indicators */}
            <div className="flex justify-center gap-2 mb-8">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => {
                    setIsAnimating(true);
                    setTimeout(() => {
                      setCurrentStep(index);
                      setIsAnimating(false);
                    }, 150);
                  }}
                  className={`transition-all duration-300 rounded-full btn-press ${
                    index === currentStep
                      ? 'w-8 h-3 bg-gradient-to-r from-primary to-secondary'
                      : index < currentStep
                      ? 'w-3 h-3 bg-primary'
                      : 'w-3 h-3 bg-gray-300'
                  }`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button
                  onClick={handlePrevious}
                  variant="outline"
                  className="flex-1 h-14 rounded-toss text-base btn-press"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  이전
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                className={`h-14 rounded-toss text-base btn-press bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-purple-600 text-white shadow-soft-md ${
                  currentStep === 0 ? 'flex-1' : 'flex-1'
                }`}
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    시작하기
                  </>
                ) : (
                  <>
                    다음
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-30 -z-10 animate-pulse-soft" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-purple-100 to-transparent rounded-full opacity-30 -z-10 animate-pulse-soft" style={{ animationDelay: '1s' }} />
        </div>
      </div>
    </div>
  );
}
