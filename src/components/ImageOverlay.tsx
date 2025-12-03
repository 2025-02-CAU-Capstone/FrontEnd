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

  // Zoom controls
  const handleZoomIn = () => {
    setUserScale(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setUserScale(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleResetZoom = () => {
    setUserScale(1);
  };

  // Calculate scale to fit container size
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

  // Convert bbox coordinates to scale
  const getScaledBbox = useCallback((bbox: number[][]) => {
    const minX = Math.min(...bbox.map((p) => p[0])) * scale;
    const minY = Math.min(...bbox.map((p) => p[1])) * scale;
    const maxX = Math.max(...bbox.map((p) => p[0])) * scale;
    const maxY = Math.max(...bbox.map((p) => p[1])) * scale;
    
    return { left: minX, top: minY, width: maxX - minX, height: maxY - minY, right: maxX, bottom: maxY };
  }, [scale]);

  // Generate SVG polygon points
  const getPolygonPoints = useCallback((bbox: number[][]) => {
    return bbox.map((p) => `${p[0] * scale},${p[1] * scale}`).join(" ");
  }, [scale]);

  // Individual box click
  const handleBoxClick = useCallback((e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    onToggleBox(index);
  }, [onToggleBox]);

  return (
    <div className="space-y-4">
      {/* Header section */}
      <div className="flex items-start justify-between bg-gradient-pastel-blue p-4 rounded-toss shadow-soft">
        <div className="flex-1">
          <h3 className="text-gray-900 font-semibold mb-1 flex items-center gap-2">
            텍스트 영역 선택
            <Info className="w-4 h-4 text-gray-400" />
          </h3>
          <p className="text-sm text-gray-600">
            클릭하여 텍스트 영역을 선택할 수 있습니다
          </p>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-2 glass rounded-toss p-1 shadow-soft">
          <button
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors btn-press"
            title="축소"
          >
            <ZoomOut className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-xs text-gray-600 min-w-[40px] text-center font-medium">
            {Math.round(userScale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors btn-press"
            title="확대"
          >
            <ZoomIn className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors btn-press"
            title="초기화"
          >
            <RotateCcw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Image container */}
      <div
        ref={containerRef}
        className="relative bg-gray-100 rounded-toss overflow-hidden shadow-soft"
        style={{
          width: "100%",
          height: containerSize.height || 500,
        }}
      >
        {/* Original image */}
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

        {/* Masking layer */}
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

        {/* Text box overlay */}
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
                {/* Box area */}
                <polygon
                  points={getPolygonPoints(box.box)}
                  fill={isSelected 
                    ? "rgba(91, 124, 250, 0.25)" 
                    : isHovered 
                      ? "rgba(91, 124, 250, 0.15)"
                      : "rgba(255, 255, 255, 0.05)"}
                  stroke={isSelected 
                    ? "#5b7cfa" 
                    : isHovered
                      ? "#93BBFC"
                      : "rgba(148, 163, 184, 0.4)"}
                  strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1}
                  className="cursor-pointer transition-all duration-200"
                  onClick={(e) => handleBoxClick(e, index)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />

                {/* Selected check mark */}
                {isSelected && (
                  <g className="animate-spring-in">
                    <circle
                      cx={scaledBbox.left + 14}
                      cy={scaledBbox.top + 14}
                      r={11}
                      fill="#5b7cfa"
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

                {/* Hover text preview (tooltip) */}
                {isHovered && !isSelected && (
                  <g className="animate-fade-in">
                    <rect
                      x={scaledBbox.left}
                      y={scaledBbox.top - 30}
                      width={Math.min(200, scaledBbox.width)}
                      height={24}
                      fill="rgba(0, 0, 0, 0.8)"
                      rx={8}
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
      </div>

      {/* Hint message */}
      {selectedIndices.length === 0 && textBoxes.length > 0 && (
        <div className="text-center py-3 px-4 bg-gradient-pastel-yellow rounded-toss border border-amber-200 shadow-soft">
          <p className="text-sm text-amber-700">
            텍스트 영역 하나를 선택하여 관련 강의를 찾아보세요
          </p>
        </div>
      )}
      
      {/* Selected state message */}
      {selectedIndices.length > 0 && (
        <div className="text-center py-3 px-4 bg-gradient-pastel-blue rounded-toss border border-blue-200 shadow-soft">
          <p className="text-sm text-blue-700">
            ✓ 텍스트가 선택되었습니다. 다른 영역을 클릭하면 선택이 변경됩니다.
          </p>
        </div>
      )}
    </div>
  );
}

// Custom scrollbar style
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(91, 124, 250, 0.3);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(91, 124, 250, 0.5);
  }
`;

// Style injection
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = scrollbarStyles;
  document.head.appendChild(style);
}
