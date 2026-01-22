import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { FaRobot } from "react-icons/fa";

const Home = () => {
  const robotRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    // Floating animation
    gsap.to(robotRef.current, {
      y: -20,
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });

    // Glow pulse
    gsap.to(glowRef.current, {
      scale: 1.15,
      opacity: 0.7,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, []);

  return (
    <>
      <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

  * {
    font-family: 'Poppins', sans-serif;
  }

  /* =========================
     DARK MODE (DEFAULT)
  ========================= */

  .home {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 8%;
    background: radial-gradient(circle at right, #0f766e20, transparent 40%),
                linear-gradient(135deg, #020617, #020617);
    color: #f8fafc;
    transition: background 0.4s ease, color 0.4s ease;
  }

  .tagline {
    color: #5eead4;
  }

  .home-left p {
    color: #cbd5f5;
  }

  .btn-secondary {
    background: rgba(255, 255, 255, 0.08);
    color: #f8fafc;
    border: 1px solid rgba(255, 255, 255, 0.18);
  }

  .robot-icon {
    color: #e5f9f6;
  }

  /* =========================
     LIGHT MODE
     (body.light OR parent.light)
  ========================= */

  .light .home {
    background: radial-gradient(circle at right, #99f6e420, transparent 40%),
                linear-gradient(135deg, #f8fafc, #eef2ff);
    color: #020617;
  }

  .light .tagline {
    color: #0f766e;
  }

  .light .home-left p {
    color: #334155;
  }

  .light .btn-secondary {
    background: rgba(0, 0, 0, 0.05);
    color: #020617;
    border: 1px solid rgba(0, 0, 0, 0.12);
  }

  .light .robot-icon {
    color: #0f172a;
    filter: drop-shadow(0 20px 40px rgba(15, 118, 110, 0.25));
  }

  /* =========================
     SHARED STYLES
  ========================= */

  .home-left {
    max-width: 520px;
  }

  .home-left h1 {
    font-size: 3.2rem;
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 20px;
  }

  .home-left h1 span {
    background: linear-gradient(90deg, #5eead4, #60a5fa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .home-left p {
    font-size: 1.05rem;
    line-height: 1.7;
    margin-bottom: 32px;
  }

  .cta-buttons {
    display: flex;
    gap: 18px;
  }

  .btn {
    padding: 14px 26px;
    border-radius: 999px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: all 0.3s ease;
    font-size: 0.95rem;
  }

  .btn-primary {
    background: linear-gradient(135deg, #5eead4, #60a5fa);
    color: #020617;
    box-shadow: 0 10px 30px rgba(94, 234, 212, 0.35);
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 40px rgba(96, 165, 250, 0.45);
  }

  .btn-secondary:hover {
    transform: translateY(-2px);
  }

  .home-right {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 420px;
    height: 420px;
  }

  .robot-glow {
    position: absolute;
    width: 280px;
    height: 280px;
    border-radius: 50%;
    background: radial-gradient(circle, #5eead4, transparent 70%);
    opacity: 0.4;
    filter: blur(40px);
    z-index: 1;
  }

  .robot-icon {
    font-size: 260px;
    z-index: 2;
  }

  @media (max-width: 900px) {
    .home {
      flex-direction: column;
      text-align: center;
      padding-top: 120px;
    }

    .home-right {
      margin-top: 60px;
    }

    .cta-buttons {
      justify-content: center;
    }
  }
`}</style>


      <section className="home">
        {/* LEFT CONTENT */}
        <div className="home-left">
          <div className="tagline">AI-Powered Learning & Teaching</div>
          <h1>
            Smarter Exams. <br />
            <span>Better Teaching.</span>
          </h1>
          <p>
            AIXAM transforms traditional exam preparation into an intelligent
            learning experience using AI-generated flashcards, mock tests,
            analytics, and automated classroom assistance for students and
            teachers.
          </p>

          <div className="cta-buttons">
            <button className="btn btn-primary">How It Works</button>
            <button className="btn btn-secondary">Explore More</button>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="home-right">
          <div className="robot-glow" ref={glowRef}></div>
          <FaRobot className="robot-icon" ref={robotRef} />
        </div>
      </section>
    </>
  );
};

export default Home;
