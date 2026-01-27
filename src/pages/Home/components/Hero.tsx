import React from "react";
import { Link } from "react-router-dom";
import { LuGraduationCap, LuPresentation } from "react-icons/lu";

const Hero: React.FC = () => {
  return (
    <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-40 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-indigo-50 dark:bg-indigo-900/30 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-teal-50 dark:bg-teal-900/30 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white tracking-tight mb-6 leading-tight">
          Smarter Exam Preparation.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-teal-500 dark:from-indigo-400 dark:to-teal-400">
            Effortless Teaching.
          </span>
        </h1>

        <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
          Transform your study materials into interactive learning experiences
          instantly. AI-powered processing for students, automated grading for
          teachers.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/login-student"
            className="group relative px-8 py-4 bg-indigo-600 text-white rounded-full font-semibold text-lg shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 w-full sm:w-auto min-w-[200px]"
          >
            <span className="flex items-center justify-center gap-2">
              I'm a Student
              <LuGraduationCap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </span>
          </Link>
          <Link
            to="/login-teacher"
            className="group relative px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-full font-semibold text-lg shadow-sm hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 w-full sm:w-auto min-w-[200px]"
          >
            <span className="flex items-center justify-center gap-2">
              I'm a Teacher
              <LuPresentation className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </span>
          </Link>
        </div>

        {/* Social Proof / Trust */}
        <div className="mt-16 pt-8 border-t border-slate-200/60 dark:border-slate-700/60">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-6">
            Trusted by forward-thinking institutions
          </p>
          <div className="flex flex-wrap justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Simple text logos for demo purposes */}
            <span className="text-xl font-bold text-slate-400 dark:text-slate-500">
              EduTech
            </span>
            <span className="text-xl font-bold text-slate-400 dark:text-slate-500">
              UniLearn
            </span>
            <span className="text-xl font-bold text-slate-400 dark:text-slate-500">
              StudySmart
            </span>
            <span className="text-xl font-bold text-slate-400 dark:text-slate-500">
              Academy+
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
