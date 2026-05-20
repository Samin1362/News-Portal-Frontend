import type { Metadata } from "next";

const GUIDELINES_VERSION = "v1";
const GUIDELINES_EFFECTIVE = "2026-05-01";

export const metadata: Metadata = {
  title: "Journalism guidelines — Deligo News",
  description:
    "How we report, source, and review the news at Deligo. Every journalist who publishes here agrees to these guidelines.",
};

/**
 * Public, no-login-required guidelines page. Linked from:
 *  - reader dashboard `/dashboard/become-journalist` (agreement checkbox).
 *  - admin portal `/people/role-requests/[id]` (verification context).
 *  - footer "Editorial standards" link (future).
 *
 * The version string at the top of the page is pinned to
 * `JOURNALIST_GUIDELINES_VERSION` on the backend — when we ship a new doc,
 * bump both so pending applications stay anchored to the version they
 * accepted.
 */
export default function JournalistGuidelinesPage() {
  return (
    <article className="max-w-[760px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <header className="border-b-[1.5px] border-ink pb-6 mb-8">
        <p className="font-hand text-[12px] uppercase tracking-[0.12em] text-muted">
          Editorial standards
        </p>
        <h1 className="serif text-[32px] sm:text-[42px] font-extrabold tracking-tight leading-[1.05] mt-2">
          Deligo journalism guidelines
        </h1>
        <p className="mt-3 font-sans text-[14px] text-ink/85">
          Version <strong>{GUIDELINES_VERSION}</strong> · in effect from{" "}
          {GUIDELINES_EFFECTIVE}. By applying to write for Deligo News, you
          agree to the practices below. Every published article is reviewed
          against them.
        </p>
      </header>

      <section className="prose-deligo serif text-[16.5px] leading-[1.7] text-ink">
        <h2>1. Our promise to readers</h2>
        <p>
          Deligo News exists to give readers reliable, verifiable, and clearly
          attributed reporting. Every journalist on the platform is expected
          to put the reader&apos;s right to know — and right to know how we
          know it — ahead of speed, traffic, and convenience.
        </p>

        <h2>2. Verification before publication</h2>
        <p>
          Information is published only after independent verification.
          That means:
        </p>
        <ul>
          <li>
            At least <strong>two named, on-the-record sources</strong> for any
            non-trivial claim of fact, or one source plus a primary document
            we can link.
          </li>
          <li>
            Quoted material is verified verbatim. We do not silently correct
            grammar in attributed quotes — note any edits with{" "}
            <code>[sic]</code> or square brackets.
          </li>
          <li>
            AI-assisted research is allowed; AI-generated text published as
            our own reporting is not. If a model produced any portion of the
            piece, disclose it in the editor&apos;s note.
          </li>
        </ul>

        <h2>3. Sourcing & attribution</h2>
        <ul>
          <li>
            Named sources are the default. Anonymous sources are allowed only
            when (a) the information is materially in the public interest,
            (b) we cannot get it on the record, and (c) the desk editor
            approves. Describe the source as specifically as possible without
            identifying them.
          </li>
          <li>
            Quote at length where the source&apos;s voice matters. Avoid
            paraphrasing in a way that smooths over their actual position.
          </li>
          <li>
            Link to primary documents (court filings, datasets, originals)
            when permitted. Where we cannot link the original, we host a
            redacted copy and explain the redactions.
          </li>
        </ul>

        <h2>4. Conflicts of interest</h2>
        <p>
          Disclose financial, political, and personal interests that a
          reasonable reader would want to know. If you are reporting on an
          organisation you or a close family member have worked for in the
          last five years, declare it to the desk and disclose it in the
          piece. We do not accept paid placements presented as journalism.
        </p>

        <h2>5. Corrections & accountability</h2>
        <ul>
          <li>
            Corrections are issued promptly — typically within four hours of
            confirming an error during business hours, and at the earliest
            reasonable time outside them.
          </li>
          <li>
            We mark corrections at the top of the article (not silently).
            Significant rewrites are timestamped.
          </li>
          <li>
            Take-down requests are reviewed by the desk; we do not remove
            true reporting under pressure, but we will anonymise sources or
            redact identifying details where harm is documented.
          </li>
        </ul>

        <h2>6. Plagiarism & content integrity</h2>
        <p>
          Words and original framing belong to the person who wrote them.
          Quoting more than a sentence requires attribution; using another
          publication&apos;s reporting as the basis for your own requires
          credit even when you re-report and verify. Visuals (photos, charts,
          video) must be licensed, captured by you, or in the public domain.
        </p>

        <h2>7. Comments, harassment, & safety</h2>
        <p>
          Journalists are not expected to read every comment, but flagging
          credible threats or coordinated harassment to the moderation team
          is part of the role. We block accounts that target reporters with
          personal attacks unrelated to the work. Stay polite in replies; the
          byline carries the publication&apos;s name.
        </p>

        <h2>8. Working with editors</h2>
        <ul>
          <li>
            Submit drafts before the deadline you committed to. Late drafts
            without notice land on the next day&apos;s desk.
          </li>
          <li>
            Editors may request changes for clarity, length, sourcing, or
            tone. Substantive changes to your framing are discussed; we
            don&apos;t silently rewrite your argument.
          </li>
          <li>
            Rejected pieces come back with notes. You can rework and
            resubmit, or pitch a different angle.
          </li>
        </ul>

        <h2>9. Privacy & personal data</h2>
        <p>
          We do not publish private addresses, phone numbers, or personal
          identifiers unless it is materially relevant and proportionate. We
          do not dox. Children are not named in stories about their
          parents&apos; conduct unless the family is the subject of the
          story and the family has consented.
        </p>

        <h2>10. Breaking these guidelines</h2>
        <p>
          A first breach is a conversation with the desk. A pattern, or a
          single severe breach (fabrication, plagiarism, undisclosed conflict
          of interest, knowingly publishing false information), is grounds
          for revocation of the journalist seat and removal of the
          contributor history from the public byline pages.
        </p>

        <h2>Questions?</h2>
        <p>
          Email{" "}
          <a href="mailto:editors@deligo.news" className="text-accent">
            editors@deligo.news
          </a>{" "}
          before you apply if anything in this document is unclear. We are
          happy to discuss specific situations.
        </p>
      </section>

      <footer className="mt-10 pt-6 border-t border-ink/10">
        <p className="font-hand text-[11px] text-muted">
          These guidelines are revised on an as-needed basis. Major revisions
          publish a new version string; pending applications remain bound to
          the version they accepted.
        </p>
      </footer>
    </article>
  );
}
