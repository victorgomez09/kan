import { useRouter } from "next/router";
import {
  HiMiniXMark,
  HiOutlineTag,
  HiOutlineUserCircle,
} from "react-icons/hi2";
import { IoFilterOutline } from "react-icons/io5";

import Avatar from "~/components/Avatar";
import Button from "~/components/Button";
import CheckboxDropdown from "~/components/CheckboxDropdown";
import LabelIcon from "~/components/LabelIcon";
import { formatMemberDisplayName, formatToArray } from "~/utils/helpers";
import { getPublicUrl } from "~/utils/supabase/getPublicUrl";

interface BoardData {
  publicId: string;
  name: string;
  slug: string;
  workspace: {
    publicId: string;
    members?: {
      publicId: string;
      user: {
        name: string | null;
        image: string | null;
        email: string;
      } | null;
    }[];
  } | null;
  labels: {
    publicId: string;
    name: string;
    colourCode: string | null;
  }[];
  lists: {
    publicId: string;
    name: string;
    boardId: number;
    index: number;
    cards: {
      publicId: string;
      title: string;
      description: string | null;
      listId: number;
      index: number;
      labels: {
        publicId: string;
        name: string;
        colourCode: string | null;
      }[];
      members?: {
        publicId: string;
        user: {
          name: string | null;
        } | null;
      }[];
    }[];
  }[];
}

const Filters = ({
  position = "right",
  boardData,
  isLoading,
}: {
  position?: "left" | "right";
  boardData: BoardData | null;
  isLoading: boolean;
}) => {
  const router = useRouter();

  const clearFilters = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await router.push({
        pathname: router.pathname,
        query: { ...router.query, members: [], labels: [] },
      });
    } catch (error) {
      console.error(error);
    }
  };

  const formattedMembers =
    boardData?.workspace?.members?.map((member) => ({
      key: member.publicId,
      value: formatMemberDisplayName(
        member.user?.name ?? null,
        member.user?.email ?? null,
      ),
      selected: !!router.query.members?.includes(member.publicId),
      leftIcon: (
        <Avatar
          size="xs"
          name={member.user?.name ?? ""}
          imageUrl={
            member.user?.image ? getPublicUrl(member.user.image) : undefined
          }
          email={member.user?.email ?? ""}
        />
      ),
    })) ?? [];

  const formattedLabels =
    boardData?.labels.map((label) => ({
      key: label.publicId,
      value: label.name,
      selected: !!router.query.labels?.includes(label.publicId),
      leftIcon: <LabelIcon colourCode={label.colourCode} />,
    })) ?? [];

  const groups = [
    ...(formattedMembers.length
      ? [
          {
            key: "members",
            label: "Members",
            icon: <HiOutlineUserCircle size={16} />,
            items: formattedMembers,
          },
        ]
      : []),
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

  const numOfFilters = [
    ...formatToArray(router.query.members),
    ...formatToArray(router.query.labels),
  ].length;

  return (
    <div className="relative">
      <CheckboxDropdown
        groups={groups}
        handleSelect={handleSelect}
        menuSpacing="md"
        position={position}
      >
        <Button
          variant="secondary"
          disabled={isLoading}
          iconLeft={<IoFilterOutline />}
        >
          Filter
        </Button>
        {numOfFilters > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            aria-label="Clear filters"
            className="group absolute -right-[8px] -top-[8px] flex h-5 w-5 items-center justify-center rounded-full border-2 border-light-100 bg-light-1000 text-[8px] font-[700] text-light-600 dark:border-dark-50 dark:bg-dark-1000 dark:text-dark-600"
          >
            <span className="group-hover:hidden">{numOfFilters}</span>
            <span className="hidden text-light-50 group-hover:inline dark:text-dark-50">
              <HiMiniXMark size={12} />
            </span>
          </button>
        )}
      </CheckboxDropdown>
    </div>
  );
};

export default Filters;
