import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, User, Weight, MapPin, Loader2, ArrowLeft, Utensils, Heart, Dumbbell, AlertTriangle, Leaf } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface OnboardingProps {
  onComplete: (plan: any) => void;
}

const genderOptions = ["Female", "Male", "Non-binary", "Prefer not to say"];

const countryOptions = ["India", "Other"];

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Chandigarh", "Jammu & Kashmir", "Ladakh",
];

const otherRegions = [
  "East Asia", "Southeast Asia", "Middle East", "North Africa",
  "Sub-Saharan Africa", "Western Europe", "Eastern Europe",
  "North America", "Latin America", "Oceania",
];

const dietOptions = [
  { label: "Vegetarian", desc: "No meat or fish", icon: "🥬" },
  { label: "Eggetarian", desc: "Veg + eggs", icon: "🥚" },
  { label: "Non-Vegetarian", desc: "All foods", icon: "🍗" },
  { label: "Vegan", desc: "No animal products", icon: "🌱" },
  { label: "Jain", desc: "No root vegetables, no meat", icon: "☸️" },
];

const activityOptions = [
  { label: "Sedentary", desc: "Desk job, minimal movement" },
  { label: "Lightly Active", desc: "Light walks, some movement" },
  { label: "Moderately Active", desc: "Regular exercise 3-4x/week" },
  { label: "Very Active", desc: "Intense exercise or physical job" },
];

const goalOptions = [
  "Lose weight", "Gain weight", "Maintain weight", "Build muscle",
  "Improve energy", "Better sleep", "Reduce stress", "Eat healthier",
];

const allergyOptions = [
  "Dairy", "Gluten", "Nuts", "Soy", "Shellfish", "None",
];

