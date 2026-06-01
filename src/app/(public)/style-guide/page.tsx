import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Style Guide — Deligo News",
  description:
    "How Deligo News writes: voice, grammar, names, numbers, datelines, and formatting conventions.",
};

export default function StyleGuidePage() {
  return (
    <article className="max-w-[760px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <header className="border-b-[1.5px] border-ink pb-6 mb-8">
        <p className="font-hand text-[12px] uppercase tracking-[0.12em] text-muted">
          Newsroom standards
        </p>
        <h1 className="serif text-[32px] sm:text-[42px] font-extrabold tracking-tight leading-[1.05] mt-2">
          Deligo style guide
        </h1>
        <p className="mt-3 font-sans text-[14px] text-ink/85">
          The conventions our journalists follow so coverage reads as one
          consistent voice.
        </p>
      </header>

      <section className="prose-deligo serif text-[16.5px] leading-[1.7] text-ink">
        <h2>Voice</h2>
        <p>
          Write plainly and actively. Prefer short, concrete sentences over
          jargon. The reader should never need outside knowledge to follow the
          first three paragraphs of a story.
        </p>

        <h2>Headlines</h2>
        <ul>
          <li>Sentence case, present tense, no full stop.</li>
          <li>State what happened — avoid teasers and clickbait.</li>
          <li>Keep under roughly 80 characters where possible.</li>
        </ul>

        <h2>Names &amp; titles</h2>
        <p>
          Give a person&apos;s full name and relevant title on first reference,
          surname only thereafter. Verify the spelling of every name before
          publishing.
        </p>

        <h2>Numbers</h2>
        <ul>
          <li>Spell out one to nine; use numerals for 10 and above.</li>
          <li>Use figures for ages, percentages, and money.</li>
          <li>Round large numbers and give context (e.g. &ldquo;about 12,000&rdquo;).</li>
        </ul>

        <h2>Dates &amp; time</h2>
        <p>
          Use day-month-year. Localise time references and state the timezone
          when it matters. Avoid &ldquo;yesterday/today&rdquo; in evergreen
          copy.
        </p>

        <h2>Attribution</h2>
        <p>
          Attribute every claim of fact that isn&apos;t self-evident. Use
          &ldquo;said&rdquo; — it is neutral and invisible. Link to primary
          documents wherever they exist.
        </p>

        <h2>Sourcing &amp; corrections</h2>
        <p>
          Our verification standard lives in the{" "}
          <a href="/journalist-guidelines">journalism guidelines</a>; how we
          fix mistakes lives in the{" "}
          <a href="/corrections">corrections policy</a>.
        </p>
      </section>
    </article>
  );
}
