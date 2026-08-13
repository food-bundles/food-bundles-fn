/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Input } from "@/components/ui/input";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  MapPin,
  Phone,
  Building2,
  X,
  UserRoundCheck,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import { OTPInput } from "@/components/ui/otp-input";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LegalContent } from "@/components/legal-page";
import {
  ICreateFarmerData,
  ICreateRestaurantData,
  UserRole,
} from "@/lib/types";
import { authService } from "@/app/services/authService";
import { locationService } from "@/app/services/locationService";

interface ValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  password?: string;
  tin?: string;
}

interface LocationState {
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  textAddress: string;
}

// Component to handle search params
function SignupSearchParamsHandler({
  setSelectedRole,
}: {
  setSelectedRole: (role: UserRole) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const role = searchParams?.get("role");
    if (role === "restaurant") {
      setSelectedRole(UserRole.RESTAURANT);
    } else if (role === "farmer") {
      setSelectedRole(UserRole.FARMER);
    }
  }, [searchParams, setSelectedRole]);

  return null;
}

// Location Modal Component
function LocationModal({
  isOpen,
  onClose,
  onSelectLocation,
  disabled,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: LocationState) => void;
  disabled: boolean;
}) {
  const [locationData, setLocationData] = useState<LocationState>({
    province: "",
    district: "",
    sector: "",
    cell: "",
    village: "",
    textAddress: "",
  });

  const [provinces, setProvinces] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [cells, setCells] = useState<string[]>([]);
  const [villages, setVillages] = useState<string[]>([]);

  const [loading, setLoading] = useState({
    provinces: false,
    districts: false,
    sectors: false,
    cells: false,
    villages: false,
  });

  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadProvinces();
    }
  }, [isOpen]);

  useEffect(() => {
    if (locationData.province) {
      loadDistricts(locationData.province);
    } else {
      setDistricts([]);
      setSectors([]);
      setCells([]);
      setVillages([]);
    }
  }, [locationData.province]);

  useEffect(() => {
    if (locationData.district && locationData.province) {
      loadSectors(locationData.province, locationData.district);
    } else {
      setSectors([]);
      setCells([]);
      setVillages([]);
    }
  }, [locationData.district, locationData.province]);

  useEffect(() => {
    if (locationData.sector && locationData.district && locationData.province) {
      loadCells(
        locationData.province,
        locationData.district,
        locationData.sector
      );
    } else {
      setCells([]);
      setVillages([]);
    }
  }, [locationData.sector, locationData.district, locationData.province]);

  useEffect(() => {
    if (
      locationData.cell &&
      locationData.sector &&
      locationData.district &&
      locationData.province
    ) {
      loadVillages(
        locationData.province,
        locationData.district,
        locationData.sector,
        locationData.cell
      );
    } else {
      setVillages([]);
    }
  }, [
    locationData.cell,
    locationData.sector,
    locationData.district,
    locationData.province,
  ]);

  const loadProvinces = async () => {
    setLoading((prev) => ({ ...prev, provinces: true }));
    setLocationError("");
    try {
      const locationHierarchy = await locationService.fetchLocationHierarchy(
        []
      );
      const provinceNames = Array.isArray(locationHierarchy)
        ? locationHierarchy.map((prov: any) => prov.name || prov)
        : locationHierarchy.provinces
        ? locationHierarchy.provinces.map((prov: any) => prov.name || prov)
        : [];

      if (provinceNames.length === 0) {
        setLocationError("Unable to load provinces. Please try again later.");
      }
      setProvinces(provinceNames);
    } catch (error) {
      console.error("Failed to load provinces:", error);
      setLocationError(
        "Failed to load provinces. Please check your connection."
      );
      setProvinces([]);
    } finally {
      setLoading((prev) => ({ ...prev, provinces: false }));
    }
  };

  const loadDistricts = async (province: string) => {
    setLoading((prev) => ({ ...prev, districts: true }));
    setLocationError("");
    try {
      const districts = await locationService.getDistrictsByProvince(province);
      setDistricts(districts);
      if (districts.length === 0) {
        setLocationError("No districts found for this province.");
      }
    } catch (error) {
      console.error("Failed to load districts:", error);
      setLocationError("Failed to load districts.");
      setDistricts([]);
    } finally {
      setLoading((prev) => ({ ...prev, districts: false }));
    }
  };

  const loadSectors = async (province: string, district: string) => {
    setLoading((prev) => ({ ...prev, sectors: true }));
    setLocationError("");
    try {
      const sectors = await locationService.getSectorsByDistrict(
        province,
        district
      );
      setSectors(sectors);
      if (sectors.length === 0) {
        setLocationError("No sectors found for this district.");
      }
    } catch (error) {
      console.error("Failed to load sectors:", error);
      setLocationError("Failed to load sectors.");
      setSectors([]);
    } finally {
      setLoading((prev) => ({ ...prev, sectors: false }));
    }
  };

  const loadCells = async (
    province: string,
    district: string,
    sector: string
  ) => {
    setLoading((prev) => ({ ...prev, cells: true }));
    setLocationError("");
    try {
      const cells = await locationService.getCellsBySector(
        province,
        district,
        sector
      );
      setCells(cells);
      if (cells.length === 0) {
        setLocationError("No cells found for this sector.");
      }
    } catch (error) {
      console.error("Failed to load cells:", error);
      setLocationError("Failed to load cells.");
      setCells([]);
    } finally {
      setLoading((prev) => ({ ...prev, cells: false }));
    }
  };

  const loadVillages = async (
    province: string,
    district: string,
    sector: string,
    cell: string
  ) => {
    setLoading((prev) => ({ ...prev, villages: true }));
    setLocationError("");
    try {
      const villages = await locationService.getVillagesByCell(
        province,
        district,
        sector,
        cell
      );
      setVillages(villages);
      if (villages.length === 0) {
        setLocationError("No villages found for this cell.");
      }
    } catch (error) {
      console.error("Failed to load villages:", error);
      setLocationError("Failed to load villages.");
      setVillages([]);
    } finally {
      setLoading((prev) => ({ ...prev, villages: false }));
    }
  };

  const handleSelect = (field: keyof LocationState, value: string) => {
    const updates: Partial<LocationState> = { [field]: value };

    // Reset subsequent fields
    if (field === "province") {
      updates.district = "";
      updates.sector = "";
      updates.cell = "";
      updates.village = "";
    } else if (field === "district") {
      updates.sector = "";
      updates.cell = "";
      updates.village = "";
    } else if (field === "sector") {
      updates.cell = "";
      updates.village = "";
    } else if (field === "cell") {
      updates.village = "";
    }

    setLocationData((prev) => ({ ...prev, ...updates }));
  };

  const handleConfirm = () => {
    if (locationData.village) {
      const textAddress = `${locationData.province}, ${locationData.district}, ${locationData.sector}, ${locationData.cell}, ${locationData.village}`;
      onSelectLocation({
        ...locationData,
        textAddress,
      });
      onClose();
      // Reset for next time
      setLocationData({
        province: "",
        district: "",
        sector: "",
        cell: "",
        village: "",
        textAddress: "",
      });
    }
  };

  const handleReset = () => {
    setLocationData({
      province: "",
      district: "",
      sector: "",
      cell: "",
      village: "",
      textAddress: "",
    });
    setDistricts([]);
    setSectors([]);
    setCells([]);
    setVillages([]);
  };

  const renderDropdown = (
    options: string[],
    value: string,
    placeholder: string,
    field: keyof LocationState,
    isLoading: boolean
  ) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => handleSelect(field, e.target.value)}
        disabled={disabled || isLoading || options.length === 0}
        className="w-full px-4 py-3 border border-gray-300 text-gray-900 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none bg-white appearance-none pr-10"
      >
        <option value="" disabled>
          {`Select ${placeholder}`}
        </option>
        {options.map((option, index) => (
          <option key={`${option}-${index}`} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Select Your Location
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {locationError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
              {locationError}
            </div>
          )}

          <div className="space-y-4">
            {/* Province */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Province
              </label>
              {renderDropdown(
                provinces,
                locationData.province,
                "Province",
                "province",
                loading.provinces
              )}
            </div>

            {/* District */}
            {locationData.province && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District
                </label>
                {renderDropdown(
                  districts,
                  locationData.district,
                  "District",
                  "district",
                  loading.districts
                )}
              </div>
            )}

            {/* Sector */}
            {locationData.district && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sector
                </label>
                {renderDropdown(
                  sectors,
                  locationData.sector,
                  "Sector",
                  "sector",
                  loading.sectors
                )}
              </div>
            )}

            {/* Cell */}
            {locationData.sector && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cell
                </label>
                {renderDropdown(
                  cells,
                  locationData.cell,
                  "Cell",
                  "cell",
                  loading.cells
                )}
              </div>
            )}

            {/* Village */}
            {locationData.cell && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Village
                </label>
                {renderDropdown(
                  villages,
                  locationData.village,
                  "Village",
                  "village",
                  loading.villages
                )}
              </div>
            )}

            {/* Progress indicator */}
            <div className="pt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{
                      width: `${
                        Object.values(locationData).filter(
                          (v) => v && v !== locationData.textAddress
                        ).length * 20
                      }%`,
                    }}
                  />
                </div>
                <span className="text-xs font-medium whitespace-nowrap">
                  {
                    Object.values(locationData).filter(
                      (v) => v && v !== locationData.textAddress
                    ).length
                  }
                  /5
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
          {locationData.province && (
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              disabled={disabled}
            >
              Reset
            </button>
          )}
          <button
            onClick={handleConfirm}
            disabled={!locationData.village || disabled}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}

