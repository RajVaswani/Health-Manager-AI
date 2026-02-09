import Layout from "@/components/Layout";
import DailyOverview from "@/components/DailyOverview";
import WaterTracker from "@/components/WaterTracker";
import MoodTracker from "@/components/MoodTracker";
import MealLog from "@/components/MealLog";
import JournalEntry from "@/components/JournalEntry";
import NudgeList from "@/components/NudgeList";

const Index = () => {
  return (
    <Layout>
      <div className="space-y-5">
        <DailyOverview />
        <NudgeList />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <WaterTracker />
          <MoodTracker />
        </div>
        <MealLog />
        <JournalEntry />
      </div>
    </Layout>
  );
};

export default Index;
