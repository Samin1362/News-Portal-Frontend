import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Corrections Policy — Deligo News",
  description:
    "How Deligo News handles errors: how to report one, and how we correct the record.",
};

export default function CorrectionsPage() {
  return (
    <article className="max-w-[760px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <header className="border-b-[1.5px] border-ink pb-6 mb-8">
        <p className="font-hand text-[12px] uppercase tracking-[0.12em] text-muted">
          Accountability
        </p>
        <h1 className="serif text-[32px] sm:text-[42px] font-extrabold tracking-tight leading-[1.05] mt-2">
          Corrections policy
        </h1>
        <p className="mt-3 font-sans text-[14px] text-ink/85">
          We aim to be accurate, and to fix mistakes quickly and transparently
          when we&apos;re not.
        </p>
      </header>

      <section className="prose-deligo serif text-[16.5px] leading-[1.7] text-ink">
        <h2>Report an error</h2>
        <p>
          If you believe something we&apos;ve published is wrong, email{" "}
          <a href="mailto:corrections@deligo.news">corrections@deligo.news</a>{" "}
          with the article headline, the specific passage, and what you believe
          the correct information is. The more precise you are, the faster we
          can check it.
        </p>

        <h2>How we respond</h2>
        <ul>
          <li>
            We review every report against the original sourcing as soon as
            possible.
          </li>
          <li>
            If a factual error is confirmed, we correct the article and append
            a dated note explaining what changed.
          </li>
          <li>
            Significant corrections are flagged prominently rather than made
            silently.
          </li>
        </ul>

        <h2>Corrections vs. clarifications</h2>
        <p>
          A <strong>correction</strong> fixes a factual error. A{" "}
          <strong>clarification</strong> adds context or rewords something that
          was accurate but open to misreading. Both are logged on the article.
        </p>

        <h2>What we don&apos;t change</h2>
        <p>
          We don&apos;t quietly remove accurate reporting because a subject
          dislikes it. Takedown requests are considered only for legal or
          safety reasons and are handled by our editors.
        </p>

        <p>
          Our underlying reporting standards are set out in the{" "}
          <a href="/journalist-guidelines">journalism guidelines</a>.
        </p>
      </section>
    </article>
  );
}
