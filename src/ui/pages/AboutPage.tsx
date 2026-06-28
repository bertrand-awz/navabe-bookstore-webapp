import { Link } from "react-router-dom";

const mailhogUrl = "https://mailhog.navabe.bertawz.dev";
const mailhogUsername = "navabe-demo";
const mailhogPassword = "8SFwlh2m6NE3TA74y6Q9K2ABlSOIBaeC";

const readmeHeadingClass =
  "border-b border-line pb-3 font-display text-3xl leading-tight font-semibold text-ink dark:border-[#514c44] dark:text-[#f2eee4]";

const readmeParagraphClass = "leading-7 text-ink/80 dark:text-[#d9d1c3]";

const readmeLinkClass = "font-bold text-brand hover:text-brand-dark dark:text-[#93b7a0] dark:hover:text-[#b4d4bd]";

const readmeCodeBlockClass =
  "overflow-x-auto border border-line bg-paper p-4 font-mono text-sm leading-7 text-ink dark:border-[#514c44] dark:bg-[#181c18] dark:text-[#f2eee4]";

export function AboutPage() {
  return (
    <section className="mx-auto max-w-3xl py-8">
      <article className="mx-auto">
        <header className="mb-10 border-b border-line pb-8 dark:border-[#514c44]">
          <h1 className="mb-5 font-display text-5xl leading-[0.95] font-semibold text-ink dark:text-[#f2eee4]">
            About Navabe Bookstore
          </h1>
          <p className="text-lg leading-8 text-ink/80 dark:text-[#d9d1c3]">
            Navabe Bookstore is a demonstration ecommerce site for browsing books,
            creating customer accounts, receiving transactional emails, placing
            sandbox orders and managing the catalog.
          </p>
        </header>

        <div className="grid gap-10">
          <section className="grid gap-4">
            <h2 className={readmeHeadingClass}>Use demonstration data only</h2>
            <p className={readmeParagraphClass}>
              Please do not use a real email address or personal information. Use
              disposable test values while you explore the account flows. Here's some examples:
            </p>
            <ul className="list-disc space-y-2 pl-6 leading-7 text-ink/80 dark:text-[#d9d1c3]">
              <li>test@test.ca</li>
              <li>reader@example.com</li>
              <li>Any other fake inbox you prefer.</li>
            </ul>
          </section>

          <section className="grid gap-4">
            <h2 className={readmeHeadingClass}>Where emails go</h2>
            <p className={readmeParagraphClass}>
              Transactional emails are captured by MailHog instead of being
              delivered to a real mailbox. After signing up, changing a password or
              requesting account recovery, open{" "}
              <a className={readmeLinkClass} href={mailhogUrl} target="_blank" rel="noreferrer">
                MailHog
              </a>{" "}
              to inspect the messages sent to the test user.
            </p>
            <pre className={readmeCodeBlockClass} aria-label="MailHog credentials">
              <code>
                <strong className="font-bold lowercase">url</strong>: {mailhogUrl}
                {"\n"}
                <strong className="font-bold lowercase">username</strong>: {mailhogUsername}
                {"\n"}
                <strong className="font-bold lowercase">password</strong>: {mailhogPassword}
              </code>
            </pre>
          </section>

          <section className="grid gap-4">
            <h2 className={readmeHeadingClass}>Root administrator access</h2>
            <p className={readmeParagraphClass}>
              The management portal is available from the navigation bar. The database
              migration creates the root administrator below on each scripted start.
              To access it, use Forgot password? with the root email, then open
              MailHog to copy the temporary password and replace it after signing in.
            </p>
            <pre className={readmeCodeBlockClass} aria-label="Root administrator credentials">
              <code><strong className="font-bold lowercase">manager id</strong>: RTMGM1{"\n"}<strong className="font-bold lowercase">email</strong>: root.manager@test.navabe.bertawz.dev</code>
            </pre>
            <p className={readmeParagraphClass}>
              <Link className={readmeLinkClass} to="/management">
                Open Management Portal
              </Link>
            </p>
          </section>

          <section className="grid gap-4">
            <h2 className={readmeHeadingClass}>PayPal sandbox</h2>
            <p className={readmeParagraphClass}>
              PayPal runs in sandbox mode for this demonstration. No real payment
              is captured and no real charge is applied. You can stop before
              completing the PayPal flow, or skip checkout entirely if you prefer
              not to interact with PayPal.
            </p>
          </section>

          <section className="grid gap-4">
            <h2 className={readmeHeadingClass}>Public demo reminder</h2>
            <p className={readmeParagraphClass}>
              Treat this site as a public demo environment. Data can be reset,
              shared test inboxes can be inspected by other visitors, and nothing
              entered here should be considered private production data.
            </p>
          </section>
        </div>
      </article>
    </section>
  );
}
