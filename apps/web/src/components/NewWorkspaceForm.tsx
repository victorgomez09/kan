import { t } from "@lingui/core/macro";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { usePopup } from "~/providers/popup";
import { useWorkspace } from "~/providers/workspace";
import { api } from "~/utils/api";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Input } from "./ui/input";

interface FormValues {
  name: string;
}

export function NewWorkspaceForm() {
  const { showPopup } = usePopup();
  const { switchWorkspace } = useWorkspace();
  const form = useForm<FormValues>();
  const utils = api.useUtils();

  const createWorkspace = api.workspace.create.useMutation({
    onSuccess: (values) => {
      if (values.publicId && values.name) {
        utils.workspace.all.invalidate();
        switchWorkspace({
          publicId: values.publicId,
          name: values.name,
          description: values.description,
          slug: values.slug,
          plan: values.plan,
          role: "member"
        });
      }
    },
    onError: () => {
      showPopup({
        header: t`Unable to create workspace`,
        message: t`Please try again later, or contact customer support.`,
        icon: "error",
      });
    },
  });

  useEffect(() => {
    const nameElement: HTMLElement | null =
      document.querySelector<HTMLElement>("#workspace-name");
    if (nameElement) nameElement.focus();
  }, []);

  const onSubmit = (values: FormValues) => {
    createWorkspace.mutate({
      name: values.name,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder={t`Workspace name`}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-end mt-4">
          <Button type="submit" isLoading={createWorkspace.isPending}>
            {t`Create workspace`}
          </Button>
        </div>
      </form>
    </Form>
  );
}
