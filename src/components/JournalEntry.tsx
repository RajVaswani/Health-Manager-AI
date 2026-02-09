import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Send } from "lucide-react";

const JournalEntry = () => {
  const [entry, setEntry] = useState("");
  const [saved, setSaved] = useState(false);

  const save = () => {
    if (!entry.trim()) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-lavender" />
        <h3 className="text-base font-body font-semibold text-foreground">Journal</h3>
      </div>

      <textarea
        rows={3}
        placeholder="How was your day? Any thoughts you'd like to capture..."
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        className="w-full px-4 py-3 text-sm rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-lavender/30 resize-none font-body leading-relaxed"
      />

      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-muted-foreground font-body">
          {entry.length > 0 ? `${entry.length} characters` : "Private & only for you"}
        </p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={save}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-lavender-light text-lavender font-body font-medium hover:opacity-80 transition-opacity"
        >
          {saved ? (
            <span>Saved ✓</span>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              Save
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default JournalEntry;
