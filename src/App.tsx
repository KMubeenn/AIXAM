import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

import Home from "./pages/Home";
import About from "./pages/About";
import WhyUs from "./pages/WhyUs";

import LoginT from "./components/LoginT";
import LoginS from "./components/LoginS";
import CreateAccount from "./components/CreateAccount";

const LandingPage = () => (
  <>
    <Home />
    <About />
    <WhyUs />
  </>
);

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Main Routes (with Navbar) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

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
