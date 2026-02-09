import { useRef } from "react";
import Layout from "@/components/Layout";
import DailyOverview from "@/components/DailyOverview";
import WaterTracker from "@/components/WaterTracker";
import MoodTracker from "@/components/MoodTracker";
import MealLog from "@/components/MealLog";
import SleepTracker from "@/components/SleepTracker";
import JournalEntry from "@/components/JournalEntry";
import NudgeList from "@/components/NudgeList";

const Index = () => {
  const waterRef = useRef<HTMLDivElement>(null);
  const mealsRef = useRef<HTMLDivElement>(null);
  const sleepRef = useRef<HTMLDivElement>(null);

  return (
    <Layout>
      <div className="space-y-5">
        <DailyOverview waterRef={waterRef} mealsRef={mealsRef} sleepRef={sleepRef} />
        <NudgeList />
        <div ref={waterRef} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <WaterTracker />
          <MoodTracker />
        </div>
        <div ref={mealsRef}>
          <MealLog />
        </div>
        <div ref={sleepRef}>
          <SleepTracker />
        </div>
        <JournalEntry />
      </div>
    </Layout>
  );
};

export default Index;
