import React from "react";
import { LuTrendingUp, LuBookOpen, LuTarget, LuClock } from "react-icons/lu";

const ScoreCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
      {/* Overall Score */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <LuTrendingUp className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-1">Overall Score</p>
        <p className="text-3xl font-bold text-gray-900">82%</p>
        <p className="text-xs text-green-600 mt-2">+5% from last month</p>
      </div>

      {/* Strongest Subject */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <LuBookOpen className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-1">Strongest Subject</p>
        <p className="text-2xl font-bold text-gray-900">Mathematics</p>
        <p className="text-xs text-blue-600 mt-2">92% average</p>
      </div>

      {/* Needs Focus */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <LuTarget className="w-6 h-6 text-orange-600" />
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-1">Needs Focus</p>
        <p className="text-2xl font-bold text-gray-900">Chemistry</p>
        <p className="text-xs text-orange-600 mt-2">68% average</p>
      </div>

      {/* Study Time */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <LuClock className="w-6 h-6 text-purple-600" />
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-1">Study Time</p>
        <p className="text-3xl font-bold text-gray-900">24h</p>
        <p className="text-xs text-purple-600 mt-2">This week</p>
      </div>
    </div>
  );
};

export default ScoreCards;
