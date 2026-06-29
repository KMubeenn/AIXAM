import React from "react";
import Sidebar from "../StudentDashboard/components/Sidebar";
import Header from "../StudentDashboard/components/Header";
import { useProfile } from "../../hooks/useUser";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api";
import ChangePassword from "../../components/ChangePassword";
import { LuUser, LuMail, LuCalendarClock } from "react-icons/lu";

const StudentProfile: React.FC = () => {
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  
  const getInitials = (first?: string, last?: string) => {
    if (!first) return "S";
    return `${first[0]}${last ? last[0] : ""}`.toUpperCase();
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 dark:bg-slate-950 font-inter text-gray-800 dark:text-slate-100">
      <Sidebar />
      <main className="flex-1 p-4 lg:p-8">
        <Header />
        
        <div className="max-w-4xl mx-auto space-y-6 mt-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Student Profile</h1>
          
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
                        Student
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

            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentProfile;