// Legal documents that can be viewed inline on the signup page
type LegalDoc = "about" | "terms" | "privacy" | "refund";

const legalDocTitles: Record<LegalDoc, string> = {
  about: "About Us",
  terms: "Terms & Conditions",
  privacy: "Privacy Policy",
  refund: "Refund Policy",
};

const {
  SectionHeading: LegalSection,
  SubHeading: LegalSubSection,
  Paragraph: LegalParagraph,
  List: LegalList,
} = LegalContent;

function AboutUsContent() {
  return (
    <>
      <LegalSection>Who We Are</LegalSection>
      <LegalParagraph>
        Food Bundles is a technology platform that connects restaurants and
        hotels with local farms and trusted suppliers, enabling them to source
        fresh, quality food ingredients efficiently. We are a Rwandan company
        committed to strengthening the food supply chain by bridging the gap
        between producers and the hospitality industry.
      </LegalParagraph>
      <LegalParagraph>
        Through our platform, restaurants can browse products, place orders,
        track deliveries in real time, manage their inventory and settle
        payments securely using supported payment methods. Farmers gain access
        to a wider market and a more predictable demand for their produce.
      </LegalParagraph>

      <LegalSection>Our Mission</LegalSection>
      <LegalParagraph>
        Our mission is to make it simple, fast and reliable for food businesses
        to get the ingredients they need, while supporting local farmers and
        promoting sustainability in the food supply chain. We aim to reduce
        waste, improve efficiency and help every business we serve grow.
      </LegalParagraph>

      <LegalSection>What We Offer</LegalSection>
      <LegalList
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
            secure payment options including Flutterwave (card and mobile
            money), Paypack mobile money, voucher and pre-paid (deposit), and,
            for qualifying businesses, approved credit by subscription.
          </>,
        ]}
      />

      <LegalSection>Who We Serve</LegalSection>
      <LegalParagraph>
        We serve restaurants and hotels of all sizes, from independent eateries
        to large hospitality groups, as well as farmers and aggregators who
        supply the fresh produce our customers depend on. By bringing all of
        these partners onto one platform, we make the food supply chain more
        transparent, efficient and trustworthy.
      </LegalParagraph>

      <LegalSection>Company Information</LegalSection>
      <LegalList
        items={[
          <>
            <span className="font-medium text-gray-900">Company:</span> Food
            Bundles Limited (TIN 112265383), incorporated in Rwanda
          </>,
          <>
            <span className="font-medium text-gray-900">Website:</span>{" "}
            www.food.rw
          </>,
          <>
            <span className="font-medium text-gray-900">Address:</span> KG 5
            Ave, Kigali, Rwanda
          </>,
          <>
            <span className="font-medium text-gray-900">Phone:</span> +250 788
            963 267
          </>,
          <>
            <span className="font-medium text-gray-900">Email:</span>{" "}
            info@food.rw
          </>,
        ]}
      />

      <LegalSection>Contact Us</LegalSection>
      <LegalParagraph>
        If you have any questions about Food Bundles, our services or this
        page, please contact us at info@food.rw or +250 788 963 267, or visit us
        at KG 5 Ave, Kigali, Rwanda.
      </LegalParagraph>
    </>
  );
}

