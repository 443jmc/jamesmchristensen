export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.searchParams.get("format") !== "rss") return context.next();
  const rss = await fetch(new URL("/podcast/rss.xml", url.origin));
  return new Response(rss.body, {
    status: rss.status,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
