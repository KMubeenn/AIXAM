import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FaUpload, FaBrain, FaPenFancy, FaChartLine } from "react-icons/fa";

/* ===============================
   TRUE FOCUS (INLINE)
================================ */
interface TrueFocusProps {
  sentence: string;
  blurAmount?: number;
  borderColor?: string;
  glowColor?: string;
  animationDuration?: number;
  pauseBetweenAnimations?: number;
}

const TrueFocus: React.FC<TrueFocusProps> = ({
  sentence,
  blurAmount = 5,
  borderColor = "#5eead4",
  glowColor = "rgba(94,234,212,0.6)",
  animationDuration = 0.9,
  pauseBetweenAnimations = 1,
}) => {
  const words = sentence.split(" ");
  const [index, setIndex] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [rect, setRect] = useState<{
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  }>({});

  useEffect(() => {
    const interval = setInterval(
      () => {
        setIndex((prev) => (prev + 1) % words.length);
      },
      (animationDuration + pauseBetweenAnimations) * 1000,
    );
    return () => clearInterval(interval);
  }, [animationDuration, pauseBetweenAnimations, words.length]);

  useEffect(() => {
    if (!wordRefs.current[index] || !containerRef.current) return;
    const parent = containerRef.current.getBoundingClientRect();
    const active = wordRefs.current[index]!.getBoundingClientRect();
    setRect({
      x: active.left - parent.left,
      y: active.top - parent.top,
      width: active.width,
      height: active.height,
    });
  }, [index]);

  return (
    <div className="relative flex justify-center gap-4 mb-8" ref={containerRef}>
      {words.map((word, i) => (
        <span
          key={i}
          ref={(el) => {
            wordRefs.current[i] = el;
          }}
          className={`text-[3rem] font-extrabold transition-[filter] duration-300 text-inherit ${word === "AIXAM" ? "bg-gradient-to-r from-[#5eead4] to-[#60a5fa] bg-clip-text text-transparent" : ""}`}
          style={{
            filter: i === index ? "blur(0)" : `blur(${blurAmount}px)`,
          }}
        >
          {word}
        </span>
      ))}

      <motion.div
        className="absolute pointer-events-none -ml-[900px]" // Keeping the weird margin from original CSS if functionality depends on it, but likely not needed if positioned absolutely correctly. However, logic uses rect relative to container. 'absolute' without top/left defaults to position in flow? No.
        // The original CSS had .focus-frame { margin-left: -900px; } which is very strange.
        // But let's trust the rect calculation: x, y are relative to container.
        // So we should just use x and y in animate.
        // The original component might have had some layout quirks.
        // Let's rely on `animate={rect}` which sets top/left/width/height if passed?
        // Wait, `rect` has x, y, width, height. `motion.div` will animate these if they are style props.
        // x and y in framer motion usually map to transform translate.
        // But here we might want left/top.
        // Let's assume standard behavior:
        initial={false}
        animate={{
          left: rect.x,
          top: rect.y,
          width: rect.width,
          height: rect.height,
        }}
        transition={{ duration: animationDuration }}
        style={{
          // @ts-ignore - CSS custom properties
          "--border-color": borderColor,
          "--glow-color": glowColor,
        }}
      >
        <span className="absolute w-3.5 h-3.5 border-[3px] border-[var(--border-color)] drop-shadow-[0_0_6px_var(--glow-color)] -top-2 -left-2 border-r-0 border-b-0" />{" "}
        {/* tl */}
        <span className="absolute w-3.5 h-3.5 border-[3px] border-[var(--border-color)] drop-shadow-[0_0_6px_var(--glow-color)] -top-2 -right-2 border-l-0 border-b-0" />{" "}
        {/* tr */}
        <span className="absolute w-3.5 h-3.5 border-[3px] border-[var(--border-color)] drop-shadow-[0_0_6px_var(--glow-color)] -bottom-2 -left-2 border-r-0 border-t-0" />{" "}
        {/* bl */}
        <span className="absolute w-3.5 h-3.5 border-[3px] border-[var(--border-color)] drop-shadow-[0_0_6px_var(--glow-color)] -bottom-2 -right-2 border-l-0 border-t-0" />{" "}
        {/* br */}
      </motion.div>
    </div>
  );
};

