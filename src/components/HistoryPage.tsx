import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { 
  Trash2, 
  Clock, 
  Search, 
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

export function HistoryPage() {
  const [history, setHistory] = useState<History[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const [titles, setTitles] = useState<Record<number, {
    lectureTitle: string;
    chapterTitle: string;
  }> >({});

  async function fetchTitlesForHistory(historyList: History[]) {
    const result: Record<number, { lectureTitle: string; chapterTitle: string }> = {};

    for (const item of historyList) {
      try {
        // Lecture Title
        const lecRes = await fetch(`https://13-209-30-220.nip.io/api/lectures/${item.lectureId}`);
        const lecData = await lecRes.json();

        // Chapter Title
        const chapRes = await fetch(`https://13-209-30-220.nip.io/api/chapters/${item.chapterId}`);
        const chapData = await chapRes.json();

        result[item.id] = {
          lectureTitle: lecData.title,
          chapterTitle: chapData.title,
        };
      } catch (e) {
        console.error("타이틀 로딩 실패: ", e);
      }
    }

    setTitles(result);
  }
  
  const stripMilliseconds = (timestamp: string) => {
    if (!timestamp) return timestamp;
    return timestamp.split(",")[0]; // "12:34:56,789" → "12:34:56"
  };
  // Load history
  const loadHistory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchHistory();
      setHistory(data);

      fetchTitlesForHistory(data);
    } catch (err) {
      setError("기록을 불러올 수 없습니다");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Individual delete
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

  // Delete selected
  const handleDeleteSelected = async () => {
    if (!confirm(`선택한 ${selectedItems.size}개의 기록을 삭제하시겠습니까?`)) return;
    
    for (const id of selectedItems) {
      await deleteHistory(id);
    }
    setHistory(prev => prev.filter(h => !selectedItems.has(h.id)));
    setSelectedItems(new Set());
    setIsSelectionMode(false);
  };

  // Clear all
  const handleClearAll = async () => {
    if (!confirm("모든 기록을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.")) return;

    const success = await clearHistory();
    if (success) {
      setHistory([]);
    }
  };

  // Date format
  const formatDate = (iso: string) => {
    const date = parseKST(iso);       // ← 변환된 KST 날짜
    const now = parseKST(new Date().toISOString()); // ← 현재 KST

    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `오늘 ${date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (diffDays === 1) {
      return `어제 ${date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return date.toLocaleDateString("ko-KR"); // yyyy.mm.dd
    }
  };


  // KST 변환기
  // UTC ISO → KST Date 변환기
  function parseKST(isoString: string): Date {
    const utc = new Date(isoString); // 서버에서 오는 값은 UTC로 가정
    if (isNaN(utc.getTime())) return new Date(); // fallback

    // +9시간(= 9 * 60 * 60 * 1000)
    return new Date(utc.getTime() + 9 * 60 * 60 * 1000);
  }


  // Filtered history
  const getFilteredHistory = () => {
    let filtered = history;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.queryText.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Time filter
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

  // Toggle expanded item
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

  // Toggle selected
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
      {/* Header */}
      <div className="bg-gradient-pastel-purple rounded-toss p-5 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                학습 기록
                <div className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-semibold">
                  {history.length}
                </div>
              </h2>
              <p className="text-sm text-gray-600 mt-0.5">
                검색한 문제와 매칭된 강의 기록
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh button */}
            <button
              onClick={loadHistory}
              className="p-2.5 hover:bg-white/50 rounded-toss transition-all duration-200 btn-press"
              title="새로고침"
            >
              <RefreshCw className={`w-4 h-4 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Selection mode toggle */}
            {history.length > 0 && (
              <Button
                onClick={() => {
                  setIsSelectionMode(!isSelectionMode);
                  setSelectedItems(new Set());
                }}
                variant="outline"
                className="text-sm px-3 py-1.5 rounded-toss btn-press"
              >
                {isSelectionMode ? '취소' : '선택'}
              </Button>
            )}

            {/* Delete button */}
            {isSelectionMode && selectedItems.size > 0 ? (
              <Button
                onClick={handleDeleteSelected}
                variant="destructive"
                className="text-sm px-3 py-1.5 rounded-toss btn-press"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                선택 삭제 ({selectedItems.size})
              </Button>
            ) : (
              history.length > 0 && !isSelectionMode && (
                <Button
                  onClick={handleClearAll}
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50 text-sm px-3 py-1.5 rounded-toss btn-press"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  전체 삭제
                </Button>
              )
            )}
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="문제 내용으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 glass border border-gray-200 rounded-toss text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Filter buttons */}
          <div className="flex items-center gap-2">
            {(['all', 'today', 'week', 'month'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 text-sm font-medium rounded-toss transition-all btn-press ${
                  filterType === type
                    ? 'bg-white text-purple-700 shadow-soft-md'
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

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">기록을 불러오는 중...</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-5 bg-red-50 rounded-toss text-red-700 border border-red-200 shadow-soft">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">오류 발생</p>
            <p className="text-sm mt-0.5">{error}</p>
          </div>
          <Button
            onClick={loadHistory}
            variant="outline"
            className="text-red-600 border-red-300 hover:bg-red-50 text-sm rounded-toss btn-press"
          >
            다시 시도
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && filteredHistory.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-toss shadow-soft">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-toss flex items-center justify-center mx-auto mb-4">
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

      {/* History list */}
      {!isLoading && filteredHistory.length > 0 && (
        <div className="space-y-4">
          {/* Statistics cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gradient-pastel-blue rounded-toss p-4 text-center shadow-soft">
              <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{filteredHistory.length}</p>
              <p className="text-xs text-gray-600">검색 기록</p>
            </div>
            <div className="bg-gradient-pastel-green rounded-toss p-4 text-center shadow-soft">
              <Clock className="w-5 h-5 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {filteredHistory.filter(h => new Date(h.createdAt).toDateString() === new Date().toDateString()).length}
              </p>
              <p className="text-xs text-gray-600">오늘 학습</p>
            </div>
            <div className="bg-gradient-pastel-purple rounded-toss p-4 text-center shadow-soft">
              <Bookmark className="w-5 h-5 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {new Set(filteredHistory.map(h => h.lectureId)).size}
              </p>
              <p className="text-xs text-gray-600">강의 수</p>
            </div>
          </div>

          {/* History items */}
          {filteredHistory.map((item, idx) => {
            const isExpanded = expandedItems.has(item.id);
            const isSelected = selectedItems.has(item.id);

            return (
              <div
                key={item.id}
                className={`bg-white border-2 rounded-toss p-5 hover:shadow-soft-lg transition-all duration-200 list-item-appear ${
                  isSelected ? 'border-purple-500 bg-gradient-pastel-purple' : 'border-gray-200'
                }`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Selection checkbox */}
                    {isSelectionMode && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelected(item.id)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
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
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-toss transition-all btn-press"
                    >
                      {isExpanded ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                      }
                    </button>
                    {!isSelectionMode && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-toss transition-all btn-press"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Search problem */}
                <div className="bg-gray-50 rounded-toss p-4 mb-3 shadow-soft">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-800 leading-relaxed line-clamp-3">
                      {item.queryText}
                    </p>
                  </div>
                </div>

                {/* Match info */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-pastel-blue text-blue-700 rounded-toss">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-medium">
                      {stripMilliseconds(item.timestamp)}
                    </span>
                  </div>
                  
                  {item.youtubeUrl && (
                    <a
                      href={item.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-pastel-pink text-red-700 rounded-toss hover:shadow-soft-md transition-all btn-press"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span className="font-medium">YouTube에서 보기</span>
                    </a>
                  )}
                </div>

                {/* Expanded info */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 animate-slide-down">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">수업 제목</p>
                        <p className="font-medium text-gray-900">{titles[item.id]?.lectureTitle}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">강의 제목</p>
                        <p className="font-medium text-gray-900">{titles[item.id]?.chapterTitle}</p>
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
