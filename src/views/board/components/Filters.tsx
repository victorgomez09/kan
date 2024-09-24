import { IoFilterOutline } from "react-icons/io5";
import { HiOutlineUserCircle, HiOutlineTag } from "react-icons/hi2";
import { useRouter } from "next/router";
import Button from "~/components/Button";
import CheckboxDropdown from "~/components/CheckboxDropdown";

import { useBoard } from "~/providers/board";

const LabelIcon = ({ colourCode }: { colourCode: string | null }) => (
  <svg
    fill={colourCode ?? "#3730a3"}
    className="h-2 w-2"
    viewBox="0 0 6 6"
    aria-hidden="true"
  >
    <circle cx={3} cy={3} r={3} />
  </svg>
);

const Avatar = ({ name }: { name: string }) => (
  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-gray-400 ring-1 ring-light-200 dark:ring-dark-500">
    <span className="text-[8px] font-medium leading-none text-white">
      {name
        ?.split(" ")
        .map((namePart) => namePart.charAt(0).toUpperCase())
        .join("")}
    </span>
  </span>
);

const Filters = () => {
  const { boardData } = useBoard();
  const router = useRouter();

  const formattedMembers =
    boardData?.workspace?.members?.map((member) => ({
      key: member.publicId,
      value: member.user?.name ?? "",
      selected: !!router.query.members?.includes(member.publicId),
      leftIcon: <Avatar name={member.user?.name ?? ""} />,
    })) ?? [];

  const formattedLabels =
    boardData?.labels.map((label) => ({
      key: label.publicId,
      value: label.name,
      selected: !!router.query.labels?.includes(label.publicId),
      leftIcon: <LabelIcon colourCode={label.colourCode} />,
    })) ?? [];

  const groups = [
    {
      key: "members",
      label: "Members",
      icon: <HiOutlineUserCircle size={16} />,
      items: formattedMembers,
    },
    {
      key: "labels",
      label: "Labels",
      icon: <HiOutlineTag size={16} />,
      items: formattedLabels,
    },
  ];

  const handleSelect = async (
    groupKey: string | null,
    item: { key: string },
  ) => {
    if (groupKey === null) return;
    const currentQuery = router.query[groupKey] ?? [];
    const formattedCurrentQuery = Array.isArray(currentQuery)
      ? currentQuery
      : [currentQuery];

    const updatedQuery = formattedCurrentQuery.includes(item.key)
      ? formattedCurrentQuery.filter((key) => key !== item.key)
      : [...formattedCurrentQuery, item.key];

    try {
      await router.push({
        pathname: router.pathname,
        query: { ...router.query, [groupKey]: updatedQuery },
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="relative">
      <CheckboxDropdown
        groups={groups}
        handleSelect={handleSelect}
        menuSpacing="md"
      >
        <Button variant="secondary" icon={<IoFilterOutline />}>
          Filter
        </Button>
      </CheckboxDropdown>
    </div>
  );
};

export default Filters;
