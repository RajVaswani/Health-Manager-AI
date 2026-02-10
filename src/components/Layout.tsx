import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Home, BookOpen, Calendar, Footprints, Camera, Bell, Settings, X, Droplets, Moon, Apple } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import QuickCapture from "./QuickCapture";

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { icon: Home, label: "Today", path: "/" },
  { icon: BookOpen, label: "Journal", path: "/journal" },
  { icon: Calendar, label: "Plan", path: "/plan" },
  { icon: Footprints, label: "Walk", path: "/walk" },
];

const nudges = [
  {
    icon: Droplets,
    message: "It's been a while — how about a glass of water?",
    color: "text-sky",
    bg: "bg-sky-light",
  },
  {
    icon: Footprints,
    message: "A short walk could lift your afternoon energy.",
    color: "text-sage-dark",
    bg: "bg-sage-light",
  },
  {
    icon: Moon,
    message: "Wind down soon — good sleep recharges everything.",
    color: "text-lavender",
    bg: "bg-lavender-light",
  },
];

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [captureOpen, setCaptureOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dismissedNudges, setDismissedNudges] = useState<number[]>([]);

  const activeNudges = nudges.filter((_, i) => !dismissedNudges.includes(i));

  const handleMealLogged = (analysis: any, imageUrl: string) => {
    try {
      const raw = localStorage.getItem("nourish_journal");
      const entries = raw ? JSON.parse(raw) : [];
      entries.unshift({
        id: Date.now().toString(),
        type: "meal",
        content: `${analysis.meal_name} — ${analysis.description}`,
        timestamp: new Date().toISOString(),
        mealData: {
          meal_name: analysis.meal_name,
          estimated_calories: analysis.estimated_calories,
          protein_g: analysis.protein_g,
          carbs_g: analysis.carbs_g,
          fat_g: analysis.fat_g,
          imageUrl,
        },
      });
      localStorage.setItem("nourish_journal", JSON.stringify(entries));
    } catch (e) {
      console.error("Failed to save journal entry", e);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-lg mx-auto flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display text-sm">N</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-display text-lg text-foreground">Nourish</span>
              <span className="text-[8px] font-body text-muted-foreground -mt-0.5">by Vinita Vaswani</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Notifications */}
            <button
              onClick={() => { setNotifOpen(!notifOpen); setSettingsOpen(false); }}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Bell className="w-4.5 h-4.5" />
              {activeNudges.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-terracotta" />
              )}
            </button>
            {/* Settings */}
            <button
              onClick={() => { setSettingsOpen(!settingsOpen); setNotifOpen(false); }}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Settings className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Notification dropdown */}
        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute right-0 left-0 top-full bg-background border-b border-border/50 shadow-lg z-40"
            >
              <div className="max-w-lg mx-auto px-5 py-4 space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-body">Reminders</p>
                  <button onClick={() => setNotifOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {activeNudges.length === 0 ? (
                  <p className="text-sm text-muted-foreground font-body text-center py-3">All caught up! 🌿</p>
                ) : (
                  activeNudges.map((nudge, i) => {
                    const Icon = nudge.icon;
                    const originalIdx = nudges.indexOf(nudge);
                    return (
                      <motion.div
                        key={originalIdx}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl ${nudge.bg} cursor-pointer group`}
                        onClick={() => setDismissedNudges((d) => [...d, originalIdx])}
                      >
                        <Icon className={`w-4.5 h-4.5 ${nudge.color} shrink-0`} />
                        <p className="text-sm font-body text-foreground/80 flex-1">{nudge.message}</p>
                        <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity font-body">dismiss</span>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings dropdown */}
        <AnimatePresence>
          {settingsOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute right-0 left-0 top-full bg-background border-b border-border/50 shadow-lg z-40"
            >
              <div className="max-w-lg mx-auto px-5 py-4 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-body">Settings</p>
                  <button onClick={() => setSettingsOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1">
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors text-left">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span className="font-body text-sm text-foreground">Privacy</span>
                  </button>
                  <button
                    onClick={() => { navigate("/plan"); setSettingsOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors text-left"
                  >
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-body text-sm text-foreground">Regenerate Plan</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-5 py-6 pb-24">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom nav with center capture button */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md border-t border-border/50 z-50">
        <div className="max-w-lg mx-auto flex items-center justify-around px-3 py-2 relative">
          {navItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-body font-medium">{item.label}</span>
              </button>
            );
          })}

          {/* Center capture button */}
          <div className="relative -mt-6">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setCaptureOpen(true)}
              className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg glow-sage"
            >
              <Camera className="w-6 h-6" />
            </motion.button>
          </div>

          {navItems.slice(2).map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-body font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Quick Capture Modal */}
      <QuickCapture
        open={captureOpen}
        onClose={() => setCaptureOpen(false)}
        onLogged={handleMealLogged}
      />
    </div>
  );
};

export default Layout;
