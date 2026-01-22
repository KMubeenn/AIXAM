import React from "react";
import bgVideo from "../assets/bg.mp4";
import whyUsImg from "../assets/whyy.png";

const WhyUs = () => {
  return (
    <>
      <style>{`
        .whyus {
          position: relative;
          margin-top: -100px;
          padding: 120px 8%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 60px;
          transition: all 0.4s ease;
          color: #f8fafc;
          overflow: hidden;
        }

        .light .whyus {
          // color: #020617;
        }

        /* Video Background */
        .whyus video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.4; /* Adjust opacity */
          z-index: 0;
        }

        /* LEFT CONTENT */
        .whyus-left {
          max-width: 520px;
          z-index: 1;
          position: relative;
        }

        .whyus-left h2 {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 18px;
        }

        .whyus-left h2 span {
          background: linear-gradient(90deg, #5eead4, #60a5fa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .whyus-left p {
          font-size: 1.05rem;
          line-height: 1.7;
          color: #cbd5f5;
        }

        .light .whyus-left p {
          color: #334155;
        }

        /* RIGHT IMAGE */
        .whyus-right {
          position: relative;
          z-index: 1;
          
        }

        .whyus-image-wrapper {
          width: 630px;
          height: 450px;
          
          padding: 4px;
          transition: all 0.4s ease;
        }

        .whyus-image-wrapper:hover {
          transform: translateY(-12px) scale(1.02);
        }

      
        .light .whyus video {
  opacity: 0.09; /* light mode, barely visible */
}
  /* Light mode */
  .light .whyus {
    color: #020617;
  }
    .light .whyus {
  background: transparent !important;
}

/* Very subtle motion only (no color wash) */
.light .whyus video {
  opacity: 0.0; /* super low so only animation shows */
}

        /* Responsive */
        @media (max-width: 900px) {
          .whyus {
            flex-direction: column;
            text-align: center;
            padding: 100px 4%;
          }

          .whyus-right {
            margin-top: 40px;
          }
        }
      `}</style>

      <section className="whyus" id="whyus">
        <video autoPlay loop muted>
          <source src={bgVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* LEFT */}
        <div className="whyus-left">
          <h2>
            Why <span>AIXAM?</span>
          </h2>
          <p>
            AIXAM is not just another learning platform.  
            We combine artificial intelligence, smart analytics, and modern
            teaching workflows to help students learn faster and teachers work
            smarter — all in one powerful ecosystem.
          </p>
        </div>

        {/* RIGHT IMAGE */}
        <div className="whyus-right">
          <div className="whyus-image-wrapper">
            <img
              src={whyUsImg}
              alt="Why AIXAM"
              className="whyus-image"
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default WhyUs;
