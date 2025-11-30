import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { 
  Trash2, 
  Clock, 
  Search, 
  ArrowLeft, 
  AlertCircle,
  Filter,
  Calendar,
  PlayCircle,
  FileText,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Bookmark,
  RefreshCw
} from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

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
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // 선택 삭제
  const handleDeleteSelected = async () => {
    if (!confirm(`선택한 ${selectedItems.size}개의 기록을 삭제하시겠습니까?`)) return;
    
    for (const id of selectedItems) {
      await deleteHistory(id);
    }
    setHistory(prev => prev.filter(h => !selectedItems.has(h.id)));
    setSelectedItems(new Set());
    setIsSelectionMode(false);
  };

  // 전체 삭제
  const handleClearAll = async () => {
    if (!confirm("모든 기록을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.")) return;

    const success = await clearHistory();
    if (success) {
      setHistory([]);
    }
  };

  // 날짜 포맷
  const formatDate = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `오늘 ${date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `어제 ${date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR');
    }
  };

  // 필터링된 히스토리
  const getFilteredHistory = () => {
    let filtered = history;

    // 검색 필터
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.queryText.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 시간 필터
    const now = new Date();
    switch (filterType) {
      case 'today':
        filtered = filtered.filter(item => {
          const date = new Date(item.createdAt);
          return date.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(item => new Date(item.createdAt) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(item => new Date(item.createdAt) >= monthAgo);
        break;
    }

    return filtered;
  };

  const filteredHistory = getFilteredHistory();

  // 아이템 토글
  const toggleExpanded = (id: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // 선택 토글
  const toggleSelected = (id: number) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2.5 hover:bg-white/50 rounded-xl transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                학습 기록
                <div className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full font-semibold">
                  {history.length}
                </div>
              </h2>
              <p className="text-sm text-gray-600 mt-0.5">
                검색한 문제와 매칭된 강의 기록
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 새로고침 버튼 */}
            <button
              onClick={loadHistory}
              className="p-2.5 hover:bg-white/50 rounded-xl transition-all duration-200"
              title="새로고침"
            >
              <RefreshCw className={`w-4 h-4 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* 선택 모드 토글 */}
            {history.length > 0 && (
              <Button
                onClick={() => {
                  setIsSelectionMode(!isSelectionMode);
                  setSelectedItems(new Set());
                }}
                variant="outline"
                className="text-sm px-3 py-1.5"
              >
                {isSelectionMode ? '취소' : '선택'}
              </Button>
            )}

            {/* 삭제 버튼 */}
            {isSelectionMode && selectedItems.size > 0 && (
              <Button
                onClick={handleDeleteSelected}
                className="text-white bg-red-500 hover:bg-red-600 text-sm px-3 py-1.5"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                {selectedItems.size}개 삭제
              </Button>
            )}

            {!isSelectionMode && history.length > 0 && (
              <Button
                onClick={handleClearAll}
                variant="outline"
                className="text-red-500 border-red-200 hover:bg-red-50 text-sm px-3 py-1.5"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                전체 삭제
              </Button>
            )}
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="문제 내용으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* 필터 버튼들 */}
          <div className="flex items-center gap-2">
            {(['all', 'today', 'week', 'month'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                  filterType === type
                    ? 'bg-white text-indigo-700 shadow-md'
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                {type === 'all' && '전체'}
                {type === 'today' && '오늘'}
                {type === 'week' && '이번 주'}
                {type === 'month' && '이번 달'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 로딩 */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">기록을 불러오는 중...</p>
          </div>
        </div>
      )}

      {/* 에러 */}
      {error && (
        <div className="flex items-center gap-3 p-5 bg-red-50 rounded-2xl text-red-700 border border-red-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">오류 발생</p>
            <p className="text-sm mt-0.5">{error}</p>
          </div>
          <Button
            onClick={loadHistory}
            variant="outline"
            className="text-red-600 border-red-300 hover:bg-red-50 text-sm"
          >
            다시 시도
          </Button>
        </div>
      )}

      {/* 빈 상태 */}
      {!isLoading && !error && filteredHistory.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            {searchQuery || filterType !== 'all' ? (
              <Filter className="w-10 h-10 text-gray-400" />
            ) : (
              <Search className="w-10 h-10 text-gray-400" />
            )}
          </div>
          <h3 className="text-gray-700 font-semibold mb-2">
            {searchQuery || filterType !== 'all' ? '검색 결과가 없습니다' : '아직 기록이 없습니다'}
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            {searchQuery || filterType !== 'all' 
              ? '다른 검색어나 필터를 시도해보세요.'
              : '문제를 검색하면 여기에 기록이 저장됩니다.'}
          </p>
        </div>
      )}

      {/* 기록 목록 */}
      {!isLoading && filteredHistory.length > 0 && (
        <div className="space-y-4">
          {/* 통계 카드 */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{filteredHistory.length}</p>
              <p className="text-xs text-gray-600">검색 기록</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <Clock className="w-5 h-5 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {filteredHistory.filter(h => new Date(h.createdAt).toDateString() === new Date().toDateString()).length}
              </p>
              <p className="text-xs text-gray-600">오늘 학습</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <Bookmark className="w-5 h-5 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {new Set(filteredHistory.map(h => h.lectureId)).size}
              </p>
              <p className="text-xs text-gray-600">강의 수</p>
            </div>
          </div>

          {/* 히스토리 아이템들 */}
          {filteredHistory.map((item) => {
            const isExpanded = expandedItems.has(item.id);
            const isSelected = selectedItems.has(item.id);

            return (
              <div
                key={item.id}
                className={`bg-white border-2 rounded-2xl p-5 hover:shadow-lg transition-all duration-200 ${
                  isSelected ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    {/* 선택 체크박스 */}
                    {isSelectionMode && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelected(item.id)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">{formatDate(item.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleExpanded(item.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                    >
                      {isExpanded ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                      }
                    </button>
                    {!isSelectionMode && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 검색 문제 */}
                <div className="bg-gray-50 rounded-xl p-4 mb-3">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-800 leading-relaxed line-clamp-3">
                      {item.queryText}
                    </p>
                  </div>
                </div>

                {/* 매칭 정보 */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-medium">{item.timestamp}</span>
                  </div>
                  
                  {item.youtubeUrl && (
                    <a
                      href={item.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span className="font-medium">YouTube에서 보기</span>
                    </a>
                  )}
                </div>

                {/* 확장된 정보 */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">강의 ID</p>
                        <p className="font-medium text-gray-900">#{item.lectureId || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">챕터 ID</p>
                        <p className="font-medium text-gray-900">#{item.chapterId || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}