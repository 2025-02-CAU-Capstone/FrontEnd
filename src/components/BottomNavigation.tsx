import { Search, History, User, HelpCircle } from 'lucide-react';

interface BottomNavigationProps {
  activePage: 'main' | 'history' | 'mypage' | 'onboarding';
  onNavigate: (page: 'main' | 'history' | 'mypage' | 'onboarding') => void;
}

export function BottomNavigation({ activePage, onNavigate }: BottomNavigationProps) {
  const tabs = [
    {
      id: 'onboarding' as const,
      label: '튜토리얼',
      icon: HelpCircle,
      activeColor: 'text-purple-600',
      inactiveColor: 'text-gray-400',
      bgColor: 'bg-purple-50',
    },
    {
      id: 'main' as const,
      label: '검색',
      icon: Search,
      activeColor: 'text-blue-600',
      inactiveColor: 'text-gray-400',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'history' as const,
      label: '기록',
      icon: History,
      activeColor: 'text-green-600',
      inactiveColor: 'text-gray-400',
      bgColor: 'bg-green-50',
    },
    {
      id: 'mypage' as const,
      label: '마이',
      icon: User,
      activeColor: 'text-indigo-600',
      inactiveColor: 'text-gray-400',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 safe-area-bottom shadow-soft-xl z-50"
      style={{
        willChange: 'transform',
      }}
    >
      
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activePage === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className={`flex flex-col items-center justify-center flex-1 h-full relative transition-all duration-200 btn-press ${
                  isActive ? '' : 'hover:bg-gray-50'
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-primary to-secondary rounded-b-full animate-spring-in" />
                )}

                {/* Icon container */}
                <div
                  className={`relative mb-1 transition-all duration-200 ${
                    isActive ? 'scale-110' : 'scale-100'
                  }`}
                >
                  {/* Background circle for active state */}
                  {isActive && (
                    <div
                      className={`absolute inset-0 -m-2 ${tab.bgColor} rounded-full animate-spring-in`}
                    />
                  )}
                  
                  <Icon
                    className={`w-6 h-6 relative z-10 transition-colors duration-200 ${
                      isActive ? tab.activeColor : tab.inactiveColor
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>

                {/* Label */}
                <span
                  className={`text-xs font-medium transition-all duration-200 ${
                    isActive ? tab.activeColor : tab.inactiveColor
                  }`}
                >
                  {tab.label}
                </span>

                {/* Ripple effect on tap */}
                {isActive && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-blue-100 opacity-0 rounded-full animate-ping" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
