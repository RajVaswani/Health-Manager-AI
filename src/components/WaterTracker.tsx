import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Plus, Minus } from "lucide-react";
import { useTodayData } from "@/hooks/use-today-data";

const GOAL = 8;

const WaterTracker = () => {
  const { data, update } = useTodayData();
  const glasses = data.water;

  const add = () => update({ water: Math.min(glasses + 1, 12) });
  const remove = () => update({ water: Math.max(glasses - 1, 0) });

  const pct = Math.min((glasses / GOAL) * 100, 100);

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-sky" />
          <h3 className="text-base font-body font-semibold text-foreground">Water</h3>
        </div>
        <span className="text-sm text-muted-foreground font-body">
          {glasses}/{GOAL} glasses
        </span>
      </div>

      <div className="h-3 bg-sky-light rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-sky rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
        />
      </div>

      <div className="flex gap-1.5 mb-4 flex-wrap">
        {Array.from({ length: GOAL }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{
              scale: i < glasses ? 1 : 0.85,
              opacity: i < glasses ? 1 : 0.3,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className={`w-6 h-8 rounded-md ${i < glasses ? "bg-sky" : "bg-sky-light"}`}
          />
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={remove}
          className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-border transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={add}
          className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default WaterTracker;
