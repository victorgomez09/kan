import { t } from "@lingui/core/macro";
import { colours } from "@kan/shared/constants";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "~/components/ui/input";
import { api } from "~/utils/api";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { DeleteLabelConfirmation } from "./DeleteLabelConfirmation";

interface LabelFormInput {
  name: string;
  colour: Colour;
  isCreateAnotherEnabled?: boolean;
}

interface Colour {
  name: string;
  code: string;
}

export function LabelForm({
  boardPublicId,
  refetch,
  isEdit,
  entityId
}: {
  boardPublicId: string;
  refetch: () => void;
  isEdit?: boolean;
  entityId?: string;
}) {
  const label = api.label.byPublicId.useQuery(
    {
      labelPublicId: entityId || "",
    },
    {
      enabled: isEdit && !!entityId,
    },
  );
  const utils = api.useUtils();

  const refetchBoard = async () => {
    if (boardPublicId) await utils.board.byId.refetch({ boardPublicId: boardPublicId });
  };

  const form =
    useForm<LabelFormInput>({
      values: {
        name: isEdit && label.data?.name ? label.data.name : "",
        colour: (isEdit && label.data?.colourCode
          ? colours.find((c) => c.code === label.data.colourCode)
          : colours[0]) as Colour,
        isCreateAnotherEnabled: false,
      },
    });

  const isCreateAnotherEnabled = form.watch("isCreateAnotherEnabled");

  const createLabel = api.label.create.useMutation({
    onSuccess: () => {
      const currentColourIndex = colours.findIndex(
        (c) => c.code === form.watch("colour").code,
      );
      try {
        refetch();
        // if (!isCreateAnotherEnabled) closeModal();
        form.reset({
          name: "",
          colour: colours[(currentColourIndex + 1) % colours.length],
          isCreateAnotherEnabled,
        });
      } catch (e) {
        console.log(e);
      }
    },
  });

  const updateLabel = api.label.update.useMutation({
    onSuccess: () => {
      refetch();
      // closeModal();
      form.reset({
        name: "",
        colour: colours[0],
      });
    },
  });

  const onSubmit = (values: LabelFormInput) => {
    if (!values.colour.code) return;

    if (isEdit) {
      updateLabel.mutate({
        labelPublicId: label.data?.publicId ?? "",
        name: values.name,
        colourCode: values.colour.code,
      });
    } else {
      createLabel.mutate({
        name: values.name,
        colourCode: values.colour.code,
        boardPublicId,
      });
    }
  };

  useEffect(() => {
    const nameElement: HTMLElement | null =
      document.querySelector<HTMLElement>("#label-name");
    if (nameElement) nameElement.focus();
  }, []);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        id="label-form"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="colour"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value.code}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {colours.map((colour, index) => (
                        <SelectItem key={index} value={colour.code} className="flex items-center gap-2">
                          <span
                            style={{ backgroundColor: colour.code }}
                            className="ml-2 inline-block h-2 w-2 flex-shrink-0 rounded-full"
                            aria-hidden="true"
                          />
                          {colour.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* {!isEdit && (
          <Toggle
            label={t`Create another`}
            isChecked={!!isCreateAnotherEnabled}
            onChange={() =>
              form.setValue("isCreateAnotherEnabled", !isCreateAnotherEnabled)
            }
          />
        )} */}

        <div className="space-x-2">
          {isEdit && (
            <DeleteLabelConfirmation
              refetch={refetchBoard}
              labelPublicId={entityId || ""}
            />
          )}
          <Button
            type="submit"
            isLoading={updateLabel.isPending || createLabel.isPending}
          >
            {isEdit ? t`Update label` : t`Create label`}
          </Button>
        </div>
      </form>
    </Form>

    //     <div className="space-x-2">
    //       {isEdit && (
    //         <Button
    //           variant="secondary"
    //           onClick={() => openModal("DELETE_LABEL", entityId)}
    //         >
    //           {t`Delete`}
    //         </Button>
    //       )}
    //       <Button
    //         type="submit"
    //         isLoading={updateLabel.isPending || createLabel.isPending}
    //       >
    //         {isEdit ? t`Update label` : t`Create label`}
    //       </Button>
    //     </div>
    //   </div>
    // </form>
  );
}
