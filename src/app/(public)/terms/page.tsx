import type { Metadata } from "next";

const EFFECTIVE = "2026-05-01";

export const metadata: Metadata = {
  title: "Terms of Service — Deligo News",
  description:
    "The terms that govern your use of Deligo News, including accounts, content, and conduct.",
};

export default function TermsPage() {
  return (
    <article className="max-w-[760px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <header className="border-b-[1.5px] border-ink pb-6 mb-8">
        <p className="font-hand text-[12px] uppercase tracking-[0.12em] text-muted">
          Legal
        </p>
        <h1 className="serif text-[32px] sm:text-[42px] font-extrabold tracking-tight leading-[1.05] mt-2">
          Terms of service
        </h1>
        <p className="mt-3 font-sans text-[14px] text-ink/85">
          In effect from {EFFECTIVE}. By using Deligo News you agree to these
          terms.
        </p>
      </header>

      <section className="prose-deligo serif text-[16.5px] leading-[1.7] text-ink">
        <h2>1. Your account</h2>
        <p>
          You are responsible for activity under your account and for keeping
          your credentials secure. You must provide accurate information and be
          old enough to form a binding agreement in your jurisdiction.
        </p>

        <h2>2. Acceptable use</h2>
        <ul>
          <li>Don&apos;t post unlawful, defamatory, or harassing content.</li>
          <li>Don&apos;t impersonate others or misrepresent affiliations.</li>
          <li>
            Don&apos;t attempt to disrupt, scrape at scale, or circumvent the
            security of the service.
          </li>
        </ul>
        <p>
          We may suspend or remove accounts and content that breach these
          terms. Comment and publishing privileges can be restricted by
          moderators and administrators.
        </p>

        <h2>3. Content you submit</h2>
        <p>
          You retain ownership of what you submit. By posting, you grant Deligo
          a non-exclusive licence to host, display, and distribute that content
          on the platform. Journalists additionally agree to our{" "}
          <a href="/journalist-guidelines">journalism guidelines</a>.
        </p>

        <h2>4. Advertising</h2>
        <p>
          Advertising and sponsored placements are clearly labelled. Deligo is
          not responsible for the content of third-party advertisements or the
          sites they link to.
        </p>

        <h2>5. No warranty &amp; liability</h2>
        <p>
          The service is provided &ldquo;as is.&rdquo; To the fullest extent
          permitted by law, Deligo is not liable for indirect or consequential
          damages arising from your use of the service.
        </p>

        <h2>6. Changes</h2>
        <p>
          We may revise these terms; continued use after changes take effect
          constitutes acceptance. Questions? Email{" "}
          <a href="mailto:legal@deligo.news">legal@deligo.news</a>.
        </p>
      </section>
    </article>
  );
}
