import { useRouter } from "next/router";
import { t } from "@lingui/core/macro";
import { useModal } from "~/providers/modal";
import { usePopup } from "~/providers/popup";
import { api } from "~/utils/api";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { getInitialsFromName, inferInitialsFromEmail } from "~/utils/helpers";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";

interface MemberSelectorProps {
  cardPublicId: string;
  members: {
    key: string;
    value: string;
    selected: boolean;
    leftIcon: React.ReactNode;
    imageUrl: string | undefined;
  }[];
  isLoading: boolean;
}

export default function MemberSelector({
  cardPublicId,
  members,
  isLoading,
}: MemberSelectorProps) {
  const router = useRouter();
  const utils = api.useUtils();
  const { openModal } = useModal();
  const { showPopup } = usePopup();

  const addOrRemoveMember = api.card.addOrRemoveMember.useMutation({
    onMutate: async (update) => {
      await utils.card.byId.cancel();

      const previousCard = utils.card.byId.getData({ cardPublicId });

      utils.card.byId.setData({ cardPublicId }, (oldCard) => {
        if (!oldCard) return oldCard;

        const hasMember = oldCard.members.some(
          (member) => member.publicId === update.workspaceMemberPublicId,
        );

        const memberToAdd = oldCard.members.find(
          (member) => member.publicId === update.workspaceMemberPublicId,
        );

        const updatedMembers = hasMember
          ? oldCard.members.filter(
            (member) => member.publicId !== update.workspaceMemberPublicId,
          )
          : [
            ...oldCard.members,
            {
              publicId: update.workspaceMemberPublicId,
              email: memberToAdd?.email ?? "",
              deletedAt: null,
              user: {
                id: memberToAdd?.user?.id ?? "",
                name: memberToAdd?.user?.name ?? "",
              },
            },
          ];

        return {
          ...oldCard,
          members: updatedMembers,
        };
      });

      return { previousCard };
    },
    onError: (_error, _newList, context) => {
      utils.card.byId.setData({ cardPublicId }, context?.previousCard);
      showPopup({
        header: t`Unable to update members`,
        message: t`Please try again later, or contact customer support.`,
        icon: "error",
      });
    },
    onSettled: async () => {
      await utils.card.byId.invalidate({ cardPublicId });
    },
  });

  const selectedMembers = members.filter((member) => member.selected);

  const handleInviteMember = async () => {
    await router.push(`/members`);
    openModal("INVITE_MEMBER");
  };

  const getInitials = (name: string, email: string) => {
    return name
      ? getInitialsFromName(name)
      : inferInitialsFromEmail(email);
  }

  return (
    <>
      {isLoading ? (
        <div className="flex w-full">
          <div className="h-full w-[125px] animate-pulse rounded-[5px] bg-light-300 dark:bg-dark-300" />
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button className="flex h-full w-full items-center" variant="secondary">
              {t`Members`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {members?.map((item, key) => {
              return (
                <DropdownMenuItem key={key}>
                  <div
                    className="group flex items-center justify-between gap-2 w-full"
                  >
                    <Checkbox
                      id={item.key}
                      name={item.key}
                      onClick={() => {
                        addOrRemoveMember.mutate({
                          cardPublicId,
                          workspaceMemberPublicId: item.key,
                        })
                      }}
                      checked={selectedMembers[key]?.key === item.key} />
                    <Avatar>
                      <AvatarImage src={item.imageUrl} alt={item.value} />
                      <AvatarFallback>{getInitials(item.value, item.value)}</AvatarFallback>
                    </Avatar>
                    {item.value}
                  </div>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
}
