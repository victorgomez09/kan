import { Fragment, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { twMerge } from "tailwind-merge";

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
  menuSpacing?: "sm" | "md" | "lg";
  handleSelect: (groupKey: string | null, item: { key: string }) => void;
}

export default function CheckboxDropdown({
  children,
  items,
  groups,
  menuSpacing = "sm",
  handleSelect,
}: CheckboxDropdownProps) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const menuSpacingClass = {
    sm: "top-[26px]",
    md: "top-[32px]",
    lg: "top-[38px]",
  };

  return (
    <Menu
      as="div"
      className="relative flex w-full flex-wrap items-center text-left"
    >
      <>
        <Menu.Button className="focus-visible:outline-none">
          {children}
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
          afterLeave={() => setSelectedGroup(null)}
        >
          <Menu.Items
            className={twMerge(
              "absolute left-0 z-50 mt-2 w-56 origin-top-left rounded-md border-[1px] border-light-200 bg-light-50 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:border-dark-500 dark:bg-dark-200",
              menuSpacingClass[menuSpacing],
            )}
          >
            <div className="p-1">
              {!selectedGroup ? (
                <>
                  {items?.map((item) => (
                    <Menu.Item key={item.key}>
                      <div
                        className="flex items-center rounded-[5px] p-2 hover:bg-light-200 dark:hover:bg-dark-300"
                        onClick={(e) => {
                          e.preventDefault();
                          handleSelect(null, { key: item.key });
                        }}
                      >
                        <input
                          id={item.key}
                          name={item.key}
                          type="checkbox"
                          className="h-[14px] w-[14px] rounded bg-transparent"
                          onClick={(event) => event.stopPropagation()}
                          onChange={() => handleSelect(null, { key: item.key })}
                          checked={item.selected}
                        />
                        {item.leftIcon && (
                          <span className="ml-3 flex items-center">
                            {item.leftIcon}
                          </span>
                        )}
                        <label
                          htmlFor={item.key}
                          className="ml-3 text-[12px] text-dark-900"
                        >
                          {item.value}
                        </label>
                      </div>
                    </Menu.Item>
                  ))}
                  {groups?.map((group) => (
                    <Menu.Item key={group.key}>
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
                    </Menu.Item>
                  ))}
                </>
              ) : (
                <>
                  {groups
                    ?.find((g) => g.key === selectedGroup)
                    ?.items.map((item) => (
                      <Menu.Item key={item.key}>
                        <div
                          className="flex items-center rounded-[5px] p-2 hover:bg-light-200 dark:hover:bg-dark-300"
                          onClick={(e) => {
                            e.preventDefault();
                            handleSelect(selectedGroup, { key: item.key });
                          }}
                        >
                          <input
                            id={item.key}
                            name={item.key}
                            type="checkbox"
                            className="h-[14px] w-[14px] rounded bg-transparent"
                            onClick={(event) => event.stopPropagation()}
                            onChange={() =>
                              handleSelect(selectedGroup, { key: item.key })
                            }
                            checked={item.selected}
                          />
                          {item.leftIcon && (
                            <span className="ml-3 flex items-center">
                              {item.leftIcon}
                            </span>
                          )}
                          <label
                            htmlFor={item.key}
                            className="ml-3 text-[12px] text-dark-900"
                          >
                            {item.value}
                          </label>
                        </div>
                      </Menu.Item>
                    ))}
                </>
              )}
            </div>
          </Menu.Items>
        </Transition>
      </>
    </Menu>
  );
}
