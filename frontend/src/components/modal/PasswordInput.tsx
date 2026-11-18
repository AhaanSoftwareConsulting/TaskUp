import { useState } from "react";
import {
  EyeIcon,
  EyeSlashIcon,
} from "@phosphor-icons/react";

interface PasswordInputProps {
  placeholder?: string;
  register: any;
  name: string;
  required?: boolean;
  className?: string;
}

export const PasswordInput = ({
  placeholder = "Password",
  register,
  name,
  required = true,
  className = "",
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [hoverPassword, setHoverPassword] = useState(false);

  const passwordVisible = showPassword || hoverPassword;

  return (
    <div className="relative w-full">
      <input
        type={passwordVisible ? "text" : "password"}
        placeholder={placeholder}
        {...register(name, { required })}
        className={`
          h-[54px] w-full rounded-xl border border-gray-200 bg-gray-50/60 px-5 text-sm text-[#171B2E] outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 hover:bg-white focus:border-[#278CFA] focus:bg-white focus:ring-4 focus:ring-blue-500/10
          ${className}
        `}
      />

      <button
        type="button"
        aria-label={
          passwordVisible ? "Hide password" : "Show password"
        }
        onClick={() => setShowPassword((prev) => !prev)}
        onMouseEnter={() => setHoverPassword(true)}
        onMouseLeave={() => setHoverPassword(false)}
        className="
          absolute
          right-4
          top-1/2
          -translate-y-1/2
          text-gray-500
          hover:text-black
          transition-colors
        "
      >
        {passwordVisible ? (
          <EyeSlashIcon size={22} weight="bold" />
        ) : (
          <EyeIcon size={22} weight="bold" />
        )}
      </button>
    </div>
  );
};
