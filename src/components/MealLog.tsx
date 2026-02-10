import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UtensilsCrossed, Plus, X, Clock, Camera, ImagePlus, Loader2 } from "lucide-react";
import { useTodayData, MealEntry } from "@/hooks/use-today-data";
import QuickCapture from "./QuickCapture";

const PRESETS = ["Breakfast", "Lunch", "Dinner", "Snack"];

const MealLog = () => {
  const { data, update } = useTodayData();
  const [adding, setAdding] = useState(false);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [newMeal, setNewMeal] = useState({ name: "", note: "" });
  const [showOptions, setShowOptions] = useState(false);

  const meals = data.mealEntries || [];

  const addManualMeal = () => {
    if (!newMeal.name.trim()) return;
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    const entry: MealEntry = {
      id: Date.now().toString(),
      name: newMeal.name,
      time,
      note: newMeal.note,
    };
    const updated = [...meals, entry];
    update({ meals: updated.length, mealEntries: updated });
    setNewMeal({ name: "", note: "" });
    setAdding(false);
  };

  const handlePhotoLogged = (analysis: any, imageUrl: string) => {
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    const entry: MealEntry = {
      id: Date.now().toString(),
      name: analysis.meal_name,
      time,
      note: analysis.description,
      imageUrl,
      calories: analysis.estimated_calories,
      protein_g: analysis.protein_g,
      carbs_g: analysis.carbs_g,
      fat_g: analysis.fat_g,
      fiber_g: analysis.fiber_g,
      highlights: analysis.highlights,
      suggestion: analysis.suggestion,
    };
    const updated = [...meals, entry];
    update({ meals: updated.length, mealEntries: updated });
    setCaptureOpen(false);
  };

  const removeMeal = (id: string) => {
    const updated = meals.filter((m) => m.id !== id);
    update({ meals: updated.length, mealEntries: updated });
  };

  const totalCals = meals.reduce((s, m) => s + (m.calories || 0), 0);
  const totalProtein = meals.reduce((s, m) => s + (m.protein_g || 0), 0);
  const totalCarbs = meals.reduce((s, m) => s + (m.carbs_g || 0), 0);
  const totalFat = meals.reduce((s, m) => s + (m.fat_g || 0), 0);

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5 text-terracotta" />
          <h3 className="text-base font-body font-semibold text-foreground">Meals</h3>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="w-8 h-8 rounded-xl bg-terracotta-light flex items-center justify-center text-terracotta hover:opacity-80 transition-opacity"
          >
            <Plus className="w-4 h-4" />
          </button>
          <AnimatePresence>
            {showOptions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                className="absolute right-0 top-10 z-20 bg-background border border-border rounded-xl shadow-lg overflow-hidden min-w-[160px]"
              >
                <button
                  onClick={() => { setCaptureOpen(true); setShowOptions(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-body text-foreground hover:bg-muted transition-colors"
                >
                  <Camera className="w-4 h-4 text-primary" />
                  Photo Capture
                </button>
                <button
                  onClick={() => { setAdding(true); setShowOptions(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-body text-foreground hover:bg-muted transition-colors border-t border-border"
                >
                  <Plus className="w-4 h-4 text-terracotta" />
                  Add Manually
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nutrition summary */}
      {meals.length > 0 && totalCals > 0 && (
        <div className="grid grid-cols-4 gap-1.5 mb-4">
          {[
            { label: "Cal", value: totalCals, bg: "bg-terracotta-light", text: "text-terracotta" },
            { label: "Protein", value: `${totalProtein}g`, bg: "bg-sage-light", text: "text-sage-dark" },
            { label: "Carbs", value: `${totalCarbs}g`, bg: "bg-amber-light", text: "text-amber" },
            { label: "Fat", value: `${totalFat}g`, bg: "bg-lavender-light", text: "text-lavender" },
          ].map((m) => (
            <div key={m.label} className={`${m.bg} rounded-lg p-2 text-center`}>
              <p className={`font-body font-semibold text-xs ${m.text}`}>{m.value}</p>
              <p className="font-body text-[9px] text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
      )}

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
            {meal.imageUrl ? (
              <img src={meal.imageUrl} alt={meal.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-terracotta mt-2 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-body font-medium text-sm text-foreground">{meal.name}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {meal.time}
                </span>
              </div>
              {meal.note && (
                <p className="text-xs text-muted-foreground mt-0.5 font-body line-clamp-1">{meal.note}</p>
              )}
              {meal.calories && (
                <p className="text-[10px] text-terracotta font-body mt-0.5">
                  {meal.calories} kcal · {meal.protein_g}g P · {meal.carbs_g}g C · {meal.fat_g}g F
                </p>
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

      {meals.length === 0 && !adding && (
        <p className="text-sm text-muted-foreground font-body text-center py-3">No meals logged yet today</p>
      )}

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
                  onClick={addManualMeal}
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

      <QuickCapture
        open={captureOpen}
        onClose={() => setCaptureOpen(false)}
        onLogged={handlePhotoLogged}
      />
    </div>
  );
};

export default MealLog;
