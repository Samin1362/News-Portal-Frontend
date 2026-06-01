import type { Metadata } from "next";

const EFFECTIVE = "2026-05-01";

export const metadata: Metadata = {
  title: "Privacy Policy — Deligo News",
  description:
    "How Deligo News collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <article className="max-w-[760px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <header className="border-b-[1.5px] border-ink pb-6 mb-8">
        <p className="font-hand text-[12px] uppercase tracking-[0.12em] text-muted">
          Legal
        </p>
        <h1 className="serif text-[32px] sm:text-[42px] font-extrabold tracking-tight leading-[1.05] mt-2">
          Privacy policy
        </h1>
        <p className="mt-3 font-sans text-[14px] text-ink/85">
          In effect from {EFFECTIVE}. This policy explains what we collect and
          why.
        </p>
      </header>

      <section className="prose-deligo serif text-[16.5px] leading-[1.7] text-ink">
        <h2>1. What we collect</h2>
        <ul>
          <li>
            <strong>Account data</strong> — when you register, we store your
            name, email address, and authentication identifiers through our
            sign-in provider.
          </li>
          <li>
            <strong>Content you submit</strong> — comments, role-change
            applications, and (for journalists) articles and media you upload.
          </li>
          <li>
            <strong>Usage data</strong> — basic, aggregated metrics such as
            article view counts. We do not sell personal data.
          </li>
        </ul>

        <h2>2. How we use it</h2>
        <p>
          We use your information to operate your account, publish and moderate
          content, prevent abuse, and improve the service. We process article
          view counts in aggregate to surface trending and popular stories.
        </p>

        <h2>3. Authentication &amp; third parties</h2>
        <p>
          Sign-in is handled by our authentication provider, and uploaded media
          is stored with our image host. These providers process data on our
          behalf under their own terms. We do not share your personal data with
          advertisers; ads are served by placement, not by tracking you.
        </p>

        <h2>4. Cookies</h2>
        <p>
          We use only the cookies and local storage needed to keep you signed
          in and to remember your interface preferences (such as your sidebar
          state). We do not use third-party advertising cookies.
        </p>

        <h2>5. Your rights</h2>
        <p>
          You may access, correct, or delete your account data at any time from
          your <a href="/dashboard/profile">profile</a>, or by emailing{" "}
          <a href="mailto:privacy@deligo.news">privacy@deligo.news</a>. We will
          respond to verified requests within a reasonable period.
        </p>

        <h2>6. Changes</h2>
        <p>
          We may update this policy as the service evolves. Material changes
          will be reflected in the effective date above.
        </p>
      </section>
    </article>
  );
}
