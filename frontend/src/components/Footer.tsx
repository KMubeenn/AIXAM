import logoImg from "../assets/logo/logo_black.png";
import { LuTwitter, LuLinkedin, LuGithub } from "react-icons/lu";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img
                src={logoImg}
                alt="AIXAM Logo"
                className="h-12 w-auto dark:invert"
              />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Empowering the next generation of learners and educators with
              artificial intelligence.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <LuTwitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <LuLinkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <LuGithub className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Product
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <a
                  href="#"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  API
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Integration
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Resources
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <a
                  href="#"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Guides
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Community
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Company
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <a
                  href="#"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} AIXAM. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-400">
            <a
              href="#"
              className="hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
