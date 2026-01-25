import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const subjectData = [
  { subject: "Mathematics", A: 92, fullMark: 100 },
  { subject: "Physics", A: 78, fullMark: 100 },
  { subject: "Chemistry", A: 68, fullMark: 100 },
  { subject: "Biology", A: 82, fullMark: 100 },
  { subject: "English", A: 85, fullMark: 100 },
  { subject: "History", A: 75, fullMark: 100 },
];

const progressData = [
  { week: "Week 1", score: 72 },
  { week: "Week 2", score: 74 },
  { week: "Week 3", score: 76 },
  { week: "Week 4", score: 78 },
  { week: "Week 5", score: 77 },
  { week: "Week 6", score: 79 },
  { week: "Week 7", score: 81 },
  { week: "Week 8", score: 82 },
];

import { useTheme } from "../../../context/ThemeContext";

const ChartsSection: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Chart Text/Grid Colors
  const textColor = isDark ? "#94a3b8" : "#4b5563"; // slate-400 vs gray-600
  const gridColor = isDark ? "#334155" : "#e5e7eb"; // slate-700 vs gray-200

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Subject Performance Radar Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Subject Performance
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={subjectData}>
              <PolarGrid stroke={gridColor} />
              <PolarAngleAxis dataKey="subject" tick={{ fill: textColor }} />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: textColor }}
              />
              <Radar
                name="Performance"
                dataKey="A"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.2}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#1e293b" : "#fff",
                  borderColor: isDark ? "#334155" : "#e5e7eb",
                  color: isDark ? "#f8fafc" : "#000",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Progress Over Time Line Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Progress Over Time
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={progressData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="week" tick={{ fill: textColor }} />
              <YAxis domain={[60, 100]} tick={{ fill: textColor }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#1e293b" : "#fff",
                  borderColor: isDark ? "#334155" : "#e5e7eb",
                  color: isDark ? "#f8fafc" : "#000",
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;
