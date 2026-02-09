import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Footprints, Play, Pause, Clock, MapPin, TrendingUp, RotateCcw } from "lucide-react";
import Layout from "@/components/Layout";
import { useTodayData } from "@/hooks/use-today-data";

interface WalkSession {
  id: string;
  duration: number; // seconds
  steps: number;
  distance: number; // km
  timestamp: Date;
}

const Walk = () => {
  const { data, update } = useTodayData();
  const [tracking, setTracking] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds
  const [sessionSteps, setSessionSteps] = useState(0);
  const [walks, setWalks] = useState<WalkSession[]>(() => {
    try {
      const raw = localStorage.getItem("nourish_walks");
      if (!raw) return [];
      return JSON.parse(raw).map((w: any) => ({ ...w, timestamp: new Date(w.timestamp) }));
    } catch {
      return [];
    }
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer
  useEffect(() => {
    if (tracking) {
      intervalRef.current = setInterval(() => {
        setElapsed((e) => e + 1);
        // Simulate ~100 steps/min natural walking
        setSessionSteps((s) => s + Math.floor(Math.random() * 3) + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tracking]);

  const estimatedKm = (sessionSteps * 0.0008).toFixed(2);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const finishWalk = () => {
    setTracking(false);
    if (elapsed < 5) return; // Too short

    const session: WalkSession = {
      id: Date.now().toString(),
      duration: elapsed,
      steps: sessionSteps,
      distance: parseFloat(estimatedKm),
      timestamp: new Date(),
    };

    const updated = [session, ...walks];
    setWalks(updated);
    localStorage.setItem("nourish_walks", JSON.stringify(updated));

    // Update today's data
    const totalSteps = data.steps + sessionSteps;
    const totalMinutes = data.walkMinutes + Math.floor(elapsed / 60);
    const totalKm = data.walkKm + session.distance;
    update({ steps: totalSteps, walkMinutes: totalMinutes, walkKm: Math.round(totalKm * 100) / 100 });

    setElapsed(0);
    setSessionSteps(0);
  };

  const resetSession = () => {
    setTracking(false);
    setElapsed(0);
    setSessionSteps(0);
  };

  const todayWalks = walks.filter(
    (w) => new Date(w.timestamp).toDateString() === new Date().toDateString()
  );

  return (
    <Layout>
      <div className="space-y-5">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Footprints className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-display text-foreground">Walk</h1>
          </div>
          <p className="text-sm text-muted-foreground font-body">
            Every step counts. Track your walks and feel the progress.
          </p>
        </div>

        {/* Active tracker */}
        <div className="glass-card rounded-2xl p-6 glow-sage text-center">
          {/* Timer display */}
          <motion.div
            animate={{ scale: tracking ? [1, 1.02, 1] : 1 }}
            transition={{ repeat: tracking ? Infinity : 0, duration: 2 }}
            className="mb-4"
          >
            <p className="text-5xl font-display text-foreground tracking-tight">
              {formatTime(elapsed)}
            </p>
            <p className="text-xs text-muted-foreground font-body mt-1">
              {tracking ? "Walking..." : "Ready to walk"}
            </p>
          </motion.div>

          {/* Live stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-sage-light rounded-xl p-3">
              <p className="font-body font-semibold text-sm text-sage-dark">{sessionSteps.toLocaleString()}</p>
              <p className="font-body text-[10px] text-muted-foreground">Steps</p>
            </div>
            <div className="bg-sky-light rounded-xl p-3">
              <p className="font-body font-semibold text-sm text-sky">{estimatedKm}</p>
              <p className="font-body text-[10px] text-muted-foreground">km</p>
            </div>
            <div className="bg-amber-light rounded-xl p-3">
              <p className="font-body font-semibold text-sm text-amber">
                {elapsed > 0 ? Math.round((sessionSteps / elapsed) * 60) : 0}
              </p>
              <p className="font-body text-[10px] text-muted-foreground">steps/min</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            {elapsed > 0 && !tracking && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetSession}
                className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground"
              >
                <RotateCcw className="w-5 h-5" />
              </motion.button>
            )}

            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                if (tracking) {
                  finishWalk();
                } else {
                  setTracking(true);
                }
              }}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg transition-colors ${
                tracking ? "bg-terracotta" : "bg-primary"
              }`}
            >
              {tracking ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
            </motion.button>
          </div>
        </div>

        {/* Today's summary */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-sage" />
            <h3 className="font-body font-semibold text-sm text-foreground">Today's Walking</h3>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <p className="font-body font-semibold text-lg text-foreground">{data.steps.toLocaleString()}</p>
              <p className="font-body text-xs text-muted-foreground">Total steps</p>
            </div>
            <div className="text-center">
              <p className="font-body font-semibold text-lg text-foreground">{data.walkKm}</p>
              <p className="font-body text-xs text-muted-foreground">km walked</p>
            </div>
            <div className="text-center">
              <p className="font-body font-semibold text-lg text-foreground">{data.walkMinutes}</p>
              <p className="font-body text-xs text-muted-foreground">minutes</p>
            </div>
          </div>

          {/* Walk history */}
          {todayWalks.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-body">Sessions</p>
              {todayWalks.map((w) => (
                <div key={w.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-sage shrink-0" />
                  <div className="flex-1">
                    <span className="font-body text-sm text-foreground">
                      {Math.floor(w.duration / 60)} min walk
                    </span>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground font-body">
                    <span>{w.steps.toLocaleString()} steps</span>
                    <span>{w.distance} km</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground font-body text-center py-2">
              No walks recorded yet today. Press play to start!
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Walk;
