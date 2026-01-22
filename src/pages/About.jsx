import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FaUpload,
  FaBrain,
  FaPenFancy,
  FaChartLine,
} from "react-icons/fa";

/* ===============================
   TRUE FOCUS (INLINE)
================================ */
const TrueFocus = ({
  sentence,
  blurAmount = 5,
  borderColor = "#5eead4",
  glowColor = "rgba(94,234,212,0.6)",
  animationDuration = 0.9,
  pauseBetweenAnimations = 1,
}) => {
  const words = sentence.split(" ");
  const [index, setIndex] = useState(0);
  const containerRef = useRef(null);
  const wordRefs = useRef([]);
  const [rect, setRect] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, (animationDuration + pauseBetweenAnimations) * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!wordRefs.current[index] || !containerRef.current) return;
    const parent = containerRef.current.getBoundingClientRect();
    const active = wordRefs.current[index].getBoundingClientRect();
    setRect({
      x: active.left - parent.left,
      y: active.top - parent.top,
      width: active.width,
      height: active.height,
    });
  }, [index]);

  return (
    <div className="focus-container" ref={containerRef}>
      {words.map((word, i) => (
        <span
          key={i}
          ref={(el) => (wordRefs.current[i] = el)}
          className={`focus-word ${word === "AIXAM" ? "gradient" : ""}`}
          style={{
            filter: i === index ? "blur(0)" : `blur(${blurAmount}px)`,
          }}
        >
          {word}
        </span>
      ))}

      <motion.div
        className="focus-frame"
        animate={rect}
        transition={{ duration: animationDuration }}
        style={{
          "--border-color": borderColor,
          "--glow-color": glowColor,
        }}
      >
        <span className="corner tl" />
        <span className="corner tr" />
        <span className="corner bl" />
        <span className="corner br" />
      </motion.div>
    </div>
  );
};

/* ===============================
   ABOUT SECTION
================================ */
const About = () => {
  const cards = [
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
      title: "Progress Analytics ",
      desc: "Track performance, weak topics, and learning growth visually.",
    },
  ];

  return (
    <>
      <style>{`
        .about {
          padding: 120px 8%;
          background: linear-gradient(180deg, #020617, #020617);
          color: #f8fafc;
          transition: all 0.4s ease;
        }

        .light .about {
          background: linear-gradient(180deg, #f8fafc, #eef2ff);
          color: #020617;
        }

        /* ===== TRUE FOCUS ===== */
        .focus-container {
          position: relative;
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-bottom: 30px;
        }

        .focus-word {
          font-size: 3rem;
          font-weight: 800;
          transition: filter 0.3s ease;
          color: inherit;
        }

        .focus-word.gradient {
          background: linear-gradient(90deg, #5eead4, #60a5fa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .focus-frame {
          position: absolute;
          pointer-events: none;
          margin-left:-900px;
        }

        .corner {
          position: absolute;
          width: 14px;
          height: 14px;
          border: 3px solid var(--border-color);
          filter: drop-shadow(0 0 6px var(--glow-color));
        }
        .last{
        margin-left:400px;}

        .tl { top: -8px; left: -8px; border-right: none; border-bottom: none; }
        .tr { top: -8px; right: -8px; border-left: none; border-bottom: none; }
        .bl { bottom: -8px; left: -8px; border-right: none; border-top: none; }
        .br { bottom: -8px; right: -8px; border-left: none; border-top: none; }

        .about p {
          max-width: 760px;
          margin: 0 auto 80px;
          text-align: center;
          line-height: 1.7;
          font-size: 1.05rem;
          color: #cbd5f5;
        }

        .light .about p {
          color: #334155;
        }

        /* ===== CARDS ===== */
        .cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 26px;
        }
/* Center last card if it's alone in the last row */
.cards > .card:last-child {
  grid-column: 1 / -1;
  max-width: 320px;
  margin: 0 auto;
}

        .card {
          padding: 30px 22px;
          border-radius: 26px;
          background: linear-gradient(135deg, #0f766e40, #1e3a8a40);
          backdrop-filter: blur(18px);
          border: 1px solid rgba(255,255,255,0.15);
          transition: all 0.4s ease;
        }

        .light .card {
          background: linear-gradient(135deg, #99f6e440, #bfdbfe40);
          border: 1px solid rgba(0,0,0,0.1);
        }

        .card:hover {
          transform: translateY(-12px);
          box-shadow: 0 30px 70px rgba(94,234,212,0.25);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 14px;
        }

        .card-icon {
          font-size: 34px;
          transition: transform 0.5s ease;
          background: linear-gradient(135deg, #5eead4, #60a5fa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
          .card-icon {
  font-size: 34px;
  background: linear-gradient(135deg, #5eead4, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
}
        .card:hover .card-icon {
  filter: drop-shadow(0 0 10px rgba(94,234,212,0.6));
}


        .card:hover .card-icon {
          transform: rotate(360deg);
        }

        .card h3 {
          font-size: 1.3rem;
          margin: 0;
        }

        .card p {
          font-size: 0.95rem;
          margin: 0;
          color: #e2e8f0;
        }

        .light .card p {
          color: #334155;
        }
      `}</style>

      <section className="about" id="about">
        <TrueFocus sentence="About AIXAM" />

        <p>
          AIXAM is an AI-powered exam preparation and teaching assistance platform
          designed to modernize learning and simplify teaching. It combines
          automation, analytics, and intelligent tools to create a smarter,
          more effective educational experience.
        </p>

        <div className="cards">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              className="card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="card-header">
                <div className="card-icon">{card.icon}</div>
                <h3>{card.title}</h3>
              </div>
              <p>{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
};

export default About;
