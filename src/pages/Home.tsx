import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { FaRobot } from "react-icons/fa";

const Home: React.FC = () => {
  const robotRef = useRef<SVGElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Floating animation
    if (robotRef.current) {
      gsap.to(robotRef.current, {
        y: -20,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });
    }

    // Glow pulse
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        scale: 1.15,
        opacity: 0.7,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }
  }, []);

  return (
    <section
      id="home"
      className="min-h-screen flex flex-col md:flex-row items-center justify-center md:justify-between px-6 md:px-[8%] pt-[120px] md:pt-0 gap-10 md:gap-0
      bg-[radial-gradient(circle_at_right,#99f6e420,transparent_40%),linear-gradient(135deg,#f8fafc,#eef2ff)]
      dark:bg-[radial-gradient(circle_at_right,#0f766e20,transparent_40%),linear-gradient(135deg,#020617,#020617)]
      text-slate-900 dark:text-slate-50 transition-colors duration-400"
    >
      {/* LEFT CONTENT */}
      <div className="max-w-[520px] text-center md:text-left z-10">
        <div className="text-[#0f766e] dark:text-[#5eead4] font-medium mb-2">
          AI-Powered Learning & Teaching
        </div>
        <h1 className="text-[3.2rem] font-bold leading-[1.2] mb-5">
          Smarter Exams. <br />
          <span className="bg-gradient-to-r from-[#5eead4] to-[#60a5fa] bg-clip-text text-transparent">
            Better Teaching.
          </span>
        </h1>
        <p className="text-[1.05rem] leading-[1.7] mb-8 text-slate-600 dark:text-[#cbd5f5]">
          AIXAM transforms traditional exam preparation into an intelligent
          learning experience using AI-generated flashcards, mock tests,
          analytics, and automated classroom assistance for students and
          teachers.
        </p>

        <div className="flex gap-[18px] justify-center md:justify-start">
          <button className="px-[26px] py-[14px] rounded-full font-medium cursor-pointer transition-all duration-300 bg-gradient-to-br from-[#5eead4] to-[#60a5fa] text-slate-900 shadow-[0_10px_30px_rgba(94,234,212,0.35)] hover:-translate-y-[2px] hover:shadow-[0_15px_40px_rgba(96,165,250,0.45)] border-none">
            How It Works
          </button>
          <button className="px-[26px] py-[14px] rounded-full font-medium cursor-pointer transition-all duration-300 bg-black/5 dark:bg-white/10 text-slate-900 dark:text-slate-50 border border-black/10 dark:border-white/20 hover:-translate-y-[2px]">
            Explore More
          </button>
        </div>
      </div>

      {/* RIGHT CONTENT */}
      <div className="relative flex items-center justify-center w-[300px] h-[300px] md:w-[420px] md:h-[420px] mt-10 md:mt-0">
        <div
          ref={glowRef}
          className="absolute w-[200px] h-[200px] md:w-[280px] md:h-[280px] rounded-full bg-[radial-gradient(circle,#5eead4,transparent_70%)] opacity-40 blur-[40px] z-[1]"
        ></div>
        {/* React Icons doesn't forward refs to SVG usually, so wrapping in a div or passing ref properly might be needed. 
            FaRobot returns an SVG. We can wrap it. */}
        <div
          ref={robotRef as any}
          className="z-[2] text-[180px] md:text-[260px] text-[#0f172a] dark:text-[#e5f9f6] drop-shadow-[0_20px_40px_rgba(15,118,110,0.25)] dark:drop-shadow-none"
        >
          <FaRobot />
        </div>
      </div>
    </section>
  );
};

export default Home;
