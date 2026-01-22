import {
  LuLayoutDashboard,
  LuCloudUpload,
  LuLayers,
  LuFileCheck,
  LuActivity,
  LuChevronRight,
} from "react-icons/lu";

const Sidebar: React.FC = () => {
  return (
    <aside className="w-full lg:w-64 bg-white border-r border-gray-200 flex-col hidden lg:flex h-screen sticky top-0">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
            S
          </div>
          <span className="font-bold text-xl text-gray-900">StudyMate</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <a
          href="#"
          className="flex items-center gap-3 px-4 py-3 text-indigo-600 bg-indigo-50 rounded-xl font-medium transition-colors"
        >
          <LuLayoutDashboard className="w-5 h-5" />
          Dashboard
        </a>
        <a
          href="#"
          className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-colors"
        >
          <LuCloudUpload className="w-5 h-5" />
          Upload Materials
        </a>
        <a
          href="#"
          className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-colors"
        >
          <LuLayers className="w-5 h-5" />
          Flashcards
        </a>
        <a
          href="#"
          className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-colors"
        >
          <LuFileCheck className="w-5 h-5" />
          Mock Tests
        </a>
        <a
          href="#"
          className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-colors"
        >
          <LuActivity className="w-5 h-5" />
          Analytics
        </a>
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
            alt="User"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              Alex Johnson
            </p>
            <p className="text-xs text-gray-500 truncate">alex@student.edu</p>
          </div>
          <LuChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