function TermsConditionsContent() {
  return (
    <>
      <LegalSection>Executive Introduction</LegalSection>
      <LegalParagraph>
        This User Agreement is designed to establish a clear, transparent, and
        fair framework for all restaurants using the Food Bundles platform. Its
        purpose is to outline the rights and responsibilities of both Food
        Bundles Limited and our valued restaurant partners, ensuring that every
        transaction is carried out smoothly, securely, and with mutual
        understanding.
      </LegalParagraph>
      <LegalParagraph>
        Please note that by registering for or signing up on the Food Bundles
        platform whether online or through an authorized agent you acknowledge
        that you have read, understood, and accepted the terms of this
        Agreement. Your continued use of the platform confirms your acceptance
        and agreement to abide by these terms.
      </LegalParagraph>

      <LegalSection>1. Purpose &amp; Scope</LegalSection>
      <LegalParagraph>
        This Agreement governs the Restaurant's use of the Food Bundles platform
        for sourcing, ordering, and receiving delivery of fresh food and related
        products, including options for postpayment, instant payment, and
        subscription-based services.
      </LegalParagraph>

      <LegalSection>2. Platform Access, Registration &amp; Packages</LegalSection>
      <LegalList
        items={[
          "Restaurants may register for a Food Bundles account online or through authorized agents.",
          "By default, all Restaurants are enrolled in the Freemium Package, which allows immediate purchase and payment for orders.",
          "Restaurants may upgrade to paid subscription packages, unlocking additional features such as order postpayment options, extended delivery benefits, and other exclusive services.",
          "Subscription packages, fees, and features are set independently by Food Bundles and may be updated at its sole discretion. Subscription fees are non-negotiable.",
        ]}
      />

      <LegalSection>
        3. Order Placement, Payment, Receipt, Delivery, Return &amp; Acceptance
      </LegalSection>
      <LegalList
        items={[
          "Restaurants may place orders for fresh food and inventory using the Food Bundles platform.",
          "Payment can be made via available payment methods (e.g., mobile money, card, bank transfer, or other methods supported by Food Bundles).",
          "For Freemium Package users, payment must be made in full at the time of order placement.",
          "For paid subscription users with postpayment eligibility, payment terms are as set out in Section 4.",
          "Food Bundles delivers orders to the Restaurant or designated address. Delivery is free for orders above 100,000 RWF or for Restaurants under a paid subscription package; otherwise, standard delivery charges may apply.",
        ]}
      />
      <LegalParagraph>
        Upon delivery, the Restaurant (or its authorized representative) shall
        inspect the goods and confirm receipt by signing a delivery note or
        confirming electronically via the platform. Any defects, discrepancies,
        or issues must be reported and resolved at the time of delivery. Once
        the delivery note is signed or electronic confirmation is given, the
        order is deemed accepted and no claims for defects or discrepancies will
        be accepted thereafter. In cases where products do not match promised
        quality or specification and are identified at delivery, affected
        products will be replaced, returned, or the value deducted from the next
        order, as determined by Food Bundles.
      </LegalParagraph>

      <LegalSection>4. Order Postpayment Option (Paid Subscription Only)</LegalSection>
      <LegalList
        items={[
          "Only available to Restaurants with an active subscription package that includes postpayment.",
          "Postpayment periods range from 7 to 30 days, as determined by Food Bundles for each approved order.",
          "No interest is charged for postpayment; eligibility is based on subscription status.",
          "Restaurants must request postpayment on each order; approval is at Food Bundles' sole discretion, based on order amount, frequency, and other criteria.",
          "Having a subscription with postpayment eligibility does not guarantee approval of every postpayment request.",
        ]}
      />

      <LegalSection>5. Payment &amp; Settlement</LegalSection>
      <LegalList
        items={[
          "For postpayment orders, restaurants must settle the full invoiced amount within the period specified by Food Bundles (7 to 30 days from delivery/invoice date).",
          "Failure to pay within the agreed period may result in suspension of postpayment privileges, additional failure to pay may be reported to the Credit Reference Bureau (CRB) or other relevant credit reporting agencies as required by law or at Food Bundles' discretion and may result in termination of platform access.",
          "All payments must be made using approved payment methods.",
        ]}
      />

      <LegalSection>6. Anti-Fraud &amp; Anti-Money Laundering</LegalSection>
      <LegalList
        items={[
          "Restaurants agree not to use the Food Bundles platform for any unlawful, fraudulent, or money laundering activities.",
          "Food Bundles reserves the right to monitor transactions, suspend accounts, and report suspicious activity to relevant authorities.",
          "Restaurants must provide accurate information and cooperate with any verification or compliance checks as required by Food Bundles or applicable law.",
        ]}
      />

      <LegalSection>7. Privacy &amp; Data Protection</LegalSection>
      <LegalList
        items={[
          "Food Bundles collects and processes Restaurant data solely for account management, order fulfillment, compliance, and customer support, and implements reasonable security measures to protect such data.",
          "Restaurant data is used for account management, order fulfillment, customer support, compliance, and platform improvement.",
          "Food Bundles implements reasonable security measures to protect Restaurant data from unauthorized access or misuse.",
          "Restaurants have the right to access, correct, or request deletion of their data, subject to legal and operational requirements.",
        ]}
      />

      <LegalSection>8. Platform Use, Amendments &amp; Termination</LegalSection>
      <LegalList
        items={[
          "This Agreement is effective upon Restaurant's registration or first order and continues until terminated by either Party with notice, subject to settlement of outstanding obligations.",
          "Food Bundles may amend these terms, subscription packages, or platform features at any time, with notice to Users via the platform or registered contact details.",
          "Food Bundles may suspend or terminate access for violation of these terms or for compliance reasons.",
        ]}
      />

      <LegalSection>9. Miscellaneous</LegalSection>
      <LegalList
        items={[
          "This Agreement constitutes the entire understanding between the Parties for platform use, order fulfillment, payment, and delivery.",
          "Any amendments must be in writing and acknowledged by both Parties, except for platform-wide updates communicated by Food Bundles.",
          "This Agreement is governed by the laws of the Republic of Rwanda.",
        ]}
      />
    </>
  );
}

