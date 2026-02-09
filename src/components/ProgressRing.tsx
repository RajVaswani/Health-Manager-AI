import { motion } from "framer-motion";

interface ProgressRingProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  label?: string;
  sublabel?: string;
  onClick?: () => void;
}

const ProgressRing = ({
  value,
  size = 80,
  strokeWidth = 6,
  color = "hsl(var(--sage))",
  bgColor = "hsl(var(--sage-light))",
  label,
  sublabel,
  onClick,
}: ProgressRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const Wrapper = onClick ? motion.button : motion.div;

  return (
    <Wrapper
      className={`flex flex-col items-center gap-1.5 ${onClick ? "cursor-pointer" : ""}`}
      whileTap={onClick ? { scale: 0.93 } : undefined}
      onClick={onClick}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={bgColor}
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-body font-semibold text-foreground">{value}%</span>
        </div>
      </div>
      {label && <span className="text-xs font-body font-medium text-foreground">{label}</span>}
      {sublabel && <span className="text-[10px] font-body text-muted-foreground">{sublabel}</span>}
    </Wrapper>
  );
};

export default ProgressRing;
