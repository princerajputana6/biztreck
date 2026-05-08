import LegalLayout from "@/components/LegalLayout";

export const metadata = { title: "Terms of Service · Biztreck Solutions" };

export default function Page() {
  return (
    <LegalLayout title="Terms of Service" updated="May 2026">
      <p>
        These Terms of Service govern your access to and use of the Biztreck
        Solutions website and services. By using our site you agree to these
        terms.
      </p>

      <h2>1. Services</h2>
      <p>
        Biztreck provides website development and revamp, web and mobile app
        development, DevOps, SEO and growth, and end-to-end startup launch
        services. Specific deliverables, timelines, and payment terms are set
        out in individual Statements of Work.
      </p>

      <h2>2. Acceptance of orders</h2>
      <p>
        Orders are confirmed once a signed proposal or SOW and an initial
        payment are received. We reserve the right to refuse a project for any
        lawful reason.
      </p>

      <h2>3. Fees and payments</h2>
      <ul>
        <li>All fees are quoted in INR or USD as specified in the SOW and exclusive of taxes.</li>
        <li>Milestone payments are due within 7 days of invoice unless otherwise agreed.</li>
        <li>Late payments may incur interest of 1.5% per month or the maximum permitted by law.</li>
      </ul>

      <h2>4. Intellectual property</h2>
      <p>
        Upon full payment, all bespoke deliverables are assigned to the client,
        excluding (a) Biztreck pre-existing IP, (b) third-party open source, and
        (c) generic frameworks. Biztreck retains the right to display
        non-confidential project details in its portfolio unless otherwise
        agreed in writing.
      </p>

      <h2>5. Client responsibilities</h2>
      <ul>
        <li>Provide timely access to assets, accounts, and decision-makers.</li>
        <li>Ensure that materials provided to Biztreck do not infringe any third-party rights.</li>
        <li>Approve milestones within 5 business days; delays may shift the schedule.</li>
      </ul>

      <h2>6. Confidentiality</h2>
      <p>
        Both parties agree to keep confidential information confidential and to
        use it only for purposes of the engagement, for at least three years
        after termination.
      </p>

      <h2>7. Warranties and disclaimers</h2>
      <p>
        We will perform services with reasonable skill and care. To the maximum
        extent permitted by law, services are provided &quot;as is&quot; with no other
        warranties, express or implied.
      </p>

      <h2>8. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, our total liability for any
        claim is limited to the fees paid by you for the services giving rise
        to the claim in the 6 months preceding the claim. We are not liable for
        indirect, incidental, or consequential damages.
      </p>

      <h2>9. Termination</h2>
      <p>
        Either party may terminate an engagement for material breach not cured
        within 14 days of notice. Fees due for work completed up to termination
        remain payable.
      </p>

      <h2>10. Governing law &amp; jurisdiction</h2>
      <p>
        These terms are governed by the laws of India. Disputes are subject to
        the exclusive jurisdiction of the courts at Gautam Budh Nagar, Uttar
        Pradesh.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions about these terms? Email{" "}
        <a href="mailto:connect@biztreck.world">connect@biztreck.world</a>.
      </p>
    </LegalLayout>
  );
}
