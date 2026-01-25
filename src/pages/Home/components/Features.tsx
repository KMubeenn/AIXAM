import React from "react";
import { LuZap, LuFileCheck, LuChartBar, LuLayoutGrid } from "react-icons/lu";

const Features: React.FC = () => {
  return (
    <section className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Everything you need to excel
          </h2>
          <p className="text-lg text-slate-600">
            Whether you're cramming for finals or grading a hundred papers,
            AIXAM streamlines the process.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature 1 */}
          <div className="group p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300">
            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <LuZap className="w-7 h-7 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              AI Flashcards
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Upload any PDF or notes. Our AI instantly generates smart
              flashcards and mock tests tailored to your curriculum.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:border-teal-100 hover:shadow-xl hover:shadow-teal-100/50 transition-all duration-300">
            <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <LuFileCheck className="w-7 h-7 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              Auto Assignments
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Create quizzes in seconds. AI generates questions, grades
              responses, and provides instant feedback to students.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <LuChartBar className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              Smart Analytics
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Visualize progress with detailed dashboards. Identify weak spots
              and track improvement over time.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="group p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:border-amber-100 hover:shadow-xl hover:shadow-amber-100/50 transition-all duration-300">
            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <LuLayoutGrid className="w-7 h-7 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              Classroom Sync
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Seamlessly integrates with Google Classroom. Sync rosters, export
              grades, and manage coursework in one place.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
