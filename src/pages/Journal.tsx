import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Loader2, Trash2 } from "lucide-react";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { useTodayData } from "@/hooks/use-today-data";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Hi there! 🌿 I'm your wellness companion. I'm here to chat about nutrition, sleep, movement, daily routines, or anything related to your wellbeing journey. What's on your mind today?",
};

const loadMessages = (): ChatMessage[] => {
  try {
    const raw = localStorage.getItem("nourish_journal_chat");
    if (!raw) return [WELCOME_MESSAGE];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return parsed.length > 0 ? parsed : [WELCOME_MESSAGE];
  } catch {
    return [WELCOME_MESSAGE];
  }
};

const saveMessages = (msgs: ChatMessage[]) => {
  localStorage.setItem("nourish_journal_chat", JSON.stringify(msgs));
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/journal-chat`;

const Journal = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const { data: todayData } = useTodayData();

  // Build wellness context snapshot to send with each request
  const getWellnessContext = () => {
    const profile = (() => {
      try {
        const raw = localStorage.getItem("nourish_profile");
        return raw ? JSON.parse(raw) : null;
      } catch { return null; }
    })();

    const plan = (() => {
      try {
        const raw = localStorage.getItem("nourish_plan");
        return raw ? JSON.parse(raw) : null;
      } catch { return null; }
    })();

    return {
      profile: profile ? {
        gender: profile.gender,
        age: profile.age,
        weight_kg: profile.weight_kg,
        height_cm: profile.height_cm,
        region: profile.region,
        diet: profile.diet,
        activity_level: profile.activity_level,
        goals: profile.goals,
        allergies: profile.allergies,
      } : null,
      today: {
        water_glasses: todayData.water,
        meals_logged: todayData.meals,
        steps: todayData.steps,
        walk_minutes: todayData.walkMinutes,
        walk_km: todayData.walkKm,
        sleep_hours: todayData.sleepHours,
        mood: todayData.mood,
        energy: todayData.energy,
        meal_entries: todayData.mealEntries.map(m => ({
          name: m.name,
          calories: m.calories,
          protein_g: m.protein_g,
          carbs_g: m.carbs_g,
          fat_g: m.fat_g,
        })),
      },
      plan_summary: plan ? {
        daily_calories: plan.daily_calories,
        water_goal: plan.water_glasses,
        sleep_goal: plan.sleep_hours,
      } : null,
    };
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const clearChat = () => {
    const fresh = [WELCOME_MESSAGE];
    setMessages(fresh);
    saveMessages(fresh);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    saveMessages(updated);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";

    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > updated.length - 1) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: updated.filter((m) => m !== WELCOME_MESSAGE || m.role === "user").slice(-20),
          wellness_context: getWellnessContext(),
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Something went wrong" }));
        toast({ title: "Oops", description: err.error, variant: "destructive" });
        setIsLoading(false);
        return;
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Save final state
      setMessages((prev) => {
        saveMessages(prev);
        return prev;
      });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Could not reach the wellness assistant.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-10rem)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-display text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-lavender" />
              Wellness Journal
            </h1>
            <p className="text-xs text-muted-foreground font-body mt-0.5">
              Your private lifestyle & nutrition companion
            </p>
          </div>
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors font-body"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2 scrollbar-thin"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm font-body leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "glass-card rounded-bl-md text-foreground"
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="glass-card rounded-2xl rounded-bl-md px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-lavender" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Input */}
        <div className="glass-card rounded-2xl p-3 mt-2">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              rows={1}
              placeholder="Ask about nutrition, sleep, routines..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-3 py-2 text-sm rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-lavender/30 resize-none font-body leading-relaxed max-h-24"
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Journal;
