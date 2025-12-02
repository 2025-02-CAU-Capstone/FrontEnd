import { useState } from 'react';
import { ImageUpload } from './components/ImageUpload';
import { ImageOverlay } from './components/ImageOverlay';
import { LoadingScreen } from './components/LoadingScreen';
import { MatchResults } from './components/MatchResults';
import { HistoryPage } from './components/HistoryPage';
import { Button } from './components/ui/button';
import { History, Search, AlertCircle } from 'lucide-react';

import { 
  requestOCR, 
  requestSimilaritySearch, 
  type MatchResult,
  type TextBox
} from './services/ocrService';

type AppStep = 'upload' | 'ocr' | 'loading' | 'result';
type AppPage = 'main' | 'history';

export default function App() {
  // 페이지 네비게이션 상태
  const [page, setPage] = useState<AppPage>('main');
  // 앱 진행 단계 상태
  const [step, setStep] = useState<AppStep>('upload');
  
  // 데이터 상태
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [, setSelectedText] = useState<string>(''); // 선택된 텍스트
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  
  // UI
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [isCompareLoading, setIsCompareLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 이미지 업로드 처리
  const handleImageUpload = async (file: File) => {
    setError(null);
    setStep('upload');
    setIsOcrLoading(true);
    
    // 이미지 미리보기
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const result = await requestOCR(file);

      // 🔥 1) GPT 후처리 결과만 사용 (processed_groups)
      const processed_groups = result.processed_groups || [];

      // 🔥 2) processed_groups → TextBox로 변환
      const processedTextBoxes: TextBox[] = processed_groups
        .map((g: any) => {
          if (!g.group_position || g.group_position.length === 0) return null;

          // group_position: [[x1,y1,x2,y2], ...] 여러 개 → 하나의 큰 bounding box로 합치기
          const xs: number[] = [];
          const ys: number[] = [];

          g.group_position.forEach((rect: number[]) => {
            if (rect.length === 4) {
              const [x1, y1, x2, y2] = rect;
              xs.push(x1, x2);
              ys.push(y1, y2);
            }
          });

          if (xs.length === 0 || ys.length === 0) return null;

          const minX = Math.min(...xs);
          const minY = Math.min(...ys);
          const maxX = Math.max(...xs);
          const maxY = Math.max(...ys);

          // 🔥 ImageOverlay가 기대하는 polygon 좌표 형식 [ [x,y], ... ] 4개
          const polygon = [
            [minX, minY],
            [maxX, minY],
            [maxX, maxY],
            [minX, maxY],
          ];

          return {
            text: g.merged_text ?? "",
            confidence: 1.0,
            box: polygon,
          } as TextBox;
        })
        .filter((b: TextBox | null): b is TextBox => b !== null);

      console.log("✅ processedTextBoxes:", processedTextBoxes);

      // 🔥 3) 이걸 그대로 ImageOverlay에 넘김
      if (processedTextBoxes.length > 0) {
        setTextBoxes(processedTextBoxes);
      } else {
        setError("GPT 후처리 결과(processed_groups)가 비어 있습니다.");
      }

      // 이미지 크기 설정 (백엔드에서 안 주면 나중에 보완 가능)
      if (result.imageWidth && result.imageHeight) {
        setImageSize({
          width: result.imageWidth,
          height: result.imageHeight,
        });
      } else {
        console.warn("⚠ imageWidth / imageHeight가 응답에 없습니다.");
      }

      setStep('ocr');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OCR 처리 중 오류가 발생했습니다');
      setStep('ocr');
    } finally {
      setIsOcrLoading(false);
    }
  };


  // 이미지 및 상태 완전 초기화 (새 이미지 버튼용)
  const handleClearImage = () => {
    setUploadedImage(null);
    setTextBoxes([]);
    setImageSize({ width: 0, height: 0 });
    setSelectedIndices([]);
    setMatchResult(null);
    setError(null);
    setSelectedText('');
    
    // 상태 초기화 후 메인 화면의 업로드 단계로 이동
    setStep('upload');
    setPage('main');
  };

  // 텍스트 박스 선택 로직
  const handleToggleBox = (index: number) => {
    setSelectedIndices(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleSelectBoxes = (indices: number[]) => {
    setSelectedIndices(prev => {
      const newSet = new Set([...prev, ...indices]);
      return Array.from(newSet);
    });
  };

  const handleSelectAll = () => {
    if (selectedIndices.length === textBoxes.length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(textBoxes.map((_, i) => i));
    }
  };

  // 강의와 비교
  const handleCompare = async () => {
    if (selectedIndices.length === 0) return;

    setStep('loading');
    setIsCompareLoading(true);
    setError(null);

    try {
      const text = selectedIndices
        .sort((a, b) => a - b)
        .map(index => textBoxes[index].text)
        .join(' ');
      
      setSelectedText(text);

      const result = await requestSimilaritySearch(text);
      setMatchResult(result);
      
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : '비교 처리 중 오류가 발생했습니다');
      setStep('ocr');
    } finally {
      setIsCompareLoading(false);
    }
  };

  const handleReset = () => {
    setMatchResult(null);
    setStep('ocr');
  };

  const handleNewUpload = () => {
    handleClearImage();
  };

  // ----------------------------------------------------------------
  // 렌더링: 히스토리 페이지
  // ----------------------------------------------------------------
  if (page === 'history') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <HistoryPage onBack={() => setPage('main')} />
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // 렌더링: 메인 페이지
  // (여기서는 page가 무조건 'main'이므로 조건문 없이 렌더링합니다)
  // ----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <header className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            🎯 P2L - Problem to Lecture 🎯
          </h1>
          <p className="text-gray-600">
            문제 이미지를 업로드하면 관련 강의 부분을 찾아드려요!
          </p>
          
          {/* 서버 상태 표시
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              serverStatus === 'online' ? 'bg-green-500' :
              serverStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
            }`} />
            <span className="text-xs text-gray-500">
              {serverStatus === 'online' ? '서버 연결됨' :
               serverStatus === 'offline' ? '서버 오프라인' : '서버 확인 중...'}
            </span>
          </div> */}

          {/* 메인/기록 전환 탭 */}
          {/* 에러 수정: page는 여기서 항상 'main'이므로 고정값 사용 */}
          <div className="mt-6 flex justify-center gap-2">
            <Button
              variant="default" 
              className="bg-[#0A84FF] hover:bg-[#0066CC]"
            >
              <Search className="w-4 h-4 mr-2" />
              검색
            </Button>
            <Button
              variant="outline"
              className="bg-white text-gray-900 border-gray-200"
              onClick={() => setPage('history')}
            >
              <History className="w-4 h-4 mr-2" />
              기록
            </Button>
          </div>
        </header>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* 메인 카드 영역 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          
          {/* 1. 업로드 화면 */}
          {step === 'upload' && (
            <>
              <ImageUpload
                onImageUpload={handleImageUpload}
                uploadedImage={uploadedImage}
                onClearImage={handleClearImage}
              />
              {isOcrLoading && (
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center gap-2 text-[#0A84FF]">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>텍스트 분석 중...</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* 2. OCR 결과 및 선택 화면 */}
          {step === 'ocr' && uploadedImage && (
            <div className="space-y-6">
              
              <ImageOverlay
                imageSrc={uploadedImage}
                textBoxes={textBoxes}
                selectedIndices={selectedIndices}
                onToggleBox={handleToggleBox}
                onSelectBoxes={handleSelectBoxes}
                imageWidth={imageSize.width}
                imageHeight={imageSize.height}
              />

              {/* 버튼 영역 */}
              <div className="flex gap-3">
                <Button
                  onClick={handleSelectAll}
                  variant="outline"
                  className="flex-1 h-11 rounded-lg"
                >
                  {selectedIndices.length > 0 && selectedIndices.length === textBoxes.length 
                    ? '전체 해제' 
                    : '전체 선택'}
                </Button>
                
                {/* 선택 초기화 버튼 */}
                {selectedIndices.length > 0 && (
                  <Button
                    onClick={() => setSelectedIndices([])}
                    variant="outline"
                    className="h-11 rounded-lg px-4 text-red-500 border-red-300 hover:bg-red-50"
                  >
                    선택 초기화
                  </Button>
                )}

                <Button
                  onClick={handleClearImage}
                  variant="outline"
                  className="h-11 rounded-lg px-4"
                >
                  새 이미지
                </Button>
              </div>

              {/* 비교하기 버튼 */}
              <Button
                onClick={handleCompare}
                disabled={selectedIndices.length === 0 || isCompareLoading}
                className="w-full bg-[#0A84FF] hover:bg-[#0066CC] text-white rounded-lg h-12 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCompareLoading 
                  ? "처리 중..." 
                  : `강의와 비교하기 (${selectedIndices.length}개 선택됨)`}
              </Button>
            </div>
          )}

          {/* 3. 로딩 화면 */}
          {step === 'loading' && <LoadingScreen />}

          {/* 4. 결과 화면 */}
          {step === 'result' && matchResult && (
            <MatchResults
              result={matchResult}
              onReset={handleReset}
              onNewUpload={handleNewUpload}
            />
          )}
        </div>

        <footer className="mt-8 text-center text-xs text-gray-400 leading-relaxed">
          {/* 첫 번째 줄: 핵심 브랜드 및 저작권 */}
          <span className="font-semibold text-gray-600">P2L: Problem to Lecture</span>
          <br />
          <span className="text-gray-500">Copyright © 2025 P2L. All Rights Reserved.</span>
          <br />
          {/* 두 번째 줄: 공식 출처 및 라이선스 명시 */}
          <span className="text-gray-500">Developed and operated under license from "유종의미 사회연구소".</span>
      </footer>
      </div>
    </div>
  );
}