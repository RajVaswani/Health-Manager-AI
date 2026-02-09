import { motion } from "framer-motion";
import ProgressRing from "./ProgressRing";
import { Leaf, TrendingUp } from "lucide-react";

const DailyOverview = () => {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="glass-card rounded-2xl p-6 glow-sage">
      <div className="flex items-start justify-between mb-1">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-1"
          >
            <Leaf className="w-5 h-5 text-primary breathing" />
            <span className="text-xs text-muted-foreground font-body uppercase tracking-wider">
              {today}
            </span>
          </motion.div>
          <h1 className="text-2xl font-display text-foreground">Good morning</h1>
          <p className="text-sm text-muted-foreground font-body mt-1">
            You're making steady progress. Keep going.
          </p>
        </div>
      </div>

      {/* Progress rings */}
      <div className="flex items-center justify-around mt-6">
        <ProgressRing
          value={65}
          label="Nutrition"
          sublabel="5 of 6 meals"
          color="hsl(var(--terracotta))"
          bgColor="hsl(var(--terracotta-light))"
        />
        <ProgressRing
          value={38}
          label="Water"
          sublabel="3 of 8 glasses"
          color="hsl(var(--sky))"
          bgColor="hsl(var(--sky-light))"
        />
        <ProgressRing
          value={80}
          label="Movement"
          sublabel="6,400 steps"
          color="hsl(var(--sage))"
          bgColor="hsl(var(--sage-light))"
        />
        <ProgressRing
          value={90}
          label="Sleep"
          sublabel="7.5 hours"
          color="hsl(var(--lavender))"
          bgColor="hsl(var(--lavender-light))"
        />
      </div>

      {/* Streak */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-2 mt-5 px-4 py-2.5 rounded-xl bg-sage-light/60"
      >
        <TrendingUp className="w-4 h-4 text-sage-dark" />
        <span className="text-xs font-body text-sage-dark font-medium">
          12-day streak — consistency beats perfection
        </span>
      </motion.div>
    </div>
  );
};

export default DailyOverview;
