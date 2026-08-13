import React from "react";
import { LegalPage, LegalContent } from "@/components/legal-page";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
} from "lucide-react";

const { SectionHeading, Paragraph, List } = LegalContent;

export const metadata = {
  title: "About Us | Food Bundles",
};

const companyFacts = [
  { icon: Building2, label: "Company", value: "Food Bundles Limited (TIN 112265383), incorporated in Rwanda" },
  { icon: Globe, label: "Website", value: "www.food.rw" },
  { icon: MapPin, label: "Address", value: "KG 5 Ave, Kigali, Rwanda" },
  { icon: Phone, label: "Phone", value: "+250 788 963 267" },
  { icon: Mail, label: "Email", value: "info@food.rw" },
  { icon: Users, label: "Who we serve", value: "Restaurants, hotels, farmers and food businesses across Rwanda" },
];

export default function AboutPage() {
  return (
    <LegalPage
      title="About Us"
      description="Learn about Food Bundles — the platform connecting restaurants with local farms for fresh, quality ingredients."
      lastUpdated="August 13, 2026"
    >
      <SectionHeading>Who We Are</SectionHeading>
      <Paragraph>
        Food Bundles is a technology platform that connects restaurants and
        hotels with local farms and trusted suppliers, enabling them to source
        fresh, quality food ingredients efficiently. We are a Rwandan company
        committed to strengthening the food supply chain by bridging the gap
        between producers and the hospitality industry.
      </Paragraph>
      <Paragraph>
        Through our platform, restaurants can browse products, place orders,
        track deliveries in real time, manage their inventory and settle
        payments securely using supported payment methods. Farmers gain access
        to a wider market and a more predictable demand for their produce.
      </Paragraph>

      <SectionHeading>Our Mission</SectionHeading>
      <Paragraph>
        Our mission is to make it simple, fast and reliable for food businesses
        to get the ingredients they need, while supporting local farmers and
        promoting sustainability in the food supply chain. We aim to reduce
        waste, improve efficiency and help every business we serve grow.
      </Paragraph>

      <SectionHeading>What We Offer</SectionHeading>
      <List
        items={[
          <>
            <span className="font-medium text-gray-900">Fresh product sourcing:</span>{" "}
            a marketplace of fresh produce and food products from vetted local
            suppliers.
          </>,
          <>
            <span className="font-medium text-gray-900">Real-time order tracking:</span>{" "}
            full visibility into the status of your orders from placement to
            delivery.
          </>,
          <>
            <span className="font-medium text-gray-900">Simple inventory management:</span>{" "}
            tools that help you keep your kitchen stocked and your business
            running.
          </>,
          <>
            <span className="font-medium text-gray-900">Flexible payments:</span>{" "}
            secure payment options including mobile money, card, bank transfer
            and, for qualifying businesses, approved credit by voucher or
            subscription.
          </>,
        ]}
      />

      <SectionHeading>Who We Serve</SectionHeading>
      <Paragraph>
        We serve restaurants and hotels of all sizes, from independent
        eateries to large hospitality groups, as well as farmers and
        aggregators who supply the fresh produce our customers depend on. By
        bringing all of these partners onto one platform, we make the food
        supply chain more transparent, efficient and trustworthy.
      </Paragraph>

      <SectionHeading>Company Information</SectionHeading>
      <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {companyFacts.map((fact) => {
            const Icon = fact.icon;
            return (
              <li
                key={fact.label}
                className="flex items-start gap-3 px-4 sm:px-5 py-3.5"
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-green-700" />
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    {fact.label}
                  </p>
                  <p className="text-sm text-gray-800">{fact.value}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <SectionHeading>Contact Us</SectionHeading>
      <Paragraph>
        If you have any questions about Food Bundles, our services or this
        page, please contact us:
      </Paragraph>
      <List
        items={[
          <>
            Email: <span className="font-medium text-gray-900">info@food.rw</span> or{" "}
            <span className="font-medium text-gray-900">sales@food.rw</span>
          </>,
          <>
            Phone / WhatsApp: <span className="font-medium text-gray-900">+250 788 963 267</span>
          </>,
          <>
            Address: <span className="font-medium text-gray-900">KG 5 Ave, Kigali, Rwanda</span>
          </>,
        ]}
      />
    </LegalPage>
  );
}
