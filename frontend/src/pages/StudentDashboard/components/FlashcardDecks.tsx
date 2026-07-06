import React, { useState, useEffect } from "react";
import { LuLayers, LuTrash2, LuBookOpen } from "react-icons/lu";
import { useFlashcardSets, useDeleteFlashcardSet } from "../../../hooks/useCore";
import FlashcardStudyModal from "./FlashcardStudyModal";
import GenerateFlashcardsModal from "./GenerateFlashcardsModal";

const DECK_COLORS = [
  { bar: "bg-indigo-500", badge: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300" },
  { bar: "bg-purple-500", badge: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" },
  { bar: "bg-emerald-500", badge: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" },
  { bar: "bg-amber-500", badge: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" },
  { bar: "bg-rose-500", badge: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300" },
  { bar: "bg-sky-500", badge: "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300" },
];

interface FlashcardDecksProps {
  initialSetId?: string | null;
}

const FlashcardDecks: React.FC<FlashcardDecksProps> = ({ initialSetId }) => {
  const { data, isLoading } = useFlashcardSets();
  const deleteSet = useDeleteFlashcardSet();
  const sets = data?.flashcard_sets ?? [];

  const [studySetId, setStudySetId] = useState<string | null>(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  // Auto-open set if deep-linked from Chat
  useEffect(() => {
    if (initialSetId) {
      setStudySetId(initialSetId);
    }
  }, [initialSetId]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Delete this flashcard set? This cannot be undone.")) {
      deleteSet.mutate(id);
    }
  };

  return (
    <>
      <GenerateFlashcardsModal isOpen={isGenerateModalOpen} onClose={() => setIsGenerateModalOpen(false)} />

      {studySetId && (
        <FlashcardStudyModal setId={studySetId} onClose={() => setStudySetId(null)} />
      )}

      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Flashcard Decks</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
              {isLoading ? "Loading..." : `${sets.length} deck${sets.length !== 1 ? "s" : ""} available`}
            </p>
          </div>
          <button 
            onClick={() => setIsGenerateModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            Generate New Deck
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden animate-pulse h-44"
              />
            ))}
          </div>
        ) : sets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-400 mb-4">
              <LuLayers className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-semibold text-gray-700 dark:text-slate-300 mb-1">
              No flashcard decks yet
            </h4>
            <p className="text-sm text-gray-400 dark:text-slate-500 max-w-xs">
              Chat with the AI and ask it to generate flashcards on any topic. They'll appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sets.map((set, idx) => {
              const color = DECK_COLORS[idx % DECK_COLORS.length];
              const label = set.topic || set.source_type;
              return (
                <div
                  key={set.id}
                  className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700 transition-all group"
                >
                  <div className={`h-1.5 ${color.bar} w-full`} />
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${color.badge}`}>
                        {label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 dark:text-slate-500">
                          {set.card_count} cards
                        </span>
                        <button
                          onClick={(e) => handleDelete(e, set.id)}
                          className="p-1 rounded text-gray-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                          title="Delete deck"
                        >
                          <LuTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">
                      {set.title}
                    </h4>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">
                      Created {new Date(set.created_at).toLocaleDateString()}
                    </p>

                    <button
                      onClick={() => setStudySetId(set.id)}
                      className="w-full py-2.5 flex items-center justify-center gap-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 dark:hover:bg-indigo-600 dark:hover:border-indigo-600 transition-all"
                    >
                      <LuBookOpen className="w-4 h-4" />
                      Start Revision
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default FlashcardDecks;
