import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Check, ChevronLeft, ChevronRight, Leaf, Clock, Target, Sparkles } from "lucide-react";
import Layout from "@/components/Layout";

interface PlanItem {
  id: string;
  time: string;
  title: string;
  description: string;
  category: "meal" | "movement" | "habit" | "rest";
  completed: boolean;
}

const categoryStyles: Record<string, { bg: string; text: string; dot: string }> = {
  meal: { bg: "bg-terracotta-light", text: "text-terracotta", dot: "bg-terracotta" },
  movement: { bg: "bg-sage-light", text: "text-sage-dark", dot: "bg-sage" },
  habit: { bg: "bg-lavender-light", text: "text-lavender", dot: "bg-lavender" },
  rest: { bg: "bg-sky-light", text: "text-sky", dot: "bg-sky" },
};

const defaultPlan: PlanItem[] = [
  { id: "1", time: "7:00 AM", title: "Morning hydration", description: "Start with warm water and lemon", category: "habit", completed: true },
  { id: "2", time: "7:30 AM", title: "Light movement", description: "15 min walk or gentle stretching", category: "movement", completed: true },
  { id: "3", time: "8:30 AM", title: "Breakfast", description: "Oats with seasonal fruit, nuts & seeds", category: "meal", completed: true },
  { id: "4", time: "10:30 AM", title: "Mid-morning snack", description: "A handful of almonds or fresh fruit", category: "meal", completed: false },
  { id: "5", time: "1:00 PM", title: "Lunch", description: "Balanced plate — protein, whole grains, vegetables", category: "meal", completed: false },
  { id: "6", time: "3:00 PM", title: "Afternoon walk", description: "20 min walk — fresh air reset", category: "movement", completed: false },
  { id: "7", time: "4:30 PM", title: "Evening snack", description: "Yogurt with honey or fruit", category: "meal", completed: false },
  { id: "8", time: "7:00 PM", title: "Dinner", description: "Light dinner — soup, salad, or grilled protein", category: "meal", completed: false },
  { id: "9", time: "9:30 PM", title: "Wind down", description: "Screen off, journal, herbal tea", category: "rest", completed: false },
];

const weeklyGoals = [
  { label: "Hydration", target: "8 glasses/day", progress: 65 },
  { label: "Movement", target: "30 min/day", progress: 50 },
  { label: "Sleep", target: "7+ hours", progress: 85 },
  { label: "Vegetables", target: "3+ servings", progress: 40 },
];

const Plan = () => {
  const [plan, setPlan] = useState<PlanItem[]>(defaultPlan);
  const [dayOffset, setDayOffset] = useState(0);

  const toggleComplete = (id: string) => {
    setPlan((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + dayOffset);
  const dateStr = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const completedCount = plan.filter((p) => p.completed).length;
  const totalCount = plan.length;

  return (
    <Layout>
      <div className="space-y-5">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-primary breathing" />
            <h1 className="text-2xl font-display text-foreground">Your Plan</h1>
          </div>
          <p className="text-sm text-muted-foreground font-body">
            Adapted to your lifestyle. Gentle suggestions, not strict rules.
          </p>
        </div>

        {/* Day picker */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setDayOffset((d) => d - 1)}
            className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-border transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="font-body font-medium text-sm text-foreground">{dateStr}</span>
          </div>
          <button
            onClick={() => setDayOffset((d) => d + 1)}
            className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-border transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Progress summary */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-body font-medium text-foreground">Today's progress</span>
            <span className="text-xs font-body text-muted-foreground">
              {completedCount}/{totalCount} done
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${(completedCount / totalCount) * 100}%` }}
              transition={{ type: "spring", stiffness: 80 }}
            />
          </div>
        </div>

        {/* Daily timeline */}
        <div className="space-y-1">
          {plan.map((item, i) => {
            const style = categoryStyles[item.category];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex gap-3 py-3"
              >
                {/* Timeline */}
                <div className="flex flex-col items-center w-12 shrink-0">
                  <span className="text-[10px] font-body text-muted-foreground whitespace-nowrap">
                    {item.time}
                  </span>
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${style.dot}`} />
                  {i < plan.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                </div>

                {/* Card */}
                <button
                  onClick={() => toggleComplete(item.id)}
                  className={`flex-1 rounded-xl px-4 py-3 text-left transition-all ${
                    item.completed ? "bg-muted/50 opacity-60" : style.bg
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors ${
                        item.completed
                          ? "bg-primary border-primary"
                          : "border-border"
                      }`}
                    >
                      {item.completed && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <span
                      className={`font-body font-medium text-sm ${
                        item.completed ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>
                  <p className="font-body text-xs text-muted-foreground mt-1 ml-7">
                    {item.description}
                  </p>
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Weekly goals */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="font-body font-semibold text-sm text-foreground">Weekly Focus Areas</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {weeklyGoals.map((goal) => (
              <div key={goal.label} className="bg-background rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-body text-xs font-medium text-foreground">{goal.label}</span>
                  <span className="font-body text-[10px] text-muted-foreground">{goal.target}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 60 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI note */}
        <div className="bg-sage-light/40 rounded-2xl px-5 py-4 flex items-start gap-3">
          <Leaf className="w-4 h-4 text-sage-dark mt-0.5 shrink-0" />
          <p className="font-body text-xs text-sage-dark leading-relaxed">
            This plan adapts to you. As you log meals, track mood, and share how you feel,
            suggestions will gently shift to support your goals. No pressure, no judgment — just thoughtful guidance.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Plan;