function PrivacyPolicyContent() {
  return (
    <>
      <LegalSection>1. Overview</LegalSection>
      <LegalParagraph>
        Food Bundles Limited ("Food Bundles", "we", "us" or "our") respects your
        privacy and is committed to protecting the personal data you provide
        when you register for, or use, our platform, whether online or through
        an authorized agent. This Privacy Policy describes the types of
        information we collect, how we use it, and the choices and rights you
        have in relation to that information.
      </LegalParagraph>

      <LegalSection>2. Information We Collect</LegalSection>
      <LegalSubSection>2.1 Information you provide</LegalSubSection>
      <LegalList
        items={[
          "Account details, such as your name, business name, email address, phone number, TIN and business type.",
          "Location information, including province, district, sector, cell and village.",
          "Payment information needed to process transactions securely. Card details are collected by our payment provider (Flutterwave) on their secure pages and are not stored by us. Payments on the platform may be made via Flutterwave (including card and mobile money), Paypack mobile money, voucher, or pre-paid (deposit), where offered.",
          "Communication with our support team, such as inquiries, feedback and correspondence.",
        ]}
      />
      <LegalSubSection>2.2 Information we collect automatically</LegalSubSection>
      <LegalList
        items={[
          "Transaction and order records made through the platform.",
          "Technical information such as your IP address, browser type and device information, where needed for security and platform improvement.",
        ]}
      />

      <LegalSection>3. How We Use Your Information</LegalSection>
      <LegalParagraph>
        We collect and process your data solely for legitimate business
        purposes, including:
      </LegalParagraph>
      <LegalList
        items={[
          "Account management, verification and authentication.",
          "Order placement, fulfilment, payment processing and delivery.",
          "Customer support and responding to your inquiries.",
          "Compliance with legal, regulatory and tax obligations, and the prevention of fraud and money laundering.",
          "Platform improvement, analytics and security.",
          "Sending service notifications and, where you have agreed, marketing communications.",
        ]}
      />

      <LegalSection>4. Sharing of Information</LegalSection>
      <LegalParagraph>
        We do not sell your personal data. We only share information where
        necessary to operate the platform, including:
      </LegalParagraph>
      <LegalList
        items={[
          "Payment processors and financial service providers, such as Flutterwave and Paypack, to process transactions you initiate, including voucher and pre-paid (deposit) balances.",
          "Delivery and logistics partners, to the extent needed to fulfil your orders.",
          "Authorized agents and service providers acting on our behalf, under appropriate confidentiality obligations.",
          "Government or regulatory authorities, where required by law or for the prevention of fraud and money laundering.",
        ]}
      />

      <LegalSection>5. Data Security</LegalSection>
      <LegalParagraph>
        We implement reasonable technical and organizational security measures to
        protect your personal data from unauthorized access, use, alteration,
        disclosure or loss. Sensitive payment credentials are handled by our
        payment provider on secure, encrypted pages, and our staff access
        personal data only where necessary to perform their duties.
      </LegalParagraph>

      <LegalSection>6. Data Retention</LegalSection>
      <LegalParagraph>
        We retain your personal data for as long as necessary to provide the
        platform and services, comply with legal, accounting and tax
        obligations, resolve disputes and enforce our agreements. Transaction
        and financial records may be retained for the periods required by
        applicable law.
      </LegalParagraph>

      <LegalSection>7. Your Rights</LegalSection>
      <LegalParagraph>
        Subject to applicable law, you have the right to access the personal
        data we hold about you, correct or update inaccurate information,
        request deletion subject to legal and operational requirements, object
        to certain processing activities, and withdraw consent for marketing
        communications at any time. To exercise any of these rights, contact us
        at info@food.rw.
      </LegalParagraph>


      <LegalSection>8. Changes to This Policy</LegalSection>
      <LegalParagraph>
        We may update this Privacy Policy from time to time. When we do, we will
        revise the "Last updated" date at the top of this page and, where
        appropriate, notify you through the platform or your registered contact
        details.
      </LegalParagraph>

      <LegalSection>9. Contact Us</LegalSection>
      <LegalParagraph>
        If you have any questions or concerns about this Privacy Policy or how
        we handle your personal data, contact us at info@food.rw, +250 788 963
        267, or KG 5 Ave, Kigali, Rwanda.
      </LegalParagraph>
    </>
  );
}

