import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Shield, Home, BookOpen, Calendar, Settings } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { icon: Home, label: "Today", active: true },
  { icon: BookOpen, label: "Journal", active: false },
  { icon: Calendar, label: "Plan", active: false },
  { icon: Settings, label: "Settings", active: false },
];

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-lg mx-auto flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display text-sm">N</span>
            </div>
            <span className="font-display text-lg text-foreground">Nourish</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Shield className="w-3.5 h-3.5" />
            <span className="text-[10px] font-body uppercase tracking-wider">Private</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-5 py-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom nav */}
      <nav className="sticky bottom-0 bg-background/90 backdrop-blur-md border-t border-border/50">
        <div className="max-w-lg mx-auto flex items-center justify-around px-5 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-colors ${
                  item.active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-body font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
