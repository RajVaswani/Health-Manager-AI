import { motion } from "framer-motion";
import { Droplets, Plus, Minus } from "lucide-react";
import { useTodayData } from "@/hooks/use-today-data";

const GOAL = 8;

const WaterTracker = () => {
  const { data, update } = useTodayData();
  const glasses = data.water;

  const add = () => update({ water: Math.min(glasses + 1, 12) });
  const remove = () => update({ water: Math.max(glasses - 1, 0) });

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

      {/* Visual bar */}
      <div className="h-3 bg-sky-light rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-sky rounded-full"
          animate={{ width: `${Math.min((glasses / GOAL) * 100, 100)}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
        />
      </div>

      <p className="text-xs text-muted-foreground font-body mb-3">
        {glasses === 0
          ? "How many glasses have you had today?"
          : glasses < 4
          ? "Keep sipping — hydration fuels everything."
          : glasses < 7
          ? "Good progress. A few more to hit your goal!"
          : "Well hydrated! Your body thanks you. 💧"}
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={remove}
          className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-border transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="font-body font-semibold text-foreground text-lg w-12 text-center">{glasses}</span>
        <button
          onClick={add}
          className="w-9 h-9 rounded-xl bg-sky flex items-center justify-center text-sky-light hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default WaterTracker;
