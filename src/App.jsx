import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import WhyUs from "./pages/WhyUs";

import LoginT from "./components/LoginT";
import LoginS from "./components/LoginS";
import CreateAccount from "./components/CreateAccount";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* HOME PAGE */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Home />
              <About />
              <WhyUs />
            </>
          }
        />

        {/* AUTH PAGES */}
        <Route path="/login-teacher" element={<LoginT />} />
        <Route path="/login-student" element={<LoginS />} />
        <Route path="/create-account" element={<CreateAccount />} />
      </Routes>
    </Router>
  );
};

export default App;
