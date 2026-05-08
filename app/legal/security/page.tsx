import LegalLayout from "@/components/LegalLayout";

export const metadata = { title: "Security & Compliance · Biztreck Solutions" };

export default function Page() {
  return (
    <LegalLayout title="Security & Compliance" updated="May 2026">
      <p>
        Biztreck Solutions takes security seriously. This page summarises the
        controls we operate across our company, infrastructure, and delivery
        process.
      </p>

      <h2>1. Organisational controls</h2>
      <ul>
        <li>Background-checked, vetted senior team.</li>
        <li>NDA-first engagements; access on a need-to-know basis.</li>
        <li>Annual security awareness training.</li>
        <li>Documented information-security policies and incident response runbooks.</li>
      </ul>

      <h2>2. Infrastructure</h2>
      <ul>
        <li>All production workloads run on tier-1 cloud providers (AWS, GCP, Azure).</li>
        <li>Encryption in transit (TLS 1.2+) and at rest (AES-256).</li>
        <li>Network segmentation, private subnets, and least-privilege IAM.</li>
        <li>Centralised logging, monitoring, and alerting.</li>
      </ul>

      <h2>3. Application security</h2>
      <ul>
        <li>Secure SDLC with code review, dependency scanning, and SAST.</li>
        <li>Secrets stored in managed vaults — never in source control.</li>
        <li>OWASP Top-10 controls baked into every project template.</li>
        <li>Regular penetration tests on flagship deliverables.</li>
      </ul>

      <h2>4. Data handling</h2>
      <ul>
        <li>Customer data is logically isolated and access-controlled.</li>
        <li>Backups are encrypted and tested for restoration.</li>
        <li>Retention and deletion follow the relevant DPA and applicable law.</li>
      </ul>

      <h2>5. Incident response</h2>
      <p>
        We maintain a documented incident response process. In the event of a
        confirmed breach affecting customer data, we notify the customer
        without undue delay (typically within 72 hours).
      </p>

      <h2>6. Compliance posture</h2>
      <p>
        We design our processes to align with ISO/IEC 27001 and SOC 2 control
        objectives, and support customers&apos; obligations under GDPR, India&apos;s
        DPDP Act, and HIPAA where applicable.
      </p>

      <h2>7. Reporting a vulnerability</h2>
      <p>
        Found a security issue? Email{" "}
        <a href="mailto:connect@biztreck.world">connect@biztreck.world</a>{" "}
        with the subject line &quot;Security Disclosure&quot;. We acknowledge reports
        within 2 business days.
      </p>
    </LegalLayout>
  );
}
