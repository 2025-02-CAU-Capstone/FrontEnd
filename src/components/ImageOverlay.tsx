import { useRef, useEffect, useState, useCallback } from "react";
import { TextBox } from "../services/ocrService";

interface ImageOverlayProps {
  imageSrc: string;
  textBoxes: TextBox[];
  selectedIndices: number[];
  onToggleBox: (index: number) => void;
  onSelectBoxes: (indices: number[]) => void;  // 여러 박스 선택
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
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  // 컨테이너 크기에 맞게 스케일 계산
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const maxHeight = 500;
        
        const scaleX = containerWidth / imageWidth;
        const scaleY = maxHeight / imageHeight;
        const newScale = Math.min(scaleX, scaleY, 1);
        
        setScale(newScale);
        setContainerSize({
          width: imageWidth * newScale,
          height: imageHeight * newScale,
        });
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [imageWidth, imageHeight]);

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
    // 왼쪽 클릭만
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
    
    // 드래그 영역이 너무 작으면 클릭으로 처리 (5px 미만)
    if (dragRect.width < 5 && dragRect.height < 5) {
      setDragState(prev => ({ ...prev, isDragging: false }));
      return;
    }

    // 드래그 영역과 겹치는 텍스트 박스 찾기
    const overlappingIndices: number[] = [];
    
    textBoxes.forEach((box, index) => {
      const boxRect = getScaledBbox(box.box);
      if (isOverlapping(dragRect, boxRect)) {
        overlappingIndices.push(index);
      }
    });

    // 선택된 박스들 추가
    if (overlappingIndices.length > 0) {
      onSelectBoxes(overlappingIndices);
    }

    setDragState(prev => ({ ...prev, isDragging: false }));
  }, [dragState.isDragging, getDragRect, textBoxes, getScaledBbox, isOverlapping, onSelectBoxes]);

  // 개별 박스 클릭
  const handleBoxClick = useCallback((e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    // 드래그 중이 아닐 때만 토글
    if (!dragState.isDragging) {
      onToggleBox(index);
    }
  }, [dragState.isDragging, onToggleBox]);

  const dragRect = getDragRect();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-gray-900 font-medium">텍스트 영역 선택</h3>
        <p className="text-sm text-gray-500">
          드래그하여 영역 선택 또는 클릭하여 개별 선택
        </p>
      </div>

      <div
        ref={containerRef}
        className="relative rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-100 select-none"
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

        {/* 마스킹 레이어 - 선택되지 않은 영역 어둡게 */}
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

          {/* 마스킹 오버레이 (선택 안 된 영역 어둡게) */}
          {selectedIndices.length > 0 && (
            <rect
              width="100%"
              height="100%"
              fill="rgba(0, 0, 0, 0.5)"
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
            const scaledBbox = getScaledBbox(box.box);

            return (
              <g key={index} style={{ pointerEvents: "auto" }}>
                {/* 클릭 가능한 영역 */}
                <polygon
                  points={getPolygonPoints(box.box)}
                  fill={isSelected ? "rgba(10, 132, 255, 0.3)" : "rgba(255, 255, 255, 0.1)"}
                  stroke={isSelected ? "#0A84FF" : "rgba(100, 100, 100, 0.5)"}
                  strokeWidth={isSelected ? 2 : 1}
                  className="cursor-pointer transition-all hover:fill-blue-200/50 hover:stroke-blue-400"
                  onClick={(e) => handleBoxClick(e, index)}
                />

                {/* 선택 체크 표시 */}
                {isSelected && (
                  <>
                    <circle
                      cx={scaledBbox.left + 12}
                      cy={scaledBbox.top + 12}
                      r={10}
                      fill="#0A84FF"
                    />
                    <path
                      d={`M ${scaledBbox.left + 7} ${scaledBbox.top + 12} L ${scaledBbox.left + 11} ${scaledBbox.top + 16} L ${scaledBbox.left + 17} ${scaledBbox.top + 8}`}
                      stroke="white"
                      strokeWidth={2}
                      fill="none"
                    />
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {/* 드래그 선택 영역 표시 */}
        {dragState.isDragging && dragRect.width > 5 && dragRect.height > 5 && (
          <div
            className="absolute border-2 border-[#0A84FF] bg-blue-500/20 pointer-events-none"
            style={{
              left: dragRect.left,
              top: dragRect.top,
              width: dragRect.width,
              height: dragRect.height,
            }}
          />
        )}
      </div>

      {/* 선택된 텍스트 목록 */}
      {selectedIndices.length > 0 && (
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-700 font-medium mb-2">
            선택된 텍스트 ({selectedIndices.length}개)
          </p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedIndices.sort((a, b) => a - b).map((idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-sm text-gray-800 bg-white rounded-lg px-3 py-2"
              >
                <span className="text-blue-500 font-medium min-w-[24px]">{idx + 1}.</span>
                <span className="flex-1">{textBoxes[idx]?.text}</span>
                <button
                  onClick={() => onToggleBox(idx)}
                  className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
