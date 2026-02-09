import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, User, Weight, MapPin, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface OnboardingProps {
  onComplete: (plan: any) => void;
}

const genderOptions = ["Female", "Male", "Non-binary", "Prefer not to say"];

const regionOptions = [
  "South Asia",
  "East Asia",
  "Southeast Asia",
  "Middle East",
  "North Africa",
  "Sub-Saharan Africa",
  "Western Europe",
  "Eastern Europe",
  "North America",
  "Latin America",
  "Oceania",
];

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState("");
  const [weight, setWeight] = useState("");
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!gender || !weight || !region) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-plan", {
        body: { gender, weight_kg: parseFloat(weight), region },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Save profile + plan
      localStorage.setItem(
        "nourish_profile",
        JSON.stringify({ gender, weight_kg: parseFloat(weight), region })
      );
      localStorage.setItem("nourish_ai_plan", JSON.stringify(data.plan));

      onComplete(data.plan);
    } catch (e: any) {
      console.error("Plan generation failed:", e);
      toast({
        title: "Couldn't generate your plan",
        description: e.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      icon: User,
      label: "Gender",
      content: (
        <div className="grid grid-cols-2 gap-3">
          {genderOptions.map((g) => (
            <button
              key={g}
              onClick={() => { setGender(g); setStep(1); }}
              className={`rounded-xl px-4 py-3 text-sm font-body font-medium transition-all ${
                gender === g
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-border"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      ),
    },
    {
      icon: Weight,
      label: "Weight (kg)",
      content: (
        <div className="space-y-4">
          <input
            type="number"
            placeholder="e.g. 65"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-center text-2xl font-display text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={() => weight && setStep(2)}
            disabled={!weight}
            className="w-full rounded-xl bg-primary text-primary-foreground py-3 font-body font-medium text-sm disabled:opacity-40 transition-opacity"
          >
            Continue
          </button>
        </div>
      ),
    },
    {
      icon: MapPin,
      label: "Region",
      content: (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {regionOptions.map((r) => (
            <button
              key={r}
              onClick={() => { setRegion(r); setStep(3); }}
              className={`w-full text-left rounded-xl px-4 py-3 text-sm font-body font-medium transition-all ${
                region === r
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-border"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      ),
    },
  ];

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 py-10 relative">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-5 left-5 w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6"
      >
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto">
            <span className="text-primary-foreground font-display text-2xl">N</span>
          </div>
          <h1 className="text-3xl font-display text-foreground">Welcome to Nourish</h1>
          <p className="text-sm text-muted-foreground font-body">
            Let's create a plan tailored just for you.
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onClick={() => i < step && setStep(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === step ? "bg-primary w-6" : i < step ? "bg-primary/60" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        {step < 3 ? (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              {(() => { const Icon = steps[step].icon; return <Icon className="w-5 h-5 text-primary" />; })()}
              <h2 className="font-body font-semibold text-foreground">{steps[step].label}</h2>
            </div>
            {steps[step].content}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            {/* Review */}
            <div className="glass-card rounded-2xl p-5 space-y-3">
              <h2 className="font-body font-semibold text-foreground text-sm">Your profile</h2>
              <div className="space-y-2 text-sm font-body">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gender</span>
                  <span className="text-foreground font-medium">{gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weight</span>
                  <span className="text-foreground font-medium">{weight} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Region</span>
                  <span className="text-foreground font-medium">{region}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full rounded-2xl bg-primary text-primary-foreground py-4 font-body font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-70 transition-opacity glow-sage"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating your plan…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate My Plan
                </>
              )}
            </button>

            <button
              onClick={() => setStep(0)}
              className="w-full text-center text-xs text-muted-foreground font-body hover:text-foreground transition-colors"
            >
              Start over
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Onboarding;
