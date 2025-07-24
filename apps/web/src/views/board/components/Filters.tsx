import { t } from "@lingui/core/macro";
import { useRouter } from "next/router";
import { useEffect } from "react";
import {
  HiMiniXMark,
  HiOutlineTag,
  HiOutlineUserCircle,
} from "react-icons/hi2";
import { IoFilterOutline } from "react-icons/io5";
import CheckboxDropdown from "~/components/CheckboxDropdown";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
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
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2">
              <HiOutlineUserCircle size={16} />
              {t`Members`}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {formattedMembers.map((user, index) => (
                  <DropdownMenuItem key={index} onClick={(event) => { handleSelect("users", user); event.preventDefault() }}>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={user.key}
                        name={user.key}
                        checked={router.query.users?.includes(user.key) ?? false} />
                      {user.value}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2">
              <HiOutlineTag size={16} />
              {t`Labels`}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {formattedLabels.map((label, index) => (
                  <DropdownMenuItem key={index} onClick={(event) => { handleSelect("labels", label); event.preventDefault() }}>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={label.key}
                        name={label.key}
                        checked={router.query.labels?.includes(label.key) ?? false} />
                      {label.value}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        {numOfFilters > 0 && (
          <DropdownMenuItem className="flex items-center gap-2">
            <Button
              onClick={(event) => clearFilters(event)}
              variant="ghost"
              size="sm"
            >
              {t`Clear filters`}
            </Button>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Filters;
