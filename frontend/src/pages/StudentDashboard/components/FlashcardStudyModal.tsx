import React, { useState, useEffect } from "react";
import { FiX, FiChevronLeft, FiChevronRight, FiRotateCw } from "react-icons/fi";
import { useFlashcardSet } from "../../../hooks/useCore";

interface FlashcardStudyModalProps {
  setId: string;
  onClose: () => void;
}

const FlashcardStudyModal: React.FC<FlashcardStudyModalProps> = ({ setId, onClose }) => {
  const { data: set, isLoading } = useFlashcardSet(setId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const cards = set?.cards ?? [];
  const card = cards[currentIndex];
  const total = cards.length;

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  const goNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") goNext();
    if (e.key === "ArrowLeft") goPrev();
    if (e.key === " ") setIsFlipped((f) => !f);
    if (e.key === "Escape") onClose();
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {isLoading ? "Loading..." : set?.title}
            </h2>
            {!isLoading && total > 0 && (
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                Card {currentIndex + 1} of {total}
                {set?.topic && ` · ${set.topic}`}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        {!isLoading && total > 0 && (
          <div className="h-1 bg-gray-100 dark:bg-slate-800">
            <div
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
            />
          </div>
        )}

        {/* Card area */}
        <div className="flex-1 flex items-center justify-center p-8 min-h-[320px]">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 animate-pulse" />
              <p className="text-sm text-gray-400">Loading cards...</p>
            </div>
          ) : total === 0 ? (
            <p className="text-gray-400 text-sm">No cards in this set.</p>
          ) : (
            <div
              className="w-full cursor-pointer"
              style={{ perspective: "1000px" }}
              onClick={() => setIsFlipped((f) => !f)}
            >
              <div
                className="relative w-full transition-transform duration-500"
                style={{
                  transformStyle: "preserve-3d",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  minHeight: "220px",
                }}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center p-8 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">Question</span>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white text-center leading-relaxed">
                    {card?.front}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-6 flex items-center gap-1">
                    <FiRotateCw className="w-3 h-3" />
                    Click or press Space to flip
                  </p>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4">Answer</span>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white text-center leading-relaxed">
                    {card?.back}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation footer */}
        {!isLoading && total > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-slate-800">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <FiChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex gap-1.5">
              {cards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentIndex
                      ? "bg-indigo-500 w-5"
                      : "bg-gray-200 dark:bg-slate-700 hover:bg-indigo-300"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={goNext}
              disabled={currentIndex === total - 1}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardStudyModal;
