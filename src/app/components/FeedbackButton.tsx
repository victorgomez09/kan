"use client";

import { useState } from "react";

import LottieIcon from "~/app/components/LottieIcon";
import chatIcon from "~/app/assets/chat.json";

const FeedbackButton: React.FC = () => {
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
      className="flex items-center rounded-md border-[1px] border-dark-600 bg-dark-50 px-2.5 py-1.5 text-sm font-normal text-dark-1000 shadow-sm"
    >
      <LottieIcon index={index} json={chatIcon} isPlaying={isHovered} />
      <span className="ml-1">Feedback</span>
    </button>
  );
};

export default FeedbackButton;
