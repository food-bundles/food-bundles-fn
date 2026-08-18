import { LegalPage, LegalContent } from "@/components/legal-page";

const { SectionHeading, Paragraph, List } = LegalContent;

export const metadata = {
  title: "Terms & Conditions | Food Bundles",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      description="The user agreement governing your use of the Food Bundles platform."
      lastUpdated="August 13, 2026"
    >
      <SectionHeading>Executive Introduction</SectionHeading>
      <Paragraph>
        This User Agreement establishes a clear, transparent, and fair framework
        for all restaurants using the Food Bundles platform. By registering or
        signing up on the Food Bundles platform, you acknowledge that you have
        read, understood, and accepted the terms of this Agreement. Your
        continued use of the platform confirms your acceptance.
      </Paragraph>

      <SectionHeading>1. Purpose &amp; Scope</SectionHeading>
      <Paragraph>
        This Agreement governs the Restaurant&apos;s use of the Food Bundles platform
        for sourcing, ordering, and receiving delivery of fresh food and related
        products, including options for postpayment, instant payment, and
        subscription-based services.
      </Paragraph>

      <SectionHeading>2. Platform Access, Registration &amp; Packages</SectionHeading>
      <List
        items={[
          "Restaurants may register for a Food Bundles account online or through authorized agents.",
          "By default, all Restaurants are enrolled in the Freemium Package, which allows immediate purchase and payment for orders.",
          "Restaurants may upgrade to paid subscription packages, unlocking additional features such as order postpayment options and extended delivery benefits.",
          "Subscription packages, fees, and features are set independently by Food Bundles and may be updated at its sole discretion. Subscription fees are non-negotiable.",
        ]}
      />

      <SectionHeading>3. Order Placement, Payment, Receipt, Delivery, Return &amp; Acceptance</SectionHeading>
      <List
        items={[
          "Restaurants may place orders for fresh food and inventory using the Food Bundles platform.",
          "Payment can be made via available payment methods (mobile money, card, bank transfer, or other methods supported by Food Bundles).",
          "For Freemium Package users, payment must be made in full at the time of order placement.",
          "Food Bundles delivers orders to the Restaurant or designated address. Delivery is free for orders above 100,000 RWF or for Restaurants under a paid subscription package; otherwise, standard delivery charges may apply.",
        ]}
      />
      <Paragraph>
        Upon delivery, the Restaurant shall inspect the goods and confirm receipt
        by signing a delivery note or confirming electronically via the platform.
        Any defects, discrepancies, or issues must be reported and resolved at
        the time of delivery. Once confirmed, the order is deemed accepted and no
        claims for defects or discrepancies will be accepted thereafter.
      </Paragraph>

      <SectionHeading>4. Order Postpayment Option (Paid Subscription Only)</SectionHeading>
      <List
        items={[
          "Only available to Restaurants with an active subscription package that includes postpayment.",
          "Postpayment periods range from 7 to 30 days, as determined by Food Bundles for each approved order.",
          "No interest is charged for postpayment; eligibility is based on subscription status.",
          "Restaurants must request postpayment on each order; approval is at Food Bundles' sole discretion.",
          "Having a subscription with postpayment eligibility does not guarantee approval of every postpayment request.",
        ]}
      />

      <SectionHeading>5. Payment &amp; Settlement</SectionHeading>
      <List
        items={[
          "For postpayment orders, restaurants must settle the full invoiced amount within the period specified by Food Bundles (7 to 30 days from delivery/invoice date).",
          "Failure to pay within the agreed period may result in suspension of postpayment privileges and may be reported to the Credit Reference Bureau (CRB).",
          "All payments must be made using approved payment methods.",
        ]}
      />

      <SectionHeading>6. Anti-Fraud &amp; Anti-Money Laundering</SectionHeading>
      <List
        items={[
          "Restaurants agree not to use the Food Bundles platform for any unlawful, fraudulent, or money laundering activities.",
          "Food Bundles reserves the right to monitor transactions, suspend accounts, and report suspicious activity to relevant authorities.",
          "Restaurants must provide accurate information and cooperate with any verification or compliance checks.",
        ]}
      />

      <SectionHeading>7. Privacy &amp; Data Protection</SectionHeading>
      <List
        items={[
          "Food Bundles collects and processes Restaurant data solely for account management, order fulfillment, compliance, and customer support.",
          "Food Bundles implements reasonable security measures to protect Restaurant data from unauthorized access or misuse.",
          "Restaurants have the right to access, correct, or request deletion of their data, subject to legal and operational requirements.",
        ]}
      />

      <SectionHeading>8. Platform Use, Amendments &amp; Termination</SectionHeading>
      <List
        items={[
          "This Agreement is effective upon Restaurant's registration or first order and continues until terminated by either Party with notice, subject to settlement of outstanding obligations.",
          "Food Bundles may amend these terms, subscription packages, or platform features at any time, with notice to Users via the platform or registered contact details.",
          "Food Bundles may suspend or terminate access for violation of these terms or for compliance reasons.",
        ]}
      />

      <SectionHeading>9. Miscellaneous</SectionHeading>
      <List
        items={[
          "This Agreement constitutes the entire understanding between the Parties for platform use, order fulfillment, payment, and delivery.",
          "Any amendments must be in writing and acknowledged by both Parties, except for platform-wide updates communicated by Food Bundles.",
          "This Agreement is governed by the laws of the Republic of Rwanda.",
        ]}
      />
    </LegalPage>
  );
}
