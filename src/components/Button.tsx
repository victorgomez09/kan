import { twMerge } from "tailwind-merge";
import LoadingSpinner from "./LoadingSpinner";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const Button = ({
  children,
  size = "md",
  icon,
  isLoading,
  variant = "primary",
  ...props
}: ButtonProps) => {
  return (
    <button
      className={twMerge(
        "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-semibold text-light-50 shadow-sm focus-visible:outline-none",
        size === "sm" && "text-xs",
        size === "lg" && "px-4 py-3 text-lg",
        variant === "primary" &&
          "bg-light-1000 dark:bg-dark-1000 dark:text-dark-50",
        variant === "secondary" &&
          "border-[1px] border-light-600 bg-light-50 text-light-1000 dark:border-dark-600 dark:bg-dark-300 dark:text-dark-1000",
        variant === "danger" &&
          "dark:text-red-1000 border-[1px] border-red-600 bg-red-50 dark:border-red-600 dark:bg-red-500",
        variant === "ghost" &&
          "bg-none text-light-1000 shadow-none hover:bg-light-300 dark:text-dark-1000 dark:hover:bg-dark-200",
        props.disabled && "opacity-50",
      )}
      disabled={isLoading ?? props.disabled}
      {...props}
    >
      <span className="relative flex items-center justify-center">
        {isLoading && (
          <span className="absolute">
            <LoadingSpinner size={size} />
          </span>
        )}
        <div
          className={twMerge(
            "flex items-center",
            isLoading ? "invisible" : "visible",
          )}
        >
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </div>
      </span>
    </button>
  );
};

export default Button;
