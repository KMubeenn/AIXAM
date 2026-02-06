import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StudentDashboard from "./pages/StudentDashboard/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard/TeacherDashboard";
import AnalyticsDashboard from "./pages/Analytics/Analytics";

import AuthLayout from "./layouts/AuthLayout";

import Home from "./pages/Home/Home";

import LoginT from "./pages/LoginTeacher/LoginTeacher";
import LoginS from "./pages/LoginStudent/LoginStudent";
import CreateAccount from "./pages/CreateAccount/CreateAccount";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Home Route (Standalone Layout) */}
        <Route path="/" element={<Home />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />

        {/* Auth Routes */}

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login-teacher" element={<LoginT />} />
          <Route path="/login-student" element={<LoginS />} />
          <Route path="/create-account" element={<CreateAccount />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
