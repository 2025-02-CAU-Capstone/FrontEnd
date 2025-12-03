import { useState } from "react";
import { Button } from "./ui/button";
import {
  User,
  Mail,
  Calendar,
  Award,
  TrendingUp,
  Clock,
  BookOpen,
  Target,
  Edit2,
  Settings,
  LogOut,
  ChevronRight,
  Sparkles,
  Trophy,
  Zap,
  CheckCircle2,
} from "lucide-react";

type RecentActivity = {
  id: number;
  date: string;
  time: string;
  problemText: string;
  lectureTitle: string;
  completed?: boolean; // optional
};

// 더미 데이터
const DUMMY_USER = {
  name: "John Doe",
  email: "johndoe@cau.ac.kr",
  joinDate: "2025-12-12",
  avatar: "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg",
  level: 5,
  experience: 2450,
  nextLevelExp: 3000,
};

const DUMMY_STATS = {
  totalSearches: 127,
  totalStudyTime: "48시간 32분",
  completedProblems: 89,
  averageAccuracy: 92,
  currentStreak: 7,
  longestStreak: 14,
};

const DUMMY_ACHIEVEMENTS = [
  {
    id: 1,
    name: "첫 검색",
    description: "첫 번째 문제를 검색했습니다",
    icon: Sparkles,
    color: "from-blue-400 to-indigo-500",
    unlocked: true,
    date: "2024-01-15",
  },
  {
    id: 2,
    name: "연속 학습 7일",
    description: "7일 연속으로 학습했습니다",
    icon: Trophy,
    color: "from-yellow-400 to-orange-500",
    unlocked: true,
    date: "2024-11-28",
  },
  {
    id: 3,
    name: "100번째 검색",
    description: "100번째 문제를 검색했습니다",
    icon: Target,
    color: "from-green-400 to-emerald-500",
    unlocked: true,
    date: "2024-11-30",
  },
  {
    id: 4,
    name: "스피드 러너",
    description: "하루에 10개 이상 문제 해결",
    icon: Zap,
    color: "from-purple-400 to-pink-500",
    unlocked: false,
    date: null,
  },
];

const DUMMY_RECENT_ACTIVITY: RecentActivity[] = [
  {
    id: 1,
    date: "2025-12-03",
    time: "14:30",
    problemText: "35강: 부양비 도표",
    lectureTitle: "2026 수능특강 사회문화",
    completed: true
  }
];

