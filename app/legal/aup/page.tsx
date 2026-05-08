import LegalLayout from "@/components/LegalLayout";

export const metadata = { title: "Acceptable Use Policy · Biztreck Solutions" };

export default function Page() {
  return (
    <LegalLayout title="Acceptable Use Policy" updated="May 2026">
      <p>
        This Acceptable Use Policy (&quot;AUP&quot;) describes prohibited uses of the
        Biztreck Solutions website and services. By using our services you
        agree not to engage in any of the activities below.
      </p>

      <h2>1. Prohibited activities</h2>
      <ul>
        <li>Posting unlawful, defamatory, harassing, infringing, or hateful content.</li>
        <li>Distributing malware, ransomware, viruses, or any malicious code.</li>
        <li>Attempting to gain unauthorised access to any system or data.</li>
        <li>Interfering with the integrity or performance of our infrastructure.</li>
        <li>Sending unsolicited bulk email or other spam.</li>
        <li>Using our services to violate any applicable law or third-party rights.</li>
      </ul>

      <h2>2. Content responsibility</h2>
      <p>
        You are solely responsible for content you submit through forms,
        comments, or applications. We may remove content that violates this
        policy at our sole discretion.
      </p>

      <h2>3. Reporting abuse</h2>
      <p>
        If you become aware of any violation of this AUP, please report it to{" "}
        <a href="mailto:connect@biztreck.world">connect@biztreck.world</a>. We
        investigate every report.
      </p>

      <h2>4. Enforcement</h2>
      <p>
        Violations may result in warning, suspension, termination, or referral
        to law enforcement, depending on severity.
      </p>
    </LegalLayout>
  );
}
