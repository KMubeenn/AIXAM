import React from "react";
import { LuTrendingUp, LuBookOpen, LuClock } from "react-icons/lu";

const Insights: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm p-8 text-white">
      <h3 className="text-2xl font-bold mb-2">Actionable Insights</h3>
      <p className="text-blue-100 mb-6">
        Based on your performance data, here are personalized recommendations:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-3">
            <LuTrendingUp className="w-6 h-6" />
          </div>
          <h4 className="font-semibold mb-2">Keep It Up!</h4>
          <p className="text-sm text-blue-100">
            Your math performance is excellent. Continue practicing advanced
            problems.
          </p>
        </div>
        <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-3">
            <LuBookOpen className="w-6 h-6" />
          </div>
          <h4 className="font-semibold mb-2">Focus Area</h4>
          <p className="text-sm text-blue-100">
            Spend 30 more minutes on organic chemistry concepts this week.
          </p>
        </div>
        <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-3">
            <LuClock className="w-6 h-6" />
          </div>
          <h4 className="font-semibold mb-2">Study Schedule</h4>
          <p className="text-sm text-blue-100">
            Your consistent study pattern is paying off. Maintain this routine.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Insights;
