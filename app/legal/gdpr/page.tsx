import LegalLayout from "@/components/LegalLayout";

export const metadata = { title: "GDPR Compliance · Biztreck Solutions" };

export default function Page() {
  return (
    <LegalLayout title="GDPR Compliance" updated="May 2026">
      <p>
        Biztreck Solutions is committed to protecting personal data of users in
        the European Economic Area (EEA) and the United Kingdom in line with
        the EU General Data Protection Regulation (Regulation (EU) 2016/679)
        and the UK GDPR.
      </p>

      <h2>1. Roles</h2>
      <p>
        For personal data we collect through this website (e.g. contact and
        career applications), Biztreck acts as the data <strong>controller</strong>.
        When we process personal data on behalf of clients as part of services,
        we act as a <strong>processor</strong> bound by the relevant Data
        Processing Addendum.
      </p>

      <h2>2. Lawful basis</h2>
      <ul>
        <li><strong>Consent</strong> — for newsletter and optional analytics.</li>
        <li><strong>Contract</strong> — to deliver services you request.</li>
        <li><strong>Legitimate interests</strong> — to operate, secure, and improve our business.</li>
        <li><strong>Legal obligation</strong> — where required by law.</li>
      </ul>

      <h2>3. Your rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>Access the personal data we hold about you.</li>
        <li>Request rectification of inaccurate data.</li>
        <li>Request deletion (&quot;right to be forgotten&quot;).</li>
        <li>Restrict or object to processing.</li>
        <li>Receive your data in a portable format.</li>
        <li>Withdraw consent at any time.</li>
        <li>Lodge a complaint with your local supervisory authority.</li>
      </ul>

      <h2>4. International transfers</h2>
      <p>
        Where data is transferred outside the EEA or UK, we rely on Standard
        Contractual Clauses and additional safeguards as required.
      </p>

      <h2>5. Sub-processors</h2>
      <p>
        We use a limited set of vetted sub-processors (cloud hosting, email
        delivery, AI providers). A current list is available on request.
      </p>

      <h2>6. Data Protection Officer</h2>
      <p>
        For GDPR matters, contact our DPO at{" "}
        <a href="mailto:connect@biztreck.world">connect@biztreck.world</a>{" "}
        with the subject line &quot;GDPR Request&quot;.
      </p>
    </LegalLayout>
  );
}
