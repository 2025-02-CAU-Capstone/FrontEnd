import { Camera, Upload, History, Settings, Sparkles, BookOpen, Zap } from "lucide-react";
import { InteractiveButton } from "./ui/interactive-button";
import { InteractiveIconButton } from "./ui/interactive-icon-button";
import { MascotCharacter } from "./ui/mascot-character";
import { motion } from "motion/react";

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* 배경 패턴 */}
      <div className="absolute inset-0 opacity-[0.02]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1.5" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* 플로팅 장식 요소 */}
      <motion.div
        className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full opacity-10 blur-xl"
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-40 right-10 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-10 blur-xl"
        animate={{ y: [10, -10, 10] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Header */}
      <div className="relative flex justify-between items-center p-4 z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">P2L</h1>
            <p className="text-xs text-gray-500">Problem to Lecture</p>
          </div>
        </motion.div>
        <motion.div
          className="flex gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <InteractiveIconButton 
            onClick={() => onNavigate("history")}
            className="bg-white/80 hover:bg-white shadow-md hover:shadow-lg"
          >
            <History className="h-5 w-5 text-gray-700" />
          </InteractiveIconButton>
          <InteractiveIconButton 
            onClick={() => onNavigate("settings")}
            className="bg-white/80 hover:bg-white shadow-md hover:shadow-lg"
          >
            <Settings className="h-5 w-5 text-gray-700" />
          </InteractiveIconButton>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20 relative z-10">
        <motion.div
          className="w-48 h-48 mb-8 relative"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.2,
          }}
        >
          <MascotCharacter className="w-full h-full drop-shadow-2xl" />
          {/* 빛나는 효과 */}
          <motion.div
            className="absolute -top-2 -right-2"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="w-8 h-8 text-yellow-400 filter drop-shadow-lg" />
          </motion.div>
        </motion.div>

        <motion.h2
          className="text-2xl font-bold text-center mb-3 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          어떤 문제든 즉시 도움을 받으세요!
        </motion.h2>
        <motion.p
          className="text-center text-gray-600 mb-12 max-w-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          문제를 촬영하면 AI가 분석하여
          <br />
          정확한 강의 시점을 찾아드립니다
        </motion.p>

        {/* 특징 배지들 */}
        <motion.div
          className="flex flex-wrap gap-2 justify-center mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <div className="px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-full flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-emerald-600" />
            <span className="text-xs text-emerald-700 font-medium">빠른 분석</span>
          </div>
          <div className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full flex items-center gap-1.5">
            <BookOpen className="w-3 h-3 text-blue-600" />
            <span className="text-xs text-blue-700 font-medium">정확한 매칭</span>
          </div>
          <div className="px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-full flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-purple-600" />
            <span className="text-xs text-purple-700 font-medium">AI 분석</span>
          </div>
        </motion.div>

        <motion.div
          className="w-full max-w-sm space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <InteractiveButton
            onClick={() => onNavigate("input")}
            variant="primary"
            size="lg"
            className="w-full h-14 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
          >
            <Camera className="h-5 w-5 mr-2" />
            <span className="font-semibold">사진 촬영하기</span>
          </InteractiveButton>

          <InteractiveButton
            onClick={() => onNavigate("input")}
            variant="secondary"
            size="lg"
            className="w-full h-14 bg-white/90 hover:bg-white border-2 border-gray-200 hover:border-blue-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
          >
            <Upload className="h-5 w-5 mr-2" />
            <span className="font-semibold">이미지 업로드</span>
          </InteractiveButton>
        </motion.div>
      </div>
    </div>
  );
}