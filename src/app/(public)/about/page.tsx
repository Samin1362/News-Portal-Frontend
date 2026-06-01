import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Deligo News",
  description:
    "Who we are, what we cover, and the standards behind Deligo News — an independent digital newsroom.",
};

export default function AboutPage() {
  return (
    <article className="max-w-[760px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <header className="border-b-[1.5px] border-ink pb-6 mb-8">
        <p className="font-hand text-[12px] uppercase tracking-[0.12em] text-muted">
          About us
        </p>
        <h1 className="serif text-[32px] sm:text-[42px] font-extrabold tracking-tight leading-[1.05] mt-2">
          About Deligo News
        </h1>
        <p className="mt-3 font-sans text-[14px] text-ink/85">
          An independent digital newsroom covering politics, world affairs,
          business, sport, technology, and culture.
        </p>
      </header>

      <section className="prose-deligo serif text-[16.5px] leading-[1.7] text-ink">
        <h2>Our mission</h2>
        <p>
          Deligo News exists to give readers reliable, verifiable, and clearly
          attributed reporting. We believe a healthy public square depends on
          journalism that explains not just what happened, but how we know it.
        </p>

        <h2>What we cover</h2>
        <p>
          Our reporters and contributing journalists publish across ten core
          sections — National, Politics, International, Business, Sports,
          Entertainment, Technology, Lifestyle, Health, and Education — with
          breaking coverage, in-depth features, video, and photo essays.
        </p>

        <h2>How we work</h2>
        <p>
          Every article on Deligo is written by a verified journalist and
          reviewed by an editor before it reaches readers. Our reporting
          standards — sourcing, verification, corrections, and conflicts of
          interest — are published in full in our{" "}
          <a href="/journalist-guidelines">journalism guidelines</a>.
        </p>

        <h2>Independence</h2>
        <p>
          Deligo is editorially independent. Advertising and sponsored content
          are always clearly labelled and never influence our newsroom&apos;s
          coverage decisions.
        </p>

        <h2>Get in touch</h2>
        <p>
          Story tips, feedback, and press enquiries are welcome on our{" "}
          <a href="/contact">contact page</a>. Spotted an error? See our{" "}
          <a href="/corrections">corrections policy</a>.
        </p>
      </section>
    </article>
  );
}
