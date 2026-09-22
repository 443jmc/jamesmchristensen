const SUCCESS =
  "Thank you for reaching out. I’ll respond soon. Feel free to call 916-292-8920. I often pick up.";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function html(message, status) {
  const page =
    "<!doctype html><html lang=en><meta charset=utf-8><meta name=viewport content=\"width=device-width, initial-scale=1\">" +
    "<title>Message</title><body style=\"font-family:Georgia,serif;padding:2rem;max-width:36rem\">" +
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
  const lastName = String(form.get("lastName") || "").trim();
  const email = String(form.get("email") || "").trim();
  const phone = String(form.get("phone") || "").trim();
  const message = String(form.get("message") || "").trim();
  const company = String(form.get("company") || "").trim();

  if (company) return reply(context.request, true, SUCCESS, 200);

  if (!firstName || !lastName || !email.includes("@") || message.length < 2) {
    return reply(context.request, false, "Please include your name, a valid email, and a message.", 400);
  }

  const endpoint = context.env.FORMSPREE_URL || context.env.CONTACT_WEBHOOK_URL;
  if (!endpoint) {
    return reply(
      context.request,
      false,
      "This form is not connected yet. Call 916-292-8920, or set FORMSPREE_URL in Cloudflare.",
      503
    );
  }

  const forwarded = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      form: "contact",
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: phone,
      message: message,
      source: "jamesmchristensen.com contact form",
    }),
  });

  if (!forwarded.ok) {
    return reply(context.request, false, "Unable to send your message. Please call 916-292-8920.", 502);
  }

  return reply(context.request, true, SUCCESS, 200);
}
