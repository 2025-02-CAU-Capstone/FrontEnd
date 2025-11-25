import { Button } from "./ui/button";
import { CheckCircle2, AlertCircle, RotateCcw, Upload, PlayCircle } from "lucide-react";

interface MatchResult {
  lectureId: number;
  chapterId: number;
  startTimestamp: string;
  peakTimestamp?: string;
  sentence: string;
  youtubeUrl?: string; // Spring Boot가 내려줄 수도 있음
}

interface MatchResultsProps {
  result: MatchResult;
  onReset: () => void;
  onNewUpload: () => void;
  lectureUrl?: string; // "/api/chapters/{id}" 로부터 FE가 받아온 URL
}

export function MatchResults({ result, onReset, onNewUpload, lectureUrl }: MatchResultsProps) {
  const isLowScore = false; // score 없음 → 항상 성공으로 처리

  // 유튜브 링크 계산 함수
  const buildYoutubeUrl = () => {
    if (result.youtubeUrl) return result.youtubeUrl; // 백엔드가 직접 줬으면 그걸 사용

    if (!lectureUrl) return null;
    const [h, m, s] = result.startTimestamp.split(":").map(Number);
    const seconds = h * 3600 + m * 60 + s;

    return `${lectureUrl}?t=${seconds}`;
  };

  const youtubeLink = buildYoutubeUrl();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-gray-900 mb-2">
          가장 유사한 강의 부분
        </h2>
        <p className="text-sm text-gray-600">
          선택한 문제와 가장 일치하는 강의 내용을 보여드립니다
        </p>
      </div>

      <div className="rounded-xl border-2 p-6 border-[#0A84FF] bg-blue-50">
        <div className="flex items-start gap-4 mb-4">
          <CheckCircle2 className="w-6 h-6 text-[#0A84FF] flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">
              Lecture ID: {result.lectureId} / Chapter ID: {result.chapterId}
            </p>
            <p className="text-xs text-gray-500 mb-3">
              강의 시간: {result.startTimestamp}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-gray-800 leading-relaxed">{result.sentence}</p>
        </div>
      </div>

      {/* 유튜브 이동 버튼 */}
      {youtubeLink && (
        <Button
          className="w-full h-12 rounded-lg bg-red-600 hover:bg-red-700 text-white text-base flex items-center justify-center"
        >
          <a
            href={youtubeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <PlayCircle className="w-5 h-5 mr-2" />
            해당 강의로 이동하기
          </a>
        </Button>
      )}

      <div className="flex gap-3 mt-4">
        <Button
          onClick={onReset}
          variant="outline"
          className="flex-1 h-11 rounded-lg border-gray-300 hover:border-[#0A84FF] hover:text-[#0A84FF]"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          다시 비교하기
        </Button>
        <Button
          onClick={onNewUpload}
          className="flex-1 h-11 rounded-lg bg-[#0A84FF] hover:bg-[#0066CC] text-white"
        >
          <Upload className="w-4 h-4 mr-2" />
          새 이미지 업로드
        </Button>
      </div>
    </div>
  );
}
