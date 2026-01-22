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

const ChartsSection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Subject Performance Radar Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Subject Performance
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={subjectData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar
                name="Performance"
                dataKey="A"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.2}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Progress Over Time Line Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis domain={[60, 100]} />
              <Tooltip />
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
