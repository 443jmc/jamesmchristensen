const SUCCESS = "You’re on the list. Thank you.";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function html(message, status) {
  const page =
    "<!doctype html><html lang=en><meta charset=utf-8><meta name=viewport content=\"width=device-width, initial-scale=1\">" +
    "<title>Email list</title><body style=\"font-family:Georgia,serif;padding:2rem;max-width:36rem\">" +
    "<p>" +
    message +
    "</p><p><a href=\"/\">Back to the site</a></p></body></html>";
  return new Response(page, {
    status: status || 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function wantsJson(request) {
  return (request.headers.get("accept") || "").includes("application/json");
}

function reply(request, ok, message, status) {
  if (wantsJson(request)) return json(ok ? { ok: true, message: message } : { ok: false, error: message }, status);
  return html(message, status);
}

export async function onRequestPost(context) {
  const form = await context.request.formData();
  const firstName = String(form.get("firstName") || "").trim();
  const email = String(form.get("email") || "").trim();
  const company = String(form.get("company") || "").trim();

  if (company) return reply(context.request, true, SUCCESS, 200);

  if (!firstName || !email.includes("@")) {
    return reply(context.request, false, "Please include your first name and a valid email.", 400);
  }

  const endpoint = context.env.SUBSCRIBE_WEBHOOK_URL || context.env.FORMSPREE_URL;
  if (!endpoint) {
    return reply(
      context.request,
      false,
      "The email list is not connected yet. Set SUBSCRIBE_WEBHOOK_URL or FORMSPREE_URL in Cloudflare.",
      503
    );
  }

  const forwarded = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      form: "newsletter",
      firstName: firstName,
      email: email,
      source: "jamesmchristensen.com email list",
    }),
  });

  if (!forwarded.ok) {
    return reply(context.request, false, "Unable to join the list right now. Please try again later.", 502);
  }

  return reply(context.request, true, SUCCESS, 200);
}
