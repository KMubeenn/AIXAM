import { LuTarget } from "react-icons/lu";

const DashboardStats: React.FC = () => {
  return (
    <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2 text-indigo-100">
          <LuTarget className="w-4 h-4" />
          <span className="text-sm font-medium uppercase tracking-wider">
            Today's Study Focus
          </span>
        </div>
        <h2 className="text-3xl font-bold">
          Welcome Back!
        </h2>
      </div>
    </div>
  );
};

export default DashboardStats;
