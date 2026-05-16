import React from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "../StudentDashboard/components/Sidebar";
import Header from "../StudentDashboard/components/Header";
import FlashcardDecks from "../StudentDashboard/components/FlashcardDecks";

const FlashcardsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSetId = searchParams.get("set_id");

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 dark:bg-slate-950 font-inter text-gray-800 dark:text-slate-100">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto p-6">
          <FlashcardDecks initialSetId={initialSetId} />
        </div>
      </main>
    </div>
  );
};

export default FlashcardsPage;