function RefundPolicyContent() {
  return (
    <>
      <LegalSection>1. Overview</LegalSection>
      <LegalParagraph>
        Food Bundles is committed to a fair and transparent refund process.
        Refunds are issued by{" "}
        <span className="font-medium text-gray-900">
          topping up the refunded amount to your Food Bundles wallet balance
        </span>
        . Once approved, the wallet top-up is processed within{" "}
        <span className="font-medium text-gray-900">7 days</span>. Refunds are
        recorded in your transaction history so you can always see what has
        been returned to you.
      </LegalParagraph>

      <LegalSection>2. When Can I Request a Refund?</LegalSection>
      <LegalSubSection>2.1 Report at delivery</LegalSubSection>
      <LegalParagraph>
        You must report any refund issue{" "}
        <span className="font-medium text-gray-900">
          immediately upon delivery, while our logistics staff are still
          present
        </span>{" "}
        at your location. If the issue is not reported at the time of delivery,
        you will not be able to report a refund for that order.
      </LegalParagraph>

      <LegalSubSection>2.2 Quality issues on delivery</LegalSubSection>
      <LegalList
        items={[
          "You must report quality issues immediately at the time of delivery, while our logistics staff are still present.",
          "We will arrange pickup where applicable and provide a full refund or replacement.",
          "If products do not match the promised quality or specification and are identified at delivery, affected products will be replaced, returned, or the value credited to your account, as determined by Food Bundles.",
        ]}
      />

      <LegalSubSection>2.3 Damaged items</LegalSubSection>
      <LegalParagraph>
        Report damaged items immediately upon delivery, before our logistics
        staff leave. We will provide an immediate replacement or a full refund
        at no cost to you.
      </LegalParagraph>

      <LegalSection>3. How Refunds Are Issued</LegalSection>
      <LegalList
        items={[
          <>
            <span className="font-medium text-gray-900">
              Credited to your wallet balance:
            </span>{" "}
            approved refunds are topped up to your Food Bundles wallet/account
            balance and become available for future orders and top-ups.
          </>,
          <>
            <span className="font-medium text-gray-900">
              Processing time up to 7 days:
            </span>{" "}
            refunded amounts are topped up to your wallet within 7 days of
            approval.
          </>,
          <>
            <span className="font-medium text-gray-900">
              Recorded as a REFUND transaction:
            </span>{" "}
            every refund is recorded in your transaction history as a REFUND,
            keeping your account records accurate and transparent.
          </>,
        ]}
      />

      <LegalSection>4. What Refunds Do Not Cover</LegalSection>
      <LegalList
        items={[
          "Issues not reported at the time of delivery while our logistics staff were still present.",
          "Products that were accepted at delivery and are no longer unused or unopened.",
          "Issues reported after our logistics staff have left the delivery location.",
          "Losses caused by misuse, negligence or failure to follow storage or handling instructions.",
          "Refund requests for the same order or item where a refund has already been issued, to prevent duplicate refunds.",
        ]}
      />

      <LegalSection>5. How to Request a Refund</LegalSection>
      <LegalParagraph>
        To initiate a refund request, report the issue to our logistics staff
        at the time of delivery, or contact our support team with your order
        details at +250 796 897 823 (phone/WhatsApp) or sales@food.rw. Please
        include your order number, the items concerned and the reason for the
        request. We will review your request and confirm the outcome within a
        reasonable timeframe.
      </LegalParagraph>

      <LegalSection>6. Contact for Further Questions</LegalSection>
      <LegalParagraph>
        If you have any questions about this Refund Policy or a refund request,
        please contact us at sales@food.rw or call +250 796 897 823. Business
        hours: Mon-Fri, 9am - 6pm.
      </LegalParagraph>
    </>
  );
}

function renderLegalDoc(doc: LegalDoc) {
  switch (doc) {
    case "about":
      return <AboutUsContent />;
    case "terms":
      return <TermsConditionsContent />;
    case "privacy":
      return <PrivacyPolicyContent />;
    case "refund":
      return <RefundPolicyContent />;
    default:
      return null;
  }
}

