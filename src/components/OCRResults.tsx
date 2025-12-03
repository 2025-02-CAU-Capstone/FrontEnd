import { useState } from "react";
import { Check, ChevronRight, FileText, Sparkles, Eye, EyeOff, Search } from "lucide-react";
import { Button } from "./ui/button";

interface OCRResultsProps {
  sentences: string[];
  selectedSentences: number[];
  onToggleSentence: (index: number) => void;
  onCompare: () => void;
  isLoading?: boolean;
}

export function OCRResults({
  sentences,
  selectedSentences,
  onToggleSentence,
  onCompare,
  isLoading = false,
}: OCRResultsProps) {
  const [showPreview, setShowPreview] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // 검색 필터링
  const filteredSentences = sentences.map((sentence, index) => ({
    sentence,
    index,
    visible: searchQuery === "" || sentence.toLowerCase().includes(searchQuery.toLowerCase())
  }));

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectedSentences.length === sentences.length) {
      // 전체 해제
      selectedSentences.forEach(index => onToggleSentence(index));
    } else {
      // 전체 선택
      sentences.forEach((_, index) => {
        if (!selectedSentences.includes(index)) {
          onToggleSentence(index);
        }
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* 헤더 섹션 */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">OCR 텍스트 추출 완료</h3>
              <p className="text-sm text-gray-600 mt-0.5">
                {sentences.length}개의 문장을 발견했습니다
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-lg transition-colors"
              title={showPreview ? "미리보기 숨기기" : "미리보기 보기"}
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 검색 바 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="문장 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/80 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>

        {/* 빠른 액션 버튼들 */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={handleSelectAll}
            className="px-3 py-1.5 bg-white/80 hover:bg-white text-gray-700 text-xs font-medium rounded-lg transition-colors"
          >
            {selectedSentences.length === sentences.length ? "전체 해제" : "전체 선택"}
          </button>
          <div className="text-xs text-gray-500">
            {selectedSentences.length > 0 && (
              <span className="font-medium text-emerald-600">
                {selectedSentences.length}개 선택됨
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 문장 목록 */}
      <div className="space-y-3 pr-2">
        {filteredSentences.map(({ sentence, index, visible }) => {
          if (!visible) return null;
          
          const isSelected = selectedSentences.includes(index);
          
          return (
            <div
              key={index}
              onClick={() => onToggleSentence(index)}
              className={`group relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-md scale-[1.02]"
                  : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* 체크박스 */}
                <div className="relative">
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                      isSelected
                        ? "bg-gradient-to-br from-emerald-500 to-teal-500 shadow-sm"
                        : "bg-gray-200 group-hover:bg-gray-300"
                    }`}
                  >
                    {isSelected && (
                      <Check className="w-3 h-3 text-white animate-in zoom-in duration-200" strokeWidth={3} />
                    )}
                  </div>
                  {isSelected && (
                    <div className="absolute inset-0 w-5 h-5 bg-emerald-400 rounded-md animate-ping opacity-30" />
                  )}
                </div>

                {/* 문장 내용 */}
                <div className="flex-1">
                  {/* 인덱스 뱃지 */}
                  <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md font-medium mb-2">
                    #{index + 1}
                  </span>
                  
                  <p className={`leading-relaxed transition-colors ${
                    isSelected ? "text-gray-900 font-medium" : "text-gray-700"
                  }`}>
                    {sentence}
                  </p>
                </div>

                {/* 선택 인디케이터 */}
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                  </div>
                )}
              </div>

              {/* 호버 효과 */}
              {!isSelected && (
                <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-emerald-200 pointer-events-none transition-all duration-200" />
              )}
            </div>
          );
        })}

        {filteredSentences.every(f => !f.visible) && (
          <div className="text-center py-8 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">검색 결과가 없습니다</p>
          </div>
        )}
      </div>

      {/* 선택된 문장 미리보기 */}
      {showPreview && selectedSentences.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 animate-in fade-in slide-in-from-bottom-1 duration-300">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Check className="w-4 h-4 text-blue-600" />
              선택한 문장 미리보기
            </h4>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
              {selectedSentences.length}개
            </span>
          </div>
          
          <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
            {selectedSentences.map((index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm bg-white/70 rounded-lg px-3 py-2"
              >
                <span className="text-blue-600 font-semibold min-w-[20px]">
                  {index + 1}.
                </span>
                <span className="text-gray-700 line-clamp-1">{sentences[index]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 비교 버튼 */}
      <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent pt-4 pb-2">
        <Button
          onClick={onCompare}
          disabled={selectedSentences.length === 0 || isLoading}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl h-14 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="font-medium">분석 중...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">강의와 비교하기</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          )}
        </Button>
        
        {selectedSentences.length === 0 && (
          <p className="text-center text-xs text-gray-500 mt-2">
            비교할 문장을 하나 이상 선택해주세요
          </p>
        )}
      </div>
    </div>
  );
}