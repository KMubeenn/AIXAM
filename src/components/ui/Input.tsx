import React, { InputHTMLAttributes } from "react";
import { IconType } from "react-icons";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: IconType;
}

const Input: React.FC<InputProps> = ({
  icon: Icon,
  className = "",
  ...props
}) => {
  return (
    <div className="relative w-[85%] mb-[18px]">
      {Icon && (
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
      )}
      <input
        className={`w-full h-[52px] px-[48px] rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-[1rem] outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10 placeholder-slate-400 transition-all ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input;
