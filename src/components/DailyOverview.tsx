import { motion } from "framer-motion";
import ProgressRing from "./ProgressRing";
import { Leaf, TrendingUp } from "lucide-react";
import { useTodayData } from "@/hooks/use-today-data";

const WATER_GOAL = 8;
const MEAL_GOAL = 4;
const STEP_GOAL = 8000;
const SLEEP_GOAL = 8;

const DailyOverview = () => {
  const { data } = useTodayData();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const waterPct = Math.min(Math.round((data.water / WATER_GOAL) * 100), 100);
  const mealPct = Math.min(Math.round((data.meals / MEAL_GOAL) * 100), 100);
  const stepPct = Math.min(Math.round((data.steps / STEP_GOAL) * 100), 100);
  const sleepPct = Math.min(Math.round((data.sleepHours / SLEEP_GOAL) * 100), 100);

  const avgProgress = Math.round((waterPct + mealPct + stepPct) / 3);

  const getMessage = () => {
    if (avgProgress === 0) return "Start your day — every small step counts.";
    if (avgProgress < 30) return "You've started. Keep going at your own pace.";
    if (avgProgress < 60) return "You're making steady progress. Keep going.";
    if (avgProgress < 90) return "Almost there — you're doing wonderfully today.";
    return "What an incredible day. You're shining! ✨";
  };

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
          <h1 className="text-2xl font-display text-foreground">{greeting}</h1>
          <p className="text-sm text-muted-foreground font-body mt-1">{getMessage()}</p>
        </div>
      </div>

      <div className="flex items-center justify-around mt-6">
        <ProgressRing
          value={mealPct}
          label="Nutrition"
          sublabel={`${data.meals} of ${MEAL_GOAL} meals`}
          color="hsl(var(--terracotta))"
          bgColor="hsl(var(--terracotta-light))"
        />
        <ProgressRing
          value={waterPct}
          label="Water"
          sublabel={`${data.water} of ${WATER_GOAL} glasses`}
          color="hsl(var(--sky))"
          bgColor="hsl(var(--sky-light))"
        />
        <ProgressRing
          value={stepPct}
          label="Movement"
          sublabel={`${data.steps.toLocaleString()} steps`}
          color="hsl(var(--sage))"
          bgColor="hsl(var(--sage-light))"
        />
        <ProgressRing
          value={sleepPct}
          label="Sleep"
          sublabel={`${data.sleepHours}h logged`}
          color="hsl(var(--lavender))"
          bgColor="hsl(var(--lavender-light))"
        />
      </div>

      {avgProgress > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-2 mt-5 px-4 py-2.5 rounded-xl bg-sage-light/60"
        >
          <TrendingUp className="w-4 h-4 text-sage-dark" />
          <span className="text-xs font-body text-sage-dark font-medium">
            {avgProgress}% of daily goals — consistency beats perfection
          </span>
        </motion.div>
      )}
    </div>
  );
};

export default DailyOverview;
