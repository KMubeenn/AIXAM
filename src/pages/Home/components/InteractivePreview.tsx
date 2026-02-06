import { LuCheck } from "react-icons/lu";

const InteractivePreview: React.FC = () => {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-indigo-900 rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-teal-500 rounded-full blur-3xl opacity-20"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Experience the future of learning today.
              </h2>
              <p className="text-indigo-100 text-lg mb-8">
                Join over 10,000 students and teachers using AIXAM to save time
                and improve grades.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-indigo-50">
                  <LuCheck className="w-5 h-5 text-teal-400 mr-3" />
                  Free for individual students
                </li>
                <li className="flex items-center text-indigo-50">
                  <LuCheck className="w-5 h-5 text-teal-400 mr-3" />
                  Institutional discounts available
                </li>
                <li className="flex items-center text-indigo-50">
                  <LuCheck className="w-5 h-5 text-teal-400 mr-3" />
                  GDPR & FERPA Compliant
                </li>
              </ul>
              <button className="bg-white text-indigo-900 px-8 py-3 rounded-full font-bold hover:bg-indigo-50 transition-colors">
                Start Free Trial
              </button>
            </div>

            {/* Mockup UI Card */}
            <div className="lg:w-1/2 w-full">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold">
                      AI
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        Physics 101: Mechanics
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Generated 2 mins ago
                      </div>
                    </div>
                  </div>
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs px-2 py-1 rounded-full font-medium">
                    Ready
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mb-2">
                      Question 1
                    </div>
                    <div className="text-sm text-slate-800 dark:text-slate-200 font-medium mb-3">
                      What is the relationship between force, mass, and
                      acceleration?
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 cursor-pointer border border-transparent hover:border-indigo-100 dark:hover:border-indigo-500/30 transition-colors">
                        <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 mr-3"></div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          F = m / a
                        </span>
                      </div>
                      <div className="flex items-center p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-500/30 cursor-pointer">
                        <div className="w-4 h-4 rounded-full border-4 border-indigo-600 dark:border-indigo-500 mr-3"></div>
                        <span className="text-sm text-indigo-900 dark:text-indigo-200 font-medium">
                          F = m * a
                        </span>
                      </div>
                      <div className="flex items-center p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 cursor-pointer border border-transparent hover:border-indigo-100 dark:hover:border-indigo-500/30 transition-colors">
                        <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 mr-3"></div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          F = a / m
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractivePreview;
