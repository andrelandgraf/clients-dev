import { getCatalog, getClient } from "@/lib/clients/catalog";
import { clientMarkdown } from "@/lib/clients/markdown";
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const client = getClient(id);
  if (!client)
    return Response.json({ error: "client not found" }, { status: 404 });
  return new Response(clientMarkdown(client, getCatalog()), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
