import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Check, ChevronLeft, ChevronRight, ChevronDown, Leaf, Target, Sparkles, RotateCcw, CookingPot } from "lucide-react";
import Layout from "@/components/Layout";
import Onboarding from "@/components/Onboarding";

interface PlanItem {
  id: string;
  time: string;
  title: string;
  description: string;
  category: "meal" | "movement" | "habit" | "rest";
  completed: boolean;
  recipe?: string;
}

const categoryStyles: Record<string, { bg: string; text: string; dot: string }> = {
  meal: { bg: "bg-terracotta-light", text: "text-terracotta", dot: "bg-terracotta" },
  movement: { bg: "bg-sage-light", text: "text-sage-dark", dot: "bg-sage" },
  habit: { bg: "bg-lavender-light", text: "text-lavender", dot: "bg-lavender" },
  rest: { bg: "bg-sky-light", text: "text-sky", dot: "bg-sky" },
};

const Plan = () => {
  const [aiPlan, setAiPlan] = useState<any>(() => {
    try {
      const raw = localStorage.getItem("nourish_ai_plan");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [plan, setPlan] = useState<PlanItem[]>(() => {
    if (!aiPlan?.plan_items) return [];
    return aiPlan.plan_items.map((item: any, i: number) => ({
      id: String(i + 1),
      time: item.time,
      title: item.title,
      description: item.description,
      category: item.category as PlanItem["category"],
      completed: false,
      recipe: item.recipe || "",
    }));
  });

  const [dayOffset, setDayOffset] = useState(0);
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);

  const handlePlanGenerated = (newPlan: any) => {
    setAiPlan(newPlan);
    if (newPlan?.plan_items) {
      setPlan(
        newPlan.plan_items.map((item: any, i: number) => ({
          id: String(i + 1),
          time: item.time,
          title: item.title,
          description: item.description,
          category: item.category as PlanItem["category"],
          completed: false,
          recipe: item.recipe || "",
        }))
      );
    }
  };

  const resetPlan = () => {
    localStorage.removeItem("nourish_ai_plan");
    localStorage.removeItem("nourish_profile");
    setAiPlan(null);
    setPlan([]);
  };

  // Show onboarding if no plan yet
  if (!aiPlan) {
    return <Onboarding onComplete={handlePlanGenerated} />;
  }

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
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary breathing" />
              <h1 className="text-2xl font-display text-foreground">Your Plan</h1>
            </div>
            <button
              onClick={resetPlan}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Regenerate plan"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
          {aiPlan.summary && (
            <p className="text-sm text-muted-foreground font-body">{aiPlan.summary}</p>
          )}
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
        {totalCount > 0 && (
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
        )}

        {/* Daily timeline */}
        <div className="space-y-1">
          {plan.map((item, i) => {
            const style = categoryStyles[item.category] || categoryStyles.habit;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex gap-3 py-3"
              >
                <div className="flex flex-col items-center w-12 shrink-0">
                  <span className="text-[10px] font-body text-muted-foreground whitespace-nowrap">
                    {item.time}
                  </span>
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${style.dot}`} />
                  {i < plan.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                </div>

                <button
                  onClick={() => toggleComplete(item.id)}
                  className={`flex-1 rounded-xl px-4 py-3 text-left transition-all ${
                    item.completed ? "bg-muted/50 opacity-60" : style.bg
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors ${
                        item.completed ? "bg-primary border-primary" : "border-border"
                      }`}
                    >
                      {item.completed && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <span
                      className={`font-body font-medium text-sm flex-1 ${
                        item.completed ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {item.title}
                    </span>
                    {item.category === "meal" && item.recipe && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedRecipe(expandedRecipe === item.id ? null : item.id);
                        }}
                        className="flex items-center gap-1 text-[10px] font-body text-primary hover:text-primary/80 transition-colors"
                      >
                        <CookingPot className="w-3.5 h-3.5" />
                        Recipe
                        <ChevronDown className={`w-3 h-3 transition-transform ${expandedRecipe === item.id ? "rotate-180" : ""}`} />
                      </span>
                    )}
                  </div>
                  <p className="font-body text-xs text-muted-foreground mt-1 ml-7">
                    {item.description}
                  </p>
                </button>

                {/* Expandable recipe */}
                <AnimatePresence>
                  {item.category === "meal" && item.recipe && expandedRecipe === item.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-12 mt-1 rounded-xl bg-background border border-border p-4">
                        <div className="flex items-center gap-1.5 mb-2">
                          <CookingPot className="w-4 h-4 text-primary" />
                          <span className="font-body font-semibold text-xs text-foreground">How to cook</span>
                        </div>
                        <p className="font-body text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                          {item.recipe}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Weekly goals */}
        {aiPlan.weekly_goals && aiPlan.weekly_goals.length > 0 && (
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="font-body font-semibold text-sm text-foreground">Weekly Focus Areas</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {aiPlan.weekly_goals.map((goal: any, i: number) => (
                <div key={i} className="bg-background rounded-xl p-3">
                  <span className="font-body text-xs font-medium text-foreground">{goal.label}</span>
                  <p className="font-body text-[10px] text-muted-foreground mt-0.5">{goal.target}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI note */}
        <div className="bg-sage-light/40 rounded-2xl px-5 py-4 flex items-start gap-3">
          <Leaf className="w-4 h-4 text-sage-dark mt-0.5 shrink-0" />
          <p className="font-body text-xs text-sage-dark leading-relaxed">
            This plan was created by AI based on your profile. Tap the ↺ icon to regenerate with new details.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Plan;
