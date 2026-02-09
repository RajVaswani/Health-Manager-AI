import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "nourish_today";

export interface TodayData {
  date: string;
  water: number;
  meals: number;
  steps: number;
  walkMinutes: number;
  walkKm: number;
  sleepHours: number;
  mood: string | null;
  energy: string | null;
}

const todayStr = () => new Date().toISOString().slice(0, 10);

const defaults = (): TodayData => ({
  date: todayStr(),
  water: 0,
  meals: 0,
  steps: 0,
  walkMinutes: 0,
  walkKm: 0,
  sleepHours: 0,
  mood: null,
  energy: null,
});

const load = (): TodayData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults();
    const data = JSON.parse(raw) as TodayData;
    // Reset if it's a new day
    if (data.date !== todayStr()) return defaults();
    return data;
  } catch {
    return defaults();
  }
};

const save = (data: TodayData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("nourish-update"));
};

export const useTodayData = () => {
  const [data, setData] = useState<TodayData>(load);

  // Listen for cross-component updates
  useEffect(() => {
    const handler = () => setData(load());
    window.addEventListener("nourish-update", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("nourish-update", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const update = useCallback((partial: Partial<TodayData>) => {
    const current = load();
    const next = { ...current, ...partial, date: todayStr() };
    save(next);
    setData(next);
  }, []);

  return { data, update };
};
