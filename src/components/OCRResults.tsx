import { Check } from "lucide-react";
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
  return (
    <div className="space-y-6 mt-6">
      <div>
        <h3 className="mb-2 text-gray-900">OCR 결과</h3>
        <p className="text-sm text-gray-600">
          비교하고 싶은 문장을 선택하세요 (여러 개 선택 가능)
        </p>
      </div>

      <div className="space-y-3">
        {sentences.map((sentence, index) => (
          <div
            key={index}
            onClick={() => onToggleSentence(index)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedSentences.includes(index)
                ? "border-[#0A84FF] bg-blue-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                  selectedSentences.includes(index)
                    ? "bg-[#0A84FF]"
                    : "bg-gray-200"
                }`}
              >
                {selectedSentences.includes(index) && (
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                )}
              </div>
              <p className="text-gray-800 flex-1">{sentence}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedSentences.length > 0 && (
        <div className="p-4 bg-[#F2F4F7] rounded-xl">
          <p className="text-sm text-gray-600 mb-2">선택된 문장</p>
          <div className="space-y-2">
            {selectedSentences.map((index) => (
              <p key={index} className="text-sm text-gray-800">
                • {sentences[index]}
              </p>
            ))}
          </div>
        </div>
      )}

      <Button
        onClick={onCompare}
        disabled={selectedSentences.length === 0 || isLoading}
        className="w-full bg-[#0A84FF] hover:bg-[#0066CC] text-white rounded-lg h-12 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "처리 중..." : "강의와 비교하기"}
      </Button>
    </div>
  );
}
