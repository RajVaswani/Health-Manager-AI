import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Plus, Minus, Camera, ImagePlus, Loader2 } from "lucide-react";
import { useTodayData } from "@/hooks/use-today-data";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const GOAL = 8;

const WaterTracker = () => {
  const { data, update } = useTodayData();
  const glasses = data.water;
  const [showOptions, setShowOptions] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const add = () => update({ water: Math.min(glasses + 1, 12) });
  const remove = () => update({ water: Math.max(glasses - 1, 0) });

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowOptions(false);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setAnalyzing(true);
      try {
        const { data: result, error } = await supabase.functions.invoke("analyze-food", {
          body: { image: dataUrl },
        });
        if (error) throw error;
        if (result?.error) throw new Error(result.error);

        // Auto-add a glass for the detected drink
        add();
        toast({
          title: "Water logged! 💧",
          description: result.analysis?.meal_name
            ? `Detected: ${result.analysis.meal_name}`
            : "Added 1 glass of water.",
        });
      } catch (err: any) {
        // Fallback: just add a glass anyway
        add();
        toast({ title: "Water logged! 💧", description: "Added 1 glass." });
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be selected again
    e.target.value = "";
  };

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

      {analyzing && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-sky-light/50">
          <Loader2 className="w-4 h-4 text-sky animate-spin" />
          <span className="font-body text-xs text-sky">Analyzing your drink...</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={remove}
          className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-border transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
          </button>
          <AnimatePresence>
            {showOptions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                className="absolute left-0 bottom-11 z-20 bg-background border border-border rounded-xl shadow-lg overflow-hidden min-w-[150px]"
              >
                <button
                  onClick={() => { add(); setShowOptions(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-body text-foreground hover:bg-muted transition-colors"
                >
                  <Plus className="w-4 h-4 text-sky" />
                  Add Glass
                </button>
                <button
                  onClick={() => { cameraRef.current?.click(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-body text-foreground hover:bg-muted transition-colors border-t border-border"
                >
                  <Camera className="w-4 h-4 text-primary" />
                  Take Photo
                </button>
                <button
                  onClick={() => { galleryRef.current?.click(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-body text-foreground hover:bg-muted transition-colors border-t border-border"
                >
                  <ImagePlus className="w-4 h-4 text-primary" />
                  From Gallery
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleCapture} className="hidden" />
      <input ref={galleryRef} type="file" accept="image/*" onChange={handleCapture} className="hidden" />
    </div>
  );
};

export default WaterTracker;
