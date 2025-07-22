import { t } from "@lingui/core/macro";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import { useState } from "react";
import type { ReactNode } from "react";
import { Draggable } from "react-beautiful-dnd";
import { useForm } from "react-hook-form";
import {
  HiEllipsisHorizontal,
  HiOutlinePlusSmall,
  HiOutlineSquaresPlus,
  HiOutlineTrash,
} from "react-icons/hi2";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useModal } from "~/providers/modal";
import { api } from "~/utils/api";
import { formatToArray } from "~/utils/helpers";
import { NewCardForm } from "./NewCardForm";

interface ListProps {
  children: ReactNode;
  index: number;
  list: List;
  setSelectedPublicListId: (publicListId: PublicListId) => void;
}

interface List {
  publicId: string;
  name: string;
}

interface FormValues {
  listPublicId: string;
  name: string;
}

type PublicListId = string;

export default function List({
  children,
  index,
  list,
  setSelectedPublicListId,
}: ListProps) {
  const { openModal } = useModal();
  const [editable, setEditable] = useState(false);
  const params = useParams() as { boardId: string[] } | null;
  const router = useRouter();

  const boardId = params?.boardId.length ? params.boardId[0] : null;
  const queryParams = {
    boardPublicId: boardId ?? "",
    members: formatToArray(router.query.members),
    labels: formatToArray(router.query.labels),
  };


  const openNewCardForm = (publicListId: PublicListId) => {
    openModal("NEW_CARD");
    setSelectedPublicListId(publicListId);
  };

  const updateList = api.list.update.useMutation();

  const form = useForm<FormValues>({
    defaultValues: {
      listPublicId: list.publicId,
      name: list.name,
    },
    values: {
      listPublicId: list.publicId,
      name: list.name,
    },
  });

  const onSubmit = async (values: FormValues) => {
    updateList.mutate({
      listPublicId: values.listPublicId,
      name: values.name,
    });

    setEditable(false)
  };

  const handleOpenDeleteListConfirmation = () => {
    setSelectedPublicListId(list.publicId);
    openModal("DELETE_LIST");
  };

  return (
    <Draggable key={list.publicId} draggableId={list.publicId} index={index}>
      {(provided) => (
        <div
          key={list.publicId}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Card className="mr-5 !p-2 h-fit min-w-[18rem] max-w-[18rem]">
            <CardHeader>
              <div className="flex justify-between items-center">
                {editable ? (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} onBlur={form.handleSubmit(onSubmit)}>
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="shadcn" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                ) : (
                  <CardTitle onDoubleClick={() => setEditable(true)}>
                    {list.name}
                  </CardTitle>
                )}

                <div className="flex items-center">
                  <Button
                    onClick={() => openNewCardForm(list.publicId)}
                    variant="secondary"
                  >
                    <HiOutlinePlusSmall
                      className="h-5 w-5 text-dark-900"
                      aria-hidden="true"
                    />
                  </Button>
                  <div className="relative mr-1 inline-block">
                    <DropdownMenu>
                      <DropdownMenuTrigger><HiEllipsisHorizontal className="h-5 w-5 text-dark-900" /></DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {/* onClick={() => openNewCardForm(list.publicId)} */}
                        <DropdownMenuItem className="flex items-center gap-1" onSelect={(e) => e.preventDefault()}>
                          <Dialog>
                            <DialogTrigger>
                              <Button variant="outline">
                                <HiOutlineSquaresPlus className="h-[18px] w-[18px] text-dark-900" /> {t`Add a card`}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{t`New card`}</DialogTitle>
                              </DialogHeader>

                              <NewCardForm boardPublicId={boardId ?? ""}
                                listPublicId={list.publicId}
                                queryParams={queryParams} />
                            </DialogContent>
                          </Dialog>

                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-1" onClick={() => handleOpenDeleteListConfirmation}>
                          <HiOutlineTrash className="h-[18px] w-[18px] text-dark-900" /> {t`Delete list`}
                        </DropdownMenuItem>
                        <DropdownMenuItem>Team</DropdownMenuItem>
                        <DropdownMenuItem>Subscription</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-2">
              {children}
            </CardContent>
          </Card>
        </div>
      )
      }
    </Draggable >
  );
}
