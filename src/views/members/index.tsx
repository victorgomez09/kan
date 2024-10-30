import { HiOutlinePlusSmall, HiEllipsisHorizontal } from "react-icons/hi2";
import { twMerge } from "tailwind-merge";

import { useModal } from "~/providers/modal";
import { useWorkspace } from "~/providers/workspace";
import Modal from "~/components/modal";

import { NewWorkspaceForm } from "~/components/NewWorkspaceForm";
import { InviteMemberForm } from "./components/InviteMemberForm";
import { DeleteMemberConfirmation } from "./components/DeleteMemberConfirmation";
import Dropdown from "~/components/Dropdown";

import { api } from "~/utils/api";
import { getInitialsFromName, inferInitialsFromEmail } from "~/utils/helpers";

export default function MembersPage() {
  const { modalContentType, openModal } = useModal();
  const { workspace } = useWorkspace();

  const { data, isLoading } = api.workspace.byId.useQuery(
    { publicId: workspace.publicId },
    // { enabled: workspace?.publicId ? true : false },
  );

  const TableRow = ({
    memberPublicId,
    memberName,
    memberEmail,
    memberRole,
    memberStatus,
    isLastRow,
    showSkeleton,
  }: {
    memberPublicId?: string;
    memberName?: string | null | undefined;
    memberEmail?: string | null | undefined;
    memberRole?: string;
    memberStatus?: string;
    isLastRow?: boolean;
    showSkeleton?: boolean;
  }) => {
    const initials = memberName
      ? getInitialsFromName(memberName)
      : inferInitialsFromEmail(memberEmail ?? "");

    return (
      <tr className="rounded-b-lg">
        <td className={twMerge("w-[65%]", isLastRow ? "rounded-bl-lg" : "")}>
          <div className="flex items-center p-4">
            <div className="flex-shrink-0">
              <span
                className={twMerge(
                  "inline-flex h-9 w-9 items-center justify-center rounded-full bg-light-1000 dark:bg-dark-400",
                  showSkeleton && "animate-pulse bg-light-200 dark:bg-dark-200",
                )}
              >
                <span className="text-sm font-medium leading-none text-white">
                  {initials}
                </span>
              </span>
            </div>
            <div className="ml-2 min-w-0 flex-1">
              <div>
                <div className="flex items-center">
                  <p
                    className={twMerge(
                      "mr-2 text-sm font-medium text-neutral-900 dark:text-dark-1000",
                      showSkeleton &&
                        "md mb-2 h-3 w-[125px] animate-pulse rounded-sm bg-light-200 dark:bg-dark-200",
                    )}
                  >
                    {memberName}
                  </p>
                </div>
                <p
                  className={twMerge(
                    "truncate text-sm text-dark-900",
                    showSkeleton &&
                      "h-3 w-[175px] animate-pulse rounded-sm bg-light-200 dark:bg-dark-200",
                  )}
                >
                  {memberEmail}
                </p>
              </div>
            </div>
          </div>
        </td>
        <td
          className={twMerge(
            "w-[35%] min-w-[150px]",
            isLastRow && "rounded-br-lg",
          )}
        >
          <div className="flex w-full items-center justify-between px-3">
            <div>
              <span
                className={twMerge(
                  "inline-flex items-center rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20",
                  showSkeleton &&
                    "h-5 w-[50px] animate-pulse bg-light-200 ring-0 dark:bg-dark-200",
                )}
              >
                {memberRole &&
                  memberRole.charAt(0).toUpperCase() + memberRole.slice(1)}
              </span>
              {memberStatus === "invited" && (
                <span className="ml-2 inline-flex items-center rounded-md bg-gray-500/10 px-1.5 py-0.5 text-[11px] font-medium text-gray-400 ring-1 ring-inset ring-gray-500/20">
                  Pending
                </span>
              )}
            </div>
            <div className={twMerge("relative", showSkeleton && "hidden")}>
              <Dropdown
                items={[
                  {
                    label: "Remove member",
                    action: () =>
                      openModal(
                        "REMOVE_MEMBER",
                        memberPublicId,
                        memberEmail ?? "",
                      ),
                  },
                ]}
              >
                <HiEllipsisHorizontal
                  size={25}
                  className="text-light-900 dark:text-dark-900"
                />
              </Dropdown>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="px-28 py-12">
      <div className="mb-8 flex w-full justify-between">
        <h1 className="font-medium tracking-tight text-neutral-900 dark:text-dark-1000 sm:text-[1.2rem]">
          Members
        </h1>
        <div className="flex">
          <button
            type="button"
            className="flex items-center gap-x-1.5 rounded-md bg-light-1000 px-3 py-2 text-sm font-semibold text-light-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 dark:bg-dark-1000 dark:text-dark-50"
            onClick={() => openModal("INVITE_MEMBER")}
          >
            <div className="h-5 w-5 items-center">
              <HiOutlinePlusSmall
                className="-mr-0.5 h-5 w-5"
                aria-hidden="true"
              />
            </div>
            Invite
          </button>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-visible sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="h-full shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-light-600 dark:divide-dark-600">
                <thead className="rounded-t-lg bg-light-300 dark:bg-dark-200">
                  <tr>
                    <th
                      scope="col"
                      className="w-[65%] rounded-tl-lg py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-light-900 dark:text-dark-900 sm:pl-6"
                    >
                      User
                    </th>
                    <th
                      scope="col"
                      className="w-[35%] rounded-tr-lg px-3 py-3.5 text-left text-sm font-semibold text-light-900 dark:text-dark-900"
                    >
                      Role
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-600 bg-light-50 dark:divide-dark-600 dark:bg-dark-100">
                  {!isLoading &&
                    data?.members.map((member, index) => (
                      <TableRow
                        key={member.publicId}
                        memberPublicId={member.publicId}
                        memberName={member?.user?.name}
                        memberEmail={member?.user?.email}
                        memberRole={member.role}
                        memberStatus={member.status}
                        isLastRow={index === data.members.length - 1}
                      />
                    ))}

                  {isLoading && (
                    <>
                      <TableRow showSkeleton />
                      <TableRow showSkeleton />
                      <TableRow showSkeleton isLastRow />
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Modal>
        {modalContentType === "NEW_WORKSPACE" && <NewWorkspaceForm />}
        {modalContentType === "INVITE_MEMBER" && <InviteMemberForm />}
        {modalContentType === "REMOVE_MEMBER" && <DeleteMemberConfirmation />}
      </Modal>
    </div>
  );
}
