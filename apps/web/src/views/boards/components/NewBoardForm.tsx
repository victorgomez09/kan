import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/core/macro";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Template } from "./TemplateBoards";
import { Button } from "~/components/ui/button";
import { useWorkspace } from "~/providers/workspace";
import { api } from "~/utils/api";
import TemplateBoards, { getTemplates } from "./TemplateBoards";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";

const schema = z.object({
  name: z
    .string()
    .min(1, { message: t`Board name is required` })
    .max(100, { message: t`Board name cannot exceed 100 characters` }),
  workspacePublicId: z.string(),
  template: z.custom<Template | null>(),
});

interface NewBoardInputWithTemplate {
  name: string;
  workspacePublicId: string;
  template: Template | null;
}

export function NewBoardForm() {
  const utils = api.useUtils();
  const { workspace } = useWorkspace();
  const [showTemplates, setShowTemplates] = useState(false);

  const templates = getTemplates();

  const form = useForm<NewBoardInputWithTemplate>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      workspacePublicId: workspace.publicId || "",
      template: null,
    },
  });

  const currentTemplate = form.watch("template");

  const refetchBoards = () => utils.board.all.refetch();

  const createBoard = api.board.create.useMutation({
    onSuccess: async () => {
      await refetchBoards();
    },
  });

  const onSubmit = (data: NewBoardInputWithTemplate) => {
    createBoard.mutate({
      name: data.name,
      workspacePublicId: data.workspacePublicId,
      lists: data.template?.lists ?? [],
      labels: data.template?.labels ?? [],
    });
  };

  useEffect(() => {
    const titleElement: HTMLElement | null =
      document.querySelector<HTMLElement>("#name");
    if (titleElement) titleElement.focus();
  }, []);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        id="login-form"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder={t`Name`} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <TemplateBoards
          currentBoard={currentTemplate}
          setCurrentBoard={(t) => form.setValue("template", t)}
          showTemplates={showTemplates}
        />
        <div className="flex items-center justify-end gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="template-switch">{t`Use template`}</Label>
            <Switch
              checked={showTemplates}
              onCheckedChange={() => {
                setShowTemplates(!showTemplates);
                if (!showTemplates && !currentTemplate) {
                  form.setValue("template", templates[0] ?? null);
                }
              }}
            />
          </div>

          <Button type="submit" isLoading={createBoard.isPending} className="mt-2">
            {t`Create board`}
          </Button>
        </div>
      </form>
    </Form>
  );
}
