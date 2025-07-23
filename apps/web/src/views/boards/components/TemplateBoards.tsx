import { t } from "@lingui/core/macro";
import { useEffect, useRef, useState } from "react";
import { HiCheckCircle } from "react-icons/hi2";
import { Card } from "~/components/ui/card";

export interface Template {
  id: string;
  name: string;
  lists: string[];
  labels: string[];
}

export const getTemplates = (): Template[] => [
  {
    id: "basic",
    name: t`Basic Kanban`,
    lists: [t`To Do`, t`In Progress`, t`Done`],
    labels: [t`High Priority`, t`Medium Priority`, t`Low Priority`],
  },
  {
    id: "software-dev",
    name: t`Software Development`,
    lists: [t`Backlog`, t`To Do`, t`In Progress`, t`Code Review`, t`Done`],
    labels: [t`Bug`, t`Feature`, t`Enhancement`, t`Critical`, t`Documentation`],
  },
  {
    id: "content-creation",
    name: t`Content Creation`,
    lists: [
      t`Brainstorming`,
      t`Writing`,
      t`Editing`,
      t`Design`,
      t`Approval`,
      t`Publishing`,
      t`Done`,
    ],
    labels: [t`Blog Post`, t`Social Media`, t`Video`, t`Newsletter`, t`Urgent`],
  },
  {
    id: "customer-support",
    name: t`Customer Support`,
    lists: [
      t`New Ticket`,
      t`Triaging`,
      t`In Progress`,
      t`Awaiting Customer`,
      t`Resolution`,
      t`Done`,
    ],
    labels: [
      t`Bug Report`,
      t`Feature Request`,
      t`Question`,
      t`Urgent`,
      t`Billing`,
    ],
  },
  {
    id: "recruitment",
    name: t`Recruitment`,
    lists: [
      t`Applicants`,
      t`Screening`,
      t`Interviewing`,
      t`Offer`,
      t`Onboarding`,
      t`Hired`,
    ],
    labels: [t`Remote`, t`Full-time`, t`Part-time`, t`Senior`, t`Junior`],
  },
  {
    id: "personal-project",
    name: t`Personal Project`,
    lists: [
      t`Ideas`,
      t`Research`,
      t`Planning`,
      t`Execution`,
      t`Review`,
      t`Next Steps`,
      t`Complete`,
    ],
    labels: [t`Important`, t`Quick Win`, t`Long-term`, t`Learning`, t`Fun`],
  },
];

export default function TemplateBoards({
  currentBoard,
  setCurrentBoard,
  showTemplates,
}: {
  currentBoard: Template | null;
  setCurrentBoard: (board: Template | null) => void;
  showTemplates: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const templates = getTemplates();

  const handleScroll = () => {
    if (!scrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    handleScroll();

    scrollElement.addEventListener("scroll", handleScroll);
    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, [showTemplates]);

  useEffect(() => {
    if (showTemplates && currentBoard && scrollRef.current) {
      const selectedElement = scrollRef.current.querySelector(
        `[data-template-id="${currentBoard.id}"]`,
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [showTemplates, currentBoard]);

  const handleBoardSelect = (boardId: string) => {
    if (currentBoard?.id === boardId) {
      setCurrentBoard(null);
    } else {
      setCurrentBoard(
        templates.find((template) => template.id === boardId) ?? null,
      );
    }
  };

  if (!showTemplates) {
    return null;
  }

  return (
    <div className="mt-4 w-full">
      <div className="relative">
        <div
          ref={scrollRef}
          className="scroll-container -mr-2 flex max-h-[200px] flex-col gap-3 overflow-y-auto pr-2 pt-0.5"
        >
          {templates.map((template) => (
            <Card
              key={template.id}
              data-template-id={template.id}
              onClick={() => handleBoardSelect(template.id)}
              className={`scroll-container relative flex cursor-pointer rounded-lg border p-3 transition-all hover:border-primary ${currentBoard?.id === template.id
                ? "border-primary"
                : ""
                }`}
            >
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {template.name}
                </h4>
                <p className="text-xs text-light-950 dark:text-dark-900">
                  {template.lists.join(", ")}
                </p>
              </div>
              {currentBoard?.id === template.id && (
                <div className="absolute right-3 top-3 text-light-1000 dark:text-dark-1000">
                  <HiCheckCircle className="h-5 w-5" />
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
