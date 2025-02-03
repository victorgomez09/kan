import { useRouter } from "next/router";
import { Menu } from "@headlessui/react";
import { HiMiniPlus } from "react-icons/hi2";

import Avatar from "~/components/Avatar";
import CheckboxDropdown from "~/components/CheckboxDropdown";
import { useModal } from "~/providers/modal";
import { usePopup } from "~/providers/popup";
import { api } from "~/utils/api";

interface MemberSelectorProps {
  cardPublicId: string;
  members: {
    key: string;
    value: string;
    selected: boolean;
    leftIcon: React.ReactNode;
    imageUrl: string | undefined;
  }[];
  handleSelectMember: (memberPublicId: string) => void;
  refetchCard: () => Promise<void>;
  isLoading: boolean;
}

export default function MemberSelector({
  cardPublicId,
  members,
  handleSelectMember,
  refetchCard,
  isLoading,
}: MemberSelectorProps) {
  const router = useRouter();
  const { openModal } = useModal();
  const { showPopup } = usePopup();

  const addOrRemoveMember = api.card.addOrRemoveMember.useMutation({
    onSuccess: async () => {
      await refetchCard();
    },
    onError: async () => {
      await refetchCard();
      showPopup({
        header: "Unable to update members",
        message: "Please try again later, or contact customer support.",
        icon: "error",
      });
    },
  });

  const selectedMembers = members.filter((member) => member.selected);

  const handleInviteMember = async () => {
    await router.push(`/members`);
    openModal("INVITE_MEMBER");
  };

  return (
    <>
      {isLoading ? (
        <div className="flex w-full">
          <div className="h-full w-[125px] animate-pulse rounded-[5px] bg-light-300 dark:bg-dark-300" />
        </div>
      ) : (
        <CheckboxDropdown
          items={members}
          handleSelect={(_, member) => {
            handleSelectMember(member.key);
            addOrRemoveMember.mutate({
              cardPublicId,
              workspaceMemberPublicId: member.key,
            });
          }}
          handleCreate={handleInviteMember}
          createNewItemLabel="Invite member"
          asChild
        >
          <Menu.Button className="flex h-full w-full items-center rounded-[5px] border-[1px] border-light-200 py-1 pl-2 text-left text-sm text-neutral-900 hover:bg-light-300 dark:border-dark-100 dark:text-dark-1000 dark:hover:border-dark-300 dark:hover:bg-dark-200">
            {selectedMembers.length ? (
              <div className="isolate flex justify-end -space-x-1 overflow-hidden">
                {selectedMembers.map(({ value, imageUrl }) => (
                  <Avatar
                    size="sm"
                    name={value}
                    imageUrl={imageUrl}
                    email={value}
                  />
                ))}
              </div>
            ) : (
              <>
                <HiMiniPlus size={22} className="pr-2" />
                {"Add member"}
              </>
            )}
          </Menu.Button>
        </CheckboxDropdown>
      )}
    </>
  );
}
