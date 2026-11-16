import { ObjectId } from "mongodb";
import { collections } from "@/lib/db";

/** 프로필 사진 제공. URL에 ?v=타임스탬프가 붙으므로 장기 캐시해도 안전하다. */
export async function GET(_req: Request, ctx: RouteContext<"/api/avatar/[userId]">) {
  const { userId } = await ctx.params;
  if (!ObjectId.isValid(userId)) {
    return new Response("Not found", { status: 404 });
  }

  const { avatars } = await collections();
  const avatar = await avatars.findOne({ _id: new ObjectId(userId) });
  if (!avatar) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(new Uint8Array(avatar.data.buffer), {
    headers: {
      "Content-Type": avatar.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
