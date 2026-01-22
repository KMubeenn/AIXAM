import React from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

const FlashcardDecks: React.FC = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          Flashcards for Revision
        </h3>
        <div className="flex gap-2">
          <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
            <LuChevronLeft className="w-5 h-5" />
          </button>
          <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
            <LuChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          <div className="h-2 bg-purple-500 w-full"></div>
          <div className="p-5">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-0.5 rounded">
                Biology
              </span>
              <span className="text-xs text-gray-500">24 cards</span>
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">
              Cell Structure
            </h4>
            <p className="text-sm text-gray-500 mb-4">
              Mitochondria, Nucleus, Ribosomes and their functions.
            </p>
            <button className="w-full py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors">
              Start Revision
            </button>
          </div>
        </div>
        {/* Card 2 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          <div className="h-2 bg-orange-500 w-full"></div>
          <div className="p-5">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2.5 py-0.5 rounded">
                History
              </span>
              <span className="text-xs text-gray-500">45 cards</span>
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">
              World War II Timeline
            </h4>
            <p className="text-sm text-gray-500 mb-4">
              Key events, dates, and figures from 1939 to 1945.
            </p>
            <button className="w-full py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors">
              Start Revision
            </button>
          </div>
        </div>
        {/* Card 3 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          <div className="h-2 bg-blue-500 w-full"></div>
          <div className="p-5">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded">
                Physics
              </span>
              <span className="text-xs text-gray-500">18 cards</span>
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">
              Newton's Laws
            </h4>
            <p className="text-sm text-gray-500 mb-4">
              Definitions, formulas, and practical application examples.
            </p>
            <button className="w-full py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors">
              Start Revision
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardDecks;
