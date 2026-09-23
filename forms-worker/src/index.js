const TO = "james.m.christensen@gmail.com";
const FROM = "forms@strengthbasedmarriage.com";

function clip(value, max) {
  return String(value || "").replace(/\r/g, "").trim().slice(0, max);
}

export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }
    const auth = request.headers.get("Authorization") || "";
    if (!env.FORMS_SECRET || auth !== `Bearer ${env.FORMS_SECRET}`) {
      return Response.json({ ok: false }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ ok: false }, { status: 400 });
    }

    const newsletter = body.form === "newsletter";
    const firstName = clip(body.firstName, 80);
    const email = clip(body.email, 200);
    if (!firstName || !email.includes("@")) {
      return Response.json({ ok: false }, { status: 400 });
    }

    let subject;
    let message;
    if (newsletter) {
      subject = `Email list: ${firstName} (${email})`;
      message = [
        "Someone joined the email list on jamesmchristensen.com.",
        "",
        `First name: ${firstName}`,
        `Email: ${email}`,
      ].join("\n");
    } else {
      const lastName = clip(body.lastName, 80);
      const phone = clip(body.phone, 40);
      const note = clip(body.message, 5000);
      if (!lastName || note.length < 2) {
        return Response.json({ ok: false }, { status: 400 });
      }
      subject = `Contact form: ${firstName} ${lastName}`;
      message = [
        "New message from the contact form on jamesmchristensen.com.",
        "",
        `Name: ${firstName} ${lastName}`,
        `Email: ${email}`,
        `Phone: ${phone || "(none)"}`,
        "",
        note,
      ].join("\n");
    }

    try {
      await env.EMAIL.send({
        to: TO,
        from: { email: FROM, name: "James Christensen website" },
        replyTo: email,
        subject: subject.slice(0, 180),
        text: message,
      });
    } catch (error) {
      const detail = error && error.message ? String(error.message) : "send failed";
      return Response.json({ ok: false, error: detail.slice(0, 300) }, { status: 502 });
    }

    return Response.json({ ok: true });
  },
};
