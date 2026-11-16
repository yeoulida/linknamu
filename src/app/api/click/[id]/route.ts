import { ObjectId } from "mongodb";
import { getSession } from "@/lib/auth";
import { collections } from "@/lib/db";

/**
 * 링크 클릭 수 +1 (F3-1).
 * 방문자 이동은 클라이언트에서 sendBeacon으로 비동기 호출하므로
 * 여기서 실패해도 링크 이동은 막히지 않는다(F3-4).
 */
export async function POST(_req: Request, ctx: RouteContext<"/api/click/[id]">) {
  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) {
    return new Response(null, { status: 400 });
  }

  try {
    const linkId = new ObjectId(id);
    const { links } = await collections();

    // F3-5: 소유자 본인의 클릭은 집계에서 제외
    const session = await getSession();
    const filter: Record<string, unknown> = { _id: linkId };
    if (session && ObjectId.isValid(session.userId)) {
      filter.userId = { $ne: new ObjectId(session.userId) };
    }

    await links.updateOne(filter, { $inc: { clickCount: 1 } });
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("[click] 집계 실패", err);
    return new Response(null, { status: 500 });
  }
}
