import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Trash2, Clock, Search, ArrowLeft, AlertCircle } from "lucide-react";

import {
  fetchHistory,
  deleteHistory,
  clearHistory,
  type History,
} from "../services/historyService";

interface HistoryPageProps {
  onBack: () => void;
}

export function HistoryPage({ onBack }: HistoryPageProps) {
  const [history, setHistory] = useState<History[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 히스토리 불러오기
  const loadHistory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchHistory();
      setHistory(data);
    } catch (err) {
      setError("기록을 불러올 수 없습니다");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // 개별 삭제
  const handleDelete = async (id: number) => {
    const success = await deleteHistory(id);
    if (success) {
      setHistory((prev) => prev.filter((h) => h.id !== id));
    }
  };

  // 전체 삭제
  const handleClearAll = async () => {
    if (!confirm("모든 기록을 삭제하시겠습니까?")) return;

    const success = await clearHistory();
    if (success) {
      setHistory([]);
    }
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString("ko-KR");
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">검색 기록</h2>
            <p className="text-sm text-gray-500">
              이전에 검색한 문제와 매칭된 강의 기록
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <Button
            onClick={handleClearAll}
            variant="outline"
            className="text-red-500 border-red-300 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            전체 삭제
          </Button>
        )}
      </div>

      {/* 로딩 */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#0A84FF] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* 에러 */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 빈 상태 */}
      {!isLoading && !error && history.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-gray-700 font-medium mb-2">검색 기록이 없습니다!</h3>
          <p className="text-sm text-gray-500">
            문제가 검색되면 여기에 기록이 저장됩니다.
          </p>
        </div>
      )}

      {/* 기록 목록 */}
      {!isLoading && history.length > 0 && (
        <div className="space-y-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md"
            >
              {/* 상단 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(item.createdAt)}</span>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-3">
                <p className="text-xs text-gray-500">검색한 문제</p>
                <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3">
                  {item.queryText}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  강의 시간: {item.timestamp}
                </p>
              </div>

              <a
                href={item.youtubeUrl}
                target="_blank"
                className="text-blue-600 text-sm underline mt-2 inline-block"
              >
                유튜브에서 보기
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
