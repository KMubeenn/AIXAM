import logoImg from "../assets/logo/logo_black.png";

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-white dark:bg-slate-900 pt-12 pb-8 overflow-hidden">
      {/* Accent gradient hairline */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

      {/* Soft ambient glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[28rem] h-[16rem] bg-indigo-500/10 dark:bg-indigo-500/10 blur-3xl rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center gap-5">
        <div className="flex items-center gap-2.5">
          <img
            src={logoImg}
            alt="AIXAM Logo"
            className="h-9 w-auto dark:invert"
          />
         
        </div>

       

        <div className="w-10 h-px bg-slate-200 dark:bg-slate-700" />

        <p className="text-xs text-slate-400 dark:text-slate-500">
          © {new Date().getFullYear()} AIXAM. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;