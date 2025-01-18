import Link from "next/link";
import { useState } from "react";

import activityLogsIconDark from "~/assets/activity-logs-dark.json";
import activityLogsIconLight from "~/assets/activity-logs-light.json";
import boardVisibilityIconDark from "~/assets/board-visibility-dark.json";
import boardVisibilityIconLight from "~/assets/board-visibility-light.json";
import commentsIconDark from "~/assets/comments-dark.json";
import commentsIconLight from "~/assets/comments-light.json";
import importsIconDark from "~/assets/imports-dark.json";
import importsIconLight from "~/assets/imports-light.json";
import integrationsIconDark from "~/assets/integrations-dark.json";
import integrationsIconLight from "~/assets/integrations-light.json";
import labelsIconDark from "~/assets/labels-dark.json";
import labelsIconLight from "~/assets/labels-light.json";
import membersIconDark from "~/assets/members-dark.json";
import membersIconLight from "~/assets/members-light.json";
import templatesIconDark from "~/assets/templates-dark.json";
import templatesIconLight from "~/assets/templates-light.json";
import LottieIcon from "~/components/LottieIcon";

const FeatureItem = ({
  feature,
}: {
  feature: {
    title: string;
    description: string;
    icon: Record<string, unknown>;
    comingSoon?: boolean;
  };
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [index, setIndex] = useState(0);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setIndex((index) => index + 1);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      className="group relative flex h-56 w-56 flex-col items-center justify-center overflow-hidden rounded-3xl border border-light-200 bg-light-50 dark:border-dark-200 dark:bg-dark-50"
    >
      <div className="absolute left-8 top-8 h-2 w-2 rounded-full bg-light-200 dark:bg-dark-200" />
      <div className="absolute right-8 top-8 h-2 w-2 rounded-full bg-light-200 dark:bg-dark-200" />
      <div className="absolute bottom-8 left-8 h-2 w-2 rounded-full bg-light-200 dark:bg-dark-200" />
      <div className="absolute bottom-8 right-8 h-2 w-2 rounded-full bg-light-200 dark:bg-dark-200" />

      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-light-300 bg-light-200 dark:border-dark-600 dark:bg-dark-200">
        <LottieIcon index={index} json={feature.icon} isPlaying={isHovered} />
      </div>

      <div className="relative mt-2 w-full px-4 text-center">
        <p className="text-sm font-bold text-light-1000 transition-opacity duration-200 group-hover:opacity-0 dark:text-dark-1000">
          {feature.title}
        </p>
        <p className="absolute inset-0 px-4 text-sm text-light-950 opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:text-dark-900">
          {feature.description}
        </p>
      </div>

      {feature.comingSoon && (
        <div className="absolute right-4 top-4 rounded-full border border-light-300 px-2 py-1 text-[10px] text-light-1000 dark:border-dark-600 dark:bg-dark-50 dark:text-dark-900">
          Coming soon
        </div>
      )}
    </div>
  );
};

const Features = ({ theme }: { theme: "light" | "dark" }) => {
  const isDark = theme === "dark";
  const features = [
    {
      title: "Board visibility",
      description: "Control who can view and edit your boards.",
      icon: isDark ? boardVisibilityIconDark : boardVisibilityIconLight,
    },
    {
      title: "Workspace members",
      description: "Collaborate seamlessly with your team.",
      icon: isDark ? membersIconDark : membersIconLight,
    },
    {
      title: "Trello imports",
      description: "Import your Trello boards and hit the ground running.",
      icon: isDark ? importsIconDark : importsIconLight,
    },
    {
      title: "Labels & Filters",
      description:
        "Organize and find cards quickly with powerful filtering tools.",
      icon: isDark ? labelsIconDark : labelsIconLight,
    },
    {
      title: "Comments",
      description: "Discuss and collaborate on cards.",
      icon: isDark ? commentsIconDark : commentsIconLight,
    },
    {
      title: "Activity logs",
      description: "Track all card changes with detailed activity history.",
      icon: isDark ? activityLogsIconDark : activityLogsIconLight,
    },
    {
      title: "Templates",
      description: "Save time with reusable board templates.",
      icon: isDark ? templatesIconDark : templatesIconLight,
      comingSoon: true,
    },
    {
      title: "Integrations",
      description: "Connect your favorite tools to streamline your workflow.",
      icon: isDark ? integrationsIconDark : integrationsIconLight,
      comingSoon: true,
    },
  ];

  return (
    <>
      <div className="flex flex-col items-center justify-center pb-24">
        <div className="flex items-center gap-2 rounded-full border bg-light-50 px-4 py-1 text-center text-sm text-light-1000 dark:border-dark-300 dark:bg-dark-50 dark:text-dark-900">
          <p>Features</p>
        </div>

        <p className="mt-2 text-center text-4xl font-bold text-light-1000 dark:text-dark-1000">
          Kanban simplified
        </p>
        <p className="mt-3 max-w-[600px] text-center text-lg text-dark-900">
          Simple, visual task management that just works. Drag and drop cards,
          collaborate with your team, and get more done.
        </p>
        <div className="mt-16 grid grid-cols-4 gap-6 [mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)]">
          {features.map((feature, index) => {
            return <FeatureItem key={`feature-${index}`} feature={feature} />;
          })}
        </div>

        <div>
          <div className="mt-8 flex items-center gap-2 rounded-full border bg-light-50 px-4 py-1 text-center text-sm text-light-1000 dark:border-dark-300 dark:bg-dark-50 dark:text-dark-900">
            <p>
              {`We're just getting started. `}
              <Link href="/kan/roadmap" className="underline">
                View our roadmap.
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Features;
