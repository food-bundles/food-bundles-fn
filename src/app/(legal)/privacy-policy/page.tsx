/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { LegalPage, LegalContent } from "@/components/legal-page";

const { SectionHeading, SubHeading, Paragraph, List } = LegalContent;

export const metadata = {
  title: "Privacy Policy | Food Bundles",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="This Privacy Policy explains how Food Bundles Limited collects, uses and protects your personal data when you use our platform."
      lastUpdated="August 13, 2026"
    >
      <SectionHeading>1. Overview</SectionHeading>
      <Paragraph>
        Food Bundles Limited ("Food Bundles", "we", "us" or "our") respects
        your privacy and is committed to protecting the personal data you
        provide when you register for, or use, our platform, whether online or
        through an authorized agent. This Privacy Policy describes the types of
        information we collect, how we use it, and the choices and rights you
        have in relation to that information.
      </Paragraph>
      <Paragraph>
        By registering for, or using, the Food Bundles platform you acknowledge
        that you have read and understood this Privacy Policy.
      </Paragraph>

      <SectionHeading>2. Information We Collect</SectionHeading>
      <SubHeading>2.1 Information you provide</SubHeading>
      <List
        items={[
          "Account details, such as your name, business name, email address, phone number, TIN and business type.",
          "Location information, including province, district, sector, cell and village.",
          "Payment information needed to process transactions securely. Card details are collected by our payment provider (Flutterwave) on their secure pages and are not stored by us. Payments on the platform may be made via Flutterwave (including card and mobile money), Paypack mobile money, voucher, or pre-paid (deposit), where offered.",
          "Communication with our support team, such as inquiries, feedback and correspondence.",
        ]}
      />

      <SubHeading>2.2 Information we collect automatically</SubHeading>
      <List
        items={[
          "Transaction and order records made through the platform.",
          "Technical information such as your IP address, browser type and device information, where needed for security and platform improvement.",
        ]}
      />

      <SectionHeading>3. How We Use Your Information</SectionHeading>
      <Paragraph>
        We collect and process your data solely for legitimate business
        purposes, including:
      </Paragraph>
      <List
        items={[
          "Account management, verification and authentication.",
          "Order placement, fulfilment, payment processing and delivery.",
          "Customer support and responding to your inquiries.",
          "Compliance with legal, regulatory and tax obligations, and the prevention of fraud and money laundering.",
          "Platform improvement, analytics and security.",
          "Sending service notifications and, where you have agreed, marketing communications.",
        ]}
      />

      <SectionHeading>4. Sharing of Information</SectionHeading>
      <Paragraph>
        We do not sell your personal data. We only share information where
        necessary to operate the platform, including:
      </Paragraph>
      <List
        items={[
          "Payment processors and financial service providers, such as Flutterwave and Paypack, to process transactions you initiate, including voucher and pre-paid (deposit) balances.",
          "Delivery and logistics partners, to the extent needed to fulfil your orders.",
          "Authorized agents and service providers acting on our behalf, under appropriate confidentiality obligations.",
          "Government or regulatory authorities, where required by law or for the prevention of fraud and money laundering.",
        ]}
      />

      <SectionHeading>5. Data Security</SectionHeading>
      <Paragraph>
        We implement reasonable technical and organizational security measures
        to protect your personal data from unauthorized access, use,
        alteration, disclosure or loss. Sensitive payment credentials are
        handled by our payment provider on secure, encrypted pages, and our
        staff access personal data only where necessary to perform their duties.
      </Paragraph>
      <Paragraph>
        While we take reasonable steps to safeguard your information, no method
        of transmission or storage is completely secure, and we cannot
        guarantee absolute security.
      </Paragraph>

      <SectionHeading>6. Data Retention</SectionHeading>
      <Paragraph>
        We retain your personal data for as long as necessary to provide the
        platform and services, comply with legal, accounting and tax
        obligations, resolve disputes and enforce our agreements. Transaction
        and financial records may be retained for the periods required by
        applicable law.
      </Paragraph>

      <SectionHeading>7. Your Rights</SectionHeading>
      <Paragraph>
        Subject to applicable law, you have the right to:
      </Paragraph>
      <List
        items={[
          "Access the personal data we hold about you.",
          "Correct or update inaccurate or incomplete information.",
          "Request deletion of your personal data, subject to legal and operational requirements.",
          "Object to, or request restrictions on, certain processing activities.",
          "Withdraw consent for marketing communications at any time.",
        ]}
      />
      <Paragraph>
        To exercise any of these rights, please contact us using the details
        below. We will respond within a reasonable timeframe and may require
        you to verify your identity before fulfilling your request.
      </Paragraph>

      <SectionHeading>8. Children&apos;s Privacy</SectionHeading>
      <Paragraph>
        Our platform is intended for businesses and individuals over the age of
        18. We do not knowingly collect personal data from children. If you
        believe a child has provided us with personal data, please contact us
        so we can take appropriate action.
      </Paragraph>

      <SectionHeading>9. Changes to This Policy</SectionHeading>
      <Paragraph>
        We may update this Privacy Policy from time to time. When we do, we
        will revise the "Last updated" date at the top of this page and, where
        appropriate, notify you through the platform or your registered contact
        details. Continued use of the platform after changes take effect
        constitutes acceptance of the updated policy.
      </Paragraph>

      <SectionHeading>10. Contact Us</SectionHeading>
      <Paragraph>
        If you have any questions or concerns about this Privacy Policy or how
        we handle your personal data, please contact us:
      </Paragraph>
      <List
        items={[
          <>
            Email: <span className="font-medium text-gray-900">info@food.rw</span>
          </>,
          <>
            Phone: <span className="font-medium text-gray-900">+250 788 963 267</span>
          </>,
          <>
            Address: <span className="font-medium text-gray-900">KG 5 Ave, Kigali, Rwanda</span>
          </>,
        ]}
      />
    </LegalPage>
  );
}
