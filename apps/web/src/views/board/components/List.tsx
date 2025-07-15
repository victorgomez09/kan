import { t } from "@lingui/core/macro";
import { useState, type ReactNode } from "react";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useModal } from "~/providers/modal";
import { api } from "~/utils/api";

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
  const [editable, setEditable] = useState(false)

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
    await updateList.mutate({
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
          <Card className="mr-5 h-fit min-w-[18rem] max-w-[18rem]">
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
                    size="sm"
                  >
                    <HiOutlinePlusSmall
                      className="h-5 w-5 text-dark-900"
                      aria-hidden="true"
                    />
                  </Button>
                  <div className="relative mr-1 inline-block">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="secondary" size="sm">
                          <HiEllipsisHorizontal className="h-5 w-5 text-dark-900" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem className="flex items-center gap-1" onClick={() => openNewCardForm(list.publicId)}>
                          <HiOutlineSquaresPlus className="h-[18px] w-[18px] text-dark-900" /> {t`Add a card`}
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

            <CardContent>
              {children}
            </CardContent>
          </Card>
        </div>
      )
      }
    </Draggable >
  );
}
