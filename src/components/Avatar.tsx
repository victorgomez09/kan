import { twMerge } from "tailwind-merge";
import { getInitialsFromName, inferInitialsFromEmail } from "~/utils/helpers";

const Avatar = ({
  size = "md",
  name,
  email,
  icon,
  isLoading,
}: {
  size?: "sm" | "md" | "lg";
  name: string;
  email: string;
  icon: React.ReactNode;
  isLoading: boolean;
}) => {
  const initials = name
    ? getInitialsFromName(name)
    : inferInitialsFromEmail(email ?? "");

  return (
    <span
      className={twMerge(
        "inline-flex h-9 w-9 items-center justify-center rounded-full bg-light-1000 dark:bg-dark-400",
        isLoading && "animate-pulse bg-light-200 dark:bg-dark-200",
        size === "sm" && "h-6 w-6",
        size === "lg" && "h-12 w-12",
      )}
    >
      {icon ? (
        <span className="text-[12px] text-white">{icon}</span>
      ) : (
        <span
          className={twMerge(
            "text-sm font-medium leading-none text-white",
            size === "sm" && "text-[10px]",
            size === "lg" && "text-md",
          )}
        >
          {initials}
        </span>
      )}
    </span>
  );
};

export default Avatar;
