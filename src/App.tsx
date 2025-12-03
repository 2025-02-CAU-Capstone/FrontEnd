import { useState, useEffect } from 'react';
import { ImageUpload } from './components/ImageUpload';
import { ImageOverlay } from './components/ImageOverlay';
import { LoadingScreen } from './components/LoadingScreen';
import { MatchResults } from './components/MatchResults';
import { HistoryPage } from './components/HistoryPage';
import { OnboardingScreen } from './components/OnboardingScreen';
import { MyPage } from './components/MyPage';
import { BottomNavigation } from './components/BottomNavigation';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Button } from './components/ui/button';
import { AlertCircle } from 'lucide-react';

import { 
  requestOCR, 
  requestSimilaritySearch, 
  type MatchResult,
  type TextBox
} from './services/ocrService';

type AppStep = 'upload' | 'ocr' | 'loading' | 'result';
type AppPage = 'main' | 'history' | 'mypage' | 'onboarding';

export default function App() {
  // Page navigation state
  const [page, setPage] = useState<AppPage>('main');
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  
  // App progress state
  const [step, setStep] = useState<AppStep>('upload');
  
  // Data state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [, setSelectedText] = useState<string>('');
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  
  // UI state
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [isCompareLoading, setIsCompareLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if onboarding should be shown
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('p2l_onboarding_completed');
    if (!hasCompletedOnboarding) {
      setPage('onboarding');
    }
  }, []);

  // Handle page transitions
  const changePage = (newPage: AppPage) => {
    setIsPageTransitioning(true);
    setTimeout(() => {
      setPage(newPage);
      setIsPageTransitioning(false);
    }, 300);
  };

  // Image upload handler
  const handleImageUpload = async (file: File) => {
    setError(null);
    setStep('upload');
    setIsOcrLoading(true);
    
    // Image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const result = await requestOCR(file);

      // Use GPT post-processed results (processed_groups)
      const processed_groups = result.processed_groups || [];

      // Convert processed_groups to TextBox
      const processedTextBoxes: TextBox[] = processed_groups
        .map((g: any) => {
          if (!g.group_position || g.group_position.length === 0) return null;

          // group_position: [[x1,y1,x2,y2], ...] multiple boxes to single bounding box
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

          // Polygon coordinates in format expected by ImageOverlay [ [x,y], ... ] 4 points
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

      console.log("Processed TextBoxes:", processedTextBoxes);

      // Pass to ImageOverlay
      if (processedTextBoxes.length > 0) {
        setTextBoxes(processedTextBoxes);
      } else {
        setError("GPT 후처리 결과(processed_groups)가 비어 있습니다.");
      }

      // Set image size (can be supplemented later if backend doesn't provide)
      if (result.imageWidth && result.imageHeight) {
        setImageSize({
          width: result.imageWidth,
          height: result.imageHeight,
        });
      } else {
        console.warn("imageWidth / imageHeight가 응답에 없습니다.");
      }

      setStep('ocr');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OCR 처리 중 오류가 발생했습니다');
      setStep('ocr');
    } finally {
      setIsOcrLoading(false);
    }
  };

  // Complete image and state reset (for new image button)
  const handleClearImage = () => {
    setUploadedImage(null);
    setTextBoxes([]);
    setImageSize({ width: 0, height: 0 });
    setSelectedIndices([]);
    setMatchResult(null);
    setError(null);
    setSelectedText('');
    
    // After state reset, move to upload step on main screen
    setStep('upload');
    changePage('main');
  };

  // Text box selection logic - Single selection only
  const handleToggleBox = (index: number) => {
    setSelectedIndices(prev =>
      prev.includes(index)
        ? [] // Deselect if already selected
        : [index] // Select only this index
    );
  };

  const handleSelectBoxes = (indices: number[]) => {
    setSelectedIndices(prev => {
      const newSet = new Set([...prev, ...indices]);
      return Array.from(newSet);
    });
  };

  // const handleSelectAll = () => {
  //   if (selectedIndices.length === textBoxes.length) {
  //     setSelectedIndices([]);
  //   } else {
  //     setSelectedIndices(textBoxes.map((_, i) => i));
  //   }
  // };

  // Compare with lecture
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

  // Rendering: Onboarding Page
  if (page === 'onboarding') {
    return (
      <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-20">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Header showSubtitle={false} />
          <OnboardingScreen
            onComplete={() => {
              localStorage.setItem('p2l_onboarding_completed', 'true');
              changePage('main');
            }}
            onSkip={() => {
              localStorage.setItem('p2l_onboarding_completed', 'true');
              changePage('main');
            }}
          />
          <Footer />
        </div>
        
      </div>
      <BottomNavigation activePage={page} onNavigate={changePage} />
      </>
    );
  }

  // Rendering: History Page
  if (page === 'history') {
    return (
      <>
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-20 ${isPageTransitioning ? 'page-transition-exit-active' : 'page-transition-enter-active'}`}>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Header showSubtitle={false} />
          <div className="bg-white rounded-toss-lg shadow-soft-lg p-6">
            <HistoryPage />
          </div>
          <Footer />
        </div>
        
      </div>

      <BottomNavigation activePage={page} onNavigate={changePage} />
      </>
      
    );
  }

  // Rendering: My Page
  if (page === 'mypage') {
    return (
      <>
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-20 ${isPageTransitioning ? 'page-transition-exit-active' : 'page-transition-enter-active'}`}>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Header showSubtitle={false} />
          <div className="bg-white rounded-toss-lg shadow-soft-lg p-6">
            <MyPage />
          </div>
          <Footer />
        </div>
        
      </div>
      <BottomNavigation activePage={page} onNavigate={changePage} />
      </>
    );
  }

  // Rendering: Main Page
  return (
    <>
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-20 ${isPageTransitioning ? 'page-transition-exit-active' : 'page-transition-enter-active'}`}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Header />

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-toss flex items-center gap-3 shadow-soft animate-slide-up">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700 text-sm flex-1">{error}</p>
          </div>
        )}

        {/* Main card area */}
        <div className="bg-white rounded-toss-lg shadow-soft-lg p-6 animate-spring-in">
          
          {/* 1. Upload screen */}
          {step === 'upload' && (
            <>
              <ImageUpload
                onImageUpload={handleImageUpload}
                uploadedImage={uploadedImage}
                onClearImage={handleClearImage}
              />
              {isOcrLoading && (
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center gap-2 text-primary">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>텍스트 분석 중...</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* 2. OCR result and selection screen */}
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

              {/* Compare button */}
              <Button
                onClick={handleCompare}
                disabled={selectedIndices.length === 0 || isCompareLoading}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-purple-600 text-white rounded-toss h-12 disabled:opacity-50 disabled:cursor-not-allowed btn-press shadow-soft-md"
              >
                {isCompareLoading 
                  ? "처리 중..." 
                  : selectedIndices.length > 0
                    ? "선택한 텍스트로 강의 찾기"
                    : "텍스트를 선택해주세요"}
              </Button>

              {/* New Image button */}
              <Button
                onClick={handleClearImage}
                variant="outline"
                className="w-full h-11 rounded-toss btn-press"
              >
                새 이미지
              </Button>
            </div>
          )}

          {/* 3. Loading screen */}
          {step === 'loading' && <LoadingScreen />}

          {/* 4. Result screen */}
          {step === 'result' && matchResult && (
            <MatchResults
              result={matchResult}
              onReset={handleReset}
              onNewUpload={handleNewUpload}
            />
          )}
        </div>

        <Footer />
      </div>
      
    </div>
    <BottomNavigation activePage={page} onNavigate={changePage} />
    </>
  );
}
