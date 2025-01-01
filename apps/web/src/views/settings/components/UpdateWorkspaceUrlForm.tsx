import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import Button from "~/components/Button";
import Input from "~/components/Input";
import { usePopup } from "~/providers/popup";
import { api } from "~/utils/api";

const schema = z.object({
  slug: z
    .string()
    .min(3, { message: "Workspace URL must be at least 3 characters long" })
    .max(24, { message: "Workspace URL cannot exceed 24 characters" }),
});

type FormValues = z.infer<typeof schema>;

const UpdateWorkspaceUrlForm = ({
  workspacePublicId,
  workspaceUrl,
}: {
  workspacePublicId: string;
  workspaceUrl: string;
}) => {
  const utils = api.useUtils();
  const { showPopup } = usePopup();
  const {
    register,
    handleSubmit,
    formState: { isDirty, errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      slug: workspaceUrl,
    },
  });

  const updateWorkspaceSlug = api.workspace.update.useMutation({
    onSuccess: async () => {
      try {
        await utils.workspace.all.refetch();
      } catch (e) {
        console.error(e);
        throw e;
      }
    },
    onError: () => {
      showPopup({
        header: "Error updating workspace URL",
        message: "Please try again later, or contact customer support.",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    updateWorkspaceSlug.mutate({
      workspacePublicId,
      slug: data.slug,
    });
  };

  return (
    <>
      <div className="mb-4 flex max-w-[350px] items-center gap-2">
        <Input
          {...register("slug")}
          errorMessage={errors.slug?.message}
          prefix="kanbn.com/"
        />
      </div>
      <Button
        onClick={handleSubmit(onSubmit)}
        variant="primary"
        disabled={!isDirty || updateWorkspaceSlug.isPending}
        isLoading={updateWorkspaceSlug.isPending}
      >
        Update
      </Button>
    </>
  );
};

export default UpdateWorkspaceUrlForm;
