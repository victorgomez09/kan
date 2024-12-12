import { twMerge } from "tailwind-merge";

const LoadingSpinner = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  return (
    <svg
      className={twMerge(
        "animate-spin",
        size === "sm" && "h-4 w-4",
        size === "md" && "h-5 w-5",
        size === "lg" && "h-6 w-6",
      )}
      viewBox="0 0 100 100"
    >
      <circle
        fill="none"
        stroke-width="10"
        className="stroke-current opacity-40"
        cx="50"
        cy="50"
        r="40"
      />
      <circle
        fill="none"
        stroke-width="10"
        className="stroke-current"
        stroke-dasharray="280"
        stroke-dashoffset="210"
        cx="50"
        cy="50"
        r="40"
      />
    </svg>
  );
};

export default LoadingSpinner;
