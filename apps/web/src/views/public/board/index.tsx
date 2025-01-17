import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { HiLink } from "react-icons/hi2";

import Modal from "~/components/modal";
import { PageHead } from "~/components/PageHead";
import PatternedBackground from "~/components/PatternedBackground";
import Popup from "~/components/Popup";
import ThemeToggle from "~/components/ThemeToggle";
import { useModal } from "~/providers/modal";
import { usePopup } from "~/providers/popup";
import { api } from "~/utils/api";
import { formatToArray } from "~/utils/helpers";
import Filters from "~/views/board/components/Filters";
import { CardModal } from "./CardModal";

export default function PublicBoardView() {
  const router = useRouter();
  const { showPopup } = usePopup();
  const [isRouteLoaded, setIsRouteLoaded] = useState(false);
  const { openModal } = useModal();

  const boardSlug = Array.isArray(router.query.boardSlug)
    ? router.query.boardSlug[0]
    : router.query.boardSlug;

  const { data, isLoading } = api.board.bySlug.useQuery(
    {
      boardSlug: boardSlug ?? "",
      members: formatToArray(router.query.members),
      labels: formatToArray(router.query.labels),
    },
    { enabled: !!boardSlug },
  );

  const CopyBoardLink = () => {
    return (
      <button
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(window.location.href);
          } catch (error) {
            console.error(error);
          }

          showPopup({
            header: "Link copied",
            icon: "success",
            message: "Board URL copied to clipboard",
          });
        }}
        className="rounded p-1.5 transition-all hover:bg-light-200 dark:hover:bg-dark-100"
        aria-label={`Copy board URL`}
      >
        <HiLink className={`h-4 w-4 text-light-900 dark:text-dark-900`} />
      </button>
    );
  };

  const splitPath = router.asPath.split("/");
  const cardPublicId = splitPath.length > 3 ? splitPath[3] : null;

  useEffect(() => {
    if (!isRouteLoaded && router.isReady) {
      setIsRouteLoaded(true);

      if (cardPublicId) {
        openModal("CARD");
      }
    }
  }, [
    router.isReady,
    isRouteLoaded,
    setIsRouteLoaded,
    cardPublicId,
    openModal,
  ]);

  return (
    <>
      <PageHead
        title={`${data?.name ?? "Board"} | ${data?.workspace?.name ?? "Workspace"}`}
      />
      <style jsx global>{`
        html {
          height: 100vh;
          overflow: hidden;
        }
      `}</style>

      <div className="relative flex h-screen flex-col bg-light-100 px-4 pt-4 dark:bg-dark-50">
        <div className="relative h-full overflow-hidden rounded-md border pb-8 dark:border-dark-200">
          <PatternedBackground />
          <div className="z-10 flex w-full justify-between p-8">
            {isLoading ? (
              <div className="flex space-x-2">
                <div className="h-[2.3rem] w-[150px] animate-pulse rounded-[5px] bg-light-200 dark:bg-dark-100" />
              </div>
            ) : (
              <h1 className="font-bold leading-[2.3rem] tracking-tight text-neutral-900 focus:ring-0 focus-visible:outline-none dark:text-dark-1000 sm:text-[1.2rem]">
                {data?.name}
              </h1>
            )}
            <div className="flex items-center space-x-2">
              <Filters boardData={data ?? null} />
            </div>
          </div>

          <div className="scrollbar-w-none scrollbar-track-rounded-[4px] scrollbar-thumb-rounded-[4px] scrollbar-h-[8px] relative flex-1 overflow-y-hidden overflow-x-scroll overscroll-contain scrollbar scrollbar-track-light-200 scrollbar-thumb-light-400 dark:scrollbar-track-dark-100 dark:scrollbar-thumb-dark-300">
            {isLoading ? (
              <div className="ml-[2rem] flex">
                <div className="0 mr-5 h-[500px] w-[18rem] animate-pulse rounded-md bg-light-200 dark:bg-dark-100" />
                <div className="0 mr-5 h-[275px] w-[18rem] animate-pulse rounded-md bg-light-200 dark:bg-dark-100" />
                <div className="0 mr-5 h-[375px] w-[18rem] animate-pulse rounded-md bg-light-200 dark:bg-dark-100" />
              </div>
            ) : (
              <div className="flex">
                <div className="min-w-[2rem]" />
                {data?.lists.map((list) => (
                  <div
                    key={list.publicId}
                    className="dark-text-dark-1000 mr-5 h-fit min-w-[18rem] max-w-[18rem] rounded-md border border-light-400 bg-light-300 py-2 pl-2 pr-1 text-neutral-900 dark:border-dark-300 dark:bg-dark-100"
                  >
                    <div className="flex justify-between">
                      <span className="mb-4 block px-4 pt-1 text-sm font-medium text-neutral-900 dark:text-dark-1000">
                        {list.name}
                      </span>
                    </div>
                    <div className="scrollbar-track-rounded-[4px] scrollbar-thumb-rounded-[4px] scrollbar-w-[8px] z-10 h-full max-h-[calc(100vh-265px)] min-h-[2rem] overflow-y-auto pr-1 scrollbar scrollbar-track-dark-100 scrollbar-thumb-dark-600">
                      {list.cards.map((card) => (
                        <Link
                          key={card.publicId}
                          href={`/${data.workspace?.slug}/${data.slug}/${card.publicId}`}
                          className={`mb-2 flex !cursor-pointer flex-col rounded-md border border-light-200 bg-light-50 px-3 py-2 text-sm text-neutral-900 dark:border-dark-200 dark:bg-dark-200 dark:text-dark-1000 dark:hover:bg-dark-300`}
                          shallow={true}
                          onClick={() => {
                            openModal("CARD");
                          }}
                        >
                          <div>{card.title}</div>
                          {card.labels.length || card.members.length ? (
                            <div className="mt-2 flex justify-end space-x-1">
                              {card.labels.map((label) => (
                                <span
                                  key={label.publicId}
                                  className="inline-flex w-fit items-center gap-x-1.5 rounded-full px-2 py-1 text-[10px] font-medium text-neutral-600 ring-1 ring-inset ring-light-600 dark:text-dark-1000 dark:ring-dark-800"
                                >
                                  <svg
                                    fill={label.colourCode ?? undefined}
                                    className="h-2 w-2"
                                    viewBox="0 0 6 6"
                                    aria-hidden="true"
                                  >
                                    <circle cx={3} cy={3} r={3} />
                                  </svg>
                                  <div>{label.name}</div>
                                </span>
                              ))}
                              <div className="isolate flex -space-x-1 overflow-hidden">
                                {card.members.map((member) => (
                                  <span
                                    key={member.publicId}
                                    className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-light-900 ring-2 ring-light-50 dark:bg-gray-500 dark:ring-dark-500"
                                  >
                                    <span className="text-[10px] font-medium leading-none text-white">
                                      {member.user?.name
                                        ?.split(" ")
                                        .map((namePart) =>
                                          namePart.charAt(0).toUpperCase(),
                                        )
                                        .join("")}
                                    </span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="min-w-[0.75rem]" />
              </div>
            )}
          </div>
        </div>
        <div className="flex h-[54px] items-center justify-center">
          <div className="absolute left-[1rem]">
            <ThemeToggle />
            <CopyBoardLink />
          </div>

          <Link
            className="text-lg font-bold tracking-tight text-neutral-900 dark:text-dark-1000"
            href="/"
          >
            kan.bn
          </Link>
        </div>
      </div>
      <Popup />
      <Modal modalSize={"md"} positionFromTop={"12vh"}>
        <CardModal
          cardPublicId={cardPublicId}
          workspaceSlug={data?.workspace?.slug}
          boardSlug={data?.slug}
        />
      </Modal>
    </>
  );
}
