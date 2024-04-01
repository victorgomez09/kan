"use client";

import { useState } from "react";
import { useTheme } from "~/app/providers/theme";

import LottieIcon from "~/app/components/LottieIcon";
import chatIconLight from "~/app/assets/chat-light.json";
import chatIconDark from "~/app/assets/chat-dark.json";

const FeedbackButton: React.FC = () => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [index, setIndex] = useState(0);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setIndex((index) => index + 1);
  };

  return (
    <button
      type="button"
      onMouseEnter={handleMouseEnter}
      className="bg-light-50 border-light-600 flex items-center rounded-md border-[1px] px-2.5 py-1.5 text-sm font-normal text-neutral-900 shadow-sm dark:border-dark-600 dark:bg-dark-50 dark:text-dark-1000"
    >
      <LottieIcon
        index={index}
        json={theme === "dark" ? chatIconDark : chatIconLight}
        isPlaying={isHovered}
      />
      <span className="ml-1">Feedback</span>
    </button>
  );
};

export default FeedbackButton;
