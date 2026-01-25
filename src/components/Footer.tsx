import logoImg from "../assets/logo/logo_black.png";
import { LuTwitter, LuLinkedin, LuGithub } from "react-icons/lu";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src={logoImg} alt="AIXAM Logo" className="h-24 w-auto" />
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Empowering the next generation of learners and educators with
              artificial intelligence.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-indigo-600">
                <LuTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-indigo-600">
                <LuLinkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-indigo-600">
                <LuGithub className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <a href="#" className="hover:text-indigo-600">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-600">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-600">
                  API
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-600">
                  Integration
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <a href="#" className="hover:text-indigo-600">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-600">
                  Guides
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-600">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-600">
                  Community
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <a href="#" className="hover:text-indigo-600">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-600">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-600">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-600">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © 2024 AIXAM Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-indigo-600">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-indigo-600">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
