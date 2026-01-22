import React from "react";
import Navbar from "../components/home/Navbar";
import Hero from "../components/home/Hero";
import Features from "../components/home/Features";
import InteractivePreview from "../components/home/InteractivePreview";
import Footer from "../components/home/Footer";

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
