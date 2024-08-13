import { useEffect } from "react";
import { api } from "~/utils/api";
import { HiXMark } from "react-icons/hi2";
import { useModal } from "~/providers/modal";
import { useWorkspace } from "~/providers/workspace";
import { useForm } from "react-hook-form";

interface FormValues {
  name: string;
}

export function NewWorkspaceForm() {
  const { closeModal } = useModal();
  const { switchWorkspace } = useWorkspace();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const createWorkspace = api.workspace.create.useMutation({
    onSuccess: (values) => {
      try {
        if (values?.publicId && values.name) {
          switchWorkspace({ publicId: values.publicId, name: values.name });
          closeModal();
        }
      } catch (e) {
        console.log(e);
      }
    },
  });

  useEffect(() => {
    const nameElement: HTMLElement | null =
      document?.querySelector<HTMLElement>("#workspace-name");
    if (nameElement) nameElement.focus();
  }, []);

  const onSubmit = (values: FormValues) => {
    createWorkspace.mutate({
      name: values.name,
    });
  };

  return (
    <div className="p-5">
      <div className="flex w-full items-center justify-between pb-4">
        <h2 className="text-sm font-bold text-neutral-900 dark:text-dark-1000">
          New workspace
        </h2>
        <button
          className="rounded p-1 hover:bg-light-200 focus:outline-none dark:hover:bg-dark-300"
          onClick={() => closeModal()}
        >
          <HiXMark size={18} className="text-light-900 dark:text-dark-900" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <label
          htmlFor="workspace-name"
          className="block pb-2 text-sm font-normal leading-6 text-neutral-900 dark:text-dark-1000"
        >
          Name
        </label>
        <input
          id="workspace-name"
          {...register("name", { required: true })}
          className="block w-full rounded-md border-0 bg-dark-300 bg-white/5 py-1.5 text-neutral-900 shadow-sm ring-1 ring-inset ring-light-600 focus:ring-2 focus:ring-inset focus:ring-light-600 dark:text-dark-1000 dark:ring-dark-700 dark:focus:ring-dark-700 sm:text-sm sm:leading-6"
        />
        <div className="mt-5 sm:mt-6">
          <button
            type="submit"
            className="inline-flex w-full justify-center rounded-md bg-light-1000 px-3 py-2 text-sm font-semibold text-light-50 shadow-sm focus-visible:outline-none dark:bg-dark-1000 dark:text-dark-50"
          >
            Create workspace
          </button>
        </div>
      </form>
    </div>
  );
}