export function MyPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "achievements" | "settings">("overview");

  // 레벨 진행도 계산
  const levelProgress = (DUMMY_USER.experience / DUMMY_USER.nextLevelExp) * 100;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-spring-in">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex-1 text-center">마이페이지</h1>

        <button className="p-2.5 hover:bg-gray-100 rounded-toss transition-all duration-200 btn-press">
          <Settings className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* 프로필 카드 */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-toss-lg p-6 shadow-soft-lg text-white relative overflow-hidden">
        {/* 배경 패턴 */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="profile-dots" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#profile-dots)" />
          </svg>
        </div>

        <div className="relative">
          <div className="flex items-start gap-4">
            {/* 아바타 */}
            <div className="w-20 h-20 rounded-full overflow-hidden shadow-soft-lg flex items-center justify-center flex-shrink-0">
              <img
                src={DUMMY_USER.avatar}
                alt={DUMMY_USER.name}
                className="w-full h-full rounded-toss"
              />
            </div>

            {/* 정보 */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{DUMMY_USER.name}</h2>
                  <p className="text-blue-100 text-sm flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    {DUMMY_USER.email}
                  </p>
                </div>
                <button className="p-2 bg-white/20 hover:bg-white/30 rounded-toss transition-colors btn-press">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 text-sm text-blue-100 mb-4">
                <Calendar className="w-3.5 h-3.5" />
                <span>가입일: {DUMMY_USER.joinDate}</span>
              </div>

              {/* 레벨 & 경험치 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Level {DUMMY_USER.level}</span>
                  <span className="text-xs text-blue-100">
                    {DUMMY_USER.experience} / {DUMMY_USER.nextLevelExp} XP
                  </span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${levelProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-toss">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-toss transition-all btn-press ${
            activeTab === "overview"
              ? "bg-white text-gray-900 shadow-soft"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          개요
        </button>
        <button
          onClick={() => setActiveTab("achievements")}
          className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-toss transition-all btn-press ${
            activeTab === "achievements"
              ? "bg-white text-gray-900 shadow-soft"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          업적
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-toss transition-all btn-press ${
            activeTab === "settings"
              ? "bg-white text-gray-900 shadow-soft"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          설정
        </button>
      </div>

      {/* 탭 컨텐츠 */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-fade-in">
          {/* 학습 통계 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">학습 통계</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-gradient-pastel-blue rounded-toss p-4 shadow-soft">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-toss flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs text-gray-600">총 검색</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{DUMMY_STATS.totalSearches}</p>
              </div>

            
              <div className="bg-gradient-pastel-yellow rounded-toss p-4 shadow-soft">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-yellow-500 rounded-toss flex items-center justify-center">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs text-gray-600">현재 연속</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{DUMMY_STATS.currentStreak}일</p>
              </div>

              <div className="bg-gradient-pastel-cyan rounded-toss p-4 shadow-soft">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-cyan-500 rounded-toss flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs text-gray-600">최장 연속</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{DUMMY_STATS.longestStreak}일</p>
              </div>
            </div>
          </div>

          {/* 최근 활동 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 활동</h3>
            <div className="space-y-3">
              {DUMMY_RECENT_ACTIVITY.map((activity, idx) => (
                <div
                  key={activity.id}
                  className="bg-white border-2 border-gray-200 rounded-toss p-4 hover:shadow-soft-md transition-all duration-200 list-item-appear"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{activity.date}</span>
                      <span className="text-gray-300">•</span>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{activity.time}</span>
                    </div>
                    {activity.completed ? (
                      <div className="flex items-center gap-1 text-xs text-green-600 bg-gradient-pastel-green px-2 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        완료
                      </div>
                    ) : null }
                  </div>
                  <p className="text-gray-900 font-medium mb-1">{activity.problemText}</p>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{activity.lectureTitle}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "achievements" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">업적</h3>
            <span className="text-sm text-gray-600">
              {DUMMY_ACHIEVEMENTS.filter((a) => a.unlocked).length} / {DUMMY_ACHIEVEMENTS.length} 달성
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DUMMY_ACHIEVEMENTS.map((achievement, idx) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={achievement.id}
                  className={`rounded-toss p-5 border-2 transition-all duration-200 list-item-appear ${
                    achievement.unlocked
                      ? "bg-white border-gray-200 shadow-soft hover:shadow-soft-md"
                      : "bg-gray-50 border-gray-200 opacity-60"
                  }`}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-toss flex items-center justify-center flex-shrink-0 ${
                        achievement.unlocked
                          ? `bg-gradient-to-br ${achievement.color} shadow-soft`
                          : "bg-gray-300"
                      }`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{achievement.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                      {achievement.unlocked && achievement.date && (
                        <p className="text-xs text-gray-500">달성일: {achievement.date}</p>
                      )}
                      {!achievement.unlocked && (
                        <p className="text-xs text-gray-500">미달성</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">설정</h3>

          {/* 계정 설정 */}
          <div className="bg-white border-2 border-gray-200 rounded-toss overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h4 className="font-semibold text-gray-900">계정</h4>
            </div>
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors btn-press">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">프로필 수정</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors btn-press border-t border-gray-200">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">이메일 변경</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* 알림 설정 */}
          <div className="bg-white border-2 border-gray-200 rounded-toss overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h4 className="font-semibold text-gray-900">알림</h4>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-900">학습 리마인더</span>
                <label className="relative inline-block w-12 h-6">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-full h-full bg-gray-300 peer-checked:bg-blue-500 rounded-full peer cursor-pointer transition-colors"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-6 transition-transform"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-900">업적 알림</span>
                <label className="relative inline-block w-12 h-6">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-full h-full bg-gray-300 peer-checked:bg-blue-500 rounded-full peer cursor-pointer transition-colors"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-6 transition-transform"></div>
                </label>
              </div>
            </div>
          </div>

          {/* 로그아웃 */}
          <Button
            variant="outline"
            className="w-full h-12 rounded-toss border-red-300 text-red-600 hover:bg-red-50 btn-press"
          >
            <LogOut className="w-4 h-4 mr-2" />
            로그아웃
          </Button>
        </div>
      )}
    </div>
  );
}
