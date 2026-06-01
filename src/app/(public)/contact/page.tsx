import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Deligo News",
  description:
    "Reach the Deligo News team — story tips, newsroom feedback, corrections, advertising, and press enquiries.",
};

const CHANNELS: Array<{ label: string; detail: string; href: string }> = [
  {
    label: "Newsroom & story tips",
    detail: "newsroom@deligo.news",
    href: "mailto:newsroom@deligo.news",
  },
  {
    label: "Corrections",
    detail: "corrections@deligo.news",
    href: "mailto:corrections@deligo.news",
  },
  {
    label: "Advertising & partnerships",
    detail: "ads@deligo.news",
    href: "mailto:ads@deligo.news",
  },
  {
    label: "Press & general enquiries",
    detail: "hello@deligo.news",
    href: "mailto:hello@deligo.news",
  },
];

export default function ContactPage() {
  return (
    <article className="max-w-[760px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <header className="border-b-[1.5px] border-ink pb-6 mb-8">
        <p className="font-hand text-[12px] uppercase tracking-[0.12em] text-muted">
          Get in touch
        </p>
        <h1 className="serif text-[32px] sm:text-[42px] font-extrabold tracking-tight leading-[1.05] mt-2">
          Contact us
        </h1>
        <p className="mt-3 font-sans text-[14px] text-ink/85">
          We read every message. For the fastest response, use the channel
          that best matches your enquiry.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2">
        {CHANNELS.map((c) => (
          <a
            key={c.label}
            href={c.href}
            className="block border-[1.5px] border-ink rounded-sm bg-paper p-4 hover:bg-paper-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
          >
            <p className="font-hand text-[11px] uppercase tracking-wider text-muted">
              {c.label}
            </p>
            <p className="mt-1 font-sans text-[15px] font-semibold text-ink">
              {c.detail}
            </p>
          </a>
        ))}
      </section>

      <section className="prose-deligo serif text-[16.5px] leading-[1.7] text-ink mt-10">
        <h2>Confidential tips</h2>
        <p>
          If you have sensitive information, tell us in your first email that
          you need confidentiality and we will arrange a secure channel. Please
          don&apos;t send confidential material through social media.
        </p>
        <h2>Want to write for us?</h2>
        <p>
          Deligo publishes work from verified journalists. Create an account,
          then apply from your dashboard&apos;s{" "}
          <a href="/dashboard/become-journalist">Become a journalist</a> page.
          Our standards are set out in the{" "}
          <a href="/journalist-guidelines">journalism guidelines</a>.
        </p>
      </section>
    </article>
  );
}
