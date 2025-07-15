import { useState } from "react";
import { HiEllipsisHorizontal, HiMiniPlus } from "react-icons/hi2";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Pencil } from "lucide-react";

interface Item {
  key: string;
  value: string;
  selected: boolean;
  leftIcon?: React.ReactNode;
}

interface Group {
  key: string;
  label: string;
  icon: React.ReactNode;
  items: Item[];
}

interface CheckboxDropdownProps {
  children: React.ReactNode;
  items?: Item[];
  groups?: Group[];
  createNewItemLabel?: string;
  menuSpacing?: "sm" | "md" | "lg";
  position?: "left" | "right";
  handleSelect: (
    groupKey: string | null,
    item: { key: string; value: string },
  ) => void;
  handleEdit?: JSX.Element;
  handleCreate?: () => void;
  asChild?: boolean;
}

export default function CheckboxDropdown({
  children,
  items,
  groups,
  createNewItemLabel = "Create new",
  handleSelect,
  handleEdit,
  handleCreate,
}: CheckboxDropdownProps) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const renderMenuItems = (items: Item[], groupKey: string | null) => (
    <>
      {items.map((item) => (
        <DropdownMenuItem key={item.key}>
          <div
            className="group flex items-center justify-between w-full"
            onClick={(e) => {
              e.preventDefault();
              handleSelect(groupKey, { key: item.key, value: item.value });
            }}
          >
            <Checkbox
              id={item.key}
              name={item.key}
              onClick={(event) => event.stopPropagation()}
              onChange={() =>
                handleSelect(groupKey, { key: item.key, value: item.value })
              }
              checked={item.selected} />
            <label
              htmlFor={item.key}
              className="ml-3 text-[12px] text-dark-900"
            >
              {item.value}
            </label>
            {handleEdit && (
              handleEdit
              // <Button
              //   size="sm"
              //   variant="secondary"
              //   className="invisible ml-auto group-hover:visible"
              //   onClick={(event) => {
              //     event.stopPropagation();
              //     handleEdit(item.key);
              //   }}
              // >
              //   <Pencil className="size-3" />
              // </Button>
            )}
          </div>
        </DropdownMenuItem>
      ))}
      {handleCreate && (
        <Button
          className="flex w-full items-center rounded-[5px] p-2 px-2 text-[12px] text-dark-900 hover:bg-light-200 dark:hover:bg-dark-300"
          onClick={() => handleCreate()}
        >
          <HiMiniPlus size={20} className="pr-1.5" />
          {createNewItemLabel}
        </Button>
      )}
    </>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {!selectedGroup ? (
          <>
            {items && renderMenuItems(items, null)}
            {groups?.map((group) => (
              <DropdownMenuItem key={group.key}>
                <div
                  className="flex items-center rounded-[5px] p-2 hover:bg-light-200 dark:hover:bg-dark-300"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedGroup(group.key);
                  }}
                >
                  <span className="mr-2 text-dark-900">{group.icon}</span>
                  <span className="pointer-events-none text-[12px] text-dark-900">
                    {group.label}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
          </>
        ) : (
          <>
            {groups?.find((g) => g.key === selectedGroup)?.items &&
              renderMenuItems(
                groups.find((g) => g.key === selectedGroup)?.items || [],
                selectedGroup,
              )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
