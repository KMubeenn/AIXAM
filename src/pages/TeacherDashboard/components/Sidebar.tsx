import logoImg from "../../../assets/logo/logo_black.png";
import {
  LuGraduationCap,
  LuLayoutDashboard,
  LuCloudUpload,
  LuWand,
  LuFileQuestion,
  LuUsers,
  LuActivity,
  LuSettings,
} from "react-icons/lu";

const Sidebar: React.FC = () => {
  return (
    <aside className="w-full lg:w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex-shrink-0 hidden lg:flex lg:flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center justify-center gap-3 border-b border-gray-100 dark:border-slate-800">
        <img
          src={logoImg}
          alt="AIXAM Logo"
          className="h-12 w-auto dark:invert"
        />
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <a
          href="#"
          className="flex items-center gap-3 px-4 py-3 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg font-medium transition-colors"
        >
          <LuLayoutDashboard className="w-5 h-5" />
          Dashboard
        </a>
        <a
          href="#"
          className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100 rounded-lg font-medium transition-colors"
        >
          <LuCloudUpload className="w-5 h-5" />
          Upload Content
        </a>
        <a
          href="#"
          className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100 rounded-lg font-medium transition-colors"
        >
          <LuWand className="w-5 h-5" />
          Generate Assignments
        </a>
        <a
          href="#"
          className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100 rounded-lg font-medium transition-colors"
        >
          <LuFileQuestion className="w-5 h-5" />
          Quizzes
        </a>
        <a
          href="#"
          className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100 rounded-lg font-medium transition-colors"
        >
          <LuUsers className="w-5 h-5" />
          Classroom Integration
        </a>
        <a
          href="#"
          className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100 rounded-lg font-medium transition-colors"
        >
          <LuActivity className="w-5 h-5" />
          Analytics
        </a>
      </nav>

      <div className="p-4 border-t border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-3 px-4 py-2">
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-slate-700"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
              Sarah Wilson
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-500 truncate">
              Senior Instructor
            </p>
          </div>
          <button className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300">
            <LuSettings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
