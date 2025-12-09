import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { X, ChevronRight, ChevronLeft, Check, Upload, Search as SearchIcon, History, Sparkles } from 'lucide-react';
import step1Gif from '../assets/step1.gif';
import step2Gif from '../assets/step2.gif';
import step3Gif from '../assets/step3.gif';
import step4Gif from '../assets/step4.gif';
import step5Gif from '../assets/step5.gif';

interface OnboardingScreenProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  gifSrc: string;
  color: string;
}

export function OnboardingScreen({ onComplete, onSkip }: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps: TutorialStep[] = [
    {
      id: 1,
      title: '문제 이미지 업로드',
      description:
        '해결하고 싶은 문제의 이미지를 업로드하세요. 드래그 앤 드롭 또는 클릭으로 간편하게 선택할 수 있습니다.',
      gifSrc: step1Gif,
      color: 'from-blue-400 to-indigo-500',
    },
    {
      id: 2,
      title: '텍스트 영역 선택',
      description:
        '이미지에서 OCR로 추출된 텍스트 영역을 확인한 뒤, 해결하고 싶은 부분을 클릭하여 선택하세요.',
      gifSrc: step2Gif,
      color: 'from-purple-400 to-pink-500',
    },
    {
      id: 3,
      title: '강의 매칭',
      description:
        '선택한 문제 내용과 가장 관련성이 높은 강의 구간을 AI가 자동으로 찾아드립니다. YouTube 링크를 통해 바로 학습을 시작할 수 있습니다.',
      gifSrc: step3Gif,
      color: 'from-green-400 to-teal-500',
    },
    {
      id: 4,
      title: '다시 검색으로 다른 구간 선택',
      description:
        '이미 인식한 문제에서 "다시 검색" 버튼을 눌러 다른 텍스트 구간을 선택할 수 있습니다. 새로 선택한 구간도 동일한 방식으로 강의 매칭이 가능합니다.',
      gifSrc: step4Gif,
      color: 'from-amber-400 to-orange-500',
    },
    {
      id: 5,
      title: '새 이미지로 다른 문제 학습',
      description:
        '"새 이미지" 버튼을 눌러 새로운 문제 이미지를 업로드할 수 있습니다. 처음과 같은 흐름으로 OCR과 강의 매칭을 다시 진행하세요.',
      gifSrc: step5Gif,
      color: 'from-blue-400 to-teal-500',
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
    {/* 카드 너비 키우기: max-w-4xl */}
    <div className="relative w-full max-w-4xl">
      {/* Main card */}
      <div className="bg-white rounded-toss-lg shadow-soft-lg p-6 md:p-10 animate-spring-in">
        {/* Progress bar (위치는 그대로 둠) */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs md:text-sm font-medium text-gray-600">
              {currentStep + 1} / {steps.length}
            </span>
            <span className="text-xs md:text-sm font-medium text-primary">
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
        <div
          className={`transition-opacity duration-300 ${
            isAnimating ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {/* ✅ GIF를 화면 대부분 차지하게 크게 */}
          <div
            className={`
              w-full mb-8
            `}
          >
            <div
              className={`
                relative
                w-full
                bg-gradient-to-br ${currentStepData.color}
                rounded-toss
                shadow-soft-md
                flex items-center justify-center
                overflow-hidden
                animate-bounce-soft
              `}
            >
              <img
                key={currentStepData.id}
                src={currentStepData.gifSrc}
                alt={currentStepData.title}
                className="
                  w-full
                  h-auto
                  max-h-[520px]        /* 여기 숫자 키우면 더 커짐 */
                  object-contain
                  mx-auto
                  rounded-2xl
                "
              />
            </div>
          </div>

          {/* ✅ 텍스트는 부가 설명 느낌으로 살짝 작게/좁게 */}
          <div className="text-center mb-6">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-2">
              {currentStepData.title}
            </h2>
            <p className="text-xs md:text-sm text-gray-600 leading-relaxed max-w-xl mx-auto">
              {currentStepData.description}
            </p>
          </div>

          {/* Step indicators */}
          <div className="flex justify-center gap-2 mb-6">
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
              className={`
                h-14 rounded-toss text-base btn-press
                bg-gradient-to-r from-primary to-secondary
                hover:from-primary-dark hover:to-purple-600
                text-white shadow-soft-md
                flex-1
              `}
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

        {/* Decorative elements (그대로 둬도 되고, 너무 좁으면 지워도 됨) */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-30 -z-10 animate-pulse-soft" />
        <div
          className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-purple-100 to-transparent rounded-full opacity-30 -z-10 animate-pulse-soft"
          style={{ animationDelay: '1s' }}
        />
      </div>
    </div>
  </div>
);
}