// Main signup form component
function SignupForm() {
  const [selectedRole, setSelectedRole] = useState(UserRole.RESTAURANT);
  const [activeDoc, setActiveDoc] = useState<LegalDoc | null>(null);
  const [selectedBusinessType, setSelectedBusinessType] = useState<"RESTAURANT" | "HOTEL">("RESTAURANT");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);
  const [backendMessage, setBackendMessage] = useState("");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [registeredPhone, setRegisteredPhone] = useState("");
  const [otpError, setOtpError] = useState("");

  const [locationData, setLocationData] = useState<LocationState>({
    province: "",
    district: "",
    sector: "",
    cell: "",
    village: "",
    textAddress: "",
  });

  const router = useRouter();

  useEffect(() => {
    checkBackendAvailability();
  }, []);

  useEffect(() => {
    setLocationData({
      province: "",
      district: "",
      sector: "",
      cell: "",
      village: "",
      textAddress: "",
    });
  }, [selectedRole]);

  async function checkBackendAvailability() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/health`, {
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        setIsBackendAvailable(true);
      } else {
        setIsBackendAvailable(false);
        setBackendMessage(
          "Service temporarily unavailable. Please try again later."
        );
      }
    } catch (error) {
      setIsBackendAvailable(false);
      setBackendMessage(
        "Service temporarily unavailable. Please try again later."
      );
    }
  }

  function validateEmail(email: string): string | null {
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    if (email.length > 254) return "Email address is too long";
    return null;
  }

  function validatePhone(phone: string): string | null {
    if (!phone.trim()) return "Phone number is required";
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
      return "Please enter a valid phone number (10-15 digits)";
    }
    return null;
  }

  function validatePassword(password: string): string | null {
    if (!password) return "Password is required";
    if (password.length < 8)
      return "Password must be at least 8 characters long";
    if (!/(?=.*[a-z])/.test(password))
      return "Password must contain at least one lowercase letter";
    if (!/(?=.*[A-Z])/.test(password))
      return "Password must contain at least one uppercase letter";
    if (!/(?=.*\d)/.test(password))
      return "Password must contain at least one number";
    if (!/(?=.*[@$!%*?&])/.test(password))
      return "Password must contain at least one special character (@$!%*?&)";
    return null;
  }

  function validateRestaurantName(name: string): string | null {
    if (!name.trim()) return "Restaurant name is required";
    if (name.trim().length < 2)
      return "Restaurant name must be at least 2 characters";
    if (name.trim().length > 100)
      return "Restaurant name is too long (max 100 characters)";
    if (!/^[a-zA-Z0-9\s\-'&.]+$/.test(name.trim())) {
      return "Restaurant name contains invalid characters";
    }
    return null;
  }

  function validateLocation(locationState: LocationState): string | null {
    if (selectedRole === UserRole.FARMER) {
      if (!locationState.province) return "Please select a province";
      if (!locationState.district) return "Please select a district";
      if (!locationState.sector) return "Please select a sector";
      if (!locationState.cell) return "Please select a cell";
      if (!locationState.village) return "Please select a village";
      return null;
    }

    const location = locationState.textAddress;
    if (!location.trim()) return "Location is required";
    if (location.trim().length < 3)
      return "Please provide a more specific location";
    if (location.trim().length > 255) return "Location is too long";
    return null;
  }

  function validateForm(formData: FormData): ValidationErrors {
    const errors: ValidationErrors = {};

    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    if (selectedRole === UserRole.RESTAURANT) {
      const nameError = validateRestaurantName(name);
      if (nameError) errors.name = nameError;
    }

    if (selectedRole === UserRole.RESTAURANT || (email && email.trim())) {
      const emailError = validateEmail(email);
      if (emailError) errors.email = emailError;
    }

    if (selectedRole === UserRole.RESTAURANT) {
      const tin = formData.get("tin") as string;
      if (!tin || !/^[0-9]{9}$/.test(tin) || /^0+$/.test(tin)) {
        errors.tin = "TIN must be a valid 9-digit number (not all zeros)";
      }
    }

    const phoneError = validatePhone(phone);
    if (phoneError) errors.phone = phoneError;

    const locationError = validateLocation(locationData);
    if (locationError) errors.location = locationError;

    const passwordError = validatePassword(password);
    if (passwordError) errors.password = passwordError;

    return errors;
  }

  const handleLocationChange = (newLocationData: LocationState) => {
    setLocationData(newLocationData);
    if (validationErrors.location) {
      setValidationErrors((prev) => ({ ...prev, location: undefined }));
    }
  };

  const handleInputChange = (field: keyof ValidationErrors) => {
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    const errors = validateForm(formData);

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setIsLoading(false);
      return;
    }

    setValidationErrors({});

    const password = formData.get("password") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const name = formData.get("name") as string;
    const locationToSave = locationData.textAddress.trim();

    try {
      if (selectedRole === UserRole.FARMER) {
        const farmerData: ICreateFarmerData = {
          email: email || undefined,
          password,
          tin: formData.get("tin") as string,
          location: locationToSave,
          phone,
        };
        await authService.registerFarmer(farmerData);
        setSuccess("Account created successfully! Redirecting to login...");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else if (selectedRole === UserRole.RESTAURANT) {
        const restaurantData: ICreateRestaurantData = {
          name,
          email,
          password,
          tin: (formData.get("tin") as string) || "",
          location: locationToSave,
          phone,
          role: selectedBusinessType,
        };
        const response = await authService.registerRestaurant(restaurantData);

        if (response.success) {
          setRegisteredPhone(phone);
          setShowOTPModal(true);
          setSuccess(
            "Registration successful! Please verify your phone number with the OTP sent to you."
          );
        }
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(
        error.response?.data?.message || error.message || "Registration failed"
      );
    } finally {
      setIsLoading(false);
    }
  }

  const handleVerifyOTP = async () => {
    if (!otpCode.trim()) {
      setOtpError("Please enter the OTP code");
      return;
    }

    setIsVerifyingOTP(true);
    setOtpError("");

    try {
      const response = await authService.verifyRestaurant(
        registeredPhone,
        otpCode
      );

      if (response.success) {
        // Store user data for terms agreement
        const formData = new FormData(document.querySelector('form') as HTMLFormElement);
        const email = formData.get("email") as string;
        localStorage.setItem("pending_agreement_email", email);
        localStorage.setItem("pending_agreement_phone", registeredPhone);
        
        setShowOTPModal(false);
        setSuccess(
          "Phone number verified successfully! Redirecting to terms agreement..."
        );
        setTimeout(() => {
          window.location.href = "/terms-agreement";
        }, 2000);
      } else {
        setOtpError(response.message || "OTP verification failed");
      }
    } catch (error: any) {
      setOtpError(error.response?.data?.message || "OTP verification failed");
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await authService.resendOTP(registeredPhone);
      if (response.success) {
        setSuccess("OTP resent successfully!");
        setOtpError("");
      } else {
        setOtpError(response.message || "Failed to resend OTP");
      }
    } catch (error: any) {
      setOtpError(error.response?.data?.message || "Failed to resend OTP");
    }
  };

  return (
    <div
      className={`flex flex-col md:flex-row items-center w-full max-w-3xl ${
        activeDoc ? "md:max-w-5xl" : ""
      }`}
    >
      <Suspense fallback={null}>
        <SignupSearchParamsHandler setSelectedRole={setSelectedRole} />
      </Suspense>

      {/* Left side: role selection / legal documents */}
      <div
        className={`w-full ${
          activeDoc ? "md:w-full" : "md:w-1/2"
        } p-6 md:p-8 flex flex-col justify-center bg-white`}
      >
        {activeDoc ? (
          <div className="flex flex-col md:mx-auto w-full md:max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setActiveDoc(null)}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors cursor-pointer hover:border-green-500 hover:text-green-700"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
              {(Object.keys(legalDocTitles) as LegalDoc[]).map((doc) => (
                <button
                  key={doc}
                  type="button"
                  onClick={() => setActiveDoc(doc)}
                  className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    activeDoc === doc
                      ? "bg-green-700 border-green-700 text-white"
                      : "bg-white border-gray-200 text-gray-600 hover:border-green-500 hover:text-green-700"
                  }`}
                >
                  {legalDocTitles[doc]}
                </button>
              ))}
            </div>

            <div className="max-h-[440px] lg:max-h-[520px] overflow-y-auto pr-2 scrollbar-thin border-t border-gray-100 pt-4">
              {renderLegalDoc(activeDoc)}
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-900 text-[14px] mb-6">
              Thank you for choosing Food Bundles.
            </p>
            <p className="text-xs font-medium text-black mb-4">
              Choose Your Role
            </p>

            <div className="flex flex-col space-y-4">
              <button
                onClick={() => setSelectedRole(UserRole.RESTAURANT)}
                className={`w-full h-12 border transition-all relative rounded px-2 text-[14px] cursor-pointer ${
                  selectedRole === UserRole.RESTAURANT
                    ? "border-green-500 bg-white"
                    : "border-gray-200 hover:border-green-500"
                }`}
                disabled={!isBackendAvailable}
              >
                <h3 className="text-left text-gray-900">
                  I'm a Restaurant/Hotel
                </h3>
                {selectedRole === UserRole.RESTAURANT && (
                  <UserRoundCheck className="absolute top-3 right-3 h-5 w-5 text-green-600" />
                )}
              </button>

              <button
                onClick={() => setSelectedRole(UserRole.FARMER)}
                className={`w-full h-12 border transition-all relative shadow-none rounded px-2 text-[14px] cursor-pointer ${
                  selectedRole === UserRole.FARMER
                    ? "border-green-500 bg-white"
                    : "border-gray-200 hover:border-green-200"
                }`}
                disabled={!isBackendAvailable}
              >
                <h3 className="text-left text-gray-900">I'm a Farmer</h3>
                {selectedRole === UserRole.FARMER && (
                  <UserRoundCheck className="absolute top-3 right-3 h-5 w-5 text-green-600" />
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Vertical divider */}
      {!activeDoc && (
        <div className="hidden md:block w-[.5px] bg-gray-300 h-100" />
      )}

      {/* Right side: form */}
      <div className={`w-full ${activeDoc ? "hidden" : "md:w-1/2"} p-6 md:p-8`}>
        {!isBackendAvailable && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md text-sm mb-4">
            {backendMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm mb-4">
            {success}
          </div>
        )}

        <div>
          <div className="mt-6 lg:mt-20"></div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {selectedRole === UserRole.RESTAURANT && (
              <>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-900" />
                  <Input
                    type="text"
                    name="name"
                    placeholder={`${selectedBusinessType === "RESTAURANT" ? "Restaurant" : "Hotel"} Name`}
                    className={`pl-10 h-10 border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500 rounded-none ${
                      validationErrors.name
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                    disabled={!isBackendAvailable || isLoading}
                    onChange={() => handleInputChange("name")}
                  />
                  {validationErrors.name && (
                    <p className="text-red-600 text-xs mt-1">
                      {validationErrors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-xs text-gray-700">
                    Business Type
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setSelectedBusinessType("RESTAURANT")}
                      className={`flex-1 h-10 border rounded text-sm font-medium transition-colors ${
                        selectedBusinessType === "RESTAURANT"
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-300 text-gray-700 hover:border-green-300"
                      }`}
                      disabled={!isBackendAvailable || isLoading}
                    >
                      Restaurant
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedBusinessType("HOTEL")}
                      className={`flex-1 h-10 border rounded text-sm font-medium transition-colors ${
                        selectedBusinessType === "HOTEL"
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-300 text-gray-700 hover:border-green-300"
                      }`}
                      disabled={!isBackendAvailable || isLoading}
                    >
                      Hotel
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-900" />
              <Input
                type="email"
                name="email"
                placeholder={
                  selectedRole === UserRole.FARMER ? "Email" : "Email Address"
                }
                className={`pl-10 h-10 border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500 rounded-none ${
                  validationErrors.email
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                disabled={!isBackendAvailable || isLoading}
                onChange={() => handleInputChange("email")}
              />
              {validationErrors.email && (
                <p className="text-red-600 text-xs mt-1">
                  {validationErrors.email}
                </p>
              )}
            </div>

            {selectedRole === UserRole.RESTAURANT && (
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-900" />
                <Input
                  type="text"
                  name="tin"
                  placeholder="TIN Number"
                  className={`pl-10 h-10 border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500 rounded-none ${
                    validationErrors.tin
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  disabled={!isBackendAvailable || isLoading}
                  onChange={() => handleInputChange("tin")}
                />
                {validationErrors.tin && (
                  <p className="text-red-600 text-xs mt-1">
                    {validationErrors.tin}
                  </p>
                )}
              </div>
            )}

            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-900" />
              <Input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                className={`pl-10 h-10 border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500 rounded-none ${
                  validationErrors.phone
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                disabled={!isBackendAvailable || isLoading}
                onChange={() => handleInputChange("phone")}
              />
              {validationErrors.phone && (
                <p className="text-red-600 text-xs mt-1">
                  {validationErrors.phone}
                </p>
              )}
            </div>

            {/* Location field with modal for farmers */}
            {selectedRole === UserRole.FARMER ? (
              <div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-900" />
                  <Input
                    type="text"
                    value={locationData.textAddress}
                    readOnly
                    onClick={() => setIsLocationModalOpen(true)}
                    placeholder="Click to select location"
                    className={`pl-10 h-10 border-gray-300 text-gray-900 cursor-pointer rounded-none ${
                      validationErrors.location
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                    disabled={!isBackendAvailable || isLoading}
                  />
                  {validationErrors.location && (
                    <p className="text-red-600 text-xs mt-1">
                      {validationErrors.location}
                    </p>
                  )}
                </div>

                {/* Location Modal */}
                <LocationModal
                  isOpen={isLocationModalOpen}
                  onClose={() => setIsLocationModalOpen(false)}
                  onSelectLocation={handleLocationChange}
                  disabled={isLoading}
                />
              </div>
            ) : (
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-900" />
                <Input
                  type="text"
                  name="location"
                  placeholder="Location"
                  value={locationData.textAddress}
                  onChange={(e) =>
                    handleLocationChange({
                      ...locationData,
                      textAddress: e.target.value,
                    })
                  }
                  className={`pl-10 h-10 border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500 rounded-none ${
                    validationErrors.location
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  disabled={!isBackendAvailable || isLoading}
                />
                {validationErrors.location && (
                  <p className="text-red-600 text-xs mt-1">
                    {validationErrors.location}
                  </p>
                )}
              </div>
            )}

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-900" />
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className={`pl-10 h-10 border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500 rounded-none ${
                  validationErrors.password
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                disabled={!isBackendAvailable || isLoading}
                onChange={() => handleInputChange("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-900 hover:text-gray-800 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
              {validationErrors.password && (
                <p className="text-red-600 text-xs mt-1">
                  {validationErrors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full h-10 bg-green-700 hover:bg-green-800 text-white text-[14px] font-medium cursor-pointer"
              disabled={isLoading || !isBackendAvailable}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500 leading-relaxed">
                By creating an account, you agree to our{" "}
                <button
                  type="button"
                  onClick={() => setActiveDoc("terms")}
                  className="text-green-600 hover:text-green-700 underline underline-offset-2 cursor-pointer"
                >
                  Terms &amp; Conditions
                </button>
                ,{" "}
                <button
                  type="button"
                  onClick={() => setActiveDoc("privacy")}
                  className="text-green-600 hover:text-green-700 underline underline-offset-2 cursor-pointer"
                >
                  Privacy Policy
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  onClick={() => setActiveDoc("refund")}
                  className="text-green-600 hover:text-green-700 underline underline-offset-2 cursor-pointer"
                >
                  Refund Policy
                </button>
                .
              </p>
              <p className="mt-1.5 text-xs text-gray-500">
                Learn more:{" "}
                <button
                  type="button"
                  onClick={() => setActiveDoc("about")}
                  className="text-green-600 hover:text-green-700 underline underline-offset-2 cursor-pointer"
                >
                  About Us
                </button>
              </p>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[13px] text-gray-900">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded w-full max-w-md flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-[16px] font-medium text-gray-900">
                Verify Account
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-[14px] text-gray-700">
                We've sent a verification code to {registeredPhone}. Please
                enter it below.
              </p>

              {otpError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {otpError}
                </div>
              )}

              <div className="flex justify-center">
                <OTPInput
                  value={otpCode}
                  onChange={(value) => {
                    setOtpCode(value);
                    if (otpError) setOtpError("");
                  }}
                  disabled={isVerifyingOTP}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleResendOTP}
                  className="flex-1 h-10 border border-gray-300 hover:border-green-500 text-gray-900 hover:text-green-600 text-sm font-medium transition-colors cursor-pointer"
                  disabled={isVerifyingOTP}
                >
                  Resend OTP
                </button>
                <button
                  onClick={handleVerifyOTP}
                  className="flex-1 h-10 bg-green-700 hover:bg-green-800 text-white text-sm font-medium cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={isVerifyingOTP || !otpCode.trim()}
                >
                  {isVerifyingOTP && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {isVerifyingOTP ? "Verifying..." : "Verify"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-4 px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="flex items-center w-full max-w-3xl">
            <div className="w-1/2 p-8 flex flex-col justify-center bg-white">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-4">
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
            <div className="w-[.5px] bg-gray-300 h-100" />
            <div className="w-1/2 p-8">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-4">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <SignupForm />
      </Suspense>
    </div>
  );
}
