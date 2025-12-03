import { useEffect, useState } from "react";
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
  confidence?: number;
  lectureTitle?: string;
  chapterTitle?: string;
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
  const [lectureTitle, setLectureTitle] = useState<string | null>(null);
  const [chapterTitle, setChapterTitle] = useState<string | null>(null);

  useEffect(() => {
      async function fetchTitles() {
        try {
          const lecRes = await fetch(`https://13-209-30-220.nip.io/api/lectures/${result.lectureId}`);
          const lecData = await lecRes.json();
          setLectureTitle(lecData.title);

          const chapRes = await fetch(`https://13-209-30-220.nip.io/api/chapters/${result.chapterId}`);
          const chapData = await chapRes.json();
          setChapterTitle(chapData.title);
        } catch (err) {
          console.error("제목을 불러오지 못했습니다", err);
        }
      }

      fetchTitles();
    }, [result.lectureId, result.chapterId]);
  // Getting rid of the milliseconds part
  const stripMilliseconds = (timestamp: string) => {
    if (!timestamp) return timestamp;
    return timestamp.split(",")[0]; // "12:34:56,789" -> "12:34:56"
  };

  // Build YouTube link function
  const buildYoutubeUrl = () => {
    if (result.youtubeUrl) return result.youtubeUrl;

    if (!lectureUrl) return null;
    const baseTs = stripMilliseconds(result.startTimestamp);
    const [h, m, s] = baseTs.split(":").map(Number);
    const seconds = h * 3600 + m * 60 + s;

    return `${lectureUrl}?t=${seconds}`;
  };

  const youtubeLink = buildYoutubeUrl();

  // Extract YouTube video ID from URL
  const getYoutubeVideoId = (url: string): string | null => {
    if (!url) return null;
    
    // Handle youtu.be format
    const youtubeShortRegex = /youtu\.be\/([a-zA-Z0-9_-]+)/;
    const shortMatch = url.match(youtubeShortRegex);
    if (shortMatch) return shortMatch[1];
    
    // Handle youtube.com/watch format
    const youtubeRegex = /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/;
    const match = url.match(youtubeRegex);
    if (match) return match[1];
    
    // Handle youtube.com/embed format
    const embedRegex = /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/;
    const embedMatch = url.match(embedRegex);
    if (embedMatch) return embedMatch[1];
    
    return null;
  };

  

  // Build YouTube embed URL with timestamp
  const getYoutubeEmbedUrl = (): string | null => {
    if (!youtubeLink) return null;
    
    const videoId = getYoutubeVideoId(youtubeLink);
    if (!videoId) return null;
    
    // Convert timestamp to seconds
    const baseTs = stripMilliseconds(result.startTimestamp);
  const [h, m, s] = baseTs.split(":").map(Number);
    const startSeconds = h * 3600 + m * 60 + s;
    
    // Build embed URL with proper parameters
    // start: 시작 시간 (초 단위)
    // rel=0: 관련 동영상 표시 안함
    // modestbranding=1: YouTube 로고 최소화
    // enablejsapi=1: JavaScript API 활성화
    return `https://www.youtube.com/embed/${videoId}?start=${startSeconds}&autoplay=0&rel=0&modestbranding=1&enablejsapi=1`;
  };

  const embedUrl = getYoutubeEmbedUrl();

  // Copy timestamp
  const handleCopyTimestamp = () => {
    navigator.clipboard.writeText(result.startTimestamp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Save bookmark (actual implementation needed)
  const handleSave = () => {
    setSaved(true);
    // Implement actual save logic
  };

  // Color based on confidence
  const getConfidenceColor = (confidence: number = 85) => {
    if (confidence >= 90) return "text-green-600 bg-gradient-pastel-green border-green-200";
    if (confidence >= 70) return "text-blue-600 bg-gradient-pastel-blue border-blue-200";
    return "text-amber-600 bg-gradient-pastel-yellow border-amber-200";
  };

  const confidence = result.confidence || 92;

  return (
    <div className="space-y-6 animate-spring-in">
      {/* Success header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-toss shadow-soft-lg animate-bounce-soft">
          <CheckCircle2 className="w-8 h-8 text-white" />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            매칭 성공
          </h2>
          <p className="text-sm text-gray-600">
            가장 관련성 높은 강의 구간을 찾았습니다!
          </p>
        </div>
      </div>

      {/* Main result card */}
      <div className="relative rounded-toss border-2 border-blue-500 bg-gradient-pastel-blue p-6 shadow-soft-lg card-interactive">
        {/* Background pattern */}
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

        {/* Lecture information */}
        <div className="relative space-y-4">
          {/* Lecture meta info */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5 px-3 py-1 glass rounded-toss shadow-soft">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-gray-700">{lectureTitle}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 glass rounded-toss shadow-soft">
              <span className="text-gray-700">{chapterTitle}</span>
            </div>
            <button
              onClick={handleCopyTimestamp}
              className="flex items-center gap-1.5 px-3 py-1 glass rounded-toss shadow-soft hover:shadow-soft-md transition-all btn-press group"
            >
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-gray-700">
                {stripMilliseconds(result.startTimestamp)}
              </span>
              {copied ? (
                <CheckCheck className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
              )}
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-toss transition-all btn-press ${
                saved 
                  ? 'bg-gradient-pastel-yellow text-amber-700' 
                  : 'glass hover:shadow-soft-md text-gray-600 hover:text-gray-800'
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

      {/* YouTube embedded video */}
      {embedUrl && (
        <div className="space-y-3 animate-spring-in">
          {/* Video container */}
          <div className="relative rounded-toss overflow-hidden shadow-soft-lg border-2 border-gray-200 bg-black">
            <div className="relative" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
              <iframe
                src={embedUrl}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
                style={{ border: 0 }}
              />
            </div>
          </div>

          {/* Video info */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-soft" />
                <span>타임스탬프: {stripMilliseconds(result.startTimestamp)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse-soft" />
                <span>{lectureTitle}</span>
              </div>
            </div>
            
            {/* Open in new tab button */}
            {youtubeLink && (
              <a
                href={youtubeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-toss transition-colors btn-press"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>새 탭에서 열기</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={onReset}
          variant="outline"
          className="h-12 rounded-toss border-gray-300 hover:border-blue-400 hover:bg-gradient-pastel-blue transition-all duration-200 group btn-press"
        >
          <RotateCcw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
          <span className="font-medium">다시 검색</span>
        </Button>
        <Button
          onClick={onNewUpload}
          className="h-12 rounded-toss bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-purple-600 text-white font-medium shadow-soft-md hover:shadow-soft-lg transition-all duration-200 btn-press"
        >
          <Upload className="w-4 h-4 mr-2" />
          <span>새 이미지</span>
        </Button>
      </div>

      {/* Learning tip card */}
      <div className="p-4 bg-gradient-pastel-purple rounded-toss border border-purple-200 shadow-soft">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-purple-500 rounded-toss flex items-center justify-center flex-shrink-0">
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
