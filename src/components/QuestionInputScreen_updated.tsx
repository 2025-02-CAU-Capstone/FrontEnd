import { ArrowLeft, Camera, Upload, X, Image, FileImage, Sparkles } from "lucide-react";
import { InteractiveButton } from "./ui/interactive-button";
import { InteractiveIconButton } from "./ui/interactive-icon-button";
import { Progress } from "./ui/progress";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";

interface QuestionInputScreenProps {
  onNavigate: (screen: string) => void;
}

export function QuestionInputScreen({ onNavigate }: QuestionInputScreenProps) {
  const [imageUploaded, setImageUploaded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (processing) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => onNavigate("text-edit"), 300);
            return 100;
          }
          return prev + 10;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [processing, onNavigate]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0] && files[0].type.startsWith("image/")) {
      setIsLoading(true);
      setTimeout(() => {
        handleImageUpload();
        setIsLoading(false);
      }, 500);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setIsLoading(true);
      setTimeout(() => {
        handleImageUpload();
        setIsLoading(false);
      }, 500);
    }
  };

  const handleImageUpload = () => {
    setImageUploaded(true);
  };

  const handleAnalyze = () => {
    setProcessing(true);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur-sm shadow-sm">
        <InteractiveIconButton 
          onClick={() => onNavigate("home")}
          className="bg-white shadow-md hover:shadow-lg"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </InteractiveIconButton>
        <h3 className="font-semibold text-gray-900">문제 업로드</h3>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-6 overflow-auto">
        <AnimatePresence mode="wait">
          {!imageUploaded ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 flex flex-col items-center justify-center"
            >
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative w-full max-w-sm aspect-[4/3] border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 overflow-hidden group ${
                  isDragging
                    ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 scale-[1.02]"
                    : isLoading
                    ? "border-gray-300 bg-gray-50"
                    : "border-gray-300 hover:border-blue-400 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50"
                }`}
              >
                {/* 배경 패턴 */}
                <div className="absolute inset-0 opacity-5">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="10" cy="10" r="1" fill="currentColor" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isLoading}
                />

                {isLoading ? (
                  <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center animate-pulse shadow-lg">
                      <Sparkles className="w-10 h-10 text-white animate-spin" />
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">이미지 로딩 중...</p>
                      <p className="text-sm text-gray-500 mt-1">잠시만 기다려주세요</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4 relative z-10">
                    <div className={`relative transition-all duration-300 ${
                      isDragging ? "scale-110" : "group-hover:scale-105"
                    }`}>
                      {/* 메인 아이콘 컨테이너 */}
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                        <Upload className="w-10 h-10 text-white" strokeWidth={1.5} />
                      </div>
                      
                      {/* 플로팅 아이콘들 */}
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center animate-bounce">
                        <Image className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center animate-bounce" style={{ animationDelay: '0.1s' }}>
                        <FileImage className="w-4 h-4 text-indigo-500" />
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-800 font-medium text-lg mb-2">
                        {isDragging ? "여기에 놓으세요!" : "이미지를 업로드하세요"}
                      </p>
                      <p className="text-sm text-gray-500">
                        드래그 앤 드롭 또는 클릭하여 선택
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        JPG, PNG, GIF, WEBP (최대 10MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full max-w-sm space-y-3 mt-6">
                <InteractiveButton
                  onClick={handleImageUpload}
                  variant="primary"
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  사진 촬영
                </InteractiveButton>
                <InteractiveButton
                  onClick={handleImageUpload}
                  variant="secondary"
                  className="w-full h-12 bg-white border-2 border-gray-200 hover:border-blue-300 shadow-md hover:shadow-lg"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  갤러리에서 선택
                </InteractiveButton>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="analyze"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 flex flex-col"
            >
              <div className="relative w-full max-w-sm mx-auto aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 mb-6 shadow-2xl">
                {/* Mock uploaded image */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center p-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="bg-white rounded-xl p-6 shadow-lg w-full">
                    <div className="text-sm space-y-3">
                      <p className="mb-3 font-medium">다음 선지 중 옳은 것을 고르시오.</p>
                      <p className="text-gray-700">ㄱ. 수요의 법칙은 가격이 상승하면 수요량이 감소하는 현상을 설명한다.</p>
                      <p className="text-gray-700">ㄴ. 시장 균형은 수요와 공급이 일치하는 점에서 달성된다.</p>
                      <p className="text-gray-700">ㄷ. 완전 경쟁 시장은 소수의 공급자가 시장을 지배한다.</p>
                    </div>
                  </div>
                </motion.div>

                {/* 오버레이 그라디언트 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="absolute top-2 right-2"
                >
                  <InteractiveIconButton
                    onClick={() => setImageUploaded(false)}
                    className="bg-white/95 hover:bg-white shadow-lg"
                  >
                    <X className="h-5 w-5 text-gray-700" />
                  </InteractiveIconButton>
                </motion.div>

                {/* 이미지 정보 바 */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">이미지 준비 완료</span>
                    </div>
                    <span className="text-xs opacity-75">OCR 분석 가능</span>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {processing && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">텍스트 추출 중...</p>
                      <p className="text-sm text-blue-600 font-semibold">{progress}%</p>
                    </div>
                    <Progress 
                      value={progress} 
                      className="h-2 bg-gray-200 shadow-inner"
                      variant="gradient"
                      color="blue"
                      animated
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-auto">
                <InteractiveButton
                  onClick={handleAnalyze}
                  disabled={processing}
                  variant="primary"
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      처리 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      텍스트 추출하기
                    </>
                  )}
                </InteractiveButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}