import { t } from "@lingui/core/macro";
import { useRouter } from "next/router";
import {
  HiMiniXMark,
  HiOutlineTag,
  HiOutlineUserCircle,
} from "react-icons/hi2";
import { IoFilterOutline } from "react-icons/io5";
import CheckboxDropdown from "~/components/CheckboxDropdown";
import { Button } from "~/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import {
  formatMemberDisplayName,
  formatToArray
} from "~/utils/helpers";

interface Member {
  publicId: string;
  user: {
    name: string | null;
    image: string | null;
    email: string;
  } | null;
}

interface Label {
  publicId: string;
  name: string;
  colourCode: string | null;
}

const Filters = ({
  position = "right",
  labels,
  members,
  isLoading,
}: {
  position?: "left" | "right";
  labels: Label[];
  members: Member[];
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

  const formattedMembers = members.map((member) => ({
    key: member.publicId,
    value: formatMemberDisplayName(
      member.user?.name ?? null,
      member.user?.email ?? null,
    ),
    selected: !!router.query.members?.includes(member.publicId),
    // leftIcon: (
    // <Avatar
    //   size="xs"
    //   name={member.user?.name ?? ""}
    //   imageUrl={
    //     member.user?.image ? getAvatarUrl(member.user.image) : undefined
    //   }
    //   email={member.user?.email ?? ""}
    // />
    // ),
  }));

  const formattedLabels = labels.map((label) => ({
    key: label.publicId,
    value: label.name,
    selected: !!router.query.labels?.includes(label.publicId),
    // leftIcon: <LabelIcon colourCode={label.colourCode} />,
  }));

  const groups = [
    ...(formattedMembers.length
      ? [
        {
          items: formattedMembers,
        },
      ]
      : []),
    {
      key: "labels",
      label: t`Labels`,
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
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          variant="secondary"
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <IoFilterOutline />
          {t`Filter`}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={(event) => event.preventDefault()}>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2">
              <HiOutlineUserCircle size={16} />
              {t`Members`}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {formattedMembers.map((user, index) => (
                <DropdownMenuItem key={index} onClick={() => handleSelect("users", user)}>
                  {user.value}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center gap-2">
        </DropdownMenuItem>

        {numOfFilters > 0 && (
          <DropdownMenuItem className="flex items-center gap-2">
            <Button
              onClick={(event) => clearFilters(event)}
              aria-label={t`Clear filters`}
              variant="secondary"
            >
              <span className="group-hover:hidden">{numOfFilters}</span>
              <span className="hidden group-hover:inline">
                <HiMiniXMark size={12} />
              </span>
            </Button>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
    // <CheckboxDropdown
    //   groups={groups}
    //   handleSelect={handleSelect}
    //   menuSpacing="md"
    //   position={position}
    // >
    // </CheckboxDropdown>
  );
};

export default Filters;
