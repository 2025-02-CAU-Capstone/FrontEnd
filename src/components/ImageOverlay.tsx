import { useRef, useEffect, useState, useCallback } from "react";
import { TextBox } from "../services/ocrService";
import { Info, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface ImageOverlayProps {
  imageSrc: string;
  textBoxes: TextBox[];
  selectedIndices: number[];
  onToggleBox: (index: number) => void;
  onSelectBoxes: (indices: number[]) => void;
  imageWidth: number;
  imageHeight: number;
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export function ImageOverlay({
  imageSrc,
  textBoxes,
  selectedIndices,
  onToggleBox,
  onSelectBoxes,
  imageWidth,
  imageHeight,
}: ImageOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [userScale, setUserScale] = useState(1);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  // 줌 컨트롤
  const handleZoomIn = () => {
    setUserScale(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setUserScale(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleResetZoom = () => {
    setUserScale(1);
  };

  // 컨테이너 크기에 맞게 스케일 계산
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const maxHeight = 500;
        
        const scaleX = containerWidth / imageWidth;
        const scaleY = maxHeight / imageHeight;
        const baseScale = Math.min(scaleX, scaleY, 1);
        
        setScale(baseScale * userScale);
        setContainerSize({
          width: imageWidth * baseScale * userScale,
          height: imageHeight * baseScale * userScale,
        });
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [imageWidth, imageHeight, userScale]);

  // bbox 좌표를 스케일에 맞게 변환
  const getScaledBbox = useCallback((bbox: number[][]) => {
    const minX = Math.min(...bbox.map((p) => p[0])) * scale;
    const minY = Math.min(...bbox.map((p) => p[1])) * scale;
    const maxX = Math.max(...bbox.map((p) => p[0])) * scale;
    const maxY = Math.max(...bbox.map((p) => p[1])) * scale;
    
    return { left: minX, top: minY, width: maxX - minX, height: maxY - minY, right: maxX, bottom: maxY };
  }, [scale]);

  // SVG 폴리곤 포인트 생성
  const getPolygonPoints = useCallback((bbox: number[][]) => {
    return bbox.map((p) => `${p[0] * scale},${p[1] * scale}`).join(" ");
  }, [scale]);

  // 드래그 영역 계산
  const getDragRect = useCallback(() => {
    const left = Math.min(dragState.startX, dragState.currentX);
    const top = Math.min(dragState.startY, dragState.currentY);
    const width = Math.abs(dragState.currentX - dragState.startX);
    const height = Math.abs(dragState.currentY - dragState.startY);
    return { left, top, width, height, right: left + width, bottom: top + height };
  }, [dragState]);

  // 두 사각형이 겹치는지 확인
  const isOverlapping = useCallback((rect1: { left: number; top: number; right: number; bottom: number }, 
                                      rect2: { left: number; top: number; right: number; bottom: number }) => {
    return !(rect1.right < rect2.left || 
             rect1.left > rect2.right || 
             rect1.bottom < rect2.top || 
             rect1.top > rect2.bottom);
  }, []);

  // 마우스 좌표를 컨테이너 기준으로 변환
  const getRelativeCoords = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  // 마우스 다운 - 드래그 시작
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    
    const coords = getRelativeCoords(e);
    setDragState({
      isDragging: true,
      startX: coords.x,
      startY: coords.y,
      currentX: coords.x,
      currentY: coords.y,
    });
  }, [getRelativeCoords]);

  // 마우스 이동 - 드래그 중
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState.isDragging) return;
    
    const coords = getRelativeCoords(e);
    setDragState(prev => ({
      ...prev,
      currentX: coords.x,
      currentY: coords.y,
    }));
  }, [dragState.isDragging, getRelativeCoords]);

  // 마우스 업 - 드래그 종료
  const handleMouseUp = useCallback(() => {
    if (!dragState.isDragging) return;

    const dragRect = getDragRect();
    
    if (dragRect.width < 5 && dragRect.height < 5) {
      setDragState(prev => ({ ...prev, isDragging: false }));
      return;
    }

    const overlappingIndices: number[] = [];
    
    textBoxes.forEach((box, index) => {
      const boxRect = getScaledBbox(box.box);
      if (isOverlapping(dragRect, boxRect)) {
        overlappingIndices.push(index);
      }
    });

    if (overlappingIndices.length > 0) {
      onSelectBoxes(overlappingIndices);
    }

    setDragState(prev => ({ ...prev, isDragging: false }));
  }, [dragState.isDragging, getDragRect, textBoxes, getScaledBbox, isOverlapping, onSelectBoxes]);

  // 개별 박스 클릭
  const handleBoxClick = useCallback((e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (!dragState.isDragging) {
      onToggleBox(index);
    }
  }, [dragState.isDragging, onToggleBox]);

  const dragRect = getDragRect();

  return (
    <div className="space-y-4">
      {/* 헤더 섹션 */}
      <div className="flex items-start justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
        <div className="flex-1">
          <h3 className="text-gray-900 font-semibold mb-1 flex items-center gap-2">
            텍스트 영역 선택
            <Info className="w-4 h-4 text-gray-400" />
          </h3>
          <p className="text-sm text-gray-600">
            드래그하여 여러 영역을 선택하거나, 클릭하여 개별 선택할 수 있습니다
          </p>
        </div>

        {/* 줌 컨트롤 */}
        <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
          <button
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="축소"
          >
            <ZoomOut className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-xs text-gray-600 min-w-[40px] text-center">
            {Math.round(userScale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="확대"
          >
            <ZoomIn className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="초기화"
          >
            <RotateCcw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* 이미지 컨테이너 */}
      <div
        ref={containerRef}
        className="relative rounded-2xl overflow-hidden border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 select-none shadow-inner"
        style={{
          width: "100%",
          height: containerSize.height || "auto",
          cursor: dragState.isDragging ? "crosshair" : "crosshair",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* 원본 이미지 */}
        <img
          src={imageSrc}
          alt="OCR 대상 이미지"
          className="absolute top-0 left-0 pointer-events-none"
          style={{
            width: containerSize.width,
            height: containerSize.height,
            objectFit: "contain",
          }}
          draggable={false}
        />

        {/* 마스킹 레이어 */}
        <svg
          className="absolute top-0 left-0 pointer-events-none"
          width={containerSize.width}
          height={containerSize.height}
          style={{ mixBlendMode: "multiply" }}
        >
          <defs>
            <mask id="selectedMask">
              <rect width="100%" height="100%" fill="white" />
              {selectedIndices.map((idx) => {
                const box = textBoxes[idx];
                if (!box) return null;
                return (
                  <polygon
                    key={`mask-${idx}`}
                    points={getPolygonPoints(box.box)}
                    fill="black"
                  />
                );
              })}
            </mask>
          </defs>

          {selectedIndices.length > 0 && (
            <rect
              width="100%"
              height="100%"
              fill="rgba(0, 0, 0, 0.4)"
              mask="url(#selectedMask)"
            />
          )}
        </svg>

        {/* 텍스트 박스 오버레이 */}
        <svg
          className="absolute top-0 left-0 pointer-events-none"
          width={containerSize.width}
          height={containerSize.height}
        >
          {textBoxes.map((box, index) => {
            const isSelected = selectedIndices.includes(index);
            const isHovered = hoveredIndex === index;
            const scaledBbox = getScaledBbox(box.box);

            return (
              <g key={index} style={{ pointerEvents: "auto" }}>
                {/* 박스 영역 */}
                <polygon
                  points={getPolygonPoints(box.box)}
                  fill={isSelected 
                    ? "rgba(59, 130, 246, 0.25)" 
                    : isHovered 
                      ? "rgba(59, 130, 246, 0.15)"
                      : "rgba(255, 255, 255, 0.05)"}
                  stroke={isSelected 
                    ? "#3B82F6" 
                    : isHovered
                      ? "#93BBFC"
                      : "rgba(148, 163, 184, 0.4)"}
                  strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1}
                  className="cursor-pointer transition-all duration-200"
                  onClick={(e) => handleBoxClick(e, index)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />

                {/* 선택 체크 마크 */}
                {isSelected && (
                  <g className="animate-in fade-in zoom-in duration-200">
                    <circle
                      cx={scaledBbox.left + 14}
                      cy={scaledBbox.top + 14}
                      r={11}
                      fill="#3B82F6"
                      stroke="white"
                      strokeWidth={2}
                    />
                    <path
                      d={`M ${scaledBbox.left + 8} ${scaledBbox.top + 14} L ${scaledBbox.left + 12} ${scaledBbox.top + 18} L ${scaledBbox.left + 20} ${scaledBbox.top + 10}`}
                      stroke="white"
                      strokeWidth={2.5}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                )}

                {/* 호버시 텍스트 미리보기 (툴팁) */}
                {isHovered && !isSelected && (
                  <g className="animate-in fade-in slide-in-from-bottom-1 duration-200">
                    <rect
                      x={scaledBbox.left}
                      y={scaledBbox.top - 30}
                      width={Math.min(200, scaledBbox.width)}
                      height={24}
                      fill="rgba(0, 0, 0, 0.8)"
                      rx={4}
                    />
                    <text
                      x={scaledBbox.left + 8}
                      y={scaledBbox.top - 12}
                      fill="white"
                      fontSize="12"
                      fontFamily="system-ui, sans-serif"
                    >
                      {box.text.slice(0, 25)}{box.text.length > 25 ? '...' : ''}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* 드래그 선택 영역 */}
        {dragState.isDragging && dragRect.width > 5 && dragRect.height > 5 && (
          <div
            className="absolute border-2 border-blue-500 bg-blue-500/10 pointer-events-none animate-in fade-in duration-75"
            style={{
              left: dragRect.left,
              top: dragRect.top,
              width: dragRect.width,
              height: dragRect.height,
              borderStyle: "dashed",
            }}
          >
            <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded">
              {dragRect.width.toFixed(0)} × {dragRect.height.toFixed(0)}
            </div>
          </div>
        )}
      </div>

      {/* 선택된 텍스트 목록 */}
      {selectedIndices.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-blue-900">
                선택된 텍스트
              </p>
              <p className="text-xs text-blue-600 mt-0.5">
                {selectedIndices.length}개 영역이 선택되었습니다
              </p>
            </div>
            <button
              onClick={() => onSelectBoxes([])}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              전체 해제
            </button>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {selectedIndices.sort((a, b) => a - b).map((idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 text-sm bg-white rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-all duration-200 group"
              >
                <span className="text-blue-500 font-semibold min-w-[28px] bg-blue-50 rounded px-1.5 py-0.5 text-xs">
                  {idx + 1}
                </span>
                <span className="flex-1 text-gray-700 leading-relaxed">{textBoxes[idx]?.text}</span>
                <button
                  onClick={() => onToggleBox(idx)}
                  className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                  title="제거"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 힌트 메시지 */}
      {selectedIndices.length === 0 && textBoxes.length > 0 && (
        <div className="text-center py-3 px-4 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-sm text-amber-700">
            💡 텍스트 영역을 선택하여 비교할 문장을 지정해주세요
          </p>
        </div>
      )}
    </div>
  );
}

// 커스텀 스크롤바 스타일
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.3);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(59, 130, 246, 0.5);
  }
`;

// 스타일 주입
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = scrollbarStyles;
  document.head.appendChild(style);
}
