import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Loader2, Check, Utensils } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface FoodAnalysis {
  meal_name: string;
  description: string;
  estimated_calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  highlights: string[];
  suggestion: string;
}

interface QuickCaptureProps {
  open: boolean;
  onClose: () => void;
  onLogged: (analysis: FoodAnalysis, imageUrl: string) => void;
}

const QuickCapture = ({ open, onClose, onLogged }: QuickCaptureProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Auto-open camera when modal opens
  useEffect(() => {
    if (open && !imagePreview) {
      // Small delay to ensure modal is rendered
      const timer = setTimeout(() => fileRef.current?.click(), 100);
      return () => clearTimeout(timer);
    }
  }, [open, imagePreview]);

  const reset = () => {
    setImagePreview(null);
    setAnalyzing(false);
    setAnalysis(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setImagePreview(dataUrl);
      setAnalyzing(true);

      try {
        const { data, error } = await supabase.functions.invoke("analyze-food", {
          body: { image: dataUrl },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        setAnalysis(data.analysis);
      } catch (err: any) {
        console.error(err);
        toast({
          title: "Analysis failed",
          description: err.message || "Could not analyze the photo. Try again.",
          variant: "destructive",
        });
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLog = () => {
    if (analysis && imagePreview) {
      onLogged(analysis, imagePreview);
      toast({ title: "Meal logged! 🌿", description: `${analysis.meal_name} added to your journal.` });
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-foreground/40 backdrop-blur-sm flex items-end sm:items-center justify-center"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-background rounded-t-3xl sm:rounded-3xl p-6 max-h-[85vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl text-foreground">Quick Capture</h2>
              </div>
              <button onClick={handleClose} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {!imagePreview ? (
              /* Capture zone */
              <div className="space-y-3">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-primary/30 bg-sage-light/30 flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-colors"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-body font-medium text-foreground text-sm">Tap to capture your meal</p>
                    <p className="font-body text-xs text-muted-foreground mt-1">Take a photo or choose from gallery</p>
                  </div>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCapture}
                  className="hidden"
                />
              </div>
            ) : (
              /* Preview + Analysis */
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden">
                  <img src={imagePreview} alt="Meal" className="w-full aspect-[4/3] object-cover" />
                  {analyzing && (
                    <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm flex items-center justify-center">
                      <div className="bg-background rounded-2xl px-5 py-4 flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                        <span className="font-body text-sm text-foreground">Analyzing your meal...</span>
                      </div>
                    </div>
                  )}
                </div>

                {analysis && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div>
                      <h3 className="font-display text-lg text-foreground">{analysis.meal_name}</h3>
                      <p className="font-body text-sm text-muted-foreground mt-1">{analysis.description}</p>
                    </div>

                    {/* Macros */}
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: "Calories", value: analysis.estimated_calories, unit: "kcal", bg: "bg-terracotta-light", text: "text-terracotta" },
                        { label: "Protein", value: analysis.protein_g, unit: "g", bg: "bg-sage-light", text: "text-sage-dark" },
                        { label: "Carbs", value: analysis.carbs_g, unit: "g", bg: "bg-amber-light", text: "text-amber" },
                        { label: "Fat", value: analysis.fat_g, unit: "g", bg: "bg-lavender-light", text: "text-lavender" },
                      ].map((m) => (
                        <div key={m.label} className={`${m.bg} rounded-xl p-2.5 text-center`}>
                          <p className={`font-body font-semibold text-sm ${m.text}`}>{m.value}{m.unit === "kcal" ? "" : m.unit}</p>
                          <p className="font-body text-[10px] text-muted-foreground mt-0.5">{m.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Highlights */}
                    <div className="space-y-1.5">
                      {analysis.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">✦</span>
                          <p className="font-body text-sm text-foreground/80">{h}</p>
                        </div>
                      ))}
                    </div>

                    {/* Suggestion */}
                    <div className="bg-sage-light/50 rounded-xl px-4 py-3">
                      <p className="font-body text-xs text-sage-dark">💡 {analysis.suggestion}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={handleLog}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-body font-medium text-sm hover:opacity-90 transition-opacity"
                      >
                        <Check className="w-4 h-4" />
                        Log to Journal
                      </button>
                      <button
                        onClick={reset}
                        className="px-4 py-3 rounded-xl border border-border text-muted-foreground font-body text-sm hover:bg-muted transition-colors"
                      >
                        Retake
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuickCapture;
