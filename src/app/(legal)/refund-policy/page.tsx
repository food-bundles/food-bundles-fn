import React from "react";
import { LegalPage, LegalContent } from "@/components/legal-page";
import { Wallet, RefreshCcw, ShieldCheck, Clock, Mail, Phone } from "lucide-react";

const { SectionHeading, SubHeading, Paragraph, List } = LegalContent;

export const metadata = {
  title: "Refund Policy | Food Bundles",
};

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund Policy"
      description="This Refund Policy explains when and how refunds are issued on the Food Bundles platform, and how refunded amounts are returned to you."
      lastUpdated="August 13, 2026"
    >
      <SectionHeading>1. Overview</SectionHeading>
      <Paragraph>
        Food Bundles is committed to a fair and transparent refund process.
        Refunds are issued by{" "}
        <span className="font-medium text-gray-900">
          topping up the refunded amount to your Food Bundles wallet balance
        </span>
        . Once approved, the wallet top-up is processed within{" "}
        <span className="font-medium text-gray-900">7 days</span>. Refunds are
        recorded in your transaction history so you can always see what has
        been returned to you.
      </Paragraph>

      <SectionHeading>2. When Can I Request a Refund?</SectionHeading>
      <SubHeading>2.1 Report at delivery</SubHeading>
      <Paragraph>
        You must report any refund issue{" "}
        <span className="font-medium text-gray-900">
          immediately upon delivery, while our logistics staff are still
          present
        </span>{" "}
        at your location. If the issue is not reported at the time of delivery,
        you will not be able to report a refund for that order.
      </Paragraph>

      <SubHeading>2.2 Quality issues on delivery</SubHeading>
      <List
        items={[
          "You must report quality issues immediately at the time of delivery, while our logistics staff are still present.",
          "We will arrange pickup where applicable and provide a full refund or replacement.",
          "If products do not match the promised quality or specification and are identified at delivery, affected products will be replaced, returned, or the value credited to your account, as determined by Food Bundles.",
        ]}
      />

      <SubHeading>2.3 Damaged items</SubHeading>
      <Paragraph>
        Report damaged items immediately upon delivery, before our logistics
        staff leave. We will provide an immediate replacement or a full refund
        at no cost to you.
      </Paragraph>

      <SectionHeading>3. How Refunds Are Issued</SectionHeading>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <Wallet className="h-5 w-5 text-green-700" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            Topped up to your wallet balance
          </h3>
          <p className="mt-1 text-sm text-gray-600 leading-relaxed">
            Approved refunds are topped up to your Food Bundles wallet/account
            balance and become available for future orders and top-ups.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <Clock className="h-5 w-5 text-green-700" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            Processing time up to 7 days
          </h3>
          <p className="mt-1 text-sm text-gray-600 leading-relaxed">
            Refunded amounts are topped up to your wallet within 7 days of
            approval.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <RefreshCcw className="h-5 w-5 text-green-700" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            Recorded as a REFUND transaction
          </h3>
          <p className="mt-1 text-sm text-gray-600 leading-relaxed">
            Every refund is recorded in your transaction history as a REFUND,
            keeping your account records accurate and transparent.
          </p>
        </div>
      </div>

      <SectionHeading>4. What Refunds Do Not Cover</SectionHeading>
      <List
        items={[
          "Issues not reported at the time of delivery while our logistics staff were still present.",
          "Products that were accepted at delivery and are no longer unused or unopened.",
          "Issues reported after our logistics staff have left the delivery location.",
          "Losses caused by misuse, negligence or failure to follow storage or handling instructions.",
          "Refund requests for the same order or item where a refund has already been issued, to prevent duplicate refunds.",
        ]}
      />

      <SectionHeading>5. How to Request a Refund</SectionHeading>
      <Paragraph>
        To initiate a refund request, report the issue to our logistics staff
        at the time of delivery, or contact our support team with your order
        details:
      </Paragraph>
      <List
        items={[
          <>
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-green-700" /> Phone / WhatsApp:
            </span>{" "}
            <span className="font-medium text-gray-900">+250 796 897 823</span>
          </>,
          <>
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-green-700" /> Email:
            </span>{" "}
            <span className="font-medium text-gray-900">sales@food.rw</span>
          </>,
        ]}
      />
      <Paragraph>
        Please include your order number, the items concerned and the reason
        for the request. We will review your request and confirm the outcome
        within a reasonable timeframe.
      </Paragraph>

      <SectionHeading>6. Contact for Further Questions</SectionHeading>
      <div className="rounded-lg border border-green-100 bg-green-50 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-700" />
          <div>
            <p className="text-sm text-gray-800 leading-relaxed">
              If you have any questions about this Refund Policy or a refund
              request, please contact us at{" "}
              <span className="font-medium text-gray-900">sales@food.rw</span>{" "}
              or call{" "}
              <span className="font-medium text-gray-900">+250 796 897 823</span>.
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
              <Clock className="h-3.5 w-3.5" /> Business hours: Mon-Fri,
              9am - 6pm
            </p>
          </div>
        </div>
      </div>
    </LegalPage>
  );
}
