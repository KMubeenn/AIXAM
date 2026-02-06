import {
  LuFileText,
  LuEllipsisVertical,
  LuPresentation,
  LuFile,
  LuPlus,
} from "react-icons/lu";

const RecentMaterials: React.FC = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Recent Materials
        </h3>
        <a
          href="#"
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
        >
          View All
        </a>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Doc 1 */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition-all group cursor-pointer">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
              <LuFileText className="w-5 h-5" />
            </div>
            <button className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300">
              <LuEllipsisVertical className="w-4 h-4" />
            </button>
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
            Thermodynamics Notes.pdf
          </h4>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            2.4 MB • Added 2h ago
          </p>
        </div>
        {/* Doc 2 */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition-all group cursor-pointer">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <LuPresentation className="w-5 h-5" />
            </div>
            <button className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300">
              <LuEllipsisVertical className="w-4 h-4" />
            </button>
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
            Organic Chem Review.ppt
          </h4>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            5.1 MB • Added 5h ago
          </p>
        </div>
        {/* Doc 3 */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition-all group cursor-pointer">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <LuFile className="w-5 h-5" />
            </div>
            <button className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300">
              <LuEllipsisVertical className="w-4 h-4" />
            </button>
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
            Calculus Formulas.doc
          </h4>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            1.2 MB • Added Yesterday
          </p>
        </div>
        {/* Upload New */}
        <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all cursor-pointer flex flex-col items-center justify-center text-center h-full min-h-[120px]">
          <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2 shadow-sm">
            <LuPlus className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-slate-400">
            Upload New
          </span>
        </div>
      </div>
    </div>
  );
};

export default RecentMaterials;
