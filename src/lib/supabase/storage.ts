import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export async function uploadPassportDocument({
  passportId,
  documentType,
  file,
}: {
  passportId: string;
  documentType: string;
  file: File;
}) {
  const supabase = getSupabaseBrowserClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${passportId}/${documentType}/${Date.now()}-${safeName}`;

  if (!supabase) {
    return {
      fileUrl: `mock-storage://${path}`,
      fileName: file.name,
    };
  }

  const { error } = await supabase.storage.from("passport-documents").upload(path, file, {
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from("passport-documents").getPublicUrl(path);

  return {
    fileUrl: data.publicUrl,
    fileName: file.name,
  };
}
