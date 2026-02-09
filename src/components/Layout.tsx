import { ReactNode, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Home, BookOpen, Calendar, Settings, Camera } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import QuickCapture from "./QuickCapture";

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { icon: Home, label: "Today", path: "/" },
  { icon: BookOpen, label: "Journal", path: "/journal" },
  { icon: Calendar, label: "Plan", path: "/plan" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [captureOpen, setCaptureOpen] = useState(false);

  const handleMealLogged = (analysis: any, imageUrl: string) => {
    // Save to localStorage so Journal page can pick it up
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
          <div className="flex items-center gap-1 text-muted-foreground">
            <Shield className="w-3.5 h-3.5" />
            <span className="text-[10px] font-body uppercase tracking-wider">Private</span>
          </div>
        </div>
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
