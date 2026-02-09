import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Send, Camera, ChevronDown, ChevronRight, Utensils, Clock, Trash2 } from "lucide-react";
import Layout from "@/components/Layout";

interface JournalEntry {
  id: string;
  type: "text" | "meal";
  content: string;
  timestamp: Date;
  mealData?: {
    meal_name: string;
    estimated_calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    imageUrl?: string;
  };
}

// Retrieve entries from localStorage for persistence across page nav
const loadEntries = (): JournalEntry[] => {
  try {
    const raw = localStorage.getItem("nourish_journal");
    if (!raw) return getDefaultEntries();
    return JSON.parse(raw).map((e: any) => ({ ...e, timestamp: new Date(e.timestamp) }));
  } catch {
    return getDefaultEntries();
  }
};

const saveEntries = (entries: JournalEntry[]) => {
  localStorage.setItem("nourish_journal", JSON.stringify(entries));
};

const getDefaultEntries = (): JournalEntry[] => [
  {
    id: "1",
    type: "text",
    content: "Felt really good after my morning walk today. The fresh air helped clear my mind and I noticed I had more energy throughout the morning.",
    timestamp: new Date(Date.now() - 3600000 * 5),
  },
  {
    id: "2",
    type: "meal",
    content: "Had a balanced breakfast — oats with berries and honey",
    timestamp: new Date(Date.now() - 3600000 * 8),
    mealData: {
      meal_name: "Oatmeal with berries",
      estimated_calories: 350,
      protein_g: 12,
      carbs_g: 55,
      fat_g: 8,
    },
  },
];

const Journal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>(loadEntries);
  const [newEntry, setNewEntry] = useState("");
  const [expandedDay, setExpandedDay] = useState<string>("today");

  const addEntry = () => {
    if (!newEntry.trim()) return;
    const entry: JournalEntry = {
      id: Date.now().toString(),
      type: "text",
      content: newEntry,
      timestamp: new Date(),
    };
    const updated = [entry, ...entries];
    setEntries(updated);
    saveEntries(updated);
    setNewEntry("");
  };

  const removeEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    saveEntries(updated);
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const todayEntries = entries.filter(
    (e) => e.timestamp.toDateString() === new Date().toDateString()
  );
  const olderEntries = entries.filter(
    (e) => e.timestamp.toDateString() !== new Date().toDateString()
  );

  return (
    <Layout>
      <div className="space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display text-foreground">Journal</h1>
          <p className="text-sm text-muted-foreground font-body mt-1">
            Your private space for reflection. No one else sees this.
          </p>
        </div>

        {/* New entry */}
        <div className="glass-card rounded-2xl p-5">
          <textarea
            rows={3}
            placeholder="What's on your mind? How are you feeling about your journey?"
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            className="w-full px-4 py-3 text-sm rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-lavender/30 resize-none font-body leading-relaxed"
          />
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-muted-foreground font-body">
              {newEntry.length > 0 ? `${newEntry.length} characters` : "Private & only for you"}
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={addEntry}
              disabled={!newEntry.trim()}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-lavender-light text-lavender font-body font-medium hover:opacity-80 transition-opacity disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              Save
            </motion.button>
          </div>
        </div>

        {/* Today's entries */}
        <div>
          <button
            onClick={() => setExpandedDay(expandedDay === "today" ? "" : "today")}
            className="flex items-center gap-2 mb-3"
          >
            {expandedDay === "today" ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="text-sm font-body font-semibold text-foreground">Today</span>
            <span className="text-xs text-muted-foreground font-body">
              {todayEntries.length} {todayEntries.length === 1 ? "entry" : "entries"}
            </span>
          </button>

          <AnimatePresence>
            {expandedDay === "today" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-3 overflow-hidden"
              >
                {todayEntries.length === 0 && (
                  <p className="text-sm text-muted-foreground font-body py-4 text-center">
                    No entries yet today. How are you feeling?
                  </p>
                )}
                {todayEntries.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} onRemove={removeEntry} formatTime={formatTime} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Older entries */}
        {olderEntries.length > 0 && (
          <div>
            <button
              onClick={() => setExpandedDay(expandedDay === "older" ? "" : "older")}
              className="flex items-center gap-2 mb-3"
            >
              {expandedDay === "older" ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-sm font-body font-semibold text-foreground">Earlier</span>
              <span className="text-xs text-muted-foreground font-body">{olderEntries.length}</span>
            </button>

            <AnimatePresence>
              {expandedDay === "older" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                  {olderEntries.map((entry) => (
                    <EntryCard key={entry.id} entry={entry} onRemove={removeEntry} formatTime={formatTime} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </Layout>
  );
};

const EntryCard = ({
  entry,
  onRemove,
  formatTime,
}: {
  entry: JournalEntry;
  onRemove: (id: string) => void;
  formatTime: (d: Date) => string;
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card rounded-2xl p-4 group"
  >
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-2 mb-2">
        {entry.type === "meal" ? (
          <Utensils className="w-4 h-4 text-terracotta" />
        ) : (
          <BookOpen className="w-4 h-4 text-lavender" />
        )}
        <span className="text-xs text-muted-foreground font-body flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatTime(entry.timestamp)}
        </span>
      </div>
      <button
        onClick={() => onRemove(entry.id)}
        className="opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-destructive transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
    <p className="font-body text-sm text-foreground/80 leading-relaxed">{entry.content}</p>
    {entry.mealData && (
      <div className="flex gap-3 mt-3 text-xs font-body">
        <span className="px-2 py-1 rounded-lg bg-terracotta-light text-terracotta">
          {entry.mealData.estimated_calories} kcal
        </span>
        <span className="px-2 py-1 rounded-lg bg-sage-light text-sage-dark">
          {entry.mealData.protein_g}g protein
        </span>
        <span className="px-2 py-1 rounded-lg bg-amber-light text-amber">
          {entry.mealData.carbs_g}g carbs
        </span>
      </div>
    )}
  </motion.div>
);

export default Journal;
