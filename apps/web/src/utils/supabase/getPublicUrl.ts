import createClient from "~/utils/supabase/client";

export const getPublicUrl = (fileName: string) => {
  const supabase = createClient();

  return supabase.storage.from("avatars").getPublicUrl(fileName).data.publicUrl;
};
