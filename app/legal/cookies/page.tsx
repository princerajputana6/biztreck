import LegalLayout from "@/components/LegalLayout";

export const metadata = { title: "Cookie Policy · Biztreck Solutions" };

export default function Page() {
  return (
    <LegalLayout title="Cookie Policy" updated="May 2026">
      <p>
        This Cookie Policy explains how Biztreck Solutions uses cookies and
        similar technologies on our website.
      </p>

      <h2>1. What are cookies?</h2>
      <p>
        Cookies are small text files placed on your device when you visit a
        website. They help the site remember your preferences and improve your
        experience.
      </p>

      <h2>2. Categories we use</h2>
      <ul>
        <li><strong>Strictly necessary:</strong> required for core site features such as the admin session and security. These cannot be turned off.</li>
        <li><strong>Functional:</strong> remember preferences such as theme or recent forms.</li>
        <li><strong>Analytics:</strong> collect aggregated usage data to help us improve the site (subject to your consent where required).</li>
        <li><strong>Marketing:</strong> we currently do not run third-party advertising cookies on this site.</li>
      </ul>

      <h2>3. Managing cookies</h2>
      <p>
        Most browsers allow you to view, manage, delete, and block cookies.
        Disabling strictly necessary cookies may break parts of the site. For
        general help, see your browser&apos;s documentation.
      </p>

      <h2>4. Changes</h2>
      <p>
        We may update this Cookie Policy as our practices evolve. The latest
        version will always be available here.
      </p>

      <h2>5. Contact</h2>
      <p>
        Email <a href="mailto:connect@biztreck.world">connect@biztreck.world</a>{" "}
        for any cookie-related questions.
      </p>
    </LegalLayout>
  );
}
