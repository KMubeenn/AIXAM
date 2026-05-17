import logoImg from "../../../assets/logo/logo_black.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  LuLayoutDashboard,
  LuCloudUpload,
  LuLayers,
  LuFileCheck,
  LuActivity,
  LuChevronRight,
  LuMessageSquare,
  LuLogOut,
  LuSettings,
  LuUser,
  LuHistory,
  LuPlus,
  LuTrash2,
} from "react-icons/lu";
import { useAuthStore } from "../../../store/useAuthStore";
import { useSessions } from "../../../hooks/useChat";

interface SidebarProps {
  onSessionSelect?: (sessionId: string) => void;
  onNewChat?: () => void;
  onSessionDelete?: (sessionId: string) => void;
  activeSessionId?: string | null;
  loadingSessionId?: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({
  onSessionSelect,
  onNewChat,
  onSessionDelete,
  activeSessionId,
  loadingSessionId
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const { sessions, deleteSession, isDeleting, deletingId, isLoading: isSessionsLoading } = useSessions();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const isActive = (path: string) => location.pathname === path;
  const isChatPage = location.pathname === "/chat";

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
    <aside className="w-full lg:w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex-col hidden lg:flex h-screen sticky top-0">
      <div className="p-6 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center justify-center gap-3">
          <img
            src={logoImg}
            alt="AIXAM Logo"
            className="h-12 w-auto dark:invert"
          />
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
        <Link
          to="/student-dashboard"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
            isActive("/student-dashboard") 
              ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/50" 
              : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100"
          }`}
        >
          <LuLayoutDashboard className="w-5 h-5" />
          Dashboard
        </Link>
        <Link
          to="/chat"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
            isActive("/chat") 
              ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/50" 
              : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100"
          }`}
        >
          <LuMessageSquare className="w-5 h-5" />
          AI Study Agent
        </Link>

        {/* Recent Chats Section - Only visible on Chat Page */}
        {isChatPage && (
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
            <div className="space-y-1 max-h-[30vh] overflow-y-auto pr-2 no-scrollbar">
              {isSessionsLoading ? (
                <div className="px-4 py-2 space-y-2">
                  <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded animate-pulse w-1/2"></div>
                </div>
              ) : sessions.length === 0 ? (
                <p className="px-4 py-2 text-xs text-gray-400 dark:text-slate-600 italic">No recent chats</p>
              ) : (
                sessions.map((session: any) => {
                  const isActiveSession = activeSessionId === session.id;
                  const isLoadingThisSession = loadingSessionId === session.id;

                  return (
                    <div key={session.id} className="group relative">
                      <button
                         onClick={() => onSessionSelect?.(session.id)}
                         disabled={(isDeleting && deletingId === session.id) || isLoadingThisSession}
                         className={`w-full flex items-center gap-2 px-4 py-2 text-xs font-medium transition-all text-left truncate pr-8 ${
                           isDeleting && deletingId === session.id 
                             ? "bg-red-50 dark:bg-red-900/20 text-red-600 animate-pulse rounded-lg" 
                             : isLoadingThisSession
                               ? "bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-500 animate-pulse rounded-lg"
                               : isActiveSession
                                 ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold border-l-4 border-indigo-500 pl-3 rounded-r-lg"
                                 : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg"
                         }`}
                       >
                         <LuHistory className={`w-3.5 h-3.5 flex-shrink-0 ${
                           isDeleting && deletingId === session.id 
                             ? "animate-spin text-red-500" 
                             : isLoadingThisSession
                               ? "animate-spin text-indigo-500"
                               : isActiveSession
                                 ? "text-indigo-600 dark:text-indigo-400"
                                 : ""
                         }`} />
                         <span className={`truncate ${isLoadingThisSession ? "italic text-indigo-400 dark:text-indigo-500" : ""}`}>
                           {isLoadingThisSession ? "Loading..." : (session.title || 'Untitled Chat')}
                         </span>
                       </button>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          deleteSession(session.id); 
                          onSessionDelete?.(session.id);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <LuTrash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800">
          <Link
            to="/study-materials"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100 rounded-xl font-medium transition-colors"
          >
            <LuCloudUpload className="w-5 h-5" />
            Upload Materials
          </Link>
          <Link
            to="/flashcards"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100 rounded-xl font-medium transition-colors"
          >
            <LuLayers className="w-5 h-5" />
            Flashcards
          </Link>
          <Link
            to="/mock-tests"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100 rounded-xl font-medium transition-colors"
          >
            <LuFileCheck className="w-5 h-5" />
            Mock Tests
          </Link>
          <Link
            to="/analytics"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              isActive("/analytics") 
                ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/50" 
                : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100"
            }`}
          >
            <LuActivity className="w-5 h-5" />
            Analytics
          </Link>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-100 dark:border-slate-800 relative" ref={dropdownRef}>
        {isDropdownOpen && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 py-2 animate-in slide-in-from-bottom-2 duration-200">
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
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
            {user?.first_name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-slate-100 truncate">
              {user ? `${user.first_name} ${user.last_name}` : "User Profile"}
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-500 truncate">
              {user?.email}
            </p>
          </div>
          <LuChevronRight className={`w-4 h-4 text-gray-400 dark:text-slate-500 transition-transform ${isDropdownOpen ? '-rotate-90' : ''}`} />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
