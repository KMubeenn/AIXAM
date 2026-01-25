import React from "react";
import Navbar from "../../components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import InteractivePreview from "./components/InteractivePreview";
import Footer from "../../components/Footer";

const Home: React.FC = () => {
  return (
    <div className="bg-slate-50 text-slate-800 font-inter min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <InteractivePreview />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
