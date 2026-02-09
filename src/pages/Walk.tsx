import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Footprints, Play, Pause, Clock, TrendingUp, RotateCcw, Navigation } from "lucide-react";
import Layout from "@/components/Layout";
import WalkMap from "@/components/WalkMap";
import { useTodayData } from "@/hooks/use-today-data";

interface GeoPoint {
  lat: number;
  lng: number;
  timestamp: number;
}

interface WalkSession {
  id: string;
  duration: number;
  steps: number;
  distance: number;
  timestamp: Date;
  path: GeoPoint[];
}

// Haversine distance in km
const haversine = (a: GeoPoint, b: GeoPoint) => {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

const Walk = () => {
  const { data, update } = useTodayData();
  const [tracking, setTracking] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [gpsPath, setGpsPath] = useState<GeoPoint[]>([]);
  const [distance, setDistance] = useState(0);
  const [gpsError, setGpsError] = useState<string | null>(null);
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
  const watchIdRef = useRef<number | null>(null);

  // Timer
  useEffect(() => {
    if (tracking) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [tracking]);

  // GPS tracking
  const startGps = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation not supported by your browser");
      return;
    }

    setGpsError(null);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const point: GeoPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timestamp: pos.timestamp,
        };
        setGpsPath((prev) => {
          const next = [...prev, point];
          // Calculate total distance
          if (prev.length > 0) {
            const d = haversine(prev[prev.length - 1], point);
            if (d > 0.002) { // filter GPS jitter (<2m)
              setDistance((prevD) => prevD + d);
              return next;
            }
            return prev;
          }
          return next;
        });
      },
      (err) => {
        setGpsError(err.message);
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    );
  }, []);

  const stopGps = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const estimatedSteps = Math.round(distance * 1300); // ~1300 steps/km

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const startWalk = () => {
    setTracking(true);
    setGpsPath([]);
    setDistance(0);
    setElapsed(0);
    startGps();
  };

  const finishWalk = () => {
    setTracking(false);
    stopGps();
    if (elapsed < 5) return;

    const session: WalkSession = {
      id: Date.now().toString(),
      duration: elapsed,
      steps: estimatedSteps,
      distance: Math.round(distance * 100) / 100,
      timestamp: new Date(),
      path: gpsPath,
    };

    const updated = [session, ...walks];
    setWalks(updated);
    // Save without path data to save space
    const toSave = updated.map(({ path: _p, ...rest }) => rest);
    localStorage.setItem("nourish_walks", JSON.stringify(toSave));

    const totalSteps = data.steps + estimatedSteps;
    const totalMinutes = data.walkMinutes + Math.floor(elapsed / 60);
    const totalKm = data.walkKm + session.distance;
    update({ steps: totalSteps, walkMinutes: totalMinutes, walkKm: Math.round(totalKm * 100) / 100 });
  };

  const resetSession = () => {
    setTracking(false);
    stopGps();
    setElapsed(0);
    setGpsPath([]);
    setDistance(0);
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
            GPS-tracked walks. Every step counts.
          </p>
        </div>

        {/* Map */}
        {(tracking || gpsPath.length > 0) && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
            <WalkMap path={gpsPath.map((p) => ({ lat: p.lat, lng: p.lng }))} />
          </motion.div>
        )}

        {gpsError && (
          <div className="bg-destructive/10 text-destructive rounded-xl px-4 py-3 text-xs font-body flex items-center gap-2">
            <Navigation className="w-4 h-4" />
            {gpsError}
          </div>
        )}

        {/* Active tracker */}
        <div className="glass-card rounded-2xl p-6 glow-sage text-center">
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
              <p className="font-body font-semibold text-sm text-sage-dark">{estimatedSteps.toLocaleString()}</p>
              <p className="font-body text-[10px] text-muted-foreground">Steps</p>
            </div>
            <div className="bg-sky-light rounded-xl p-3">
              <p className="font-body font-semibold text-sm text-sky">{distance.toFixed(2)}</p>
              <p className="font-body text-[10px] text-muted-foreground">km</p>
            </div>
            <div className="bg-amber-light rounded-xl p-3">
              <p className="font-body font-semibold text-sm text-amber">
                {elapsed > 0 ? Math.round((distance / (elapsed / 3600)) * 10) / 10 : 0}
              </p>
              <p className="font-body text-[10px] text-muted-foreground">km/h</p>
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
                if (tracking) finishWalk();
                else startWalk();
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
