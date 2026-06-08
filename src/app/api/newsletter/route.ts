import { z } from "zod";

// Newsletter capture (Phase 4 — Reader Engagement).
//
// The backend has no newsletter collection (old plan Phase 11 was skipped), so
// this route is deliberately *honest* and forward-compatible:
//
//   - If a third-party provider is configured (Buttondown today; add others as
//     needed), we forward the email and report `status: "subscribed"`.
//   - If no provider env is set, we validate the address and report
//     `status: "pending"` — the client then records it locally and shows a
//     clear "we'll email you when it launches" state. No dead form, no lie.
//
// Wiring a provider later is a one-env change; the client UI stays the same.

const BodySchema = z.object({
  email: z.string().trim().email(),
});

const BUTTONDOWN_KEY = process.env.BUTTONDOWN_API_KEY;

async function subscribeViaButtondown(email: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.buttondown.email/v1/subscribers", {
      method: "POST",
      headers: {
        Authorization: `Token ${BUTTONDOWN_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email_address: email }),
    });
    // 201 created, or 400 when already subscribed — both mean "we have them".
    return res.ok || res.status === 400;
  } catch {
    return false;
  }
}

export async function POST(req: Request): Promise<Response> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return Response.json(
      { ok: false, message: "Invalid request body." },
      { status: 400 },
    );
  }

  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json(
      { ok: false, message: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const { email } = parsed.data;

  if (BUTTONDOWN_KEY) {
    const ok = await subscribeViaButtondown(email);
    if (!ok) {
      return Response.json(
        { ok: false, message: "Subscription failed. Please try again." },
        { status: 502 },
      );
    }
    return Response.json({ ok: true, status: "subscribed" });
  }

  // No provider configured — accept + acknowledge honestly.
  return Response.json({ ok: true, status: "pending" });
}
