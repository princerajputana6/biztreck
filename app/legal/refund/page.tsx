import LegalLayout from "@/components/LegalLayout";

export const metadata = { title: "Refund Policy · Biztreck Solutions" };

export default function Page() {
  return (
    <LegalLayout title="Refund Policy" updated="May 2026">
      <p>
        We work hard to make every Biztreck engagement a success. This policy
        explains when and how refunds may apply.
      </p>

      <h2>1. Custom services</h2>
      <p>
        Most of our work is bespoke development, design, DevOps, or marketing
        carried out under a Statement of Work with milestone-based billing.
        Because each milestone reflects effort already delivered, milestone
        payments are non-refundable once the milestone has been accepted.
      </p>

      <h2>2. Project kickoff fees</h2>
      <p>
        The initial kickoff fee covers discovery, planning and resource
        allocation. If you cancel before kickoff begins, the kickoff fee is
        refundable minus a 10% administrative charge. After kickoff begins, it
        is non-refundable.
      </p>

      <h2>3. Subscriptions and retainers</h2>
      <p>
        Monthly retainers (DevOps support, SEO, maintenance) can be cancelled
        with 30 days&apos; notice. Fees for the current billing cycle are not
        refunded; access continues until the cycle ends.
      </p>

      <h2>4. Issues with deliverables</h2>
      <p>
        If a deliverable does not meet the SOW, notify us in writing within 14
        days of delivery. We will revise the work at no extra charge until it
        meets the agreed acceptance criteria.
      </p>

      <h2>5. How to request a refund</h2>
      <p>
        Email <a href="mailto:connect@biztreck.world">connect@biztreck.world</a>{" "}
        with your invoice reference and reason. Approved refunds are processed
        within 14 business days to the original payment method.
      </p>

      <h2>6. Exceptions</h2>
      <p>
        Third-party costs incurred on your behalf (domains, ads, paid plugins,
        cloud services) are non-refundable.
      </p>
    </LegalLayout>
  );
}