const cuisineOptions = [
  "North Indian", "South Indian", "Bengali", "Gujarati", "Rajasthani",
  "Maharashtrian", "Punjabi", "Kerala", "Hyderabadi", "Goan",
  "Street Food", "Continental", "Chinese/Indo-Chinese",
];

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [diet, setDiet] = useState("");
  const [activity, setActivity] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [mealsPerDay, setMealsPerDay] = useState("3");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isIndia = country === "India";

  const toggleMulti = (arr: string[], val: string, setter: (v: string[]) => void) => {
    if (val === "None") {
      setter(["None"]);
      return;
    }
    const filtered = arr.filter((a) => a !== "None");
    setter(filtered.includes(val) ? filtered.filter((a) => a !== val) : [...filtered, val]);
  };

  const totalSteps = isIndia ? 9 : 7;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-plan", {
        body: {
          gender,
          weight_kg: parseFloat(weight),
          age: parseInt(age),
          height_cm: parseInt(height),
          region: isIndia ? `${region}, India` : region,
          diet,
          activity_level: activity,
          goals,
          allergies: allergies.filter((a) => a !== "None"),
          preferred_cuisines: cuisines,
          meals_per_day: parseInt(mealsPerDay),
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      localStorage.setItem(
        "nourish_profile",
        JSON.stringify({ gender, weight_kg: parseFloat(weight), age: parseInt(age), height_cm: parseInt(height), region: isIndia ? `${region}, India` : region, diet, activity_level: activity, goals, allergies, preferred_cuisines: cuisines, meals_per_day: parseInt(mealsPerDay) })
      );
      localStorage.setItem("nourish_ai_plan", JSON.stringify(data.plan));
      onComplete(data.plan);
    } catch (e: any) {
      console.error("Plan generation failed:", e);
      toast({ title: "Couldn't generate your plan", description: e.message || "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const buildSteps = () => {
    const s: { icon: any; label: string; content: JSX.Element }[] = [
      // 0: Gender
      {
        icon: User,
        label: "What's your gender?",
        content: (
          <div className="grid grid-cols-2 gap-3">
            {genderOptions.map((g) => (
              <button key={g} onClick={() => { setGender(g); setStep(1); }}
                className={`rounded-xl px-4 py-3 text-sm font-body font-medium transition-all ${gender === g ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-border"}`}
              >{g}</button>
            ))}
          </div>
        ),
      },
      // 1: Age + Height + Weight
      {
        icon: Weight,
        label: "Your body details",
        content: (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-body text-muted-foreground mb-1 block">Age</label>
                <input type="number" placeholder="e.g. 28" value={age} onChange={(e) => setAge(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-center text-lg font-display text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-xs font-body text-muted-foreground mb-1 block">Height (cm)</label>
                <input type="number" placeholder="e.g. 165" value={height} onChange={(e) => setHeight(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-center text-lg font-display text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <div>
              <label className="text-xs font-body text-muted-foreground mb-1 block">Weight (kg)</label>
              <input type="number" placeholder="e.g. 65" value={weight} onChange={(e) => setWeight(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-center text-lg font-display text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <button onClick={() => age && height && weight && setStep(2)} disabled={!age || !height || !weight}
              className="w-full rounded-xl bg-primary text-primary-foreground py-3 font-body font-medium text-sm disabled:opacity-40 transition-opacity">
              Continue
            </button>
          </div>
        ),
      },
      // 2: Country
      {
        icon: MapPin,
        label: "Where are you based?",
        content: (
          <div className="grid grid-cols-2 gap-3">
            {countryOptions.map((c) => (
              <button key={c} onClick={() => { setCountry(c); setRegion(""); setStep(3); }}
                className={`rounded-xl px-4 py-3 text-sm font-body font-medium transition-all ${country === c ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-border"}`}
              >{c === "India" ? "🇮🇳 India" : "🌍 Other"}</button>
            ))}
          </div>
        ),
      },
      // 3: Region/State
      {
        icon: MapPin,
        label: isIndia ? "Which state?" : "Which region?",
        content: (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {(isIndia ? indianStates : otherRegions).map((r) => (
              <button key={r} onClick={() => { setRegion(r); setStep(4); }}
                className={`w-full text-left rounded-xl px-4 py-2.5 text-sm font-body font-medium transition-all ${region === r ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-border"}`}
              >{r}</button>
            ))}
          </div>
        ),
      },
      // 4: Diet type
      {
        icon: Utensils,
        label: "What's your diet?",
        content: (
          <div className="space-y-2">
            {dietOptions.map((d) => (
              <button key={d.label} onClick={() => { setDiet(d.label); setStep(5); }}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${diet === d.label ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-border"}`}
              >
                <span className="text-lg">{d.icon}</span>
                <div>
                  <p className="text-sm font-body font-medium">{d.label}</p>
                  <p className={`text-[11px] font-body ${diet === d.label ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{d.desc}</p>
                </div>
              </button>
            ))}
          </div>
        ),
      },
      // 5: Activity level
      {
        icon: Dumbbell,
        label: "How active are you?",
        content: (
          <div className="space-y-2">
            {activityOptions.map((a) => (
              <button key={a.label} onClick={() => { setActivity(a.label); setStep(6); }}
                className={`w-full text-left rounded-xl px-4 py-3 transition-all ${activity === a.label ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-border"}`}
              >
                <p className="text-sm font-body font-medium">{a.label}</p>
                <p className={`text-[11px] font-body ${activity === a.label ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{a.desc}</p>
              </button>
            ))}
          </div>
        ),
      },
      // 6: Goals (multi-select)
      {
        icon: Heart,
        label: "What are your goals?",
        content: (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {goalOptions.map((g) => (
                <button key={g} onClick={() => toggleMulti(goals, g, setGoals)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-body font-medium border transition-all ${goals.includes(g) ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground hover:border-primary/30"}`}
                >{g}</button>
              ))}
            </div>
            <button onClick={() => goals.length > 0 && setStep(7)} disabled={goals.length === 0}
              className="w-full rounded-xl bg-primary text-primary-foreground py-3 font-body font-medium text-sm disabled:opacity-40 transition-opacity">
              Continue
            </button>
          </div>
        ),
      },
    ];

    if (isIndia) {
      // 7: Cuisine preferences (India-specific)
      s.push({
        icon: Leaf,
        label: "Cuisine preferences?",
        content: (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {cuisineOptions.map((c) => (
                <button key={c} onClick={() => toggleMulti(cuisines, c, setCuisines)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-body font-medium border transition-all ${cuisines.includes(c) ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground hover:border-primary/30"}`}
                >{c}</button>
              ))}
            </div>
            <button onClick={() => cuisines.length > 0 && setStep(8)} disabled={cuisines.length === 0}
              className="w-full rounded-xl bg-primary text-primary-foreground py-3 font-body font-medium text-sm disabled:opacity-40 transition-opacity">
              Continue
            </button>
          </div>
        ),
      });

      // 8: Allergies + meals per day
      s.push({
        icon: AlertTriangle,
        label: "Allergies & meal frequency",
        content: (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-body text-muted-foreground mb-2">Any food allergies?</p>
              <div className="flex flex-wrap gap-2">
                {allergyOptions.map((a) => (
                  <button key={a} onClick={() => toggleMulti(allergies, a, setAllergies)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-body font-medium border transition-all ${allergies.includes(a) ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground hover:border-primary/30"}`}
                  >{a}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-body text-muted-foreground mb-2">How many meals per day?</p>
              <div className="flex gap-2">
                {["2", "3", "4", "5"].map((n) => (
                  <button key={n} onClick={() => setMealsPerDay(n)}
                    className={`w-12 h-12 rounded-xl text-sm font-body font-medium transition-all ${mealsPerDay === n ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-border"}`}
                  >{n}</button>
                ))}
              </div>
            </div>
            <button onClick={() => setStep(9)}
              className="w-full rounded-xl bg-primary text-primary-foreground py-3 font-body font-medium text-sm transition-opacity">
              Continue
            </button>
          </div>
        ),
      });
    } else {
      // 7 (non-India): Allergies + meals per day, then go to review
      s.push({
        icon: AlertTriangle,
        label: "Allergies & meal frequency",
        content: (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-body text-muted-foreground mb-2">Any food allergies?</p>
              <div className="flex flex-wrap gap-2">
                {allergyOptions.map((a) => (
                  <button key={a} onClick={() => toggleMulti(allergies, a, setAllergies)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-body font-medium border transition-all ${allergies.includes(a) ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground hover:border-primary/30"}`}
                  >{a}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-body text-muted-foreground mb-2">How many meals per day?</p>
              <div className="flex gap-2">
                {["2", "3", "4", "5"].map((n) => (
                  <button key={n} onClick={() => setMealsPerDay(n)}
                    className={`w-12 h-12 rounded-xl text-sm font-body font-medium transition-all ${mealsPerDay === n ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-border"}`}
                  >{n}</button>
                ))}
              </div>
            </div>
            <button onClick={() => setStep(totalSteps)}
              className="w-full rounded-xl bg-primary text-primary-foreground py-3 font-body font-medium text-sm transition-opacity">
              Continue
            </button>
          </div>
        ),
      });
    }

    return s;
  };

  const steps = buildSteps();
  const reviewStep = step >= totalSteps;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 py-10 relative">
      <button
        onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)}
        className="absolute top-5 left-5 w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-6">
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

        {/* Progress bar */}
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${((reviewStep ? totalSteps : step) / totalSteps) * 100}%` }}
            transition={{ type: "spring", stiffness: 80 }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground font-body text-center">
          Step {Math.min(step + 1, totalSteps)} of {totalSteps}
        </p>

        {/* Step content */}
        {!reviewStep ? (
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="flex items-center gap-2">
              {(() => { const Icon = steps[step].icon; return <Icon className="w-5 h-5 text-primary" />; })()}
              <h2 className="font-body font-semibold text-foreground">{steps[step].label}</h2>
            </div>
            {steps[step].content}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
            <div className="glass-card rounded-2xl p-5 space-y-2">
              <h2 className="font-body font-semibold text-foreground text-sm">Your profile</h2>
              <div className="space-y-1.5 text-sm font-body">
                {[
                  ["Gender", gender],
                  ["Age", `${age} years`],
                  ["Height", `${height} cm`],
                  ["Weight", `${weight} kg`],
                  ["Region", isIndia ? `${region}, India` : region],
                  ["Diet", diet],
                  ["Activity", activity],
                  ["Goals", goals.join(", ")],
                  ...(isIndia ? [["Cuisines", cuisines.join(", ")]] : []),
                  ["Allergies", allergies.join(", ") || "None"],
                  ["Meals/day", mealsPerDay],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="text-foreground font-medium text-right max-w-[55%] truncate">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleGenerate} disabled={loading}
              className="w-full rounded-2xl bg-primary text-primary-foreground py-4 font-body font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-70 transition-opacity glow-sage">
              {loading ? (<><Loader2 className="w-4 h-4 animate-spin" />Creating your plan…</>) : (<><Sparkles className="w-4 h-4" />Generate My Plan</>)}
            </button>

            <button onClick={() => setStep(0)} className="w-full text-center text-xs text-muted-foreground font-body hover:text-foreground transition-colors">
              Start over
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Onboarding;