/* ===============================
   ABOUT SECTION
================================ */
interface CardData {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const About: React.FC = () => {
  const cards: CardData[] = [
    {
      icon: <FaUpload />,
      title: "Upload Material",
      desc: "Upload PDFs, slides, or notes and let AI process them instantly.",
    },
    {
      icon: <FaBrain />,
      title: "Smart Flashcards",
      desc: "AI generates chapter-wise flashcards for fast and effective revision.",
    },
    {
      icon: <FaPenFancy />,
      title: "Mock Tests",
      desc: "Practice MCQs and descriptive tests to strengthen weak areas.",
    },
    {
      icon: <FaChartLine />,
      title: "Progress Analytics",
      desc: "Track performance, weak topics, and learning growth visually.",
    },
  ];

  return (
    <section
      id="about"
      className="py-[120px] px-[8%] bg-gradient-to-b from-[#020617] to-[#020617] dark:from-[#020617] dark:to-[#020617] text-slate-50 transition-all duration-400
      light:from-[#f8fafc] light:to-[#eef2ff] light:text-slate-900
      bg-[#020617] dark:bg-[#020617] light:bg-gradient-to-b group/section" // Using group to handle light mode if parent has class? No, we use dark: modifier.
      // Tailwind native dark mode:
      // Dark mode: bg-[#020617]
      // Light mode: bg-gradient-to-b from-[#f8fafc] to-[#eef2ff]
    >
      <div className="dark:hidden absolute inset-0 bg-gradient-to-b from-[#f8fafc] to-[#eef2ff] -z-10" />
      {/* Hack for light mode gradient if dark mode is class based. 
          Actually, better to use classes:
          className="... bg-[#f8fafc] dark:bg-[#020617] ..." 
          But the designs had specific gradients.
      */}

      <div className="relative">
        <TrueFocus sentence="About AIXAM" />

        <p className="max-w-[760px] mx-auto mb-20 text-center leading-[1.7] text-[1.05rem] text-[#334155] dark:text-[#cbd5f5]">
          AIXAM is an AI-powered exam preparation and teaching assistance
          platform designed to modernize learning and simplify teaching. It
          combines automation, analytics, and intelligent tools to create a
          smarter, more effective educational experience.
        </p>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-[26px]">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              className={`p-[30px_22px] rounded-[26px] backdrop-blur-lg border transition-all duration-400
                  hover:-translate-y-3 hover:shadow-[0_30px_70px_rgba(94,234,212,0.25)]
                  border-black/10 bg-gradient-to-br from-[#99f6e440] to-[#bfdbfe40]
                  dark:border-white/15 dark:bg-gradient-to-br dark:from-[#0f766e40] dark:to-[#1e3a8a40]
                  ${i === cards.length - 1 && cards.length % 2 !== 0 ? "md:col-span-2 lg:col-span-1 lg:max-w-[320px] lg:mx-auto" : ""}
                  /* Logic for centering last item if alone is tricky in pure grid without knowing exact column count. 
                     Original css used: .cards > .card:last-child { grid-column: 1 / -1; max-width: 320px; ... }
                     This centers the last card if it spans full width.
                  */
                  last:col-span-full last:max-w-[320px] last:mx-auto md:last:col-auto
                `}
              /* Wait, the original CSS was:
                   .cards > .card:last-child { grid-column: 1 / -1; max-width: 320px; ... }
                   This applies ALWAYS to the last child. 
                   So creating a generic grid but forcing the last child to be full width centered?
                   Let's stick to the original CSS logic.
                */
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-4 mb-3.5">
                <div className="text-[34px] flex items-center bg-gradient-to-br from-[#5eead4] to-[#60a5fa] bg-clip-text text-transparent group-hover:rotate-[360deg] transition-transform duration-500 drop-shadow-sm hover:drop-shadow-[0_0_10px_rgba(94,234,212,0.6)]">
                  {card.icon}
                </div>
                <h3 className="text-[1.3rem] m-0 font-semibold text-slate-800 dark:text-slate-50">
                  {card.title}
                </h3>
              </div>
              <p className="text-[0.95rem] m-0 text-slate-600 dark:text-[#e2e8f0]">
                {card.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
