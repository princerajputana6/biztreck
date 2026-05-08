import LegalLayout from "@/components/LegalLayout";

export const metadata = { title: "Data Processing Addendum · Biztreck Solutions" };

export default function Page() {
  return (
    <LegalLayout title="Data Processing Addendum" updated="May 2026">
      <p>
        This Data Processing Addendum (&quot;DPA&quot;) forms part of the agreement
        between Biztreck Solutions (&quot;Processor&quot;) and the Customer (&quot;Controller&quot;)
        and applies whenever Biztreck processes personal data on behalf of
        Customer.
      </p>

      <h2>1. Subject matter and duration</h2>
      <p>
        Biztreck processes personal data only to provide the services described
        in the relevant Statement of Work, for the duration of the engagement
        plus a reasonable period for return or deletion of data.
      </p>

      <h2>2. Nature and purpose of processing</h2>
      <p>
        Hosting, building, securing, and operating digital products on behalf
        of the Customer, including support and analytics where applicable.
      </p>

      <h2>3. Categories of data subjects and personal data</h2>
      <p>
        End-users of Customer&apos;s products and Customer&apos;s personnel. Typical
        categories include identifiers, contact info, and usage data; sensitive
        categories are processed only if explicitly agreed.
      </p>

      <h2>4. Processor obligations</h2>
      <ul>
        <li>Process personal data only on documented instructions from Controller.</li>
        <li>Ensure persons authorised to process data are bound by confidentiality.</li>
        <li>Implement appropriate technical and organisational measures.</li>
        <li>Assist Controller in responding to data subject requests.</li>
        <li>Notify Controller of personal data breaches without undue delay.</li>
        <li>Make available all information necessary to demonstrate compliance.</li>
      </ul>

      <h2>5. Sub-processors</h2>
      <p>
        Customer authorises Biztreck to engage sub-processors. Biztreck remains
        liable for sub-processors&apos; compliance with this DPA. A list of
        sub-processors is available on request, and Customer will be notified
        of material changes.
      </p>

      <h2>6. International transfers</h2>
      <p>
        Where personal data is transferred outside the EEA or UK, the parties
        rely on Standard Contractual Clauses and any required supplementary
        measures.
      </p>

      <h2>7. Audits</h2>
      <p>
        Once per year, with reasonable notice and at Customer&apos;s expense,
        Customer may audit Biztreck&apos;s compliance with this DPA.
      </p>

      <h2>8. Return or deletion of data</h2>
      <p>
        On termination, Biztreck will return or delete personal data within 60
        days, unless retention is required by law.
      </p>

      <h2>9. Contact</h2>
      <p>
        To execute a signed DPA, email{" "}
        <a href="mailto:connect@biztreck.world">connect@biztreck.world</a>.
      </p>
    </LegalLayout>
  );
}
