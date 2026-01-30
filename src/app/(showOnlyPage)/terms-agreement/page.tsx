/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { OptimizedImage } from "@/components/OptimizedImage";
import { restaurantService } from "@/app/services/restaurantService";

export default function TermsAgreementPage() {
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const rightContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const email = localStorage.getItem("pending_agreement_email");
    const phone = localStorage.getItem("pending_agreement_phone");
    if (email) {
      setUserEmail(email);
    }
    if (phone) {
      setUserPhone(phone);
    }

    const handleWheel = (e: WheelEvent) => {
      if (rightContentRef.current) {
        rightContentRef.current.scrollTop += e.deltaY;
      }
    };

    document.addEventListener('wheel', handleWheel, { passive: true });
    return () => document.removeEventListener('wheel', handleWheel);
  }, []);

  const handleAgree = async () => {
    if (!agreed) return;

    setIsSubmitting(true);

    try {
      // Use email if available, otherwise use phone
      const identifier = userEmail || userPhone;
      if (!identifier) {
        setError("No user identifier found. Please sign up again.");
        setIsSubmitting(false);
        return;
      }
      
      await restaurantService.acceptAgreement(identifier);
      
      localStorage.setItem("terms_agreed", "true");
      localStorage.setItem("terms_agreed_date", new Date().toISOString());
      localStorage.removeItem("pending_agreement_email");
      localStorage.removeItem("pending_agreement_phone");

      window.location.href = "/login";
    } catch (error) {
      console.error("Error accepting agreement:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="w-full sm: lg:w-1/3 bg-linear-to-br from-green-600 to-green-900 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 min-h-50 lg:min-h-screen">
        <div className="text-center mt-15 lg:mt-0">
          <div className="mb-4 lg:mb-8">
            <OptimizedImage
              src="/imgs/Food_bundle_logo.png"
              alt="Food Bundles"
              width={120}
              height={120}
              className="mx-auto rounded-full w-16 h-16 sm:w-20 sm:h-20 lg:w-30 lg:h-30"
              transformation={[
                { width: 240, height: 240, crop: "fill", quality: "85" }
              ]}
            />
          </div>

          <div className="text-white">
            <h1 className="text-lg sm:text-xl lg:text-3xl font-bold mb-2 lg:mb-4">
              Terms & Conditions Agreement
            </h1>
            <p className="text-green-100 text-xs sm:text-sm lg:text-[14px] leading-relaxed px-2">
              Please review and accept our terms to continue
            </p>
          </div>

        </div>
      </div>

      <div className="w-full lg:w-2/3 bg-gray-50 overflow-hidden">
        <div
          ref={rightContentRef}
          className="h-[calc(100vh-200px)] lg:h-screen overflow-y-auto scrollbar-thin"
        >
          <div className="p-1 py-4">
            <div className="bg-white pt-4 sm:pt-6 lg:pt-8 px-2 rounded-lg lg:rounded-none ">
              <div className="prose prose-sm max-w-none">
                <div className="text-center mb-6 lg:mb-8 pb-4 lg:pb-6 border-b border-gray-200">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 pt-6">
                    FOOD BUNDLES Limited.
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600">
                    www.food.rw | Kigali, Rwanda KG 5Ave
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Tel: +250788963267 | Email: info@food.rw
                  </p>
                </div>

                <div className="mb-6 lg:mb-8">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 lg:mb-3">
                    Executive Introduction
                  </h3>
                  <p className="text-gray-900 text-sm sm:text-[15px] leading-relaxed mb-3 lg:mb-4">
                    This User Agreement is designed to establish a clear,
                    transparent, and fair framework for all restaurants using
                    the Food Bundles platform. Its purpose is to outline the
                    rights and responsibilities of both Food Bundles Limited and
                    our valued restaurant partners, ensuring that every
                    transaction is carried out smoothly, securely, and with
                    mutual understanding.
                  </p>
                  <p className="text-gray-900 text-[15px] leading-relaxed mb-4">
                    By defining these terms and conditions, we aim to guide and
                    protect both parties—helping users understand their rights
                    regarding ordering, payment, delivery, and data privacy,
                    while also setting out how Food Bundles will deliver
                    consistent, high-quality service. The Agreement provides
                    clarity on how to resolve issues, what to expect during
                    deliveries, and how any disputes or payment matters will be
                    managed. This approach allows us to serve you better,
                    support your business growth, and maintain a reliable and
                    trustworthy platform for all users.
                  </p>
                  <p className="text-gray-900 text-[15px]  leading-relaxed">
                    Please note that by registering for or signing up on the
                    Food Bundles platform whether online or through an
                    authorized agent you acknowledge that you have read,
                    understood, and accepted the terms of this Agreement. Your
                    continued use of the platform confirms your acceptance and
                    agreement to abide by these terms.
                  </p>
                </div>

                {/* Main Agreement Title */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Food Bundles Platform Restaurant Terms & Conditions
                    Agreement
                  </h3>
                  <p className="text-gray-900 text-[15px] leading-relaxed">
                    This Agreement (the "Agreement") applies to all restaurants
                    ("Restaurant" or "User") using the Food Bundles Ltd, TIN
                    112265383 incorporated in Rwanda. ("Food Bundles") platform,
                    whether signing up online or enrolling via authorized Food
                    Bundles agents. By registering, subscribing, or placing
                    orders, the Restaurant agrees to be bound by these terms and
                    conditions.
                  </p>
                </div>

                {/* Section 1 */}
                <div className="mb-6">
                  <h4 className="text-base font-semibold text-gray-900 mb-2">
                    1. Purpose & Scope
                  </h4>
                  <p className="text-gray-900 text-[15px] leading-relaxed">
                    This Agreement governs the Restaurant's use of the Food
                    Bundles platform for sourcing, ordering, and receiving
                    delivery of fresh food and related products, including
                    options for postpayment, instant payment, and
                    subscription-based services.
                  </p>
                </div>

                {/* Section 2 */}
                <div className="mb-6">
                  <h4 className="text-base font-semibold text-gray-900 mb-2">
                    2. Platform Access, Registration & Packages
                  </h4>
                  <ul className="list-disc pl-6 space-y-2 text-[15px] text-gray-900">
                    <li>
                      Restaurants may register for a Food Bundles account online
                      or through authorized agents.
                    </li>
                    <li>
                      By default, all Restaurants are enrolled in the Freemium
                      Package, which allows immediate purchase and payment for
                      orders.
                    </li>
                    <li>
                      Restaurants may upgrade to paid subscription packages,
                      unlocking additional features such as order postpayment
                      options, extended delivery benefits, and other exclusive
                      services.
                    </li>
                    <li>
                      Subscription packages, fees, and features are set
                      independently by Food Bundles and may be updated at its
                      sole discretion. Subscription fees are non-negotiable.
                    </li>
                  </ul>
                </div>

                {/* Section 3 */}
                <div className="mb-6">
                  <h4 className="text-base font-semibold text-gray-900 mb-2">
                    3. Order Placement, Payment, Receipt, Delivery, Return &
                    Acceptance
                  </h4>
                  <ul className="list-disc pl-6 space-y-2 text-[15px] text-gray-900">
                    <li>
                      Restaurants may place orders for fresh food and inventory
                      using the Food Bundles platform.
                    </li>
                    <li>
                      Payment can be made via available payment methods (e.g.,
                      mobile money, card, bank transfer, or other methods
                      supported by Food Bundles).
                    </li>
                    <li>
                      For Freemium Package users, payment must be made in full
                      at the time of order placement.
                    </li>
                    <li>
                      For paid subscription users with postpayment eligibility,
                      payment terms are as set out in Section 4.
                    </li>
                    <li>
                      Food Bundles delivers orders to the Restaurant or
                      designated address. Delivery is free for orders above
                      100,000 RWF or for Restaurants under a paid subscription
                      package; otherwise, standard delivery charges may apply.
                    </li>
                  </ul>
                  <p className="text-gray-900 text-[15px] leading-relaxed mt-3">
                    Upon delivery, the Restaurant (or its authorized
                    representative) shall inspect the goods and confirm receipt
                    by signing a delivery note or confirming electronically via
                    the platform. Any defects, discrepancies, or issues must be
                    reported and resolved at the time of delivery. Once the
                    delivery note is signed or electronic confirmation is given,
                    the order is deemed accepted and no claims for defects or
                    discrepancies will be accepted thereafter. In cases where
                    products do not match promised quality or specification and
                    are identified at delivery, affected products will be
                    replaced, returned, or the value deducted from the next
                    order, as determined by Food Bundles.
                  </p>
                </div>

                {/* Section 4 */}
                <div className="mb-6">
                  <h4 className="text-base font-semibold text-gray-900 mb-2">
                    4. Order Postpayment Option (Paid Subscription Only)
                  </h4>
                  <ul className="list-disc pl-6 space-y-2 text-[15px] text-gray-900">
                    <li>
                      Only available to Restaurants with an active subscription
                      package that includes postpayment.
                    </li>
                    <li>
                      Postpayment periods range from 7 to 30 days, as determined
                      by Food Bundles for each approved order.
                    </li>
                    <li>
                      No interest is charged for postpayment; eligibility is
                      based on subscription status.
                    </li>
                    <li>
                      Restaurants must request postpayment on each order;
                      approval is at Food Bundles' sole discretion, based on
                      order amount, frequency, and other criteria.
                    </li>
                    <li>
                      Having a subscription with postpayment eligibility does
                      not guarantee approval of every postpayment request.
                    </li>
                  </ul>
                </div>

                {/* Section 5 */}
                <div className="mb-6">
                  <h4 className="text-base font-semibold text-gray-900 mb-2">
                    5. Payment & Settlement
                  </h4>
                  <ul className="list-disc pl-6 space-y-2 text-[15px] text-gray-900">
                    <li>
                      For postpayment orders, restaurants must settle the full
                      invoiced amount within the period specified by Food
                      Bundles (7 to 30 days from delivery/invoice date).
                    </li>
                    <li>
                      Failure to pay within the agreed period may result in
                      suspension of postpayment privileges, additional failure
                      to pay may be reported to the Credit Reference Bureau
                      (CRB) or other relevant credit reporting agencies as
                      required by law or at Food Bundles' discretion and may
                      result in termination of platform access.
                    </li>
                    <li>
                      All payments must be made using approved payment methods.
                    </li>
                  </ul>
                </div>

                {/* Section 6 */}
                <div className="mb-6">
                  <h4 className="text-base font-semibold text-gray-900 mb-2">
                    6. Anti-Fraud & Anti-Money Laundering
                  </h4>
                  <ul className="list-disc pl-6 space-y-2 text-[15px] text-gray-900">
                    <li>
                      Restaurants agree not to use the Food Bundles platform for
                      any unlawful, fraudulent, or money laundering activities.
                    </li>
                    <li>
                      Food Bundles reserves the right to monitor transactions,
                      suspend accounts, and report suspicious activity to
                      relevant authorities.
                    </li>
                    <li>
                      Restaurants must provide accurate information and
                      cooperate with any verification or compliance checks as
                      required by Food Bundles or applicable law.
                    </li>
                  </ul>
                </div>

                {/* Section 7 */}
                <div className="mb-6">
                  <h4 className="text-base font-semibold text-gray-900 mb-2">
                    7. Privacy & Data Protection
                  </h4>
                  <ul className="list-disc pl-6 space-y-2 text-[15px] text-gray-900">
                    <li>
                      Food Bundles collects and processes Restaurant data solely
                      for account management, order fulfillment, compliance, and
                      customer support, and implements reasonable security
                      measures to protect such data.
                    </li>
                    <li>
                      Restaurant data is used for account management, order
                      fulfillment, customer support, compliance, and platform
                      improvement.
                    </li>
                    <li>
                      Food Bundles implements reasonable security measures to
                      protect Restaurant data from unauthorized access or
                      misuse.
                    </li>
                    <li>
                      Restaurants have the right to access, correct, or request
                      deletion of their data, subject to legal and operational
                      requirements.
                    </li>
                  </ul>
                </div>

                {/* Section 8 */}
                <div className="mb-6">
                  <h4 className="text-base font-semibold text-gray-900 mb-2">
                    8. Platform Use, Amendments & Termination
                  </h4>
                  <ul className="list-disc pl-6 space-y-2 text-[15px] text-gray-900">
                    <li>
                      This Agreement is effective upon Restaurant's registration
                      or first order and continues until terminated by either
                      Party with notice, subject to settlement of outstanding
                      obligations.
                    </li>
                    <li>
                      Food Bundles may amend these terms, subscription packages,
                      or platform features at any time, with notice to Users via
                      the platform or registered contact details.
                    </li>
                    <li>
                      Food Bundles may suspend or terminate access for violation
                      of these terms or for compliance reasons.
                    </li>
                  </ul>
                </div>

                {/* Section 9 */}
                <div className="mb-6">
                  <h4 className="text-base font-semibold text-gray-900 mb-2">
                    9. Miscellaneous
                  </h4>
                  <ul className="list-disc pl-6 space-y-2 text-[15px] text-gray-900">
                    <li>
                      This Agreement constitutes the entire understanding
                      between the Parties for platform use, order fulfillment,
                      payment, and delivery.
                    </li>
                    <li>
                      Any amendments must be in writing and acknowledged by both
                      Parties, except for platform-wide updates communicated by
                      Food Bundles.
                    </li>
                    <li>
                      This Agreement is governed by the laws of the Republic of
                      Rwanda.
                    </li>
                  </ul>
                </div>

                {/* Witness Section */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-gray-900 leading-relaxed mb-6">
                    In Witnerms & Conditions Agreementess Whereof, by registering or signing below, the
                    Restaurant acknowledges acceptance of these terms and
                    conditions.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
                    <div>
                      <p className="font-semibold text-gray-900">
                        Food Bundles Ltd.
                      </p>
                      <p>Authorized Representative</p>
                      <p>Date: {new Date().toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        Restaurant: {userEmail || userPhone || "Your Account"}
                      </p>
                      <p>Authorized Representative</p>
                      <p>Date: {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Agreement Section */}
                <div className="mt-8 lg:mt-12 pt-6 lg:pt-8 border-t border-gray-200">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-md text-xs sm:text-sm mb-3 sm:mb-4">
                      {error}
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <input
                        type="checkbox"
                        id="agree-terms"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="mt-1 h-3 w-3 sm:h-4 sm:w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded shrink-0"
                      />
                      <label
                        htmlFor="agree-terms"
                        className="text-xs sm:text-sm text-gray-900 leading-relaxed"
                      >
                        I have read, understood, and agree to the Terms &
                        Conditions Agreement. By checking this box, I
                        acknowledge that I am authorized to bind my restaurant
                        to these terms and conditions.
                      </label>
                    </div>

                    <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                      <Link
                        href="/signup"
                        className="flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 font-medium text-gray-900 hover:bg-gray-50 transition-colors text-sm sm:text-base order-2 sm:order-1"
                      >
                        <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Back
                      </Link>
                      <button
                        onClick={handleAgree}
                        disabled={!agreed || isSubmitting}
                        className={`flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-colors text-sm sm:text-base order-1 sm:order-2 ${
                          agreed && !isSubmitting
                            ? "text-white bg-blue-600 hover:bg-blue-700"
                            : "text-gray-500 bg-gray-200 cursor-not-allowed"
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            Processing...
                          </>
                        ) : (
                          <>
                            I Agree
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}