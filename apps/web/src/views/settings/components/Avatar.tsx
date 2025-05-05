import Image from "next/image";
import { useState } from "react";

import { usePopup } from "~/providers/popup";
import { api } from "~/utils/api";

export default function Avatar({
  userId,
  userImage,
}: {
  userId: string | undefined;
  userImage: string | null | undefined;
}) {
  const utils = api.useUtils();
  const { showPopup } = usePopup();
  const [uploading, setUploading] = useState(false);

  const updateUser = api.user.update.useMutation({
    onSuccess: async () => {
      showPopup({
        header: "Profile image updated",
        message: "Your profile image has been updated.",
        icon: "success",
      });
      try {
        await utils.user.getUser.refetch();
      } catch (e) {
        console.error(e);
        throw e;
      }
    },
    onError: () => {
      showPopup({
        header: "Error updating profile image",
        message: "Please try again later, or contact customer support.",
        icon: "error",
      });
    },
  });

  const avatarUrl = userImage ? "" : undefined;

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      if (!userId) {
        throw new Error("User ID is required.");
      }

      const file = event.target.files[0];

      if (!file) {
        throw new Error("No file selected.");
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/avatar.${fileExt}`;
      const filePath = `${fileName}`;

      // const { error: uploadError } = await supabase.storage
      //   .from("avatars")
      //   .upload(filePath, file, { upsert: true });

      // if (uploadError) {
      //   throw uploadError;
      // }

      updateUser.mutate({ image: filePath });
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="relative">
        <input
          className="absolute z-10 h-16 w-16 cursor-pointer rounded-full opacity-0"
          type="file"
          id="single"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
        />
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="Avatar"
            width={64}
            height={64}
            className="rounded-full"
          />
        ) : (
          <span className="inline-block h-16 w-16 overflow-hidden rounded-full bg-light-400 dark:bg-dark-400">
            <svg
              className="h-full w-full text-dark-700"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </span>
        )}
      </div>
    </div>
  );
}
