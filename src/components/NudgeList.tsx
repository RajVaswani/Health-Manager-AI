import { motion } from "framer-motion";
import { Droplets, Footprints, Moon, Apple } from "lucide-react";
import { type LucideIcon } from "lucide-react";

interface NudgeProps {
  icon: LucideIcon;
  message: string;
  color: string;
  bgColor: string;
  onDismiss?: () => void;
}

const NudgeCard = ({ icon: Icon, message, color, bgColor, onDismiss }: NudgeProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      whileHover={{ scale: 1.01 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${bgColor} cursor-pointer group`}
      onClick={onDismiss}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <p className="text-sm font-body text-foreground/80 flex-1">{message}</p>
      <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity font-body">
        dismiss
      </span>
    </motion.div>
  );
};

const NudgeList = () => {
  const nudges = [
    {
      icon: Droplets,
      message: "It's been a while — how about a glass of water?",
      color: "bg-sky text-sky-light",
      bgColor: "bg-sky-light",
    },
    {
      icon: Footprints,
      message: "A short walk could lift your afternoon energy.",
      color: "bg-sage text-sage-light",
      bgColor: "bg-sage-light",
    },
  ];

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground uppercase tracking-wide font-body mb-1">
        Gentle reminders
      </p>
      {nudges.map((nudge, i) => (
        <NudgeCard key={i} {...nudge} />
      ))}
    </div>
  );
};

export default NudgeList;
