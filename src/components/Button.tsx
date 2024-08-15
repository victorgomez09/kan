import { twMerge } from "tailwind-merge";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  isLoading?: boolean;
}

const Button = ({
  children,
  isLoading,
  variant = "primary",
  ...props
}: ButtonProps) => {
  return (
    <button
      className={twMerge(
        "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-semibold text-light-50 shadow-sm focus-visible:outline-none",
        variant === "primary" &&
          "bg-light-1000 dark:bg-dark-1000 dark:text-dark-50",
        variant === "secondary" &&
          "border-[1px] border-light-600 bg-light-50 dark:border-dark-600 dark:bg-dark-300 dark:text-dark-1000",
      )}
      disabled={isLoading}
      {...props}
    >
      <span className="relative flex items-center justify-center">
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg
              className="h-5 w-5 animate-spin text-white dark:text-dark-800"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </span>
        )}
        <span className={isLoading ? "invisible" : "visible"}>{children}</span>
      </span>
    </button>
  );
};

export default Button;
