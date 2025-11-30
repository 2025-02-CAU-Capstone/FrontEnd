import * as React from "react";
import { cn } from "../../lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  variant?: 'default' | 'gradient' | 'striped' | 'animated';
  color?: 'blue' | 'green' | 'red' | 'purple' | 'amber' | 'cyan';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  labelPosition?: 'inside' | 'outside' | 'tooltip';
  animated?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    className, 
    value = 0, 
    max = 100, 
    variant = 'default',
    color = 'blue',
    size = 'md',
    showLabel = false,
    labelPosition = 'inside',
    animated = true,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const [isHovered, setIsHovered] = React.useState(false);
    const [currentValue, setCurrentValue] = React.useState(0);

    // Animate progress value on mount and value change
    React.useEffect(() => {
      if (!animated) {
        setCurrentValue(percentage);
        return;
      }

      const duration = 1000; // 1 second animation
      const steps = 60;
      const increment = (percentage - currentValue) / steps;
      let current = currentValue;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        current += increment;
        
        if (step >= steps) {
          setCurrentValue(percentage);
          clearInterval(timer);
        } else {
          setCurrentValue(current);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }, [percentage, animated]);

    // Size variants
    const sizeClasses = {
      sm: "h-1",
      md: "h-2",
      lg: "h-3",
      xl: "h-4"
    };

    // Color variants
    const colorClasses = {
      blue: "from-blue-400 to-blue-600",
      green: "from-green-400 to-emerald-600",
      red: "from-red-400 to-red-600",
      purple: "from-purple-400 to-indigo-600",
      amber: "from-amber-400 to-orange-600",
      cyan: "from-cyan-400 to-blue-600"
    };

    // Variant styles
    const getBarStyle = () => {
      switch (variant) {
        case 'gradient':
          return `bg-gradient-to-r ${colorClasses[color]}`;
        case 'striped':
          return `bg-gradient-to-r ${colorClasses[color]} bg-striped`;
        case 'animated':
          return `bg-gradient-to-r ${colorClasses[color]} bg-animated-stripes`;
        default:
          return color === 'blue' ? 'bg-blue-500' : 
                 color === 'green' ? 'bg-green-500' :
                 color === 'red' ? 'bg-red-500' :
                 color === 'purple' ? 'bg-purple-500' :
                 color === 'amber' ? 'bg-amber-500' :
                 'bg-cyan-500';
      }
    };

    return (
      <div className="space-y-1">
        {/* Label outside (top) */}
        {showLabel && labelPosition === 'outside' && (
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span className="font-medium">{Math.round(currentValue)}%</span>
          </div>
        )}

        {/* Progress container */}
        <div
          ref={ref}
          className={cn(
            "relative w-full overflow-hidden rounded-full bg-gray-200 shadow-inner",
            sizeClasses[size],
            className
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          {...props}
        >
          {/* Progress bar */}
          <div
            className={cn(
              "h-full transition-all duration-300 ease-out rounded-full shadow-sm",
              getBarStyle(),
              isHovered && "shadow-md"
            )}
            style={{ 
              width: `${currentValue}%`,
              transition: animated ? 'width 0.3s ease-out' : 'none'
            }}
          >
            {/* Label inside */}
            {showLabel && labelPosition === 'inside' && percentage > 10 && (
              <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                {Math.round(currentValue)}%
              </span>
            )}
          </div>

          {/* Shine effect */}
          <div 
            className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              animation: isHovered ? 'shine 1s ease-in-out' : 'none'
            }}
          />

          {/* Tooltip */}
          {showLabel && labelPosition === 'tooltip' && isHovered && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
              {Math.round(currentValue)}%
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-4 border-transparent border-t-gray-800" />
            </div>
          )}
        </div>

        {/* Progress steps indicators */}
        {size === 'xl' && (
          <div className="relative w-full h-1 mt-2">
            <div className="absolute inset-0 flex justify-between">
              {[0, 25, 50, 75, 100].map((step) => (
                <div
                  key={step}
                  className={cn(
                    "w-1 h-1 rounded-full transition-colors duration-300",
                    currentValue >= step ? "bg-gray-600" : "bg-gray-300"
                  )}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);
Progress.displayName = "Progress";

// CSS for striped and animated variants
const progressStyles = `
@keyframes stripes {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 40px 0;
  }
}

@keyframes shine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.bg-striped {
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, .15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, .15) 50%,
    rgba(255, 255, 255, .15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 40px 40px;
}

.bg-animated-stripes {
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, .15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, .15) 50%,
    rgba(255, 255, 255, .15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 40px 40px;
  animation: stripes 1s linear infinite;
}
`;

// Style injection
if (typeof document !== 'undefined' && !document.getElementById('progress-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'progress-styles';
  styleSheet.textContent = progressStyles;
  document.head.appendChild(styleSheet);
}

// Additional Progress Ring Component
export const ProgressRing = React.forwardRef<
  SVGSVGElement,
  {
    value?: number;
    max?: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    showLabel?: boolean;
    className?: string;
  }
>(({ value = 0, max = 100, size = 60, strokeWidth = 4, color = "#3B82F6", showLabel = true, className }, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        ref={ref}
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showLabel && (
        <span className="absolute text-sm font-medium text-gray-700">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
});
ProgressRing.displayName = "ProgressRing";

export { Progress };