import { useState } from "react";
import { motion } from "framer-motion";
import { Smile, Meh, Frown, Zap, Battery, BatteryLow } from "lucide-react";
import { useTodayData } from "@/hooks/use-today-data";

type MoodLevel = "great" | "okay" | "low" | null;
type EnergyLevel = "high" | "medium" | "low" | null;

const MoodTracker = () => {
  const { data, update } = useTodayData();
  const mood = (data.mood as MoodLevel) || null;
  const energy = (data.energy as EnergyLevel) || null;

  const setMood = (v: MoodLevel) => update({ mood: v });
  const setEnergy = (v: EnergyLevel) => update({ energy: v });

  const moods: { value: MoodLevel; icon: typeof Smile; label: string; color: string }[] = [
    { value: "great", icon: Smile, label: "Great", color: "bg-sage-light text-sage-dark" },
    { value: "okay", icon: Meh, label: "Okay", color: "bg-amber-light text-amber" },
    { value: "low", icon: Frown, label: "Low", color: "bg-terracotta-light text-terracotta" },
  ];

  const energies: { value: EnergyLevel; icon: typeof Zap; label: string; color: string }[] = [
    { value: "high", icon: Zap, label: "Energized", color: "bg-sage-light text-sage-dark" },
    { value: "medium", icon: Battery, label: "Steady", color: "bg-amber-light text-amber" },
    { value: "low", icon: BatteryLow, label: "Tired", color: "bg-lavender-light text-lavender" },
  ];

  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="text-base font-body font-semibold text-foreground mb-4">How are you feeling?</h3>

      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 font-body">Mood</p>
      <div className="flex gap-2 mb-4">
        {moods.map((m) => {
          const Icon = m.icon;
          const selected = mood === m.value;
          return (
            <motion.button
              key={m.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMood(selected ? null : m.value)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all font-body text-sm ${
                selected
                  ? `${m.color} border-transparent shadow-sm`
                  : "bg-background border-border hover:border-primary/30"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{m.label}</span>
            </motion.button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 font-body">Energy</p>
      <div className="flex gap-2">
        {energies.map((e) => {
          const Icon = e.icon;
          const selected = energy === e.value;
          return (
            <motion.button
              key={e.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => setEnergy(selected ? null : e.value)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all font-body text-sm ${
                selected
                  ? `${e.color} border-transparent shadow-sm`
                  : "bg-background border-border hover:border-primary/30"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{e.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default MoodTracker;
