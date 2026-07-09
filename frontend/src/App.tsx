import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StudentDashboard from "./pages/StudentDashboard/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard/TeacherDashboard";
import AnalyticsDashboard from "./pages/Analytics/Analytics";
import Chat from "./pages/Chat/Chat";
import FlashcardsPage from "./pages/Flashcards/FlashcardsPage";
import MockTestsPage from "./pages/MockTests/MockTestsPage";
import StudyMaterialsPage from "./pages/StudyMaterials/StudyMaterialsPage";
import TeacherAssignments from "./pages/TeacherAssignments/TeacherAssignments";
import TeacherQuizzes from "./pages/TeacherQuizzes/TeacherQuizzes";
import Classroom from "./pages/Classroom/Classroom";
import TeacherProfile from "./pages/TeacherProfile/TeacherProfile";
import StudentProfile from "./pages/StudentProfile/StudentProfile";

import AuthLayout from "./layouts/AuthLayout";

import Home from "./pages/Home/Home";

import LoginT from "./pages/LoginTeacher/LoginTeacher";
import LoginS from "./pages/LoginStudent/LoginStudent";
import CreateAccount from "./pages/CreateAccount/CreateAccount";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import About from "./pages/About/About";
import WhyUs from "./pages/WhyUs/WhyUs";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Home Route (Standalone Layout) */}
        <Route path="/" element={<Home />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/flashcards" element={<FlashcardsPage />} />
        <Route path="/mock-tests" element={<MockTestsPage />} />
        <Route path="/study-materials" element={<StudyMaterialsPage />} />
        <Route path="/student-profile" element={<StudentProfile />} />
        
        {/* Teacher Pages */}
        <Route path="/teacher-assignments" element={<TeacherAssignments />} />
        <Route path="/teacher-quizzes" element={<TeacherQuizzes />} />
        <Route path="/classroom" element={<Classroom />} />
        <Route path="/teacher-profile" element={<TeacherProfile />} />

        {/* Auth Routes */}

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login-teacher" element={<LoginT />} />
          <Route path="/login-student" element={<LoginS />} />
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
