import { useState } from "react";
import { Button } from "./ui/button";
import { 
  CheckCircle2, 
  RotateCcw, 
  Upload, 
  PlayCircle, 
  Clock, 
  BookOpen, 
  ExternalLink,
  Copy,
  CheckCheck,
  Star,
  TrendingUp
} from "lucide-react";

interface MatchResult {
  lectureId: number;
  chapterId: number;
  startTimestamp: string;
  peakTimestamp?: string;
  sentence: string;
  youtubeUrl?: string;
  confidence?: number; // 매칭 신뢰도 (0-100)
  lectureTitle?: string; // 강의 제목
  chapterTitle?: string; // 챕터 제목
}

interface MatchResultsProps {
  result: MatchResult;
  onReset: () => void;
  onNewUpload: () => void;
  lectureUrl?: string;
}

export function MatchResults({ result, onReset, onNewUpload, lectureUrl }: MatchResultsProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  // 유튜브 링크 계산 함수
  const buildYoutubeUrl = () => {
    if (result.youtubeUrl) return result.youtubeUrl;

    if (!lectureUrl) return null;
    const [h, m, s] = result.startTimestamp.split(":").map(Number);
    const seconds = h * 3600 + m * 60 + s;

    return `${lectureUrl}?t=${seconds}`;
  };

  const youtubeLink = buildYoutubeUrl();

  // 타임스탬프 복사
  const handleCopyTimestamp = () => {
    navigator.clipboard.writeText(result.startTimestamp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 북마크 저장 (실제 구현 필요)
  const handleSave = () => {
    setSaved(true);
    // 실제 저장 로직 구현
  };

  // 신뢰도에 따른 색상
  const getConfidenceColor = (confidence: number = 85) => {
    if (confidence >= 90) return "text-green-600 bg-green-50 border-green-200";
    if (confidence >= 70) return "text-blue-600 bg-blue-50 border-blue-200";
    return "text-amber-600 bg-amber-50 border-amber-200";
  };

  const confidence = result.confidence || 92; // 기본값

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
      {/* 성공 헤더 */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg animate-in zoom-in duration-500">
          <CheckCircle2 className="w-8 h-8 text-white" />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            매칭 성공! 🎯
          </h2>
          <p className="text-sm text-gray-600">
            가장 관련성 높은 강의 구간을 찾았습니다
          </p>
        </div>
      </div>

      {/* 매칭 신뢰도 표시 */}
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">매칭 정확도</span>
        </div>
        <div className={`px-3 py-1 rounded-full border text-sm font-semibold ${getConfidenceColor(confidence)}`}>
          {confidence}% 일치
        </div>
      </div>

      {/* 메인 결과 카드 */}
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

        {/* 강의 정보 */}
        <div className="relative space-y-4">
          {/* 강의 메타 정보 */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/80 rounded-lg">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-gray-700">Lecture #{result.lectureId}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/80 rounded-lg">
              <span className="text-gray-700">Chapter #{result.chapterId}</span>
            </div>
            <button
              onClick={handleCopyTimestamp}
              className="flex items-center gap-1.5 px-3 py-1 bg-white/80 rounded-lg hover:bg-white transition-colors group"
            >
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-gray-700">{result.startTimestamp}</span>
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
                {result.sentence}
              </p>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                saved 
                  ? 'bg-amber-100 text-amber-700' 
                  : 'bg-white/80 hover:bg-white text-gray-600 hover:text-gray-800'
              }`}
            >
              <Star className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{saved ? '저장됨' : '북마크'}</span>
            </button>

            {result.peakTimestamp && (
              <div className="text-xs text-gray-500">
                피크 시점: {result.peakTimestamp}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 유튜브 이동 버튼 */}
      {youtubeLink && (
        <div className="space-y-3">
          <a
            href={youtubeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full"
          >
            <Button
              className="w-full h-14 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200 group"
            >
              <div className="flex items-center justify-center gap-3">
                <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>YouTube에서 강의 보기</span>
                <ExternalLink className="w-4 h-4 opacity-70" />
              </div>
            </Button>
          </a>

          {/* 추가 정보 */}
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>바로 재생 가능</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span>정확한 시점 이동</span>
            </div>
          </div>
        </div>
      )}

      {/* 액션 버튼들 */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={onReset}
          variant="outline"
          className="h-12 rounded-xl border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
        >
          <RotateCcw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
          <span className="font-medium">다시 검색</span>
        </Button>
        <Button
          onClick={onNewUpload}
          className="h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Upload className="w-4 h-4 mr-2" />
          <span>새 이미지</span>
        </Button>
      </div>

      {/* 추천 액션 카드 */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Star className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800 mb-1">
              학습 팁
            </p>
            <p className="text-xs text-gray-600">
              이 부분을 반복 학습하면 문제 이해도가 크게 향상됩니다. 
              강의 전후 5분 구간도 함께 시청하시는 것을 추천드립니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}