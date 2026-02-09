import { useState } from "react";
import { motion } from "framer-motion";
import { Moon, Plus, Minus } from "lucide-react";
import { useTodayData } from "@/hooks/use-today-data";

const SleepTracker = () => {
  const { data, update } = useTodayData();
  const hours = data.sleepHours;

  const add = () => update({ sleepHours: Math.min(hours + 0.5, 14) });
  const remove = () => update({ sleepHours: Math.max(hours - 0.5, 0) });

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Moon className="w-5 h-5 text-lavender" />
          <h3 className="text-base font-body font-semibold text-foreground">Sleep</h3>
        </div>
        <span className="text-sm text-muted-foreground font-body">
          {hours}h logged
        </span>
      </div>

      {/* Visual bar */}
      <div className="h-3 bg-lavender-light rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-lavender rounded-full"
          animate={{ width: `${Math.min((hours / 8) * 100, 100)}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
        />
      </div>

      <p className="text-xs text-muted-foreground font-body mb-3">
        {hours === 0
          ? "How many hours did you sleep last night?"
          : hours < 6
          ? "A bit short — rest is important for recovery."
          : hours < 8
          ? "Decent rest. Aim for 7-8 hours when you can."
          : "Great sleep! Your body will thank you. 🌙"}
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={remove}
          className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-border transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="font-body font-semibold text-foreground text-lg w-12 text-center">{hours}h</span>
        <button
          onClick={add}
          className="w-9 h-9 rounded-xl bg-lavender flex items-center justify-center text-lavender-light hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SleepTracker;
