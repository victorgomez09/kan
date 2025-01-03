import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { HiCheck, HiMiniStar } from "react-icons/hi2";
import { z } from "zod";

import Button from "~/components/Button";
import Input from "~/components/Input";
import { useDebounce } from "~/hooks/useDebounce";
import { useModal } from "~/providers/modal";
import { usePopup } from "~/providers/popup";
import { api } from "~/utils/api";

const schema = z.object({
  slug: z
    .string()
    .min(3, {
      message: "Username must be at least 3 characters long",
    })
    .max(24, { message: "Username cannot exceed 24 characters" })
    .regex(/^(?![-]+$)[a-zA-Z0-9-]+$/, {
      message: "Username can only contain letters, numbers, and hyphens",
    }),
});

type FormValues = z.infer<typeof schema>;

const UpdateWorkspaceUrlForm = ({
  workspacePublicId,
  workspaceUrl,
  workspacePlan,
}: {
  workspacePublicId: string;
  workspaceUrl: string;
  workspacePlan: "free" | "pro" | "enterprise";
}) => {
  const utils = api.useUtils();
  const { showPopup } = usePopup();
  const { openModal } = useModal();
  const {
    register,
    handleSubmit,
    formState: { isDirty, errors },
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      slug: workspaceUrl,
    },
    mode: "onChange",
  });

  const slug = watch("slug");

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
        header: "Error updating workspace username",
        message: "Please try again later, or contact customer support.",
      });
    },
  });

  const [debouncedSlug] = useDebounce(slug, 500);

  const isTyping = slug !== debouncedSlug;

  const checkWorkspaceSlugAvailability =
    api.workspace.checkSlugAvailability.useQuery(
      {
        workspaceSlug: debouncedSlug,
      },
      {
        enabled:
          !!debouncedSlug && debouncedSlug !== workspaceUrl && !errors.slug,
      },
    );

  const isWorkspaceSlugAvailable = checkWorkspaceSlugAvailability.data;

  const onSubmit = (data: FormValues) => {
    if (isWorkspaceSlugAvailable?.isPremium && workspacePlan !== "pro")
      return openModal("PREMIUM_USERNAME", data.slug);

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
          className={`${
            isWorkspaceSlugAvailable?.isPremium ||
            (workspacePlan === "pro" && slug === workspaceUrl)
              ? "focus:ring-yellow-500 dark:focus:ring-yellow-500"
              : ""
          }`}
          errorMessage={
            errors.slug?.message ||
            (isWorkspaceSlugAvailable?.isAvailable === false
              ? "This workspace username has already been taken"
              : undefined)
          }
          prefix="kan.bn/"
          iconRight={
            isWorkspaceSlugAvailable?.isPremium ||
            (workspacePlan === "pro" && slug === workspaceUrl) ? (
              <HiMiniStar className="h-4 w-4 text-yellow-500" />
            ) : isWorkspaceSlugAvailable?.isAvailable ? (
              <HiCheck className="h-4 w-4 dark:text-dark-1000" />
            ) : null
          }
        />
      </div>
      <Button
        onClick={handleSubmit(onSubmit)}
        variant="primary"
        disabled={
          !isDirty ||
          updateWorkspaceSlug.isPending ||
          checkWorkspaceSlugAvailability.isPending ||
          isWorkspaceSlugAvailable?.isAvailable === false ||
          isTyping
        }
        isLoading={updateWorkspaceSlug.isPending}
      >
        Update
      </Button>
    </>
  );
};

export default UpdateWorkspaceUrlForm;
