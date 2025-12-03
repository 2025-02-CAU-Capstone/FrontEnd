import { useState, useRef } from "react";
import { Upload, X, Image, FileImage, Sparkles } from "lucide-react";

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  uploadedImage: string | null;
  onClearImage: () => void;
}

export function ImageUpload({ onImageUpload, uploadedImage, onClearImage }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0] && files[0].type.startsWith("image/")) {
      setIsLoading(true);
      setTimeout(() => {
        onImageUpload(files[0]);
        setIsLoading(false);
      }, 500);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setIsLoading(true);
      setTimeout(() => {
        onImageUpload(files[0]);
        setIsLoading(false);
      }, 500);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {!uploadedImage ? (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`relative border-2 border-dashed rounded-toss-lg p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 overflow-hidden group ${
            isDragging
              ? "border-primary bg-gradient-pastel-blue scale-[1.02] shadow-soft-md"
              : isLoading
              ? "border-gray-300 bg-gray-50"
              : "border-gray-300 hover:border-primary hover:bg-gradient-pastel-blue hover:shadow-soft-md"
          }`}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="1" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isLoading}
          />

          {isLoading ? (
            <div className="flex flex-col items-center gap-4 animate-spring-in">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-toss flex items-center justify-center animate-pulse shadow-soft-md">
                <Sparkles className="w-10 h-10 text-white animate-spin" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">이미지 로딩 중...</p>
                <p className="text-sm text-gray-500 mt-1">잠시만 기다려주세요</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 relative z-10">
              <div className={`relative transition-all duration-300 ${
                isDragging ? "scale-110" : "group-hover:scale-105"
              }`}>
                {/* Main icon container */}
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-toss flex items-center justify-center shadow-soft-md group-hover:shadow-soft-lg transition-all duration-300">
                  <Upload className="w-10 h-10 text-white" strokeWidth={1.5} />
                </div>
                
                {/* Floating icons */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-xl shadow-soft-md flex items-center justify-center animate-bounce-soft icon-bounce">
                  <Image className="w-4 h-4 text-primary" />
                </div>
                <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-white rounded-xl shadow-soft-md flex items-center justify-center animate-bounce-soft icon-bounce" style={{ animationDelay: '0.1s' }}>
                  <FileImage className="w-4 h-4 text-secondary" />
                </div>
              </div>

              <div>
                <p className="text-gray-800 font-medium text-lg mb-2">
                  {isDragging ? "여기에 놓으세요" : "이미지를 업로드하세요"}
                </p>
                <p className="text-sm text-gray-500">
                  드래그 앤 드롭 또는 클릭하여 선택
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  JPG, PNG, GIF, WEBP (최대 10MB)
                </p>
              </div>

              {/* Upload hints */}
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-soft"></div>
                  <span>고화질 지원</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse-soft"></div>
                  <span>빠른 처리</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative rounded-toss-lg overflow-hidden border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 shadow-soft-lg animate-spring-in">
          {/* Image container */}
          <div className="relative">
            <img
              src={uploadedImage}
              alt="업로드된 이미지"
              className="w-full max-h-[500px] object-contain"
            />
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Control bar */}
          <div className="absolute top-4 right-4 flex items-center gap-2 animate-slide-down">
            <button
              onClick={onClearImage}
              className="group flex items-center gap-2 px-3 py-2 glass rounded-toss shadow-soft-md hover:shadow-soft-lg transition-all duration-200 btn-press"
            >
              <X className="w-4 h-4 text-gray-600 group-hover:text-red-500 transition-colors" />
              <span className="text-sm text-gray-600 group-hover:text-gray-800 font-medium">제거</span>
            </button>
          </div>

          {/* Image info bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-soft"></div>
                <span className="text-sm font-medium">이미지 준비 완료</span>
              </div>
              <span className="text-xs opacity-75">OCR 분석 가능</span>
            </div>
          </div>
        </div>
      )}

      {/* Supported formats */}
      {!uploadedImage && (
        <div className="flex flex-wrap gap-2 justify-center">
          {['JPG', 'PNG', 'GIF', 'WEBP'].map((format) => (
            <span
              key={format}
              className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full border border-gray-200 hover:border-primary hover:bg-gradient-pastel-blue transition-all duration-200"
            >
              {format}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
