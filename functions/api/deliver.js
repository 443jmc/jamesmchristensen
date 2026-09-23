async function addToMailerLite(env, payload) {
  const body = {
    email: payload.email,
    fields: { name: payload.firstName },
  };
  if (env.MAILERLITE_GROUP_ID) body.groups = [env.MAILERLITE_GROUP_ID];

  const response = await fetch("https://connect.mailerlite.com/api/subscribers", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.MAILERLITE_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  return response.ok;
}

export async function deliver(env, payload) {
  if (payload.form === "newsletter" && env.MAILERLITE_API_KEY) {
    const added = await addToMailerLite(env, payload);
    if (!added) return false;
  }

  if (env.FORMS_WORKER_URL && env.FORMS_SECRET) {
    const response = await fetch(env.FORMS_WORKER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.FORMS_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    return response.ok;
  }

  const endpoint =
    payload.form === "newsletter"
      ? env.SUBSCRIBE_WEBHOOK_URL || env.FORMSPREE_URL
      : env.FORMSPREE_URL || env.CONTACT_WEBHOOK_URL;
  if (!endpoint) return null;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  return response.ok;
}
