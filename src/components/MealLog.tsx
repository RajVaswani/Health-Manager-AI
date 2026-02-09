import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UtensilsCrossed, Plus, X, Clock } from "lucide-react";

interface Meal {
  id: string;
  name: string;
  time: string;
  note: string;
}

const PRESETS = ["Breakfast", "Lunch", "Dinner", "Snack"];

const MealLog = () => {
  const [meals, setMeals] = useState<Meal[]>([
    { id: "1", name: "Breakfast", time: "8:30 AM", note: "Oats with berries & honey" },
  ]);
  const [adding, setAdding] = useState(false);
  const [newMeal, setNewMeal] = useState({ name: "", note: "" });

  const addMeal = () => {
    if (!newMeal.name.trim()) return;
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    setMeals((prev) => [
      ...prev,
      { id: Date.now().toString(), name: newMeal.name, time, note: newMeal.note },
    ]);
    setNewMeal({ name: "", note: "" });
    setAdding(false);
  };

  const removeMeal = (id: string) => setMeals((prev) => prev.filter((m) => m.id !== id));

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5 text-terracotta" />
          <h3 className="text-base font-body font-semibold text-foreground">Meals</h3>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="w-8 h-8 rounded-xl bg-terracotta-light flex items-center justify-center text-terracotta hover:opacity-80 transition-opacity"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence mode="popLayout">
        {meals.map((meal) => (
          <motion.div
            key={meal.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0"
          >
            <div className="w-2 h-2 rounded-full bg-terracotta mt-2 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-body font-medium text-sm text-foreground">{meal.name}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {meal.time}
                </span>
              </div>
              {meal.note && (
                <p className="text-xs text-muted-foreground mt-0.5 font-body">{meal.note}</p>
              )}
            </div>
            <button
              onClick={() => removeMeal(meal.id)}
              className="text-muted-foreground/50 hover:text-destructive transition-colors mt-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add meal form */}
      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-2">
              <div className="flex gap-1.5 flex-wrap">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setNewMeal((m) => ({ ...m, name: p }))}
                    className={`px-3 py-1 text-xs rounded-lg border transition-all font-body ${
                      newMeal.name === p
                        ? "bg-terracotta-light border-terracotta/30 text-terracotta"
                        : "border-border text-muted-foreground hover:border-terracotta/30"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="What did you eat?"
                value={newMeal.note}
                onChange={(e) => setNewMeal((m) => ({ ...m, note: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 font-body"
              />
              <div className="flex gap-2">
                <button
                  onClick={addMeal}
                  className="flex-1 py-2 text-sm rounded-xl bg-primary text-primary-foreground font-body font-medium hover:opacity-90 transition-opacity"
                >
                  Log meal
                </button>
                <button
                  onClick={() => { setAdding(false); setNewMeal({ name: "", note: "" }); }}
                  className="px-4 py-2 text-sm rounded-xl border border-border text-muted-foreground font-body hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MealLog;
