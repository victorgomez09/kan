import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/core/macro";
import { env } from "next-runtime-env";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { ControlGroup, ControlGroupItem } from "~/components/ui/control-group";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { InputBase, InputBaseAdornment, InputBaseControl, InputBaseInput } from "~/components/ui/input-base";
import { useDebounce } from "~/hooks/useDebounce";
import { usePopup } from "~/providers/popup";
import { api } from "~/utils/api";

interface QueryParams {
  boardPublicId: string;
  members: string[];
  labels: string[];
}

export function UpdateBoardSlugForm({
  boardPublicId,
  workspaceSlug,
  boardSlug,
  queryParams,
}: {
  boardPublicId: string;
  workspaceSlug: string;
  boardSlug: string;
  queryParams: QueryParams;
}) {
  const { showPopup } = usePopup();
  const utils = api.useUtils();

  const schema = z.object({
    slug: z
      .string()
      .min(3, {
        message: t`Board URL must be at least 3 characters long`,
      })
      .max(60, { message: t`Board URL cannot exceed 60 characters` })
      .regex(/^(?![-]+$)[a-zA-Z0-9-]+$/, {
        message: t`Board URL can only contain letters, numbers, and hyphens`,
      }),
  });
  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      slug: boardSlug,
    },
    mode: "onChange",
  });

  const slug = form.watch("slug");
  const [debouncedSlug] = useDebounce(slug, 500);

  const updateBoardSlug = api.board.update.useMutation({
    onError: () => {
      showPopup({
        header: t`Unable to update board URL`,
        message: t`Please try again later, or contact customer support.`,
        icon: "error",
      });
    },
    onSettled: async () => {
      await utils.board.byId.invalidate(queryParams);
    },
  });
  const checkBoardSlugAvailability = api.board.checkSlugAvailability.useQuery(
    {
      boardSlug: debouncedSlug,
      boardPublicId,
    },
    {
      enabled: !!debouncedSlug && debouncedSlug !== boardSlug && !form.formState.errors.slug,
    },
  );
  const isBoardSlugAvailable = checkBoardSlugAvailability.data;

  const onSubmit = (data: FormValues) => {
    if (!isBoardSlugAvailable) return;
    if (isBoardSlugAvailable.isReserved) return;

    updateBoardSlug.mutate({
      slug: data.slug,
      boardPublicId,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ControlGroup>
                  <ControlGroupItem>
                    <InputBase>
                      <InputBaseAdornment>{`${env("NEXT_PUBLIC_KAN_ENV") === "cloud" ? "kan.bn" : env("NEXT_PUBLIC_BASE_URL")}/${workspaceSlug}/`}</InputBaseAdornment>
                    </InputBase>
                  </ControlGroupItem>
                  <ControlGroupItem>
                    <InputBase>
                      <InputBaseControl>
                        <InputBaseInput {...field} />
                      </InputBaseControl>
                    </InputBase>
                  </ControlGroupItem>
                </ControlGroup>
                {/* <Input prefix={`${env("NEXT_PUBLIC_KAN_ENV") === "cloud" ? "kan.bn" : env("NEXT_PUBLIC_BASE_URL")}/${workspaceSlug}/`}  /> */}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2">
            <Link
              href="/settings?edit=workspace_url"
            >
              <Button variant="secondary">
                {t`Edit workspace URL`}
              </Button>
            </Link>
            <Button
              type="submit"
              isLoading={updateBoardSlug.isPending}
              disabled={
                !form.formState.isDirty ||
                updateBoardSlug.isPending ||
                form.formState.errors.slug?.message !== undefined ||
                isBoardSlugAvailable?.isReserved
              }
            >
              {t`Update`}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
