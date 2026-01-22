import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";

import AuthLayout from "./layouts/AuthLayout";

import Home from "./pages/Home";

import LoginT from "./components/LoginT";
import LoginS from "./components/LoginS";
import CreateAccount from "./components/CreateAccount";

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
