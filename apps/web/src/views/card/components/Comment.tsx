import { User } from "@kan/api/trpc";
import { t } from "@lingui/core/macro";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import ContentEditable from "react-contenteditable";
import { useForm } from "react-hook-form";
import { HiEllipsisHorizontal, HiPencil, HiTrash } from "react-icons/hi2";
import Dropdown from "~/components/Dropdown";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { useModal } from "~/providers/modal";
import { usePopup } from "~/providers/popup";
import { api } from "~/utils/api";
import { getInitialsFromName, inferInitialsFromEmail } from "~/utils/helpers";

interface FormValues {
  comment: string;
}

const Comment = ({
  publicId,
  cardPublicId,
  user,
  createdAt,
  comment,
  isAuthor,
  isAdmin,
  isEdited = false,
}: {
  publicId: string | undefined;
  cardPublicId: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  createdAt: string;
  comment: string | undefined;
  isAuthor: boolean;
  isAdmin: boolean;
  isEdited: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const utils = api.useUtils();
  const { showPopup } = usePopup();
  const { openModal } = useModal();
  const { handleSubmit, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      comment,
    },
  });

  if (!publicId) return null;

  const updateCommentMutation = api.card.updateComment.useMutation({
    onSuccess: async () => {
      await utils.card.byId.refetch();
      setIsEditing(false);
    },
    onError: () => {
      showPopup({
        header: t`Unable to update comment`,
        message: t`Please try again later, or contact customer support.`,
        icon: "error",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    updateCommentMutation.mutate({
      cardPublicId,
      comment: data.comment,
      commentPublicId: publicId,
    });
  };

  const dropdownItems = [
    ...(isAuthor
      ? [
        {
          label: t`Edit comment`,
          action: () => setIsEditing(true),
          icon: <HiPencil className="h-[16px] w-[16px] text-dark-900" />,
        },
      ]
      : []),
    ...(isAuthor || isAdmin
      ? [
        {
          label: t`Delete comment`,
          action: () => openModal("DELETE_COMMENT", publicId),
          icon: <HiTrash className="h-[16px] w-[16px] text-dark-900" />,
        },
      ]
      : []),
  ];

  const getInitials = (name: string, email: string) => {
    return name
      ? getInitialsFromName(name)
      : inferInitialsFromEmail(email);
  }

  return (
    <Card
      key={publicId}
      className="p-2"
    >
      <CardContent>
        <div className="flex justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="size-7">
              {/* <AvatarImage src={user?.image ?? ""} alt={user?.name} /> */}
              <AvatarFallback className="bg-background">{getInitials(user?.name ?? "", user?.email ?? "")}</AvatarFallback>
            </Avatar>

            <p className="text-sm">
              <span className="font-semibold">{`${user?.name} `}</span>
              <span className="mx-1 font-light">·</span>
              <span className="space-x-1 font-light">
                {formatDistanceToNow(new Date(createdAt), {
                  addSuffix: true,
                })}
              </span>
              {isEdited && (
                <span className="font-light">
                  {t` (edited)`}
                </span>
              )}
            </p>
          </div>

          {dropdownItems.length > 0 && (
            <div className="right-4 top-4">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="ghost">
                    <HiEllipsisHorizontal className="h-5 w-5 text-light-900 dark:text-dark-800" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {dropdownItems.map((item, index) => (
                    <DropdownMenuItem key={index} className="flex items-center gap-1" onClick={() => item.action()}>{item.icon}{item.label}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        {!isEditing ? (
          <ContentEditable
            html={comment ?? ""}
            disabled={true}
            className="mt-2 text-sm"
          />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <ContentEditable
              placeholder={t`Add a comment...`}
              html={watch("comment")}
              disabled={false}
              onChange={(e) => setValue("comment", e.target.value)}
              className="rounded-xl w-full border-0 bg-background p-2 mt-2 text-sm focus-visible:outline-none sm:text-sm sm:leading-6"
            />
            <div className="flex justify-end space-x-2 mt-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(false)}
              >
                {t`Cancel`}
              </Button>
              <Button
                isLoading={updateCommentMutation.isPending}
                type="submit"
                size="sm"
              >
                {t`Save`}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default Comment;
