import { ArrowLeft, Play, BookOpen, Clock, Bookmark, CheckCircle2, Star, TrendingUp, ExternalLink, Copy, CheckCheck, RotateCcw, Upload } from "lucide-react";
import { InteractiveButton } from "./ui/interactive-button";
import { InteractiveIconButton } from "./ui/interactive-icon-button";
import { InteractiveCard } from "./ui/interactive-card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { motion } from "motion/react";
import { useState } from "react";

interface ResultsScreenProps {
  onNavigate: (screen: string) => void;
}

export function ResultsScreen({ onNavigate }: ResultsScreenProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const confidence = 92; // 매칭 신뢰도

  const handleCopyTimestamp = () => {
    navigator.clipboard.writeText("12:34");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    setSaved(true);
  };

  // 신뢰도에 따른 색상
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600 bg-green-50 border-green-200";
    if (confidence >= 70) return "text-blue-600 bg-blue-50 border-blue-200";
    return "text-amber-600 bg-amber-50 border-amber-200";
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b z-10 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <InteractiveIconButton 
            onClick={() => onNavigate("home")}
            className="bg-white shadow-md hover:shadow-lg"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </InteractiveIconButton>
          <h3 className="font-semibold text-gray-900">검색 결과</h3>
          <InteractiveIconButton className="bg-white shadow-md hover:shadow-lg">
            <Bookmark className={`h-5 w-5 ${saved ? 'fill-current text-amber-500' : 'text-gray-700'}`} />
          </InteractiveIconButton>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* 성공 헤더 */}
        <motion.div 
          className="text-center space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg animate-in zoom-in duration-500">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-1">
              매칭 성공! 🎯
            </h2>
            <p className="text-sm text-gray-600">
              가장 관련성 높은 강의 구간을 찾았습니다
            </p>
          </div>
        </motion.div>

        {/* 매칭 신뢰도 표시 */}
        <motion.div 
          className="flex items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">매칭 정확도</span>
          </div>
          <div className={`px-3 py-1 rounded-full border text-sm font-semibold ${getConfidenceColor(confidence)}`}>
            {confidence}% 일치
          </div>
        </motion.div>

        {/* 메인 결과 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="relative rounded-2xl border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-lg">
            {/* 배경 패턴 */}
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

            <div className="relative space-y-4">
              {/* 강의 메타 정보 */}
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/80 rounded-lg">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-gray-700">Lecture #3</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/80 rounded-lg">
                  <span className="text-gray-700">Chapter #5</span>
                </div>
                <button
                  onClick={handleCopyTimestamp}
                  className="flex items-center gap-1.5 px-3 py-1 bg-white/80 rounded-lg hover:bg-white transition-colors group"
                >
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-gray-700">12:34</span>
                  {copied ? (
                    <CheckCheck className="w-3.5 h-3.5 text-green-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                  )}
                </button>
              </div>

              {/* 매칭된 문장 */}
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-1 h-full bg-gradient-to-b from-blue-400 to-indigo-400 rounded-full" />
                  <p className="text-gray-800 leading-relaxed flex-1">
                    수요와 공급의 균형점 개념을 설명하시오.
                  </p>
                </div>
              </div>

              {/* 강의 정보 */}
              <div className="bg-white/80 rounded-xl p-4 space-y-2">
                <h4 className="font-semibold text-gray-900">5강: 수요와 공급</h4>
                <p className="text-sm text-gray-600">김민준 교수 • 2024년 2학기</p>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-600 font-medium">12:34</span>
                  <span className="text-gray-500">시장 균형</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 관련 챕터 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">관련 교과서 챕터</h3>
          </div>
          <InteractiveCard className="p-4 bg-white shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">3단원: 시장 균형</h4>
                <Badge variant="secondary" className="mb-3 shadow-sm">
                  경제학
                </Badge>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              이 단원은 수요와 공급이 만나는 시장 균형의 기본 개념을 다룹니다.
              가격 결정, 수요·공급 곡선의 이동, 시장 개입의 효과 등을 학습합니다.
            </p>
            <InteractiveButton variant="outline" className="w-full">
              챕터 보기
            </InteractiveButton>
          </InteractiveCard>
        </motion.div>

        {/* 관련 강의 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Play className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">관련 강의</h3>
          </div>
          <InteractiveCard className="p-4 border-blue-200 bg-gradient-to-br from-white to-blue-50 shadow-xl hover:shadow-2xl transition-all">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Play className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">5강: 수요와 공급</h4>
                <p className="text-sm text-gray-600 mb-2">
                  김민준 교수 • 2024년 2학기
                </p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-600 font-medium">12:34</span>
                  <span className="text-sm text-gray-500">시작 시점</span>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2 mb-4">
              <h4 className="text-sm font-semibold text-gray-900">이 구간의 주요 내용:</h4>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• 수요·공급 곡선의 이해</li>
                <li>• 균형 가격과 균형 거래량 찾기</li>
                <li>• 시장 초과와 부족</li>
                <li>• 가격 규제의 영향</li>
              </ul>
            </div>

            <InteractiveButton 
              variant="primary" 
              className="w-full h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl"
            >
              <Play className="h-5 w-5 mr-2" />
              <span className="font-semibold">YouTube에서 강의 보기</span>
              <ExternalLink className="h-4 w-4 ml-2" />
            </InteractiveButton>
          </InteractiveCard>
        </motion.div>

        {/* 액션 버튼들 */}
        <motion.div 
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <InteractiveButton
            onClick={() => onNavigate("input")}
            variant="outline"
            className="h-12 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            <span className="font-medium">다시 검색</span>
          </InteractiveButton>
          <InteractiveButton
            onClick={() => onNavigate("home")}
            className="h-12 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md hover:shadow-lg"
          >
            <Upload className="w-4 h-4 mr-2" />
            <span className="font-medium">새 이미지</span>
          </InteractiveButton>
        </motion.div>

        {/* 추천 액션 카드 */}
        <motion.div 
          className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Star className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800 mb-1">
                학습 팁
              </p>
              <p className="text-xs text-gray-600">
                이 부분을 반복 학습하면 문제 이해도가 크게 향상됩니다. 
                강의 전후 5분 구간도 함께 시청하시는 것을 추천드립니다.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}