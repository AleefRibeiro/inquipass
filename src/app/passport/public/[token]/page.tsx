import { PublicPassportClient } from "@/components/passport/public-passport-client";

export default async function PublicPassportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <PublicPassportClient token={token} />;
}
