import logoImg from "../../../assets/logo/logo_black.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  LuGraduationCap,
  LuLayoutDashboard,
  LuCloudUpload,
  LuWand,
  LuFileQuestion,
  LuUsers,
  LuActivity,
  LuSettings,
  LuMessageSquare,
  LuLogOut,
  LuUser,
  LuChevronUp,
  LuHistory,
  LuPlus,
  LuTrash2,
} from "react-icons/lu";
import { useAuthStore } from "../../../store/useAuthStore";
import { useSessions } from "../../../hooks/useChat";

interface SidebarProps {
  onSessionSelect?: (sessionId: string) => void;
  onNewChat?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSessionSelect, onNewChat }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const { sessions, deleteSession } = useSessions();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

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
        <Link
          to="/teacher-dashboard"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
            isActive("/teacher-dashboard")
              ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
              : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100"
          }`}
        >
          <LuLayoutDashboard className="w-5 h-5" />
          Dashboard
        </Link>
        <Link
          to="/chat"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
            isActive("/chat")
              ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
              : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100"
          }`}
        >
          <LuMessageSquare className="w-5 h-5" />
          AI Assistant
        </Link>
        <Link
          to="#"
          className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100 rounded-lg font-medium transition-colors"
        >
          <LuCloudUpload className="w-5 h-5" />
          Upload Content
        </Link>
        <Link
          to="#"
          className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100 rounded-lg font-medium transition-colors"
        >
          <LuWand className="w-5 h-5" />
          Generate Assignments
        </Link>
        <Link
          to="#"
          className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100 rounded-lg font-medium transition-colors"
        >
          <LuFileQuestion className="w-5 h-5" />
          Quizzes
        </Link>
        <Link
          to="#"
          className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100 rounded-lg font-medium transition-colors"
        >
          <LuUsers className="w-5 h-5" />
          Classroom Integration
        </Link>
        <Link
          to="/analytics"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
            isActive("/analytics")
              ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
              : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100"
          }`}
        >
          <LuActivity className="w-5 h-5" />
          Analytics
        </Link>

        {/* Recent Chats Section - Only visible on Chat Page */}
        {isActive("/chat") && (
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between px-4 mb-2">
              <h4 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                Recent Chats
              </h4>
              <button 
                onClick={onNewChat}
                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded text-indigo-600 dark:text-indigo-400 transition-colors"
                title="New Chat"
              >
                <LuPlus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
              {sessions.length === 0 ? (
                <p className="px-4 py-2 text-xs text-gray-400 dark:text-slate-600 italic">No recent chats</p>
              ) : (
                sessions.map((session: any) => (
                  <div key={session.id} className="group relative">
                    <button
                      onClick={() => onSessionSelect?.(session.id)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-left truncate pr-8"
                    >
                      <LuHistory className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{session.title || 'Untitled Chat'}</span>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <LuTrash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800">
          <Link
            to="#"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100 rounded-lg font-medium transition-colors"
          >
            <LuCloudUpload className="w-5 h-5" />
            Upload Content
          </Link>
          <Link
            to="#"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100 rounded-lg font-medium transition-colors"
          >
            <LuWand className="w-5 h-5" />
            Generate Assignments
          </Link>
          <Link
            to="#"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100 rounded-lg font-medium transition-colors"
          >
            <LuFileQuestion className="w-5 h-5" />
            Quizzes
          </Link>
          <Link
            to="#"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100 rounded-lg font-medium transition-colors"
          >
            <LuUsers className="w-5 h-5" />
            Classroom Integration
          </Link>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-100 dark:border-slate-800 relative" ref={dropdownRef}>
        {isDropdownOpen && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 py-2 animate-in slide-in-from-bottom-2 duration-200 z-50">
            <div className="p-1">
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-colors">
                <LuUser className="w-4 h-4" />
                View Profile
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-colors">
                <LuSettings className="w-4 h-4" />
                Settings
              </button>
            </div>
            <div className="p-1 mt-1 border-t border-slate-50 dark:border-slate-700">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
              >
                <LuLogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          </div>
        )}
        <div 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
            {user?.first_name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-slate-100 truncate">
              {user ? `${user.first_name} ${user.last_name}` : "Teacher Profile"}
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-500 truncate">
              {user?.role}
            </p>
          </div>
          <LuChevronUp className={`w-4 h-4 text-gray-400 dark:text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
