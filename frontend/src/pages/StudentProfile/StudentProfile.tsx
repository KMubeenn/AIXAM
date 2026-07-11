import React, { useState } from "react";
import Sidebar from "../StudentDashboard/components/Sidebar";
import Header from "../StudentDashboard/components/Header";
import { useProfile } from "../../hooks/useUser";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api";
import ChangePassword from "../../components/ChangePassword";
import { LuUser, LuMail, LuCalendarClock, LuTrash2, LuX } from "react-icons/lu";
import { AuthService } from "../../services/auth.service";
import { useAuthStore } from "../../store/useAuthStore";
import toast from "react-hot-toast";

const StudentProfile: React.FC = () => {
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  
  const getInitials = (first?: string, last?: string) => {
    if (!first) return "S";
    return `${first[0]}${last ? last[0] : ""}`.toUpperCase();
  };

  const handleDeleteAccount = async () => {
    try {
      await AuthService.deleteAccount();
      toast.success("Account deleted successfully");
      clearAuth();
      window.location.href = "/";
    } catch (e: any) {
      toast.error(e.message || "Failed to delete account");
    } finally {
      setShowDeleteModal(false);
    }
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

              {/* Danger Zone */}
              <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Delete Account
                </button>
              </div>

            </>
          )}
        </div>
      </main>

      {/* Styled React Confirmation Modal for Deletion */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <LuX className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-4">
              <LuTrash2 className="w-6 h-6" />
              <h3 className="text-lg font-bold">Delete Account</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">
              Are you absolutely sure you want to delete your account? This action is permanent and cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-semibold rounded-lg text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 text-sm font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
              >
                Yes, Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
