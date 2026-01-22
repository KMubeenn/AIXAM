import React from "react";
import bgVideo from "../assets/bg.mp4";
import whyUsImg from "../assets/whyy.png";

const WhyUs: React.FC = () => {
  return (
    <section
      id="whyus"
      className="relative -mt-[100px] py-[120px] px-[8%] flex flex-col md:flex-row items-center justify-between gap-[60px] transition-all duration-400 text-slate-50 overflow-hidden"
    >
      <video
        autoPlay
        loop
        muted
        className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-[0.09] dark:opacity-40"
      >
        <source src={bgVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* LEFT */}
      <div className="max-w-[520px] z-[1] relative text-center md:text-left">
        <h2 className="text-[3rem] font-bold mb-[18px] text-slate-900 dark:text-slate-50">
          Why{" "}
          <span className="bg-gradient-to-r from-[#5eead4] to-[#60a5fa] bg-clip-text text-transparent">
            AIXAM?
          </span>
        </h2>
        <p className="text-[1.05rem] leading-[1.7] text-slate-600 dark:text-[#cbd5f5]">
          AIXAM is not just another learning platform. We combine artificial
          intelligence, smart analytics, and modern teaching workflows to help
          students learn faster and teachers work smarter — all in one powerful
          ecosystem.
        </p>
      </div>

      {/* RIGHT IMAGE */}
      <div className="relative z-[1] mt-10 md:mt-0">
        <div className="w-full max-w-[630px] md:h-[450px] p-1 transition-all duration-400 hover:-translate-y-3 hover:scale-[1.02]">
          <img
            src={whyUsImg}
            alt="Why AIXAM"
            className="w-full h-full object-contain drop-shadow-xl"
          />
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
