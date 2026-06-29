import React, { useEffect } from "react";
import Sidebar from "../TeacherDashboard/components/Sidebar";
import Header from "../TeacherDashboard/components/Header";
import { useProfile } from "../../hooks/useUser";
import { useTeacherAnalytics } from "../../hooks/useCore";
import { LuUser, LuMail, LuBookOpen, LuClipboardCheck, LuCalendarClock } from "react-icons/lu";
import { FaGoogle } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import ChangePassword from "../../components/ChangePassword";

const TeacherProfile: React.FC = () => {
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { data: analytics } = useTeacherAnalytics();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("connected") === "true") {
      toast.success("Google Classroom connected successfully!");
    }
  }, [searchParams]);

  const handleConnectGoogle = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
    window.location.href = `${apiUrl}/auth/google/login/?token=${token}`;
  };

  const getInitials = (first?: string, last?: string) => {
    if (!first) return "T";
    return `${first[0]}${last ? last[0] : ""}`.toUpperCase();
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 dark:bg-slate-950 font-inter text-gray-800 dark:text-slate-100">
      <Sidebar />
      <main className="flex-1 p-4 lg:p-8">
        <Header />
        
        <div className="max-w-4xl mx-auto space-y-6 mt-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Teacher Profile</h1>
          
          {isProfileLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-gray-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-32 bg-gray-200 dark:bg-slate-800 rounded-xl" />
            </div>
          ) : (
            <>
              {/* Personal Info Card */}
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-md flex-shrink-0">
                    {getInitials(profile?.first_name, profile?.last_name)}
                  </div>
                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {profile?.first_name} {profile?.last_name}
                    </h2>
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 dark:text-slate-400">
                      <LuMail className="w-4 h-4" />
                      <span>{profile?.email}</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400">
                        <LuUser className="w-3 h-3 mr-1" />
                        Teacher
                      </div>
                      {profile?.date_joined && (
                        <div className="inline-flex items-center text-xs text-gray-500 dark:text-slate-400">
                          <LuCalendarClock className="w-3 h-3 mr-1" />
                          Joined: {new Date(profile.date_joined).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Change Password */}
              <ChangePassword />

              {/* Google Classroom Integration */}
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Integrations</h3>
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-700">
                  <div className="flex items-center gap-4 mb-4 sm:mb-0">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm text-green-600">
                      <FaGoogle className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Google Classroom</p>
                      {profile?.google_connected ? (
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Connected as {profile.google_email || "Authorized User"}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-slate-400">Not connected</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleConnectGoogle}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      profile?.google_connected
                        ? "bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    }`}
                  >
                    {profile?.google_connected ? "Reconnect Google" : "Connect Google"}
                  </button>
                </div>
              </div>

              {/* Account Stats Card */}
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Account Stats</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-700 flex flex-col items-center justify-center">
                    <LuBookOpen className="w-6 h-6 text-blue-500 mb-2" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {analytics?.assignment_count ?? 0}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-slate-400">Assignments Created</span>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-700 flex flex-col items-center justify-center">
                    <LuClipboardCheck className="w-6 h-6 text-orange-500 mb-2" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {analytics?.quiz_count ?? 0}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-slate-400">Quizzes Created</span>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-700 flex flex-col items-center justify-center">
                    <LuCalendarClock className="w-6 h-6 text-purple-500 mb-2" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {analytics?.total_submissions ?? 0}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-slate-400">Total Submissions</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeacherProfile;
